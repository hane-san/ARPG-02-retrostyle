import {WEST_STUDIES} from './western-world.js';
import {SOUTHEAST_STUDIES,marshRiver} from './southeast-world.js';
import {landscapeHash as hash,landscapeNoise} from './landscape-geometry.js';
const types={cliff:'rock',glass:'flower',grass:'flower',impression:'willow',dots:'willow',village:'cypress',windmill:'flower',terrace:'flower',mountain:'pine',azure:'flower',lane:'cypress',shoal:'reed',mesa:'rock',port:'willow',marsh:'reed',coast:'rock'};
export function plantLandscapeObjects(tiles,regions,occupied,w,walkable,sites,npcs){
 const props=[];
 for(const z of [...WEST_STUDIES,...SOUTHEAST_STUDIES])for(let y=z.y+3;y<z.y+z.h-2;y+=3)for(let x=z.x+3;x<z.x+z.w-2;x+=3){
  const seed=hash(x,y),xx=x+Math.floor(seed*3),yy=y+Math.floor(hash(y,x)*3),kind=types[z.key]==='rock'&&seed>.25?'boulder':types[z.key];
  if(seed>.57||landscapeNoise(xx,yy,13)<.44||!walkable(xx,yy)||!['west-ground','se-ground'].includes(tiles[yy][xx]))continue;
  if(sites.some(s=>xx>=s.x-2&&xx<s.x+s.w+2&&yy>=s.y-2&&yy<s.y+s.h+3)||npcs.some(n=>Math.hypot(xx-n.x,yy-n.y)<4)||Math.hypot(xx-z.cx,yy-z.cy)<5)continue;
  // Solid feet only in a roomy clearing: never narrow a corridor or a stair.
  let room=true;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(!walkable(xx+dx,yy+dy)||!['west-ground','se-ground'].includes(tiles[yy+dy]?.[xx+dx]))room=false;
  const solid=room&&['rock','boulder','willow','pine','cypress'].includes(kind);
  if(!room&&['willow','pine','cypress','rock','boulder'].includes(kind))continue;
  if(solid)occupied[yy*w+xx]=1;
  props.push({x:xx,y:yy,kind,seed,solid,palette:z.palette,chapter:regions[yy*w+xx]});
 }
 // Authored shade frames the two banks near the town's meeting point. Its foot
 // is soil and its whole surrounding 5×5 remains legal, including nearby roads.
 for(const [x,y] of [[402,507],[424,509],[393,505],[390,519]]){
  let room=tiles[y][x]==='se-ground';for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(!walkable(x+dx,y+dy))room=false;
  if(!room)continue;occupied[y*w+x]=1;props.push({x,y,kind:'willow',seed:hash(x,y),solid:true,palette:SOUTHEAST_STUDIES[1].palette,chapter:30});
 }
 for(let y=586;y<704;y+=3)for(const side of [-1,1]){
  const x=Math.round(marshRiver(y)+side*8.5);if(!walkable(x,y)||tiles[y][x]!=='se-ground'||npcs.some(n=>Math.hypot(x-n.x,y-n.y)<2))continue;
  props.push({x,y,kind:'reed',seed:hash(x,y),solid:false,palette:SOUTHEAST_STUDIES[2].palette,chapter:31});
 }
 for(const [x,y] of [[416,512],[423,481]])if(tiles[y][x]==='L')props.push({x,y,kind:'boat',seed:hash(x,y),solid:false,palette:SOUTHEAST_STUDIES[1].palette,chapter:30});
 return props;
}
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const L=(c,x,y,a,b,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
const P=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const visible=(d,b)=>d.x>=b.left-4&&d.x<=b.right+4&&d.y>=b.top-2&&d.y<=b.bottom+9;
export function drawLandscapeFeet(c,world,bounds){
 for(const d of world.landscapeObjects||[]){
  if(!visible(d,bounds))continue;
  const x=d.x*32,y=d.y*32,[g,l,,s]=d.palette;
  if(d.solid){E(c,x+23,y+26,31,9,s+'33');}
  if(['willow','pine','cypress'].includes(d.kind)){
   c.fillStyle='#796f58';c.fillRect(x+7,y-48,19,80);L(c,x+13,y-28,x-9,y-63,'#796f58',7);L(c,x+21,y-33,x+39,y-80,'#796f58',6);c.fillStyle=l+'55';c.fillRect(x+9,y-22,3,48);for(let j=0;j<4;j++)L(c,x+11+j%2*5,y-12+j*10,x+19,y-18+j*10,s+'77',1);L(c,x+12,y+24,x+2,y+31,'#796f58',3);L(c,x+21,y+26,x+30,y+32,'#796f58',3);
  }else if(d.kind==='boulder'){
   P(c,[[x,y+31],[x+1,y+2],[x+8,y-12],[x+23,y-17],[x+31,y-4],[x+32,y+31]],s);P(c,[[x+1,y+2],[x+8,y-12],[x+23,y-17],[x+20,y+12],[x+3,y+25]],g);L(c,x+7,y-10,x+23,y-16,l,2);L(c,x+19,y-9,x+14,y+7,s+'aa',2);L(c,x+14,y+7,x+24,y+12,s+'aa',1);
  }else if(d.kind==='rock'){
   // The whole polygon foot fits the single occupied tile; height is art only.
   P(c,[[x,y+31],[x+2,y-9],[x+12,y-27-d.seed*17],[x+29,y-12],[x+32,y+31]],s);P(c,[[x+2,y-9],[x+12,y-27-d.seed*17],[x+18,y+26],[x,y+31]],g);L(c,x+4,y-8,x+12,y-27-d.seed*17,l,2);
  }else if(d.kind==='boat'){
   P(c,[[x-10,y+8],[x+40,y+8],[x+31,y+26],[x+1,y+26]],'#977f61');P(c,[[x-6,y+10],[x+36,y+10],[x+27,y+20],[x+4,y+20]],l);L(c,x+3,y+7,x+32,y+19,s,4);L(c,x+16,y+8,x-19,y-4,'#c9b28b',3);L(c,x+13,y+8,x-11,y-23,s,1);
  }else if(d.kind==='reed'){
   for(let j=0;j<7;j++){const xx=x+(j*7)%30,top=y-5-(j%3)*9;L(c,xx,y+27,xx-6,top,s+'aa',2);L(c,xx,y+19,xx+7,top+8,g,3);E(c,xx-6,top,2,6,l);}
  }else{
   for(let j=0;j<6;j++){const xx=x+(j*11)%30,yy=y+(j*7)%25;L(c,xx,yy+6,xx+2,yy,s+'77',1);E(c,xx+2,yy,2.7,1.8,[l,'#d6b7a1','#d6d8bc'][j%3]);}
  }
 }
}
export function drawLandscapeCanopies(c,world,bounds,hero){
 const people=[{x:hero.px,y:hero.py},...world.npcs];
 for(const d of world.landscapeObjects||[]){
  if(!visible(d,bounds)||!['willow','pine','cypress'].includes(d.kind))continue;
  const x=d.x*32+16,y=d.y*32,[g,l,,s]=d.palette;
  c.save();if(people.some(p=>Math.abs(p.x-d.x)<2.8&&p.y<d.y+.5&&p.y>d.y-6.7))c.globalAlpha=.24;
  if(d.kind==='pine')for(let j=0;j<4;j++)P(c,[[x-47+j*8,y-42-j*29],[x,y-116-j*21],[x+47-j*8,y-42-j*29]],j%2?g:s);
  else if(d.kind==='cypress'){E(c,x,y-110,25,89,s);E(c,x-6,y-122,17,69,g);L(c,x-10,y-168,x-15,y-102,l+'55',3);}
  else{
   for(let j=0;j<7;j++)E(c,x+Math.sin(j*2)*49,y-105+(j%3)*21,43,31,j%3?g:s);
   for(let j=0;j<12;j++)L(c,x-72+j*13,y-104+(j%3)*9,x-63+j*12,y-25+(j%4)*8,g,5);
   for(let j=0;j<6;j++)L(c,x-49+j*17,y-116,x-37+j*17,y-95,l+'66',3);
  }
  for(let j=0;j<8;j++){const xx=x-34+(j*19)%68,yy=y-115+(j*13)%61;L(c,xx,yy,xx+8,yy-4,l+'66',2);}
  c.restore();
 }
}
