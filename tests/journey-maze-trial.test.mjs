import test from 'node:test';
import assert from 'node:assert/strict';
import {createMazeTrial} from '../journey-maze-trial.js';
import {makeJourneyWorld,routeJourneyWalk} from '../journey-world.js';

const floor={tileAt:()=> 'A'},from={x:20,y:110};
const path=[{x:21,y:110},{x:22,y:110},{x:22,y:111},{x:23,y:111},{x:23,y:112}];
test('A and non-field routes remain exactly the same, including unreachable and empty paths',()=>{
 for(const search of ['', '?maze=other']){
  const a=createMazeTrial(search);assert.equal(a.enabled,false);
  assert.strictEqual(a.plan(path,from,floor).path,path);
 }
 const b=createMazeTrial('?maze=turns');
 assert.strictEqual(b.plan(path,from,floor,'map').path,path);
 assert.equal(b.plan(null,from,floor).path,null);assert.deepEqual(b.plan([],from,floor).path,[]);
 for(const tile of ['F','=','+','B','.'])assert.strictEqual(b.plan(path,from,{tileAt:()=>tile}).path,path);
 assert.strictEqual(b.plan(path.map(p=>({...p,y:p.y-60})),{...from,y:50},floor).path.length,path.length);
});
test('B stops on an unknown corner, learns only actually walked cells and forgets on reload',()=>{
 const b=createMazeTrial('?maze=turns');b.arrive(from);
 const first=b.plan(path,from,floor);assert.equal(first.limited,true);assert.deepEqual(first.path,path.slice(0,2));
 assert.deepEqual(b.plan(path,from,floor),first,'planning is not walking');
 first.path.forEach(p=>b.arrive(p));
 const next=b.plan(path,from,floor);assert.deepEqual(next.path,path.slice(0,3));
 path.forEach(p=>b.arrive(p));assert.strictEqual(b.plan(path,from,floor).path,path);
 assert.deepEqual(createMazeTrial('?maze=turns').plan(path,from,floor),first);
});
test('real ruin paths remain legal prefixes and repeated choices reach the same destination',()=>{
 const world=makeJourneyWorld();
 for(const [start,target] of [[{x:17,y:102},{x:33,y:118}],[{x:33,y:118},{x:22,y:103}]]){
  assert(world.walkable(start.x,start.y));assert(world.walkable(target.x,target.y));
  const a=routeJourneyWalk(world,{...start,px:start.x,py:start.y,path:[]},target);
  assert.ok(a?.length);
  const b=createMazeTrial('?maze=turns');b.arrive(start);let pos=start,commands=0,stops=0;
  while(pos.x!==target.x||pos.y!==target.y){
   assert(commands++<a.length+1,'each choice makes progress');
   const route=routeJourneyWalk(world,{...pos,px:pos.x,py:pos.y,path:[]},target);
   const choice=b.plan(route,pos,world);
   assert(choice.path.length>0);assert.deepEqual(choice.path,route.slice(0,choice.path.length));
   for(const p of choice.path){assert(world.walkable(p.x,p.y));assert.equal(Math.abs(pos.x-p.x)+Math.abs(pos.y-p.y),1);b.arrive(p);pos=p;}
   if(choice.limited)stops++;
  }
  assert(stops>0,'the real maze contains an unknown off-road corner');
  assert(commands>1);assert.deepEqual(pos,target);
 }
});
test('rerouting while between tiles retains the already committed edge',()=>{
 const world=makeJourneyWorld(),hero={x:17,y:102,px:17.4,py:102,path:[{x:18,y:102}]};
 const target={x:33,y:118},route=routeJourneyWalk(world,hero,target),b=createMazeTrial('?maze=turns');
 const choice=b.plan(route,hero,world);
 assert.deepEqual(choice.path[0],hero.path[0]);
 assert.deepEqual(choice.path,route.slice(0,choice.path.length));
});
