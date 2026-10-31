import {drawRegionalGrain} from './pilgrimage-ground.js';
import {drawRegionalEdge} from './pilgrimage-edges.js';
import {drawPilgrimPlay} from './pilgrimage-play.js';
import {drawPilgrimToy} from './pilgrimage-toys.js';
import {drawJourneyWonder} from './journey-wonders-art.js';
import {drawForestSite,drawForestTree,drawForestProp} from './forest-market-art.js';
// Original pixel compositions for #80. Terrain and solid footprints come from the world.
import {PILGRIM_ZONES} from './pilgrimage-world.js';
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const line=(c,x,y,a,b,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(Math.round(x),Math.round(y));c.lineTo(Math.round(a),Math.round(b));c.stroke();};
const poly=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const noise=(x,y)=>{let a=Math.imul(x+711,374761393)^Math.imul(y+129,668265263);a=Math.imul(a^(a>>>13),1274126177);return((a^(a>>>16))>>>0)/4294967295;};
export function pilgrimTileColor(world,x,y){
 const t=world.tileAt(x,y),z=world.zoneAt(x,y),p=z.palette;
 return t==='L'||t==='~'?'#81a6aa':t==='X'?p[3]:t==='+'?'#b4b3a0':t==='='?p[1]:p[0];
}
export function drawPilgrimTile(c,x,y,t,world){
 const px=x*32,py=y*32,z=world.zoneAt(x,y),[ground,light,water,shade]=z.palette,q=noise(x,y);
 rect(c,px,py,32,32,pilgrimTileColor(world,x,y));
 if(t==='L'||t==='~'){
  for(let j=0;j<3;j++)rect(c,px+noise(x+j,y)*25,py+6+j*9,4+noise(y,x+j)*13,1,'#d7ded044');
  if(q>.8)rect(c,px+6,py+25,18,2,'#487f8322');
 }else if(t==='X'&&drawRegionalEdge(c,x,y,world,z.theme,z.palette,q)){
  // #93: forest, canyon, salt and capital draw their own impassable grammar.
 }else if(t==='X'){
  poly(c,[[px,py+32],[px+3,py+9],[px+13,py+3],[px+24,py+10],[px+32,py+31]],shade);
  line(c,px+3,py+10,px+13,py+3,light);line(c,px+13,py+3,px+24,py+10,'#d4d7cc50');
  for(let j=0;j<3;j++)line(c,px+4,py+17+j*5,px+26,py+20+j*4,'#536d7128');
 }else if(t==='+'){
  for(let yy=3;yy<32;yy+=5)line(c,px,py+yy,px+32,py+yy,'#ddd9bd');
  line(c,px+3,py,px+3,py+32,shade,2);line(c,px+29,py,px+29,py+32,shade,2);
 }else{
  const dry=['dry','salt','capital','citadel'].includes(z.theme),green=['harbour','meadow','garden','forest'].includes(z.theme);
  for(let j=0;j<(dry?5:3);j++){
   const xx=px+noise(x+j*3,y)*28,yy=py+noise(y+j*7,x)*28;
   if(green&&t!=='='){rect(c,xx,yy,1,3+q*3,shade+'70');if(q>.62)rect(c,xx+2,yy+1,3,2,light);}
   else line(c,xx,yy,xx+3+q*7,yy+(dry?0:2),q>.5?light+'88':shade+'55');
  }
  drawRegionalGrain(c,x,y,z.theme,z.palette,q);
  if(t==='='&&q>.7){rect(c,px+5,py+16,6,2,ground);rect(c,px+19,py+8,4,1,shade+'55');}
  if(z.theme==='garden'&&t!=='='){line(c,px,py+15,px+32,py+15,water+'88');line(c,px+16,py,px+16,py+32,light+'88');}
  if(z.theme==='salt'&&q>.6)poly(c,[[px+8,py+20],[px+17,py+6],[px+23,py+22]],'#edf0e180');
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(world.tileAt(x+dx,y+dy)==='L')rect(c,px+(dx===1?29:0),py+(dy===1?29:0),dx?3:32,dy?3:32,light);
 }
}
function masonry(c,x,y,w,h,p){rect(c,x,y,w,h,p[0]);rect(c,x,y,3,h,p[1]);
 for(let yy=12;yy<h;yy+=12){line(c,x,y+yy,x+w,y+yy,p[3],1);for(let xx=(yy%24?0:13);xx<w;xx+=26)line(c,x+xx,y+yy-11,x+xx,y+yy,p[3],1);}}
