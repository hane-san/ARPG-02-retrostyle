import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNEY_ZOOM_STAGES,JOURNEY_CAMERA_PROFILES,createJourneyCamera,journeyCameraScene,easeJourneyCamera} from '../journey-camera.js';
import {heroVisible} from '../camera-limits.js';
import {makeJourneyWorld} from '../journey-world.js';

test('five framing stages run from close to wide, with the former widest view at 4',()=>{
 assert.deepEqual(JOURNEY_ZOOM_STAGES,[1.8,1.35,1,.8,.6]);
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-road'],JOURNEY_ZOOM_STAGES[3]);
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-port'],JOURNEY_ZOOM_STAGES[2]);
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-interior'],JOURNEY_ZOOM_STAGES[1]);
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-steppe'],JOURNEY_ZOOM_STAGES[4]);
 assert.equal(typeof createJourneyCamera().manual,'undefined');
});
test('boundary jitter cannot change framing, and accepted scenes hold for five seconds',()=>{
 const camera=createJourneyCamera();
 camera.update('journey-steppe',5000);camera.update('journey-port',5900);
 assert.equal(camera.target,1);
 camera.update('journey-steppe',6000);assert.equal(camera.update('journey-steppe',7200),.6);
 camera.update('journey-pass',7300);assert.equal(camera.update('journey-pass',10000),.6);
 assert.equal(camera.update('journey-pass',12200),.8);
 assert.equal(camera.update('unknown',15000),.8);
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
