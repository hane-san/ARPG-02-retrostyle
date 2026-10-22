import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJourneyWorld} from '../journey-world.js';
import {RUINS_ZONES,RUINS_SITES,RUINS_NPCS,RUINS_VISTAS,RUINS_PALETTE,RUINS_ACTIVATED,activateRuinsDevice} from '../journey-ruins.js';
import {RUINS_TILES} from '../journey-ruins-art.js';
import {RUINS_VISTA_KINDS} from '../journey-ruins-vistas.js';
import {JOURNEY_PALETTE} from '../journey-art.js';
import {JOURNEY_CAMERA_PROFILES} from '../journey-camera.js';
import {JOURNEY_PLAYLISTS} from '../journey-music.js';

test('southwest labyrinth connects four atmospheres, usable devices and earned vistas',()=>{
 const w=makeJourneyWorld();
 assert.deepEqual([w.w,w.h],[176,136]);
 assert.deepEqual([RUINS_ZONES.length,RUINS_SITES.length,RUINS_NPCS.length,RUINS_VISTAS.length],[4,12,4,4]);
 for(const z of RUINS_ZONES){
  assert.equal(w.zoneAt(z.cx,z.cy).id,z.id);
  assert.ok(w.walkable(z.cx,z.cy),z.id);
  assert.ok(JOURNEY_CAMERA_PROFILES[z.id],z.id+' camera');
  assert.ok(JOURNEY_PLAYLISTS[z.id]?.length>=3,z.id+' music');
 }
 for(const target of [...RUINS_ZONES.map(z=>({x:z.cx,y:z.cy})),...RUINS_SITES.map(s=>s.entrance),...RUINS_NPCS,...RUINS_VISTAS]){
  assert.ok(w.walkable(target.x,target.y),'ruins destination walkable '+JSON.stringify(target));
  const p=w.findPath(w,w.start,target);
  assert.ok(p?.length>1,'walk to ruins '+JSON.stringify(target));
  assert.deepEqual(p.at(-1),{x:target.x,y:target.y});
  assert.ok(w.findPath(w,target,w.start)?.length>1,'return from ruins '+JSON.stringify(target));
 }
 for(const [tile,color] of Object.entries(RUINS_PALETTE)){
  assert.equal(JOURNEY_PALETTE[tile],color);assert.ok(RUINS_TILES.has(tile));
 }
 for(const vista of RUINS_VISTAS)assert.ok(RUINS_VISTA_KINDS.has(vista.kind));
 const cells={};
 for(let y=80;y<136;y++)for(let x=5;x<113;x++)cells[w.tileAt(x,y)]=(cells[w.tileAt(x,y)]||0)+1;
 for(const type of ['A','B','C','D','R','M','U','F','K','P'])assert.ok(cells[type]>0,'visible terrain '+type);
 for(const type of ['R','M','U']){
  let sample=null;
  for(let y=90;y<130&&!sample;y++)for(let x=8;x<110;x++)if(w.tileAt(x,y)===type){sample={x,y};break;}
  assert.ok(sample,'obstacle exists '+type);assert.equal(w.walkable(sample.x,sample.y),false,'blocked '+type);
 }
 for(const s of RUINS_SITES){
  assert.ok(s.desc.length>25&&s.aside.length>20&&s.effect.length>20);
  assert.equal(w.siteAt(s.x,s.y)?.id,s.id);
  for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)
   assert.ok(w.walkable(x,y),'interactable device footprint '+s.id+' '+x+','+y);
 }
});

test('new ruins do not give the port a second bridge over its protected inlet',()=>{
 const w=makeJourneyWorld();
 const excluded={...w,walkable:(x,y)=>w.walkable(x,y)&&!(x>=24&&x<=29&&y>=66&&y<=68)};
 assert.equal(w.findPath(excluded,w.start,{x:36,y:38}),null);
 assert.equal(w.walkable(81,52),false,'original deep lake stays blocked');
 assert.equal(w.tileAt(81,52),'L');
 assert.ok(w.findPath(w,{x:46,y:76},{x:27,y:110})?.length>10,'southern overland trail');
 assert.ok(w.findPath(w,{x:93,y:116},{x:120,y:112})?.length>10,'eastern loop joins existing extension');
});

test('ruin device investigation produces a first reaction and stable illuminated revisit',()=>{
 const s=RUINS_SITES.find(x=>x.form==='monolith');
 RUINS_ACTIVATED.delete(s.id);
 const first=activateRuinsDevice(s);
 assert.equal(first,s.effect);
 assert.equal(RUINS_ACTIVATED.has(s.id),true);
 assert.notEqual(activateRuinsDevice(s),first);
 assert.equal(activateRuinsDevice({kind:'expansion'}),null);
 RUINS_ACTIVATED.delete(s.id);
});
