import assert from 'node:assert/strict';
import {makeFixedRooms,gatePoint,fixedLayout,FIXED_START} from '../fixed-screens.js';
export function fixedRoute(from,to){
 const rooms=makeFixedRooms(),q=[{id:from,route:[]}],seen=new Set([from]);for(let i=0;i<q.length;i++){const p=q[i];if(p.id===to)return p.route;for(const [d,id]of Object.entries(rooms.find(r=>r.id===p.id).connections))if(!seen.has(id)){seen.add(id);q.push({id,route:[...p.route,d]});}}throw Error('No fixed route '+from+' -> '+to);
}
export function walkFixedState(state,to){for(const d of fixedRoute(state.room.id,to)){const id=state.room.connections[d];assert.ok(state.walkTo(gatePoint(d,state.room)));for(let i=0;i<1800&&state.room.id!==id;i++)state.update(.016,{reduced:true});assert.equal(state.room.id,id);}assert.equal(state.room.id,to);}
// Old eight/33-room regressions now walk from the new central entry first.
// This is ordinary public Canvas input, not a hidden position setter.
export async function walkFixedBrowser(page,to='hearth',from=FIXED_START.room){
 const rooms=makeFixedRooms(),canvas=page.locator('#fixedCanvas'),box=await canvas.boundingBox(),l=fixedLayout(box.width,box.height);let room=rooms.find(r=>r.id===from);
 for(const d of fixedRoute(from,to)){const p=gatePoint(d,room),next=rooms.find(r=>r.id===room.connections[d]);await canvas.tap({position:{x:l.x+(p.x+.5)*32*l.scale,y:l.y+(p.y+.5)*32*l.scale}});let arrived=false;for(let i=0;i<180;i++){await page.clock.runFor(100);if(await page.locator('#zoneName').textContent()===next.name){arrived=true;break;}}assert.ok(arrived,'central entry approach '+room.id+' '+d);await page.clock.runFor(400);room=next;}
 // Approach the old entrance's usual occupied cell for the unchanged tests.
 if(to==='hearth'){await canvas.tap({position:{x:l.x+7.5*32*l.scale,y:l.y+9.5*32*l.scale}});for(let i=0;i<180;i++){await page.clock.runFor(100);if(await canvas.getAttribute('aria-busy')==='false')break;}for(let i=0;i<2;i++){await page.keyboard.press('ArrowDown');await page.clock.runFor(350);}}
 assert.equal(await page.locator('#zoneName').textContent(),room.name);
}
