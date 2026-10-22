import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJourneyWorld,JOURNEY_SITES,JOURNEY_NPCS} from '../journey-world.js';
import {ART_OBJECTS,WEIRD_MOBS} from '../art-objects.js';
import {UNEASY_MOBS} from '../uneasy.js';
import {STEPPE_MOBS,STEPPE_OBJECTS} from '../steppe-asia.js';
import {DISTANT_VISTAS} from '../distant-vistas.js';
import {JOURNEY_CURIOS,journeySoundSources} from '../journey-curios.js';

// Issue #53: pieces added by several AIs must sit on the current map, not on the
// lake, inside buildings or on top of one another, and must never make water walkable.
const world=makeJourneyWorld();
const wet=t=>['~','L','l','X'].includes(t);
const inRect=(s,x,y)=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h;
const reach=new Set([world.start.y*world.w+world.start.x]),queue=[world.start];
for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const x=queue[i].x+dx,y=queue[i].y+dy,k=y*world.w+x;
 if(world.walkable(x,y)&&!reach.has(k)){reach.add(k);queue.push({x,y});}
}
const reachable=p=>reach.has(p.y*world.w+p.x);
const spiceNpcs=new Set([...WEIRD_MOBS,...UNEASY_MOBS,...STEPPE_MOBS].map(n=>n.id));
const spiceSites=new Set([...ART_OBJECTS,...STEPPE_OBJECTS,...JOURNEY_CURIOS].map(s=>s.id));

test('every person stands on reachable dry ground, outside buildings, entrances and bridges',()=>{
 const tiles=new Map();
 for(const n of world.npcs){
  assert.ok(reachable(n),n.id+' unreachable at '+n.x+','+n.y);
  assert.ok(!wet(world.tileAt(n.x,n.y)),n.id+' stands on water or rock');
  assert.ok(!world.sites.some(s=>s.blocking!==false&&inRect(s,n.x,n.y)),n.id+' inside a building');
  assert.ok(!world.sites.some(s=>s.entrance.x===n.x&&s.entrance.y===n.y),n.id+' blocks an entrance');
  assert.ok(!world.bridgeAt(n.x,n.y),n.id+' stands on a bridge');
  assert.ok(!(n.x===world.start.x&&n.y===world.start.y),n.id+' on the start tile');
  const key=n.x+','+n.y;assert.ok(!tiles.has(key),n.id+' shares a tile with '+tiles.get(key));tiles.set(key,n.id);
 }
});

test('added passers-by keep a little room and stay clear of the pieces people tap',()=>{
 for(const n of world.npcs.filter(n=>spiceNpcs.has(n.id))){
  const near=world.npcs.filter(o=>o!==n&&Math.max(Math.abs(o.x-n.x),Math.abs(o.y-n.y))<=1);
  assert.deepEqual(near.map(o=>o.id),[],n.id+' is crowded');
  assert.ok(!world.sites.some(s=>inRect(s,n.x,n.y)),n.id+' stands on a piece');
 }
});

test('every piece has a reachable entrance of its own, and added pieces never overlap or pave water',()=>{
 for(const s of world.sites){
  assert.ok(reachable(s.entrance),s.id+' entrance unreachable');
  assert.ok(!world.sites.some(o=>o!==s&&inRect(o,s.entrance.x,s.entrance.y)),s.id+' entrance inside another piece');
  if(!spiceSites.has(s.id))continue;
  assert.ok(!world.sites.some(o=>o!==s&&!(o.x>=s.x+s.w||s.x>=o.x+o.w||o.y>=s.y+s.h||s.y>=o.y+o.h)),s.id+' overlaps another piece');
  for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++){
   if(s.afloat&&wet(world.tileAt(x,y)))continue;
   assert.ok(!wet(world.tileAt(x,y)),s.id+' sits on water or rock at '+x+','+y);
  }
 }
 for(const v of DISTANT_VISTAS)assert.ok(reachable(v)&&!wet(world.tileAt(v.x,v.y)),v.id+' viewpoint is not on reachable ground');
});

test('a person or art piece placed on the lake never turns the water into a walkable island',()=>{
 const lake={x:81,y:52};
 assert.equal(world.tileAt(lake.x,lake.y),'L');
 JOURNEY_NPCS.push({id:'probe-swimmer',name:'probe',role:'probe',x:lake.x,y:lake.y,lines:['probe line one','probe line two']});
 JOURNEY_SITES.push({id:'probe-art',name:'probe',kind:'art',x:lake.x+3,y:lake.y,w:2,h:2,entrance:{x:lake.x+3,y:lake.y+3},blocking:false,desc:'probe',aside:'probe'});
 try{
  const probe=makeJourneyWorld();
  assert.equal(probe.walkable(lake.x,lake.y),false,'a person in the lake made water walkable');
  assert.equal(probe.walkable(lake.x+4,lake.y+1),false,'an art piece in the lake paved the water');
 }finally{JOURNEY_NPCS.pop();JOURNEY_SITES.pop();}
});

// Issue #51: places that sound when approached. Same rules as people and pieces, plus quiet
// places stay quiet, uneasy echoes stay in the black-stone corridor and places never blur together.
test('proximity sounds sit on reachable dry ground, apart, and leave the quiet places quiet',()=>{
 const sources=journeySoundSources(world.sites),zone=s=>world.zoneAt(s.x,s.y).id;
 assert.ok(sources.length>=10&&sources.length<=16,'10-16 places make a sound');
 for(const s of sources){
  assert.ok(reachable(s),s.id+' sound cannot be approached');
  assert.ok(!wet(world.tileAt(s.x,s.y)),s.id+' sound stands on water or rock');
  assert.ok(!world.bridgeAt(s.x,s.y),s.id+' sound on a bridge');
  assert.ok(!world.sites.some(o=>o.blocking!==false&&inRect(o,s.x,s.y)),s.id+' sound inside a building');
  for(const o of sources)if(o!==s)assert.ok(Math.hypot(o.x-s.x,o.y-s.y)>=10,s.id+' blurs into '+o.id);
 }
 assert.equal(new Set(sources.map(s=>s.id)).size,sources.length);
 for(const quiet of ['journey-sky-edge','journey-lake'])assert.ok(!sources.some(s=>zone(s)===quiet),quiet+' keeps its silence');
 assert.ok(sources.filter(s=>s.kind==='echo').every(s=>zone(s)==='journey-void'),'uneasy echoes only in the black-stone corridor');
 for(const kind of ['kettle','wood','creak','bell','echo'])assert.ok(sources.some(s=>s.kind===kind),kind+' place is audible');
});
