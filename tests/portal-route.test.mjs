import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeWorld,findPath,START,nearestWalkable,avoidTransitions,routeWalk} from '../world.js';
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
  const people=world.npcs.map(n=>({x:n.x,y:n.y})),entrances=world.sites.map(s=>s.entrance);
  const goals=[...entrances,...people,
   ...world.bridges.map(b=>b.center),...world.zones.map(z=>nearestWalkable(world,z.cx,z.cy,12))].filter(Boolean);
  // Start, every arrival from the other world, every entrance and every villager.
  const arrivals=cases.flatMap(([,other])=>other.transitions).filter(t=>t.target===id).map(t=>t.spawn);
  const origins=[start,...arrivals,...entrances,...people];
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
 assert.match(game,/routeWalk\(world,hero,target,currentWorldId==='silk'\?silkPath:findPath\)/);
});
// Issue #24: a redirect between two cells must keep the walker on that edge.
const adjacent=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;
const between=(from,to,path)=>({x:from.x,y:from.y,px:(from.x+to.x)/2,py:(from.y+to.y)/2,path});
test('a redirect at rest is the same guarded route as before',()=>{
 for(const [id,world,pathfind,start] of cases){
  const goal=world.sites[0].entrance,hero={x:start.x,y:start.y,px:start.x,py:start.y,path:[]};
  assert.deepEqual(routeWalk(world,hero,goal,pathfind),pathfind(avoidTransitions(world,goal),start,goal).slice(1),id);
  assert.deepEqual(routeWalk(world,hero,start,pathfind),[],id+' redirect to the current cell arrives at once');
 }
});
test('a redirect between two cells continues along that edge, never diagonally',()=>{
 for(const [id,world,pathfind,start] of cases){
  const goals=[...world.sites.map(s=>s.entrance),...world.npcs.map(n=>({x:n.x,y:n.y}))].filter((_,i)=>i%3===0);
  const walk=pathfind(avoidTransitions(world,goals.at(-1)),start,goals.at(-1));
  for(let i=0;i<walk.length-1;i+=7)for(const goal of goals){
   const hero=between(walk[i],walk[i+1],walk.slice(i+1)),path=routeWalk(world,hero,goal,pathfind);
   assert.ok(path?.length,id+' redirect lost the route to '+JSON.stringify(goal));
   assert.deepEqual(path[0],walk[i+1],id+' first step leaves the current edge');
   for(let j=1;j<path.length;j++)assert.ok(adjacent(path[j-1],path[j]),id+' diagonal step at '+JSON.stringify(path[j]));
   assert.deepEqual(path.at(-1),goal);
   assert.ok(!path.some(p=>world.transitionAt(p.x,p.y)),id+' redirect passes a portal');
  }
 }
});
test('turning away from a portal mid-step walks back instead of crossing worlds',()=>{
 for(const [id,world,pathfind,start] of cases)for(const portal of world.transitions){
  const approach=pathfind(avoidTransitions(world,portal),start,portal),from=approach.at(-2);
  const hero=between(from,portal,[{x:portal.x,y:portal.y}]),goal=start.x===from.x&&start.y===from.y?world.sites[0].entrance:start;
  const away=routeWalk(world,hero,goal,pathfind);
  assert.deepEqual(away[0],{x:from.x,y:from.y},id+' '+portal.name+' must step back along the edge');
  for(let j=1;j<away.length;j++)assert.ok(adjacent(away[j-1],away[j]),id+' diagonal step after turning back');
  assert.ok(!away.some(p=>world.transitionAt(p.x,p.y)),id+' turning away still crosses '+portal.name);
  const at={x:portal.x,y:portal.y};
  assert.deepEqual(routeWalk(world,hero,at,pathfind),[at],id+' choosing the portal itself still crosses');
 }
});
