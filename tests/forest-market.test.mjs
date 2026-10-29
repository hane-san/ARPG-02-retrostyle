import test from 'node:test';
import assert from 'node:assert/strict';
import {makePilgrimageWorld,PILGRIM_ROUTE} from '../pilgrimage-world.js';
import {FOREST_SITES,FOREST_NPCS} from '../forest-market.js';
import {journeySoundSources} from '../journey-curios.js';
import {JOURNEY_PLAYLISTS} from '../journey-music.js';
import {MUSIC_LIBRARY} from '../music.js';
const w=makePilgrimageWorld();
const inside=(s,p)=>p.x>=s.x&&p.x<s.x+s.w&&p.y>=s.y&&p.y<s.y+s.h;
test('forest market houses and residents are separate reachable places on the unchanged pilgrimage',()=>{
 assert.equal(w.zones.length,13);assert.equal(PILGRIM_ROUTE.length,44);
 assert.equal(w.zoneAt(143,38).name,'輪を結ぶ森市');
 for(const s of FOREST_SITES){
  assert.ok(w.findPath(w,w.start,s.entrance));assert.equal(w.siteAt(s.x+1,s.y+1).id,s.id);
  for(const other of w.sites)if(other!==s){
   assert.ok(s.x+s.w<=other.x||other.x+other.w<=s.x||s.y+s.h<=other.y||other.y+other.h<=s.y,'overlapping house '+s.id+' / '+other.id);
   assert.ok(!inside(other,s.entrance),'doorstep in another building');
  }
  for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)assert.ok(!['X','L','~'].includes(w.tileAt(x,y)),'house stays on existing land '+s.id+' '+[x,y]);
  for(const r of s.solid)for(let y=s.y+r.y;y<s.y+r.y+r.h;y++)for(let x=s.x+r.x;x<s.x+r.x+r.w;x++)assert.equal(w.walkable(x,y),false,'wood and tables collide');
  assert.ok(w.walkable(s.x+3,s.y+s.h-1),'central veranda stays open');
 }
 for(const p of FOREST_NPCS){assert.ok(w.findPath(w,w.start,p));assert.ok(!w.sites.some(s=>inside(s,p)));}
});
test('trees have finite solid feet and keep cross-streets, doorsteps and people clear',()=>{
 const trees=w.decor.filter(d=>d.variant===12);assert.ok(trees.length>=12&&trees.length<100);
 for(const t of trees){
  assert.equal(w.walkable(t.x,t.y),false);
  assert.ok(Math.abs(t.y-38)>=4);
  for(const s of FOREST_SITES)assert.ok(Math.hypot(t.x-s.entrance.x,t.y-s.entrance.y)>=3);
  for(const p of w.npcs)assert.ok(Math.hypot(t.x-p.x,t.y-p.y)>=3);
 }
 for(let x=125;x<=157;x++)assert.ok(w.walkable(x,38),'through street '+x);
});
test('the inhabited forest has its own music and quiet nearby working sounds',()=>{
 const pool=JOURNEY_PLAYLISTS['pilgrim-1'];assert.equal(pool[0],'31:1');
 assert.notEqual(pool[0],JOURNEY_PLAYLISTS['pilgrim-0'][0]);assert.equal(MUSIC_LIBRARY.length*2,90);
 const sources=journeySoundSources(w.sites).filter(s=>s.id.startsWith('forest-'));
 assert.deepEqual(sources.map(s=>s.kind).sort(),['kettle','wood','wood']);
 assert.ok(FOREST_NPCS.every(p=>p.lines.length>=2));
});
