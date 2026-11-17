// Atlas-only plants: coloured silhouettes, broken light and quiet, seeded
// irregularity. No blur or extra solid feet; the older worlds keep their art.
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
const P=(c,points,col)=>{c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
const n=(s,i)=>{const v=Math.sin(s*91.7+i*127.1)*43758.5453;return v-Math.floor(v);};
const mix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
function lobe(c,x,y,rx,ry,col,seed){
 const points=[];for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=.88+n(seed,i)*.19;points.push([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r]);}P(c,points,col);
}
export function drawLeafCluster(c,x,y,rx,ry,palette,seed=0){
 const [shade,leaf,light]=palette;
 lobe(c,x,y,rx,ry,shade,seed);
 lobe(c,x-rx*.12,y-ry*.16,rx*.88,ry*.8,leaf,seed+2);
 lobe(c,x-rx*.32,y-ry*.38,rx*.4,ry*.36,mix(leaf,light,.48),seed+5);
 // Small groups of light pixels, never a shiny ring around every crown.
 for(let i=0;i<9;i++){const px=x+(n(seed,i+30)-.5)*rx*1.45,py=y+(n(seed,i+50)-.6)*ry*1.3;R(c,px,py,2+i%2,1+i%2,i%3?mix(leaf,light,.32):light);}
}
export const atlasTreeKind=kind=>['orchard','willow','pine','cypress','rock'].includes(kind);
export function drawAtlasTreeFeet(c,d){
 const x=d.x*32,y=d.y*32,s=d.seed||0;
 if(d.kind==='rock'){
  const [g,l,,shade]=d.palette;E(c,x+17,y+28,16,4,'#394a451f');
  P(c,[[x+2,y+30],[x+3,y-6],[x+12,y-27-s*12],[x+26,y-11],[x+30,y+29]],mix(shade,g,.35));
  P(c,[[x+3,y-6],[x+12,y-27-s*12],[x+20,y-4],[x+15,y+24],[x+2,y+30]],mix(g,l,.24));
  R(c,x+8,y-7,4,2,mix(l,g,.4));R(c,x+17,y+15,6,1,mix(shade,g,.5));return;
 }
 const wood='#8a7860',lit='#b3a080',dark='#6b6851',lean=(n(s,1)-.5)*7,top=d.kind==='cypress'?-126:d.kind==='pine'?-132:-103;
 E(c,x+17,y+29,18,4.5,'#334b3a26');
 P(c,[[x+7,y+31],[x+11,y-29],[x+14+lean,y+top],[x+22+lean,y+top+7],[x+21,y-25],[x+27,y+31]],wood);
 P(c,[[x+9,y+29],[x+13,y-30],[x+16+lean,y+top+4],[x+18+lean,y+top+4],[x+16,y-25],[x+15,y+28]],lit);
 for(const [dx,dy,side]of [[-24,-66,-1],[38,-84,1]])P(c,[[x+14,y-32],[x+dx,y+dy],[x+dx+side*2,y+dy-7],[x+22,y-39]],wood);
 for(let i=0;i<4;i++)R(c,x+17+(i%2)*3,y-18+i*11,2,4,dark);
 P(c,[[x+11,y+24],[x+5,y+31],[x+14,y+29]],wood);P(c,[[x+22,y+25],[x+29,y+31],[x+19,y+29]],wood);
}
function crown(c,d){
 const x=d.x*32+16,y=d.y*32,s=d.seed||0,[g,l,,dark]=d.palette,p=[mix(dark,g,.22),g,mix(l,g,.2)];
 if(d.kind==='pine'){
  for(let j=0;j<4;j++){
   const cy=y-43-j*29,rx=47-j*8,tip=y-109-j*21,lean=(n(s,j)-.5)*10;
   P(c,[[x-rx,cy],[x-rx*.72,cy-16],[x-rx*.82,cy-16],[x+lean,tip],[x+rx*.62,cy-20],[x+rx*.48,cy-17],[x+rx,cy+2],[x+rx*.5,cy-2],[x+rx*.25,cy+7],[x-rx*.16,cy+3],[x-rx*.53,cy+9]],j%2?p[1]:p[0]);
   P(c,[[x-rx*.74,cy-13],[x+lean,tip+5],[x-3,cy-10],[x-rx*.2,cy-3]],mix(p[1],p[2],.33));
   for(let i=0;i<6;i++)R(c,x-rx*.55+n(s,j*9+i+5)*rx,cy-9-n(s,i+70)*17,3,1,p[2]);
  }
 }else if(d.kind==='cypress'){
  const lean=(n(s,9)-.5)*9,shape=[[x-11,y-24],[x-22,y-46],[x-27,y-83],[x-23,y-119],[x-15+lean,y-153],[x-3+lean,y-183],[x+8+lean,y-170],[x+19,y-137],[x+26,y-101],[x+25,y-63],[x+16,y-31]];
  P(c,shape,p[0]);c.save();c.beginPath();shape.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.clip();
  lobe(c,x-5,y-104,24,74,p[1],s+30);
  for(const [j,dx,dy,rx,ry] of [[0,-12,-62,12,23],[1,-6,-100,13,26],[2,5,-125,12,20],[3,-4,-151,10,21],[4,10,-83,11,18]])drawLeafCluster(c,x+dx,y+dy+(n(s,j)-.5)*10,rx,ry,[p[1],mix(p[1],p[2],.2),mix(p[1],p[2],.52)],s+j*4);
  c.restore();
 }else{
  const orchard=d.kind==='orchard';
  for(let j=0;j<5;j++){const dx=[-34,-12,25,-24,16][j],dy=[-91,-113,-94,-70,-70][j];drawLeafCluster(c,x+dx+(n(s,j)-.5)*8,y+dy,orchard?31:38,orchard?25:29,p,s+j*4);}
  if(!orchard)for(let j=0;j<9;j++){
   const xx=x-61+j*15,yy=y-83+n(s,j+20)*15,len=22+n(s,j+30)*26;
   P(c,[[xx-2,yy],[xx+3,yy+2],[xx+4,yy+len],[xx+1,yy+len+5]],j%3?p[1]:p[0]);
   for(let k=0;k<3;k++)R(c,xx+2,yy+k*11,3,2,mix(p[1],p[2],.34));
  }
  if(orchard)for(let j=0;j<5;j++)R(c,x-36+n(s,j+15)*73,y-104+n(s,j+10)*32,2,3,j%2?'#c6b37c':'#b89470');
 }
}
export function atlasCanopyCovers(d,p){
 if(d.kind==='rock')return false;
 const dx=(p.x-d.x)*32,dy=(p.y-d.y)*32;
 const width=d.kind==='cypress'?34:d.kind==='pine'?50:83;
 return Math.abs(dx)<width+18&&dy<-16&&dy>(d.kind==='cypress'?-193:-180);
}
export function drawAtlasTreeCanopy(c,d,people=[]){
 const openings=people.filter(p=>atlasCanopyCovers(d,p));
 if(!openings.length){crown(c,d);return;}
 const window=p=>{const path=new Path2D();path.ellipse((p.x+.5)*32,(p.y+.5)*32-7,22,29,0,0,Math.PI*2);return path;};
 c.save();
 for(const p of openings){const outside=new Path2D();outside.rect(-256,-256,992,992);outside.moveTo((p.x+.5)*32+22,(p.y+.5)*32-7);outside.ellipse((p.x+.5)*32,(p.y+.5)*32-7,22,29,0,0,Math.PI*2,true);outside.closePath();c.clip(outside);}
 crown(c,d);c.restore();
 // Only the leaves over a person or an exit thin out; the rest keeps its mass.
 for(const p of openings){c.save();c.clip(window(p));c.globalAlpha*=.22;crown(c,d);c.restore();}
}

