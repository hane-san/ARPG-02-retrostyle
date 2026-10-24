import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJourneyWorld,JOURNEY_ZONES} from '../journey-world.js';
import {EXTENSION_ZONES,EXTENSION_SITES,EXTENSION_NPCS,EXTENSION_VISTAS,EXTENSION_PALETTE,extensionZoneAt} from '../journey-expansion.js';
import {JOURNEY_PALETTE} from '../journey-art.js';
import {JOURNEY_PLAYLISTS} from '../journey-music.js';
import {JOURNEY_ZOOM_STAGES,JOURNEY_CAMERA_PROFILES,journeyCameraScene} from '../journey-camera.js';
import {EXPANSION_VISTA_KINDS} from '../journey-expansion-vistas.js';
import {RUINS_ZONES} from '../journey-ruins.js';

test('expanded scenery preserves the original walking country and adds six coherent regions',()=>{
 const world=makeJourneyWorld();
 assert.deepEqual([world.w,world.h],[176,136]);
 assert.deepEqual([EXTENSION_ZONES.length,EXTENSION_SITES.length,EXTENSION_NPCS.length,EXTENSION_VISTAS.length],[7,13,11,7]);
 assert.equal(JOURNEY_ZONES.filter(z=>!RUINS_ZONES.includes(z)).length,14,'original regions survive intact');
 assert.equal(JOURNEY_ZONES.length,14+RUINS_ZONES.length,'southwest extension is additive');
 assert.deepEqual(JOURNEY_ZOOM_STAGES,[1.8,1.35,1.15,1,.8,.6]);
 for(const zone of EXTENSION_ZONES){
  const loc={x:zone.cx,y:zone.cy};
  assert.equal(world.zoneAt(loc.x,loc.y).id,zone.id,zone.id+' centre has intended biome');
  assert.ok(world.walkable(loc.x,loc.y),zone.id+' centre is walkable');
  assert.ok(JOURNEY_ZOOM_STAGES.includes(JOURNEY_CAMERA_PROFILES[zone.id]),'camera profile '+zone.id);
  assert.ok(JOURNEY_PLAYLISTS[zone.id]?.length>=3,'sound library '+zone.id);
  const forward=world.findPath(world,world.start,loc);
  assert.ok(forward?.length>20,'walk toward '+zone.id);
  assert.ok(world.findPath(world,loc,world.start)?.length>20,'return from '+zone.id);
 }
 assert.equal(journeyCameraScene(world,{px:156,py:60}),'journey-detail');
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-glass'],1,'the ordinary city stays standard; the arcade is a separate close-up');
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-highland'],.6);
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-river'],1);
 for(const [tile,color] of Object.entries(EXTENSION_PALETTE))assert.equal(JOURNEY_PALETTE[tile],color);
 for(const v of EXTENSION_VISTAS)assert.ok(EXPANSION_VISTA_KINDS.has(v.kind));
 assert.equal(world.tileAt(81,52),'L','original central water remains unwalkable');
 assert.equal(world.walkable(81,52),false);
 const sky=EXTENSION_VISTAS.find(v=>v.id==='journey-sky-edge-vista');
 assert.ok(sky&&sky.kind==='sky-edge');
 assert.equal(world.zoneAt(sky.x,sky.y).id,'journey-sky-edge');
 assert.equal(journeyCameraScene(world,{px:sky.x,py:sky.y}),'journey-sky-edge');
 assert.equal(JOURNEY_CAMERA_PROFILES['journey-sky-edge'],.6);
 assert.ok(world.sites.some(s=>s.id==='journey-sky-seat'));
 assert.equal(world.walkable(169,15),false,'the open sky is not walkable');
});
test('the expanded terrain contains meaningful colour contrasts and true physical water',()=>{
 const w=makeJourneyWorld(),counts={};
 for(const row of w.tiles)for(const t of row)counts[t]=(counts[t]||0)+1;
 for(const t of ['c','r','m','a','H','j','z','o','W','Y'])assert.ok(counts[t]>2,t+' exists in expanded landscape');
 for(let y=1;y<w.h;y++)for(let x=1;x<w.w;x++)if(['W','Y'].includes(w.tileAt(x,y)))
  assert.equal(w.walkable(x,y),false,'unbridged water and cliffs remain impassable');
 const bridgeTiles=w.tiles.flat().filter(t=>t==='+').length;
 assert.ok(bridgeTiles>50,'the enlarged country has real connecting footbridges');
 assert.ok(counts.W>40,'a river changes the traversal geography');
 const colours=new Set(['c','m','a','H','j','z'].map(t=>JOURNEY_PALETTE[t]));
 assert.equal(colours.size,6,'every major study has its own base colour');
});
test('large region sites, villagers and all optional vistas can be reached without teleporting',()=>{
 const w=makeJourneyWorld();
 for(const item of [...EXTENSION_SITES.map(s=>s.entrance),...EXTENSION_NPCS,...EXTENSION_VISTAS]){
  const path=w.findPath(w,w.start,item);
  assert.ok(path?.length>0,JSON.stringify(item));
  for(const cell of path)assert.ok(w.walkable(cell.x,cell.y),'crossed blocked tile');
 }
});
test('region seams meander and every landmark sits in the region it describes',()=>{
 const seam=y=>{for(let x=112;x<175;x++)if(extensionZoneAt(x,y)!=='river')return x;return null;};
 const xs=new Set();for(let y=52;y<86;y+=3)xs.add(seam(y));
 assert.ok(xs.size>=4,'river/glass boundary is not a ruler line');
 const rows=new Set();for(let x=114;x<145;x+=3){let y=30;while(extensionZoneAt(x,y)==='canyon')y++;rows.add(y);}
 assert.ok(rows.size>=4,'canyon/river boundary is not a ruler line');
 const home={'journey-glass-seller':'glass','journey-glass-gardener':'glass','journey-caravan-singer':'whitebasin','journey-canyon-cook':'canyon','journey-ferry-child':'river'};
 for(const n of EXTENSION_NPCS)if(home[n.id])assert.equal(extensionZoneAt(n.x,n.y),home[n.id],n.id);
 const w=makeJourneyWorld();
 for(const s of EXTENSION_SITES)for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)
  assert.notEqual(w.tileAt(x,y),'~',s.id+' stands on land');
 for(let y=0;y<w.h;y++)assert.equal(w.tileAt(w.w-2,y)==='~'||w.tileAt(w.w-2,y)==='V',true,'a margin of sea separates the shore from the frame');
});
