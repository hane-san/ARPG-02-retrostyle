import {landscapeHash as hash,landscapeNoise} from './landscape-geometry.js';
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const P=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const L=(c,x,y,a,b,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
export function southeastTileColor(world,x,y){
 const z=world.zoneAt(x,y);if(!z.southeast)return null;
 const t=world.tileAt(x,y),p=z.palette;
 return t==='L'?p[2]:t==='X'||t==='se-wall'?p[3]:t==='se-boardwalk'?'#a58c6b':t==='='||t==='se-stair'||t==='se-stonebridge'?p[1]:p[0];
}
export function drawSoutheastTile(c,x,y,t,world){
 const z=world.zoneAt(x,y);if(!z.southeast)return false;
 const px=x*32,py=y*32,[g,l,w,s]=z.palette,q=hash(x,y),b=landscapeNoise(x,y,11),key=z.key;
 R(c,px,py,32,32,southeastTileColor(world,x,y));
 if(t==='L'){
  if(b>.58)R(c,px,py,32,32,key==='coast'?'#94b5c4':'#91bdb8');
  if(q>.4)L(c,px+3,py+8+q*12,px+23,py+7+q*12,l+'77',1);
  // Actual land edges, rather than an illustrative shore pasted over water.
  for(const [dx,dy,a,b,ww,hh] of [[0,-1,0,0,32,3],[-1,0,0,0,3,32],[1,0,29,0,3,32],[0,1,0,29,32,3]])if(world.walkable(x+dx,y+dy)&&!world.tileAt(x+dx,y+dy).includes('bridge')&&world.tileAt(x+dx,y+dy)!=='se-boardwalk')R(c,px+a,py+b,ww,hh,key==='coast'?'#dedcc5':l+'bb');
  return true;
 }
 if(t==='se-boardwalk'||t==='se-stonebridge'){
  const wood=t==='se-boardwalk';R(c,px,py,32,32,wood?'#a58c6b':'#b8b9ac');
  for(let j=3;j<32;j+=wood?7:11)L(c,px,py+j,px+32,py+j,wood?'#dec99f':'#e3dfc5',2);
  if(world.tileAt(x-1,y)==='L')R(c,px,py,3,32,s);if(world.tileAt(x+1,y)==='L')R(c,px+29,py,3,32,s);
  if(!wood&&q>.7)R(c,px+12,py+6,1,13,s+'55');return true;
 }
 if(t==='se-stair'){for(let j=3;j<32;j+=5){R(c,px,py+j,32,2,l);R(c,px,py+j+2,32,1,s);}return true;}
 if(t==='X'||t==='se-wall'){
  const mesa=key==='mesa',edge=world.walkable(x,y-1);
  if(edge)R(c,px,py,32,5,l);
  if(mesa){for(let j=0;j<3;j++){const yy=py+6+j*9+Math.round(2*Math.sin(x*.09));R(c,px,yy,32,3,['#d0aa83','#a5826c','#c39b78'][j]);}if(q>.8)L(c,px+18,py+2,px+11,py+28,'#755c5355',2);}
  else if(key==='marsh'){if(q>.65)for(let j=0;j<3;j++)L(c,px+j*11,py+31,px+j*11-5,py+9,g,2);}
  else{P(c,[[px,py+32],[px+4,py+8],[px+17,py+3],[px+29,py+17],[px+32,py+32]],g);L(c,px+4,py+8,px+17,py+3,l+'88',2);}return true;
 }
 if(t==='='){if(q>.8){L(c,px+8,py+22,px+19,py+22,s+'44');R(c,px+5,py+11,4,1,g);}return true;}
 if(key==='mesa'){
  if(b>.57)R(c,px,py,32,32,'#d6b893');if(q>.78){L(c,px+3,py+21,px+29,py+18,'#a6866d88');L(c,px+18,py+19,px+22,py+8,'#a6866d55');}
 }else if(key==='coast'){
  if(b>.56)R(c,px,py,32,32,'#d2d0bb');if(q>.83){E(c,px+10,py+22,5,3,l);L(c,px+4,py+9,px+24,py+11,s+'44');}
 }else{
  if(b>.58)R(c,px,py,32,32,key==='port'?'#b7c3a0':'#b8c7ad');
  if(q>.65)for(let j=0;j<2;j++)L(c,px+7+j*16,py+23,px+11+j*15,py+16,s+'66');
 }
 return true;
}
function house(c,x,y,w,h,p,kitchen){
 const [g,l,,s]=p;
 R(c,x,y,w,h,s);R(c,x+5,y+5,w-10,h-5,'#d2ba90');
 P(c,[[x-12,y+8],[x+25,y-65],[x+w-25,y-65],[x+w+12,y+8]],'#6d8f81');
 for(let i=0;i<5;i++)L(c,x+8+i*w/5,y+4,x+29+i*(w-55)/5,y-61,l+'66',2);
 for(let i=22;i<w-16;i+=48){R(c,x+i,y+28,28,39,s);R(c,x+i+2,y+30,24,30,'#b7d3c4');R(c,x+i+12,y+28,3,39,l);R(c,x+i-4,y+66,36,5,l);}
 R(c,x+w*.5-18,y+h-55,36,55,'#576c65');R(c,x+w*.5-15,y+h-52,25,52,g);
 if(kitchen){
  R(c,x+16,y+h-30,w-32,6,l);for(let i=0;i<5;i++){E(c,x+28+i*(w-55)/5,y+h-34,9,4,'#f0dec0');L(c,x+30+i*(w-55)/5,y+h-48,x+34+i*(w-55)/5,y+h-58,'#e6dfc477',2);}
  R(c,x+w-54,y-67,22,38,s);R(c,x+w-57,y-72,28,6,l);
 }
 L(c,x-17,y+35,x+w+17,y+41,s,2);for(let i=0;i<6;i++)R(c,x+10+i*(w-25)/6,y+38,17,21,['#bd8f77','#c0d0bd','#e5cb98'][i%3]);
}
export function drawSoutheastSite(c,s,time){
 const x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,base=y+h,p=['#9bb09b','#e8d5ad','#8bb8bc','#6b857e'];
 if(s.form==='se-home'||s.form==='se-kitchen'){house(c,x,y,w,h,p,s.form==='se-kitchen');return;}
 if(s.form==='se-windarch'||s.form==='se-seaarch'){
  const sea=s.form==='se-seaarch',rise=sea?185:215,col=sea?'#889ca0':'#a47e67',lit=sea?'#d6d6c1':'#dfbb8f';
  // Feet exactly match the two 2×2 solid piers. The opening stays walkable.
  P(c,[[x,base],[x,base-64],[x+9,y-rise*.5],[x+88,y-rise],[x+w-100,y-rise-19],[x+w-12,y-rise*.42],[x+w,base-64],[x+w,base],[x+w-64,base],[x+w-64,y+34],[x+w-110,y-rise*.48],[x+111,y-rise*.44],[x+64,y+34],[x+64,base]],col);
  L(c,x+9,y-rise*.5,x+88,y-rise,lit,12);L(c,x+88,y-rise,x+w-100,y-rise-19,lit,10);
  for(let i=0;i<8;i++)L(c,x+70+i*(w-140)/8,y-rise+24+Math.sin(i)*7,x+72+i*(w-140)/8,y-rise+56,lit+'88',3);
  R(c,x,base-64,64,64,col);R(c,x+w-64,base-64,64,64,col);
  if(sea){for(let i=0;i<5;i++){L(c,x+5,base-13-i*9,x+58,base-15-i*9,lit+'88',2);L(c,x+w-60,base-9-i*9,x+w-3,base-12-i*9,lit+'88',2);}}
  else for(let i=0;i<4;i++)L(c,x+8,base-14-i*14,x+53,base-12-i*14,lit,2);
  return;
 }
 if(s.form==='se-waterwheel'){
  const cx=x+w*.5,cy=y+h*.48,r=Math.min(w,h)*.46;
  c.save();c.translate(cx,cy);c.rotate(time/10000);c.strokeStyle='#937e61';c.lineWidth=9;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();
  for(let i=0;i<12;i++){c.rotate(Math.PI/6);L(c,0,0,r,0,'#937e61',5);R(c,r-8,-15,21,30,'#d4bd91');}c.restore();
  for(const r of s.solid)R(c,x+r.x*32,y+r.y*32,r.w*32,r.h*32,'#788a7e');
  L(c,x+w-25,y+20,x+w+68,y+20,'#d2c3a4',9);L(c,x+w-25,y+20,x+w+68,y+20,'#89b8b3',4);return;
 }
 const pier=s.form==='se-pier';
 if(!pier){P(c,[[x-17,y+20],[x+w*.5,y-69],[x+w+17,y+20]],'#829780');L(c,x-17,y+20,x+w+17,y+20,p[1],7);}
 for(const r of s.solid){R(c,x+r.x*32,y+r.y*32,r.w*32,r.h*32,p[3]);R(c,x+r.x*32+3,y+r.y*32+3,r.w*32-6,5,p[1]);}
 R(c,x+71,base-19,w-142,8,'#b69c75');
 for(let j=0;j<3;j++){R(c,x+77+j*28,base-40,19,19,['#d8c6a1','#b5c1a1','#93aaa1'][j]);}
}
