import {PILGRIM_ZONES} from '../pilgrimage-world.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJourneyWorld,JOURNEY_W,JOURNEY_H,STEPPE,routeJourneyWalk} from '../journey-world.js';
import {makeWorld} from '../world.js';
import {makePrototypeWorld} from '../prototype-world.js';
import {makeSilkWorld} from '../silk-world.js';
import {MUSIC_LIBRARY,ORIGINAL_SCORE_COUNT} from '../music.js';
import {createJourneyMusicDirector,pickJourneyTrack,JOURNEY_PLAYLISTS} from '../journey-music.js';

const world=makeJourneyWorld();
function legalRoute(w,from,to){
 const path=w.findPath(w,from,to);
 assert.ok(path?.length,'route missing '+JSON.stringify({from,to}));
 assert.deepEqual(path[0],{x:from.x,y:from.y});assert.deepEqual(path.at(-1),{x:to.x,y:to.y});
 for(let i=0;i<path.length;i++){
  const p=path[i];assert.ok(w.walkable(p.x,p.y),'blocked '+JSON.stringify(p));
  assert.ok(p.x>=0&&p.x<w.w&&p.y>=0&&p.y<w.h);
  if(i)assert.equal(Math.abs(p.x-path[i-1].x)+Math.abs(p.y-path[i-1].y),1,'non-orthogonal step');
 }
 return path;
}

test('journey uses its own actual dimensions, spawn, and strict coordinate bounds',()=>{
 assert.equal(world.w,320);assert.equal(world.h,192);
 assert.equal(world.w,JOURNEY_W);assert.equal(world.h,JOURNEY_H);
 assert.equal(world.occupied.length,world.w*world.h);
 assert.ok(world.walkable(world.start.x,world.start.y));
 assert.notDeepEqual(world.start,{x:41,y:40});
 assert.ok(world.w*world.h<=65536);
 for(const p of [{x:-1,y:20},{x:JOURNEY_W,y:20},{x:0,y:JOURNEY_H},{x:2.5,y:3},{x:NaN,y:3}]){
  assert.equal(world.walkable(p.x,p.y),false);assert.equal(world.tileAt(p.x,p.y),'~');
  assert.equal(world.findPath(world,world.start,p),null);
 }
 assert.deepEqual(world.transitions,[]);assert.equal(world.transitionAt(45,40),undefined);
});

test('all sites, people, region buttons, and vistas have safe outward and return paths',()=>{
 const targets=[...world.sites.map(s=>s.entrance),...world.npcs,...world.zones.map(z=>({x:z.cx,y:z.cy})),...world.vistas];
 for(const target of targets){legalRoute(world,world.start,target);legalRoute(world,target,world.start);}
 for(const s of world.sites){
  assert.ok(s.desc.length>20&&s.aside.length>20);
  for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++){
   // Pieces drawn afloat on purpose leave the water under them unwalkable.
   if(s.afloat&&['~','L','l','study-water'].includes(world.tileAt(x,y)))assert.equal(world.walkable(x,y),false,s.id+' afloat');
   else {const solid=s.blocking!==false||!!s.solid?.some(r=>x>=s.x+r.x&&x<s.x+r.x+r.w&&y>=s.y+r.y&&y<s.y+r.y+r.h);assert.equal(world.walkable(x,y),!solid,s.id+' building footprint');}
  }
 }
 // Authored voices keep two substantial lines; the owner-added grok villagers are deliberate one-liners,
 // and the odd, uneasy and steppe passers-by (2026-10-22) speak in two short, deliberately curt beats.
 const curt=/^(weird|uneasy|steppe)-/;
 for(const n of world.npcs)assert.ok(n.lines.length>=(n.id.startsWith('grok-')?1:2)&&n.lines.every(line=>line.length>(curt.test(n.id)?5:15)),n.id);
});

test('every walkable cell belongs to the same country, with no isolated shore destinations',()=>{
 const queue=[world.start],seen=new Set([world.start.y*world.w+world.start.x]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=queue[i].x+dx,y=queue[i].y+dy,key=y*world.w+x;
  if(world.walkable(x,y)&&!seen.has(key)){seen.add(key);queue.push({x,y});}
 }
 let land=0;
 for(let y=0;y<world.h;y++)for(let x=0;x<world.w;x++)if(world.walkable(x,y))land++;
 assert.equal(seen.size,land);assert.ok(land>4500);
});

test('the bold circular meadow has two independently walkable semicircular routes',()=>{
 let meadow=0;
 for(let y=14;y<=62;y++)for(let x=11;x<=61;x++)if(['g','G'].includes(world.tileAt(x,y)))meadow++;
 assert.ok(meadow>1300,'the circle needs a broad open centre');
 for(const west of [true,false]){
  const ring={...world,walkable:(x,y)=>world.walkable(x,y)&&
   Math.abs(Math.hypot(x-STEPPE.x,y-STEPPE.y)-STEPPE.roadRadius)<2.1&&(west?x<=STEPPE.x:x>=STEPPE.x)};
  const route=legalRoute(ring,{x:36,y:16},{x:36,y:60});
  assert.ok(route.length>65,'a genuine semicircle, not a straight shortcut');
 }
});

