import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJourneyWorld,JOURNEY_SITES,JOURNEY_NPCS,JOURNEY_VISTAS} from '../journey-world.js';

function reachable(world){
 const seen=new Set(),queue=[world.start],key=(x,y)=>y*world.w+x;
 seen.add(key(world.start.x,world.start.y));
 for(let i=0;i<queue.length;i++){
  const p=queue[i];
  for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
   const x=p.x+dx,y=p.y+dy,k=key(x,y);
   if(!seen.has(k)&&world.walkable(x,y)){seen.add(k);queue.push({x,y});}
  }
 }
 return seen;
}
test('pilgrimage demo is rich but preserves all original journeys',()=>{
 const w=makeJourneyWorld();
 assert.equal(w.w,112);assert.equal(w.h,88);
 assert.equal(JOURNEY_SITES.length,22);
 assert.equal(JOURNEY_NPCS.length,16);
 assert.equal(JOURNEY_VISTAS.length,9);
 for(const items of [JOURNEY_SITES,JOURNEY_NPCS,JOURNEY_VISTAS])
  assert.equal(new Set(items.map(item=>item.id)).size,items.length,'unique landmark ids');
 for(const id of ['journey-terminal','journey-chaikhana','journey-monolith','journey-ship','journey-hut','journey-terrace'])
  assert.ok(w.sites.some(s=>s.id===id),'original site '+id+' is retained');
 assert.equal(w.tileAt(81,52),'L','the giant lake still exists');
 assert.equal(w.walkable(81,52),false,'no walking across the lake');
 assert.ok(w.walkable(19,70),'original starting quay is traversable');
});
test('all additional voices, viewpoints and discoveries remain on reachable dry paths',()=>{
 const w=makeJourneyWorld(),seen=reachable(w),at=p=>seen.has(p.y*w.w+p.x);
 for(const s of JOURNEY_SITES){
  assert.ok(w.walkable(s.entrance.x,s.entrance.y),'site entrance has legal terrain: '+s.id);
  assert.ok(at(s.entrance),'site entrance reachable from start: '+s.id);
  assert.ok(s.desc.length>18&&s.aside.length>8,'site has two worthwhile text fragments: '+s.id);
 }
 for(const n of JOURNEY_NPCS){
  assert.ok(at(n),'speaker reachable: '+n.id);
  assert.ok(n.lines?.length>=1,'speaker has content: '+n.id);
 }
 for(const v of JOURNEY_VISTAS){
  assert.ok(at(v),'viewpoint reachable: '+v.id);
  assert.ok(v.title&&v.sub&&v.radius>0,'viewpoint has a label and deliberate proximity: '+v.id);
 }
 let walkable=0;
 for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++)if(w.walkable(x,y))walkable++;
 assert.equal(seen.size,walkable,'all legal paths remain connected');
});
