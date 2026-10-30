import test from 'node:test';
import assert from 'node:assert/strict';
import {createPilgrimageFollower} from '../journey-camera.js';
import {createJourneyMusicDirector,pickJourneyArrivalTrack} from '../journey-music.js';
import {makePilgrimageWorld,PILGRIM_ZONES} from '../pilgrimage-world.js';
import {pilgrimMaterial,pilgrimStepTile,createPilgrimTrails} from '../pilgrimage-ground.js';
const w=makePilgrimageWorld();
test('catching the camera grows forward view without recoil; short taps and stopped frames stay still',()=>{
 const bounds={width:480*32,height:288*32,tile:32},view={width:390,height:755,zoom:.8};
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const f=createPilgrimageFollower(),h={x:100,y:100};let c={x:3216+dx*170,y:3216+dy*170};const initial={...c};
  for(let i=0;i<400;i++){h.x+=dx*.1;h.y+=dy*.1;const before={...c};c=f.update(c,h,[{x:h.x+dx,y:h.y+dy}],1/60,view,bounds);assert.ok((c.x-before.x)*dx+(c.y-before.y)*dy>=-1e-8);if(i<15)assert.deepEqual(c,initial);}
  const ahead=(c.x-(h.x+.5)*32)*dx+(c.y-(h.y+.5)*32)*dy;
  assert.ok(ahead>10,'camera eventually shows ahead of the traveller, not merely the edge');
  assert.deepEqual(f.update(c,h,[],.016,view,bounds),c);
 }
});
test('pilgrimage music returns to its own authored cue on rapid outward and return travel',()=>{
 const d=createJourneyMusicDirector({settleMs:900,minHoldMs:2200}),a='pilgrim-1',b='pilgrim-2';
 assert.equal(d.update(a,0),a);assert.equal(d.update(b,1000),null);assert.equal(d.update(b,2200),b);
 assert.equal(d.update(a,2300),null);assert.equal(d.update(a,4400),a);assert.equal(pickJourneyArrivalTrack(a),'18:1');
 assert.equal(new Set(PILGRIM_ZONES.map(z=>pickJourneyArrivalTrack(z.id))).size,13);
});
test('foot materials match authored regions and bridges; sand traces expire and cannot grow without bound',()=>{
 for(const [theme,expected] of [['forest','grass'],['garden','stone'],['canyon','sand'],['ridge','stone'],['salt','sand'],['capital','stone']]){
  const z=w.zones.find(z=>z.theme===theme),p={x:z.cx+2,y:z.cy+3};
  assert.equal(pilgrimMaterial({...w,tileAt:()=> 'pil-'+z.index},p.x,p.y),expected);
 }
 assert.equal(pilgrimStepTile({...w,tileAt:()=> '+'},29,105),'+');
 const trails=createPilgrimTrails(),sand={...w,tileAt:()=> 'S',zoneAt:()=>({theme:'salt'})},hero={px:10,py:10,face:'right'};
 for(let i=0;i<1000;i++)trails.step(sand,hero,.5,i*2);
 assert.ok(trails.visible(2000).length<=48);assert.equal(trails.visible(6000).length,0);
 const stone={...sand,zoneAt:()=>({theme:'capital'})};for(let i=0;i<10;i++)trails.step(stone,hero,.5,7000);assert.equal(trails.visible(7000).length,0);
});

test('successive short taps carry forward progress, while a manual reset holds a new pan',()=>{
 const f=createPilgrimageFollower(),h={x:100,y:100},world={width:480*32,height:288*32,tile:32},v={width:390,height:755,zoom:.8};let c={x:3216,y:3216};
 for(let tap=0;tap<10;tap++){
  for(let frame=0;frame<20;frame++){h.x+=.05;c=f.update(c,h,[{x:h.x+1,y:h.y}],1/60,v,world);}
  const stopped={...c};assert.deepEqual(f.update(c,h,[],1,v,world),stopped);
  if(tap===1)assert.equal(c.x,3216,'first two nearby taps are still static');
 }
 assert.ok(c.x>(h.x+.5)*32,'series of small taps eventually looks ahead');
 f.reset();c={x:(h.x+.5)*32+170,y:3216};const panned={...c};
 for(let frame=0;frame<20;frame++){h.x+=.05;c=f.update(c,h,[{x:h.x+1,y:h.y}],1/60,v,world);}
 assert.deepEqual(c,panned,'new manual composition does not recoil');
});
