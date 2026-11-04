import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {makePilgrimageWorld} from '../pilgrimage-world.js';
import {TRIAL_WAYSTONE,trialDestinations,createTrialBag,placeTrialTraveller} from '../trial-travel.js';
import {WEST_STUDIES} from '../western-world.js';
import {CORE_SKY_STUDIES,skyWorldWindow,skyGeometry,skyPalette} from '../landscape-sky.js';
import {MUSIC_LIBRARY,buildTrack} from '../music.js';import {ENERGY_SCORES,energySection} from '../energy-music.js';
import {createJourneyCamera} from '../journey-camera.js';import {createJourneyMusicDirector} from '../journey-music.js';
const w=makePilgrimageWorld(),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('the flat trial waystone is reachable and all nineteen destinations are safe actual floors',()=>{
 assert.equal(w.sites.length,87);assert.equal(w.zones.length,33);assert.equal(w.npcs.length,32);assert.equal(w.siteAt(26,105).id,TRIAL_WAYSTONE.id);assert.ok(w.findPath(w,w.start,TRIAL_WAYSTONE.entrance)?.length);
 const pool=trialDestinations(w);assert.equal(pool.length,19);assert.equal(new Set(pool.map(d=>d.id)).size,19);
 for(const d of pool){assert.ok(w.walkable(d.x,d.y));assert.equal(w.zoneAt(d.x,d.y).id,d.id);assert.ok(w.findPath(w,w.start,d)?.length,d.name);}
 assert.deepEqual(trialDestinations({pilgrimage:false}),[]);
});
test('trial travel exhausts its random bag without repeating a land, including cycle boundaries',()=>{
 for(const random of [()=>0,()=>.999999,()=>.419]){const b=createTrialBag(w,random);let previous='pilgrim-0';for(let cycle=0;cycle<3;cycle++){const seen=new Set();for(let i=0;i<19;i++){const d=b.next(previous);assert.notEqual(d.id,previous);assert.ok(!seen.has(d.id));seen.add(d.id);previous=d.id;}assert.equal(seen.size,19);}}
});
test('explicit arrivals discard old movement and camera/music candidates without changing ordinary dwell',()=>{
 const h={x:29,y:105,px:29.4,py:105,path:[{x:30,y:105}],arrival:{kind:'npc'},moving:true,stride:3};
 assert.throws(()=>placeTrialTraveller(w,h,{x:0,y:0}));assert.equal(h.path.length,1);
 const target=trialDestinations(w)[0];placeTrialTraveller(w,h,target);assert.equal(h.px,target.x);assert.equal(h.py,target.y);assert.deepEqual(h.path,[]);assert.equal(h.arrival,null);assert.equal(h.moving,false);
 const c=createJourneyCamera({regional:true});c.update('journey-monument',3000);assert.equal(c.arrive('journey-reveal',10000),.46);assert.equal(c.update('journey-road',10001),.46);assert.equal(c.update('journey-road',15000),.8);
 const m=createJourneyMusicDirector({settleMs:650,minHoldMs:1600});m.update('pilgrim-0',0);m.update('pilgrim-1',1000);m.arrive('pilgrim-19',2000);assert.equal(m.update('pilgrim-19',2100),null);assert.equal(m.update('pilgrim-29',2200),null);assert.equal(m.update('pilgrim-29',3599),null);assert.equal(m.update('pilgrim-29',3600),'pilgrim-29');
});
test('every transparent sky tile has a world window, inclusive edges, and stable world geometry',()=>{
 let count=0;
 for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++)if(['west-sky','pil-sky'].includes(w.tileAt(x,y))){const study=w.tileAt(x,y)==='pil-sky'?CORE_SKY_STUDIES[0]:WEST_STUDIES.find(z=>z.index===w.zoneAt(x,y).index);assert.ok(study);const b=skyWorldWindow(study);assert.ok(x*32>=b.x&&x*32+31<b.x+b.w&&y*32>=b.y&&y*32+31<b.y+b.h,`unpainted sky ${x},${y}`);assert.equal(w.walkable(x,y),false);count++;}
 assert.ok(count>10000);for(const z of [...WEST_STUDIES,...CORE_SKY_STUDIES])if(skyWorldWindow(z)){const g=skyGeometry(z);assert.equal(g,skyGeometry(z));assert.equal(g.ridges.length,3);assert.ok(g.clouds.length>20);}
 assert.notDeepEqual(skyPalette('cliff',0),skyPalette('cliff',1));assert.notDeepEqual(skyPalette('azure'),skyPalette('windmill'));
});
test('the old straight outer rails become country roads and every new floor remains connected',()=>{
 for(const x of [3,238]){let run=0,longest=0;for(let y=288;y<824;y++){run=w.tileAt(x,y)==='='?run+1:0;longest=Math.max(longest,run);}assert.ok(longest<140,`a ruler-straight outer rail remains at x=${x}`);}
 // The full-floor BFS is separately retained in pilgrimage-detours.test.mjs.
 for(const z of w.zones)assert.ok(w.findPath(w,w.start,{x:z.cx,y:z.cy})?.length,z.name);
});
test('all previous 106 scores/events survive exactly, and four new pieces have actual quiet and full passages',()=>{
 assert.equal(hash(MUSIC_LIBRARY.slice(0,53)),'4076a65accf875123bae471fe01a2ca905ea6e87604a40168af039d209b5c024');
 assert.equal(hash(Array.from({length:53},(_,i)=>[buildTrack(i,1),buildTrack(i,2)])),'963a82980fb0772ed8a44d1bb23f18d7ef47b769622ca039e5d7d17dad899db8');
 assert.equal(MUSIC_LIBRARY.length*2,110);assert.equal(ENERGY_SCORES.length,2);const identities=new Set();
 for(const [i,s] of ENERGY_SCORES.entries())for(const phase of [1,2]){
  const p=phase===1?s.ally:s.hostile,t=buildTrack(53+i,phase);assert.ok(t.seconds>=60&&t.seconds<=120);assert.notDeepEqual(p.a,p.b);identities.add(JSON.stringify([p.a,p.b,p.chords,p.meter,p.arp]));
  let quiet=0,full=0;for(const e of t.events){assert.ok(e.duration>0&&e.beat>=0&&e.beat+e.duration<=t.beats);const section=energySection(p,Math.floor(e.beat/p.meter));if(section==='intro')quiet+=e.velocity**2*e.duration;if(section==='climax')full+=e.velocity**2*e.duration;}
  assert.ok(full>quiet*2,t.title+' develops real dynamic contrast');assert.ok(t.events.some(e=>e.voice==='drum'));
 }assert.equal(identities.size,4);
});
