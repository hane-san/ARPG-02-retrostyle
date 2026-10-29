import test from 'node:test';
import assert from 'node:assert/strict';
import {makePilgrimageWorld,PILGRIM_ROUTE,PILGRIM_ZONES,PILGRIM_BLOCKED,pilgrimCameraScene,pilgrimFloor,pilgrimQuiet,pilgrimSiteOpacity,pilgrimArtHit} from '../pilgrimage-world.js';
import {routeJourneyWalk} from '../journey-world.js';
import {MUSIC_LIBRARY,buildTrack} from '../music.js';
import {pickJourneyTrack,createJourneyMusicDirector} from '../journey-music.js';
import {createJourneyCamera} from '../journey-camera.js';
const w=makePilgrimageWorld();
function legal(from,to){const path=w.findPath(w,from,to);assert.ok(path?.length,'route '+JSON.stringify([from,to]));for(let i=0;i<path.length;i++){
 const p=path[i];assert.ok(w.walkable(p.x,p.y));if(i)assert.equal(Math.abs(p.x-path[i-1].x)+Math.abs(p.y-path[i-1].y),1);
 }return path;}
test('edited journey is the continuous pilgrimage loop and then a changed final approach',()=>{
 assert.deepEqual([w.w,w.h],[480,288]);assert.equal(w.pilgrimage,true);
 for(const z of w.zones)assert.equal(w.zoneAt(z.cx,z.cy).id,z.id,'authored centre '+z.id);
 assert.equal(w.zones.length,13);assert.equal(w.npcs.length,10);assert.equal(w.sites.length,34);assert.ok(w.decor.length>1000);
 assert.ok(Math.hypot(PILGRIM_ROUTE[31].x-w.start.x,PILGRIM_ROUTE[31].y-w.start.y)<12,'the first circuit comes back near its start');
 let steps=0;for(let i=1;i<PILGRIM_ROUTE.length;i++)steps+=legal(PILGRIM_ROUTE[i-1],PILGRIM_ROUTE[i]).length-1;
 assert.ok(steps>2200&&steps<3000,'an authored journey rather than a tiny showroom');
 const field=steps/5.7,map=steps/7.35,observations=13*10+4*15;
 assert.ok((field+observations)/60>=8&&(field+observations)/60<=12);
 assert.ok((map+observations)/60>=8&&(map+observations)/60<=12);
 console.log(JSON.stringify({steps,fieldSeconds:field,mapSeconds:map,assumedObservationSeconds:observations,humanTiming:'unverified'}));
});
test('all architectural entrances, speakers, region centres and vistas have legal outward and return walks',()=>{
 const objects=[...w.sites.map(s=>({...s.entrance,id:s.id})),...w.npcs,...w.zones.map(z=>({x:z.cx,y:z.cy,id:z.id})),...w.vistas];
 for(const p of objects){legal(w.start,p);legal(p,w.start);}
 assert.equal(new Set(w.npcs.map(p=>p.x+','+p.y)).size,10);
});
test('every walkable floor belongs to one connected country and water remains unwalkable',()=>{
 const q=[w.start],seen=new Uint8Array(w.w*w.h);seen[w.start.y*w.w+w.start.x]=1;
 for(let i=0;i<q.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=q[i].x+dx,y=q[i].y+dy,k=y*w.w+x;if(w.walkable(x,y)&&!seen[k]){seen[k]=1;q.push({x,y});}
 }
 let water=0,blocked=0;for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++){
  const t=w.tileAt(x,y);if(t==='L')water++;
  if(PILGRIM_BLOCKED.has(t)){assert.equal(w.walkable(x,y),false);blocked++;}
  if(w.walkable(x,y))assert.equal(seen[y*w.w+x],1,'isolated floor '+[x,y]);
 }
 assert.ok(water>15000,'a large lake, not a decorative puddle');assert.ok(blocked>50000);
 for(const p of [{x:-1,y:0},{x:w.w,y:0},{x:0,y:w.h},{x:.5,y:0},{x:NaN,y:1}]){assert.equal(w.walkable(p.x,p.y),false);assert.equal(w.findPath(w,w.start,p),null);}
});
test('rendered solid piers and large props collide, open court floors and gate centres remain usable',()=>{
 for(const s of w.sites){
  for(const r of s.solid)for(let y=s.y+r.y;y<s.y+r.y+r.h;y++)for(let x=s.x+r.x;x<s.x+r.x+r.w;x++)assert.equal(w.walkable(x,y),false,s.id+' solid');
  assert.ok(w.walkable(s.entrance.x,s.entrance.y));
  if(['garden','gate','arch'].includes(s.form)){
   const p={x:s.x+Math.floor(s.w/2),y:s.y+Math.floor(s.h/2)};
   assert.ok(w.walkable(p.x,p.y));assert.ok(pilgrimFloor(w,s,p));legal(s.entrance,p);
  }
 }
 for(const d of w.decor)if(d.solid)assert.equal(w.walkable(d.x,d.y),false,'prop '+[d.x,d.y]);
 const a=w.start,b=PILGRIM_ROUTE[1],path=legal(a,b),next=path[1],hero={x:a.x,y:a.y,px:(a.x+next.x)/2,py:(a.y+next.y)/2,path:path.slice(1)};
 assert.deepEqual(routeJourneyWalk(w,hero,b)[0],next,'redirect finishes the occupied edge');
});
test('outdoor framing is stable except explicit large vistas, with spatial and temporal hysteresis',()=>{
 const camera=createJourneyCamera();
 for(const z of w.zones)if(![4,11,12].includes(z.index))assert.equal(pilgrimCameraScene(w,{px:z.cx,py:z.cy},null),'journey-road');
 const p=PILGRIM_ROUTE[38];assert.equal(pilgrimCameraScene(w,{px:p.x,py:p.y},null),'journey-monument');
 assert.equal(pilgrimCameraScene(w,{px:p.x+9,py:p.y},'journey-monument'),'journey-monument');
 assert.equal(pilgrimCameraScene(w,{px:p.x+13,py:p.y},'journey-monument'),'journey-road');
 assert.equal(camera.update('journey-scenic-wide',1000),.8);assert.equal(camera.update('journey-scenic-wide',1799),.8);assert.equal(camera.update('journey-scenic-wide',1800),.6);
 assert.equal(camera.update('journey-road',1900),.6);assert.equal(camera.update('journey-road',4200),.8);
});
test('pale regional colours and valid contrasting music change without altering user audio preferences',()=>{
 assert.equal(new Set(w.zones.map(z=>z.palette[0])).size,13);
 assert.equal(MUSIC_LIBRARY.length*2,90);
 for(const z of PILGRIM_ZONES){assert.ok(z.music.length>=3);for(const key of z.music){const [id,phase]=key.split(':').map(Number);assert.ok(buildTrack(id,phase).events.length>100);}assert.equal(pickJourneyTrack(z.id,'0:1'),z.music[0]);}
 const d=createJourneyMusicDirector();assert.equal(d.update(w.zones[0].id,0),w.zones[0].id);assert.equal(d.update(w.zones[1].id,100),null);assert.equal(d.update(w.zones[1].id,12000),w.zones[1].id);
 const sealed=w.zones.find(z=>z.theme==='sealed');assert.ok(pilgrimQuiet(w,{x:sealed.cx,y:sealed.cy}));assert.equal(pilgrimQuiet(w,w.start),false);
});

