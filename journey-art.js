// Quiet, continuous ground and a few readable silhouettes. The 32px grid is
// logical only. Existing irrigation art and actor sprites remain in use.
import {drawSilkTile} from './silk-art.js';
export const JOURNEY_PALETTE={
 '~':'#6b9fae',L:'#619cac',l:'#93bdbb',g:'#acbf9d',G:'#b5c5a2',v:'#c9c7a6',
 b:'#c2c2a9',h:'#babbb0',X:'#899397',S:'#e9e3d4',s:'#d9d5c3',
 i:'#aabc93',p:'#d6ded4','=':'#d4cbb0',t:'#c7c5b6','+':'#b9bcae'
};
const n=(x,y,s=0)=>{let v=Math.imul(x+29,374761393)^Math.imul(y+53,668265263)^s;v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967295;};
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c,points,col){c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}

export function drawJourneyTile(c,x,y,t,world){
 const px=x*32,py=y*32,q=n(x,y),r=n(y,x,17);
 rect(c,px,py,32,32,JOURNEY_PALETTE[t]||JOURNEY_PALETTE.b);
 if(t==='g'||t==='G'||t==='b'){
  // Sample a continuous colour field across tile/chunk boundaries. Broad grass
  // patches should read as afternoon light rather than square biome stamps.
  for(let yy=0;yy<32;yy+=8)for(let xx=0;xx<32;xx+=8){
   const light=Math.sin((px+xx)*.0038)*.45+Math.cos((py+yy)*.0051)*.35+Math.sin((px+xx+py+yy)*.0023)*.2;
   const base=t==='b'?[194,194,169]:[174,191,157];
   rect(c,px+xx,py+yy,8,8,`rgb(${base.map(v=>Math.round(v+light*5)).join(',')})`);
  }
 }
 if(t==='i'){drawSilkTile(c,x,y,'i');return;}
 if(['~','L','l'].includes(t)){
  // The wave marks deliberately never trace tile edges.
  if(q>.35){rect(c,px+q*17,py+r*24,10+q*9,1,t==='l'?'#d5e1ce':'#acd1cc');
   if(q>.78)rect(c,px+q*12,py+r*24+3,8,1,'#83b6b9');}
  if(t==='l'&&q>.55)rect(c,px+3+r*18,py+25,11,2,'#c7d5c3');
  return;
 }
 if(t==='X'){
  // One continuous ridge, not a little identical stone placed in every cell.
  for(let yy=0;yy<32;yy+=4)for(let xx=0;xx<32;xx+=4){
   const facet=Math.sin((px+xx)*.009+(py+yy)*.004)*5+Math.cos((py+yy)*.017)*3;
   rect(c,px+xx,py+yy,4,4,`rgb(${[139,153,155].map(v=>Math.round(v+facet)).join(',')})`);
  }
  for(let yy=0;yy<32;yy++)if((py+yy)%117<2)rect(c,px,py+yy,32,1,'#c6c8b755');
  if(world.tileAt(x,y-1)!=='X')rect(c,px,py,32,4,'#c8c9ba');
  if(world.tileAt(x-1,y)!=='X')rect(c,px,py,3,32,'#b0bbb3');
  if(world.tileAt(x,y+1)!=='X')rect(c,px,py+26,32,6,'#70848d');
  if(q>.87)poly(c,[[px+8,py+4],[px+11,py+14],[px+6,py+25],[px+9,py+14]],'#6c828b');
 }else if(t==='S'||t==='s'){
  if(q>.36){
   const xx=px+4+q*12,yy=py+3+r*18;
   poly(c,[[xx,yy],[xx+9,yy+2],[xx+14,yy-1],[xx+18,yy+5],[xx+8,yy+10]],'#c7c7b640');
   rect(c,xx+2,yy,7,1,'#fff4dc');
  }
  if(q>.9)rect(c,px+9,py+25,12,1,'#b9bdb0');
 }else if(t==='g'||t==='G'||t==='v'||t==='b'){
  // Sparse tufts leave the middle of the circle open, with long grass at its rim.
  const rim=Math.abs(Math.hypot(x-36,y-38)-24.5)<4;
  const tufts=t==='v'||rim?5:q>.5?3:2;
  for(let j=0;j<tufts;j++){
   const xx=px+3+n(x+j*7,y)*25,yy=py+5+n(x,y+j*11)*22;
   rect(c,xx,yy,1,rim?5:3,t==='G'?'#95af8b':'#8ea78b');
   if(j%2===0)rect(c,xx+2,yy+2,2,2,'#dbe0ba');
  }
  if(q>.985&&t!=='v'){rect(c,px+17,py+17,2,4,'#7f9d84');rect(c,px+15,py+15,5,2,'#e8d5b7');}
 }else if(t==='h'){
  if(q>.45){rect(c,px+5+q*14,py+8+r*13,6+q*5,2,'#a1aaa3');rect(c,px+7+q*14,py+7+r*13,5,1,'#d9d6c6');}
 }else if(t==='='||t==='t'){
  if(q>.4)rect(c,px+q*23,py+r*23,3,2,t==='t'?'#a0aaa5':'#c0b99e');
  if(q>.85)rect(c,px+5,py+24,4,1,'#ede0c4');
 }else if(t==='p'){
  if(x%3===0)rect(c,px+16,py,1,32,'#bfcac3');
  if(y%2===0)rect(c,px,py+16,32,1,'#c4cec5');
 }else if(t==='+'){
  for(let j=4;j<32;j+=8)rect(c,px,py+j,32,1,'#d8d7c2');
 }
 // A thin light edge outlines the lake without a rectangular biome border.
 if(!['X','+'].includes(t))for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  if(!['L','l'].includes(world.tileAt(x+dx,y+dy)))continue;
  rect(c,px+(dx===1?29:0),py+(dy===1?29:0),dx?3:32,dy?3:32,'#e0dac0');
 }
}


