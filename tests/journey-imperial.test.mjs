import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {makeJourneyWorld} from '../journey-world.js';
import {IMPERIAL_SITES,IMPERIAL_NPCS,IMPERIAL_VISTAS,IMPERIAL_ZONES,IMPERIAL_BLOCKED,imperialResponse,imperialPhase,basinChannel,imperialWalkableFloor,imperialOutlook,createImperialListening} from '../journey-imperial.js';
import {IMPERIAL_VISTA_KINDS} from '../journey-imperial-art.js';
import {JOURNEY_PLAYLISTS,pickJourneyTrack,createJourneyMusicDirector} from '../journey-music.js';
import {journeySoundSources} from '../journey-curios.js';
import {MUSIC_LIBRARY,buildTrack} from '../music.js';
import {journeyCameraScene,JOURNEY_CAMERA_PROFILES} from '../journey-camera.js';

test('the old 176x136 country is bit-for-bit intact except three new physical bridge cells',()=>{
 const w=makeJourneyWorld(),old=w.tiles.slice(0,136).map(r=>r.slice(0,176));
 for(const x of [173,174,175]){assert.equal(w.tileAt(x,72),'+');old[72][x]='~';}
 assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),'714da71144515a105265470612456c4727c00da52bc98a8fca2756a5aec75523');
 assert.deepEqual([w.w,w.h,w.start.x,w.start.y],[320,192,19,70]);
});
test('all study destinations have legal outward and return walks, without moving authored speakers',()=>{
 const original=IMPERIAL_NPCS.map(n=>({id:n.id,x:n.x,y:n.y})),w=makeJourneyWorld();
 assert.deepEqual(IMPERIAL_NPCS.map(n=>({id:n.id,x:n.x,y:n.y})),original);
 for(const p of [...IMPERIAL_SITES.map(s=>({...s.entrance,id:s.id})),...IMPERIAL_NPCS,...IMPERIAL_VISTAS,...IMPERIAL_ZONES.map(z=>({x:z.cx,y:z.cy,id:z.id}))]){
  for(const [from,to] of [[w.start,p],[p,w.start]]){
   const path=w.findPath(w,from,to);assert.ok(path?.length,p.id);
   for(let i=0;i<path.length;i++){
    assert.ok(w.walkable(path[i].x,path[i].y),p.id+' water/wall');
    if(i)assert.equal(Math.abs(path[i].x-path[i-1].x)+Math.abs(path[i].y-path[i-1].y),1);
   }
  }
 }
 assert.ok(w.findPath(w,w.start,{x:293,y:76}).length>300,'the imperial remains require a journey');
});
test('paired temple plans preserve corresponding shapes while water hides only one basin floor',()=>{
 const w=makeJourneyWorld(),wet=IMPERIAL_SITES.find(s=>s.form==='receiving-wet'),dry=IMPERIAL_SITES.find(s=>s.form==='receiving-dry');
 assert.deepEqual([wet.w,wet.h,wet.y],[dry.w,dry.h,dry.y]);assert.equal(dry.x-wet.x,40);
 let visibleWater=0,dryBed=0;
 for(let dy=-16;dy<=15;dy++)for(let dx=-10;dx<=10;dx++)if(basinChannel(dx,dy)){
  const a=w.tileAt(222+dx,127+dy),b=w.tileAt(262+dx,127+dy);
  if(a==='study-water'){visibleWater++;assert.equal(w.walkable(222+dx,127+dy),false);}
  if(b==='study-channel'){dryBed++;assert.ok(w.walkable(262+dx,127+dy),'the exposed channel floor can be explored');};
 }
 assert.ok(visibleWater>120&&dryBed>120);
 for(const s of IMPERIAL_SITES)for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)assert.notEqual(w.tileAt(x,y),'~',s.id+' offshore');
});
test('finite obstacles, the gate opening and multiple cross-country paths are real terrain',()=>{
 const w=makeJourneyWorld();
 for(const type of IMPERIAL_BLOCKED){let count=0;for(let y=16;y<180;y++)for(let x=181;x<314;x++)if(w.tileAt(x,y)===type){count++;assert.equal(w.walkable(x,y),false);}assert.ok(count>0,type);}
 assert.equal(w.walkable(283,67),false,'solid gate buttress');assert.equal(w.walkable(289,67),true,'gate opening');
 const noInner={...w,walkable:(x,y)=>w.walkable(x,y)&&!(x===222&&y>=53&&y<=64)};
 assert.ok(w.findPath(noInner,w.start,{x:293,y:76}),'outer road still reaches the city');
 assert.equal(w.walkable(81,52),false,'the original lake remains water');
});
test('all new regions have contrasting valid scores and a steady outdoor camera',()=>{
 const w=makeJourneyWorld();
 for(const z of IMPERIAL_ZONES){
  assert.equal(w.zoneAt(z.cx,z.cy).id,z.id);assert.equal(JOURNEY_CAMERA_PROFILES[z.id],.8);
  assert.ok(JOURNEY_PLAYLISTS[z.id].length>=3);
  for(const key of JOURNEY_PLAYLISTS[z.id]){const [i,phase]=key.split(':').map(Number);assert.ok(MUSIC_LIBRARY[i]);assert.ok(buildTrack(i,phase).events.length>200);}
  assert.equal(JOURNEY_CAMERA_PROFILES[journeyCameraScene(w,{px:z.cx,py:z.cy})],.8);
 }
 assert.notDeepEqual(JOURNEY_PLAYLISTS['journey-living-water'],JOURNEY_PLAYLISTS['journey-dry-water']);
 for(const v of IMPERIAL_VISTAS)assert.ok(IMPERIAL_VISTA_KINDS.has(v.kind));
 const sources=journeySoundSources(w.sites).filter(s=>s.id.startsWith('journey-imperial-'));
 assert.equal(sources.length,8);
 assert.ok(!sources.some(s=>s.id.endsWith('closed-temple')),'the closed temple has no repeated ambient cue');
});
test('small investigative responses change only local art state, never terrain or saves',()=>{
 const s=IMPERIAL_SITES.find(s=>s.form==='confluence'),w=makeJourneyWorld(),before=JSON.stringify(w.tiles);
 const first=imperialResponse(s),next=imperialResponse(s);assert.notEqual(first,next);assert.ok(imperialPhase(s.id)>=2);
 assert.equal(imperialResponse(IMPERIAL_SITES.find(s=>s.form==='acropolis')),null);
 assert.equal(JSON.stringify(w.tiles),before);
});

