import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJourneyWorld,JOURNEY_VISTAS} from '../journey-world.js';
import {JOURNEY_ZOOM_STAGES,JOURNEY_CAMERA_PROFILES,createJourneyCamera,journeyCameraScene} from '../journey-camera.js';
import {JOURNEY_SCENIC_PROPS,JOURNEY_SCENIC_BEATS,JOURNEY_SCENIC_LANES,JOURNEY_SCENIC_VISTAS,journeyScenicScene,scenicLaneAt,easeScenicRoadGlide,drawJourneyScenicDetails} from '../journey-scenic.js';
import {heroVisible} from '../camera-limits.js';

const world=makeJourneyWorld();
const coords=o=>({x:o.x,y:o.y});
test('dense scenery decorates the existing country without changing tiles or collision',()=>{
 assert.ok(JOURNEY_SCENIC_PROPS.length>=50,'many details spread across the world');
 assert.ok(new Set(JOURNEY_SCENIC_PROPS.map(x=>x.id)).size===JOURNEY_SCENIC_PROPS.length);
 const kinds=new Set(JOURNEY_SCENIC_PROPS.map(p=>p.kind));
 assert.ok(kinds.size>=12,'different prop silhouettes, not the same rock again');
 for(const p of JOURNEY_SCENIC_PROPS){
  assert.ok(p.x>=0&&p.x<world.w&&p.y>=0&&p.y<world.h,p.id);
  assert.ok(['number','undefined'].includes(typeof p.variant),p.id);
 }
 assert.equal(world.w,320);assert.equal(world.h,192);
 assert.equal(world.tileAt(81,52),'L');
 assert.equal(world.walkable(81,52),false);
 assert.ok(world.walkable(19,70));
});
test('scenery is rooted on dry ground or on the structure it decorates, never on walls or open water',()=>{
 const inSite=(x,y)=>world.sites.some(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);
 // Only water glints and a flying kite may hover above water tiles.
 const overWater=new Set(['spray','kite']);
 for(const p of JOURNEY_SCENIC_PROPS){
  const t=world.tileAt(p.x,p.y);
  const water=t==='~'||t==='L';
  assert.ok(world.walkable(p.x,p.y)||inSite(p.x,p.y)||(water&&overWater.has(p.kind)),
   `${p.id} at (${p.x},${p.y}) sits on ${t}`);
 }
});
test('every new outlook is actually offered somewhere on reachable ground',()=>{
 const seen=new Set([world.start.y*world.w+world.start.x]),queue=[world.start];
 for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=queue[i].x+dx,y=queue[i].y+dy,k=y*world.w+x;
  if(x<0||y<0||x>=world.w||y>=world.h||seen.has(k)||!world.walkable(x,y))continue;
  seen.add(k);queue.push({x,y});
 }
 const offered=new Set();
 for(const k of seen){
  const x=k%world.w,y=Math.floor(k/world.w);
  // Same first-match rule as the 遠くを眺める button.
  const shown=world.vistas.find(v=>Math.hypot(v.x-x,v.y-y)<=v.radius);
  if(shown)offered.add(shown.id);
 }
 for(const v of JOURNEY_SCENIC_VISTAS)assert.ok(offered.has(v.id),v.id+' is not hidden behind an older outlook');
});
test('new outlooks are optional, unique and reachable from the original quay',()=>{
 assert.equal(JOURNEY_SCENIC_VISTAS.length,6);
 for(const v of JOURNEY_SCENIC_VISTAS){
  assert.ok(JOURNEY_VISTAS.includes(v),v.id);
  assert.ok(world.walkable(v.x,v.y),v.id+' is on dry legal terrain');
  assert.ok(world.findPath(world,world.start,coords(v))?.length>0,v.id+' reachable');
  assert.ok(world.findPath(world,coords(v),world.start)?.length>0,v.id+' returnable');
  assert.ok(v.title.length>5&&v.sub.length>12);
 }
});
test('scenic landmarks keep a calm outdoor zoom, apart from authored wide vistas',()=>{
 assert.ok(JOURNEY_SCENIC_BEATS.length>=10);
 assert.deepEqual(JOURNEY_ZOOM_STAGES,[1.35,.8,.6,.46,.38]);
 for(const b of JOURNEY_SCENIC_BEATS){
  assert.ok(b.r>=3&&b.r<=5,b.id);
  assert.ok(world.walkable(b.x,b.y),b.id+' scene must be reachable');
  assert.equal(journeyScenicScene({px:b.x,py:b.y}),b.scene,b.id);
  assert.ok(JOURNEY_ZOOM_STAGES.includes(JOURNEY_CAMERA_PROFILES[b.scene]));
 }
 assert.equal(journeyCameraScene(world,{px:36,py:38}),'journey-steppe','original open grass remains');
 assert.equal(journeyCameraScene(world,{px:119,py:25}),'journey-scenic-near','approach feels enclosed');
 assert.equal(journeyCameraScene(world,{px:141,py:42}),'journey-scenic-wide','exit reveals the canyon');
 assert.equal(journeyCameraScene(world,{px:166,py:84}),'journey-scenic-detail','orchard becomes intimate');
 assert.equal(journeyCameraScene(world,{px:155,py:108}),'journey-scenic-near','column feet become visible');
 const director=createJourneyCamera();
 director.update('journey-scenic-near',10000);
 assert.equal(director.update('journey-scenic-near',11200),.8,'ordinary scenic approach must not zoom in');
 director.update('journey-scenic-wide',11300);
 assert.equal(director.update('journey-scenic-wide',13900),.6,'the intended new vista opens after the cinematic hold');
 assert.equal(director.update('journey-scenic-wide',16300),.6,'eventually opens after hold');
});
test('gentle tracking activates only in selected paths and remains inside visible camera bounds',()=>{
 assert.equal(JOURNEY_SCENIC_LANES.length,4);
 const viewport={width:390,height:740,zoom:1.35};
 const bounds={width:world.w*32,height:world.h*32,tile:32};
 const moving={px:125,py:85};
 const current={x:118*32,y:82*32,zoom:1.35};
 const path=Array.from({length:7},(_,i)=>({x:126+i,y:85}));
 assert.ok(scenicLaneAt(moving));
 const next=easeScenicRoadGlide(current,moving,path,.016,viewport,bounds);
 assert.ok(Number.isFinite(next.x)&&Number.isFinite(next.y));
 assert.ok(heroVisible(next,{x:moving.px,y:moving.py},viewport,bounds));
 const ordinary={px:36,py:38};
 assert.equal(scenicLaneAt(ordinary),null);
 assert.equal(easeScenicRoadGlide(current,ordinary,path,.016,viewport,bounds),current,'original steppe unchanged');
 assert.equal(easeScenicRoadGlide(current,moving,[{x:126,y:85}],.016,viewport,bounds),current,'short walks do not trigger glide');
});
test('scenic sprites honor viewport culling and do not require a browser audio/context API',()=>{
 let fills=0;
 const ctx={
  fillStyle:'',strokeStyle:'',lineWidth:1,
  fillRect(){fills++;},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},ellipse(){},save(){},restore(){}
 };
 drawJourneyScenicDetails(ctx,{left:0,right:0,top:0,bottom:0},0);
 assert.equal(fills,0,'empty clipped view costs nothing');
 drawJourneyScenicDetails(ctx,{left:9,right:30,top:70,bottom:85},650);
 assert.ok(fills>0,'scenic markers render around the quay');
});

test('authored vista has a larger approach and exit hysteresis footprint',()=>{
 const beat=JOURNEY_SCENIC_BEATS.find(b=>b.id==='canyon-release');
 assert.ok(beat);
 // Point 5 tiles before a four-tile core: approach is visible, not a single tile.
 assert.equal(journeyScenicScene({px:beat.x+beat.r+1,py:beat.y}),beat.scene);
 assert.equal(journeyScenicScene({px:beat.x+beat.r+3,py:beat.y}),null,'not triggered so far outside the entrance');
 assert.equal(journeyScenicScene({px:beat.x+beat.r+3,py:beat.y},beat.scene),beat.scene,
  'an accepted vista lingers briefly on departure');
 assert.equal(journeyScenicScene({px:beat.x+beat.r+5,py:beat.y},beat.scene),null,
  'the vista eventually exits rather than clinging to the camera indefinitely');
});