function drawJourneyRelic(c,s,x,y,w,h,cx,time){
 // Readable stepped silhouettes: a new culture built inside the old geometry.
 const edge='#607782',face='#9aa9a2',pale='#d8d8c2',ochre='#c8ad8e';
 const beam=(xx,yy,ww,hh,color)=>rect(c,xx,yy,ww,hh,color);
 const lo=y+h-23;
 const base=()=>{poly(c,[[x+6,lo],[x+w-9,lo],[x+w-1,lo+11],[x+10,lo+13]],'#b8b9a6');beam(x+10,lo+2,w-25,3,pale);};
 const arch=()=>{
  base();beam(x+19,y+24,13,h-45,face);beam(x+w-32,y+24,13,h-45,face);
  beam(x+15,y+16,w-29,17,edge);beam(x+18,y+16,w-35,5,pale);
  beam(x+32,y+39,w-64,3,'#6d8586');
  for(let i=1;i<5;i++)beam(x+32+i*(w-64)/5,y+42+i*7,2,h-73-i*7,'#bfbdab');
 };
 const form=s.form;
 if(form==='boat'){
  base();poly(c,[[x+12,y+h*.45],[x+w-11,y+h*.45],[x+w-35,y+h*.78],[x+31,y+h*.78]],'#927f77');
  beam(x+33,y+h*.45,w-70,7,'#d0b7a0');beam(cx-3,y+10,6,h*.46,'#877e70');
  poly(c,[[cx+3,y+16],[cx+w*.18,y+h*.42],[cx+3,y+h*.38]],'#e5d5bb');
  for(let i=0;i<4;i++)beam(x+28+i*20,y+h*.53,7,3,'#ead5a8');
 }else if(form==='marker'){
  base();for(let i=0;i<4;i++){const xx=x+26+i*(w-50)/4,yy=y+24+(i%2)*14;
   beam(xx,yy,9,lo-yy+1,i%2?face:edge);beam(xx-2,yy,13,4,pale);}
 }else if(form==='arch'){
  arch();
 }else if(form==='watch'){
  base();beam(x+32,y+34,6,h-54,edge);beam(x+w-42,y+34,6,h-54,edge);
  beam(x+20,y+42,w-40,11,ochre);poly(c,[[x+15,y+39],[cx,y+8],[x+w-14,y+39]],'#899d99');
  beam(cx+9,y+47,21,19,'#566977');
 }else if(form==='disc'){
  base();const cy=y+h*.51,rx=Math.min(w*.37,98),ry=Math.min(h*.24,44);
  c.save();c.lineWidth=7;c.strokeStyle='#aab9b3';c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);c.stroke();
  c.strokeStyle=edge;c.lineWidth=3;c.beginPath();c.ellipse(cx,cy,rx*.61,ry*.56,0,0,Math.PI*2);c.stroke();
  beam(cx-4,cy-4,8,8,'#f5d6a4');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(cx+Math.cos(a)*rx*.79-2,cy+Math.sin(a)*ry*.77-2,4,4,pale);}c.restore();
 }else if(form==='garden'){
  base();for(let j=0;j<4;j++){const xx=x+24+j*(w-55)/4;beam(xx,y+38,13,h-68,'#8ea995');
   for(let k=0;k<3;k++){beam(xx-5+k*8,y+48+k*18,12,6,k%2?'#b7c9a4':'#d6ceaa');}}
  beam(x+16,y+18,w-32,3,'#c2b6a5');for(let i=0;i<8;i++)beam(x+20+i*(w-45)/8,y+18,2,h-44,'#c7c9b74a');
 }else if(form==='market'){
  base();for(let i=0;i<3;i++){const xx=x+12+i*(w-24)/3;
   beam(xx+4,y+45,4,h-68,edge);beam(xx+4+(w-28)/3-7,y+45,4,h-68,edge);
   poly(c,[[xx,y+45],[xx+(w-24)/6,y+19+(i%2)*5],[xx+(w-24)/3,y+45]],i%2?'#cfb9a4':'#9fbbb5');
   beam(xx+10,y+h*.6,18,12,ochre);
  }
 }else if(form==='stairs'){
  base();for(let i=0;i<6;i++){const inset=i*6;beam(x+16+inset,y+19+i*18,w-32-inset*2,10,i%2?'#bdc3b5':'#889a9a');beam(x+18+inset,y+29+i*18,w-36-inset*2,3,pale);}
 }else if(form==='well'){
  base();beam(cx-7,y+19,5,h*.37,edge);beam(cx+27,y+19,5,h*.37,edge);
  beam(cx-15,y+17,55,7,ochre);
  c.fillStyle=edge;c.beginPath();c.ellipse(cx+10,y+h*.68,45,24,0,0,Math.PI*2);c.fill();
  c.fillStyle='#8fb2ae';c.beginPath();c.ellipse(cx+10,y+h*.65,31,13,0,0,Math.PI*2);c.fill();
  beam(cx-4,y+h*.36,7,21,'#c4ae8b');
 }else if(form==='wall'){
  base();poly(c,[[x+10,y+h*.78],[x+20,y+12],[x+w-28,y+4],[x+w-9,y+h*.78]],edge);
  poly(c,[[x+20,y+12],[x+w*.54,y+9],[x+w*.5,y+h*.77],[x+10,y+h*.78]],face);
  beam(x+24,y+12,w-56,4,'#d6d9c3');
  for(let i=1;i<10;i++)beam(x+25+i*(w-65)/10,y+34+(i%3)*5,2,h*.48,i%2?'#a6b2aa':'#74898b');
  beam(x+30,y+h*.61,15,18,'#5c707c');
 }
 // Small, restrained living details soften the relic without becoming neon signs.
 if(['market','garden','boat','well'].includes(form)){
  beam(x+16,lo-4,3,11,'#817f76');beam(x+13,lo-6,9,3,'#e5bc91');
 }
}

