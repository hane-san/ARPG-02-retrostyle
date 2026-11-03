import test from 'node:test';
import assert from 'node:assert/strict';
import {makePilgrimageWorld,PILGRIM_ZONES} from '../pilgrimage-world.js';
import {DETOURS,DETOUR_THEMES} from '../pilgrimage-detours.js';
import {pickJourneyArrivalTrack} from '../journey-music.js';

// Issue #99 P0: three walks (twilight hills, a small climb, a lakeside dusk path) are
// real, connected places that never pave the lake.
const w=makePilgrimageWorld();
const reach=(()=>{const seen=new Uint8Array(w.w*w.h),q=[[w.start.x,w.start.y]];seen[w.start.y*w.w+w.start.x]=1;
 while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(w.walkable(a,b)&&!seen[b*w.w+a]){seen[b*w.w+a]=1;q.push([a,b]);}}}return seen;})();
const walks=PILGRIM_ZONES.filter(z=>z.detour);

test('three named walks with their own palette, music and landmark',()=>{
 assert.deepEqual(walks.map(z=>z.theme),[...DETOUR_THEMES]);
 for(const z of walks){
  assert.ok(z.name&&z.chartName&&z.sub);
  assert.match(pickJourneyArrivalTrack(z.id),/^\d+:[12]$/,z.id);
  assert.ok(w.sites.some(s=>s.chapter===z.index&&s.id.startsWith('pilgrim-detour-')),z.name);
 }
});

test('every walk centre and landmark doorstep is reachable on foot; no island appears',()=>{
 for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++)if(w.walkable(x,y))assert.ok(reach[y*w.w+x],`isolated floor at ${x},${y}`);
 for(const z of walks){assert.ok(reach[z.cy*w.w+z.cx],z.name+' centre');assert.equal(w.zoneAt(z.cx,z.cy).name,z.name);}
 for(const s of w.sites.filter(s=>s.id.startsWith('pilgrim-detour-')))assert.ok(reach[s.entrance.y*w.w+s.entrance.x],s.name);
});

test('lake water stays unwalkable and each walk has a walked line',()=>{
 for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++)if(w.tileAt(x,y)==='L')assert.equal(w.walkable(x,y),false,`water at ${x},${y}`);
 for(const z of walks){
  let road=0;for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++)if(w.zoneAt(x,y).index===z.index&&w.tileAt(x,y)==='=')road++;
  assert.ok(road>40,z.name+' has a walked line');
 }
});

test('the lakeside walk really runs beside the water',()=>{
 const shore=walks.find(z=>z.theme==='shore');let beside=0;
 for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++)if(w.zoneAt(x,y).index===shore.index&&w.walkable(x,y)&&[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>w.tileAt(x+dx,y+dy)==='L'))beside++;
 assert.ok(beside>=20,`${beside} walk tiles touch the lake`);
 assert.equal(DETOURS.length,6);
});