test('current journey framing selects its own authored coordinates instead of old atlas beats',async()=>{
 const {journeyCameraScene,easeJourneyFollowCamera}=await import('../journey-camera.js');
 const bounds={width:w.w*32,height:w.h*32,tile:32,pilgrimage:true};
 const hero={x:118,y:26},current={x:(hero.x+.5)*32,y:(hero.y+.5)*32,zoom:.8},path=[{x:120,y:26},{x:121,y:26},{x:122,y:26}];
 const framed=easeJourneyFollowCamera(current,hero,path,.016,{width:390,height:755,zoom:.8},bounds);
 assert.equal(framed.y,current.y,'the old canyon landmark does not pull the new walking view vertically');
 assert.equal(journeyCameraScene(w,{px:141,py:42},null),'journey-road','the old wide canyon coordinate does not zoom');
});

test('pillar gaps, the space beneath the old pier, and stairs are floors, not whole-building rectangles',()=>{
 const garden=w.sites.find(s=>s.form==='garden');
 assert.equal(w.walkable(garden.x,garden.y+2),false);
 assert.equal(w.walkable(garden.x,garden.y+3),true,'gap between the actual pillars');
 const pier=w.sites.find(s=>s.form==='pier');
 assert.equal(w.walkable(pier.x+1,pier.y+2),true,'space below the raised pier');
 const stairs=w.sites.find(s=>s.form==='stairs');
 assert.equal(w.walkable(stairs.x+6,stairs.y+stairs.h-1),true,'central steps can be walked');
 const stone=w.sites.find(s=>s.form==='monolith');
 assert.equal(w.walkable(stone.x+stone.w-1,stone.y+2),false,'the second stone has its own foot');
 const gate=w.sites.find(s=>s.form==='citadel');
 assert.equal(w.walkable(gate.x,gate.y+1),false,'the fortress wall is solid');
});

