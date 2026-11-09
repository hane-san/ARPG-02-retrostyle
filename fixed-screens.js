import {FIXED_START,FIXED_GEOGRAPHY_LINKS,composeFixedGeography,geographySeam,seamLanes,seamTile,faultCell,connectFixedLand} from './fixed-geography.js';
export {FIXED_START} from './fixed-geography.js';
import {FIXED_ATLAS,FIXED_ATLAS_LINKS} from './fixed-atlas-data.js';
import {FIXED_EXPANSION,FIXED_EXPANSION_LINKS} from './fixed-journey-data.js';
import {silkPath} from './silk-world.js';
import {routeJourneyWalk} from './journey-world.js';
import {segmentDistance} from './landscape-geometry.js';

// An independent comparison area. These cells never replace the pilgrimage.
export const FIXED_SIZE=15,FIXED_TILE=32,FIXED_CUE='47:2',FIXED_SLIDE_MS=560;
export const FIXED_DIRECTIONS={N:{dx:0,dy:-1,back:'S'},E:{dx:1,dy:0,back:'W'},S:{dx:0,dy:1,back:'N'},W:{dx:-1,dy:0,back:'E'}};
const definition=(id,col,row,name,chartName,role,polygon,roads,trees,extra={})=>({id,col,row,name,chartName,role,polygon,roads,trees,...extra});
export const FIXED_ROOMS=[
 definition('hearth',0,2,'空の麓の集落','集落','旅の入口。窓と洗濯物を背に、木立へ向かう。',[[1,3],[10,2],[13,5],[14,9],[11,14],[2,13],[0,9]],[[[7,0],[7,4],[8,8],[7,11],[7,12]],[[8,8],[11,7],[14,7]],[[7,9],[4,8]]],[[1,10],[11,11]],{house:{x:2,y:4,w:4,h:3,entrance:{x:4,y:8}},returnStone:{x:7,y:12},npc:{x:10,y:9,name:'食堂の人',lines:['昼のスープはまだあるよ。空を見ていると、冷めるけどね。','上の青い屋根まで行くなら、木立の道から。帰りは水辺も歩けるよ。']}}),
 definition('cypresses',0,1,'糸杉の分かれ道','糸杉','目印を木々で隠し、登りと水辺への選択を作る。',[[3,0],[11,1],[13,4],[14,10],[11,14],[4,14],[1,10],[1,5]],[[[7,14],[7,11],[6,8],[7,4],[7,0]],[[6,8],[10,9],[14,7]]],[[3,4],[10,4],[2,9],[11,12],[4,12]]),
 definition('ascent',0,0,'青い屋根への坂','坂道','小さく登る。段の向こうに同じ屋根が再び見える。',[[4,1],[9,1],[12,3],[14,5],[14,11],[10,13],[6,14],[2,10],[2,5]],[[[7,14],[7,11],[5,9],[5,6],[9,5],[12,7],[14,7]]],[[2,6],[11,10]],{stairs:[[5,5],[6,5],[7,5],[8,5],[4,8],[5,8],[6,8]]}),
 definition('windway',1,0,'風の渡り道','風道','静かに通り抜ける間。高庭の全景をまだ渡さない。',[[0,5],[4,3],[9,4],[14,5],[14,10],[10,12],[5,11],[0,10]],[[[0,7],[4,7],[7,9],[11,8],[14,7]]],[[4,10],[10,5]]),
 definition('highgarden',2,0,'窓の開いた高庭','高庭','見てきた青屋根の足元へ着く。暮らしの尺度が分かる。',[[2,2],[11,1],[14,4],[13,11],[10,14],[4,14],[1,10],[0,5]],[[[0,7],[4,7],[7,9],[7,14]],[[7,9],[10,7],[11,5]]],[[2,4],[12,10]],{house:{x:9,y:2,w:5,h:3,entrance:{x:11,y:5},landmark:true},water:[[[11,5],[10,9],[10,14]]],npc:{x:4,y:10,name:'器を干す人',lines:['洗った器は、こっちの日なたへ。乾いたら窓辺に戻すの。','下の集落からは、この屋根だけ見えるんだって。']}}),
 definition('rill',2,1,'水音の降り道','下り道','高庭を後ろにして下る。流れを橋で越え、道の高さを変える。',[[4,0],[11,1],[13,5],[12,12],[7,13],[2,11],[0,9],[0,5]],[[[7,0],[7,4],[10,6],[10,9],[6,10],[3,8],[0,7]]],[[3,3],[12,5]],{water:[[[10,0],[8,5],[8,9],[11,14]]],stairs:[[6,2],[7,2],[8,2],[3,8],[4,8]]}),
 definition('bridge',1,1,'橋のたもと','橋','登りの道と水辺を結ぶ分岐。短い周回も選べる。',[[3,1],[11,1],[14,4],[14,11],[10,13],[6,14],[2,12],[0,9],[0,4]],[[[0,7],[4,7],[7,8],[11,7],[14,7]],[[7,8],[7,11],[7,14]]],[[3,3],[12,11]],{water:[[[9,0],[9,5],[9,10],[11,14]]]}),
 definition('homewind',1,2,'帰り風の並木','帰り並木','寄り道を終えて集落へ回る。屋根と木立を帰路の角度で見る。',[[3,0],[11,1],[13,6],[11,12],[7,13],[2,11],[0,9],[0,4]],[[[7,0],[7,3],[5,6],[3,7],[0,7]],[[7,3],[11,3],[12,6]]],[[3,3],[10,10],[5,10]],{water:[[[11,0],[10,4],[12,8]]]})
];
FIXED_ROOMS.push(...FIXED_EXPANSION,...FIXED_ATLAS);
composeFixedGeography(FIXED_ROOMS);
export const FIXED_START_CUE=FIXED_ROOMS.find(r=>r.id===FIXED_START.room).cue;
export const fixedChartSize=()=>({w:(Math.max(...FIXED_ROOMS.map(r=>r.col))+1)*15,h:(Math.max(...FIXED_ROOMS.map(r=>r.row))+1)*15});
const links=[['hearth','N','cypresses'],['cypresses','N','ascent'],['ascent','E','windway'],['windway','E','highgarden'],['highgarden','S','rill'],['rill','W','bridge'],['bridge','W','cypresses'],['bridge','S','homewind'],['homewind','W','hearth']];
const widths=[5,1,3,7,5,3,1,3,5];
links.push(...FIXED_EXPANSION_LINKS,...FIXED_ATLAS_LINKS,...FIXED_GEOGRAPHY_LINKS);
while(widths.length<links.length)widths.push([3,5,3,1][(widths.length-9)%4]);
const gates=Object.fromEntries(FIXED_ROOMS.map(r=>[r.id,{}]));
export const FIXED_SEAMS=Object.fromEntries(FIXED_ROOMS.map(r=>[r.id,{}]));
links.forEach(([a,d,b],i)=>{const seam=geographySeam(FIXED_ROOMS.find(r=>r.id===a),d,FIXED_ROOMS.find(r=>r.id===b),widths[i]);gates[a][d]=b;gates[b][FIXED_DIRECTIONS[d].back]=a;FIXED_SEAMS[a][d]=seam;FIXED_SEAMS[b][FIXED_DIRECTIONS[d].back]=seam;});
export const gatePoint=(d,room)=>{const j=room?.seams[d]?.center??7;return d==='N'?{x:j,y:0}:d==='S'?{x:j,y:14}:d==='W'?{x:0,y:j}:{x:14,y:j};};
export const fixedExitMarker=(d,room)=>{const p=gatePoint(d,room);return {...p,x:d==='W'?2:d==='E'?12:p.x,y:d==='N'?2:d==='S'?12:p.y};};
// One shared plaque geometry for drawing and tapping, in board pixels. The
// type stays at least about 13 CSS px. A plaque that would sit on the return
// waystone moves to whichever side of it is clear of the other plaques, and
// the waystone's own name takes the opposite side.
const overlaps=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+6&&Math.abs(a.y-b.y)<(a.h+b.h)/2+4;
export function fixedGuideLayout(room,scale){
 const font=Math.max(16,13.5/scale),clamp=p=>({...p,x:Math.max(p.w/2+4,Math.min(480-p.w/2-4,p.x))}),labels={};
 for(const d of Object.keys(room.connections)){
  const m=fixedExitMarker(d,room),name=(FIXED_ROOMS.find(r=>r.id===room.connections[d])?.chartName||'')+'へ';
  labels[d]=clamp({d,name,x:(m.x+.5)*32,y:(m.y+.5)*32+font*.5+14,w:name.length*font+16,h:font+10,font,shifted:false});
 }
 const stone=room.returnStone;let stoneLabel=null;
 if(stone){
  const sx=(stone.x+.5)*32,sy=(stone.y+.5)*32,sw=5*Math.max(14,12/scale)+14,sh=Math.max(14,12/scale)+8;
  stoneLabel={x:sx,y:sy+14+sh/2,w:sw,h:sh,font:Math.max(14,12/scale)};
  for(const label of Object.values(labels)){
   if(!(Math.abs(sx-label.x)<label.w/2+64&&Math.abs(sy-label.y)<label.h+30))continue;
   const others=Object.values(labels).filter(o=>o!==label),side=[1,-1].map(k=>clamp({...label,x:sx+k*(label.w/2+52),y:sy+4,shifted:true}));
   const pick=side.find(p=>!others.some(o=>overlaps(p,o)))||side[0];Object.assign(label,pick);
   stoneLabel=clamp({...stoneLabel,x:sx+(pick.x>sx?-1:1)*(sw/2+30),y:sy+4});
  }
 }
 // Side plaques flip above their arrows when they would touch another plaque.
 for(const label of Object.values(labels))if(!label.shifted&&(label.d==='E'||label.d==='W')&&Object.values(labels).some(o=>o!==label&&overlaps(label,o))||stoneLabel&&!label.shifted&&overlaps(label,stoneLabel))label.y-=label.font+28;
 return {labels,stone:stoneLabel};
}
export const fixedExitLabel=(d,room,scale)=>fixedGuideLayout(room,scale).labels[d];

