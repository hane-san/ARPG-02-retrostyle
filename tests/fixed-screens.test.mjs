import {walkFixedState} from './fixed-route.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {makeFixedRooms,createFixedJourney,fixedLayout,gatePoint,FIXED_DIRECTIONS,FIXED_SLIDE_MS,FIXED_CUE,fixedExitTarget,fixedExitMarker,fixedExitLabel,fixedGuideLayout} from '../fixed-screens.js';
import {MUSIC_LIBRARY,buildTrack} from '../music.js';
import {transitionTraveller} from '../fixed-screen-art.js';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function settle(s){for(let i=0;i<1500;i++){s.update(.016);if(!s.hero.path.length&&!s.transition)return;}throw Error('fixed journey never settled');}
function cross(s,d,reduced=false){const old=s.room,to=old.connections[d];assert.ok(to);assert.ok(s.walkTo(gatePoint(d,s.room)));for(let i=0;i<1500&&s.room===old;i++)s.update(.016,{reduced});assert.equal(s.room.id,to);assert.equal(s.hero.path.length,0);assert.equal(s.room.gateAt(s.hero.x,s.hero.y),null);}
test('all 100 authored rooms have connected floors, real obstacles and reciprocal cardinal edge gates',()=>{
 const rooms=makeFixedRooms();assert.equal(rooms.length,100);assert.equal(new Set(rooms.map(r=>r.col+','+r.row)).size,100);
 for(const r of rooms){
  assert.equal(r.w,15);assert.equal(r.h,15);const q=[gatePoint(Object.keys(r.connections)[0],r)],seen=new Set(q.map(p=>p.x+','+p.y));
  for(let i=0;i<q.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const p={x:q[i].x+dx,y:q[i].y+dy},key=p.x+','+p.y;if(r.walkable(p.x,p.y)&&!seen.has(key)){seen.add(key);q.push(p);}}
  for(let y=-1;y<=15;y++)for(let x=-1;x<=15;x++){
   if(r.walkable(x,y)){assert.ok(seen.has(x+','+y),`isolated floor ${r.id} ${x},${y}`);if(x===0||y===0||x===14||y===14)assert.ok(r.gateAt(x,y),'no floor exits without a connection');}
   else assert.equal(r.gateAt(x,y),null,'only walkable gates can transition');
  }
  for(const [d,id] of Object.entries(r.connections)){const to=rooms.find(a=>a.id===id),dir=FIXED_DIRECTIONS[d];assert.deepEqual([to.col-r.col,to.row-r.row],[dir.dx,dir.dy]);assert.equal(to.connections[dir.back],r.id);const p=gatePoint(d,r);assert.ok(r.findPath(r,q[0],p));}
  for(const [x,y] of r.trees)assert.equal(r.walkable(x,y),false);
  if(r.house){for(let y=r.house.y;y<r.house.y+r.house.h;y++)for(let x=r.house.x;x<r.house.x+r.house.w;x++)assert.equal(r.walkable(x,y),false);assert.ok(seen.has(r.house.entrance.x+','+r.house.entrance.y));}
  for(const n of r.npcs)assert.ok(seen.has(n.x+','+n.y));
 }
});
test('the long loop and the branch can be walked both ways without automatic bounce or old paths',()=>{
 const s=createFixedJourney();s.enter();walkFixedState(s,'hearth');s.walkTo({x:7,y:11});settle(s);for(const reduced of [false,true]){
  for(const d of ['N','N','E','E','S','W','S','W']){cross(s,d,reduced);const p={x:s.hero.x,y:s.hero.y};for(let i=0;i<50;i++)s.update(.016,{reduced});assert.deepEqual({x:s.hero.x,y:s.hero.y},p);assert.equal(s.transition,null);}
  assert.equal(s.room.id,'hearth');
  for(const d of ['E','N','W','S'])cross(s,d,reduced);assert.equal(s.room.id,'hearth');
 }
});
test('a single short slide blocks taps, holds on pause, and commits one corresponding safe arrival',()=>{
 const s=createFixedJourney();s.enter();walkFixedState(s,'hearth');s.walkTo({x:7,y:11});settle(s);s.walkTo(gatePoint('N'));for(let i=0;i<1500&&!s.transition;i++)s.update(.016);
 assert.equal(s.transition.direction,'N');assert.equal(s.transition.duration,FIXED_SLIDE_MS);const gen=s.generation;
 assert.equal(s.walkTo({x:2,y:8}),false);for(let i=0;i<40;i++)s.update(.07,{paused:true});assert.equal(s.transition.elapsed,0);
 for(let i=0;i<6;i++)s.update(.08);assert.equal(s.room.id,'hearth');s.update(.08);assert.equal(s.room.id,'cypresses');assert.equal(s.generation,gen+1);assert.deepEqual([s.hero.x,s.hero.y],[7,13]);assert.equal(s.transition,null);
 s.walkTo(gatePoint('N'));for(let i=0;i<1500&&!s.transition;i++)s.update(.016);s.finishTransition();assert.equal(s.room.id,'ascent');assert.equal(s.hero.path.length,0);s.update(.08);assert.equal(s.transition,null);
});
test('rerouting finishes the occupied step, never enters water, and interior taps cannot escape through a gate',()=>{
 const s=createFixedJourney();s.enter();walkFixedState(s,'hearth');s.walkTo({x:7,y:11});settle(s);assert.ok(s.walkTo({x:7,y:4}));s.update(.03);assert.notEqual(s.hero.py,s.hero.y);const next={...s.hero.path[0]};assert.ok(s.walkTo({x:8,y:9}));assert.deepEqual(s.hero.path[0],next);settle(s);assert.equal(s.room.id,'hearth');assert.deepEqual([s.hero.x,s.hero.y],[8,9]);
 assert.equal(s.walkTo({x:3,y:5}),false);assert.equal(s.walkTo({x:-1,y:7}),false);assert.equal(s.walkTo({x:7,y:14}),false);
 cross(s,'E');const w=s.room;for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(w.tileAt(x,y)==='w')assert.equal(s.walkTo({x,y}),false);
 assert.equal(s.room.id,'homewind');
});
test('return is explicit, fires once, and leaving discards both a route and an unfinished transition',()=>{
 let returns=0;const s=createFixedJourney({onReturn:()=>returns++});s.enter();walkFixedState(s,'hearth');s.walkTo({x:7,y:11});settle(s);s.walkTo({x:7,y:12});settle(s);assert.equal(returns,0);s.walkTo({x:7,y:12},{kind:'return'});s.update(.016);assert.equal(returns,1);s.update(.08);assert.equal(returns,1);
 s.walkTo(gatePoint('N'));for(let i=0;i<1500&&!s.transition;i++)s.update(.016);s.leave();for(let i=0;i<100;i++)s.update(.08);assert.equal(s.active,false);assert.equal(s.transition,null);assert.equal(s.hero.path.length,0);s.enter();walkFixedState(s,'hearth');s.walkTo({x:7,y:11});settle(s);assert.equal(s.room.id,'hearth');assert.deepEqual([s.hero.x,s.hero.y],[7,11]);
});
test('one isotropic layout fits real portrait/landscape stages and every old piece stays unchanged',()=>{
 for(const [w,h] of [[320,477],[390,753],[430,841],[844,311]]){const l=fixedLayout(w,h);assert.ok(l.scale>0);assert.equal(l.width/l.height,1);assert.ok(l.x>=12&&l.y>=0&&l.y+l.height<=h-17);assert.ok(l.scale*32>=(w<h?19:15));}
 assert.equal(FIXED_CUE,'47:2');assert.equal(MUSIC_LIBRARY.length*2,110);
 assert.equal(hash(MUSIC_LIBRARY),'ecae882fc6257b7350efc2d3ba62356b2d7c343ffc0c46bd22b2046618d7c037');
 assert.equal(hash(MUSIC_LIBRARY.map((_,i)=>[buildTrack(i,1),buildTrack(i,2)])),'679e4bedd1375819274e78f6582644bcf120cdd312bfe896a5bbba29ab7645ee');
});