test('temple walks enter open courts, cross water on bridges, and stop at the sealed wall',()=>{
 const w=makeJourneyWorld();
 for(const [x,y] of [[196,79],[222,129],[262,129]]){
  assert.ok(w.walkable(x,y),'open interior '+[x,y]);
  assert.ok(w.findPath(w,w.start,{x,y}));
 }
 assert.equal(w.walkable(253,65),false,'the closed building stays physically closed');
 for(const cx of [222,262]){
  assert.equal(w.walkable(cx-4,127),false,'a column row is not traversable');
  const path=w.findPath(w,{x:cx,y:145},{x:cx,y:129});assert.ok(path);
  if(cx===222)assert.ok(path.some(p=>w.tileAt(p.x,p.y)==='+'),'wet approach crosses a bridge');
 }
 assert.equal(w.walkable(252,115),true,'the exposed stair landing remains usable');
});

test('the ridge has a real folded pass and two distinct legal approaches to the city',()=>{
 const w=makeJourneyWorld();
 assert.equal(w.walkable(276,43),false,'ridge hides the northern shortcut');
 assert.ok(w.walkable(276,57),'the folded ridge has a dry notch');
 const from={x:269,y:43},to={x:289,y:71},path=w.findPath(w,from,to);
 assert.ok(path.some(p=>p.x>=275&&p.x<=277&&p.y>=55&&p.y<=59),'the near approach passes the notch');
 const south={...w,walkable:(x,y)=>w.walkable(x,y)&&!(x>=275&&x<=277&&y>=55&&y<=59)};
 assert.ok(w.findPath(south,{x:262,y:145},to),'southern city approach stays open');
});

test('distant city glimpses grow at authored lookouts and disappear behind the ridge',()=>{
 assert.ok(imperialOutlook(269,43).scale<imperialOutlook(273,57).scale);
 assert.equal(imperialOutlook(253,68),null);
 assert.equal(imperialOutlook(262,32),null);
 assert.equal(imperialOutlook(276,43),null);
});

test('temple listening holds silence across its edge and resumes outside, without changing settings',()=>{
 const d=createImperialListening();
 assert.equal(d.update(253,76),false);
 assert.equal(d.update(253,70),true);
 assert.equal(d.update(253,73),true);
 assert.equal(d.update(253,76),false);
 const keys=['journey-living-water','journey-dry-water','journey-empty-ridge','journey-imperial-remains'];
 const tracks=keys.map(k=>pickJourneyTrack(k,'0:1',()=>.999));
 assert.deepEqual(tracks,keys.map(k=>JOURNEY_PLAYLISTS[k][0]));
 assert.equal(tracks[0].split(':')[0],tracks[1].split(':')[0],'paired melody');
 assert.notEqual(tracks[0],tracks[1],'different arrangement');
 const music=createJourneyMusicDirector();
 music.update(keys[0],0);assert.equal(music.update(keys[1],1000),null);
 assert.equal(music.update(keys[1],11999),null);
 assert.equal(music.update(keys[1],12000),keys[1],'no immediate border change or lost eventual change');
});

test('touching an open temple floor means walking, while pillars and sealed walls mean investigation',()=>{
 const w=makeJourneyWorld(),wet=IMPERIAL_SITES.find(s=>s.form==='receiving-wet');
 assert.equal(imperialWalkableFloor(w,wet,{x:222,y:129}),true);
 assert.equal(imperialWalkableFloor(w,wet,{x:218,y:129}),false);
 assert.equal(imperialWalkableFloor(w,wet,{x:19,y:70}),false,'unrelated ground is outside this floor');
 assert.equal(imperialWalkableFloor(w,IMPERIAL_SITES.find(s=>s.form==='sealed'),{x:253,y:65}),false);
});
