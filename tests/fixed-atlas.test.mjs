import test from 'node:test';import assert from 'node:assert/strict';
import {makeFixedRooms,FIXED_DIRECTIONS,fixedChartSize,createFixedJourney,gatePoint,FIXED_START} from '../fixed-screens.js';
import {FIXED_SKIES} from '../fixed-sky.js';
import {PILGRIM_ZONES} from '../pilgrimage-world.js';
test('the atlas fills exactly 10 by 10 boards while retaining the original 33 and every main landscape cue',()=>{
 const rooms=makeFixedRooms();assert.equal(rooms.length,100);assert.equal(rooms.filter(r=>r.atlas).length,67);assert.deepEqual(fixedChartSize(),{w:150,h:150});
 for(let y=0;y<10;y++)for(let x=0;x<10;x++)assert.equal(rooms.filter(r=>r.col===x&&r.row===y).length,1);
 const cues=new Set(rooms.map(r=>r.cue));for(const z of PILGRIM_ZONES)assert.ok(cues.has(z.music[0]),'main primary cue '+z.name);assert.equal(cues.size,38);
 assert.deepEqual(new Set(rooms.filter(r=>r.sky).map(r=>r.sky)),new Set(Object.keys(FIXED_SKIES)));for(const r of rooms.filter(r=>r.atlas)){assert.equal(r.role.length>8,true);assert.deepEqual(r.skyAnchor,{x:r.col,y:r.row});}
});
test('every author-placed object has reachable approaches and cannot cut an exit landing or occupy an NPC',()=>{
 for(const r of makeFixedRooms()){
  for(const s of [r.site,...r.props].filter(Boolean)){assert.ok(r.walkable(s.entrance.x,s.entrance.y),r.id+' '+s.name);assert.equal(r.gateAt(s.entrance.x,s.entrance.y),null);}
  for(const n of r.npcs)assert.ok(r.walkable(n.x,n.y),r.id+' NPC');
  for(const d of Object.keys(r.connections)){const v=FIXED_DIRECTIONS[d],a=gatePoint(d,r);for(let offset=-1;offset<=1;offset++){const x=v.dx?a.x-v.dx:a.x+offset,y=v.dy?a.y-v.dy:a.y+offset;if(r.seams[d].bands.some(([lo,hi])=>(v.dx?y:x)>=lo&&(v.dx?y:x)<=hi))assert.ok(r.walkable(x,y),r.id+' arrival '+d);}}
 }
});
test('all additional loops can be traversed in both directions and leave no stale route or bounce',()=>{
 const state=createFixedJourney();state.enter();const rooms=state.rooms,seen=new Set();
 function visit(){seen.add(state.room.id);for(const [d,id] of Object.entries(state.room.connections)){if(seen.has(id))continue;const before=state.room.id;cross(d,id);visit();cross(FIXED_DIRECTIONS[d].back,before);}}
 function cross(d,id){assert.ok(state.walkTo(gatePoint(d,state.room)));for(let i=0;i<1500&&state.room.id!==id;i++)state.update(.016,{reduced:true});assert.equal(state.room.id,id);assert.equal(state.hero.path.length,0);assert.equal(state.transition,null);const p=[state.hero.x,state.hero.y];for(let i=0;i<20;i++)state.update(.016);assert.deepEqual([state.hero.x,state.hero.y],p);}
 visit();assert.equal(seen.size,100);assert.equal(rooms.length,100);assert.equal(state.room.id,FIXED_START.room);
});
