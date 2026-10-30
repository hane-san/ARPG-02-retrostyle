import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {limitCamera,easeEdgeCamera,smoothPanCamera,PAN_SENSITIVITY,JOURNEY_PAN_SENSITIVITY} from '../camera-limits.js';

// Exercise the actual field listeners with DOM event/capture stubs, not a
// second implementation or a production debug hook. Browser QA also uses CDP.
function input({journey=false}={}){
 const source=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 const block=source.slice(source.indexOf('const pointerMap=new Map()'),source.indexOf("window.addEventListener('keydown'"));
 const listeners={},events={},documentEvents={},taps=[],zoom=[];
 const canvas={addEventListener:(id,fn)=>listeners[id]=fn,setPointerCapture(){},hasPointerCapture(){return false;},releasePointerCapture(){}};
 const context=vm.createContext({canvas,camera:{x:100,y:100,zoom:1.25},hero:{px:3,py:3},screen:{w:390,h:640},W:164,H:120,TILE:32,PAN_SENSITIVITY,JOURNEY_PAN_SENSITIVITY,panTarget:null,
  limitCamera:p=>p,zoomTo:z=>zoom.push(z),handleTap:e=>taps.push(e),readingPress:null,dialogue:null,JOURNEY_MODE:journey,PILGRIMAGE_MODE:journey,pilgrimageFollow:{reset(){}},
  window:{addEventListener:(id,fn)=>events[id]=fn},document:{hidden:false,addEventListener:(id,fn)=>documentEvents[id]=fn}});
 vm.runInContext(block,context);
 const send=(type,id,x=100,y=100)=>listeners[type]({pointerId:id,button:0,clientX:x,clientY:y,preventDefault(){}});
 return {send,taps,zoom,context,events,documentEvents};
}
test('stopped journey dragging pans farther and converges faster without a position snap',()=>{
 assert.equal(PAN_SENSITIVITY,.72);
 assert.equal(JOURNEY_PAN_SENSITIVITY,.95);
 const classic=input(),journey=input({journey:true});
 for(const trial of [classic,journey]){
  trial.send('pointerdown',1,100,100);
  trial.send('pointermove',1,150,100);
 }
 const oldDistance=Math.abs(classic.context.panTarget.x-100);
 const newDistance=Math.abs(journey.context.panTarget.x-100);
 assert.ok(newDistance>oldDistance*1.25,'same finger drag moves journey farther');
 assert.ok(newDistance<50,'not a teleport to the dragged coordinate');
 const hero={x:80,y:60},w={width:176*32,height:136*32,tile:32};
 const view={width:390,height:740,zoom:1};
 const c={x:(hero.x+.5)*32,y:(hero.y+.5)*32};
 const destination={x:c.x+100,y:c.y};
 const gentle=smoothPanCamera(c,destination,hero,view,w,1/60,9.5);
 const brisk=smoothPanCamera(c,destination,hero,view,w,1/60,11.5);
 assert.ok(brisk.x>gentle.x&&brisk.x<destination.x,'fast response remains smooth and bounded');
});

test('walking accepts a new tap destination but ignores manual camera dragging',()=>{
 const t=input();
 t.context.hero.path=[{x:4,y:3},{x:5,y:3}];
 t.send('pointerdown',11,100,100);
 t.send('pointermove',11,150,100);
 assert.equal(t.context.panTarget,null,'moving drag must not own the camera');
 t.send('pointerup',11,150,100);
 assert.equal(t.taps.length,0,'drag release is not an accidental destination tap');
 t.send('pointerdown',12,110,110);
 t.send('pointerup',12,110,110);
 assert.equal(t.taps.length,1,'simple taps continue to reroute');
 t.context.hero.path=[];
 t.send('pointerdown',13,100,100);
 t.send('pointermove',13,160,100);
 assert.ok(t.context.panTarget,'after stopping a drag again pans manually');
 t.send('pointerup',13,160,100);
});

test('pinch lift/capture loss then a new second finger never dereferences a missing gesture',()=>{
 const t=input();t.send('pointerdown',1);t.send('pointerdown',2,150);
 t.send('pointermove',2,160);t.send('pointerup',1);t.send('lostpointercapture',1);
 t.send('pointerdown',3,190);
 assert.doesNotThrow(()=>t.send('pointermove',3,200));
 t.send('pointerup',2);t.send('pointerup',3);assert.equal(t.taps.length,0);
 assert.equal(t.context.camera.zoom,1.25);assert.equal(t.zoom.length,0);
});

