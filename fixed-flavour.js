// 2026-11-14 (producer: "a little movement in parts of the map, like the
// windmill turning — flavour that makes it feel alive"). Small, ambient life on
// the board the traveller stands on: grass and reeds swaying, light glinting on
// water and the odd fish ring, butterflies over gardens and meadows, leaves
// drifting down in forests, fireflies on night boards, snow on the glacier,
// a flock of birds now and then over the sky, slow cloud shadows, and smoke or
// steam from chimneys, tents and kitchens.
// Nothing here is physical or interactive, nothing is saved, and it all stops
// under Reduced Motion (the board is then drawn at time 0). Placement is seeded
// per board, so every visit looks the same; only time moves.
import {FIXED_SKIES} from './fixed-sky.js';
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fill();};
const noise=(x,y,k=0)=>{const s=Math.sin(x*127.1+y*311.7+k*74.7)*43758.5453;return s-Math.floor(s);};
const cache=new WeakMap();
function plan(room){
 let p=cache.get(room);if(p)return p;
 const lawn=[],water=[],gx0=room.col*15,gy0=room.row*15;
 for(let y=1;y<14;y++)for(let x=1;x<14;x++){const t=room.tileAt(x,y);if(t==='g')lawn.push([x,y]);if(t==='w')water.push([x,y]);}
 const pick=(list,n,k)=>list.filter(([x,y])=>noise(gx0+x,gy0+y,k)<n/Math.max(1,list.length)*1.6).slice(0,n);
 const sky=FIXED_SKIES[room.sky]||{},night=!!(sky.stars||sky.moon),land=room.land||'village';
 const grassy=['meadow','terrace','village','forest','canal','river','pond','marsh','shore'].includes(land)||!room.land;
 p={lawn,water,night,land,sky,
  tufts:grassy?pick(lawn,12,1):['dry','salt','ridge'].includes(land)?pick(lawn,6,1):[],
  sparkles:pick(water,7,2),
  butterflies:!night&&['meadow','terrace','village','canal','pond','forest'].includes(land)||(!night&&!room.land)?[0,1].map(i=>({cx:3+noise(gx0,gy0,10+i)*9,cy:4+noise(gx0,gy0,12+i)*7,phase:i*2.1,col:['#f6e27a','#f2b8d0','#ffffff','#b9d8f2'][Math.floor(noise(gx0,gy0,14+i)*4)]})):[],
  leaves:land==='forest'?[0,1,2,3,4].map(i=>({x:40+noise(gx0,gy0,20+i)*400,off:noise(gx0,gy0,25+i)*520,col:['#c7a46a','#a9894f','#d7b97c','#8fae5a'][i%4]})):[],
  fireflies:night&&lawn.length?[0,1,2,3,4,5,6,7].map(i=>({cx:2+noise(gx0,gy0,30+i)*11,cy:3+noise(gx0,gy0,38+i)*9,phase:i*1.7})):[],
  snow:!!sky.snow,
  birds:!night&&!sky.fog,
  clouds:!night};
 cache.set(room,p);return p;
}
// Under the people and buildings: grass, water light, cloud shadows.
export function drawFlavourGround(c,room,time){
 if(!time)return;const p=plan(room),t=time/1000;
 const blade=p.land==='marsh'?['#7f8f4f','#a1823e']:['dry','salt','ridge'].includes(p.land)?['#b9a26f','#9d8656']:['#4f7a46','#6f9a58'];
 c.save();c.lineCap='round';
 for(const [x,y] of p.tufts){const ph=noise(x,y,3)*6,sway=Math.sin(t*1.6+ph+x*.4)*2.6;for(let i=0;i<3;i++){const bx=x*32+9+i*6,by=y*32+26,h=(p.land==='marsh'?13:8)+i%2*3;c.strokeStyle=blade[i%2];c.lineWidth=1.3;c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+sway*.4,by-h*.6,bx+sway,by-h);c.stroke();}}
 for(const [x,y] of p.sparkles){const ph=noise(x,y,4)*7,a=Math.pow(Math.max(0,Math.sin(t*1.8+ph)),6);if(a<.03)continue;const sx=x*32+8+noise(x,y,5)*16,sy=y*32+8+noise(x,y,6)*16;c.globalAlpha=a*.9;c.fillStyle='#ffffff';c.beginPath();c.moveTo(sx,sy-3.5);c.lineTo(sx+1,sy-1);c.lineTo(sx+3.5,sy);c.lineTo(sx+1,sy+1);c.lineTo(sx,sy+3.5);c.lineTo(sx-1,sy+1);c.lineTo(sx-3.5,sy);c.lineTo(sx-1,sy-1);c.closePath();c.fill();}
 // Now and then a fish rises: one ring, every few seconds, somewhere on the water.
 if(p.water.length){const beat=Math.floor(t/4.5),age=t/4.5-beat;if(age<.5){const [x,y]=p.water[Math.floor(noise(beat,room.col,7)*p.water.length)],r=3+age*26;c.globalAlpha=(1-age*2)*.6;c.strokeStyle='#ffffff';c.lineWidth=1.2;c.beginPath();c.ellipse(x*32+16,y*32+16,r,r*.45,0,0,Math.PI*2);c.stroke();}}
 // Slow cloud shadows drifting across the land.
 if(p.clouds){c.globalAlpha=1;for(let i=0;i<2;i++){const cx=((t*9+i*360+room.col*70)%900)-210,cy=120+i*190+Math.sin(t*.05+i)*20;E(c,cx,cy,120,46,'rgba(30,44,46,.055)');E(c,cx+60,cy+16,80,30,'rgba(30,44,46,.04)');}}
 c.restore();
}
// Over the people and buildings: creatures, leaves, snow, birds, smoke.
export function drawFlavourAir(c,room,time,smoke=[]){
 if(!time)return;const p=plan(room),t=time/1000;c.save();
 for(const s of smoke){const [sx,sy,kind]=s;for(let i=0;i<4;i++){const age=((t*.35+i/4)%1),x=sx+Math.sin(t*1.2+i*1.7)*3+age*(kind==='steam'?4:10),y=sy-age*(kind==='steam'?26:44);c.globalAlpha=(1-age)*(kind==='steam'?.5:.5);E(c,x,y,3+age*(kind==='steam'?5:9),2.4+age*(kind==='steam'?3.5:6),kind==='steam'?'#ffffff':'#d9ddd8');}}
 for(const b of p.butterflies){const x=(b.cx+Math.sin(t*.55+b.phase)*2.6+Math.sin(t*1.3+b.phase)*.8)*32,y=(b.cy+Math.cos(t*.42+b.phase*1.3)*2+Math.sin(t*2.1)*.3)*32,flap=Math.abs(Math.sin(t*11+b.phase));c.globalAlpha=1;E(c,x+1,y+10,2.5,1,'rgba(30,44,46,.18)');E(c,x-2.2*flap,y,2.6*flap+.4,2.4,b.col);E(c,x+2.2*flap,y,2.6*flap+.4,2.4,b.col);c.fillStyle='#3a3530';c.fillRect(x-.5,y-1.5,1,3);}
 for(const l of p.leaves){const y=((t*28+l.off)%560)-40,x=l.x+Math.sin(t*1.1+l.off)*14;c.globalAlpha=.9;c.save();c.translate(x,y);c.rotate(Math.sin(t*2+l.off)*1.1);E(c,0,0,3.2,1.6,l.col);c.restore();}
 for(const f of p.fireflies){const x=(f.cx+Math.sin(t*.4+f.phase)*1.4)*32,y=(f.cy+Math.cos(t*.33+f.phase)*1.1)*32,a=.35+.65*Math.max(0,Math.sin(t*1.7+f.phase));c.globalAlpha=a*.35;E(c,x,y,6,6,'#f6f2a6');c.globalAlpha=a;E(c,x,y,1.6,1.6,'#fffbd0');}
 if(p.snow){c.globalAlpha=.85;for(let i=0;i<26;i++){const x=(noise(i,room.col,8)*500+Math.sin(t*.7+i)*10)%480,y=((t*(18+i%5*4)+noise(i,room.row,9)*600)%620)-120;E(c,x,y,1.4,1.4,'#ffffff');}}
 // A small flock crosses high over the board every so often.
 if(p.birds){const cycle=14,beat=Math.floor(t/cycle),age=t/cycle-beat;if(age<.45&&noise(beat,room.col,11)<.7){const dir=noise(beat,room.row,12)<.5?1:-1,x0=dir>0?-60:540,x=x0+dir*age/.45*600,y=-70+noise(beat,room.col,13)*40;c.globalAlpha=.75;c.strokeStyle='#3a4448';c.lineWidth=1.4;c.lineCap='round';
  for(let i=0;i<4;i++){const bx=x-dir*i*14,by=y+((i%2)?8:0)+i*3,w=Math.sin(t*9+i)*2.5;c.beginPath();c.moveTo(bx-5,by-w);c.quadraticCurveTo(bx-2,by-1,bx,by+1);c.quadraticCurveTo(bx+2,by-1,bx+5,by-w);c.stroke();}}}
 c.restore();
}
