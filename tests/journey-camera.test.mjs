import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNEY_ZOOM_STAGES,JOURNEY_CAMERA_PROFILES,createJourneyCamera,journeyCameraScene,easeJourneyCamera} from '../journey-camera.js';
import {heroVisible} from '../camera-limits.js';
import {makeJourneyWorld,routeJourneyWalk} from '../journey-world.js';

// Replay a real walk at the game's 6.15 tiles/s and 60 fps, recording every accepted target.
function replayTargets(world,target){
 const hero={x:world.start.x,y:world.start.y,px:world.start.x,py:world.start.y,path:[]};
 hero.path=routeJourneyWalk(world,hero,target);
 const camera=createJourneyCamera(),targets=[camera.target];
 // Keep standing for longer than the dwell plus the five-second hold after arrival.
 let stoppedAt=Infinity;
 for(let time=10000;time<stoppedAt+7000;time+=1000/60){
  if(!hero.path.length&&stoppedAt===Infinity)stoppedAt=time;
  let remaining=6.15/60;
  while(remaining>0&&hero.path.length){
   const step=hero.path[0],dx=step.x-hero.px,dy=step.y-hero.py,distance=Math.hypot(dx,dy);
   if(distance<=remaining+1e-4){Object.assign(hero,{px:step.x,py:step.y,x:step.x,y:step.y});hero.path.shift();remaining-=distance;}
   else{hero.px+=dx/distance*remaining;hero.py+=dy/distance*remaining;remaining=0;}
  }
  const next=camera.update(journeyCameraScene(world,hero),time);
  if(next!==targets.at(-1))targets.push(next);
  if(time>10000+60000)break;
 }
 return targets;
}

test('long walks use one outdoor zoom, with only interior and exceptional vista overrides',()=>{
 assert.deepEqual(JOURNEY_ZOOM_STAGES,[1.35,.8,.6,.46,.38]);
 assert.equal(createJourneyCamera().target,.8,'the first rendered frame starts outdoors');
 for(const [name,zoom] of Object.entries(JOURNEY_CAMERA_PROFILES)){
  assert.equal(zoom,name==='journey-interior'?1.35:name==='journey-scenic-wide'?.6:name==='journey-reveal'?.46:name==='journey-monument'?.38:.8,name);
 }
 assert.equal(typeof createJourneyCamera().manual,'undefined');
});
test('ordinary region boundaries do not change zoom; special vantage has dwell and exit hold',()=>{
 const camera=createJourneyCamera();
 for(const [scene,now] of [['journey-port',1000],['journey-tea',1500],['journey-steppe',2000],['journey-void',2500],['journey-detail',3000]]){
  assert.equal(camera.update(scene,now),.8,scene+' cannot magnify an outdoor walk');
 }
 assert.equal(camera.update('journey-scenic-wide',4000),.8);
 assert.equal(camera.update('journey-scenic-wide',4700),.8,'brief outlook cannot flicker');
 assert.equal(camera.update('journey-scenic-wide',4800),.6);
 assert.equal(camera.update('journey-road',4900),.6);
 assert.equal(camera.update('journey-road',6500),.6,'outlook lingers briefly on exit');
 assert.equal(camera.update('journey-road',7300),.8,'ordinary road restores the default view');
 assert.equal(camera.update('unknown',7500),.8);
});
test('village framing stays local while approach roads and vast centres differ',()=>{
 const world=makeJourneyWorld();
 for(const [x,y,scene] of [[46,69,'journey-tea'],[36,60,'journey-road'],[14,38,'journey-road'],[36,38,'journey-steppe']])
  assert.equal(journeyCameraScene(world,{px:x,py:y}),scene);
});
test('a small lakeside house is framed locally without zooming the whole lake like a village',()=>{
 const world=makeJourneyWorld();
 assert.equal(journeyCameraScene(world,{px:98,py:72}),'journey-hut');
 assert.notEqual(journeyCameraScene(world,{px:106,py:52}),'journey-hut');
});
test('walking from the quay to meadow and tea house stays at one outdoor scale',()=>{
 const world=makeJourneyWorld();
 assert.equal(journeyCameraScene(world,{px:32,py:64}),'journey-road');
 assert.equal(world.zoneAt(32,64).id,'journey-tea','geographic names and music remain untouched');
 assert.equal(journeyCameraScene(world,{px:46,py:69}),'journey-tea');
 assert.deepEqual(replayTargets(world,{x:36,y:38}),[.8]);
 assert.deepEqual(replayTargets(world,{x:33,y:60}),[.8]);
 assert.deepEqual(replayTargets(world,{x:46,y:69}),[.8]);
});
test('framing transitions keep the traveller anchored, frame independent and in bounds',()=>{
 const world={width:112*32,height:88*32,tile:32},viewport={width:390,height:740},hero={x:36,y:38};
 const initial={x:(hero.x+.5)*32-60,y:(hero.y+.5)*32+40,zoom:1.5};
 const projection=c=>({x:((hero.x+.5)*32-c.x)*c.zoom,y:((hero.y+.5)*32-c.y)*c.zoom});
 const before=projection(initial),results=[];
 for(const hz of [30,60,120]){
  let camera={...initial};
  for(let frame=0;frame<hz*2;frame++)camera=easeJourneyCamera(camera,hero,.8,1/hz,viewport,world);
  const after=projection(camera);
  assert.ok(Math.abs(after.x-before.x)<1e-7&&Math.abs(after.y-before.y)<1e-7);
  assert.ok(heroVisible(camera,hero,{...viewport,zoom:camera.zoom},world));results.push(camera.zoom);
 }
 assert.ok(Math.max(...results)-Math.min(...results)<1e-9);
 for(const position of [{x:0,y:0},{x:111,y:87}]){
  const camera=easeJourneyCamera({x:0,y:0,zoom:1.5},position,.8,.07,viewport,world);
  assert.ok(heroVisible(camera,position,{...viewport,zoom:camera.zoom},world));
 }
});