function column(c,x,y,h,p,w=12){masonry(c,x,y,w,h,p);rect(c,x-4,y-4,w+8,7,p[1]);rect(c,x-4,y+h-5,w+8,7,p[3]);}
function bowl(c,x,y,w,h,p,wet){rect(c,x,y,w,h,p[3]);rect(c,x+4,y+4,w-8,h-7,wet?p[2]:p[1]);if(wet)line(c,x+7,y+7,x+w-9,y+7,'#dae5d3');}
function steps(c,x,y,w,h,p,n=7){for(let i=0;i<n;i++){rect(c,x-i*3,y+i*h/n,w+i*6,h/n+1,i%2?p[0]:p[1]);line(c,x-i*3,y+(i+1)*h/n,x+w+i*3,y+(i+1)*h/n,p[3]);}}
export function drawPilgrimSite(c,s,time=0){
 const z=PILGRIM_ZONES[s.chapter],p=z.palette,x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,cx=x+w/2,base=y+h;
 if(s.form.startsWith('wonder-')){drawJourneyWonder(c,s,p,time);drawPilgrimPlay(c,s,p);return;}
 c.save();rect(c,x+8,base-6,w-16,14,'#485f5b25');
 if(s.form.startsWith('forest-')){drawForestSite(c,s);drawPilgrimToy(c,s);drawPilgrimPlay(c,s,p);c.restore();return;}
 if(s.form==='monolith'){
  // The base is solid, the immense height is art; its top can leave the viewport.
  const top=y-360;
  poly(c,[[x+64,base],[x+68,top+29],[cx+24,top],[x+w-54,top+17],[x+w-49,base]],'#4d6268');
  poly(c,[[x+68,top+29],[cx+24,top],[cx+12,base],[x+64,base]],'#778982');
  rect(c,cx+18,top+40,8,base-top-59,'#364c58');
  for(let i=0;i<17;i++)rect(c,cx-34,top+73+i*23,23+(i%3)*9,2,'#b2bb9c70');
  // A second sliver makes the absent space feel as large as the stone itself.
  masonry(c,x+w-31,y-235,28,h+235,['#576b71','#a8b39e','#728f91','#485d64']);
  steps(c,x+45,base-26,w-90,22,p,4);
 }else if(s.form==='gate'||s.form==='citadel'){
  const gate=s.form==='gate',rise=gate?206:350;
  for(const side of [0,1]){
   const xx=side?x+w-64:x;masonry(c,xx,y-rise,64,h+rise,p);
   for(let i=0;i<7;i++){rect(c,xx+13,y-rise+34+i*37,9,20,'#566c65');rect(c,xx+30,y-rise+38+i*37,21,3,p[1]);}
  }
  masonry(c,x-18,y-rise-22,w+36,36,p);
  for(let band=0;band<3;band++){
   const xx=x+36+band*19,yy=y-rise+48+band*51;
   line(c,xx,yy,x+w-36-band*19,yy,p[1],3);
  }
  if(!gate){
   for(let i=0;i<5;i++)column(c,x+75+i*(w-150)/5,y-210,165,p,13);
   bowl(c,cx-37,base-63,74,43,p,false);
  }
  steps(c,cx-34,base-15,68,26,p,5);
 }else if(s.form==='garden'){
  const wet=s.chapter===2;
  poly(c,[[x,base],[x+17,y+20],[x+w-17,y+20],[x+w,base]],p[0]);
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const xx=side<0?x+13:x+w-32,yy=y+21+i*(h-56)/4;
   bowl(c,xx+(side<0?25:-42),yy+37,44,27,p,wet);column(c,xx,yy,58,p,15);
  }
  bowl(c,cx-38,y+34,76,34,p,wet);
  line(c,cx,y+68,cx,base-11,wet?p[2]:p[3],8);
  for(const side of [-1,1])for(let i=0;i<3;i++)bowl(c,cx+side*(48+i*22)-9,base-28,18,14,p,wet);
  steps(c,cx-28,base-7,56,18,p,5);
 }else if(s.form==='sealed'){
  masonry(c,x+35,y-125,w-70,h+125,p);poly(c,[[x+25,y-124],[cx,y-164],[x+w-25,y-124]],p[1]);
  rect(c,cx-3,y-39,6,29,'#415e5d');bowl(c,cx-22,base-22,44,22,p,true);
  for(let j=0;j<4;j++)line(c,x+51,y-88+j*35,x+w-51,y-88+j*35,p[1],2);
 }else if(s.form==='tea'){
  masonry(c,x+23,y+47,w-46,h-49,p);
  poly(c,[[x+8,y+50],[cx,y-10],[x+w-8,y+50]],s.chapter===8?'#879c9a':'#bba58c');
  rect(c,cx-18,base-72,36,72,'#5f7b75');rect(c,cx-12,base-66,24,39,'#e0c79d');
  for(let i=0;i<4;i++)rect(c,x+42+i*(w-84)/4,y+82,22,27,'#cad8c2');
  line(c,x+23,base-48,x+w-23,base-48,p[1],3);
  for(let i=0;i<6;i++)bowl(c,x+35+i*27,base-7,19,13,p,false);
 }else if(s.form==='wheel'){
  masonry(c,x+37,base-40,w-74,39,p);
  c.strokeStyle=p[3];c.lineWidth=8;c.beginPath();c.ellipse(cx,base-46,w*.24,15,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line(c,cx,base-46,cx+Math.cos(a)*w*.23,base-46+Math.sin(a)*14,p[1],3);}
  for(let i=0;i<3;i++)bowl(c,cx-55+i*40,base-19,29,19,p,true);
 }else if(s.form==='arch'){
  const pier=Math.min(64,w/4);
  masonry(c,x,y-48,pier,h+48,p);masonry(c,x+w-pier,y-48,pier,h+48,p);masonry(c,x-9,y-69,w+18,27,p);
  for(let j=0;j<3;j++)rect(c,x+60+j*19,y-53,9,8,p[3]);
 }else if(s.form==='stairs'){
  for(let i=0;i<5;i++)column(c,x+25+i*(w-50)/5,y-56,h+31,p,10);
  steps(c,cx-38,base-55,76,56,p,7);
  for(let i=0;i<8;i++)line(c,x+13,y+20+i*21,x+37,y+20+i*21,p[3],2);
 }else if(s.form==='pier'){
  for(let i=0;i<7;i++)column(c,x+12+i*(w-24)/7,y-25,h+25,p,11);
  masonry(c,x,y-42,w,24,p);line(c,x,y-43,x+w,y-43,p[1],4);
 }else if(s.form==='boat'){
  poly(c,[[x+3,y+26],[x+w-4,y+14],[x+w-24,base-6],[x+24,base-6]],p[3]);
  line(c,cx,y+5,cx,base-19,p[1],3);poly(c,[[cx,y+6],[cx+42,y+42],[cx,y+47]],p[1]);
 }else if(s.form==='bowl')bowl(c,x+12,y+13,w-24,h-24,p,s.chapter<6);
 else{
  column(c,cx-8,y-19,h+19,p,16);
  for(let i=0;i<5;i++)rect(c,cx-5,y+i*17,10,2,p[3]);
 }
 drawPilgrimPlay(c,s,p);c.restore();
}
export function drawPilgrimDecor(c,world,bounds){
 for(const d of world.decor){
  if(d.x<bounds.left-2||d.x>bounds.right+2||d.y<bounds.top-2||d.y>bounds.bottom+5)continue;
  const p=PILGRIM_ZONES[d.chapter].palette,x=d.x*32,y=d.y*32,v=d.variant;
  if(d.solid){poly(c,[[x+2,y+23],[x+24,y+19],[x+32,y+28],[x+9,y+32]],p[3]+'55');line(c,x+6,y+29,x+27,y+25,p[1],2);}
  if(v!==12&&world.zoneAt(d.x,d.y).theme==='forest'&&drawForestProp(c,d))continue;
  if(v===12){drawForestTree(c,d,'trunk');}
  else if(v===0){line(c,x+14,y+27,x+15,y-11,p[3],2);poly(c,[[x+15,y-10],[x+41,y-5],[x+15,y+6]],p[1]);}
  else if(v===1){for(let i=0;i<4;i++){line(c,x+4+i*7,y+26,x+5+i*7,y+8,p[3]);rect(c,x+3+i*7,y+6,4,3,d.chapter%2?'#d5bbad':'#e6dfbd');}}
  else if(v===2){rect(c,x+7,y-30,17,58,p[3]);rect(c,x+8,y-29,3,54,p[1]);for(let i=0;i<3;i++)rect(c,x+13,y-20+i*12,6,2,p[0]);}
  else if(v===3){bowl(c,x+3,y+12,27,15,p,d.chapter<6);line(c,x+15,y+27,x+15,y+39,p[2],3);}
  else if(v===4){line(c,x,y+22,x+31,y+14,p[3],3);for(let j=0;j<3;j++)line(c,x+4+j*11,y+3,x+4+j*11,y+28,p[3],2);}
  else if(v===5){steps(c,x+5,y+9,19,19,p,4);}
  else if(v===6){rect(c,x+7,y+5,19,21,p[1]);rect(c,x+8,y+9,17,2,p[3]);rect(c,x+11,y+3,4,23,p[3]+'66');}
  else if(v===7){column(c,x+9,y-19,45,p,9);}
  else if(v===8){poly(c,[[x+2,y+13],[x+29,y+8],[x+21,y+27],[x+9,y+25]],p[3]);line(c,x+2,y+12,x+29,y+7,p[1],2);}
  else if(v===9){masonry(c,x+5,y-3,24,30,p);bowl(c,x+4,y-10,27,14,p,false);}
  else if(v===10){for(let i=0;i<3;i++)rect(c,x+4+i*8,y+14+(i%2)*5,6,8,p[1]);line(c,x+2,y+27,x+30,y+27,p[3],2);}
  else{line(c,x+17,y-8,x+17,y+26,p[3],2);c.strokeStyle=p[1];c.lineWidth=3;c.beginPath();c.arc(x+17,y+2,8,0,Math.PI*2);c.stroke();}
 }
}
export function drawPilgrimOutlook(c,world,hero,width,height){
 const z=world.zoneAt(hero.px,hero.py);if(!['ridge','capital','citadel','monolith'].includes(z.theme))return;
 const opacity=Math.max(0,Math.min(1,(22-Math.hypot(hero.px-z.cx,hero.py-z.cy))/10));if(!opacity)return;
 const p=z.palette,scale=z.theme==='ridge'?.3:z.theme==='capital'?.7:z.theme==='citadel'?1:.45,base=Math.min(height*.2,140);
 c.save();c.globalAlpha=opacity;const fade=c.createLinearGradient(0,0,0,base+33);fade.addColorStop(0,p[0]+'e0');fade.addColorStop(1,p[0]+'00');rect(c,0,0,width,base+33,fade);
 for(let band=0;band<3;band++)for(let i=0;i<17;i++){
  const x=width*.06+i*width*.066+band*8,h=(12+noise(i,band)*64)*scale;
  rect(c,x,base-h-band*10,Math.max(5,width*.027),h,band===0?p[3]+'66':p[0]);
  if(z.theme!=='monolith'){rect(c,x-3,base-h-band*10,width*.033,3,p[1]);rect(c,x+5,base-7,3,12,p[3]+'55');}
 }
 c.restore();
}
export function drawPilgrimVista(canvas,kind){
 canvas.width=480;canvas.height=252;const c=canvas.getContext('2d'),z=PILGRIM_ZONES.find(z=>'pilgrim-'+z.theme===kind)||PILGRIM_ZONES[0],p=z.palette;
 const sky=c.createLinearGradient(0,0,0,252);sky.addColorStop(0,p[2]);sky.addColorStop(.62,p[0]);sky.addColorStop(1,p[1]);rect(c,0,0,480,252,sky);
 for(let band=0;band<3;band++){
  const points=[[0,252]];for(let i=0;i<=12;i++)points.push([i*40,95+band*35+noise(i,band)*24]);points.push([480,252]);poly(c,points,band===2?p[0]:p[3]+(band===0?'77':'aa'));
 }
 const form=z.theme==='monolith'?'monolith':['capital','citadel'].includes(z.theme)?'gate':z.theme==='garden'||z.theme==='dry'?'garden':z.theme==='sealed'?'sealed':'stairs';
 c.save();c.translate(75,125);c.scale(.7,.7);drawPilgrimSite(c,{form,chapter:z.index,x:0,y:0,w:13,h:5});c.restore();
 if(['garden','salt','harbour'].includes(z.theme)){rect(c,0,207,480,45,p[2]);for(let i=0;i<12;i++)rect(c,i*43,215+i%3*8,23,1,p[1]+'66');}
 rect(c,195,223,4,5,'#e4cba9');rect(c,193,228,8,12,'#4f7178');rect(c,193,239,3,7,p[3]);rect(c,198,239,3,7,p[3]);
}
