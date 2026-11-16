import test from 'node:test';
import assert from 'node:assert/strict';
import {makeFixedRooms,createFixedJourney,FIXED_START} from '../fixed-screens.js';
import {LANDMARK_ROUTES,landmarkSightline,fixedAmbientSources,fixedListeningPosition} from '../fixed-landmarks.js';
import {walkFixedState} from './fixed-route.mjs';
import {createAmbienceDirector} from '../journey-ambience.js';
const rooms=makeFixedRooms(),by=id=>rooms.find(r=>r.id===id);
test('three sightline journeys use direct existing exits and walk out and back without a warp',()=>{
 for(const route of LANDMARK_ROUTES){const s=createFixedJourney();s.enter();assert.equal(s.room.id,FIXED_START.room);
  for(const id of [...route.slice(1),...route.slice(0,-1).reverse()]){assert.ok(Object.values(s.room.connections).includes(id),s.room.id+' -> '+id);walkFixedState(s,id);assert.ok(s.room.walkable(s.hero.x,s.hero.y));}
  assert.equal(s.room.id,FIXED_START.room);
 }
 assert.equal(by('glass-reflection').site.form,'gauge');assert.ok(by('glass-court').site.landmarkGlass);
 assert.equal(landmarkSightline('terraced-fields').bearing,'S');
 assert.equal(landmarkSightline('white-flower-road',{py:11}).snow,'hidden');
 assert.equal(landmarkSightline('white-flower-road',{py:3}).snow,'reveal');
});
test('physical north/south water and banks line up on both sides of the receiving path',()=>{
 for(const [a,b] of [['glass-court','wet-temple'],['wet-temple','wet-stairs'],['wet-stairs','glass-reflection'],['glass-reflection','canal-bend']]){
  const n=by(a),s=by(b);assert.equal(n.connections.S,b);
  for(let x=0;x<15;x++){assert.equal(n.tileAt(x,14),s.tileAt(x,0),a+' / '+b+' seam '+x);}
  assert.ok(['w','d'].includes(n.tileAt(10,14)),a+' physical channel, not rescue floor');
 }
});
test('environment audio follows real water and keeps distance across seams; SFX/pause can silence it',()=>{
 const sources=fixedAmbientSources(rooms),pond=by('glass-reflection');
 for(const s of sources.filter(s=>s.kind==='drip')){const r=rooms.find(r=>s.x>=r.col*15&&s.x<(r.col+1)*15&&s.y>=r.row*15&&s.y<(r.row+1)*15);assert.equal(r.tileAt(s.x-r.col*15,s.y-r.row*15),'w');}
 const d=createAmbienceDirector(sources.filter(s=>s.kind==='drip'));
 const near={x:pond.col*15+10,y:pond.row*15},far={x:pond.col*15+2,y:pond.row*15+6};
 assert.ok(d.update(near,1000).levels.length);assert.equal(d.update(far,2000).levels.length,0);
 assert.deepEqual(d.update(near,3000,false),{levels:[],events:[]});
 const from=by('wet-stairs'),to=pond,t={from,to,hero:{x:10,y:14},landing:{x:10,y:1},duration:560,elapsed:280};
 const p=fixedListeningPosition({transition:t});assert.deepEqual(p,{x:55,y:60});
 assert.ok(d.update(p,5000).levels.length,'water audible during crossing');
});