test('town, village, grassland, glass city and outdoor ruin share the same view',()=>{
 const world=makeJourneyWorld();
 for(const [x,y] of [[19,70],[46,69],[98,72],[32,64],[36,38],[159,69],[55,19]]){
  const scene=journeyCameraScene(world,{px:x,py:y});
  assert.equal(JOURNEY_CAMERA_PROFILES[scene],.8,`outdoor tile ${x},${y}: ${scene}`);
 }
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-void'],.8);
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-detail'],.8);
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-scenic-wide'],.6);
});
test('ordinary scenic approaches stay fixed; actual interior is the only close-up',()=>{
 const c=createJourneyCamera();
 assert.equal(c.update('journey-scenic-near',1000),.8);
 assert.equal(c.update('journey-scenic-near',2500),.8);
 assert.equal(c.update('journey-scenic-detail',3000),.8);
 assert.equal(c.update('journey-detail',3500),.8,'outdoor monolith/arcade is not an interior');
 assert.equal(c.update('journey-interior',5000),.8);
 assert.equal(c.update('journey-interior',5800),1.35,'only explicitly tagged interiors may zoom in');
 assert.equal(c.update('journey-road',6000),1.35);
 assert.equal(c.update('journey-road',8300),.8,'leaving an interior restores the journey view');
});
test('regional pilgrimage zoom ignores border chatter and holds an accepted scale for five seconds',()=>{
 const c=createJourneyCamera({regional:true});
 c.update('journey-reveal',6000);assert.equal(c.update('journey-reveal',7599),.8);
 assert.equal(c.update('journey-reveal',7600),.46);
 for(let i=0;i<20;i++)assert.equal(c.update(i%2?'journey-road':'journey-reveal',7800+i*150),.46);
 c.update('journey-reveal',10800);c.update('journey-road',11000);assert.equal(c.update('journey-road',13399),.46);
 assert.equal(c.update('journey-road',13400),.8);
 c.update('journey-monument',14000);assert.equal(c.update('journey-monument',17000),.8,'minimum hold');
 assert.equal(c.update('journey-monument',18400),.38);
});