test('the lake is impassable and can be circumnavigated on either shore',()=>{
 assert.equal(world.walkable(81,52),false);
 assert.equal(world.findPath(world,world.start,{x:81,y:52}),null);
 let water=0,rock=0;
 for(let y=0;y<world.h;y++)for(let x=0;x<world.w;x++){
  const t=world.tileAt(x,y);
  if(['L','l'].includes(t)){water++;assert.equal(world.walkable(x,y),false);}
  if(t==='X'){rock++;assert.equal(world.walkable(x,y),false);}
 }
 assert.ok(water>1100);assert.ok(rock>100);
 for(const north of [true,false]){
  const shore={...world,walkable:(x,y)=>world.walkable(x,y)&&(north?y<=52:y>=52)};
  const route=legalRoute(shore,{x:55,y:52},{x:106,y:52});
  assert.ok(route.length>80);
 }
});

test('the port crosses a physical bridge, while the watercourse has a separate return crossing',()=>{
 const out=legalRoute(world,world.start,{x:36,y:38});
 assert.ok(out.some(p=>world.bridgeAt(p.x,p.y)?.id==='journey-link'));
 const withoutBridge={...world,walkable:(x,y)=>world.walkable(x,y)&&!(x>=24&&x<=29&&y>=66&&y<=68)};
 assert.equal(world.findPath(withoutBridge,world.start,{x:36,y:38}),null,'inlet must not permit walking on water');
 legalRoute(world,{x:46,y:74},{x:64,y:76});
 for(const bridge of world.bridges)assert.ok(world.walkable(bridge.center.x,bridge.center.y));
});

test('redirecting midway along an edge finishes it without teleporting or cutting a corner',()=>{
 // An L-shaped corridor deliberately puts a wall beside the moving explorer.
 const legal=new Set(['1,1','2,1','2,2','2,3']);
 const corridor={w:5,h:5,tileAt:()=>'.',walkable:(x,y)=>legal.has(x+','+y),findPath:world.findPath};
 const hero={x:1,y:1,px:1.6,py:1,path:[{x:2,y:1},{x:2,y:2}]};
 const redirected=routeJourneyWalk(corridor,hero,{x:2,y:3});
 assert.deepEqual(redirected,[{x:2,y:1},{x:2,y:2},{x:2,y:3}]);
 assert.deepEqual(routeJourneyWalk(corridor,hero,{x:1,y:1}),[{x:2,y:1},{x:1,y:1}]);
 assert.equal(routeJourneyWalk(corridor,hero,{x:1,y:2}),null);
 const idle={x:2,y:1,px:2,py:1,path:[]};
 assert.deepEqual(routeJourneyWalk(corridor,idle,{x:2,y:1}),[]);
});

test('the three world data contracts coexist without shared occupancy or hidden transitions',()=>{
 const tidal=makeWorld(),silk=makeSilkWorld(),mini=makePrototypeWorld();
 assert.deepEqual([tidal.w,tidal.h,tidal.sites.length,tidal.npcs.length],[164,120,12,13]);
 assert.deepEqual([silk.w,silk.h,silk.sites.length,silk.npcs.length],[430,270,12,12]);
 assert.deepEqual([mini.w,mini.h,mini.sites.length,mini.npcs.length],[80,110,4,4]);
 assert.equal(tidal.transitions.length,2);assert.equal(silk.transitions.length,1);assert.equal(mini.transitions.length,0);
 const another=makeJourneyWorld();another.occupied.fill(1);
 assert.ok(world.walkable(world.start.x,world.start.y));assert.ok(tidal.walkable(41,40));
});

test('journey playlists keep the original 68 pieces first and distinguish every region',()=>{
 assert.equal(ORIGINAL_SCORE_COUNT*2,68);assert.ok(MUSIC_LIBRARY.length>=ORIGINAL_SCORE_COUNT);
 assert.equal(Object.keys(JOURNEY_PLAYLISTS).length,world.zones.length+PILGRIM_ZONES.length);
 for(const z of [...world.zones,...PILGRIM_ZONES]){
  const pool=JOURNEY_PLAYLISTS[z.id];assert.ok(pool?.length>=3);
  for(const key of pool){
   const [score,phase]=key.split(':').map(Number);
   assert.ok(MUSIC_LIBRARY[score]?.[phase===1?'ally':'hostile']);
   for(const roll of [0,.5,.99999]){
    const picked=pickJourneyTrack(z.id,key,()=>roll);assert.ok(pool.includes(picked));assert.notEqual(picked,key);
   }
  }
 }
 assert.notDeepEqual(JOURNEY_PLAYLISTS['journey-steppe'],JOURNEY_PLAYLISTS['journey-salt']);
});

test('music rejects boundary jitter, holds the last region, and eventually changes while stationary',()=>{
 const d=createJourneyMusicDirector(),port='journey-port',grass='journey-steppe';
 assert.equal(d.update(port,0),port);
 for(let t=1000;t<=15000;t+=1000)assert.equal(d.update(t%2000?grass:port,t),null);
 assert.equal(d.update(port,16000),null);
 assert.equal(d.update(grass,17000),null);
 assert.equal(d.update(grass,19199),null);
 assert.equal(d.update(grass,19200),grass);
 assert.equal(d.update(grass,40000),null,'unchanged region must not restart music');
});

test('music coalesces pending regions and enforces the full hold for each accepted change',()=>{
 const d=createJourneyMusicDirector();
 assert.equal(d.update('journey-port',0),'journey-port');
 assert.equal(d.update('journey-steppe',1000),null);
 assert.equal(d.update('journey-steppe',11999),null);
 assert.equal(d.update('journey-steppe',12000),'journey-steppe');
 assert.equal(d.update('journey-tea',13000),null);
 assert.equal(d.update('journey-salt',21000),null);
 assert.equal(d.update('journey-salt',23999),null);
 assert.equal(d.update('journey-salt',24000),'journey-salt');
 assert.equal(d.update('journey-salt',48000),null);
});
