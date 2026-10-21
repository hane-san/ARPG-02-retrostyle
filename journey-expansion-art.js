// Raster art for the six outlying journey experiments. No image downloads.
import {EXTENSION_PALETTE} from './journey-expansion.js';
export const EXPANSION_TILES=new Set(Object.keys(EXTENSION_PALETTE));
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function polygon(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function noise(x,y,k=0){let z=Math.imul(x+65,374761393)^Math.imul(y+11,668265263)^Math.imul(k+5,2246822519);z=Math.imul(z^(z>>>13),1274126177);return((z^(z>>>16))>>>0)/4294967295;}
export function drawExpansionTile(c,x,y,t,world){
 const px=x*32,py=y*32,n=noise(x,y),q=noise(y,x);
 rect(c,px,py,32,32,EXTENSION_PALETTE[t]||'#c4c8b5');
 if(t==='W'){
  if(n>.22)rect(c,px+2+n*15,py+8+q*14,11,1,'#c6ddd0');
  if(q>.53)rect(c,px+4,py+26,19,1,'#8cc4bb');
  return;
 }
 if(t==='Y'){
  for(let i=0;i<4;i++)polygon(c,[[px+i*8,py+32],[px+i*8+6,py+5+n*9],[px+i*8+9,py+32]],i%2?'#7d8f91':'#667c85');
  if(world.tileAt(x,y-1)!=='Y')rect(c,px,py,32,3,'#c4c4b8');
  return;
 }
 if(t==='c'||t==='r'){
  // Broad ochre seams trace sediment, never a tiled checkerboard.
  if(y%4===0)rect(c,px,py+15,32,2,t==='r'?'#be8d80':'#d6a08b');
  for(let i=0;i<3;i++){const xx=px+noise(x+i,y,4)*28,yy=py+noise(x,y+i,8)*26;rect(c,xx,yy,10,1,i===0?'#e3c0a9':'#97796f');}
  if(n>.76)rect(c,px+8,py+20,4,8,'#b79786');
 }else if(t==='m'){
  for(let i=0;i<5;i++){const xx=px+i*7,yy=py+6+noise(x+i,y)*15;rect(c,xx,yy,6,2,i%2?'#d4d7c9':'#7f9caa');}
  if(q>.85)polygon(c,[[px+8,py+24],[px+17,py+4],[px+26,py+24]],'#e5e4d5');
 }else if(t==='a'||t==='j'){
  const bright=t==='j'?'#c5d6ad':'#bcd4bf',shadow=t==='j'?'#789d81':'#779d95';
  for(let i=0;i<3;i++){const xx=px+4+i*9+noise(x,i,6)*3,yy=py+15+noise(y,i,8)*11;
   rect(c,xx,yy,2,11,shadow);rect(c,xx-2,yy-3,6,4,bright);}
  if(n>.78)rect(c,px+17,py+27,12,1,'#e1dfb5');
 }else if(t==='H'){
  for(let i=0;i<2;i++){const xx=px+5+i*16;rect(c,xx,py+4,2,23,'#dbe0df');rect(c,xx+4,py+4,1,21,'#829cad');}
  if(n>.5)rect(c,px+3,py+22,24,2,'#ccd8d0');
  if(q>.8)rect(c,px+15,py+8,5,9,'#e7e6d2');
 }else if(t==='z'||t==='o'){
  for(let i=0;i<3;i++){const xx=px+i*11,yy=py+7+noise(x+i,y,3)*18;
   rect(c,xx,yy,12,2,i%2?'#f1e9d8':t==='z'?'#c8c7bd':'#cbaea0');}
  if(n>.8)rect(c,px+22,py+17,3,3,'#a6adb1');
 }
}
export function drawExpansionSite(c,s,x,y,w,h,cx,time){
 const line='#677e85',light='#e6e0ca',stone='#aeb9b2',warm='#caa895',dark='#506a77';
 const r=(rx,ry,rw,rh,color)=>rect(c,rx,ry,rw,rh,color);
 const ground=y+h-19;
 const base=()=>{polygon(c,[[x+8,ground],[x+w-8,ground],[x+w-3,ground+10],[x+8,ground+10]],'#c5c8b4');r(x+12,ground,w-24,2,light);};
 const pillar=(px,top,hh,col=stone)=>{r(px,top,9,hh,col);r(px,top,3,hh,light);};
 base();
 if(s.form==='gauge'){
  for(let i=0;i<5;i++){const px=x+17+i*(w-35)/5;
   r(px,y+20+(i%2)*13,8,ground-y-30,stone);
   for(let j=0;j<4;j++)r(px+1,y+38+j*19,6,2,j%2?dark:light);}
 }else if(s.form==='temple'){
  pillar(x+18,y+43,h-70);pillar(x+w-33,y+43,h-70);
  polygon(c,[[x+4,y+42],[cx,y+10],[x+w-4,y+42]],warm);
  r(cx-18,y+46,36,h-66,dark);r(cx-12,y+52,24,3,light);
 }else if(s.form==='bell'){
  pillar(x+25,y+44,h-68);pillar(x+w-39,y+44,h-68);
  r(x+20,y+35,w-43,13,line);polygon(c,[[x+12,y+38],[cx,y+5],[x+w-13,y+38]],light);
  r(cx-8,y+52,16,17,'#c6ac8e');r(cx-2,y+65,4,6,dark);
 }else if(s.form==='spring'){
  r(x+23,y+35,w-46,13,stone);
  for(let i=0;i<5;i++)r(x+31+i*(w-62)/5,y+50,6,ground-y-54,i%2?'#91b8b6':light);
  r(x+20,ground-14,w-40,7,'#78b5b8');r(x+25,ground-9,w-50,3,'#e1ebda');
 }else if(s.form==='pier'){
  polygon(c,[[x+8,y+45],[x+w-9,y+45],[x+w-39,ground],[x+29,ground]],'#ad9990');
  for(let i=0;i<5;i++)r(x+23+i*(w-45)/5,y+47,5,h-66,dark);
  r(x+27,y+48,w-54,6,light);
  r(cx-3,y+15,6,33,line);polygon(c,[[cx+3,y+16],[cx+52,y+44],[cx+3,y+40]],'#e8dbbf');
 }else if(s.form==='wheel'){
  const rad=Math.min(w*.27,h*.31);c.strokeStyle=dark;c.lineWidth=8;c.beginPath();c.arc(cx,y+h*.54,rad,0,Math.PI*2);c.stroke();
  c.strokeStyle=light;c.lineWidth=3;for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(cx,y+h*.54);c.lineTo(cx+Math.cos(a)*rad,y+h*.54+Math.sin(a)*rad);c.stroke();}
  r(cx-5,y+10,10,30,stone);
 }else if(s.form==='glass'){
  for(let i=0;i<5;i++){const xx=x+12+i*(w-24)/5;
   polygon(c,[[xx,y+35],[xx+30,y+13],[xx+34,ground],[xx+3,ground]],i%2?'#a6c5c4':'#cddbd2');
   r(xx+6,y+49,3,ground-y-50,light);}
  r(cx-10,ground-39,20,37,'#789daa');
 }else if(s.form==='garden'){
  r(x+19,y+43,w-38,8,light);
  for(let i=0;i<5;i++){const xx=x+25+i*(w-50)/5;
   r(xx,y+55,5,ground-y-55,dark);r(xx-13,y+39,28,22,i%2?'#8caf9e':'#b3c7a3');
   r(xx-8,y+28,18,21,'#bfd2b1');}
 }else if(s.form==='stilt'){
  for(let i=0;i<5;i++)r(x+20+i*(w-40)/5,y+55,5,ground-y-44,line);
  r(x+12,y+44,w-24,24,'#c6c5af');
  polygon(c,[[x+5,y+46],[cx,y+15],[x+w-5,y+46]],'#8caba3');
  r(cx-10,y+49,20,18,dark);r(x+22,y+50,14,8,light);
 }else if(s.form==='shrine'){
  r(x+20,y+45,w-40,35,stone);polygon(c,[[x+9,y+47],[cx,y+12],[x+w-9,y+47]],'#b9aaa2');
  for(let i=0;i<7;i++){r(x+27+i*(w-54)/7,ground-18,4,8,'#89ada7');}
  r(cx-8,y+54,16,23,dark);
 }else if(s.form==='columns'){
  for(let i=0;i<7;i++){const xx=x+14+i*(w-28)/7;
   pillar(xx,y+27+(i%2)*3,ground-y-30,i%2?'#b4c5ba':'#8c9ca3');}
  r(x+8,y+21,w-19,10,line);r(x+11,y+21,w-26,3,light);
 }else if(s.form==='inn'){
  r(x+12,y+40,w-24,ground-y-40,'#c8b9ab');
  polygon(c,[[x+2,y+43],[cx,y+8],[x+w-2,y+43]],'#b09a94');
  for(let i=0;i<3;i++){r(x+24+i*(w-48)/3,y+51,19,23,'#86a9ab');r(x+24+i*(w-48)/3,y+79,19,5,light);}
  r(cx-12,ground-33,24,32,dark);r(cx-3,ground-21,3,3,'#e9d7ab');
 }
 // Simple shadow geometry to emphasize the scale without animations or particles.
 r(x+18,ground+8,w-35,2,'#687f803f');
}