test('variable width seams match every lane and material, with safe arrivals across their full width',()=>{
 const rooms=makeFixedRooms(),widths=new Set();
 for(const r of rooms)for(const [d,id] of Object.entries(r.connections)){
  const to=rooms.find(a=>a.id===id),dir=FIXED_DIRECTIONS[d];widths.add(r.seams[d].width);
  let lanes=0;
  for(let j=0;j<15;j++){
   const p=d==='N'?{x:j,y:0}:d==='S'?{x:j,y:14}:d==='W'?{x:0,y:j}:{x:14,y:j};
   const q={x:dir.dx?dir.dx>0?0:14:j,y:dir.dy?dir.dy>0?0:14:j};
   assert.equal(r.walkable(p.x,p.y),to.walkable(q.x,q.y),r.id+' '+d+' lane '+j);
   if(r.walkable(p.x,p.y)){
    lanes++;assert.equal(r.tileAt(p.x,p.y),to.tileAt(q.x,q.y));
    assert.ok(to.walkable(q.x+dir.dx,q.y+dir.dy),'all lane arrivals stay inside on a real floor');
   }
  }
  assert.equal(lanes,r.seams[d].width);
 }
 for(const w of [1,3,5,7,8,9,11])assert.ok(widths.has(w),'seam width '+w);
});

