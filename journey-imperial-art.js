// Original, code-native pixel art. No downloaded images, particles or runtime dependencies.
import {IMPERIAL_PALETTE,imperialPhase} from './journey-imperial.js';
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
const line=(c,x,y,a,b,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(Math.round(x),Math.round(y));c.lineTo(Math.round(a),Math.round(b));c.stroke();};
const noise=(x,y)=>{let v=Math.imul(x+31,374761393)^Math.imul(y+23,668265263);v=Math.imul(v^(v>>>13),1274126177);return((v^(v>>>16))>>>0)/4294967295;};
const reducedMotion=typeof globalThis.matchMedia==='function'?globalThis.matchMedia('(prefers-reduced-motion: reduce)'):null;
const stone='#c9c4ae',light='#e8dfc7',shade='#969b8d',dark='#52645f',water='#749f9c';
function masonry(c,x,y,w,h,base=stone){
 rect(c,x,y,w,h,base);
 for(let yy=10;yy<h;yy+=12){line(c,x,y+yy,x+w,y+yy,shade,1);
  for(let xx=(yy/12%2)*12;xx<w;xx+=26)line(c,x+xx,y+yy-10,x+xx,y+yy,shade,1);}
 rect(c,x,y,Math.min(3,w),h,light);
}
function column(c,x,y,h,w=10){masonry(c,x,y,w,h);rect(c,x-3,y-3,w+6,5,light);rect(c,x-3,y+h-3,w+6,5,shade);}
function steps(c,x,y,w,h,count=5){for(let i=0;i<count;i++){
 const yy=y+i*h/count;rect(c,x-i*3,yy,w+i*6,h/count+1,i%2?stone:light);line(c,x-i*3,yy+h/count,x+w+i*3,yy+h/count,shade,1);
}}
function basin(c,x,y,w,h,wet){
 rect(c,x,y,w,h,shade);rect(c,x+4,y+4,w-8,h-8,wet?water:'#d4c6a7');
 if(wet){for(let i=0;i<4;i++)rect(c,x+10+i*17,y+7+(i%2)*8,13,1,'#d4dfce');}
 else{line(c,x+10,y+9,x+w*.6,y+h*.7,'#b3aa91',1);line(c,x+w*.6,y+h*.7,x+w-7,y+h-5,'#b3aa91',1);}
}
export function drawImperialTile(c,x,y,t,world){
 const px=x*32,py=y*32,n=noise(x,y);
 rect(c,px,py,32,32,IMPERIAL_PALETTE[t]);
 if(t==='study-water'){
  for(let i=0;i<3;i++)if(noise(x+i,y)>.3)rect(c,px+3+noise(y+i,x)*12,py+6+i*8,9+Math.floor(n*7),1,'#b8d0c1');
  for(const [dx,dy,xx,yy,ww,hh] of [[-1,0,0,0,3,32],[1,0,29,0,3,32],[0,-1,0,0,32,3],[0,1,0,29,32,3]])
   if(!['study-water','+'].includes(world.tileAt(x+dx,y+dy)))rect(c,px+xx,py+yy,ww,hh,stone);
 }else if(t==='study-masonry')masonry(c,px,py-14,32,46);
 else if(t==='study-black'){
  rect(c,px+2,py-16,28,48,'#454d50');rect(c,px+2,py-16,3,48,'#7d8681');rect(c,px+24,py-16,6,48,'#343e44');
 }else if(t==='study-cliff'){
  poly(c,[[px,py+30],[px+3,py+5],[px+14,py-4],[px+28,py+4],[px+32,py+32]],'#7d8989');
  line(c,px+5,py+7,px+14,py-2,'#b7b9aa');
 }else{
  for(let i=0;i<3;i++){const xx=px+noise(x+i,y+2)*26,yy=py+noise(y+i,x+1)*28;
   rect(c,xx,yy,3+n*6,1,t==='study-meadow'?'#bfcca9':t==='study-silt'?'#ede0c3':'#dcd5bc');}
  if(t==='study-silt'&&y%4===0&&n>.3)line(c,px,py+18,px+32,py+15,'#beb69e',1);
  if(t==='study-stone'&&n>.65){line(c,px+4,py+28,px+17,py+18,'#a3a594',1);line(c,px+17,py+18,px+25,py+20,'#a3a594',1);}
 }
}
export function drawImperialSite(c,s,x,y,w,h,cx,time=0){
 const ground=y+h-13,phase=imperialPhase(s.id),active=phase>0;
 const reduced=!!reducedMotion?.matches;
 const tick=reduced?0:Math.sin(time*.0012)*2;
 if(s.form==='confluence'){
  steps(c,x+30,ground-28,w-60,24,4);
  for(let i=0;i<3;i++){
   const xx=x+30+i*(w-60)/3;masonry(c,xx,y+24,28,h-80);basin(c,xx-10,y+65,48,22,true);
   line(c,xx+14,y+88,cx,ground-44,active&&i===phase%3?'#b4c9b8':water,active&&i===phase%3?10:8);
  }
  basin(c,cx-35,ground-65,70,25,true);
  for(const xx of [x+10,x+w-24])column(c,xx,y+20,h-38,14);
  rect(c,cx-16,ground-17,32,4,'#947e61');
 }else if(s.form.startsWith('receiving-')){
  const wet=s.form==='receiving-wet';
  poly(c,[[x+8,ground],[x+24,y+38],[x+w-24,y+38],[x+w-8,ground]],wet?'#a7b7a1':'#c8b899');
  for(let i=0;i<3;i++)for(const side of [-1,1]){
   const xx=cx+side*(w*.34)-6,yy=y+35+i*(h-80)/3;
   basin(c,xx-side*8,yy+30,30,27,wet);column(c,xx,yy,Math.max(42,h*.28),12);
  }
  steps(c,cx-28,ground-26,56,24,5);basin(c,cx-24,y+70,48,24,wet);
  line(c,cx,y+96,cx,ground-32,wet?water:'#afa88c',wet?6:3);
  if(!wet)for(let i=0;i<5;i++)rect(c,x+28+i*47,ground-8,8,2,'#a7ac89');
 }else if(s.form==='sealed'){
  masonry(c,x+12,y+32,w-24,h-45,'#b7b9aa');
  poly(c,[[x+5,y+33],[cx,y+13],[x+w-5,y+33]],'#d4cfb7');
  rect(c,x+16,y+47,w-32,6,'#e2dcc6');
  // One hand-wide aperture; no doorway, console, screen or humanoid attendant.
  rect(c,cx-3,ground-42,6,24,dark);rect(c,cx-2,ground-41,2,22,'#858a7a');
  if(active)rect(c,cx-4,ground-39+(phase%2)*8,8,7,stone);
  for(let i=0;i<5;i++)rect(c,x+27+i*(w-54)/5,y+58,5,4,'#8f9787');
 }else if(s.form==='echo-court'){
  for(let i=0;i<4;i++){
   const xx=x+25+i*(w-50)/4,yy=y+35+(i%2)*25;
   c.strokeStyle=shade;c.lineWidth=7;c.beginPath();c.ellipse(xx,yy,22,11,0,0,Math.PI*2);c.stroke();
   line(c,xx-15,yy-6,xx+15,yy-6,active&&i===phase%4?'#f1e5be':light,active&&i===phase%4?4:2);
  }
  steps(c,cx-25,ground-17,50,15,3);
 }else if(s.form==='monolith'){
  for(const [xx,ww,top] of [[x+14,w*.39,y+12],[cx+6,w*.32,y+24]]){
   poly(c,[[xx,ground],[xx-3,top],[xx+ww-10,top-8],[xx+ww,top+2],[xx+ww-2,ground-3]],'#424e51');
   line(c,xx,ground,xx-3,top,'#8c958c',3);rect(c,xx+ww-9,top+4,7,ground-top-7,'#303e44');
   for(let i=0;i<4;i++)rect(c,xx+5,ground-55-i*37,ww-13,2,'#737f78');
  }
 }else if(s.form==='acropolis'){
  steps(c,x+35,ground-86,w-70,78,7);
  for(let tier=2;tier>=0;tier--){
   const yy=y+30+tier*45,margin=45-tier*12;
   masonry(c,x+margin,yy,w-margin*2,42,'#b8b49f');
   for(let i=0;i<8;i++)column(c,x+margin+10+i*(w-margin*2-20)/8,yy-25,40,10);
  }
  for(const [xx,hh] of [[x+18,95],[x+w-44,131]])masonry(c,xx,y+15,25,hh,'#a5ad9e');
 }else if(s.form==='gate'){
  const opening=w*.25;
  for(const [xx,ww] of [[x+8,(w-opening)/2-8],[cx+opening/2,(w-opening)/2-8]])masonry(c,xx,y+18,ww,h-32);
  masonry(c,x+5,y+8,w-10,28);rect(c,x+12,y+9,w-24,3,light);
  steps(c,cx-opening/2,ground-9,opening,8,2);
 }else if(s.form==='niche'){
  masonry(c,x+16,y+8,w-32,h-24,'#acae9e');rect(c,x+32,y+28,w-64,h-66,dark);
  // Only a fragment: it does not rise, track the player or become a literal god.
  poly(c,[[cx-24,ground-25],[cx-29,y+105],[cx-8,y+78],[cx+18,y+90],[cx+25,ground-25]],'#d4ccb4');
  line(c,cx-4,y+96,cx+9,ground-28,'#a6aa99',4);rect(c,cx-3,ground-23,6,5,'#4a5c5b');
 }else if(s.form==='cistern'){
  // Terraces recede inward; the empty volume is legible without a roof or a time switch.
  for(let i=0;i<6;i++)rect(c,x+9+i*12,y+22+i*12,w-18-i*24,h-40-i*23,i%2?shade:stone);
  rect(c,x+85,y+105,w-170,h-143,'#a7a78f');
  for(let i=0;i<8;i++)column(c,x+20+i*(w-40)/8,y+20,32,7);
 }else if(s.form==='inn'){
  masonry(c,x+15,y+43,w-30,h-62,'#bcb39c');
  poly(c,[[x+3,y+45],[cx,y+8],[x+w-3,y+45]],'#a18976');
  rect(c,cx-15,ground-43,30,43,dark);
  for(const xx of [x+31,x+w-62]){rect(c,xx,y+67,28,22,'#ddc18a');rect(c,xx+12,y+67,3,22,'#8c816a');}
  line(c,x+24,y+29,x+w-26,y+29,'#c1a47b',4);
 }else if(s.form.startsWith('stairs-')){
  steps(c,x+25,y+21,w-50,h-45,7);
  basin(c,x+15,ground-25,w-30,20,s.form==='stairs-wet');
  c.strokeStyle=shade;c.lineWidth=4;c.beginPath();c.arc(x+w-17,y+42,9,0,Math.PI*2);c.stroke();
 }else if(s.form==='pier'||s.form==='bridge'){
  const base=s.form==='pier'?y+28:y+45;
  for(let i=0;i<6;i++)column(c,x+14+i*(w-28)/6,base+13,h-(base-y)-32,8);
  masonry(c,x+8,base,w-16,18);rect(c,x+10,base,w-20,3,light);
 }else if(s.form==='gauge'){
  basin(c,x+16,ground-55,w-32,43,false);
  for(let i=0;i<5;i++){
   column(c,x+17+i*(w-34)/5,y+18,h-51,8);
   for(let j=0;j<5;j++)rect(c,x+18+i*(w-34)/5,y+30+j*22,5,2,dark);
  }
 }else if(s.form==='wheel'){
  masonry(c,x+15,ground-39,w-30,29);
  c.strokeStyle=shade;c.lineWidth=7;c.beginPath();c.ellipse(cx,ground-40,w*.29,12,0,0,Math.PI*2);c.stroke();
  const angle=phase*Math.PI/4;line(c,cx-Math.cos(angle)*w*.25,ground-40-Math.sin(angle)*9,cx+Math.cos(angle)*w*.25,ground-40+Math.sin(angle)*9,light,3);
 }else if(s.form==='bowl')basin(c,x+18,ground-35,w-36,30,true);
 else{column(c,cx-8,y+12,h-31,16);for(let i=0;i<4;i++)rect(c,cx-5,y+29+i*22,9,2,dark);}
 if(active){
  // A local, quiet response, not a global world-state change or SF glow.
  const yy=ground-5+(reduced?0:Math.round(tick));
  for(let i=0;i<3;i++)rect(c,cx-20+i*17,yy,9,1,s.form==='receiving-dry'?'#ede0be':'#dce2c9');
 }
}

