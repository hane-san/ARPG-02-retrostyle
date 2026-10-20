import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNEY_ZOOM_STAGES,JOURNEY_CAMERA_PROFILES,createJourneyCamera,journeyCameraScene,nearestJourneyZoom,stepJourneyZoom,easeJourneyCamera} from '../journey-camera.js';
import {heroVisible} from '../camera-limits.js';
import {makeJourneyWorld} from '../journey-world.js';

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
