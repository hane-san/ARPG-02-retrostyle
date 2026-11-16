// Authored sightlines in the existing atlas; no discovery flags or route state.
// Coordinates/bearings are map north-up. A southern valley is drawn on the
// board's lower edge, never relocated into the northern sky.
import {drawWesternSite} from './western-art.js';
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const P=(c,p,col)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const L=(c,x,y,X,Y,col,width=1)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();};
export const GLASS_ROOF=Object.freeze([[0,0],[.46,-.28],[1,0]]);
export const SNOW_PROFILE=Object.freeze([[0,0],[.24,-.72],[.43,-.26],[.62,-.42],[.76,-1],[1,0]]);
export const LANDMARK_ROUTES=[
 ['watershed-wheel','empty-basin','glass-reflection','wet-stairs','wet-temple','glass-court','terraced-fields'],
 ['watershed-wheel','flour-bags','white-flower-road','cairn-turn','mountain-sill','glacier-rest'],
 ['watershed-wheel','canal-bend','glass-reflection','empty-basin','glass-reflection','wet-stairs','dry-stairs','wet-stairs','wet-temple','dry-temple','salt-boats']
];
export function landmarkSightline(id,hero){
 if(id==='glass-reflection')return {glass:'peek',bearing:'N',distance:3};
 if(id==='glass-court')return {glass:'arrival',bearing:'N',distance:0};
 if(id==='terraced-fields')return {glass:'valley',bearing:'S',distance:1};
 if(id==='flour-bags')return {snow:'far',bearing:'E',distance:4};
 if(id==='white-flower-road')return {snow:hero?.py<=4?'reveal':'hidden',bearing:'E',distance:3};
 if(id==='cairn-turn')return {snow:'near',bearing:'E',distance:2};
 if(id==='mountain-sill')return {snow:'near',bearing:'E',distance:1};
 if(id==='glacier-rest')return {snow:'arrival',mill:'far',bearing:'W',distance:4};
 return {};
}
// One six-pane roof, offset peak, and short vent on its eastern slope, at
// every distance including the full-sized original greenhouse.
export function drawGlassRoof(c,x,y,w,haze=0){
 c.save();c.translate(x,y);c.globalAlpha*=1-haze;
 P(c,GLASS_ROOF.map(([a,b])=>[a*w,b*w]),'#9bc8cc');
 for(let i=0;i<6;i++){const a=i/6,b=(i+1)/6;P(c,[[a*w,0],[.46*w,-.28*w],[b*w,0]],i%2?'#c8e4d8aa':'#eff2d288');}
 for(let i=0;i<=6;i++)L(c,i*w/6,0,.46*w,-.28*w,'#607f7c',Math.max(1,w*.009));
 L(c,0,0,.46*w,-.28*w,'#e1d8b4',Math.max(1,w*.018));L(c,.46*w,-.28*w,w,0,'#e1d8b4',Math.max(1,w*.018));
 R(c,w*.67,-w*.19,w*.07,w*.09,'#668985');R(c,w*.655,-w*.21,w*.1,w*.025,'#e1d8b4');
 c.restore();
}
function mountains(c,x,y,w,h){
 P(c,SNOW_PROFILE.map(([a,b])=>[x+a*w,y+b*h]),'#738f9e');
 P(c,[[x+.12*w,y-.36*h],[x+.24*w,y-.72*h],[x+.35*w,y-.46*h],[x+.27*w,y-.49*h],[x+.23*w,y-.44*h]],'#e5eee5');
 P(c,[[x+.64*w,y-.56*h],[x+.76*w,y-h],[x+.89*w,y-.46*h],[x+.78*w,y-.65*h],[x+.73*w,y-.61*h]],'#f1f0df');
 L(c,x+.43*w,y-.26*h,x+.62*w,y-.42*h,'#a9bdc1',2);
}
// Invoked inside the existing panorama callback, before the middle hills.
export function drawJourneyLandmarks(c,room,w,l,feet,time){
 const v=landmarkSightline(room.id,room.viewpoint),s=l.scale;
 if(v.glass==='peek'){
  const rw=90*s,x=w*.48-rw/2,y=feet-9*s;
  drawGlassRoof(c,x,y,rw,.14);
  // Near orchard shoulder hides the body and most of the eaves.
  P(c,[[x-30*s,feet+12*s],[x-14*s,y-2*s],[x+rw*.24,y-9*s],[x+rw,y-3*s],[x+rw+30*s,feet+12*s]],'#849d8b');
 }
 if(v.snow&&v.snow!=='hidden'){
  const size=(v.snow==='far'?110:v.snow==='reveal'?133:v.snow==='arrival'?205:168)*s;
  c.save();if(room.id==='white-flower-road')c.globalAlpha*=Math.max(0,Math.min(1,(5-(room.viewpoint?.py??11))/2));
  mountains(c,w*.71-size*.45,feet+8*s,size,(v.snow==='far'?60:92)*s);c.restore();
 }
 if(room.id==='white-flower-road'){
  // One real foreground shoulder: below the upper-tip detour it occludes
  // the peaks entirely. Above it the same eastern saddle comes back.
  P(c,[[w*.42,feet+18*s],[w*.51,feet-3*s],[w*.62,feet-15*s],[w*.71,feet-32*s],[w*.79,feet-29*s],[w*.88,feet-17*s],[w,feet+18*s]],'#8c9f98');
 }
 if(v.mill){
  const x=w*.15,y=feet-7*s;c.save();c.translate(x,y);c.scale(s*.13,s*.13);
  P(c,[[-42,10],[-20,-9],[180,-3],[230,30]],'#b1b995');
  drawWesternSite(c,{x:0,y:-4,w:5,h:4,chapter:13,form:'west-windmill'},time);c.restore();
 }
}
export function drawArrivalRoof(c,room){
 if(room.id!=='glass-court'||!room.site)return;
 const a=room.site;drawGlassRoof(c,a.x*32,a.y*32+10*a.scale,a.w*32);
 // Pots and recent watering marks use only the open interior/approach, and
 // have no new blocking feet. Their shadows are deliberately small.
 const base=(a.y+a.h)*32;
 for(let i=0;i<4;i++){const x=a.x*32+40+i*43;R(c,x,base-17,13,11,'#9a785b');R(c,x-2,base-19,17,4,'#c6a582');R(c,x+5,base-31,3,12,'#50765a');L(c,x+6,base-26,x,base-30,'#739265',3);}
}
// Valley under the south-east lip of the northern terrace; keep it outside
// floor cells and under the real rock edge, behind equipment and the hero.
export function drawJourneyGround(c,room,time,active=false){
 if(room.id==='terraced-fields'&&active){
  c.save();c.beginPath();let any=false;
  for(let y=11;y<15;y++)for(let x=10;x<15;x++)if(room.tileAt(x,y)===' '){c.rect(x*32,y*32,32,32);any=true;}
  if(any){c.clip();P(c,[[320,352],[480,352],[480,480],[320,480]],'#71928c');
   P(c,[[320,360],[390,398],[480,380],[480,480],[320,480]],'#9eb3a0');
   R(c,363,432,65,17,'#84a8a1');drawGlassRoof(c,363,432,65,.08);
   L(c,352,457,438,451,'#b6cfbf',2);}
  c.restore();
  // A lit stone lip and its dark face make the overlook a drop, not floor.
  for(let y=11;y<15;y++)for(let x=10;x<15;x++)if(room.tileAt(x,y)===' '){
   if(room.walkable(x,y-1)){R(c,x*32,y*32,32,9,'#596f67');R(c,x*32,y*32,32,2,'#d2d3ad');}
   if(room.walkable(x-1,y)){R(c,x*32,y*32,6,32,'#596f67');R(c,x*32,y*32,2,32,'#bfc9a6');}
  }
 }
 if(room.id==='glass-reflection'){
  // Reflected roof clipped to physical water, never a false traversable lane.
  c.save();c.beginPath();for(let y=2;y<9;y++)for(let x=0;x<15;x++)if(room.tileAt(x,y)==='w')c.rect(x*32,y*32,32,32);c.clip();c.globalAlpha=.55;c.translate(0,260);c.scale(1,-.55);drawGlassRoof(c,292,0,98);c.restore();
 }
 if(!WATER_STUDIES.has(room.id))return;
 for(let y=0;y<15;y++)for(let x=0;x<15;x++){
  const t=room.tileAt(x,y);if(t!=='w'&&t!=='d')continue;
  const X=x*32,Y=y*32;
  // Identical bank height, three old level marks, dark lip, light worn top.
  for(const side of [-1,1]){const xx=X+(side<0?1:29);R(c,xx,Y,2,32,'#6a786c');R(c,xx+side,Y,1,32,'#d9d5b4');for(let i=0;i<3;i++)R(c,xx-2,Y+7+i*8,5,1,'#e0d8b8');}
  if(t==='w'){const yy=Y+((time/150+x*3)%25);L(c,X+12,yy,X+16,yy+4,'#ddf0df',1.5);L(c,X+16,yy+4,X+20,yy,'#ddf0df',1.5);}
 }
 // Repeated open, shallow basin motif beside an existing seven-step landing.
 // Only painted on floor so it never claims to block the walking route.
 const p=room.stairs?.find(([x,y])=>room.walkable(x,y))||(room.id==='watershed-wheel'?[7,10]:null);
 if(p){const X=p[0]*32,Y=p[1]*32;R(c,X+2,Y+5,26,19,'#667e75');R(c,X+4,Y+7,22,14,room.dry?'#b4a88c':'#9dc9c1');for(let i=0;i<3;i++)R(c,X+5+i*8,Y+3,4,5,'#e0d5b4');}
 if(room.id==='salt-boats'){for(let y=7;y<13;y++)if(room.walkable(10,y)){R(c,323,y*32,22,32,'#c0b69c');L(c,324,y*32,324,y*32+32,'#8f8b77',2);L(c,344,y*32,344,y*32+32,'#e2dac1',2);}}
 if(room.id==='salt-boats')for(let i=0;i<3;i++){const X=220+i*14;L(c,X,310,X+10,350,'#826e52',5);L(c,X-1,310,X+9,350,'#d5bc8e',2);}
}
const WATER_STUDIES=new Set(['watershed-wheel','canal-bend','glass-reflection','wet-stairs','wet-temple','empty-basin','dry-stairs','dry-temple','salt-boats']);
// Sources follow actual water / dry channels and exposed ridge lines. IDs are
// stable across board changes; the director still caps events at two sources.
export function fixedAmbientSources(rooms){
 return rooms.flatMap(r=>{
  const kind=r.dry?'stone':r.quiet?'echo':r.land==='forest'?'wood':r.land==='ridge'?'wind':r.water?'drip':null;
  if(!kind)return [];
  let points=[];
  if(r.water&&!r.quiet&&r.land!=='forest'&&r.land!=='ridge'){
   for(let y=0;y<15;y+=3)for(let x=0;x<15;x++)if(['w','d'].includes(r.tileAt(x,y)))points.push([x,y]);
  }else if(kind==='wind')points=[[3,5],[8,5],[12,7]];
  if(!points.length)points=[[9,7]];
  return points.map(([x,y],i)=>({id:'fixed-ambient-'+r.id+'-'+i,kind,x:r.col*15+x,y:r.row*15+y}));
 });
}
// Interpolate across the same shared edge used by the visual slide. Water or
// wind stays spatial through the crossing rather than switching off for 560ms.
export function fixedListeningPosition(state){
 const at=(r,p)=>({x:r.col*15+p.x,y:r.row*15+p.y});
 if(!state.transition)return at(state.room,{x:state.hero.px,y:state.hero.py});
 const t=state.transition,a=at(t.from,t.hero),b=at(t.to,t.landing),u=Math.max(0,Math.min(1,t.elapsed/t.duration));
 return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
}