// Interpret only connected openings, in CSS pixels. The path still ends at a
// legal boundary tile; visible neighbor terrain never teleports the traveller.
export function fixedExitTarget(room,x,y,l){
 const tile=32*l.scale,tx=(x-l.x)/tile,ty=(y-l.y)/tile;
 for(const d of Object.keys(room.connections)){
  const seam=room.seams[d],vertical=d==='N'||d==='S',across=vertical?tx:ty,along=vertical?ty:tx;
  const near=d==='N'||d==='W'?along>=-4&&along<=1.5:along>=13.5&&along<=19;
  const m=fixedExitMarker(d,room),mx=l.x+(m.x+.5)*tile,my=l.y+(m.y+.5)*tile;
  const plate=fixedExitLabel(d,room,l.scale),px=l.x+plate.x*l.scale,py=l.y+plate.y*l.scale,oldY=my+Math.max(14*l.scale,12)/2+10*l.scale;
  const label=Math.abs(x-px)<=Math.max(44,plate.w*l.scale)/2&&Math.abs(y-py)<=Math.max(22,plate.h*l.scale/2+4)||!plate.shifted&&Math.abs(x-mx)<=22&&Math.abs(y-oldY)<=22;
  const band=seam.bands.find(([lo,hi])=>near&&Math.abs(across-(lo+hi+1)/2)*tile<=Math.max(22,lo===hi?tile*1.15:0,(hi-lo+1)/2*tile));
  if(band||Math.hypot(x-mx,y-my)<=Math.min(22,tile*.45)||label){
   const [lo,hi]=band||seam.bands.find(([lo,hi])=>seam.center>=lo&&seam.center<=hi),j=Math.max(lo,Math.min(hi,Math.floor(across))),p=gatePoint(d,room);
   return vertical?{x:j,y:p.y}:{x:p.x,y:j};
  }
 }
 return null;
}
const contains=(p,x,y)=>{let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>y)!==(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])inside=!inside;return inside;};
const distance=(x,y,pts)=>Math.min(...pts.slice(1).map((p,i)=>segmentDistance(x,y,pts[i],p)));
const floor=t=>['g','=','s','b'].includes(t);
export function makeFixedRooms(){
 return FIXED_ROOMS.map(def=>{
  const tiles=Array.from({length:15},(_,y)=>Array.from({length:15},(_,x)=>contains(def.polygon,x+.5,y+.5)?'g':' '));
  const connections=gates[def.id];
  for(let y=0;y<15;y++)for(let x=0;x<15;x++){
   if(def.water?.some(p=>distance(x,y,p)<.85))tiles[y][x]=def.dry?'d':'w';
   if(def.roads.some(p=>distance(x,y,p)<=1.1))tiles[y][x]=['w','d'].includes(tiles[y][x])?'b':'=';
   if((x===0||x===14||y===0||y===14)&&!['w','d'].includes(tiles[y][x]))tiles[y][x]=' ';
  }
  for(const d of Object.keys(connections))for(const j of seamLanes(FIXED_SEAMS[def.id][d]))for(let k=0;k<=2;k++){
   const x=d==='N'||d==='S'?j:d==='W'?k:14-k,y=d==='E'||d==='W'?j:d==='N'?k:14-k;
   tiles[y][x]=seamTile(FIXED_SEAMS[def.id][d],j);
  }
  if(def.atlas)for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(faultCell(def,x,y))tiles[y][x]='r';
  // A three-tile landing funnels into a one-tile pass. Keep the boundary narrow.
  for(const d of Object.keys(connections))if(FIXED_SEAMS[def.id][d].width===1)for(let j=6;j<=8;j++)for(let k=1;k<=3;k++){
   const x=d==='N'||d==='S'?j:d==='W'?k:14-k,y=d==='E'||d==='W'?j:d==='N'?k:14-k;
   tiles[y][x]=d==='N'||d==='S'?'s':'=';
  }
  for(const [x,y] of def.stairs||[])if(floor(tiles[y][x]))tiles[y][x]='s';
  if(def.house)for(let y=def.house.y;y<def.house.y+def.house.h;y++)for(let x=def.house.x;x<def.house.x+def.house.w;x++)tiles[y][x]='h';
  let trees=def.trees;
  if(!def.atlas)for(const [x,y]of trees)tiles[y][x]='t';
  for(const site of [def.site,...def.props||[]].filter(Boolean))for(const a of site.solid||[])for(let y=Math.floor(site.y+a.y*site.scale);y<Math.ceil(site.y+(a.y+a.h)*site.scale);y++)for(let x=Math.floor(site.x+a.x*site.scale);x<Math.ceil(site.x+(a.x+a.w)*site.scale);x++)if(tiles[y]?.[x]!==undefined)tiles[y][x]='h';
  for(const [x,y] of def.maintenanceBridge||[])tiles[y][x]='b';
  if(def.atlas){
   trees=[];
   for(const [tx,ty]of def.trees){const candidates=[];for(let y=2;y<13;y++)for(let x=2;x<13;x++){
    const entrance=Object.keys(connections).some(d=>{const j=d==='N'||d==='S'?x:y,k=d==='N'?y:d==='S'?14-y:d==='W'?x:14-x;return k<=2&&seamLanes(FIXED_SEAMS[def.id][d]).includes(j);});
    if(tiles[y][x]==='g'&&!entrance&&!(def.npc?.x===x&&def.npc?.y===y))candidates.push([x,y]);
   }candidates.sort((a,b)=>Math.hypot(a[0]-tx,a[1]-ty)-Math.hypot(b[0]-tx,b[1]-ty));if(!candidates.length)throw Error(def.id+': no tree clearing');const p=candidates[0];trees.push(p);tiles[p[1]][p[0]]='t';}
  }
  if(def.atlas){try{connectFixedLand(tiles,floor);}catch(e){throw Error(def.id+': '+e.message);}}
  const room={cue:FIXED_CUE,...def,w:15,h:15,trees,tiles,connections,seams:FIXED_SEAMS[def.id],findPath:silkPath,journey:true,npcs:def.npc?[{color:'#748d93',...def.npc}]:[],
   tileAt:(x,y)=>tiles[y]?.[x]??' ',walkable:(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&floor(tiles[y]?.[x]),
   gateAt(x,y){if(!floor(tiles[y]?.[x]))return null;for(const d of Object.keys(connections)){const p=gatePoint(d,this),j=d==='N'||d==='S'?x:y;if((d==='N'||d==='S'?y===p.y:x===p.x)&&seamLanes(FIXED_SEAMS[def.id][d]).includes(j))return {direction:d,to:connections[d]};}return null;}
  };
  const approach=site=>{if(room.walkable(site.entrance.x,site.entrance.y))return site;const points=[];for(let y=1;y<14;y++)for(let x=1;x<14;x++)if(room.walkable(x,y))points.push({x,y});points.sort((a,b)=>Math.hypot(a.x-site.entrance.x,a.y-site.entrance.y)-Math.hypot(b.x-site.entrance.x,b.y-site.entrance.y));return {...site,entrance:points[0]};};
  if(room.site)room.site=approach(room.site);room.props=(def.props||[]).map(approach);
  return room;
 });
}
export function fixedLayout(width,height){
 const scale=Math.min(.9,(width-24)/(15*32),(height-24)/(18*32));
 return {scale,x:(width-15*32*scale)/2,y:height-18-15*32*scale,width:15*32*scale,height:15*32*scale};
}
const traveller=p=>({x:p.x,y:p.y,px:p.x,py:p.y,path:[],arrival:null,moving:false,stride:0,face:'up'});
export function createFixedJourney({onRoom=()=>{},onStep=()=>{},onTalk=()=>{},onReturn=()=>{},onTransition=()=>{}}={}){
 const rooms=makeFixedRooms();let active=false,room=rooms.find(r=>r.id===FIXED_START.room),hero=traveller(FIXED_START),transition=null,generation=0;
 function finish(){if(!transition)return;room=transition.to;hero=traveller(transition.landing);transition=null;generation++;onRoom(room);}
 function cross(gate,reduced){
  const dir=FIXED_DIRECTIONS[gate.direction],to=rooms.find(r=>r.id===gate.to),p={x:dir.dx?dir.dx>0?1:13:hero.x,y:dir.dy?dir.dy>0?1:13:hero.y};
  if(!to.walkable(p.x,p.y))throw Error('Blocked fixed-screen arrival');
  hero.path=[];hero.arrival=null;hero.moving=false;generation++;
  transition={from:room,to,hero:{...hero},landing:p,direction:gate.direction,elapsed:0,duration:FIXED_SLIDE_MS};onTransition();
  if(reduced)finish();
 }
 return {
  get active(){return active;},get room(){return room;},get hero(){return hero;},get transition(){return transition;},get generation(){return generation;},rooms,
  enter(){room=rooms.find(r=>r.id===FIXED_START.room);hero=traveller(FIXED_START);transition=null;active=true;generation++;onRoom(room);},
  leave(){active=false;transition=null;hero.path=[];hero.arrival=null;hero.moving=false;generation++;},
  finishTransition:finish,
  walkTo(target,arrival=null){
   if(!active||transition||!room.walkable(target.x,target.y))return false;
   // Interior taps cannot take a cheaper route through an exit on the way.
   const bounded={...room,walkable:(x,y)=>room.walkable(x,y)&&(!room.gateAt(x,y)||(x===target.x&&y===target.y))};
   const path=routeJourneyWalk(bounded,hero,target);if(!path)return false;
   hero.path=path;hero.arrival=arrival;hero.moving=path.length>0;return true;
  },
  stop(){if(!transition){hero.path=hero.path.slice(0,1);hero.arrival=null;}},
  update(dt,{paused=false,reduced=false}={}){
   if(!active)return;if(paused){hero.moving=false;return;}
   dt=Math.max(0,Math.min(.08,dt));
   if(transition){transition.elapsed+=dt*1000;if(reduced||transition.elapsed>=transition.duration)finish();return;}
   let remaining=dt*5.7;
   while(remaining>0&&hero.path.length){
    const step=hero.path[0],dx=step.x-hero.px,dy=step.y-hero.py,d=Math.hypot(dx,dy),travel=Math.min(d,remaining);
    if(travel){onStep(travel,room.tileAt(step.x,step.y));hero.stride+=travel*Math.PI/18;hero.face=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}
    if(d<=remaining+.0001){hero.x=hero.px=step.x;hero.y=hero.py=step.y;hero.path.shift();remaining-=d;const g=room.gateAt(step.x,step.y);if(g){cross(g,reduced);return;}}
    else{hero.px+=dx/d*remaining;hero.py+=dy/d*remaining;remaining=0;}
   }
   hero.moving=hero.path.length>0;
   if(!hero.moving&&hero.arrival){const a=hero.arrival;hero.arrival=null;if(a.kind==='return')onReturn();else onTalk(a.name,a.lines);}
  }
 };
}
