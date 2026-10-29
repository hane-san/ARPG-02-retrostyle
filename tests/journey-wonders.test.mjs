import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNEY_WONDERS,WONDER_VISTAS} from '../journey-wonders.js';
import {makePilgrimageWorld,PILGRIM_BLOCKED,pilgrimCameraScene,PILGRIM_ROUTE} from '../pilgrimage-world.js';
import {createJourneyCamera} from '../journey-camera.js';
const w=makePilgrimageWorld();
test('seven optional studies fit existing dry ground, with separate feet and open passages',()=>{
 assert.equal(JOURNEY_WONDERS.length,7);assert.equal(WONDER_VISTAS.length,3);
 for(const s of JOURNEY_WONDERS){
  assert.ok(w.findPath(w,w.start,s.entrance)?.length,s.id+' reachable');
  assert.equal(w.zoneAt(s.entrance.x,s.entrance.y).index,s.chapter,'study belongs to the intended landscape');
  const z=w.zones[s.chapter];assert.ok(w.findPath(w,{x:z.cx,y:z.cy},s.entrance).length<100,'nearby study does not require a long backtrack');
  for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)assert.ok(!PILGRIM_BLOCKED.has(w.tileAt(x,y)),s.id+' stays on dry ground');
  assert.equal(w.sites.filter(p=>p!==s&&p.x<s.x+s.w&&p.x+p.w>s.x&&p.y<s.y+s.h&&p.y+p.h>s.y).length,0,'no overlapping architecture');
  const mid={x:s.x+Math.floor(s.w/2),y:s.y+s.h-1};assert.ok(w.walkable(mid.x,mid.y));assert.ok(w.findPath(w,s.entrance,mid)?.length);
  assert.equal(w.npcs.some(n=>!w.walkable(n.x,n.y)),false,'people remain reachable');
 }
});
test('a whole forward pilgrimage changes regional zoom only at ridge entry/exit and capital entry',()=>{
 const director=createJourneyCamera({regional:true}),accepted=[director.target];let now=10000;
 for(let i=1;i<PILGRIM_ROUTE.length;i++)for(const p of w.findPath(w,PILGRIM_ROUTE[i-1],PILGRIM_ROUTE[i])){
  now+=1000/7.35;
  const target=director.update(pilgrimCameraScene(w,{px:p.x,py:p.y}),now);
  if(target!==accepted.at(-1))accepted.push(target);
 }
 assert.deepEqual(accepted,[.8,.46,.8,.38],'objects, chapter centres and capital/citadel border cannot pump the zoom');
});
