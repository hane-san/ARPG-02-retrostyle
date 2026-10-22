import test from 'node:test';
import assert from 'node:assert/strict';
import {createAmbienceDirector} from '../journey-ambience.js';
import {JOURNEY_CURIOS,journeySoundSources} from '../journey-curios.js';
import {makeJourneyWorld} from '../journey-world.js';
const source={id:'probe',x:0,y:0,kind:'kettle'};
test('approach fades smoothly, boundary jitter and rapid re-entry never repeat cues',()=>{
 const d=createAmbienceDirector([source]),at=(x,t,active)=>d.update({x,y:0},t,active);
 assert.deepEqual(at(8,0).events,[]);
 assert.equal(at(4.99,100).levels[0].gain<.001,true);
 assert.equal(at(0,3100).events.length,1);
 assert.equal(at(2.5,3200).levels[0].gain,.5);
 for(let i=0;i<10;i++)assert.equal(at(i%2?5.1:4.9,3300+i).events.length,0);
 at(7,4000);assert.equal(at(0,4100).events.length,0);
 assert.equal(at(0,7600).events.length,1);
 assert.deepEqual(at(0,7700,false),{levels:[],events:[]});
 assert.equal(at(0,7800).events.length,0);
 assert.equal(at(0,12200).events.length,1);
 assert.equal(at(0,2).events.length,0,'clock discontinuity has no backlog');
});
test('overlapping places share two sources and a bounded total gain',()=>{
 const d=createAmbienceDirector(Array.from({length:10},(_,i)=>({...source,id:String(i)})));
 const a=d.update({x:0,y:0},0);
 assert.equal(a.events.length,2);assert.equal(a.levels.length,2);
 assert.equal(a.levels.reduce((n,s)=>n+s.gain,0),1);
 assert.equal(d.update({x:0,y:0},50000).events.length,2,'one per source, no catch-up');
});
test('12 new curios and all 13 sound approaches are reachable without water or overlaps',()=>{
 const w=makeJourneyWorld(),sources=journeySoundSources(w.sites);
 assert.equal(JOURNEY_CURIOS.length,12);assert.equal(sources.length,13);
 assert.equal(new Set(JOURNEY_CURIOS.map(s=>w.zoneAt(s.entrance.x,s.entrance.y).id)).size,12);
 const inside=(s,p)=>p.x>=s.x&&p.x<s.x+s.w&&p.y>=s.y&&p.y<s.y+s.h;
 for(const s of JOURNEY_CURIOS){
  assert.ok(w.findPath(w,w.start,s.entrance),s.id);
  for(let y=s.y;y<s.y+2;y++)for(let x=s.x;x<s.x+2;x++){
   assert.ok(w.walkable(x,y),s.id+' ground');assert.ok(!w.bridgeAt(x,y),s.id+' bridge');
   assert.ok(!w.sites.some(o=>o!==s&&inside(o,{x,y})),s.id+' overlap');
  }
  assert.ok(!w.npcs.some(n=>inside(s,n)||n.x===s.entrance.x&&n.y===s.entrance.y),s.id+' person');
  assert.ok(!w.sites.some(o=>o!==s&&inside(s,o.entrance)),s.id+' blocks entrance');
 }
 for(const s of sources)assert.ok(w.findPath(w,w.start,s),s.id+' sound approach');
 assert.ok(!sources.some(s=>s.id==='curio-bench'),'sky retains silence');
});
test('walking past a place is heard once, near enough to hear, without stopping there',()=>{
 // Travel speeds of Issue #44: field 5.7 and atlas 7.35 tiles per second, at 60 frames.
 for(const speed of [5.7,7.35])for(const offset of [0,1,2.5]){
  const d=createAmbienceDirector([source]),heard=[];
  for(let t=0,x=-9;x<=9;t+=1000/60,x+=speed/60)heard.push(...d.update({x,y:offset},t).events);
  assert.equal(heard.length,1,`one cue passing at ${speed} tiles/s, ${offset} tiles aside`);
  assert.ok(heard[0].gain>=.25,'the cue is not spent at the silent rim');
 }
 // Lingering at the barely audible rim keeps the cue for a closer step.
 const d=createAmbienceDirector([source]);
 for(let t=0;t<10000;t+=100)assert.equal(d.update({x:4.6,y:0},t).events.length,0);
 assert.equal(d.update({x:2,y:0},10100).events.length,1);
 // An atlas walk starts as its panel closes: a place reached within a second is still heard.
 const f=createAmbienceDirector([source]);
 for(let t=0;t<2000;t+=100)f.update({x:-8,y:1},t,false);
 const atlasWalk=[];
 for(let t=2000,x=-8;x<=8;t+=1000/60,x+=7.35/60)atlasWalk.push(...f.update({x,y:1},t).events);
 assert.equal(atlasWalk.length,1,'menus leave only a short quiet, not a silent first stretch');
 // Walking back and forth across the place: one cue per cooldown, never a burst.
 const e=createAmbienceDirector([source]);let cues=0;
 for(let t=0,i=0;t<9000;t+=1000/60,i++)cues+=e.update({x:Math.sin(i/30)*6,y:0},t).events.length;
 assert.ok(cues>=1&&cues<=2,'back-and-forth walking makes '+cues+' cues in 9 s');
});
