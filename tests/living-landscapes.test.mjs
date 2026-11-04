import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {useComposedCamera} from '../game-mode.js';
import {makePilgrimageWorld,pilgrimCameraScene} from '../pilgrimage-world.js';
import {SOUTHEAST_STUDIES,SOUTHEAST_SITES,SOUTHEAST_NPCS,SOUTHEAST_WALKS} from '../southeast-world.js';
import {MUSIC_LIBRARY,buildTrack} from '../music.js';
import {pickJourneyArrivalTrack} from '../journey-music.js';
import {pilgrimMaterial} from '../pilgrimage-ground.js';
const w=makePilgrimageWorld(),hash=s=>createHash('sha256').update(s).digest('hex');
test('the adopted composed follower is the default, retaining the named former camera and all old modes',()=>{
 for(const q of ['', '?journey=1','?camera=deadzone','?camera=unknown'])assert.equal(useComposedCamera(q),true,q);
 for(const q of ['?camera=directional','?mode=classic','?prototype=1','?atlas=previous','?maze=turns'])assert.equal(useComposedCamera(q),false,q);
});
test('the four southeast countries have real land, separate cues and reachable sites and people',()=>{
 assert.equal(w.zones.length,33);assert.equal(SOUTHEAST_SITES.length,10);assert.equal(SOUTHEAST_NPCS.length,6);
 for(const z of SOUTHEAST_STUDIES){assert.equal(w.zoneAt(z.cx,z.cy).id,z.id);assert.equal(pickJourneyArrivalTrack(z.id),z.music[0]);assert.ok(w.findPath(w,w.start,{x:z.cx,y:z.cy})?.length);assert.equal(pilgrimCameraScene(w,{px:z.cx,py:z.cy}),z.cameraScene||'journey-road');}
 for(const s of SOUTHEAST_SITES){assert.ok(w.findPath(w,w.start,s.entrance)?.length,s.id);for(const r of s.solid)for(let y=s.y+r.y;y<s.y+r.y+r.h;y++)for(let x=s.x+r.x;x<s.x+r.x+r.w;x++)assert.equal(w.walkable(x,y),false,s.id+' physical foot');}
 for(const n of SOUTHEAST_NPCS)assert.ok(w.findPath(w,w.start,n)?.length,n.id);
});
test('every authored bridge and bend has a legal orthogonal connection; no water is walkable',()=>{
 for(const r of SOUTHEAST_WALKS)for(let i=1;i<r.points.length;i++){const [x,y]=r.points[i-1],[a,b]=r.points[i],p=w.findPath(w,{x,y},{x:a,y:b});assert.ok(p?.length,JSON.stringify(r));for(let n=1;n<p.length;n++)assert.equal(Math.abs(p[n].x-p[n-1].x)+Math.abs(p[n].y-p[n-1].y),1);}
 const counts={};for(let y=288;y<w.h;y++)for(let x=242;x<w.w;x++){const t=w.tileAt(x,y);counts[t]=(counts[t]||0)+1;if(['L','se-wall'].includes(t))assert.equal(w.walkable(x,y),false);}
 assert.ok(counts.L>5000&&counts['se-boardwalk']>250&&counts['se-stonebridge']>80);
 assert.equal(pilgrimMaterial({...w,tileAt:()=> 'se-boardwalk'},410,506),'wood');assert.equal(pilgrimMaterial({...w,tileAt:()=> 'se-stonebridge'},405,779),'stone');
});
test('the landscape no longer has one-cell soil hooks and natural objects never constrict roads',()=>{
 for(let y=288;y<w.h-1;y++)for(let x=1;x<w.w-1;x++)if(w.walkable(x,y)&&['west-ground','se-ground'].includes(w.tileAt(x,y))){const exits=[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([a,b])=>w.walkable(a,b)).length;assert.ok(exits>=2,`soil hook ${x},${y}`);}
 assert.ok(w.landscapeObjects.length>300);for(const d of w.landscapeObjects.filter(d=>d.solid)){assert.equal(w.walkable(d.x,d.y),false);assert.ok(['se-ground','west-ground'].includes(w.tileAt(d.x,d.y)));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)assert.ok(w.walkable(d.x+dx,d.y+dy),'room around a solid prop');}
});
test('all previous 102 pieces retain exact score data and event output; four new pieces have separate musical identities',()=>{
 // main 3641c15, before #108. This also protects the first 12 western pieces.
 assert.equal(hash(JSON.stringify(MUSIC_LIBRARY.slice(0,51))),'086c3f82b2fd40be65d54bc959eb96c72ec4223ca4d9725415f2d13c4395d806');
 assert.equal(hash(JSON.stringify(Array.from({length:51},(_,i)=>[buildTrack(i,1),buildTrack(i,2)]))),'9e1f4cb2616be41bb3a4d81e87affb56723999f91282084dbe001f24285afc43');
 assert.equal(MUSIC_LIBRARY.length*2,110);const identities=new Set();for(const id of [51,52])for(const phase of [1,2]){const t=buildTrack(id,phase),p=MUSIC_LIBRARY[id][phase===1?'ally':'hostile'];assert.ok(t.seconds>=60&&t.seconds<=120);assert.notDeepEqual(p.a,p.b);identities.add(JSON.stringify([p.a,p.b,p.chords,p.meter,p.lead]));}assert.equal(identities.size,4);
});
