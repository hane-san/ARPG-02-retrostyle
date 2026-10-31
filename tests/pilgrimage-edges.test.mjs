import test from 'node:test';
import assert from 'node:assert/strict';
import {drawRegionalEdge,EDGE_THEMES} from '../pilgrimage-edges.js';
import {makePilgrimageWorld,PILGRIM_ZONES} from '../pilgrimage-world.js';

// Issue #93: regional edge art paints only impassable tiles of four themes and never
// touches the world it reads.
const ctx=()=>{const calls=[];return {calls,set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},
 fillRect(){calls.push('r');},beginPath(){},moveTo(){},lineTo(){},stroke(){calls.push('s');},arc(){},fill(){calls.push('f');}};};

test('four regions own an edge grammar; the rest keep the default',()=>{
 const world=makePilgrimageWorld(),themes=new Set(PILGRIM_ZONES.map(z=>z.theme));
 for(const t of EDGE_THEMES)assert.ok(themes.has(t),t+' is a real region');
 for(const theme of themes){
  const c=ctx(),painted=drawRegionalEdge(c,0,0,world,theme,['#111','#222','#333','#444'],.4);
  assert.equal(painted,EDGE_THEMES.includes(theme),theme);
  assert.equal(c.calls.length>0,painted);
 }
});

test('edge art leaves walkability and tiles exactly as they were',()=>{
 const world=makePilgrimageWorld(),before=JSON.stringify(world.tiles),occ=Buffer.from(world.occupied).toString('base64');
 for(let y=0;y<world.h;y+=7)for(let x=0;x<world.w;x+=7){
  const z=world.zoneAt(x,y);if(world.tileAt(x,y)==='X')drawRegionalEdge(ctx(),x,y,world,z.theme,z.palette,.7);
 }
 assert.equal(JSON.stringify(world.tiles),before);
 assert.equal(Buffer.from(world.occupied).toString('base64'),occ);
});
