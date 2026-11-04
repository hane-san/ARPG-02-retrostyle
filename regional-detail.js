import {landscapeHash as hash,landscapeNoise} from './landscape-geometry.js';
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const L=(c,x,y,a,b,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const P=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const family={conifer:'forest',climb:'ridge',windruin:'canyon',plateau:'salt',dusk:'windmill',shore:'impression'};
function land(z,y){const key=y>=288?(z.westKey||z.key||z.theme):z.theme;return family[key]||key;}

// Flat material marks only: no new walls, raised furniture or pretend rivers.
// Called while generating static chunks, never across the whole map per frame.
export function drawRegionalGroundDetail(c,x,y,t,world){
 if(!world.walkable(x,y)||['west-stair','west-bridge','se-stair','se-boardwalk','se-stonebridge','+'].includes(t))return;
 const z=world.zoneAt(x,y),key=land(z,y),[g,l,w,s]=z.palette,q=hash(x,y),field=landscapeNoise(x+z.index*7,y,8),px=x*32,py=y*32;
 if(t==='='){
  if(q>.78){L(c,px+3,py+19,px+24,py+15,s+'30');R(c,px+11,py+24,3,1,l);}
  if(['port','harbour','inn'].includes(key)&&q>.93){c.strokeStyle='#ae957666';c.lineWidth=1;c.beginPath();c.ellipse(px+15,py+17,6,4,0,0,Math.PI*2);c.stroke();}
  return;
 }
 if(key==='forest'||key==='lane'){
  if(field>.55){P(c,[[px,py+32],[px+5,py+8],[px+19,py+2],[px+32,py+18],[px+32,py+32]],'#6d987522');if(q>.46)for(let j=0;j<3;j++){const a=px+6+j*8,b=py+17+j%2*8;L(c,a,b+7,a+4,b-4,s+'88');L(c,a+2,b+1,a-3,b-1,s+'88');L(c,a+3,b-1,a+8,b-2,s+'88');}}
  if(q>.75)for(let j=0;j<3;j++)P(c,[[px+5+j*8,py+8+j*5],[px+10+j*8,py+9+j*5],[px+8+j*8,py+12+j*5]],['#d3b77c88','#9d795e77','#e5d89c99'][j]);
 }else if(['garden','dry','threshold','sealed'].includes(key)){
  const wet=key==='garden',tint=wet?'#7eaaa488':'#a3977a88';
  if((x+y*2)%7===0){c.strokeStyle=tint;c.lineWidth=1;c.strokeRect(px+7,py+5,19,21);L(c,px+16,py+5,px+16,py+26,tint);R(c,px+9,py+13,15,2,l+'aa');}
  if(field>.6&&q>.56){E(c,px+14,py+21,9,3,wet?'#84b29b55':'#c2b48b55');L(c,px+5,py+23,px+23,py+21,s+'66');}
 }else if(['capital','citadel','monolith'].includes(key)){
  if((x+2*y)%9===0){L(c,px+4,py+4,px+26,py+4,l,2);L(c,px+4,py+4,px+4,py+26,l,2);for(let j=0;j<3;j++)R(c,px+8+j*5,py+10,2,8,s+'77');}
  if(field>.57&&q>.65){R(c,px+5,py+23,15,2,'#8da69a77');R(c,px+19,py+19,5,5,'#8da69a44');}
 }else if(['canyon','mesa','mountain','cliff','ridge'].includes(key)){
  if(field>.55&&q>.47){const col=['canyon','mesa'].includes(key)?'#b3816655':'#a5b7b066';P(c,[[px+3,py+23],[px+11,py+16],[px+23,py+19],[px+28,py+25],[px+13,py+27]],col);L(c,px+9,py+18,px+22,py+19,l+'bb');}
  if(q>.8){L(c,px+8,py+4,px+13,py+12,s+'66');L(c,px+13,py+12,px+25,py+9,s+'55');}
  if(key==='ridge'&&field>.64){R(c,px+4,py+18,19,2,'#edf0df99');R(c,px+8,py+15,13,2,'#d9e5d799');}
 }else if(['grass','azure','windmill','terrace'].includes(key)){
  if(field>.53&&q>.35){
   const colours=key==='azure'?['#f2f1df','#c7dcd4','#afcbd1']:key==='windmill'?['#e3cf97','#c7ba80','#d9c9a1']:['#e9d795','#c4d5a3','#d7b9a5'];
   for(let j=0;j<4;j++){const xx=px+3+(j*11)%27,yy=py+7+(j*7)%20;L(c,xx,yy+5,xx+1,yy,s+'66');R(c,xx,yy,3,2,colours[j%3]);if(key==='windmill')L(c,xx-2,yy+2,xx+4,yy-1,l+'88');}
  }
 }else if(['harbour','port','inn','village','glass'].includes(key)){
  if(field>.56&&q>.66){P(c,[[px+2,py+24],[px+8,py+18],[px+19,py+17],[px+27,py+23],[px+21,py+28]],g+'88');L(c,px+6,py+21,px+24,py+22,l+'aa');}
  if(q>.88){R(c,px+4,py+10,6,3,'#d4af8377');R(c,px+18,py+23,9,2,s+'66');}
  if(key==='glass'&&field>.52){L(c,px+12,py+25,px+15,py+13,'#7f9c76',2);E(c,px+11,py+17,4,2,'#a1ba84');E(c,px+18,py+13,4,2,'#799b78');}
 }else if(['impression','dots','shoal','marsh','coast','salt'].includes(key)){
  const shore=[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(([a,b])=>world.tileAt(a,b)==='L');
  if(shore){L(c,px+2,py+23,px+28,py+21,l+'aa',2);if(q>.45)L(c,px+4,py+28,px+23,py+27,w+'88');}
  if(key==='dots'&&field>.51)for(let j=0;j<7;j++)R(c,px+(j*13+x)%29,py+(j*7+y)%29,2,2,['#d9c791','#8daaa1','#dce3bd'][j%3]);
  else if(key==='impression'&&field>.53){L(c,px+2,py+11,px+23,py+15,'#acbfa788',3);L(c,px+8,py+25,px+30,py+23,l+'88',2);}
  else if(q>.72){E(c,px+9,py+21,3,1.6,l);E(c,px+23,py+9,2,1.3,s+'66');if(key==='marsh')for(let j=0;j<3;j++)L(c,px+5+j*8,py+29,px+3+j*8,py+17,s+'88');}
 }
}

// Refashion existing solid feet into the equipment/material of their own land.
// Variant/occupancy flags do not change; all bases remain inside the same tile.
export function drawRegionalSolidProp(c,d,z){
 if(!d.solid)return false;
 const key=land(z,d.y),[g,l,w,s]=z.palette,x=d.x*32,y=d.y*32,v=d.variant;
 const wet=key==='garden',waterworks=wet||['dry','threshold','sealed','capital','citadel','monolith'].includes(key);
 if(waterworks){
  if(v===2){R(c,x+7,y-28,18,60,s);R(c,x+9,y-25,4,54,l);R(c,x+16,y-22,6,39,wet?'#8dbbb6':'#aeaa8b');for(let j=0;j<5;j++)R(c,x+11,y-15+j*8,10,1,l);}
  else if(v===4){for(let j=0;j<3;j++){R(c,x+2+j*11,y-9,6,41,s);R(c,x+3+j*11,y-7,2,36,l);}L(c,x+2,y+2,x+29,y+2,'#b5a17d',4);L(c,x+2,y+20,x+29,y+20,wet?w:'#b5aa8e',3);}
  else if(v===7){R(c,x+10,y-14,13,46,s);E(c,x+16,y-14,14,14,l);E(c,x+16,y-14,10,10,wet?'#a1c6ba':'#c9c6ad');L(c,x+16,y-14,x+22,y-20,s,2);R(c,x+13,y+8,6,17,'#bdab86');}
  else{R(c,x+2,y+2,29,30,s);R(c,x+4,y+4,25,4,l);R(c,x+7,y-7,19,12,'#b9a783');R(c,x+10,y-4,13,7,wet?w:'#b7b59b');for(let j=0;j<3;j++)R(c,x+7+j*8,y+17,3,8,l);}
  return true;
 }
 if(['harbour','port','inn','village'].includes(key)){
  if(v===2){R(c,x+12,y-33,8,65,'#806e55');R(c,x+5,y-35,23,5,'#c6ac7e');R(c,x+7,y-29,19,23,'#d7bf8f');R(c,x+10,y-25,13,16,'#eddba7');for(let j=0;j<3;j++)R(c,x+11+j*4,y-26,1,19,s);}
  else if(v===9){for(let j=0;j<3;j++){E(c,x+8+j*8,y+21-j%2*7,8,10,['#bda781','#c9b991','#b3b59a'][j]);L(c,x+5+j*8,y+15-j%2*7,x+11+j*8,y+15-j%2*7,s);}}
  else if(v===7){R(c,x+11,y-15,10,47,s);L(c,x+1,y-17,x+31,y-17,'#c0a57c',6);L(c,x+7,y-15,x+7,y+15,l,2);R(c,x+3,y+12,8,9,'#bca982');}
  else{R(c,x+2,y+8,29,24,'#998268');for(let j=0;j<4;j++)R(c,x+4+j*7,y+9,2,20,'#d2b894');L(c,x+2,y+14,x+30,y+25,s,2);}
  return true;
 }
 if(['canyon','mesa','ridge','mountain','salt'].includes(key)){
  P(c,[[x+2,y+32],[x+5,y-4],[x+13,y-22],[x+27,y-8],[x+31,y+32]],s);P(c,[[x+5,y-4],[x+13,y-22],[x+19,y+27],[x+2,y+32]],g);
  for(let j=0;j<4;j++)L(c,x+7,y+1+j*7,x+27,y-1+j*7,l+'77',2);if(v===7)L(c,x+13,y-20,x+24,y-7,l,2);return true;
 }
 return false;
}
