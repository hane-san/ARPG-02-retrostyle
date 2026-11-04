import assert from 'node:assert/strict';import {mkdirSync,writeFileSync} from 'node:fs';
import {makePilgrimageWorld,pilgrimCameraScene} from '../pilgrimage-world.js';
import {TRIAL_WAYSTONE,trialDestinations} from '../trial-travel.js';
import {JOURNEY_CAMERA_PROFILES} from '../journey-camera.js';
import {buildTrack} from '../music.js';

export async function checkSkyTrial(browser,origin){
 const world=makePilgrimageWorld(),pool=trialDestinations(world),reports=[];mkdirSync('test-results/sky-trial',{recursive:true});
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  const reduced=width===320,context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(({w,h})=>{
   const proto=CanvasRenderingContext2D.prototype,scale=proto.scale,translate=proto.translate,arc=proto.arc;let next=false;
   proto.scale=function(x,y){if(this.canvas.id==='worldCanvas'){window.trialZoom=x;next=true;}return scale.call(this,x,y);};
   proto.translate=function(x,y){if(next&&this.canvas.id==='worldCanvas'){window.trialEye={x:-x,y:-y};next=false;}return translate.call(this,x,y);};
   proto.arc=function(x,y,r,...a){if(this.canvas.id==='miniMap'&&this.fillStyle==='#fae5a1')window.trialPosition={x:Math.round(x/this.canvas.width*w-.5),y:Math.round(y/this.canvas.height*h-.5)};return arc.call(this,x,y,r,...a);};
   const Native=window.AudioContext||window.webkitAudioContext;if(Native){const create=Native.prototype.createBufferSource;Native.prototype.createBufferSource=function(){const s=create.call(this),start=s.start.bind(s);s.start=(...args)=>{if(s.loop){window.trialLoopSeconds=s.buffer?.duration;window.trialMusicStarts=(window.trialMusicStarts||0)+1;}return start(...args);};return s;};}
  },{w:world.w,h:world.h});
  await p.goto(origin+'/');await p.waitForFunction(()=>window.trialEye);await p.clock.install();
  await p.locator('#soundBtn').click();assert.equal(await p.locator('#musicToggle').textContent(),'OFF');assert.equal(await p.locator('#sfxToggle').textContent(),'ON');assert.equal(await p.locator('#trackSelect option').count(),110);
  const volume=await p.locator('#volumeRange').inputValue();if(width===390)await p.locator('#musicToggle').click();await p.locator('#musicPanel [data-close]').click();
  const point=await p.evaluate(()=>{const r=document.querySelector('#worldCanvas').getBoundingClientRect();return {x:r.width/2+(26.5*32-window.trialEye.x)*window.trialZoom,y:r.height/2+(105.5*32-window.trialEye.y)*window.trialZoom};});
  await p.locator('#worldCanvas').tap({position:point});await p.clock.runFor(3500);await p.locator('#trialJump').waitFor({state:'visible'});
  const seen=new Set();let prior='白い船着場';
  for(let i=0;i<pool.length;i++){
   await p.clock.runFor(250);await p.locator('#trialJump').click();await p.clock.runFor(2600);
   const name=await p.locator('#zoneName').textContent(),dest=pool.find(d=>d.name===name);assert.ok(dest,name);assert.notEqual(name,prior);assert.ok(!seen.has(dest.id),'no repeated destination before the bag is exhausted');seen.add(dest.id);prior=name;
   assert.equal(await p.locator('#dialogueName').textContent(),'試遊：'+name);
   const eye=await p.evaluate(()=>({x:Math.round(window.trialEye.x/32-.5),y:Math.round(window.trialEye.y/32-.5)}));assert.deepEqual(eye,{x:dest.x,y:dest.y});
   let scene=pilgrimCameraScene(world,{px:dest.x,py:dest.y});if(reduced&&['journey-reveal','journey-monument'].includes(scene))scene='journey-scenic-wide';assert.ok(Math.abs(await p.evaluate(()=>window.trialZoom)-JOURNEY_CAMERA_PROFILES[scene])<.001,'the arrival owns its regional zoom immediately');
   const cue=world.zoneAt(dest.x,dest.y).music[0];assert.equal(await p.locator('#trackSelect').inputValue(),cue);assert.equal(await p.locator('#musicToggle').textContent(),width===390?'ON':'OFF');assert.equal(await p.locator('#volumeRange').inputValue(),volume);
   let native=null;if(width===390){const [id,phase]=cue.split(':').map(Number),seconds=buildTrack(id,phase).seconds;let ready=false;for(let n=0;n<350;n++){await p.clock.runFor(200);await new Promise(r=>setTimeout(r,10));if(await p.evaluate(s=>Math.abs((window.trialLoopSeconds||0)-s)<.001,seconds)){ready=true;break;}}assert.ok(ready,'actual regional audio after trial warp '+cue);native=await p.evaluate(()=>window.trialLoopSeconds);}
   for(const button of ['#trialJump','#trialReturn']){const r=await p.locator(button).boundingBox();assert.ok(r.width>=44&&r.height>=44&&r.x>=0&&r.y>=0&&r.y+r.height<=height,'trial actions remain visible and touchable');}
   await p.locator('#dialogueClose').click();await p.screenshot({path:`test-results/sky-trial/${width}x${height}-${dest.id}.png`});
   // Resume real movement on a legal adjacent tile, then read the real map dot.
   const move=[[1,0,'ArrowRight'],[-1,0,'ArrowLeft'],[0,1,'ArrowDown'],[0,-1,'ArrowUp']].find(([dx,dy])=>world.walkable(dest.x+dx,dest.y+dy));assert.ok(move);await p.keyboard.press(move[2]);await p.clock.runFor(1500);
   await p.locator('#mapBtn').click();assert.deepEqual(await p.evaluate(()=>window.trialPosition),{x:dest.x+move[0],y:dest.y+move[1]});await p.locator('#mapPanel [data-close]').click();
   await p.locator('#helpBtn').click();await p.locator('#trialHelpReturn').scrollIntoViewIfNeeded();await p.locator('#trialHelpReturn').click();await p.clock.runFor(1500);
   assert.equal(await p.locator('#zoneName').textContent(),'白い船着場');assert.equal(await p.locator('#trackSelect').inputValue(),world.zones[0].music[0]);assert.equal(await p.locator('#trialReturn').isVisible(),false);
   reports.push({viewport:`${width}x${height}`,destination:dest.id,name,cue,nativeLoopSeconds:native,resumedWalk:true,returned:true,reducedMotion:reduced});assert.deepEqual(errors,[]);
   console.log(`Trial ${width}x${height}: ${name} → ${cue}; walked and returned`);
  }
  assert.equal(seen.size,pool.length);if(width!==390)assert.equal(await p.evaluate(()=>window.trialMusicStarts||0),0,'warping never enables disabled BGM');
  await context.close();
 }
 // The sky itself has the same pixels at the same world coordinates on rotation.
 const p=await browser.newPage();await p.goto(origin+'/');const sky=await p.evaluate(async()=>{
  const {WEST_STUDIES}=await import('./western-world.js'),{drawLandscapeSky,skyWorldWindow}=await import('./landscape-sky.js'),z=WEST_STUDIES[0],b=skyWorldWindow(z),camera={x:(z.cx+.5)*32,y:b.y+b.h-270,zoom:.6};
  function sample(width,height,phase){const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');g.translate(width/2,height/2);g.scale(camera.zoom,camera.zoom);g.translate(-camera.x,-camera.y);drawLandscapeSky(g,z,camera,{w:width,h:height},phase,0);return [...g.getImageData(width/2-48,height/2-48,96,96).data];}
  const a=sample(600,400,0),rotated=sample(800,600,0),dusk=sample(600,400,1);let difference=0,rotationMax=0,rotationSum=0;for(let i=0;i<a.length;i++){const delta=Math.abs(a[i]-rotated[i]);rotationMax=Math.max(rotationMax,delta);rotationSum+=delta;if(i%4!==3)difference+=Math.abs(a[i]-dusk[i]);}return {rotationMax,rotationMean:rotationSum/a.length,dayDuskDifference:difference/(96*96*3)};
 });// Native Canvas can round an antialiased edge by one of 255 levels on an integer translation.
 assert.ok(sky.rotationMax<=1&&sky.rotationMean<.01,'world sky never stretches with the viewport');assert.ok(sky.dayDuskDifference>15,'day and dusk are distinct painted light');await p.close();
 for(const query of ['?mode=classic','?prototype=1','?atlas=previous','?maze=turns']){const p=await browser.newPage();await p.goto(origin+'/'+query);assert.equal(await p.locator('#trialJump').count(),0);assert.equal(await p.locator('#trialHelpReturn').count(),0);await p.close();}
 writeFileSync('test-results/sky-trial/routes.json',JSON.stringify({reports,sky},null,2));console.log('Sky/trial: all destinations and returns at three sizes, native music, OFF settings, resumed walking, reduced motion and world-anchored skies passed.');
}
