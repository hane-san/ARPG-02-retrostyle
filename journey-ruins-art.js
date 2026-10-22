// Lightweight deterministic 32px raster study. No remote images or particle loops.
import {RUINS_PALETTE,RUINS_ACTIVATED} from './journey-ruins.js';
export const RUINS_TILES=new Set(Object.keys(RUINS_PALETTE));
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function noise(x,y,k=0){let z=Math.imul(x+41,374761393)^Math.imul(y+17,668265263)^Math.imul(k+3,2246822519);z=Math.imul(z^(z>>>13),1274126177);return((z^(z>>>16))>>>0)/4294967295;}
export function drawRuinsTile(c,x,y,t){
 const px=x*32,py=y*32,n=noise(x,y),q=noise(y,x);
 rect(c,px,py,32,32,RUINS_PALETTE[t]);
 if(t==='U'){
  // Pool: visibly impassable, unlike the pale plank tiles.
  rect(c,px,py+2,32,6,'#79a7ab');
  rect(c,px+2+n*12,py+12,13,1,'#bbd6ce');
  rect(c,px+8+q*11,py+23,8,1,'#c5e0d8');
 }else if(t==='M'){
  rect(c,px+3,py+1,25,31,'#363c4f');rect(c,px+5,py+3,3,28,'#72768b');
  poly(c,[[px+28,py+1],[px+31,py+7],[px+31,py+32],[px+28,py+31]],'#262e3f');
  if(y%3===0){rect(c,px+11,py+20,2,8,'#776a9d');rect(c,px+11,py+27,12,1,'#a69ab9');}
 }else if(t==='R'){
  // Broken wall footprint, intentionally solid.
  rect(c,px+1,py+6,30,22,'#77746f');rect(c,px+3,py+4,27,7,'#aca599');
  rect(c,px+3,py+11,4,16,'#c7b9a5');rect(c,px+18,py+11,2,13,'#5d6769');
  if(n>.45)rect(c,px+17,py+4,12,2,'#e2d2b8');
 }else if(t==='K'){
  for(let i=0;i<4;i++){rect(c,px,py+i*8,32,6,i%2?'#a9aca7':'#ded5be');rect(c,px,py+i*8+6,32,2,'#858e8e');}
  rect(c,px+7,py+2,3,3,'#eff0d7');
 }else if(t==='P'){
  // Causeway visibly bridges impassable blue shallows.
  rect(c,px,py,32,32,'#83abb0');
  for(let i=0;i<3;i++){rect(c,px,py+i*11,32,9,'#b7c7b7');rect(c,px,py+i*11+8,32,2,'#728f96');}
  rect(c,px+5,py+1,2,29,'#e6dec6');
 }else if(t==='F'){
  for(let i=0;i<3;i++){const yy=py+i*10;rect(c,px,yy,32,9,i%2?'#c8beaa':'#ddd0ba');rect(c,px+3+(i%2)*11,yy+8,19,1,'#aca99c');}
  if(n>.72)rect(c,px+23,py+5,4,3,'#8e9a94');
 }else if(t==='A'){
  const seam=(x+Math.floor(y/3))%5===0;
  if(seam)rect(c,px+14,py+1,2,28,'#aaa48f');
  if(q>.3){rect(c,px+2,py+24,23,1,'#e0d0b4');rect(c,px+21,py+7,9,2,'#b0a58f');}
  if(n>.77){rect(c,px+5,py+9,12,4,'#d9ceb7');rect(c,px+5,py+14,2,11,'#928f82');}
 }else if(t==='B'){
  rect(c,px+3,py+8+Math.round(n*8),23,2,'#8c8893');
  rect(c,px+23,py+2,2,22,'#636577');
  if(q>.67){rect(c,px+8,py+16,14,1,'#b1a8c5');rect(c,px+14,py+8,1,17,'#9790ad');}
 }else if(t==='C'){
  for(let i=0;i<3;i++){rect(c,px+i*12,py+9+Math.round(q*8),11,2,'#c4cfbf');rect(c,px+i*12+2,py+25,7,1,'#6e999b');}
  if(n>.67){rect(c,px+7,py+3,2,11,'#7c9798');rect(c,px+19,py+4,2,9,'#e2dec7');}
 }else if(t==='D'){
  for(let i=0;i<4;i++)rect(c,px+i*8,py+2+Math.round(noise(x+i,y)*12),8,3,'#d3d7c9');
  if(n>.78)rect(c,px+19,py+14,9,9,'#819a9e');
 }
}
export function drawRuinsSite(c,s,x,y,w,h,cx,time){
 const on=RUINS_ACTIVATED.has(s.id),ground=y+h-15;
 const color=s.form==='monolith'||s.form==='echo'?'#687384':'#a4ada7';
 rect(c,x+8,ground,w-16,7,'#9caaa4');
 const pillar=(xx,top,wide=11)=>{rect(c,xx,top,wide,ground-top,color);rect(c,xx+2,top+4,2,ground-top-6,'#d7d1bf');};
 const glow=(xx,yy)=>{if(on){rect(c,xx-8,yy-3,16,3,'#b6c7e8');rect(c,xx-1,yy-10,2,17,'#e6d6fc');}};
 if(s.form==='gate'||s.form==='echo'){
  pillar(x+16,y+29,16);pillar(x+w-32,y+35,16);
  rect(c,x+13,y+23,w-23,12,s.form==='echo'?'#63667a':'#b6a78f');
  for(let i=0;i<4;i++)rect(c,x+20+i*18,y+24,8,3,'#d8c6ad');
  glow(cx,y+40);
 }else if(s.form==='monolith'){
  poly(c,[[x+27,ground],[x+19,y+12],[x+w-43,y+4],[x+w-19,y+19],[x+w-18,ground]],'#35394b');
  poly(c,[[x+19,y+12],[x+w-43,y+4],[x+w-49,ground],[x+27,ground]],'#636c78');
  rect(c,cx-2,y+28,3,h-55,on?'#b5a9dc':'#6b687e');glow(cx,ground-24);
 }else if(s.form==='seal'||s.form==='dial'){
  c.save();c.strokeStyle=on?'#c5e0eb':'#6b9095';c.lineWidth=7;c.beginPath();
  c.ellipse(cx,y+h*.54,w*.31,h*.25,0,0,Math.PI*2);c.stroke();
  c.strokeStyle='#d7d1b8';c.lineWidth=3;c.beginPath();c.ellipse(cx,y+h*.54,w*.18,h*.13,0,0,Math.PI*2);c.stroke();c.restore();
  glow(cx,y+h*.54);
 }else if(s.form==='outlook'||s.form==='watch'){
  for(let i=0;i<4;i++)pillar(x+15+i*(w-32)/4,y+34+(i%2)*13,8);
  rect(c,x+9,y+29,w-17,9,'#81969a');rect(c,x+12,y+28,w-22,3,'#e1dcc9');
  poly(c,[[cx-13,y+30],[cx,y+8],[cx+13,y+30]],'#dae4dd');
  // Three remote pinnacles hint at the view without pretending to be walkable.
  for(let i=0;i<3;i++)rect(c,cx-22+i*15,y+14+(i%2)*7,7,13,'#9bc6c8');
  glow(cx,ground-27);
 }else if(s.form==='bridge'||s.form==='stairs'){
  for(let i=0;i<5;i++){const xx=x+11+i*(w-20)/5;
   rect(c,xx,y+35+i%2*6,(w-32)/5,ground-y-40,i%2?'#bbc8b5':'#a0ada7');
   rect(c,xx,y+34+i%2*6,(w-32)/5,4,'#e3dcc2');}
  glow(cx,y+43);
 }else if(s.form==='bell'){
  pillar(x+19,y+40);pillar(x+w-29,y+40);
  rect(c,x+10,y+33,w-20,8,'#aab3ab');poly(c,[[x+12,y+33],[cx,y+9],[x+w-12,y+33]],'#c4c8bb');
  rect(c,cx-13,y+51,26,19,'#627c89');glow(cx,y+52);
 }else{
  for(let i=0;i<4;i++)pillar(x+14+i*(w-29)/4,y+29+(i%2)*7,8);
  rect(c,x+7,y+26,w-15,10,'#a0a9a1');glow(cx,y+35);
 }
 // A pulse after investigation gives an immediate, persistent scene change.
 if(on){const pulse=.45+.3*Math.sin(time*.003);
  c.save();c.globalAlpha=pulse;rect(c,cx-5,ground-18,11,2,'#f3e3fd');c.restore();
 }
}
