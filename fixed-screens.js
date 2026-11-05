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
const links=[['hearth','N','cypresses'],['cypresses','N','ascent'],['ascent','E','windway'],['windway','E','highgarden'],['highgarden','S','rill'],['rill','W','bridge'],['bridge','W','cypresses'],['bridge','S','homewind'],['homewind','W','hearth']];
const widths=[5,1,3,7,5,3,1,3,5];
const gates=Object.fromEntries(FIXED_ROOMS.map(r=>[r.id,{}]));
export const FIXED_SEAMS=Object.fromEntries(FIXED_ROOMS.map(r=>[r.id,{}]));
links.forEach(([a,d,b],i)=>{const seam={width:widths[i],surface:'='};gates[a][d]=b;gates[b][FIXED_DIRECTIONS[d].back]=a;FIXED_SEAMS[a][d]=seam;FIXED_SEAMS[b][FIXED_DIRECTIONS[d].back]=seam;});
export const gatePoint=d=>d==='N'?{x:7,y:0}:d==='S'?{x:7,y:14}:d==='W'?{x:0,y:7}:{x:14,y:7};
export const fixedExitMarker=d=>d==='N'?{x:7,y:2}:d==='S'?{x:7,y:12}:d==='W'?{x:2,y:7}:{x:12,y:7};
// Interpret only connected openings, in CSS pixels. The path still ends at a
// legal boundary tile; visible neighbor terrain never teleports the traveller.
export function fixedExitTarget(room,x,y,l){
 const tile=32*l.scale,tx=(x-l.x)/tile,ty=(y-l.y)/tile;
 for(const d of Object.keys(room.connections)){
  const half=(room.seams[d].width-1)/2,vertical=d==='N'||d==='S',across=vertical?tx:ty,along=vertical?ty:tx;
  const near=d==='N'||d==='W'?along>=-4&&along<=1.5:along>=13.5&&along<=19;
  const m=fixedExitMarker(d),mx=l.x+(m.x+.5)*tile,my=l.y+(m.y+.5)*tile;
  const name=FIXED_ROOMS.find(r=>r.id===room.connections[d]).chartName,font=Math.max(14*l.scale,12),labelY=my+font/2+10*l.scale,labelWidth=Math.max(44,(name.length+1)*font+12*l.scale);
  const label=Math.abs(x-mx)<=labelWidth/2&&Math.abs(y-labelY)<=22;
  if((near&&Math.abs(across-7.5)*tile<=Math.max(22,half===0?tile*1.15:0,(half+.5)*tile))||Math.hypot(x-mx,y-my)<=22||label){
   const j=Math.max(7-half,Math.min(7+half,Math.floor(across))),p=gatePoint(d);
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
   if(def.water?.some(p=>distance(x,y,p)<.85))tiles[y][x]='w';
   if(def.roads.some(p=>distance(x,y,p)<=1.1))tiles[y][x]=tiles[y][x]==='w'?'b':'=';
   if((x===0||x===14||y===0||y===14)&&tiles[y][x]!=='w')tiles[y][x]=' ';
  }
  for(const d of Object.keys(connections))for(let j=7-(FIXED_SEAMS[def.id][d].width-1)/2;j<=7+(FIXED_SEAMS[def.id][d].width-1)/2;j++)for(let k=0;k<=2;k++){
   const x=d==='N'||d==='S'?j:d==='W'?k:14-k,y=d==='E'||d==='W'?j:d==='N'?k:14-k;
   tiles[y][x]='=';
  }
  // A three-tile landing funnels into a one-tile pass. Keep the boundary narrow.
  for(const d of Object.keys(connections))if(FIXED_SEAMS[def.id][d].width===1)for(let j=6;j<=8;j++)for(let k=1;k<=3;k++){
   const x=d==='N'||d==='S'?j:d==='W'?k:14-k,y=d==='E'||d==='W'?j:d==='N'?k:14-k;
   tiles[y][x]=d==='N'||d==='S'?'s':'=';
  }
  for(const [x,y] of def.stairs||[])if(floor(tiles[y][x]))tiles[y][x]='s';
  if(def.house)for(let y=def.house.y;y<def.house.y+def.house.h;y++)for(let x=def.house.x;x<def.house.x+def.house.w;x++)tiles[y][x]='h';
  for(const [x,y] of def.trees)tiles[y][x]='t';
  const room={...def,w:15,h:15,tiles,connections,seams:FIXED_SEAMS[def.id],findPath:silkPath,journey:true,npcs:def.npc?[{...def.npc,color:'#748d93'}]:[],
   tileAt:(x,y)=>tiles[y]?.[x]??' ',walkable:(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&floor(tiles[y]?.[x]),
   gateAt(x,y){for(const d of Object.keys(connections)){const p=gatePoint(d);if((d==='N'||d==='S')?y===p.y&&Math.abs(p.x-x)<=(FIXED_SEAMS[def.id][d].width-1)/2:x===p.x&&Math.abs(p.y-y)<=(FIXED_SEAMS[def.id][d].width-1)/2)return {direction:d,to:connections[d]};}return null;}
  };
  return room;
 });
}
export function fixedLayout(width,height){
 const scale=Math.min(.9,(width-24)/(15*32),(height-24)/(18*32));
 return {scale,x:(width-15*32*scale)/2,y:height-18-15*32*scale,width:15*32*scale,height:15*32*scale};
}
const traveller=p=>({x:p.x,y:p.y,px:p.x,py:p.y,path:[],arrival:null,moving:false,stride:0,face:'up'});
export function createFixedJourney({onRoom=()=>{},onStep=()=>{},onTalk=()=>{},onReturn=()=>{},onTransition=()=>{}}={}){
 const rooms=makeFixedRooms();let active=false,room=rooms[0],hero=traveller({x:7,y:11}),transition=null,generation=0;
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
  enter(){room=rooms[0];hero=traveller({x:7,y:11});transition=null;active=true;generation++;onRoom(room);},
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
