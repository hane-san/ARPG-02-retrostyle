import {fixedSource} from './fixed-journey-data.js';
// Hand-drawn, 32px-board pieces for the playful landforms in fixed-features.js.
// Ground pieces lie under everything; solid pieces join the depth-sorted
// object layer with people, buildings and the traveller.
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const mix=(a,b,t)=>{const v=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=v(a),B=v(b);return '#'+A.map((n,i)=>Math.round(n+(B[i]-n)*t).toString(16).padStart(2,'0')).join('');};
const leaf=land=>land==='forest'?['#2f5a45','#447257','#6a9473']:land==='village'?['#3f6b4c','#588a5e','#86b07a']:['#4c7a49','#679855','#94bd72'];
const rock=room=>{const p=fixedSource(room.sourceIndex).palette;return [mix(p[3],'#5d6466',.45),mix(p[1],'#8f9693',.45),mix(p[1],'#f1ecd8',.35)];};
export function drawFeatureGround(c,room,f,time){
 const p=fixedSource(room.sourceIndex).palette;
 for(const [cx,cy] of f.cells){const x=cx*32,y=cy*32;
  if(f.kind==='stones'){for(const [ox,oy,rx] of [[9,11,7],[22,20,8],[12,25,5]]){E(c,x+ox,y+oy+2,rx,rx*.55,'#2c4a5566');E(c,x+ox,y+oy,rx,rx*.55,mix(p[1],'#c9c6b3',.4));E(c,x+ox-2,y+oy-1,rx*.5,rx*.25,'#f4f0dfaa');}}
  else if(f.kind==='flowers'){const cols=['#f3e7a1','#f2b7c4','#ffffff','#c9b5ec'];for(let i=0;i<9;i++){const fx=x+4+((i*11+f.seed*97)%24),fy=y+5+((i*7+f.seed*53)%22);R(c,fx,fy+2,1,3,'#5d8a52');R(c,fx-1,fy,3,3,cols[(i+Math.floor(f.seed*4))%4]);R(c,fx,fy+1,1,1,'#f6c35a');}}
  else if(f.kind==='ring'){for(let i=0;i<7;i++){const a=i/7*Math.PI*2,sx=x+16+Math.cos(a)*11,sy=y+17+Math.sin(a)*7;E(c,sx,sy+1.5,3.4,2,'#3b464455');E(c,sx,sy,3.2,2.1,mix(p[1],'#d8d2bd',.35));}R(c,x+15,y+15,2,2,'#f3ecd1');}
  else if(f.kind==='lilies'){for(const [ox,oy,r] of [[10,12,5],[21,19,6],[13,24,4]]){E(c,x+ox,y+oy,r,r*.7,'#5f9a68');c.fillStyle='#2f5f55';c.beginPath();c.moveTo(x+ox,y+oy);c.lineTo(x+ox+r,y+oy-1);c.lineTo(x+ox+r,y+oy+1);c.fill();}R(c,x+20,y+17,3,3,'#f4d6e2');R(c,x+21,y+18,1,1,'#f2c35d');}
 }
}
export function featureObjects(c,room,f,time){
 if(f.ground)return [];
 const out=[];
 for(const [cx,cy] of f.cells){const x=cx*32,y=cy*32,s=f.seed;
  const paint={
   bush:()=>{const [d,m,l]=leaf(room.land);E(c,x+16,y+27,15,5,'#24372c55');E(c,x+9,y+18,10,9,d);E(c,x+23,y+18,10,9,d);E(c,x+16,y+12,11,10,m);E(c,x+10,y+16,7,6,m);E(c,x+13,y+9,5,4,l);E(c,x+22,y+13,4,3,l);if(room.land!=='forest')for(let i=0;i<3;i++)R(c,x+7+((i*9+s*40)%18),y+12+((i*5)%9),2,2,room.land==='village'?'#f2d0dc':'#f6e9a8');},
   boulder:()=>{const [d,m,l]=rock(room);E(c,x+16,y+27,14,5,'#2a333355');c.fillStyle=d;c.beginPath();c.moveTo(x+3,y+26);c.quadraticCurveTo(x+2,y+11,x+13,y+7);c.quadraticCurveTo(x+27,y+5,x+29,y+20);c.quadraticCurveTo(x+30,y+27,x+22,y+28);c.closePath();c.fill();c.fillStyle=m;c.beginPath();c.moveTo(x+6,y+22);c.quadraticCurveTo(x+6,y+12,x+14,y+9);c.quadraticCurveTo(x+24,y+8,x+26,y+18);c.quadraticCurveTo(x+20,y+16,x+6,y+22);c.fill();E(c,x+13,y+12,4,2,l);R(c,x+17,y+17,6,1,d);},
   cairn:()=>{const [d,m,l]=rock(room);E(c,x+16,y+28,11,4,'#2a333355');for(const [w,h,yy] of [[22,7,21],[16,6,14],[10,5,8]]){E(c,x+16,y+yy+1,w/2,h/2,d);E(c,x+16,y+yy,w/2,h/2,m);E(c,x+14,y+yy-1,w/4,h/5,l);}},
   stump:()=>{E(c,x+16,y+27,12,4,'#2e2a2255');R(c,x+7,y+14,18,12,'#7a5a3f');E(c,x+16,y+26,9,3,'#6a4c35');E(c,x+16,y+14,9,4,'#c9a774');c.strokeStyle='#8f6b48';c.lineWidth=1;c.beginPath();c.ellipse(x+16,y+14,5,2,0,0,Math.PI*2);c.stroke();R(c,x+24,y+20,5,2,'#5d8a52');},
   sign:()=>{E(c,x+16,y+28,8,3,'#2e2a2255');R(c,x+14,y+12,4,16,'#80603f');R(c,x+5,y+6,22,9,'#c79f6b');R(c,x+5,y+14,22,2,'#8d6a45');c.fillStyle='#5b4330';for(const [ax,dir] of [[9,1],[23,-1]]){c.beginPath();c.moveTo(x+ax+dir*4,y+10);c.lineTo(x+ax,y+8);c.lineTo(x+ax,y+12);c.fill();}},
   pond:()=>{},
   reeds:()=>{for(let i=0;i<6;i++){const rx=x+7+i*3.6,h=12+((i*7+s*31)%9);c.strokeStyle=i%2?'#6f8f55':'#557a46';c.lineWidth=1.5;c.beginPath();c.moveTo(rx,y+28);c.quadraticCurveTo(rx+1,y+28-h/2,rx+(i%2?2:-1),y+28-h);c.stroke();}R(c,x+12,y+9,2,5,'#8a6a45');R(c,x+21,y+11,2,5,'#8a6a45');},
   glint:()=>{const tw=time?.5+.5*Math.sin(time/420+s*9):1;R(c,x+11,y+22,1,4,'#6c9a63');R(c,x+14,y+21,1,5,'#5a8a55');R(c,x+18,y+22,1,4,'#6c9a63');c.save();c.globalAlpha*=.35+.65*tw;c.fillStyle='#fff8d8';c.beginPath();c.moveTo(x+16,y+11);c.lineTo(x+17.5,y+15.5);c.lineTo(x+22,y+17);c.lineTo(x+17.5,y+18.5);c.lineTo(x+16,y+23);c.lineTo(x+14.5,y+18.5);c.lineTo(x+10,y+17);c.lineTo(x+14.5,y+15.5);c.closePath();c.fill();c.restore();}
  }[f.kind];
  if(paint)out.push({y:cy+(f.kind==='glint'?.2:.95),paint});
 }
 return out;
}
// The pond reads as a small framed water with a few rim stones.
export function drawPondRim(c,room,f){
 if(f.kind!=='pond')return;const xs=f.cells.map(a=>a[0]),ys=f.cells.map(a=>a[1]),x=Math.min(...xs)*32,y=Math.min(...ys)*32,w=(Math.max(...xs)-Math.min(...xs)+1)*32,h=(Math.max(...ys)-Math.min(...ys)+1)*32;
 const [d,m,l]=rock(room);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,sx=x+w/2+Math.cos(a)*(w/2-3),sy=y+h/2+Math.sin(a)*(h/2-3);E(c,sx,sy+1,4,2.4,d);E(c,sx,sy,3.6,2.2,m);}
 E(c,x+w*.35,y+h*.4,5,3.5,'#5f9a68');E(c,x+w*.62,y+h*.62,4,3,'#6aa36f');R(c,x+w*.62,y+h*.6,2,2,'#f4d6e2');
}
