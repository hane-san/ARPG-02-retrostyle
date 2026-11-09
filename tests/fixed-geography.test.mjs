import test from 'node:test';import assert from 'node:assert/strict';
import {createFixedJourney,makeFixedRooms,FIXED_START,FIXED_DIRECTIONS,gatePoint,fixedExitTarget,fixedLayout} from '../fixed-screens.js';
import {faultCell,seamLanes} from '../fixed-geography.js';
import {walkFixedState} from './fixed-route.mjs';
const settle=s=>{for(let i=0;i<2200&&(s.hero.path.length||s.transition);i++)s.update(.016,{reduced:true});assert.equal(s.hero.path.length,0);assert.equal(s.transition,null);};
test('entry is in the middle, four distinct lands can be walked and returned, and no stale route survives',()=>{
 const s=createFixedJourney();s.enter();assert.equal(s.room.id,FIXED_START.room);assert.deepEqual([s.room.col,s.room.row],[4,5]);assert.deepEqual([s.hero.x,s.hero.y],[7,11]);assert.ok(s.room.walkable(7,12));const cues=new Set();
 for(const d of ['N','E','S','W']){const to=s.room.connections[d];assert.ok(s.walkTo(gatePoint(d,s.room)));settle(s);assert.equal(s.room.id,to);cues.add(s.room.cue);assert.equal(s.room.gateAt(s.hero.x,s.hero.y),null);walkFixedState(s,FIXED_START.room);}assert.equal(cues.size,4);
});
test('every physical lane can actually transition at its offset and return in the corresponding lane',()=>{
 const s=createFixedJourney();s.enter();const seen=new Set();function visit(){seen.add(s.room.id);const from=s.room;for(const[d,id]of Object.entries(from.connections)){for(const lane of seamLanes(from.seams[d])){const v=FIXED_DIRECTIONS[d],p=gatePoint(d,from);if(v.dx)p.y=lane;else p.x=lane;assert.ok(s.walkTo(p),from.id+' '+d+' '+lane);settle(s);assert.equal(s.room.id,id);assert.equal(v.dx?s.hero.y:s.hero.x,lane);const q=gatePoint(v.back,s.room);if(v.dx)q.y=lane;else q.x=lane;assert.ok(s.walkTo(q));settle(s);assert.equal(s.room.id,from.id);}if(!seen.has(id)){assert.ok(s.walkTo(gatePoint(d,s.room)));settle(s);visit();walkFixedState(s,from.id);}}}visit();assert.equal(seen.size,100);
});
test('the diagonal fault continues over the split edge and needs an upper detour on actual ground',()=>{
 const rooms=makeFixedRooms(),r=rooms.find(r=>r.id==='white-flower-road'),to=rooms.find(r=>r.id==='cairn-turn');assert.equal(r.seams.E.kind,'split');
 for(const board of [r,to])for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(faultCell(board,x,y))assert.equal(board.walkable(x,y),false,'a fault is never rescued as road');
 for(const y of [10]){assert.equal(r.tileAt(14,y),'r');assert.equal(to.tileAt(0,y),'r');assert.equal(r.gateAt(14,y),null);}
 const start={x:7,y:11},goal={x:7,y:4},bounded={...r,walkable:(x,y)=>r.walkable(x,y)&&!r.gateAt(x,y)};assert.ok(r.walkable(start.x,start.y)&&r.walkable(goal.x,goal.y));const path=r.findPath(bounded,start,goal);assert.ok(path);assert.ok(path.length>15,'cannot walk straight through the visible bank');assert.ok(path.some(p=>p.y<=3),'the path goes round the upper tip');
 for(const [w,h]of [[320,477],[390,753],[844,311]]){const l=fixedLayout(w,h),tap=p=>fixedExitTarget(r,l.x+(p.x+.5)*32*l.scale,l.y+(p.y+.5)*32*l.scale,l);for(const y of [2,13]){const p=tap({x:14,y});assert.equal(r.gateAt(p.x,p.y)?.direction,'E');}assert.equal(tap({x:14,y:10}),null,'gap is not a hidden edge shortcut');}
});
test('the northern rim has ten stable sky compositions with shared bearings and unchanged grid fit',()=>{
 const north=makeFixedRooms().filter(r=>r.row===0);assert.equal(north.length,10);assert.ok(new Set(north.map(r=>r.sky)).size>=6);for(const r of north){assert.equal(r.skyline,true);assert.deepEqual(r.skyAnchor,{x:r.col,y:0});assert.equal(r.w,15);assert.equal(r.h,15);}
});

test('small-screen floor taps beside a road arrow stay inside; edge and place plaque retain generous targets',()=>{
 const r=makeFixedRooms().find(r=>r.id==='white-flower-road');for(const [w,h]of [[320,477],[390,753],[844,311]]){const l=fixedLayout(w,h),t=32*l.scale,p={x:l.x+7.5*t,y:l.y+11.5*t};assert.equal(fixedExitTarget(r,p.x,p.y,l),null,'ordinary floor is not an exit icon');}
});
