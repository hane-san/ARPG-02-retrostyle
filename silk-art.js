// Pastel pixel-art overlays for the fictional Starwind Passage continent.
// Kept separate from the original island palette so neither art style clobbers the other.
const C={
 g:'#a9b79a',G:'#c3c49b',b:'#b2a98a',u:'#c8bbaf',U:'#ddcbb7',
 d:'#e3c99e',o:'#9cb896',O:'#c4bca2',h:'#aba393',s:'#979b96',X:'#626f76',
 t:'#b0aba0',p:'#aa9881',L:'#549fac',l:'#81b8bd','-':'#d2c9a8',
 i:'#a9c89b',w:'#87bdb0',q:'#cebda2',k:'#a98279',r:'#648ca2',
 e:'#c9d6d3',v:'#a5c9bf','=':'#c9bba2','+':'#bcae9c'
};
export const SILK_PALETTE=C;
function n(x,y,s=0){let v=Math.imul(x+19,374761393)^Math.imul(y+47,668265263)^Math.imul(s+71,1274126177);v=Math.imul(v^(v>>>15),2246822519);return ((v^(v>>>16))>>>0)/4294967295;}
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function path(c,pts,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
export function drawSilkTile(c,x,y,t){
 const px=x*32,py=y*32,z=n(x,y),p=n(y,x,5);
 rect(c,px,py,32,32,C[t]||C.g);
 if(t==='L'||t==='l'){
  rect(c,px,py+31,32,1,t==='L'?'#438b9c':'#63a2a9');
  if(z>.16)rect(c,px+Math.floor(z*14),py+7,13,1,t==='L'?'#89cdd0':'#dbded0');
  rect(c,px+Math.floor(p*19),py+22,9,1,t==='L'?'#70b6bc':'#d1dad0');
  if(t==='l')rect(c,px+2,py+29,17,1,'#e9e3c4');
  return;
 }
 if(t==='X'){
  rect(c,px+1,py+2,30,29,'#66727b');
  path(c,[[px+4,py+24],[px+15,py+11],[px+21,py+18],[px+30,py+8]],'#b0a79f',3);
  rect(c,px+6,py+3,7,4,'#aeb3ac');rect(c,px+18,py+19,10,4,'#465b6b');
 }else if(t==='t'){
  // Stone ring roofs over a light roadway: tunnel mouths remain traversable.
  rect(c,px,py,32,32,'#9f9e92');rect(c,px+4,py+6,24,24,'#dfcdb0');
  rect(c,px+8,py+6,17,8,'#6f7776');rect(c,px+10,py+10,13,8,'#454f5b');
  rect(c,px+3,py+3,26,3,'#e7c9a3');
  rect(c,px,py+25,32,3,'#978b85');
 }else if(t==='g'||t==='G'||t==='b'){
  for(let j=0;j<5;j++){
   const xx=px+2+Math.floor(n(x+j*13,y)*28),yy=py+2+Math.floor(n(x,y+j*17)*28);
   rect(c,xx,yy,2,5,t==='G'?'#889c6f':'#809d81');
   if((j+x+y)%6===0)rect(c,xx-2,yy,6,3,'#e5d7b2');
  }
  if(t==='b'&&z>.55)rect(c,px+11,py+19,13,3,'#928e7e');
 }else if(t==='u'||t==='U'){
  for(let j=0;j<3;j++){
   const xx=px+2+Math.floor(n(x+j,y)*25),yy=py+Math.floor(n(x,y+j*3)*29);
   path(c,[[xx-3,yy],[xx+2,yy+2],[xx+6,yy-1]],t==='U'?'#b59e9d':'#9f9492',1);
  }
  if(z>.82)rect(c,px+12,py+13,12,2,'#b88775');
 }else if(t==='d'||t==='O'){
  rect(c,px+Math.floor(z*18),py+8,14,2,'#f2d8ab');
  rect(c,px+Math.floor(p*13),py+23,17,1,'#bfae95');
  if(t==='O'){rect(c,px+15,py+16,3,14,'#6e8b70');rect(c,px+9,py+9,16,10,'#6d9675');rect(c,px+13,py+6,9,8,'#98b69b');}
 }else if(t==='o'||t==='i'||t==='w'){
  if(t==='w'){
   rect(c,px+6,py,8,32,'#7fb7b4');
   rect(c,px+8,py+5,3,11,'#c2e6cf');
   rect(c,px+20,py+17,6,13,'#c5c4a1');
  }else{
   const irrigated=t==='i';
   for(let j=0;j<4;j++)rect(c,px+j*9,py+1,4,30,irrigated?j%2?'#7ba77f':'#c2bd89':'#88aa83');
   if(irrigated&&y%4===0)rect(c,px,py+15,32,2,'#d2c59a');
   if(!irrigated&&z>.6){rect(c,px+13,py+13,5,13,'#777a61');rect(c,px+8,py+5,17,13,'#83a788');}
  }
 }else if(t==='h'||t==='s'||t==='k'){
  rect(c,px+2,py+15,27,12,t==='k'?'#bb8d77':'#958e83');
  path(c,[[px+3,py+28],[px+14,py+6],[px+24,py+27]],t==='k'?'#ddb59a':'#c4bbaf',2);
  rect(c,px+9,py+23,12,3,t==='k'?'#946c65':'#717f81');
  if(z>.64)rect(c,px+18,py+5,9,6,'#d8bda5');
 }else if(t==='r'){
  rect(c,px,py,32,32,'#618da1');
  rect(c,px+Math.floor(z*17),py+12,14,2,'#c3c9c0');
 }else if(t==='e'||t==='v'){
  rect(c,px,py+31,32,1,t==='e'?'#a4adb1':'#679e9d');
  rect(c,px+31,py,1,32,'#a3bcb9');
  if(t==='e'){
   rect(c,px+4,py+6,24,2,'#f3efdd');
   rect(c,px+8,py+17,17,2,'#9ac9ce');
   if(z>.56){rect(c,px+13,py+3,6,14,'#e8e9d8');rect(c,px+15,py+4,2,12,'#71c5d3');}
  }else{
   rect(c,px+14,py+20,4,10,'#7d8c83');
   rect(c,px+5,py+11,23,12,'#8cbfb4');
   rect(c,px+12,py+7,11,8,'#d4e6c9');
  }
 }else if(t==='q'){
  for(let j=0;j<4;j++)rect(c,px+j*9,py+1,1,30,'#a9a18e');
  rect(c,px,py+14,32,1,'#a99a85');
  if(z>.63){rect(c,px+11,py+5,10,9,'#88a99c');rect(c,px+14,py+3,4,6,'#e4d7b2');}
 }else if(t==='='||t==='+'){
  rect(c,px,py+15,32,1,t==='+'?'#977d77':'#a39887');
  rect(c,px+15,py,1,32,'#d9c9ab');
  if(t==='+'){
   rect(c,px,py+2,32,3,'#dcd2be');rect(c,px,py+29,32,3,'#dcd2be');
   if(x%3===0){rect(c,px+1,py,4,32,'#8b8e8a');rect(c,px+3,py+3,2,7,'#f7d7a9');}
  }
 }else if(t==='-'){
  for(let j=0;j<3;j++)rect(c,px+Math.floor(n(x+j,y)*24),py+Math.floor(n(x,y+j)*28),5,2,'#ebdbb8');
  if(z>.7)rect(c,px+14,py+17,10,2,'#7ea9ad');
 }
}
function dome(c,cx,cy,r,color){
 c.fillStyle=color;c.beginPath();c.moveTo(cx-r,cy);c.quadraticCurveTo(cx-r,cy-r*2,cx,cy-r*2);c.quadraticCurveTo(cx+r,cy-r*2,cx+r,cy);c.closePath();c.fill();
 rect(c,cx-2,cy-r*2-9,4,10,'#efdbbb');
}
export function drawSilkSite(c,s,t){
 const x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,cx=x+w/2;
 c.save();
 rect(c,x+12,y+h-17,w-24,12,'#30495736');
 if(s.kind==='shipwreck'){
  path(c,[[x+23,y+h-89],[x+62,y+h-20],[x+w-40,y+h-22],[x+w-15,y+h-92]],'#8d655d',18);
  rect(c,x+42,y+h-84,w-90,50,'#937c6a');
  for(let dx=x+51;dx<x+w-58;dx+=32){rect(c,dx,y+h-78,5,52,'#be9e83');rect(c,dx+9,y+h-69,2,35,'#d5b29a');}
  rect(c,cx-3,y+20,7,h-100,'#775d57');
  path(c,[[cx,y+34],[cx+84,y+95],[cx,y+93]],'#dacbbc',3);
  rect(c,x+27,y+h-63,25,10,'#ae9181');
 }else if(s.kind==='bluecity'){
  rect(c,x+17,y+92,w-34,h-111,'#e0c6a9');
  for(let i=0;i<5;i++){
   const bx=x+25+i*(w-52)/5,by=y+130+(i%2)*15;
   rect(c,bx,by,75,h-162,'#c4b9a4');
   dome(c,bx+38,by,37,i%2?'#7fadb9':'#90c6c8');
   rect(c,bx+24,by+42,25,56,'#5e878d');
   rect(c,bx+16,by+28,8,19,'#f4e4c6');
  }
  rect(c,cx-30,y+h-99,60,76,'#4f7585');
  dome(c,cx,y+128,56,'#6cabb7');
 }else if(s.kind==='teahouse'){
  rect(c,x+22,y+77,w-44,h-93,'#a6a497');
  rect(c,x+36,y+96,w-72,h-142,'#e4d2ac');
  path(c,[[x+7,y+80],[cx,y+27],[x+w-7,y+80]],'#b77c70',20);
  for(let j=0;j<5;j++){
   rect(c,x+32+j*68,y+86,9,h-115,'#806d65');
   rect(c,x+20+j*68,y+105,48,20,j%2?'#9ea8a0':'#ccaba2');
  }
  rect(c,cx-18,y+h-65,36,40,'#6f8d7f');
 }else if(s.kind==='tunnelgate'){
  rect(c,x+18,y+43,w-36,h-59,'#827e7b');
  for(let i=0;i<5;i++){
   const bx=x+31+i*64;
   rect(c,bx,y+72,45,h-102,'#c5b5a0');
   rect(c,bx+6,y+96,32,h-112,'#424e56');
   c.strokeStyle='#e1d2b6';c.lineWidth=11;c.beginPath();
   c.arc(bx+22,y+104,22,Math.PI,2*Math.PI);c.stroke();
  }
  rect(c,cx-13,y+h-85,26,65,'#4d5556');
 }else if(s.kind==='lakepier'){
  rect(c,x+16,y+50,w-32,h-70,'#abc8c4');
  for(let j=0;j<7;j++)rect(c,x+20+j*50,y+55,26,h-91,'#dde4d4');
  path(c,[[x+13,y+52],[cx,y+12],[x+w-13,y+52]],'#c3d9ce',16);
  rect(c,cx-17,y+h-79,34,60,'#557e89');
  rect(c,x+35,y+h-28,w-70,9,'#d9c7a6');
 }else if(s.kind==='windfarm'){
  rect(c,x+20,y+80,w-40,h-94,'#a2af96');
  for(let j=0;j<3;j++){
   const bx=x+44+j*116,by=y+100+(j%2)*34;
   rect(c,bx,by,26,h-by+y-29,'#d4c7a9');
   c.save();c.translate(bx+13,by+25);c.rotate(t*.00015+j);
   for(let a=0;a<4;a++){c.rotate(Math.PI/2);rect(c,-4,-39,8,34,'#eee2be');}c.restore();
   rect(c,bx+4,by+42,20,18,'#6f8990');
  }
  rect(c,cx-16,y+h-65,32,44,'#648481');
 }else if(s.kind==='monastery'){
  rect(c,x+16,y+68,w-32,h-87,'#ad988c');
  for(let i=0;i<5;i++){const bx=x+20+i*75;rect(c,bx,y+62,47,h-111,'#d6baa7');rect(c,bx+15,y+106,15,31,'#5a646c');}
  dome(c,cx,y+86,72,'#c3a5a1');
  rect(c,cx-23,y+h-99,46,72,'#6a6f73');
 }else if(s.kind==='futurecity'){
  for(let i=0;i<7;i++){
   const bx=x+23+i*103,hgt=140+(i%3)*65;
   rect(c,bx,y+h-hgt-32,73,hgt,'#9bbdbe');
   rect(c,bx+9,y+h-hgt-48,55,22,'#e2e8db');
   for(let k=0;k<8;k++){rect(c,bx+16,y+h-hgt+k*22-3,35,3,'#5caeb7');}
   dome(c,bx+36,y+h-hgt-44,31,'#c6e4df');
  }
  rect(c,cx-26,y+h-106,52,80,'#658fa0');
 }else if(s.kind==='stonecircle'){
  for(let i=0;i<10;i++){const a=i*Math.PI*2/10,xx=cx+Math.cos(a)*w*.35,yy=y+h*.56+Math.sin(a)*h*.32;rect(c,xx-9,yy-33,18,41,'#b9bcb1');rect(c,xx-6,yy-31,9,32,'#dde1cf');}
  rect(c,cx-16,y+h-51,32,22,'#81998f');
 }else if(s.kind==='ruintower'){
  rect(c,cx-46,y+55,92,h-77,'#aaa79a');rect(c,cx-28,y+37,56,h-66,'#d2c4b2');
  rect(c,cx-17,y+15,34,28,'#b1ac9c');rect(c,cx-11,y+65,22,19,'#596f77');
  rect(c,cx-19,y+h-71,38,54,'#5f676a');
  for(let j=0;j<4;j++)rect(c,cx-36+j*21,y+28,13,5,'#ebe3cf');
 }else if(s.kind==='bridgegate'){
  rect(c,x+25,y+68,w-50,h-89,'#c6beb0');
  for(let j=0;j<3;j++){
   const bx=x+20+j*105;
   rect(c,bx,y+71,47,h-108,'#abbcba');rect(c,bx+12,y+102,24,h-145,'#426775');
   dome(c,bx+23,y+87,27,'#cfddd0');
  }
  path(c,[[x+16,y+63],[cx,y+21],[x+w-16,y+63]],'#e7d8b7',13);
 }
 c.font='bold 13px system-ui';c.textAlign='center';c.lineWidth=4;
 c.strokeStyle='#283d4b';c.strokeText(s.name,cx,y-17);
 c.fillStyle='#fff4d7';c.fillText(s.name,cx,y-17);
 const ex=(s.entrance.x+.5)*32,ey=(s.entrance.y+.5)*32;
 c.globalAlpha=.84;c.fillStyle='#ffe4ad';c.beginPath();c.arc(ex,ey,6+Math.sin(t*.004)*1.4,0,Math.PI*2);c.fill();
 c.restore();
}
