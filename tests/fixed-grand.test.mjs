import {walkFixedState} from './fixed-route.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {makeFixedRooms,createFixedJourney,gatePoint,fixedChartSize} from '../fixed-screens.js';
import {PILGRIM_ZONES,PILGRIM_SITES} from '../pilgrimage-world.js';
import {journeyMaterial} from '../fixed-journey-art.js';
import {MUSIC_LIBRARY} from '../music.js';
test('the expanded journey reaches all 100 rooms from the retained entrance and has two large return loops',()=>{
 const rooms=makeFixedRooms(),seen=new Set(['hearth']),q=[rooms[0]];
 for(let i=0;i<q.length;i++)for(const id of Object.values(q[i].connections))if(!seen.has(id)){seen.add(id);q.push(rooms.find(r=>r.id===id));}
 assert.equal(seen.size,100);assert.deepEqual(fixedChartSize(),{w:150,h:150});
 assert.equal(new Set(rooms.map(r=>r.sourceIndex??23)).size,33);assert.equal(new Set(rooms.filter(r=>!r.atlas).map(r=>r.cue)).size,21);
 const s=createFixedJourney();s.enter();walkFixedState(s,'hearth');
 const route=['E','E','E','N','N','E','E','E','E','E','S','W','W','W','W','W','S','E','E','E','E','E','S','W','W','W','W','W','N','W','W','W'];
 for(const d of route){const id=s.room.connections[d];assert.ok(s.walkTo(gatePoint(d,s.room)));for(let i=0;i<1500&&s.room.id!==id;i++)s.update(.016);assert.equal(s.room.id,id);assert.equal(s.hero.path.length,0);assert.equal(s.room.gateAt(s.hero.x,s.hero.y),null);}
 assert.equal(s.room.id,'hearth');
});
test('ported building collision uses exactly the same uniform source transform as its art and keeps an accessible doorstep',()=>{
 for(const r of makeFixedRooms()){
  const z=PILGRIM_ZONES[r.sourceIndex??23];if(!r.atlas)assert.equal(r.cue,z.music[0]);const [id,phase]=r.cue.split(':').map(Number);assert.ok(MUSIC_LIBRARY[id][phase===1?'ally':'hostile']);
  for(const s of [r.site,...r.props||[]].filter(Boolean)){const original=PILGRIM_SITES.find(a=>a.id===s.sourceId);assert.equal(s.form,original.form);assert.deepEqual(s.solid,original.solid);assert.equal(s.sourceW,original.w);assert.equal(s.sourceH,original.h);assert.ok(Math.abs(s.w/s.sourceW-s.h/s.sourceH)<1e-12);assert.equal(s.w/s.sourceW,s.scale);assert.ok(r.walkable(s.entrance.x,s.entrance.y),r.id+' doorstep');
  for(const a of s.solid)for(let y=Math.floor(s.y+a.y*s.scale);y<Math.ceil(s.y+(a.y+a.h)*s.scale);y++)for(let x=Math.floor(s.x+a.x*s.scale);x<Math.ceil(s.x+(a.x+a.w)*s.scale);x++)assert.equal(r.walkable(x,y),false,r.id+' solid foot '+x+','+y);}
 }
});
test('water and dry courts retain the matching equipment and channel, while music changes only between lands',()=>{
 const rooms=makeFixedRooms(),get=id=>rooms.find(r=>r.id===id),wet=get('wet-temple'),dry=get('dry-temple');assert.deepEqual(wet.site.solid,dry.site.solid);assert.deepEqual(wet.water,dry.water);assert.deepEqual(wet.roads,dry.roads);assert.deepEqual(wet.stairs,dry.stairs);assert.deepEqual(wet.maintenanceBridge,dry.maintenanceBridge);assert.notEqual(wet.cue,dry.cue);assert.ok(wet.tiles.flat().includes('w'));assert.ok(dry.tiles.flat().includes('d'));assert.ok(!dry.tiles.flat().includes('w'));
 for(const [a,b] of [['watershed','wet-temple'],['wet-temple','wet-stairs'],['dry-temple','dry-stairs'],['forest-market','forest-workshop'],['tidal-shore','sea-arch']])assert.equal(get(a).cue,get(b).cue);
 assert.equal(get('sealed-court').quiet,true);assert.ok(rooms.filter(r=>r.quiet).length===1);
});

test('blocked vegetation has a legible trunk or rock and small flowers and reeds stay on free ground',()=>{
 for(const r of makeFixedRooms().filter(r=>r.sourceIndex!==undefined)){const {trees}=journeyMaterial(r);for(const p of trees.landscapeObjects){if(p.solid){assert.equal(r.walkable(p.x,p.y),false);assert.ok(['cypress','willow','pine','rock'].includes(p.kind));}else assert.ok(r.walkable(p.x,p.y));}}
});
