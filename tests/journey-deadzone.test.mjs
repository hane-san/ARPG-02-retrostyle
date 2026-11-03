import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeadzonePilgrimageFollower,deadzoneThreshold} from '../journey-deadzone-camera.js';
import {createPilgrimageFollower} from '../journey-camera.js';
import {heroVisible} from '../camera-limits.js';

const tile=32;
const world={width:480*tile,height:288*tile,tile};
const at=(x,y)=>({x,y});
const centre=h=>({x:(h.x+.5)*tile,y:(h.y+.5)*tile});
function simulate({dx=1,dy=0,zoom=.8,width=390,height=740,speed=5.7,hz=60,tiles=20,pan=0,follow=createDeadzonePilgrimageFollower()}={}){
 const view={width,height,zoom},hero=at(100,90),start=centre(hero);
 let camera={x:start.x+(dx||dy)*pan*(dx?1:0),y:start.y+(dx||dy)*pan*(dy?1:0)};
 const original={...camera},samples=new Map();
 let maxStep=0,visible=true,delta=0;
 const dt=1/hz;
 for(let i=0;i<Math.ceil(tiles/speed*hz);i++){
  const before={...camera};
  hero.x+=dx*speed*dt;hero.y+=dy*speed*dt;
  camera=follow.update(camera,hero,[at(hero.x+dx,hero.y+dy)],dt,view,world);
  maxStep=Math.max(maxStep,Math.hypot(camera.x-before.x,camera.y-before.y)*zoom);
  visible&&=heroVisible(camera,hero,view,world);
  delta+=speed*dt;
  for(const marker of [1,2,3,4,6,10,16,20])if(delta>=marker&&!samples.has(marker)){
   const sx=width/2+((hero.x+.5)*tile-camera.x)*zoom;
   const sy=height/2+((hero.y+.5)*tile-camera.y)*zoom;
   samples.set(marker,{x:camera.x,y:camera.y,heroX:sx/width,heroY:sy/height});
  }
 }
 return {camera,original,hero,view,maxStep,visible,samples};
}

test('deadzone size is world-scale responsive on portrait, landscape, and panorama',()=>{
 for(const v of [
  {width:320,height:568,zoom:.8},{width:390,height:740,zoom:.8},
  {width:844,height:390,zoom:.8},{width:390,height:740,zoom:.46},
  {width:390,height:740,zoom:.38}
 ]){
  for(const axis of ['x','y']){
   const fraction=deadzoneThreshold(v,axis);
   assert.ok(fraction>0&&fraction<.21,'bounded slack');
   const span=axis==='x'?v.width:v.height;
   assert.ok(fraction*span/v.zoom<2.46*tile,'slack is at most roughly 2.45 cells');
  }
 }
});

test('small moves retain an exactly static field; long walks open a calm forward view',()=>{
 for(const [width,height] of [[320,568],[390,740],[844,390]]){
  for(const [dx,dy] of [[1,0],[-1,0],[0,-1],[0,1]]){
   const result=simulate({width,height,dx,dy});
   const early=result.samples.get(2);
   assert.deepEqual({x:early.x,y:early.y},result.original,
    'within two tiles the camera stays still: '+JSON.stringify({width,height,dx,dy}));
   assert.ok(result.visible,'explorer stays visible');
   assert.ok(result.maxStep<9,'no sudden frame-sized lurch');
   const end=result.samples.get(16),frame=dx?end.heroX:end.heroY;
   assert.ok(Number.isFinite(frame)&&frame>.1&&frame<.9);
   if(dx>0)assert.ok(frame<.47,'rightward walk opens the road to the right');
   if(dx<0)assert.ok(frame>.53,'leftward walk opens the road to the left');
   if(dy>0)assert.ok(frame<.49,'southward travel sees more road below');
   if(dy<0)assert.ok(frame>.51,'northward travel sees more road above');
  }
 }
});

test('follower holds panned scenery until the traveller really catches up',()=>{
 const v={width:390,height:740,zoom:.8},h=at(100,90),start=centre(h);
 const follower=createDeadzonePilgrimageFollower();
 let cam={x:start.x+190,y:start.y};
 for(let i=0;i<25;i++){
  h.x+=5.7/60;
  const next=follower.update(cam,h,[at(h.x+1,h.y)],1/60,v,world);
  assert.deepEqual(next,cam,'a forward manual pan must not recoil');
  cam=next;
 }
 for(let i=0;i<240;i++){
  h.x+=5.7/60;
  const before=cam;
  cam=follower.update(cam,h,[at(h.x+1,h.y)],1/60,v,world);
  assert.ok(cam.x>=before.x-1e-8,'never pull a forward-panned view back');
  assert.ok(heroVisible(cam,h,v,world));
 }
 assert.ok(cam.x>start.x+190,'after catch-up, the camera eventually follows');
});

test('frame rate and walking pace do not change the eventual frame much',()=>{
 for(const zoom of [.8,.46,.38]){
  const a=simulate({zoom,hz:30,tiles:24,speed:5.7});
  const b=simulate({zoom,hz:120,tiles:24,speed:5.7});
  const atlas=simulate({zoom,hz:60,tiles:24,speed:7.35});
  const normal=simulate({zoom,hz:60,tiles:24,speed:5.7});
  assert.ok(Math.abs(a.camera.x-b.camera.x)*zoom<18,'30/120Hz near same frame');
  assert.ok(Math.abs(normal.camera.x-atlas.camera.x)*zoom<18,'atlas and field near same frame');
  for(const r of [a,b,atlas,normal])assert.ok(r.visible);
 }
});

test('turns, stopping, manual reset and world-edge clipping remain controlled',()=>{
 const v={width:390,height:740,zoom:.8},h=at(100,90),follow=createDeadzonePilgrimageFollower();
 let camera=centre(h);
 for(const [dx,dy,count] of [[1,0,150],[0,-1,150],[-1,0,150],[0,1,150]]){
  for(let i=0;i<count;i++){
   const before=camera;
   h.x+=dx*5.7/60;h.y+=dy*5.7/60;
   camera=follow.update(camera,h,[at(h.x+dx,h.y+dy)],1/60,v,world);
   assert.ok(Math.hypot(camera.x-before.x,camera.y-before.y)*v.zoom<9,'no sudden corner cut');
   assert.ok(heroVisible(camera,h,v,world));
  }
 }
 const rest={...camera};
 assert.deepEqual(follow.update(rest,h,[],1/60,v,world),rest,'stopping does not recenter');
 follow.reset();
 assert.deepEqual(follow.update(rest,h,[],1/60,v,world),rest,'reset alone does not alter the image');
 // Edge condition is handled by the shared camera limits, not a second clamp.
 const edgeHero=at(1,1),edge=centre(edgeHero),guard=createDeadzonePilgrimageFollower();
 for(let i=0;i<100;i++){
  edgeHero.x+=5.7/60;
  const framed=guard.update(edge,edgeHero,[at(edgeHero.x+1,edgeHero.y)],1/60,v,world);
  assert.ok(heroVisible(framed,edgeHero,v,world));
  assert.ok(framed.x>=v.width/(2*v.zoom)-.01,'do not show beyond the western border');
 }
});
