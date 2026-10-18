import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeWorld,findPath,START,BRIDGES,SITES} from '../world.js';
import {SCENIC_PATCHES,VARIANT_TILES,scenicTile} from '../scenic-biomes.js';
import {MUSIC_SCHEDULER,MUSIC_TRANSITION} from '../music.js';

const world=makeWorld();
test('16 coherent scenic pockets span four walkable island districts',()=>{
 assert.equal(SCENIC_PATCHES.length,16);
 for(const zone of ['garden','future','harbour','neon'])
  assert.equal(SCENIC_PATCHES.filter(p=>p.zone===zone).length,4);
 const counts=new Map([...VARIANT_TILES].map(tile=>[tile,0]));
 for(let y=0;y<world.h;y++)for(let x=0;x<world.w;x++){
  const tile=world.tileAt(x,y);
  if(counts.has(tile)){counts.set(tile,counts.get(tile)+1);assert.ok(world.walkable(x,y)||world.siteAt(x,y),'scenery introduced an invisible blocker');}
 }
 for(const [tile,count] of counts)assert.ok(count>30,tile+' is barely visible: '+count);
 for(const patch of SCENIC_PATCHES)assert.equal(scenicTile(patch.zone,patch.x,patch.y),patch.tile);
});
test('scenery edits cannot block any existing building entrance or bridge',()=>{
 for(const b of BRIDGES){
  assert.ok(world.walkable(b.center.x,b.center.y));
  assert.ok(findPath(world,START,b.center)?.length>2);
 }
 for(const s of SITES){
  assert.ok(world.walkable(s.entrance.x,s.entrance.y));
  assert.ok(findPath(world,START,s.entrance)?.length>2);
 }
});
test('BGM prepares enough ahead for mobile main-thread stalls without forced silence',()=>{
 assert.ok(MUSIC_SCHEDULER.lookAheadSeconds>=.6);
 assert.ok(MUSIC_SCHEDULER.lookAheadSeconds<2);
 assert.ok(MUSIC_SCHEDULER.intervalMs<=60);
 assert.equal(MUSIC_TRANSITION.silence,0);
 assert.ok(MUSIC_TRANSITION.fade>=.12);
});
test('walking uses quiet footfalls and zoom is locked across all input methods',()=>{
 const game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 const sound=readFileSync(new URL('../audio.js',import.meta.url),'utf8');
 assert.match(game,/6\.15/);
 assert.match(game,/sfx\.play\('soft-step'\)/);
 assert.match(sound,/else if\(kind==='soft-step'\)/);
 assert.match(game,/if\(hero\.path\.length\)return false/);
 assert.match(game,/syncZoomControls\(\)/);
 assert.doesNotMatch(game,/歩先|あと何歩/);
});