// The two authored waterside trees keep their original occupied columns and
// bench. Only this atlas rendition replaces their flat umbrella-like crowns.
export function drawWoodlandSite(c,s){
 if(!['west-lane','west-impression','west-dots'].includes(s.form))return false;
 const x=s.x*32,y=s.y*32,w=s.w*32,base=y+s.h*32;
 const palette=['#78936f','#bbc99c','#8cb0b0','#486c55'];
 for(const [i,xx] of [x+16,x+w-16].entries()){
  E(c,xx,base-6,23,6,'#405d4026');
  P(c,[[xx-10,base],[xx-8,y-38],[xx-4,y-63],[xx+4,y-65],[xx+8,y-36],[xx+10,base]],'#817c60');
  P(c,[[xx-8,base-4],[xx-5,y-35],[xx-1,y-60],[xx+1,y-60],[xx-1,base-3]],'#b1a47f');
  P(c,[[xx-4,y-30],[xx-26,y-58],[xx-25,y-66],[xx+3,y-37]],'#817c60');
  crown(c,{x:(xx-16)/32,y:(y+40)/32,kind:s.form==='west-lane'?'orchard':'willow',palette,seed:.23+i*.31});
 }
 R(c,x+w/2-45,base-17,90,9,'#a68c6c');R(c,x+w/2-43,base-17,86,2,'#cbbb95');
 for(let i=0;i<4;i++)R(c,x+w/2-31+i*19,base-14,8,1,'#87795e');
 return true;
}