export const IMPERIAL_VISTA_KINDS=new Set(['imperial-confluence','imperial-blackreach','imperial-capital','imperial-capital-near','imperial-wet','imperial-dry','imperial-sealed','imperial-return']);
export function drawImperialVista(canvas,kind,time=0){
 const W=480,H=252;if(canvas.width!==W)canvas.width=W;if(canvas.height!==H)canvas.height=H;
 const c=canvas.getContext('2d');c.save();c.imageSmoothingEnabled=false;
 const cold=['imperial-blackreach','imperial-sealed'].includes(kind);
 const sky=c.createLinearGradient(0,0,0,170);sky.addColorStop(0,cold?'#84999f':'#879eaa');sky.addColorStop(.65,cold?'#bdc7c2':'#cbd0c4');sky.addColorStop(1,'#e9ddbc');
 rect(c,0,0,W,H,sky);
 poly(c,[[0,146],[55,120],[97,133],[151,94],[203,123],[253,106],[301,131],[349,93],[407,118],[480,106],[480,190],[0,190]],'#99aaa6');
 poly(c,[[0,172],[76,147],[145,166],[206,142],[283,158],[349,134],[420,159],[480,147],[480,252],[0,252]],cold?'#899b95':'#b7b7a0');
 if(kind==='imperial-capital'||kind==='imperial-capital-near'){
  const near=kind.endsWith('near');
  // Several horizons and aqueduct arches make the city larger than a single palace.
  for(let band=0;band<3;band++)for(let i=0;i<11;i++){
   const x=i*46+(band%2)*14,y=135+band*20,hh=15+noise(i,band)*28;
   rect(c,x,y-hh,27,hh+9,band===0?'#a3afa4':band===1?'#8f9d92':'#748b83');
   rect(c,x+4,y-hh-3,19,3,'#c7c7af');
  }
  for(let i=0;i<12;i++){
   const x=i*42;rect(c,x,157,42,8,'#bfc1a8');rect(c,x+1,165,9,28,'#8f9f91');
  }
  if(near){
   for(const x of [0,353])masonry(c,x,65,127,177,'#9fa591');
   masonry(c,0,47,W,31,'#b9b8a1');rect(c,0,47,W,3,light);
   poly(c,[[124,252],[171,204],[304,204],[357,252]],'#d5c9ad');
  }else{
   poly(c,[[0,252],[84,197],[149,192],[197,252]],'#8f9d8a');
   poly(c,[[180,252],[215,217],[240,195],[271,192],[246,220],[236,252]],'#d9c9a8');
  }
 }else if(kind==='imperial-wet'||kind==='imperial-dry'){
  const wet=kind==='imperial-wet';
  rect(c,0,176,W,76,wet?'#739c9a':'#d5c3a4');
  const silhouette=()=>{
   for(let i=0;i<6;i++)column(c,83+i*61,112+(i%2)*7,83,8);
   rect(c,73,109,329,8,'#b7b5a0');steps(c,209,174,58,34,5);
  };silhouette();
  if(wet){
   c.save();c.globalAlpha=.16;c.translate(0,370);c.scale(1,-1);silhouette();c.restore();
   for(let i=0;i<15;i++)rect(c,noise(i,4)*480,191+i*4,13+noise(i,6)*60,1,'#c5d3bd');
  }else{
   for(let i=0;i<6;i++)rect(c,83+i*61,195,8,37,'#8c9b8d');
   for(let i=0;i<5;i++)line(c,0,193+i*11,W,190+i*11,'#b6ab91',1);
   line(c,58,252,204,204,'#9c9b83',3);line(c,417,252,270,204,'#9c9b83',3);
  }
 }else if(kind==='imperial-blackreach'){
  for(let i=0;i<6;i++){
   const x=30+i*82,top=114-i%3*11;rect(c,x,top,13,100,'#546569');rect(c,x,top,2,100,'#9ca799');
  }
  rect(c,285,20,47,210,'#424f54');rect(c,285,20,5,210,'#8d998f');
  rect(c,346,34,34,198,'#3d4c51');rect(c,346,34,3,198,'#808f89');
  poly(c,[[319,252],[325,211],[339,193],[353,211],[360,252]],'#c4bda4');
 }else if(kind==='imperial-sealed'){
  poly(c,[[18,252],[64,135],[401,135],[470,252]],'#b6b8a3');
  masonry(c,93,113,292,106,'#a6ad9a');
  poly(c,[[84,114],[238,91],[394,114]],'#d0cbb3');rect(c,234,169,6,26,'#465e5d');
  for(let i=0;i<7;i++)rect(c,110+i*42,137,19,2,'#d7d3bc');
  line(c,237,219,237,252,'#6b8680',3);
 }else if(kind==='imperial-return'){
  for(let i=0;i<7;i++)column(c,50+i*65,108,105,10);
  masonry(c,23,99,457,16,'#a7ae9b');
  poly(c,[[0,252],[129,205],[278,184],[480,193],[480,252]],'#d1c0a1');
  line(c,165,252,277,195,'#a08f76',4);
  masonry(c,33,190,62,38,'#b8ac95');poly(c,[[24,191],[64,168],[105,191]],'#9d8572');rect(c,60,206,10,15,'#e0c88c');
 }else{
  for(let i=0;i<3;i++){
   const x=40+i*150;column(c,x,111,73,11);column(c,x+88,111,73,11);rect(c,x-6,105,111,10,stone);
   poly(c,[[x+49,180],[x+60,180],[278,252],[250,252]],water);
  }
  basin(c,229,214,85,30,true);
 }
 // A small traveller supplies scale in every composition, including the oppressive views.
 rect(c,181,226,4,5,'#ead3b2');rect(c,179,231,8,11,'#536d70');rect(c,179,242,3,7,'#485a5d');rect(c,184,242,3,7,'#485a5d');
 c.restore();
}
