import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {makeFixedRooms} from '../fixed-screens.js';
import {FIXED_PEOPLE} from '../fixed-people.js';
test('44 authored residents have short, unique conversations and reachable talking space',()=>{
 const rooms=makeFixedRooms(),again=makeFixedRooms(),lines=new Set();let count=0;
 for(const r of rooms){
  assert.deepEqual(r.npcs,again.find(s=>s.id===r.id).npcs,'stable placement '+r.id);
  const start=r.tiles.flatMap((row,y)=>row.map((_,x)=>({x,y}))).find(p=>r.walkable(p.x,p.y));
  for(const n of r.npcs){count++;assert.ok(r.walkable(n.x,n.y));assert.ok(r.findPath(r,start,n));
   const neighbours=[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:x+n.x,y:y+n.y})).filter(p=>r.walkable(p.x,p.y));assert.ok(neighbours.some(p=>r.findPath(r,start,p)));
   assert.equal(n.lines.length,2);for(const line of n.lines){assert.ok(line.length<=42&&line.length>=10,line);assert.ok(!lines.has(line),line);lines.add(line);}
  }
 }
 assert.equal(count,44);assert.equal(FIXED_PEOPLE.filter(p=>p[4]!==undefined).length,24);
 for(const id of ['azure-plain','white-flower-road','cairn-turn','sealed-court'])assert.equal(rooms.find(r=>r.id===id).npcs.length,0,'quiet stretch '+id);
 const physical=rooms.map(r=>Object.fromEntries(['id','tiles','trees','features','site','props','connections','seams'].map(k=>[k,r[k]])));
 assert.equal(createHash('sha256').update(JSON.stringify(physical)).digest('hex'),'cb94f07bd12eb13ead36fcb201d5907354148bae6a3d1cc6b79e419ba4e0d848');
});
