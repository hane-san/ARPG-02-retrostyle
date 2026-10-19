import test from 'node:test';
import assert from 'node:assert/strict';
import {makeWorld,findPath,START} from '../world.js';
import {
 makePrototypeWorld,PROTOTYPE_WIDTH,PROTOTYPE_HEIGHT,
 PROTOTYPE_SITE_IDS,PROTOTYPE_NPC_IDS
} from '../prototype-world.js';

test('small journey exposes exactly two regions, four landmarks and four NPCs',()=>{
 const world=makePrototypeWorld();
 assert.equal(world.w,80);
 assert.equal(world.h,110);
 assert.equal(world.w,PROTOTYPE_WIDTH);
 assert.equal(world.h,PROTOTYPE_HEIGHT);
 assert.deepEqual(world.zones.map(z=>z.id),['garden','harbour']);
 assert.deepEqual(world.sites.map(s=>s.id),PROTOTYPE_SITE_IDS);
 assert.deepEqual(world.npcs.map(n=>n.id),PROTOTYPE_NPC_IDS);
 assert.deepEqual(world.bridges.map(b=>b.id),['oldnorth']);
 assert.deepEqual(world.transitions,[]);
 assert.equal(world.transitionAt(45,40),undefined);
 assert.ok(world.walkable(START.x,START.y));
 assert.equal(world.walkable(80,40),false);
 assert.equal(world.walkable(41,110),false);
 assert.equal(world.walkable(-1,40),false);
 assert.equal(world.zoneAt(41,40).id,'garden');
 assert.equal(world.zoneAt(41,89).id,'harbour');
});

test('each landmark is reachable without crossing water, structures or cropped edges',()=>{
 const world=makePrototypeWorld();
 for(const site of world.sites){
  const path=findPath(world,START,site.entrance);
  assert.ok(path?.length>1,site.id+' must be reachable');
  assert.deepEqual(path[0],START);
  assert.deepEqual(path[path.length-1],site.entrance);
  for(let i=0;i<path.length;i++){
   const p=path[i];
   assert.ok(world.walkable(p.x,p.y),site.id+' path blocked at '+JSON.stringify(p));
   assert.ok(p.x<world.w&&p.y<world.h,site.id+' path left crop');
   if(i>0){
    const last=path[i-1];
    assert.equal(Math.abs(last.x-p.x)+Math.abs(last.y-p.y),1,site.id+' path must stay orthogonal');
   }
  }
 }
 const across=findPath(world,START,{x:41,y:90});
 assert.ok(across?.some(p=>world.bridgeAt(p.x,p.y)?.id==='oldnorth'),
  'travelling from forest to old port should cross the original bridge');
});

test('hidden landmarks do not leave invisible colliders, and original world is unchanged',()=>{
 const world=makePrototypeWorld();
 assert.equal(world.siteAt(50,20),undefined,'unselected castle is not a visible landmark');
 assert.ok(world.walkable(50,20),'the unselected castle must not leave invisible walls');
 assert.equal(world.siteAt(17,100),undefined,'unselected dock is no longer a landmark');
 assert.ok(world.walkable(17,100),'unselected dock should not leave invisible walls');
 const original=makeWorld();
 assert.equal(original.w,164);
 assert.equal(original.h,120);
 assert.equal(original.sites.length,12);
 assert.equal(original.npcs.length,13);
 assert.equal(original.transitions.length,2);
 assert.ok(original.siteAt(50,20),'the main-world castle still exists');
 assert.ok(original.transitionAt(45,40),'the mainland bridge still works in normal mode');
});
