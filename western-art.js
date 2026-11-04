import {drawLandscapeSky,skyWorldWindow} from './landscape-sky.js';
import {landscapeNoise} from './landscape-geometry.js';
import {WEST_STUDIES,westernAt,westSkyRows} from './western-world.js';
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const P=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const L=(c,x,y,a,b,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
export function createWesternLight(){let elapsed=0,last=null;return {update(now,active,hidden=false){if(last!==null&&active&&!hidden)elapsed+=Math.max(0,Math.min(200,now-last));last=now;return Math.min(1,elapsed/180000);},get phase(){return Math.min(1,elapsed/180000);}};}
const tileLand=(world,x,y)=>westernAt(x,y)||(world.tileAt(x,y)==='west-sky'?WEST_STUDIES.find(z=>z.index===world.zoneAt(x,y).index):undefined);
export function westernTileColor(world,x,y){const t=world.tileAt(x,y),z=tileLand(world,x,y);if(!z)return null;if(t==='west-sky')return '#aacbd4';if(t==='west-wall')return z.palette[3];if(t==='L')return z.palette[2];return t==='='||t==='west-stair'||t==='west-bridge'?z.palette[1]:z.palette[0];}
export function drawWesternTile(c,x,y,t,world){
 const z=tileLand(world,x,y);if(!z||!['west-ground','west-wall','west-stair','west-bridge','west-sky','L','='].includes(t))return false;
 if(t==='west-sky')return true;
 const px=x*32,py=y*32,[g,light,water,shade]=z.palette,q=((Math.imul(x,73)^Math.imul(y,137))>>>0)%997/997;
 R(c,px,py,32,32,westernTileColor(world,x,y));
 const field=landscapeNoise(x,y,10);
 if(t==='west-ground'&&!['glass','terrace'].includes(z.key)&&field>.56)R(c,px,py,32,32,blend(g,light,(field-.56)*.8));
 if(t==='west-wall'&&z.key==='glass'){R(c,px,py,32,32,shade);R(c,px+3,py+3,26,25,g);for(let j=0;j<5;j++)E(c,px+5+j*5,py+10+j%2*10,3,4,['#e2b7a5','#c1cfa1','#e4d5a3'][j%3]);return true;}
 if(t==='west-wall'){
  const exposed=world.walkable(x,y-1);
  if(exposed)R(c,px,py,32,4,light);
  if(z.key==='terrace'){
   for(let j=11;j<32;j+=9){L(c,px,py+j,px+32,py+j-2,'#455d6255');if(q>.45)L(c,px+(j%3)*8,py+j,px+(j%3)*8,py+j+7,'#455d6244');}
  }else{
   // Continuous geological faces, not a repeating brick cap on every tile.
   if(field>.55)R(c,px,py+(exposed?5:0),32,exposed?27:32,blend(shade,g,.23));
   if((y+Math.round(Math.sin(x*.07)*2))%4===0)L(c,px,py+17,px+32,py+16+Math.sin(x*.07),light+'44',2);
   if(q>.83)L(c,px+21,py+4,px+14,py+27,'#455d6255',2);
   if(exposed&&['grass','windmill','village','lane'].includes(z.key))for(let j=0;j<3;j++)L(c,px+4+j*12,py+5,px+7+j*10,py-2,g,3);
  }
  return true;
 }
 if(t==='west-bridge'){R(c,px,py,32,32,'#a58d70');for(let j=3;j<32;j+=6)R(c,px+1,py+j,30,2,light);if(x===z.x+27||x===z.x+29)R(c,px+(x===z.x+27?0:27),py,5,32,shade);return true;}
 if(t==='west-stair'){for(let j=3;j<32;j+=5){R(c,px+1,py+j,30,2,light);L(c,px,py+j+2,px+32,py+j+2,shade);}return true;}
 if(t==='L'){
  for(const [dx,dy,a,b,ww,hh] of [[0,-1,0,0,32,3],[-1,0,0,0,3,32],[1,0,29,0,3,32],[0,1,0,29,32,3]])if(world.walkable(x+dx,y+dy)&&world.tileAt(x+dx,y+dy)!=='west-bridge')R(c,px+a,py+b,ww,hh,light+'bb');
  R(c,px,py+3,32,5,blend(water,'#d2e1d6',.3));L(c,px+3,py+18,px+26,py+18,light+'88',2);
  if(z.key==='impression'){R(c,px+3,py+7,19,3,'#c3cbb3');R(c,px+11,py+24,20,3,'#7e9daa');}
  if(z.key==='dots')for(let j=0;j<13;j++){const xx=(x*17+y*7+j*11)%30,yy=(x*3+y*13+j*7)%30;R(c,px+xx,py+yy,2,2,[light,water,'#b8b9a3'][j%3]);}
  return true;
 }
 if(t==='='){L(c,px+2,py+6,px+29,py+9,g+'77');if(q>.8)R(c,px+12,py+19,5,2,shade+'55');return true;}
 if(z.key==='cliff'){R(c,px,py+26,32,6,'#87918a');L(c,px,py+25,px+32,py+25,light,2);}
 else if(z.key==='glass'){
  if(x%9===0){R(c,px+12,py,8,32,'#7fa08b');L(c,px+16,py,px+16,py+32,water,3);}
 }else if(z.key==='terrace'){
  const band=((y-z.y-Math.round(3*Math.sin((x-z.x)*.045)))%11+11)%11;R(c,px,py,32,32,band<4?'#b9c99c':band<7?'#c7ba80':g);
  for(let j=0;j<4;j++)L(c,px+j*9,py+26,px+j*9+5,py+12,shade+'88');
  if(band===8){R(c,px,py+8,32,10,water);R(c,px,py+8,32,2,light);}
 }else if(z.key==='mountain'){
  if(q>.76){R(c,px+4,py+21,14,3,'#b4bfb0');L(c,px+6,py+18,px+20,py+14,light,2);}
 }else if(z.key==='grass'||z.key==='azure'){
  if(q>.62)for(let j=0;j<2;j++){const xx=px+7+j*16;L(c,xx,py+26,xx+5,py+17,q>.5?light+'88':shade+'66');}
  if(z.key==='azure'&&q>.4&&Math.sin(x*.13)+Math.cos(y*.17)>1.1)for(let j=0;j<3;j++){R(c,px+5+j*8,py+9+j%2*11,3,3,'#f1efdb');R(c,px+6+j*8,py+10+j%2*11,1,1,'#b8c69f');}
 }else if(z.key==='dots'){
  if(field>.49)for(let j=0;j<5;j++)R(c,px+(x*11+j*7)%30,py+(y*7+j*13)%30,2,2,[light,'#8ba494','#c8b98d'][j%3]);
 }else if(z.key==='impression'){
  if(q>.5)for(let j=0;j<2;j++)R(c,px+(j*7)%23,py+5+j*13,15+j*4,3,[g,light+'aa',shade+'55',water+'66'][j]);
 }else if(z.key==='shoal'){
  for(let j=0;j<3;j++)L(c,px,py+7+j*8,px+32,py+9+j*8,light,2);
 }else if(z.key==='lane'){
  if(q>.7){R(c,px+6,py+12,5,2,'#c4b080');R(c,px+21,py+20,4,2,'#a58f70');}
 }else{if(q>.7)R(c,px+7,py+17,12,3,light+'88');}
 return true;
}
function house(c,x,y,w,h,p,glass=false){
 R(c,x,y,w,h,p[3]);R(c,x+4,y+4,w-8,h-4,glass?p[2]+'88':p[0]);
 P(c,[[x-7,y+2],[x+w*.5,y-35],[x+w+7,y+2]],p[1]);
 for(let i=12;i<w-8;i+=20){R(c,x+i,y+14,10,16,glass?'#e3eee188':'#e6d7ad');L(c,x+i+4,y+14,x+i+4,y+30,p[3]);}
 R(c,x+w/2-8,y+h-27,16,27,'#547671');
}
export function drawWesternSite(c,s,time,phase=0){
 const z=WEST_STUDIES.find(z=>z.index===s.chapter);if(!z)return;
 const p=z.palette,x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,base=y+h,cx=x+w/2,key=s.form.slice(5);c.save();
 // Every visible foot coincides with the site's declared solid rectangles.
 if(key==='tree'){R(c,x+32,y+64,32,32,p[3]);L(c,x+48,y+66,x+25,y-30,p[3],12);for(let i=0;i<8;i++)E(c,x+48+Math.sin(i*2)*45,y-45+i%3*20,40,28,i%3?p[0]:p[3]);c.restore();return;}
 if(key==='home'){house(c,x,y,w,h,p);c.restore();return;}
 if(key==='glass'||key==='village'){
  R(c,x,y,w,h,'#719b9470');
  for(let i=0;i<8;i++){const xx=x+48+i*(w-90)/8;E(c,xx,y+h*.55,18,40,p[3]);E(c,xx+9,y+h*.4,20,25,'#8eaf7e');}
  const top=y-(key==='village'?105:85);
  P(c,[[x,base],[x, y+10],[cx,top],[x+w,y+10],[x+w,base]],'#d6e5d333');
  P(c,[[x+15,y+15],[cx,top+15],[x+w-15,y+15]],blend('#c2e3e0','#e7c79e',phase)+'88');
  L(c,x,y+10,cx,top,p[1],9);L(c,cx,top,x+w,y+10,p[1],9);
  for(let i=0;i<=6;i++){const xx=x+i*w/6;L(c,xx,base,xx,y+10,p[1],5);L(c,xx,y+10,cx,top,p[1],3);}
  for(let i=1;i<4;i++)L(c,x,y+i*h/4,x+w,y+i*h/4,p[1],4);
  R(c,x,y,32,h,p[3]);R(c,x+w-32,y,32,h,p[3]);R(c,x,y,w,32,p[1]);
  // Open front and human scale benches; no opaque wall across the doorway.
  R(c,x+45,base-25,55,12,'#a68d6b');R(c,x+w-105,base-25,55,12,'#a68d6b');
  if(key==='village'){L(c,x+100,y+60,x+240,y+60,p[3],2);for(let i=0;i<5;i++)R(c,x+110+i*23,y+62,14,20,['#d3a58d','#b2c3c2','#e6cc9e'][i%3]);}
 }else{
  if(!['lane','impression','dots','azure','grass','shoal'].includes(key)){R(c,x,base-64,64,64,p[3]);R(c,x+w-64,base-64,64,64,p[3]);}
  if(key==='windmill'){
   P(c,[[x,base-64],[x+8,y-90],[x+50,y-90],[x+64,base-64]],p[1]);
   const mx=x+30,my=y-55;c.save();c.translate(mx,my);c.rotate(time/16000);for(let i=0;i<4;i++){c.rotate(Math.PI/2);R(c,0,-4,108,8,p[3]);R(c,32,-3,73,26,p[1]);for(let k=40;k<100;k+=14)L(c,k,-3,k,23,p[3],2);}c.restore();
   house(c,x+w-66,y+70,64,h-70,p);for(let i=0;i<4;i++)E(c,cx-25+i*20,base-15,12,16,'#c5b08a');
  }else if(key==='mountain'){
   P(c,[[x,base-64],[x-10,y],[cx,y-120],[x+w+10,y],[x+w,base-64],[x+w-64,base-64],[x+w-64,y+25],[x+64,y+25],[x+64,base-64]],p[3]);
   L(c,x,y,cx,y-120,p[1],8);R(c,x+64,y+25,w-128,20,p[1]);
  }else if(key==='lane'||key==='impression'||key==='dots'){
   for(const xx of [x+16,x+w-16]){
    E(c,xx,base-6,24,8,p[3]+'55');R(c,xx-10,y-40,20,h+40,p[3]);
    for(let i=0;i<6;i++)E(c,xx+Math.sin(i*2)*42,y-65+i%3*28,45,30,i%2?p[0]:p[3]);
    if(key==='impression')for(let i=0;i<9;i++)L(c,xx-65+i*15,y-60,xx-60+i*15,y+100-i%3*18,p[0],5);
    if(key==='dots')for(let i=0;i<60;i++)R(c,xx-62+(i*29)%124,y-90+(i*17)%75,3,3,[p[1],p[0],'#91aa85'][i%3]);
   }
   R(c,cx-45,base-17,90,9,'#b69c79');
  }else if(key==='terrace'){
   for(let i=0;i<5;i++){R(c,x,base-64-i*15,64,10,i%2?p[0]:p[1]);R(c,x+w-64,base-64-i*15,64,10,i%2?p[0]:p[1]);}
   L(c,x+65,base-80,x+w-65,base-80,p[2],9);R(c,cx-12,base-105,24,44,p[3]);R(c,cx-3,base-104,6,35,p[1]);
  }else if(key==='cliff'){
   // Wind glass and a small basin share the local sky's colour at this rest stop.
   R(c,x+32,base-108,w-64,40,blend('#add2dc','#e9c3a5',phase)+'55');
   E(c,x+30,base-65,25,8,p[1]);E(c,x+30,base-67,21,5,blend('#92becd','#dcb7a3',phase));
   R(c,x,base-67,w,9,p[1]);L(c,x+30,base-67,x+30,base-110,p[1],6);L(c,x+w-30,base-67,x+w-30,base-110,p[1],6);
   for(let i=0;i<3;i++){R(c,x+20+i*77,base-38,55,8,'#b6a383');R(c,x+25+i*77,base-30,5,17,p[3]);}
  }else{
   if(key==='azure')for(const xx of [x,x+w-32]){P(c,[[xx,base-3],[xx+3,base-29],[xx+23,base-32],[xx+32,base-6]],p[3]);L(c,xx+3,base-29,xx+23,base-32,p[1],3);}
   if(key==='shoal')for(const xx of [x,x+w-64]){P(c,[[xx,base-11],[xx+9,base-31],[xx+63,base-25],[xx+56,base-2]],'#a69479');L(c,xx+10,base-28,xx+55,base-7,p[1],3);}
   if(key==='grass'){const fx=x+Math.floor(s.w/2)*32+16;R(c,fx-12,base-32,24,32,p[3]);L(c,fx,y-10,fx,base-25,p[3],6);P(c,[[fx,y-10],[fx+42,y+3],[fx,y+15]],p[1]);}
   for(let i=0;i<5;i++){const xx=x+10+i*(w-20)/5;R(c,xx,base-12,3,6,p[1]);R(c,xx+1,base-15,2,3,p[0]);}
  }
 }
 c.restore();
}
// Scene layers have WORLD windows and are drawn before solid foreground terrain.
// They can disappear behind a cliff when panning. Never a screen-attached strip.
export function drawWesternSky(c,camera,screen,phase,time=0){
 for(const z of WEST_STUDIES){
  if(!drawLandscapeSky(c,z,camera,screen,phase,time))continue;
  const b=skyWorldWindow(z),horizon=b.y+b.h;
  c.save();c.beginPath();c.rect(b.x,b.y,b.w,b.h);c.clip();
  if(z.key==='terrace')for(let row=0;row<6;row++){const pts=[];for(let i=0;i<=30;i++)pts.push([b.x+i*b.w/30,horizon-30-row*19+Math.sin(i*.2+row*.3)*22]);pts.push([b.x+b.w,horizon],[b.x,horizon]);P(c,pts,['#98b5a5','#b7c6a3','#d5cfac'][row%3]+'88');}
  if(z.key==='village')for(let i=0;i<7;i++){const xx=b.x+120+i*b.w/8,yy=horizon-75+Math.sin(i*2)*45;c.save();c.globalAlpha=.35+i%3*.15;P(c,[[xx-55,yy+30],[xx+45,yy+30],[xx+5,yy+65]],'#899f9e');house(c,xx-38,yy-40,75,65,z.palette,true);c.restore();}
  c.restore();
 }
}
export function drawWesternWeather(c,world,hero,camera,screen,time,phase){
 const z=westernAt(hero.px,hero.py);if(!z)return;const reflection=z.key==='cliff'?phase:z.key==='glass'?phase*.3:.1;
 const left=Math.floor((camera.x-screen.w/(2*camera.zoom))/32),right=Math.ceil((camera.x+screen.w/(2*camera.zoom))/32),top=Math.floor((camera.y-screen.h/(2*camera.zoom))/32),bottom=Math.ceil((camera.y+screen.h/(2*camera.zoom))/32);
 c.save();
 // Bounded local reflections and cloud shadows, masked to actual water/ground.
 for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
  if(x<z.x||x>z.x+z.w||y<z.y||y>z.y+z.h)continue;const t=world.tileAt(x,y);
  if(t==='L'){const q=(x*17+y*7)%11;R(c,x*32+2,y*32+q,25,3,blend('#d6e9df','#edc7a8',reflection)+'88');if(q<3)R(c,x*32+8,y*32+18,18,2,'#f5eee170');}
  else if(z.key==='cliff'&&t!=='west-sky'){c.globalAlpha=phase*.15;R(c,x*32,y*32,32,32,'#c89591');c.globalAlpha=1;}
  else if(t==='west-ground'&&['azure','grass','terrace'].includes(z.key)&&Math.sin(x*.04+time/40000)+Math.cos(y*.06+time/70000)>1.55)R(c,x*32,y*32,32,32,'#657f8d18');
 }
 if(z.key==='dots'){
  const bx=z.x+28,by=z.y+17;if(world.tileAt(bx,by)==='L'){const x=bx*32,y=by*32;E(c,x+13,y+18,28,11,'#5e849088');P(c,[[x-15,y+10],[x+35,y+10],[x+28,y+29],[x-5,y+31]],'#9b8065');L(c,x-10,y+12,x+32,y+12,'#e4cfaa',3);L(c,x+10,y,x+25,y+35,'#d9c5a0',3);}
 }
 c.restore();
}
