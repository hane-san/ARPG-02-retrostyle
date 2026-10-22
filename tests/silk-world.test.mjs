import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeWorld,findPath,START,BRIDGES} from '../world.js';
import {makeSilkWorld,silkPath,SILK_W,SILK_H,SILK_START,SILK_ZONES,LAKE} from '../silk-world.js';
import {SILK_TALK,SILK_ASIDES} from '../silk-dialogue.js';
import {SILK_SCORES} from '../silk-music.js';
import {ZONE_PLAYLISTS,pickZoneTrack} from '../zone-music.js';
import {limitCamera,easeEdgeCamera,heroVisible} from '../camera-limits.js';

const silk=makeSilkWorld(),tidal=makeWorld();
test('Starwind is a broad standalone continent and two bridges provide return trips',()=>{
 assert.equal(silk.w,SILK_W);assert.equal(silk.h,SILK_H);
 assert.ok(silk.w>400&&silk.h>=260);
 assert.ok(silk.walkable(SILK_START.x,SILK_START.y));
 const out=tidal.transitions[0],back=silk.transitions[0];
 assert.equal(out.target,'silk');assert.equal(back.target,'tidal');
 assert.ok(tidal.walkable(out.x,out.y));
 assert.ok(silk.walkable(back.x,back.y));
 assert.ok(silk.walkable(out.spawn.x,out.spawn.y));
 assert.ok(tidal.walkable(back.spawn.x,back.spawn.y));
 assert.ok(findPath(tidal,START,{x:out.x,y:out.y})?.length>25);
 const nearby=tidal.transitions.find(p=>p.x===45&&p.y===40);
 assert.ok(nearby,'a portal must be visible from the starting garden');
 assert.ok(tidal.walkable(nearby.x,nearby.y));
 const shortcut=findPath(tidal,START,{x:nearby.x,y:nearby.y});
 assert.ok(shortcut&&shortcut.length<=7,'the shortcut should be only a few steps away');
 assert.equal(nearby.target,'silk');
 assert.ok(silk.walkable(nearby.spawn.x,nearby.spawn.y));
 assert.ok(silkPath(silk,SILK_START,{x:back.x,y:back.y})?.length>8);
 assert.ok(BRIDGES.some(b=>b.id==='starwind'));
 assert.ok(BRIDGES.some(b=>b.id==='starwind-near'));
});
test('enormous Issyk-Kul-inspired lake cannot fit onscreen even at widest zoom',()=>{
 assert.ok(LAKE.rx*2>=180);
 assert.ok(LAKE.ry*2>=100);
 // The largest on-screen field at zoom 0.66 is still a tiny fraction of lake.
 const lakePixelWidth=LAKE.rx*2*32*.66,lakePixelHeight=LAKE.ry*2*32*.66;
 assert.ok(lakePixelWidth>390*5);
 assert.ok(lakePixelHeight>640*3);
 assert.equal(silk.walkable(LAKE.cx,LAKE.cy),false);
 assert.ok(['L','l'].includes(silk.tileAt(LAKE.cx,LAKE.cy)));
});
test('all nine landscapes have original regional music',()=>{
 assert.equal(SILK_ZONES.length,9);
 assert.equal(SILK_SCORES.length,9);
 assert.equal(new Set(SILK_ZONES.map(z=>z.id)).size,9);
 for(const zone of SILK_ZONES){
  const playlist=ZONE_PLAYLISTS[zone.id];
  assert.ok(playlist?.length>=6,zone.id);
  assert.ok(playlist.some(s=>Number(s.split(':')[0])>=25),zone.id);
  assert.notEqual(pickZoneTrack(zone.id,playlist[0],()=>0),playlist[0]);
 }
});
test('all 12 landmark entrances and 12 villagers have paths through the continent',()=>{
 assert.equal(silk.sites.length,12);assert.equal(silk.npcs.length,12);
 for(const site of silk.sites){
  assert.ok(silk.walkable(site.entrance.x,site.entrance.y),site.id+' entrance blocked');
  assert.equal(silk.siteAt(site.x,site.y)?.id,site.id);
  assert.ok(SILK_ASIDES[site.id]?.length>12,site.id+' aside missing');
  const route=silkPath(silk,SILK_START,site.entrance);
  assert.ok(route?.length>0,site.id+' disconnected from arrival bridge');
 }
 for(const person of silk.npcs){
  assert.ok(silk.walkable(person.x,person.y),person.name+' inaccessible');
  assert.equal(SILK_TALK[person.id]?.length,4);
  assert.ok(silkPath(silk,SILK_START,person)?.length>0,'no route to '+person.name);
 }
});
test('slow camera keeps protagonist on-screen with original gentle easing',()=>{
 const vp={width:390,height:620,zoom:1.25},area={width:SILK_W*32,height:SILK_H*32,tile:32};
 const player={x:35,y:160};
 const initial={x:(player.x+.5)*32,y:(player.y+.5)*32};
 assert.deepEqual(easeEdgeCamera(initial,{x:player.x+1,y:player.y},vp,area,.016),initial);
 const moved={x:player.x+7,y:player.y+7};
 let pos=initial;
 for(let i=0;i<80;i++){
  pos=easeEdgeCamera(pos,moved,vp,area,.016);
  assert.ok(heroVisible(pos,moved,vp,area));
 }
 const ideal=limitCamera(pos,moved,vp,area,2.15);
 assert.ok(Math.abs(pos.x-ideal.x)<10);
});
test('browser runtime switches full world metadata, routes and renders art',()=>{
 const game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 assert.match(game,/function switchWorld\(/);
 assert.match(game,/worlds\.silk=makeSilkWorld\(/);
 assert.match(game,/currentWorldId==='silk'\?silkPath/);
 assert.match(game,/drawSilkTile/);
 assert.match(game,/drawSilkSite/);
 assert.match(game,/world\.transitionAt\?\./);
 assert.match(game,/Math\.min\(dt,0\.08\)\*hero\.speed/);
 assert.match(game,/easeEdgeCamera/);
 assert.match(game,/PAN_SENSITIVITY/);
});
