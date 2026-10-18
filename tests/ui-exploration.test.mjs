import {test} from 'node:test';
import assert from 'node:assert/strict';
import {limitCamera,heroVisible} from '../camera-limits.js';
import {ZONE_PLAYLISTS,pickZoneTrack} from '../zone-music.js';
import {MUSIC_LIBRARY} from '../music.js';
import {NPCS,SITES,W,H,TILE,START} from '../world.js';
import {TALK,SITE_ASIDES} from '../dialogue-data.js';

const world={width:W*TILE,height:H*TILE,tile:TILE};
const viewport={width:390,height:640,zoom:1.25};
const hero={x:START.x,y:START.y};
const centered={x:(hero.x+.5)*TILE,y:(hero.y+.5)*TILE};
test('camera stays motionless while the player walks within the viewport',()=>{
 const moved={x:hero.x+2,y:hero.y+3};
 assert.deepEqual(limitCamera(centered,moved,viewport,world),centered);
});
test('the user can pan only until the avatar barely remains visible',()=>{
 const far={x:world.width*10,y:-world.height*10};
 const bounded=limitCamera(far,hero,viewport,world);
 assert.ok(heroVisible(bounded,hero,viewport,world));
 assert.ok(Math.abs(bounded.x-centered.x)<=viewport.width/(2*viewport.zoom));
 assert.ok(Math.abs(bounded.y-centered.y)<=viewport.height/(2*viewport.zoom));
 assert.ok(bounded.x>=viewport.width/(2*viewport.zoom));
 assert.ok(bounded.x<=world.width-viewport.width/(2*viewport.zoom));
});
test('camera moves only enough to keep player visible when walking beyond the edge',()=>{
 const distant={x:hero.x+10,y:hero.y+11};
 const adjusted=limitCamera(centered,distant,viewport,world);
 assert.ok(adjusted.x>centered.x&&adjusted.y>centered.y);
 assert.ok(heroVisible(adjusted,distant,viewport,world));
 const mid=limitCamera(adjusted,{x:distant.x+1,y:distant.y},viewport,world);
 assert.ok(heroVisible(mid,{x:distant.x+1,y:distant.y},viewport,world));
});
test('camera respects map bounds at different zooms and the map corners',()=>{
 for(const zoom of [.66,1,1.25,2.5]){
  const v={...viewport,zoom};
  for(const h of [{x:0,y:0},{x:W-1,y:0},{x:0,y:H-1},{x:W-1,y:H-1}]){
   const bounded=limitCamera({x:-1e9,y:1e9},h,v,world);
   assert.ok(heroVisible(bounded,h,v,world),'hero hidden at '+JSON.stringify({zoom,h}));
   assert.ok(bounded.x>=v.width/(2*zoom)&&bounded.x<=world.width-v.width/(2*zoom));
   assert.ok(bounded.y>=v.height/(2*zoom)&&bounded.y<=world.height-v.height/(2*zoom));
  }
 }
});
test('zone entry selects valid atmospheric songs without repeating previous choice',()=>{
 assert.deepEqual(Object.keys(ZONE_PLAYLISTS).sort(),['future','garden','harbour','neon']);
 for(const [area,pool] of Object.entries(ZONE_PLAYLISTS)){
  assert.ok(pool.length>=6,area+' too few options');
  assert.equal(new Set(pool).size,pool.length);
  for(const song of pool){
   const [score,phase]=song.split(':').map(Number);
   assert.ok(score>=0&&score<MUSIC_LIBRARY.length,'invalid index '+song);
   assert.ok([1,2].includes(phase),'invalid phase '+song);
   for(const roll of [0,.13,.51,.99999]){
    const picked=pickZoneTrack(area,song,()=>roll);
    assert.ok(pool.includes(picked),'out of zone playlist '+picked);
    assert.notEqual(picked,song,'same track repeated');
   }
  }
 }
});
test('every NPC has a multi-part conversation and every building a reflection',()=>{
 for(const n of NPCS){
  assert.ok(TALK[n.id]?.length>=4,'missing dialogue '+n.id);
  assert.ok(TALK[n.id].every(line=>typeof line==='string'&&line.length>=8));
 }
 for(const site of SITES)assert.ok(SITE_ASIDES[site.id]?.length>=20,'missing site aside '+site.id);
});