test('a transition paints one continuous world-space traveller across both board clips',()=>{
 const rooms=makeFixedRooms();
 for(const from of rooms)for(const [d,id] of Object.entries(from.connections)){
  const to=rooms.find(r=>r.id===id),dir=FIXED_DIRECTIONS[d],a=gatePoint(d,from),b={x:dir.dx?dir.dx>0?1:13:a.x,y:dir.dy?dir.dy>0?1:13:a.y};
  const t={to,hero:{...a,px:a.x,py:a.y},landing:b};
  for(const p of [0,.05,.25,.5,.75,.95,1]){
   const f=transitionTraveller(from,t,from,p),g=transitionTraveller(from,t,to,p);
   assert.ok(Math.abs(f.px+from.col*15-g.px-to.col*15)<1e-9);
   assert.ok(Math.abs(f.py+from.row*15-g.py-to.row*15)<1e-9);
   assert.ok(Math.abs(f.px+from.col*15-(from.col*15+a.x+(to.col*15+b.x-from.col*15-a.x)*p))<1e-9);
   assert.ok(Math.abs(f.py+from.row*15-(from.row*15+a.y+(to.row*15+b.y-from.row*15-a.y)*p))<1e-9);
  }
 }
});

test('visible continuations and 44px narrow openings select only a legal connected exit',()=>{
 for(const [w,h] of [[320,477],[390,753],[430,841],[844,316]]){
  const l=fixedLayout(w,h),tile=32*l.scale,screen=p=>({x:l.x+(p.x+.5)*tile,y:l.y+(p.y+.5)*tile});
  for(const r of makeFixedRooms())for(const d of Object.keys(r.connections)){
   const v=FIXED_DIRECTIONS[d],g=gatePoint(d,r);
   for(const q of [g,{x:g.x+v.dx,y:g.y+v.dy},fixedExitMarker(d,r)]){
    const a=screen(q),target=fixedExitTarget(r,a.x,a.y,l);assert.ok(target);assert.equal(r.gateAt(target.x,target.y).direction,d);
   }
   const plate=fixedExitLabel(d,r,l.scale),labelTap=fixedExitTarget(r,l.x+plate.x*l.scale,l.y+plate.y*l.scale,l);assert.ok(labelTap);assert.equal(r.gateAt(labelTap.x,labelTap.y).direction,d);
   const mark=screen(fixedExitMarker(d,r)),labelY=mark.y+Math.max(14*l.scale,12)/2+10*l.scale;if(!plate.shifted)assert.ok(fixedExitTarget(r,mark.x,labelY,l));
   if(r.seams[d].width===1)for(const delta of [-21,21,-tile,tile]){
    const a=screen(g);if(v.dy)a.x+=delta;else a.y+=delta;
    const target=fixedExitTarget(r,a.x,a.y,l);assert.ok(target);assert.equal(r.gateAt(target.x,target.y).direction,d);
   }
  }
  const r=makeFixedRooms()[0];for(const q of [{x:7,y:14},{x:0,y:14},{x:7,y:-8}]){const a=screen(q);assert.equal(fixedExitTarget(r,a.x,a.y,l),null);}
  const bridge=makeFixedRooms().find(r=>r.id==='bridge'),water=screen({x:9,y:4});assert.equal(fixedExitTarget(bridge,water.x,water.y,l),null);
 }
});

test('exit plaques stay legible, inside the board and clear of each other and the return waystone',()=>{
 const hit=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.y-b.y)<(a.h+b.h)/2;
 for(const [w,h] of [[320,477],[390,753],[430,841],[844,316]]){
  const l=fixedLayout(w,h);
  for(const r of makeFixedRooms()){
   const g=fixedGuideLayout(r,l.scale),plates=Object.values(g.labels);
   for(const p of plates){assert.ok(p.font*l.scale>=13,'plaque type stays readable '+r.id);assert.ok(p.x-p.w/2>=0&&p.x+p.w/2<=480,'plaque inside board '+r.id+' '+p.d);}
   for(let i=0;i<plates.length;i++)for(let j=i+1;j<plates.length;j++)assert.ok(!hit(plates[i],plates[j]),'plaques overlap in '+r.id+' '+plates[i].d+plates[j].d+' at '+w);
   if(g.stone)for(const p of plates)assert.ok(!hit(p,g.stone),'plaque covers the waystone name in '+r.id+' at '+w);
  }
 }
});
