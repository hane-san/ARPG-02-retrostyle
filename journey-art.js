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

// Optional pixel panorama: a near horizon, layers of distance, and a very small
// traveller. It is a place to look from, not a cutscene or a second game world.
export function drawJourneyPanorama(canvas,kind){
 const c=canvas.getContext('2d');canvas.width=480;canvas.height=252;
 const sunset=kind==='sunset',high=kind==='highland';
 const bands=sunset?[[104,126,154],[150,143,173],[224,172,174],[249,216,174]]:[[139,169,186],[175,197,202],[212,219,204],[239,224,193]];
 const skyColour=y=>{
  const at=Math.min(2.999,y/55),i=Math.floor(at),f=at-i;
  return `rgb(${bands[i].map((v,j)=>Math.round(v+(bands[i+1][j]-v)*f)).join(',')})`;
 };
 for(let y=0;y<164;y+=3)rect(c,0,y,480,3,skyColour(y));
 // High, stretched clouds and a few thin gaps in the glowing haze.
 for(const [xx,yy,ww] of [[-18,42,123],[55,47,62],[186,64,143],[213,69,74],[368,28,135],[391,32,57]]){
  rect(c,xx,yy,ww,2,sunset?'#c6b0bc55':'#e1dfcf55');
 }
 if(sunset){
  for(let i=3;i>=0;i--){c.fillStyle=['#ffedbd','#ffe2ae40','#ffe0b025','#fddab317'][i];c.beginPath();c.arc(348,116,35+i*14,0,Math.PI*2);c.fill();}
  rect(c,272,90,154,3,'#f7d8bd');rect(c,302,98,112,2,'#f2c7b5');
 }
 const mountains=(base,amplitude,colour,seed)=>{
  const pts=[[0,252],[0,base]];
  for(let x=0;x<=488;x+=5){const h=Math.sin(x*.013+seed)*.4+Math.sin(x*.041+seed*2)*.22+Math.sin(x*.079+seed)*.15;pts.push([x,base-amplitude*(.5+h)]);}
  pts.push([488,252]);poly(c,pts,colour);
 };
 mountains(159,high?61:48,sunset?'#a39aa9':'#afbec0',2);
 mountains(177,high?50:31,sunset?'#858a9b':'#94abae',4);
 mountains(183,28,sunset?'#6d8090':'#7e9e9f',7);
 if(kind!=='steppe'){
  rect(c,0,182,480,70,sunset?'#a8a3a1':'#9ab9b7');
  for(let i=0;i<36;i++){
   const yy=184+i*1.6,span=12+i*1.8,x=348-span/2+(n(i,4)-.5)*38;
   if(sunset)rect(c,x,yy,span,1,i%3?'#efd2b0':'#f8dfb4');
   const xx=n(i,7)*480;rect(c,xx,yy,5+n(i,9)*18,1,sunset?'#c3b7aa':'#b7cec4');
  }
 }else{
  rect(c,0,181,480,71,'#b9c5a0');
  poly(c,[[0,215],[132,185],[297,197],[480,184],[480,252],[0,252]],'#9eb596');
  poly(c,[[95,252],[210,195],[254,191],[126,252]],'#d9cfac');
 }
 // The same distant form seen before approaching its actual footprint on foot.
 if(!sunset){
  const mx=high?119:316,my=high?111:139,mh=high?57:37;
  poly(c,[[mx,my+mh],[mx-2,my],[mx+9,my-4],[mx+15,my],[mx+14,my+mh]],'#697d83');
  rect(c,mx,my,3,mh,'#91a09b');
 }
 poly(c,[[0,213],[42,209],[81,223],[128,226],[173,252],[0,252]],sunset?'#536d76':'#718b7e');
 poly(c,[[388,252],[417,225],[480,218],[480,252]],sunset?'#607782':'#849a89');
 // Nine pixels tall against a sky that does not care who is looking at it.
 rect(c,69,213,3,4,'#e6cfac');rect(c,67,217,7,7,'#395e70');
 rect(c,65,217,8,2,'#b5d7d5');rect(c,67,224,2,4,'#314d5e');rect(c,72,224,2,4,'#314d5e');
 for(let i=0;i<14;i++)rect(c,9+i*7,232+n(i,3)*15,1,4,'#b5c1a5');
}
