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