test('all four roadside study designs appear, including gauges and grounded boats',()=>{
 const details=w.sites.filter(s=>s.id.startsWith('pilgrim-detail-'));
 assert.deepEqual([...new Set(details.map(s=>s.form))].sort(),['arch','boat','bowl','gauge']);
 for(const form of ['arch','boat','bowl','gauge'])assert.ok(details.filter(s=>s.form===form).length>=5);
});
test('tall foreground art reveals an explorer behind it while front and open-floor views stay opaque',()=>{
 const s=w.sites.find(s=>s.form==='monolith'),behind={px:s.x+s.w/2,py:s.y-3};
 assert.ok(w.walkable(Math.floor(behind.px),Math.floor(behind.py)));
 assert.ok(pilgrimSiteOpacity(w,s,behind)<.4);
 assert.equal(pilgrimSiteOpacity(w,s,{px:s.entrance.x,py:s.entrance.y}),1);
 assert.equal(pilgrimSiteOpacity(w,s,{px:s.x-2,py:s.y-3}),1);
 const edge=pilgrimSiteOpacity(w,s,{px:s.x-.5,py:s.y-3});assert.ok(edge>.4&&edge<1,'one-tile edge blend');
 const garden=w.sites.find(s=>s.form==='garden');assert.equal(pilgrimSiteOpacity(w,garden,{px:garden.x+6,py:garden.y+4}),1);
 assert.equal(pilgrimSiteOpacity({...w,pilgrimage:false},s,behind),1);
});

test('giant landmark framing has deliberate dwell, holds through edge jitter and restores the road',()=>{
 const c=createJourneyCamera();assert.equal(c.update('journey-monument',2000),.8);
 assert.equal(c.update('journey-monument',2799),.8);assert.equal(c.update('journey-monument',2800),.38);
 assert.equal(c.update('journey-road',2900),.38);assert.equal(c.update('journey-road',5300),.8);
});
test('high architecture can be investigated without blocking the open gate or the ground behind it',()=>{
 const gate=w.sites.find(s=>s.form==='gate'),p={x:gate.x,y:gate.y-3};
 assert.equal(pilgrimArtHit(w,p)?.id,gate.id);
 assert.notEqual(pilgrimArtHit(w,{x:gate.x+Math.floor(gate.w/2),y:gate.y-3})?.id,gate.id);
 const old=JSON.stringify(w.occupied);pilgrimArtHit(w,p);assert.equal(JSON.stringify(w.occupied),old);
});
