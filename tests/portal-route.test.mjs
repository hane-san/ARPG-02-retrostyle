import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeWorld,findPath,START,nearestWalkable,avoidTransitions} from '../world.js';
import {makeSilkWorld,silkPath,SILK_START} from '../silk-world.js';
import {makePrototypeWorld} from '../prototype-world.js';

// game.js switches worlds whenever the walker reaches a portal tile, so a route
// may use a portal only as its chosen destination (Issue #18).
const tidal=makeWorld(),silk=makeSilkWorld();
const cases=[['tidal',tidal,findPath,START],['silk',silk,silkPath,SILK_START]];
const crossesMidway=(world,path)=>path.some((p,i)=>i>0&&i<path.length-1&&world.transitionAt(p.x,p.y));
function reach(world,from){
 const seen=new Uint8Array(world.w*world.h),queue=[from];seen[from.y*world.w+from.x]=1;
 for(let i=0;i<queue.length;i++){
  const {x,y}=queue[i];
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=x+dx,ny=y+dy;
   if(!world.walkable(nx,ny)||seen[ny*world.w+nx])continue;
   seen[ny*world.w+nx]=1;queue.push({x:nx,y:ny});
  }
 }
 return seen;
}
test('avoiding portals as waypoints disconnects no walkable tile in either world',()=>{
 for(const [id,world,,start] of cases){
  const all=reach(world,start),guarded=reach(avoidTransitions(world,{x:-1,y:-1}),start);
  for(let i=0;i<all.length;i++){
   const x=i%world.w,y=(i/world.w)|0;
   if(world.transitionAt(x,y))continue;
   assert.equal(guarded[i],all[i],id+' tile ('+x+','+y+') changes reachability');
  }
 }
});
test('every portal is still reachable when it is the chosen destination',()=>{
 for(const [id,world,pathfind,start] of cases)for(const portal of world.transitions){
  const route=pathfind(avoidTransitions(world,portal),start,portal);
  assert.ok(route?.length>1,id+' cannot reach '+portal.name);
  assert.deepEqual(route.at(-1),{x:portal.x,y:portal.y});
  assert.ok(!crossesMidway(world,route),id+' route to '+portal.name+' passes another portal');
 }
});
test('named destinations are walked to without passing a portal and without detours',()=>{
 for(const [id,world,pathfind,start] of cases){
  const goals=[...world.sites.map(s=>s.entrance),...world.npcs.map(n=>({x:n.x,y:n.y})),
   ...world.bridges.map(b=>b.center),...world.zones.map(z=>nearestWalkable(world,z.cx,z.cy,12))].filter(Boolean);
  const origins=id==='tidal'?[start,{x:156,y:38},...world.sites.map(s=>s.entrance)]:[start];
  for(const from of origins)for(const goal of goals){
   const plain=pathfind(world,from,goal),route=pathfind(avoidTransitions(world,goal),from,goal);
   assert.equal(!!route,!!plain,id+' reachability changed for '+JSON.stringify(goal));
   if(!route)continue;
   assert.ok(!crossesMidway(world,route),id+' '+JSON.stringify(from)+' → '+JSON.stringify(goal)+' passes a portal');
   assert.equal(route.length,plain.length,id+' detour to '+JSON.stringify(goal));
  }
 }
});
test('worlds without portals are routed unchanged and the game uses the guard',()=>{
 const mini=makePrototypeWorld();
 assert.equal(avoidTransitions(mini,START),mini);
 const game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 assert.match(game,/route=avoidTransitions\(world,target\)/);
 assert.match(game,/silkPath\(route,from,target\):findPath\(route,from,target\)/);
});