function animation({pending=null,idleEdge=false}={}){
 const source=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 const block=source.slice(source.indexOf('let lastPaint=-Infinity'),source.indexOf('let lastTravelBusy'));
 const hero={x:20,y:20,px:20,py:20,moving:false},screen={w:390,h:640};
 const camera={x:656,y:656,zoom:1.25},world={width:164*32,height:120*32,tile:32};
 if(idleEdge)Object.assign(camera,limitCamera({x:1e6,y:656},hero,{...screen,width:screen.w,height:screen.h,zoom:1.25},world,.08));
 const context=vm.createContext({camera,hero,screen,W:164,H:120,TILE:32,panTarget:pending,gesture:null,last:0,PILGRIMAGE_MODE:false,
  updateMove(){},updateDialogue(){},updateJourneyMusic(){},journeyView:null,journeyCamera:null,ambience:null,dialogue:null,isPanelOpen:()=>false,
  limitCamera,easeEdgeCamera,smoothPanCamera,paint(){},requestAnimationFrame(){},
  confineCamera(x=camera.x,y=camera.y,margin=.65){Object.assign(camera,limitCamera({x,y},hero,{width:screen.w,height:screen.h,zoom:camera.zoom},world,margin));}});
 vm.runInContext(block,context);return {camera,context};
}
test('idle camera preserves the last safe edge-follow position without a stopping-frame snap',()=>{
 const t=animation({idleEdge:true}),before={...t.camera};
 vm.runInContext('animate(1000)',t.context);assert.deepEqual(t.camera,before);
});
test('a stale pan target is re-bounded and fully settles instead of requesting 60fps forever',()=>{
 const t=animation({pending:{x:1e9,y:-1e9}});
 for(let time=1000;time<5000;time+=16)vm.runInContext(`animate(${time})`,t.context);
 assert.equal(t.context.panTarget,null);
});
test('remaining pinch finger never turns into an old-origin pan or a tap',()=>{
 const t=input();t.send('pointerdown',1);t.send('pointerdown',2,150);
 t.send('pointermove',2,160);t.send('pointerup',2);t.send('pointermove',1,210);
 assert.equal(t.context.panTarget,null);t.send('pointerup',1);assert.equal(t.taps.length,0);
 t.send('pointerdown',4);t.send('pointerup',4);assert.equal(t.taps.length,1);
});
test('cancellation clears the entire multi-touch group and allows a clean next tap',()=>{
 const t=input();t.send('pointerdown',1);t.send('pointerdown',2,150);t.send('pointercancel',2);
 t.send('pointerdown',3);t.send('pointerup',1);
 assert.doesNotThrow(()=>t.send('pointermove',3,102));
 t.send('pointerup',3);assert.equal(t.taps.length,1);
 t.send('pointerup',1);assert.equal(t.taps.length,1,'late release from cancelled group is ignored');
});
test('resize, blur and backgrounding discard held input and pending camera easing',()=>{
 for(const reason of ['resize','blur','visibilitychange']){
  const t=input();t.send('pointerdown',1);t.send('pointermove',1,200);assert.ok(t.context.panTarget);
  if(reason==='visibilitychange'){vm.runInContext('document.hidden=true',t.context);t.documentEvents[reason]();}
  else t.events[reason]();
  assert.equal(t.context.panTarget,null);t.send('pointerup',1);assert.equal(t.taps.length,0);
  t.send('pointerdown',2);t.send('pointerup',2);assert.equal(t.taps.length,1);
 }
});
test('cancelled release cannot click the dock, but a fresh pointerdown can',()=>{
 const t=input();t.send('pointerdown',1);t.events.resize();
 let blocked=0;
 const click={pointerId:1,preventDefault(){blocked++;},stopImmediatePropagation(){blocked++;}};
 t.events.click(click);assert.equal(blocked,2);
 t.send('pointerdown',2);t.events.resize();
 t.documentEvents.pointerdown({pointerId:2});
 t.events.click({...click,pointerId:2});assert.equal(blocked,2,'a fresh toolbar gesture is not suppressed');
});

test('player-facing help never offers the removed manual zoom controls',()=>{
 for(const file of ['../game.js','../index.html']){
  const source=readFileSync(new URL(file,import.meta.url),'utf8');
  assert.doesNotMatch(source,/＋／−|拡大縮小|ズーム/,file+' still mentions manual zoom');
 }
});
