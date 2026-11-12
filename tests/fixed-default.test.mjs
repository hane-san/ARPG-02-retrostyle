import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeFixedRooms,createFixedJourney,gatePoint,FIXED_DIRECTIONS,FIXED_START} from '../fixed-screens.js';
import {FIXED_AREAS,fixedAreaAt,createAreaPlaylists,areaPieceSeconds,FIXED_AREA_HOLD_SECONDS} from '../fixed-areas.js';
import {featureAt} from '../fixed-features.js';
import {surroundingKind,keepsCliffFaces} from '../fixed-backdrop.js';
import {resolveGameMode,useFixedDefault} from '../game-mode.js';
import {MUSIC_LIBRARY,buildTrack} from '../music.js';

// Producer decision 2026-11-12 (see docs/FIXED-DEFAULT-AREAS.md).
test('the screen-switching journey is the default entrance; every connected-world URL still opens that world',()=>{
 for(const q of ['','?','?other=value'])assert.equal(useFixedDefault(q),true,q);
 for(const q of ['?walk=1','?journey=1','?atlas=previous','?maze=turns','?camera=directional','?camera=deadzone','?mode=classic','?journey=0','?prototype=1'])assert.equal(useFixedDefault(q),false,q);
 assert.equal(resolveGameMode('?walk=1'),'journey');
 const game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 assert.match(game,/if\(FIXED_DEFAULT\)enterFixed\(\);requestAnimationFrame\(animate\)/,'the default enters after the connected world is ready underneath');
 assert.match(game,/\['\.\/\?walk=1','落ち着いた追従（標準）',true\]/,'the connected camera link keeps opening the connected world');
});
test('twenty areas partition all hundred boards into connected neighbourhoods',()=>{
 const rooms=makeFixedRooms(),seen=new Set();
 assert.equal(FIXED_AREAS.length,20);
 for(const a of FIXED_AREAS){
  assert.ok(a.boards.length>=2,a.id);assert.ok(a.name.length>=4,a.id);
  for(const [x,y] of a.boards){const k=x+','+y;assert.ok(!seen.has(k),'board in one area only '+k);seen.add(k);assert.equal(fixedAreaAt(x,y),a);}
  // Each area is one connected piece of the 10 x 10 chart.
  const set=new Set(a.boards.map(b=>b.join(','))),q=[a.boards[0]],reach=new Set([a.boards[0].join(',')]);
  for(let i=0;i<q.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(q[i][0]+dx)+','+(q[i][1]+dy);if(set.has(k)&&!reach.has(k)){reach.add(k);q.push([q[i][0]+dx,q[i][1]+dy]);}}
  assert.equal(reach.size,set.size,'contiguous '+a.id);
 }
 assert.equal(seen.size,100);
 for(const r of rooms){assert.equal(r.area,fixedAreaAt(r.col,r.row).id);assert.equal(r.areaName,fixedAreaAt(r.col,r.row).name);}
});
test('area playlists re-place the whole library, keep every piece real, and only rotate after long listening',()=>{
 const all=FIXED_AREAS.flatMap(a=>a.playlist);
 for(const cue of all){const [id,phase]=cue.split(':').map(Number);assert.ok(MUSIC_LIBRARY[id]?.[phase===1?'ally':'hostile'],cue);}
 assert.equal(new Set(all).size,MUSIC_LIBRARY.length*2,'all 110 pieces are placed in the field');
 for(const a of FIXED_AREAS){assert.ok(a.playlist.length>=4,a.id);assert.equal(new Set(a.playlist).size,a.playlist.length,a.id);}
 const lists=createAreaPlaylists(),a=FIXED_AREAS[0];
 assert.equal(lists.cue(a.id),a.playlist[0]);for(let i=1;i<=a.playlist.length;i++)assert.equal(lists.advance(a.id),a.playlist[i%a.playlist.length]);
 lists.reset();assert.equal(lists.cue(a.id),a.playlist[0]);
 for(const cue of all){const [id,phase]=cue.split(':').map(Number),loop=buildTrack(id,phase).seconds;assert.ok(areaPieceSeconds(loop)>=Math.max(FIXED_AREA_HOLD_SECONDS,loop*2));}
});
test('walking between boards of one area never changes the piece; crossing an area edge does',()=>{
 const rooms=makeFixedRooms();let inside=0,across=0;
 for(const r of rooms)for(const id of Object.values(r.connections)){const to=rooms.find(b=>b.id===id);if(to.area===r.area){inside++;assert.equal(to.cue,r.cue);}else{across++;assert.notEqual(to.playlist,r.playlist);}}
 assert.ok(inside>60&&across>40);
 const view=readFileSync(new URL('../fixed-screen-view.js',import.meta.url),'utf8');
 assert.match(view,/const areaCue=r=>playlists\.cue\(r\.area\)\|\|r\.cue;/);
 assert.match(view,/if\(!state\.active\|\|state\.transition\|\|paused\(\)\|\|lastQuiet\|\|!listening\(\)\|\|!lastArea\)return;/,'rotation waits for real listening and never runs during a slide or silence');
});
test('playful landforms are physical, keep every lane, doorstep and person reachable, and stay off the authored originals',()=>{
 const rooms=makeFixedRooms();const kinds=new Set();let glints=0,signs=0,stones=0;
 for(const r of rooms){
  if(r.sourceIndex===undefined||['watershed-wheel','white-flower-road','cairn-turn','sealed-court'].includes(r.id)){assert.deepEqual(r.features,[],r.id);continue;}
  for(const f of r.features){kinds.add(f.kind);
   for(const [x,y] of f.cells){assert.ok(x>=2&&x<=12&&y>=2&&y<=12,'interior only '+r.id);if(f.kind!=='lilies')for(const s of [r.site,...r.props].filter(Boolean))assert.ok(!(x>=Math.floor(s.x)-1&&x<Math.ceil(s.x+s.w)+1&&y>=Math.floor(s.y)-1&&y<Math.ceil(s.y+s.h)+1),'clear of '+s.name+' in '+r.id);}
   if(['bush','boulder','cairn','stump','sign'].includes(f.kind))for(const [x,y] of f.cells){assert.equal(r.walkable(x,y),false,r.id+' solid '+f.kind);assert.equal(r.tileAt(x,y),'o','a landform never poses as a building foot');}
   if(f.kind==='pond')for(const [x,y] of f.cells)assert.equal(r.tileAt(x,y),'w');
   if(f.kind==='stones'){stones++;for(const [x,y] of f.cells){assert.equal(r.tileAt(x,y),'k');assert.ok(r.walkable(x,y));}}
   if(f.kind==='glint'){glints++;assert.ok(r.walkable(f.x,f.y),r.id+' glint is stepped onto');assert.equal(featureAt(r,f.x,f.y),f);assert.ok(f.lines[0].length>8);assert.equal(r.gateAt(f.x,f.y),null);}
   if(f.kind==='sign'){signs++;const names=Object.values(r.connections).map(id=>rooms.find(b=>b.id===id).chartName);assert.ok(names.some(n=>f.lines[0].includes(n)),'the sign names a real exit '+r.id);const [x,y]=f.cells[0];assert.ok([[0,1],[1,0],[-1,0],[0,-1]].some(([dx,dy])=>r.walkable(x+dx,y+dy)),'readable from a floor cell');}
  }
 }
 for(const k of ['bush','boulder','cairn','stump','sign','stones','glint','pond','reeds'])assert.ok(kinds.has(k),'variety includes '+k);
 assert.ok(glints>=80&&signs>=30&&stones>=6);
});
test('every board can still be walked through all its exits after the landforms (state machine walk)',()=>{
 const s=createFixedJourney();s.enter();const seen=new Set();
 function visit(){seen.add(s.room.id);for(const [d,id] of Object.entries(s.room.connections)){if(seen.has(id))continue;const back=s.room.id;cross(d,id);visit();cross(FIXED_DIRECTIONS[d].back,back);}}
 function cross(d,id){assert.ok(s.walkTo(gatePoint(d,s.room)),s.room.id+' '+d);for(let i=0;i<2000&&s.room.id!==id;i++)s.update(.016,{reduced:true});assert.equal(s.room.id,id);}
 visit();assert.equal(seen.size,100);assert.equal(s.room.id,FIXED_START.room);
});
test('surroundings follow the land and cliff faces stay only where a drop is natural',()=>{
 const rooms=makeFixedRooms(),by=id=>rooms.find(r=>r.id===id);
 assert.equal(surroundingKind(by('forest-picnic')),'canopy');assert.equal(surroundingKind(by('fog-coast')),'sea');assert.equal(surroundingKind(by('reeds-sunset')),'marsh');
 assert.equal(surroundingKind(by('mint-terraces')),'fields');assert.equal(surroundingKind(by('white-steppe')),'saltflat');assert.equal(surroundingKind(by('answer-wall')),'paving');
 assert.ok(['scree','snowscree'].includes(surroundingKind(by('glacier-rest'))));
 assert.equal(keepsCliffFaces(by('glacier-rest')),true);assert.equal(keepsCliffFaces(by('forest-picnic')),false);assert.equal(keepsCliffFaces(by('azure-plain')),true);
});
