import {test} from 'node:test';
import assert from 'node:assert/strict';
import {W,H,START,SITES,NPCS,BRIDGES,ZONES,makeWorld,findPath,nearestWalkable} from '../world.js';

const world=makeWorld();
test('large seamless four-district world with invisible logical grid',()=>{
 assert.equal(world.tiles.length,H);assert.equal(world.tiles[0].length,W);
 assert.equal(ZONES.length,4);assert.equal(BRIDGES.length,6); // distant Starwind bridge and starting-garden shortcut
 assert.equal(SITES.length,12);assert.equal(NPCS.length,13);
 assert.ok(world.walkable(START.x,START.y));
});
test('all four districts are reachable from start without loading screens',()=>{
 const targets=[START,SITES[3].entrance,SITES[6].entrance,SITES[9].entrance];
 for(const t of targets){
  assert.ok(world.walkable(t.x,t.y),'target blocked: '+JSON.stringify(t));
  const route=findPath(world,START,t);
  assert.ok(route&&route.length>=(t.x===START.x&&t.y===START.y?1:3),'no route to '+JSON.stringify(t));
  assert.deepEqual(route[0],START);assert.deepEqual(route.at(-1),t);
  for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i];
   assert.equal(Math.abs(b.x-a.x)+Math.abs(b.y-a.y),1,'nonadjacent movement');
   assert.ok(world.walkable(b.x,b.y),'crossed nonwalkable '+JSON.stringify(b));
  }
 }
});
test('major bridges can be selected and entered using long range pathfinder',()=>{
 for(const bridge of BRIDGES){
  const target=bridge.center;
  assert.equal(world.tileAt(target.x,target.y),'+',bridge.name);
  const route=findPath(world,START,target);
  assert.ok(route&&route.length>(bridge.id==='starwind-near'?2:5),'bridge inaccessible: '+bridge.name);
  assert.deepEqual(route.at(-1),target);
 }
});
test('sites have walkable entrances, blocking structure interiors and reachable access',()=>{
 for(const s of SITES){
  assert.equal(world.siteAt(s.x,s.y)?.id,s.id);
  assert.ok(!world.walkable(s.x,s.y),s.id+' footprint is not an obstacle');
  assert.ok(world.walkable(s.entrance.x,s.entrance.y),s.id+' entrance blocked');
  const route=findPath(world,START,s.entrance);
  assert.ok(route&&route.length>3,s.id+' entrance unreachable');
 }
});
test('NPC cells are walkable, so talking can finish at the character',()=>{
 for(const n of NPCS){
  assert.ok(world.walkable(n.x,n.y),n.name+' blocked');
  const route=findPath(world,START,{x:n.x,y:n.y});
  assert.ok(route&&route.length>0,n.name+' unreachable');
 }
});
test('sea cannot be crossed, land fallback finds neighbouring walkable cells',()=>{
 assert.equal(world.walkable(0,0),false);
 assert.equal(findPath(world,START,{x:0,y:0}),null);
 const near=nearestWalkable(world,41,40);assert.deepEqual(near,START);
});
