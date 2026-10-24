import test from 'node:test';
import assert from 'node:assert/strict';
import {easeJourneyFollowCamera} from '../journey-camera.js';
import {heroVisible} from '../camera-limits.js';

const tile=32;
const world={width:176*tile,height:136*tile,tile};
const viewport={width:390,height:740,zoom:1};
const here=(x,y)=>({x,y});
const centered=hero=>({x:(hero.x+.5)*tile,y:(hero.y+.5)*tile});
function settle(hero,path,view=viewport,hz=60,seconds=1.5){
 let camera=centered(hero);
 for(let frame=0;frame<hz*seconds;frame++)
  camera=easeJourneyFollowCamera(camera,hero,path,1/hz,view,world);
 return camera;
}

test('both nearby taps and atlas-length routes place extra space ahead of travel',()=>{
 const hero=here(60,60),start=centered(hero);
 const eastShort=settle(hero,[here(61,60)]);
 const eastLong=settle(hero,Array.from({length:18},(_,i)=>here(61+i,60)));
 const west=settle(hero,[here(59,60),here(58,60)]);
 const north=settle(hero,[here(60,59),here(60,58),here(60,57)]);
 assert.ok(eastShort.x>start.x+20,'a one-step tap already starts forward framing');
 assert.ok(eastLong.x>eastShort.x,'longer routes see farther ahead');
 assert.ok(west.x<start.x-20,'reversing the route reverses the composition');
 assert.ok(north.y<start.y-20,'northward travel leaves more visible room above');
 for(const c of [eastShort,eastLong,west,north])
  assert.ok(heroVisible(c,hero,viewport,world));
});

test('route bends ease rather than snapping to a new centre',()=>{
 const hero=here(80,70),path=Array.from({length:9},(_,i)=>here(81+i,70));
 let camera=settle(hero,path),previous={...camera};
 const turn=[here(80,69),here(80,68),here(80,67),here(80,66),here(80,65)];
 camera=easeJourneyFollowCamera(camera,hero,turn,1/60,viewport,world);
 assert.ok(Math.hypot(camera.x-previous.x,camera.y-previous.y)<25,'no hard cut');
 for(let i=0;i<90;i++)camera=easeJourneyFollowCamera(camera,hero,turn,1/60,viewport,world);
 assert.ok(camera.y<centered(hero).y-20,'camera eventually looks into the turn');
 assert.ok(heroVisible(camera,hero,viewport,world));
});

test('fixed-time pursuit is frame-rate independent and never follows a missing path',()=>{
 const hero=here(88,50),path=[here(89,50),here(90,50),here(91,50),here(92,50)];
 const a=settle(hero,path,viewport,30,2),b=settle(hero,path,viewport,120,2);
 assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-6);
 assert.deepEqual(easeJourneyFollowCamera(a,hero,[],.016,viewport,world),a);
});

test('close zoom and world corners always keep the traveller visible',()=>{
 for(const zoom of [.6,.8,1,1.35,1.8]){
  const view={...viewport,zoom};
  for(const [hero,path] of [
   [here(0,0),[here(1,0),here(2,0)]],
   [here(175,135),[here(174,135),here(173,135)]],
   [here(0,75),[here(0,74),here(0,73)]],
   [here(175,70),[here(175,71),here(175,72)]]
  ]){
   const camera=settle(hero,path,view);
   assert.ok(heroVisible(camera,hero,view,world),`zoom ${zoom}, tile ${hero.x},${hero.y}`);
   assert.ok(Number.isFinite(camera.x)&&Number.isFinite(camera.y));
   const halfX=view.width/(2*zoom),halfY=view.height/(2*zoom);
   assert.ok(camera.x>=halfX-1e-6&&camera.x<=world.width-halfX+1e-6);
   assert.ok(camera.y>=halfY-1e-6&&camera.y<=world.height-halfY+1e-6);
  }
 }
});
