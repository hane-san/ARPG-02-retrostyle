import {pilgrimMaterial} from '../pilgrimage-ground.js';
import {createHash} from 'node:crypto';
import test from 'node:test';import assert from 'node:assert/strict';
import {WEST_STUDIES,WEST_SITES,WEST_NPCS,WEST_CLIFF_PATH} from '../western-world.js';
import {makePilgrimageWorld,pilgrimCameraScene} from '../pilgrimage-world.js';
import {createWesternLight} from '../western-art.js';
import {MUSIC_LIBRARY,buildTrack} from '../music.js';
import {pickJourneyArrivalTrack,createJourneyMusicDirector} from '../journey-music.js';
const world=makePilgrimageWorld();
test('the twelve western studies have unique entrances and cues, reusing two detours without losing their paths',()=>{
 assert.equal(WEST_STUDIES.length,12);assert.equal(new Set(WEST_STUDIES.map(z=>z.index)).size,12);assert.equal(new Set(WEST_STUDIES.map(z=>z.music[0])).size,12);
 for(const z of WEST_STUDIES){assert.equal(world.zoneAt(z.cx,z.cy).id,z.id);assert.equal(pickJourneyArrivalTrack(z.id),z.music[0]);assert.ok(world.findPath(world,world.start,{x:z.cx,y:z.cy})?.length);}
 assert.equal(world.zoneAt(112,210).index,13);assert.equal(world.zoneAt(251,217).index,15);
 let steps=0;for(let i=1;i<WEST_CLIFF_PATH.length;i++){const [ax,ay]=WEST_CLIFF_PATH[i-1],[bx,by]=WEST_CLIFF_PATH[i];const p=world.findPath(world,{x:ax,y:ay},{x:bx,y:by});assert.ok(p?.length,'each authored cliff bend is walkable');steps+=p.length-1;}assert.ok(steps>630);
 assert.equal(WEST_SITES.length,26);assert.equal(WEST_NPCS.length,14);
});
test('new water and sky are blocked, terrace stone faces stop walking and all stairs are actual floors',()=>{
 let stairs=0,faces=0,sky=0,water=0;
 for(let y=290;y<world.h;y++)for(let x=0;x<240;x++){
  const t=world.tileAt(x,y);if(['west-wall','west-sky','L'].includes(t)){assert.equal(world.walkable(x,y),false);if(t==='west-wall')faces++;if(t==='west-sky')sky++;if(t==='L')water++;}
  if(t==='west-stair'){assert.equal(world.walkable(x,y),!world.occupied[y*world.w+x],'only actual architectural feet may occupy a stair');stairs++;}
 }
 assert.ok(stairs>150&&faces>1000&&sky>10000&&water>1000);
 const p=world.findPath(world,{x:176,y:484},{x:176,y:451});assert.ok(p?.some(p=>world.tileAt(p.x,p.y)==='west-stair'));
});
test('western light advances only during visible cliff time, never backwards or by a background jump',()=>{
 const c=createWesternLight();c.update(0,true);for(let i=1;i<=450;i++)c.update(i*200,true);assert.equal(c.phase,.5);
 c.update(200000,false);c.update(500000,true,true);assert.equal(c.phase,.5);
 c.update(900000,true);assert.ok(c.phase>.5&&c.phase<.502);const before=c.phase;c.update(899999,true);assert.equal(c.phase,before);
 for(let i=1;i<=900;i++)c.update(900000+i*200,true);assert.equal(c.phase,1);
});
test('all twelve pieces develop for 60–120 seconds with independent melodic answers and orchestration',()=>{
 assert.equal(MUSIC_LIBRARY.length,51);const fingerprints=new Set();
 for(let i=45;i<51;i++)for(const phase of [1,2]){const score=MUSIC_LIBRARY[i],p=phase===1?score.ally:score.hostile,t=buildTrack(i,phase);assert.notDeepEqual(p.a,p.b);assert.equal(p.a.length,16);assert.ok(t.seconds>=60&&t.seconds<=120);fingerprints.add(JSON.stringify([p.a,p.b,p.chords,p.meter,p.lead,p.arp]));for(let section=0;section<4;section++)assert.ok(t.events.some(e=>e.beat>=section*p.meter*8&&e.beat<(section+1)*p.meter*8));}
 assert.equal(fingerprints.size,12);
 const d=createJourneyMusicDirector({settleMs:650,minHoldMs:1600});assert.equal(d.update('pilgrim-19',0),'pilgrim-19');assert.equal(d.update('pilgrim-20',1700),null);assert.equal(d.update('pilgrim-19',1800),null);assert.equal(d.update('pilgrim-20',1900),null);assert.equal(d.update('pilgrim-20',2549),null);assert.equal(d.update('pilgrim-20',2550),'pilgrim-20');assert.equal(d.update('pilgrim-20',5000),null);
});

test('the exact original ninety score data and every original lake water tile survive the west expansion',()=>{
 // Source of these hashes: main b94901f, before #105/#106 integration.
 const hash=s=>createHash('sha256').update(s).digest('hex');
 assert.equal(hash(JSON.stringify(MUSIC_LIBRARY.slice(0,45))),'bfbc375e69744e135c48225ec982a91d4a10dc86ec1f9b0509986fe21df4398c');
 let water='';for(let y=0;y<288;y++)for(let x=0;x<480;x++)if(world.tileAt(x,y)==='L')water+=x+','+y+';';
 assert.equal(hash(water),'8a3ab8e10c64f59047631a983c4bd9be3b6e333aa133c5d7f8c09191749c578e');
});

test('western walking surfaces retain small material-specific footfalls and temporary traces',()=>{
 assert.equal(pilgrimMaterial(world,36,767),'wood');
 assert.equal(pilgrimMaterial(world,176,712),'sand');
 assert.equal(pilgrimMaterial(world,113,636),'grass');
 assert.equal(pilgrimMaterial(world,176,461),'stone');
});

test('the broad plain has one stable authored .6 vista while other ordinary new regions stay .8',()=>{
 assert.equal(pilgrimCameraScene(world,{px:118,py:631}), 'journey-scenic-wide');
 for(const z of WEST_STUDIES.filter(z=>!['azure','cliff'].includes(z.key)))assert.equal(pilgrimCameraScene(world,{px:z.cx,py:z.cy}),'journey-road');
});
