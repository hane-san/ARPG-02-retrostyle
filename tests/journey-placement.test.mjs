import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJourneyWorld,JOURNEY_BLOCKED,JOURNEY_NPCS,JOURNEY_SITES} from '../journey-world.js';
import {JOURNEY_SCENIC_PROPS} from '../journey-scenic.js';
import {drawSrpgUnit} from '../sprite-srpg.js';
import {drawVillager} from '../sprite-villager.js';

// Issue #59: placement fixes stay local and never pave water, rock or ruin walls.
const world=makeJourneyWorld();

test('every authored speaker already stands on reachable dry ground, one per tile',()=>{
 const seen=new Set();
 for(const n of JOURNEY_NPCS){
  assert.equal(JOURNEY_BLOCKED.has(world.tileAt(n.x,n.y)),false,`${n.id} on blocked tile`);
  assert.equal(seen.has(n.y*world.w+n.x),false,`${n.id} shares a tile`);
  seen.add(n.y*world.w+n.x);
 }
 // makeJourneyWorld only relocates speakers that need it; authored data needs no move.
 for(const n of world.npcs)assert.ok(world.walkable(n.x,n.y),`${n.id} not walkable`);
});

test('entrances are doorsteps on land, not paved water or rock',()=>{
 for(const s of JOURNEY_SITES){
  const t=world.tileAt(s.entrance.x,s.entrance.y);
  assert.equal(JOURNEY_BLOCKED.has(t),false,`${s.id} entrance on ${t}`);
 }
});

test('ground props stand on land; only airborne kites and water spray may sit over water',()=>{
 const overWater=new Set(['kite','spray']);
 for(const p of JOURNEY_SCENIC_PROPS){
  if(overWater.has(p.kind))continue;
  assert.equal(JOURNEY_BLOCKED.has(world.tileAt(p.x,p.y)),false,`${p.id} sunk in ${world.tileAt(p.x,p.y)}`);
 }
});

// Records fillRect calls so sprite proportions can be compared without a browser.
function bounds(draw){
 const rects=[];
 const c={fillStyle:'',strokeStyle:'',lineWidth:1,fillRect(x,y,w,h){rects.push({x,y,w,h,fill:this.fillStyle});},
  beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},fill(){},stroke(){}};
 draw(c);
 const body=rects.filter(r=>!/^#19363866$/.test(r.fill));
 return {
  top:Math.min(...body.map(r=>r.y)),foot:Math.max(...body.map(r=>r.y+r.h)),
  shadow:rects.find(r=>r.fill==='#19363866')
 };
}

test('villagers match the explorer body height, footing and shadow',()=>{
 const hero=bounds(c=>drawSrpgUnit(c,{x:0,y:0,team:'ally',acted:false,type:'sword'}));
 const npc=bounds(c=>drawVillager(c,0,0,'#c0b8b4'));
 assert.equal(npc.foot,hero.foot,'feet rest on the same line');
 assert.ok(Math.abs((npc.foot-npc.top)-(hero.foot-hero.top))<=1,'body heights within 1px');
 assert.deepEqual({x:npc.shadow.x,y:npc.shadow.y,w:npc.shadow.w,h:npc.shadow.h},{x:hero.shadow.x,y:hero.shadow.y,w:hero.shadow.w,h:hero.shadow.h});
 assert.ok(npc.foot<=29&&npc.foot>=27,'feet sit just above the tile edge');
});