export function drawJourneySite(c,s,time){
 const x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,cx=x+w/2;
 c.save();
 // Shadows lean toward the returning traveller, suggesting late afternoon.
 poly(c,[[x+16,y+h-18],[x+w-6,y+h-20],[x+w+42,y+h+26],[x+48,y+h+26]],'#5d79702b');
 if(s.kind==='terminal'){
  rect(c,x+12,y+51,w-24,h-65,'#b2c9c7');
  rect(c,x+26,y+69,w-52,h-92,'#e5e8d9');
  for(let i=0;i<3;i++){
   const xx=x+i*w/3;
   poly(c,[[xx+1,y+54],[xx+w/3*.52,y+5+i%2*15],[xx+w/3+10,y+54]],'#f1eddb');
   poly(c,[[xx+w/3*.52,y+5+i%2*15],[xx+w/3+10,y+54],[xx+w/3-8,y+63]],'#bcced0');
   rect(c,xx+32,y+80,30,33,'#82b2ba');
  }
  rect(c,cx-19,y+h-66,38,49,'#557b8c');
  rect(c,x+w-35,y+h-49,4,24,'#8b9384');rect(c,x+w-41,y+h-56,16,9,'#f6daa2');
 }else if(s.kind==='teahouse'){
  rect(c,x+16,y+49,w-32,h-60,'#a2a995');
  rect(c,x+23,y+62,w-46,h-80,'#e2d6b5');
  poly(c,[[x+4,y+52],[cx,y+8],[x+w-4,y+52],[x+w-12,y+66],[x+7,y+65]],'#b88f80');
  poly(c,[[x+4,y+52],[cx,y+8],[cx+15,y+14],[x+17,y+58]],'#d4ad8d');
  for(let i=0;i<4;i++){
   rect(c,x+25+i*(w-48)/4,y+64,6,h-80,'#8b8372');
   rect(c,x+37+i*(w-48)/4,y+76,20,28,'#88a8a2');
  }
  rect(c,cx-15,y+h-54,30,39,'#648d87');
  rect(c,x+w-54,y+h-30,22,10,'#d6b789');
 }else if(s.kind==='monolith'){
  // One immense, austere form. Neither a monster nor an explained monument.
  poly(c,[[x+32,y+h-13],[x+22,y+18],[x+w-48,y+2],[x+w-12,y+18],[x+w-16,y+h-22]],'#5e7179');
  poly(c,[[x+22,y+18],[x+w-48,y+2],[x+w-53,y+h-18],[x+32,y+h-13]],'#87908e');
  poly(c,[[x+w-48,y+2],[x+w-12,y+18],[x+w-16,y+h-22],[x+w-53,y+h-18]],'#4f6875');
  rect(c,x+28,y+22,3,h-50,'#bab8a3');
  poly(c,[[x+30,y+h-10],[x+w-14,y+h-22],[x+w+22,y+h-3],[x+48,y+h+11]],'#a8b2a3');
 }else if(s.kind==='shipwreck'){
  poly(c,[[x+4,y+51],[x+43,y+h-17],[x+w-37,y+h-19],[x+w-6,y+47]],'#997f73');
  rect(c,x+42,y+53,w-80,40,'#b49c85');
  for(let i=0;i<6;i++)rect(c,x+46+i*27,y+55,3,40,'#d2b99a');
  rect(c,cx-3,y+2,6,90,'#827970');
  poly(c,[[cx+3,y+11],[cx+70,y+47],[cx+3,y+46]],'#d9d3bd');
  rect(c,x+70,y+96,14,5,'#e1cdb1');
 }else if(s.kind==='lakehut'){
  rect(c,x+20,y+45,w-40,h-58,'#c8c4aa');
  poly(c,[[x+7,y+47],[cx,y+8],[x+w-7,y+47],[x+w-16,y+58],[x+13,y+58]],'#769da4');
  rect(c,x+35,y+66,26,21,'#dfe2c2');rect(c,cx+16,y+62,23,48,'#678994');
  rect(c,x+w-38,y+65,4,46,'#8c8e79');
  for(let i=0;i<4;i++)rect(c,x+20+i*20,y+h-18,14,2,'#8b9b8a');
 }else if(s.kind==='relic'){
  drawJourneyRelic(c,s,x,y,w,h,cx,time);
 }else if(s.kind==='terrace'){
  for(let i=0;i<3;i++)rect(c,x+i*7,y+i*15,w-i*14,13,'#d5d4bf');
  rect(c,x+12,y+9,w-24,2,'#f4e5c5');
 }
 const ex=(s.entrance.x+.5)*32,ey=(s.entrance.y+.5)*32;
 c.fillStyle='#fff0c0';c.beginPath();c.arc(ex,ey,5+Math.sin(time*.003)*.8,0,Math.PI*2);c.fill();
 c.strokeStyle='#6a8d92';c.lineWidth=1.5;c.stroke();
 // A name appears near the entrance rather than across the quiet skyline.
 c.font='11px system-ui';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#3c5868';
 c.strokeText(s.name,cx,y+h+22);c.fillStyle='#fcf0d3';c.fillText(s.name,cx,y+h+22);
 c.restore();
}

