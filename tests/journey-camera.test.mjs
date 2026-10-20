import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNEY_ZOOM_STAGES,JOURNEY_CAMERA_PROFILES,createJourneyCamera,journeyCameraScene,nearestJourneyZoom,stepJourneyZoom,easeJourneyCamera} from '../journey-camera.js';
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

test('landscape and settlement views use five bounded stages and finite manual steps',()=>{
 assert.equal(JOURNEY_ZOOM_STAGES.length,5);
 assert.equal(new Set(Object.values(JOURNEY_CAMERA_PROFILES)).size,5);
 assert.ok(JOURNEY_CAMERA_PROFILES['journey-steppe']<JOURNEY_CAMERA_PROFILES['journey-port']);
 assert.ok(JOURNEY_CAMERA_PROFILES['journey-lake']<JOURNEY_CAMERA_PROFILES['journey-tea']);
 for(const zoom of JOURNEY_ZOOM_STAGES){
  assert.equal(nearestJourneyZoom(zoom),zoom);
  assert.ok(JOURNEY_ZOOM_STAGES.includes(stepJourneyZoom(zoom,1)));
  assert.ok(JOURNEY_ZOOM_STAGES.includes(stepJourneyZoom(zoom,-1)));
 }
 assert.equal(stepJourneyZoom(.8,-1),.8);assert.equal(stepJourneyZoom(1.8,1),1.8);
});
test('boundary jitter cannot change framing, and accepted scenes hold for five seconds',()=>{
 const camera=createJourneyCamera();
 camera.update('journey-steppe',5000);camera.update('journey-port',5900);
 assert.equal(camera.target,1.5);
 camera.update('journey-steppe',6000);assert.equal(camera.update('journey-steppe',7200),.8);
 camera.update('journey-pass',7300);assert.equal(camera.update('journey-pass',10000),.8);
 assert.equal(camera.update('journey-pass',12200),1.25);
 assert.equal(camera.update('unknown',15000),1.25);
});
test('manual framing lasts throughout a scene, then returns to the next place staging',()=>{
 const camera=createJourneyCamera();camera.manual(1);
 assert.equal(camera.update('journey-port',8000),1);
 camera.update('journey-tea',9000);assert.equal(camera.update('journey-tea',10200),1.8);
});
test('a small lakeside house is framed locally without zooming the whole lake like a village',()=>{
 const world=makeJourneyWorld();
 assert.equal(journeyCameraScene(world,{px:98,py:72}),'journey-hut');
 assert.notEqual(journeyCameraScene(world,{px:106,py:52}),'journey-hut');
});
test('the first walk from the quay opens out over the steppe without the teahouse close-up',()=>{
 const world=makeJourneyWorld();
 // The path north from the white bridge belongs to the tea region but is open country.
 assert.equal(journeyCameraScene(world,{px:32,py:64}),'journey-steppe');
 assert.equal(world.zoneAt(32,64).id,'journey-tea','place name and music regions stay unchanged');
 assert.equal(journeyCameraScene(world,{px:46,py:69}),'journey-tea');
 assert.deepEqual(replayTargets(world,{x:36,y:38}),[1.5,.8]);
 assert.deepEqual(replayTargets(world,{x:33,y:60}),[1.5,.8]);
 assert.equal(replayTargets(world,{x:46,y:69}).at(-1),1.8,'the teahouse itself still comes close');
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