// Deliberately small props, not new collision geometry or repeated giant rocks.
export function drawJourneyAtmosphere(c,{left,right,top,bottom},time){
 for(const [x,y,kind] of [[25,47,'ribbon'],[42,17,'ribbon'],[16,34,'stone'],[51,44,'stone'],[66,66,'reeds'],[99,38,'reeds'],[59,57,'reeds'],[38,72,'tree'],[40,77,'tree']]){
  if(x<left||x>right||y<top||y>bottom)continue;
  const px=x*32,py=y*32;
  if(kind==='stone'){rect(c,px+4,py+19,21,8,'#a0b0a0');rect(c,px+7,py+15,13,5,'#d3d2bb');}
  if(kind==='ribbon'){
   rect(c,px+13,py-5,3,35,'#8e8f77');
   rect(c,px+16,py+Math.sin(time*.0015)*2,17,4,'#b6cccb');rect(c,px+16,py+10,11,3,'#dfc8b3');
  }
  if(kind==='reeds')for(let j=0;j<5;j++){
   rect(c,px+4+j*5,py+13-(j%3)*4,2,18,'#9baf89');rect(c,px+3+j*5,py+11-(j%3)*4,4,6,'#c6c6a1');
  }
  if(kind==='tree'){
   rect(c,px+15,py+3,4,27,'#8c8d72');rect(c,px+4,py-13,26,23,'#94b39c');rect(c,px+9,py-20,17,22,'#b7c7a8');
  }
 }
}

// Scenic compositions are isolated from terrain rendering.
export {drawJourneyPanorama} from './journey-panorama.js';
