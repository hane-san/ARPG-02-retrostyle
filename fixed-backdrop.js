import {fixedSource} from './fixed-journey-data.js';
import {FIXED_SKIES} from './fixed-sky.js';
// Producer request 2026-11-12, portrait first: the walkable board and its
// objects stand in front, and the place itself lies behind them. Cells of a
// board outside its walkable land become that land's natural surroundings
// (canopy, tall grass, fields, sea, scree, paving) instead of empty sky, and
// beyond the boards a layered panorama of the region fills the portrait sky.
// Everything here is static scenery: no collision, no state.
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const P=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
export const mix=(a,b,t)=>'#'+hex(a).map((v,i)=>Math.round(v+(hex(b)[i]-v)*Math.max(0,Math.min(1,t))).toString(16).padStart(2,'0')).join('');
const noise=(x,y,k=0)=>{const s=Math.sin(x*127.1+y*311.7+k*74.7)*43758.5453;return s-Math.floor(s);};
// The surroundings each land type sits in.
export function surroundingKind(room){
 const land=room.land||'village';
 if(land==='forest')return 'canopy';
 if(land==='shore')return 'sea';
 if(land==='marsh')return 'marsh';
 if(land==='terrace')return 'fields';
 if(land==='ridge')return room.sky==='glacier'||room.sky==='violet'?'snowscree':'scree';
 if(land==='salt')return 'saltflat';
 if(land==='dry')return 'dryrock';
 if(land==='stone')return 'paving';
 if(land==='village')return 'garden';
 return 'grass';
}
const paletteOf=room=>room.sourceIndex===undefined?['#b8c4a6','#ddd6bd','#7fa5ad','#83988a']:fixedSource(room.sourceIndex).palette;
function colours(room,kind){
 const p=paletteOf(room);
 return {
  canopy:['#2f5444','#43705a','#6b9670',mix(p[0],'#2c4a3c',.55)],
  grass:[mix(p[0],'#5f8d58',.5),mix(p[0],'#77a265',.45),mix(p[0],'#a6c58a',.3),'#4d7a4c'],
  garden:[mix(p[0],'#5c8a5b',.45),mix(p[0],'#7aa66e',.4),'#a7c98d','#3e6a4b'],
  fields:[mix(p[0],'#7d9f5c',.5),mix(p[0],'#b9b56d',.45),mix(p[2],'#6fa3b0',.3),'#5f7f4a'],
  sea:[mix(p[2],'#3f7a98',.55),mix(p[2],'#5f99b2',.45),'#e9f1ea',mix(p[2],'#2f5f7d',.6)],
  marsh:[mix(p[2],'#4f8486',.45),mix(p[0],'#7e9e66',.4),'#5f7f4d','#9db37a'],
  scree:[mix(p[3],'#6f706c',.45),mix(p[1],'#9a9b94',.45),mix(p[1],'#d9d6c8',.3),'#5b5f60'],
  snowscree:[mix(p[3],'#76829a',.4),mix(p[1],'#a9b2c2',.4),'#eef1ea','#5d6680'],
  saltflat:[mix(p[1],'#d9d2bf',.5),mix(p[1],'#ebe6d7',.4),'#f7f3e8','#b9ae95'],
  dryrock:[mix(p[3],'#a58f6c',.45),mix(p[1],'#c8b28a',.45),'#e5d4ae','#8c7556'],
  paving:[mix(p[3],'#8e9592',.45),mix(p[1],'#b4b6aa',.45),'#d9d8cb','#6e7673']
 }[kind];
}
const floor=t=>['g','=','s','b','k','h','o','t','w','d'].includes(t);
// One static cell of surroundings, in board pixels (32 per tile).
function cell(c,room,kind,col,x,y){
 const gx=Math.round(room.col)*15+x,gy=Math.round(room.row)*15+y,X=x*32,Y=y*32,n=noise(gx,gy);
 const [d,m,l,a]=col;
 R(c,X,Y,32,32,['grass','garden','paving','saltflat','dryrock'].includes(kind)?mix(m,d,.28):m);
 if(kind==='canopy'){R(c,X,Y,32,32,d);}
 else if(kind==='grass'||kind==='garden'){for(let i=0;i<6;i++){const tx=X+3+noise(gx,gy,i)*26,ty=Y+4+noise(gx,gy,i+9)*24;R(c,tx,ty,1,5,d);R(c,tx+2,ty+1,1,4,a);}if(kind==='garden'&&n<.3)for(let i=0;i<4;i++)R(c,X+5+noise(gx,gy,i+3)*22,Y+5+noise(gx,gy,i+5)*22,2,2,['#f1d3dd','#f4ecb0','#ffffff','#c9b8e8'][i]);}
 else if(kind==='fields'){const band=(gy%3);R(c,X,Y,32,32,band===0?m:band===1?d:mix(m,l,.5));for(let i=0;i<4;i++)R(c,X,Y+4+i*8,32,1,band===1?mix(d,'#3f5a33',.4):mix(m,'#8a8a4c',.35));if(band===2&&n<.5)R(c,X,Y+30,32,2,l);}
 else if(kind==='sea'){R(c,X,Y,32,32,d);for(let i=0;i<2;i++){const wy=Y+8+i*14+noise(gx,gy,i)*4;R(c,X+4+noise(gx,gy,i+2)*10,wy,12+noise(gx,gy,i+4)*8,1,mix(m,'#ffffff',.35));}}
 else if(kind==='marsh'){R(c,X,Y,32,32,d);if(n<.6)for(let i=0;i<5;i++){const rx=X+6+i*4+noise(gx,gy,i)*3;c.strokeStyle=i%2?l:a;c.lineWidth=1.4;c.beginPath();c.moveTo(rx,Y+26);c.lineTo(rx+(i%2?1:-1),Y+12+noise(gx,gy,i+6)*6);c.stroke();}else R(c,X+7,Y+15,14,1,mix(d,'#ffffff',.3));}
 else if(kind==='scree'||kind==='snowscree'){for(let i=0;i<5;i++){const sx=X+3+noise(gx,gy,i)*24,sy=Y+3+noise(gx,gy,i+7)*24;E(c,sx,sy+1,3+noise(gx,gy,i+3)*3,2,d);E(c,sx,sy,2.6+noise(gx,gy,i+3)*2.6,1.7,l);}if(kind==='snowscree'&&n<.55)E(c,X+16,Y+16,12,7,'#eef1eacc');R(c,X+2,Y+20,10,1,d);}
 else if(kind==='saltflat'){c.strokeStyle=a+'99';c.lineWidth=1;c.beginPath();c.moveTo(X,Y+8+n*10);c.lineTo(X+12,Y+14);c.lineTo(X+20,Y+6+n*6);c.lineTo(X+32,Y+12);c.moveTo(X+12,Y+14);c.lineTo(X+15,Y+32);c.stroke();}
 else if(kind==='dryrock'){R(c,X,Y+22,32,10,mix(m,d,.4));R(c,X,Y+21,32,1,l);if(n<.4)E(c,X+10+n*12,Y+13,5,3.5,d);}
 else if(kind==='paving'){R(c,X,Y,32,32,m);R(c,X,Y,32,1,d);R(c,X,Y+16,32,1,d);R(c,X+(gy%2?8:20),Y,1,16,d);R(c,X+(gy%2?22:6),Y+16,1,16,d);if(n<.12){E(c,X+16,Y+24,9,4,'#40474455');R(c,X+10,Y+4,12,20,l);R(c,X+9,Y+2,14,4,d);}}
}
// Canopy crowns overflow their own cells, so they are painted after the
// ground pass of the surroundings and before the walkable land.
function crowns(c,room,col,cells){
 const [d,m,l]=col;cells.sort((a,b)=>a[1]-b[1]);
 for(const [x,y] of cells){const gx=Math.round(room.col)*15+x,gy=Math.round(room.row)*15+y;
  for(let k=0;k<2;k++){const cx=x*32+8+noise(gx,gy,k)*16,cy=y*32+8+noise(gx,gy,k+4)*16,r=13+noise(gx,gy,k+8)*6;E(c,cx+2,cy+4,r,r*.86,'#1f3a2e88');E(c,cx,cy,r,r*.86,d);E(c,cx-2,cy-2,r*.78,r*.66,m);E(c,cx-4,cy-5,r*.38,r*.3,l);}
 }
}
const caches=new Map(),CACHE_LIMIT=14,RES=2;
// A static 15 x 15 surroundings layer per board, cached for the visible few.
export function surroundingsLayer(room){
 const key=room.id;if(caches.has(key)){const v=caches.get(key);caches.delete(key);caches.set(key,v);return v;}
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=480*RES;const c=canvas.getContext('2d');c.scale(RES,RES);
 const kind=surroundingKind(room),col=colours(room,kind),voids=[];
 for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(room.tileAt(x,y)===' '&&!(room.skyline&&y<3&&kind!=='canopy'))voids.push([x,y]);
 for(const [x,y] of voids)cell(c,room,kind,col,x,y);
 // 2026-11-13: where the surroundings meet walkable ground they read as an
 // obstacle — a hedge, a fence, tall grass, a parapet, a rock ridge, surf or
 // reeds — so a blocked cell never looks like more floor.
 const walk=t=>['g','=','s','b','k'].includes(t);
 for(const [x,y] of voids)for(const [dx,dy,side] of [[0,-1,'top'],[0,1,'bottom'],[-1,0,'left'],[1,0,'right']])if(walk(room.tileAt(x+dx,y+dy)))edgePiece(c,kind,col,x,y,side);
 if(kind==='canopy')crowns(c,room,col,voids);
 // Deeper in a meadow or garden's thicket stand a few round trees.
 if(kind==='grass'||kind==='garden'){const inner=voids.filter(([x,y])=>![[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>walk(room.tileAt(x+dx,y+dy)))&&noise(Math.round(room.col)*15+x,Math.round(room.row)*15+y,90)<.22);crowns(c,room,[mix(col[0],'#2f5444',.35),mix(col[1],'#43705a',.3),mix(col[2],'#8fb27a',.3)],inner);}
 caches.set(key,canvas);while(caches.size>CACHE_LIMIT)caches.delete(caches.keys().next().value);
 return canvas;
}
export function drawSurroundings(c,room){const layer=surroundingsLayer(room);if(layer)c.drawImage(layer,0,0,480,480);}
// Whether the old floating-island cliff faces still belong under the land.
export function keepsCliffFaces(room){return room.land==='ridge'||!!room.skyline;}
// The region beyond the boards, from far to near, in front of the sky.
export function drawPanorama(c,room,w,h,l,time,distant=null){
 const s=l.scale,top=l.y-128*s,horizon=Math.max(24*s,top*.58),kind=surroundingKind(room),col=colours(room,kind),sky=FIXED_SKIES[room.sky],haze=sky?sky.colors[3]:'#e6e3d0',far=mix(col[1],haze,.62),mid=mix(col[0],haze,.38),near=mix(col[0],haze,.12);
 const bearing=(room.col||0)*.37+(room.row||0)*.11,ridge=(i,amp,freq,phase)=>{const t=i*freq+bearing+phase;return horizon-amp*s*(.5+.3*Math.sin(t)+.16*Math.sin(t*2.3+phase*1.7)+.09*Math.sin(t*5.1+phase*2.9)+.06*Math.cos(t*.43+phase));};
 // Each band is lit from above and settles into its own colour lower down,
 // so the layers read as land in air rather than as flat stripes.
 const band=(base,amp,freq,phase,fill)=>{const pts=[[0,h]];let peak=h;for(let i=0;i<=64;i++){const y=base+(ridge(i*.75,amp,freq,phase)-horizon);peak=Math.min(peak,y);pts.push([i*w/64,y]);}pts.push([w,h]);const g=c.createLinearGradient(0,peak,0,peak+Math.max(30*s,amp*1.6*s));g.addColorStop(0,mix(fill,haze,.28));g.addColorStop(1,fill);P(c,pts,g);};
 // Far: mountains, a sea line or a long low rise, depending on the land.
 if(kind==='sea'||kind==='marsh'){{const g=c.createLinearGradient(0,horizon,0,top);g.addColorStop(0,mix(far,haze,.35));g.addColorStop(1,far);R(c,0,horizon,w,h-horizon,g);}for(let i=0;i<9;i++)R(c,((i*97+time/1300)%(w+80))-40,horizon+(6+i*9)*s,w*.18,1,mix(far,'#ffffff',.45));band(horizon+4*s,10,.21,1.3,mix(far,haze,.25));}
 else if(kind==='scree'||kind==='snowscree'){band(horizon,64,.33,.4,far);const pts=[];for(let i=0;i<=48;i++)pts.push([i*w/48,ridge(i,64,.33,.4)]);c.save();c.strokeStyle=kind==='snowscree'?'#f3f4ebcc':mix(far,'#ffffff',.4);c.lineWidth=1.6*s;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();}
 else band(horizon,kind==='canopy'?26:18,.24,.8,far);
 // Mid: the land's own texture at a distance. Distant houses, colonnades
 // and mesas stand behind its crest, so their feet are hidden by the land
 // in front instead of floating in the air (2026-11-13).
 const midBase=horizon+(top-horizon)*.42,feet=midBase+12*s,far2=t=>mix(t,haze,.5);
 if(kind==='garden'||room.sourceIndex===undefined)for(let i=0;i<6;i++){const x=(i+.4)*w/6+Math.sin(i*2+bearing)*10*s,u=(7+Math.sin(i*1.7)*1.5)*s,y=feet-2*s;R(c,x-u,y-u*1.3,u*2,u*1.3,far2('#e9e0cc'));P(c,[[x-u*1.25,y-u*1.3],[x,y-u*2.25],[x+u*1.25,y-u*1.3]],far2('#7c97a3'));}
 if(kind==='paving')for(let i=-3;i<=4;i++){const x=w*.5+i*28*s,y=feet;R(c,x,y-30*s,11*s,30*s,far2('#c1c5bb'));R(c,x-2*s,y-34*s,15*s,4*s,far2('#dadbd0'));R(c,x+8*s,y-30*s,3*s,30*s,far2('#9fa8a3'));}
 if(kind==='saltflat'||kind==='dryrock')for(let i=0;i<4;i++){const x=(i+.5)*w/4+Math.sin(i*2.1+bearing)*20*s,u=(12+i%2*8)*s;P(c,[[x-u*1.6,feet],[x-u,feet-u-8*s],[x+u,feet-u*.9-8*s],[x+u*1.5,feet]],far2(kind==='dryrock'?'#b48e6e':'#d8cdb7'));}
 if(distant)distant(c,feet,far2);
 band(midBase,kind==='scree'||kind==='snowscree'?34:14,.29,2.1,mid);
 if(kind==='canopy')for(let i=0;i<26;i++){const x=(i+.5)*w/26+Math.sin(i*1.7+bearing)*6*s,y=midBase+(4+Math.sin(i*2.3)*5)*s,r=(9+Math.sin(i*3.1)*3)*s;E(c,x,y,r,r*.85,mix('#3f6b52',haze,.35));E(c,x-2*s,y-2*s,r*.55,r*.45,mix('#6d9a72',haze,.35));}
 if(kind==='fields'||kind==='grass'||kind==='garden')for(let i=0;i<34;i++){const x=(i+.5)*w/34+Math.sin(i*2.9+bearing)*5*s,y=midBase+(12+Math.sin(i*1.9)*4)*s,r=(3.2+Math.sin(i*4.1)*1.2)*s;E(c,x,y,r*1.4,r,mix('#557c56',haze,.42));}
 // Near: the surroundings colour itself, meeting the neighbouring boards.
 band(top+2*s,9,.31,3.3,near);
 R(c,0,top+16*s,w,h,near);
 // The nearest land is not a flat colour: the board's own surroundings
 // continue under every neighbour and out to the screen's edges, rising out
 // of the near band in a soft fade.
 const tex=nearTexture(room,kind,col);
 if(tex&&c.createPattern){const pattern=c.createPattern(tex,'repeat');if(pattern){if(pattern.setTransform&&typeof DOMMatrix!=='undefined')pattern.setTransform(new DOMMatrix().translate(l.x,l.y).scale(s));c.save();const from=Math.min(top+6*s,midBase+22*s);c.fillStyle=pattern;c.globalAlpha=.92;c.beginPath();c.rect(0,from,w,h);c.fill();c.restore();
 // Soften the fade with a haze that matches the band above it.
 const veil=c.createLinearGradient(0,from,0,from+64*s);veil.addColorStop(0,near);veil.addColorStop(.35,near+'aa');veil.addColorStop(1,near+'00');R(c,0,from,w,64*s,veil);}}
}
// A repeating 8 x 8 cell tile of a board's surroundings for the near land.
const textures=new Map();
function nearTexture(room,kind,col){
 if(typeof document==='undefined')return null;
 const key=kind+':'+col.join();if(textures.has(key))return textures.get(key);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d'),proxy={col:7+(room.sourceIndex??3),row:11};
 const cells=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++){cell(c,proxy,kind,col,x,y);cells.push([x,y]);}
 if(kind==='canopy'){c.save();c.beginPath();c.rect(0,0,256,256);c.clip();crowns(c,proxy,col,cells);for(const [dx,dy] of [[-256,0],[256,0],[0,-256],[0,256]]){c.save();c.translate(dx,dy);crowns(c,proxy,col,cells.map(a=>[...a]));c.restore();}c.restore();}
 textures.set(key,canvas);while(textures.size>16)textures.delete(textures.keys().next().value);return canvas;
}
// One obstacle edge on the side of a surroundings cell facing walkable ground.
function edgePiece(c,kind,col,x,y,side){
 const X=x*32,Y=y*32,n=i=>noise(x,y,i+30),[d,m,l,a]=col;
 const along=(fn)=>{for(let i=0;i<4;i++){const t=4+i*8+n(i)*3;const px=side==='left'?X+5:side==='right'?X+27:X+t,py=side==='top'?Y+5:side==='bottom'?Y+27:Y+t;fn(px,py,i);}};
 const strip=(depth,fill)=>{if(side==='top')R(c,X,Y,32,depth,fill);if(side==='bottom')R(c,X,Y+32-depth,32,depth,fill);if(side==='left')R(c,X,Y,depth,32,fill);if(side==='right')R(c,X+32-depth,Y,depth,32,fill);};
 if(kind==='sea'){c.save();c.globalAlpha=.75;strip(3,col[2]);c.restore();along((px,py)=>E(c,px,py,3,1.6,'#ffffffaa'));return;}
 if(kind==='canopy')return;
 if(kind==='marsh'){along((px,py,i)=>{c.strokeStyle=i%2?'#6f8f55':'#557a46';c.lineWidth=1.5;c.beginPath();c.moveTo(px,py+5);c.lineTo(px+(i%2?1:-1),py-7);c.stroke();});return;}
 if(kind==='garden'||kind==='grass')return; // a wall of bushes is drawn over the ground instead (bushWall)
 if(kind==='fields'){
  const horizontal=side==='top'||side==='bottom',o=side==='top'?6:side==='bottom'?26:side==='left'?6:26;
  c.fillStyle='#8a6b4a';if(horizontal){R(c,X,Y+o-3,32,2,'#a0825c');R(c,X,Y+o+1,32,2,'#8a6b4a');for(const px of [X+4,X+20])R(c,px,Y+o-6,3,11,'#7a5a3c');}
  else{R(c,X+o-3,Y,2,32,'#a0825c');R(c,X+o+1,Y,2,32,'#8a6b4a');for(const py of [Y+4,Y+20])R(c,X+o-5,py,11,3,'#7a5a3c');}return;
 }
 if(kind==='paving'){
  // A low parapet with a lit top and a cast shadow on the far side.
  const depth=9;strip(depth+3,'#3f4a4a40');strip(depth,mix(m,'#ffffff',.12));
  c.fillStyle=mix(d,'#000000',.1);if(side==='top'||side==='bottom'){const yy=side==='top'?Y+depth-1:Y+32-depth;R(c,X,yy,32,1,mix(d,'#000000',.2));for(const px of [X+10,X+26])R(c,px,side==='top'?Y:Y+32-depth,1,depth,mix(d,'#000000',.15));}
  else{const xx=side==='left'?X+depth-1:X+32-depth;R(c,xx,Y,1,32,mix(d,'#000000',.2));for(const py of [Y+10,Y+26])R(c,side==='left'?X:X+32-depth,py,depth,1,mix(d,'#000000',.15));}return;
 }
 // Salt, dry rock, scree and snow: a ridge of weathered stones.
 along((px,py,i)=>{const r=3.6+n(i+5)*2;E(c,px+1,py+2,r+1,r*.7,'#2a333355');E(c,px,py,r,r*.75,mix(d,a,.3));E(c,px-1,py-1,r*.5,r*.35,mix(l,'#ffffff',.2));});
}

// 2026-11-13 (producer: "as natural as Zelda"): the walkable ground belongs to
// the same land as its surroundings. Instead of pale squares, open ground is a
// lawn, forest floor, sand, gravel, snow, salt or flagstones of the land's own
// colours, with soft patches that ignore the cell grid; roads are one
// continuous path with rounded corners and a darker worn edge. Stairs, bridges,
// water, building feet and channels keep their own art. Static and cached.
const GROUND={
 grass:(p,c)=>({base:mix(c[2],c[1],.3),patch:mix(c[1],c[0],.25),fleck:c[0],path:mix(p[1],'#d6bf8e',.55)}),
 garden:(p,c)=>({base:mix(c[2],c[1],.25),patch:mix(c[1],c[0],.2),fleck:c[3],path:mix(p[1],'#e3d3aa',.5),flowers:true}),
 fields:(p,c)=>({base:mix(c[1],'#a9c58a',.45),patch:mix(c[0],c[1],.5),fleck:c[3],path:mix(p[1],'#d2b98a',.55)}),
 canopy:(p,c)=>({base:mix(c[2],'#8aa06a',.5),patch:mix(c[1],'#5f7f4f',.35),fleck:'#b49a6a',path:mix(p[1],'#c9b386',.6),leaves:true}),
 marsh:(p,c)=>({base:mix(c[1],'#9cb889',.45),patch:mix(c[0],c[1],.5),fleck:c[2],path:mix(p[1],'#cdbd94',.55)}),
 sea:(p)=>({base:mix(p[1],'#ebdfbf',.55),patch:mix(p[1],'#d9c9a2',.5),fleck:'#bba98a',path:mix(p[1],'#dccb9f',.6),sand:true}),
 saltflat:(p,c)=>({base:mix(c[2],'#f2eee2',.35),patch:mix(c[1],'#e2dccb',.4),fleck:c[3],path:mix(c[1],'#e3d8bd',.35),cracks:true}),
 dryrock:(p,c)=>({base:mix(c[2],c[1],.45),patch:mix(c[1],c[0],.3),fleck:c[3],path:mix(c[2],'#efdfba',.5),pebbles:true}),
 scree:(p,c)=>({base:mix(c[2],c[1],.5),patch:mix(c[1],c[0],.3),fleck:c[3],path:mix(c[2],'#dcd8c8',.5),pebbles:true}),
 snowscree:(p,c)=>({base:'#e7ecee',patch:'#d3dce6',fleck:c[3],path:mix(c[1],'#cfd6de',.5),snow:true}),
 paving:(p,c)=>({base:mix(c[2],c[1],.35),patch:mix(c[1],c[0],.2),fleck:c[3],path:mix(c[2],'#e6dfcb',.4),slabs:true})
};
const NATURAL=new Set(['g','t','o']),PATHS=new Set(['=']),JOINS=new Set(['=','s','b']);
const groundCaches=new Map();
export function groundStyle(room){const kind=surroundingKind(room);return GROUND[kind](paletteOf(room),colours(room,kind));}
export function groundLayer(room,light=null){
 const key=room.id;if(groundCaches.has(key)){const v=groundCaches.get(key);groundCaches.delete(key);groundCaches.set(key,v);return v;}
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=480*RES;const c=canvas.getContext('2d');c.scale(RES,RES);
 const kind=surroundingKind(room),g=groundStyle(room),at=(x,y)=>room.tileAt(x,y);
 const open=(x,y)=>NATURAL.has(at(x,y))||PATHS.has(at(x,y));
 // The land's outline: a corner of open ground rounds off where both of its
 // neighbours on that corner are water or blocked land, so coasts and edges
 // curve instead of stepping (2026-11-14).
 const soft=(x,y)=>{if(x<0||y<0||x>14||y>14)return false;const t=at(x,y);return t===' '||t==='w'||t==='r';};
 const region=new Path2D(),water=new Path2D(),wet=new Path2D();let any=false,anyWater=false;
 for(let y=0;y<15;y++)for(let x=0;x<15;x++){
  if(open(x,y)){const r=12,L=soft(x-1,y),Rr=soft(x+1,y),U=soft(x,y-1),D=soft(x,y+1),radii=[L&&U&&soft(x-1,y-1)?r:0,Rr&&U&&soft(x+1,y-1)?r:0,Rr&&D&&soft(x+1,y+1)?r:0,L&&D&&soft(x-1,y+1)?r:0];
   if(region.roundRect&&radii.some(Boolean))region.roundRect(x*32,y*32,32,32,radii);else region.rect(x*32,y*32,32,32);any=true;}
  const t=at(x,y);if(t==='w'||t==='k'||(t===' '&&(kind==='sea'||kind==='marsh'))){water.rect(x*32,y*32,32,32);wet.rect(x*32-5,y*32-5,42,42);anyWater=true;}
 }
 // Water inside the board shares the sea's (or the river's) colour, with a
 // lighter shallow band and ripples, instead of pale tiles of its own.
 const pal=paletteOf(room),deep=kind==='sea'?colours(room,'sea')[0]:mix(pal[2],'#5f9db4',.5),shallow=mix(deep,'#d9eee6',.38);
 if(anyWater){c.save();c.clip(water);
  for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(['w','k'].includes(at(x,y)))R(c,x*32,y*32,32,32,deep);
  if(any){c.strokeStyle=shallow;c.globalAlpha=.55;c.lineWidth=18;c.stroke(region);c.globalAlpha=1;}
  for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(at(x,y)==='w'){const gx=Math.round(room.col)*15+x,gy=Math.round(room.row)*15+y;for(let i=0;i<2;i++){const wy=y*32+9+i*13+noise(gx,gy,i+90)*5;R(c,x*32+4+noise(gx,gy,i+92)*12,wy,9+noise(gx,gy,i+94)*9,1,mix(shallow,'#ffffff',.4)+'aa');}}
  c.restore();}
 if(!any){groundCaches.set(key,canvas);return canvas;}
 c.save();c.clip(region);
 R(c,0,0,480,480,g.base);
 const gx0=Math.round(room.col)*15,gy0=Math.round(room.row)*15;
 // Soft patches that run across cell edges, so no grid shows.
 for(let y=-1;y<16;y++)for(let x=-1;x<16;x++){const gx=gx0+x,gy=gy0+y,n=noise(gx,gy,40);if(n>.42)continue;c.save();c.globalAlpha=.28+n*.4;E(c,x*32+noise(gx,gy,41)*32,y*32+noise(gx,gy,42)*32,14+noise(gx,gy,43)*16,9+noise(gx,gy,44)*10,g.patch);c.restore();}
 for(let y=0;y<15;y++)for(let x=0;x<15;x++){
  if(!NATURAL.has(at(x,y)))continue;const gx=gx0+x,gy=gy0+y,X=x*32,Y=y*32,f=i=>noise(gx,gy,i+50);
  if(g.slabs){c.strokeStyle=mix(g.base,g.fleck,.35);c.lineWidth=1;c.beginPath();const sy=Y+10+f(1)*12,sx=X+8+f(2)*16;c.moveTo(X,sy);c.lineTo(X+32,sy+f(3)*3-1.5);c.moveTo(sx,Y);c.lineTo(sx+f(4)*2-1,sy);c.moveTo(X+4+f(5)*24,sy);c.lineTo(X+4+f(5)*24,Y+32);c.stroke();continue;}
  if(g.sand){for(let i=0;i<3;i++)R(c,X+3+f(i)*26,Y+3+f(i+3)*26,1.5,1.5,g.fleck+'99');if(f(9)<.25){c.strokeStyle=g.patch;c.lineWidth=1;c.beginPath();c.moveTo(X+4,Y+18+f(8)*6);c.quadraticCurveTo(X+16,Y+14+f(7)*6,X+28,Y+19+f(6)*5);c.stroke();}continue;}
  if(g.cracks){if(f(1)<.55){c.strokeStyle=g.fleck+'55';c.lineWidth=1;c.beginPath();c.moveTo(X+f(2)*10,Y+6+f(3)*20);c.lineTo(X+12+f(4)*8,Y+10+f(5)*12);c.lineTo(X+30,Y+4+f(6)*24);c.stroke();}continue;}
  if(g.pebbles){for(let i=0;i<3;i++){const px=X+4+f(i)*24,py=Y+4+f(i+4)*24,r=1.2+f(i+8)*1.8;E(c,px,py+.8,r+.5,r*.7,g.fleck+'55');E(c,px,py,r,r*.75,mix(g.base,'#ffffff',.3));}continue;}
  if(g.snow){if(f(1)<.45){c.save();c.globalAlpha=.5;E(c,X+16,Y+20,13,4,g.patch);c.restore();}continue;}
  // Lawns and forest floors: small tufts, now and then a flower or a fallen leaf.
  for(let i=0;i<4;i++){const tx=X+3+f(i)*26,ty=Y+5+f(i+4)*22;c.strokeStyle=g.fleck+'80';c.lineWidth=1;c.beginPath();c.moveTo(tx-2,ty-3);c.lineTo(tx,ty+1);c.lineTo(tx+2,ty-3);c.stroke();}
  if(g.flowers&&f(10)<.22)for(let i=0;i<3;i++)R(c,X+6+f(i+11)*20,Y+6+f(i+14)*20,2,2,['#f4dbe2','#f6eeb6','#ffffff'][i]);
  if(g.leaves&&f(10)<.45)for(let i=0;i<3;i++)E(c,X+5+f(i+11)*22,Y+5+f(i+14)*22,2,1.2,['#c7a46a','#a9894f','#d7b97c'][i]);
 }
 // Roads: one continuous path. A corner rounds where neither neighbour on
 // that corner continues the road (stairs and bridges continue it; so does the
 // board edge, where the road runs on into the next screen).
 const joins=(x,y,ox,oy)=>{const nx=x+ox,ny=y+oy;if(nx<0||ny<0||nx>14||ny>14)return true;return JOINS.has(at(nx,ny));};
 const shapes=[];for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(PATHS.has(at(x,y))){const r=11,L=joins(x,y,-1,0),Rr=joins(x,y,1,0),U=joins(x,y,0,-1),D=joins(x,y,0,1);shapes.push({x,y,radii:[!L&&!U?r:0,!Rr&&!U?r:0,!Rr&&!D?r:0,!L&&!D?r:0]});}
 const shape=(s,grow)=>{c.beginPath();if(c.roundRect)c.roundRect(s.x*32-grow,s.y*32-grow,32+grow*2,32+grow*2,s.radii.map(v=>v?v+grow:0));else c.rect(s.x*32-grow,s.y*32-grow,32+grow*2,32+grow*2);c.fill();};
 c.fillStyle=mix(g.path,'#5d5038',.28);for(const s of shapes)shape(s,1.6);
 c.fillStyle=g.path;for(const s of shapes)shape(s,0);
 for(const s of shapes){const gx=gx0+s.x,gy=gy0+s.y,f=i=>noise(gx,gy,i+70);for(let i=0;i<3;i++){const px=s.x*32+5+f(i)*22,py=s.y*32+5+f(i+3)*22;E(c,px,py,1.6+f(i+6),1,mix(g.path,'#6b5a3c',.3));E(c,px-.5,py-.5,1,.6,mix(g.path,'#ffffff',.35));}}
 if(light?.light){c.globalAlpha=light.strength*.8;R(c,0,0,480,480,light.light);}
 // Wet ground along the water's edge.
 if(anyWater){c.save();c.clip(wet);c.globalAlpha=1;c.strokeStyle=kind==='sea'||g.sand?'rgba(120,98,64,.22)':'rgba(40,70,60,.18)';c.lineWidth=9;c.stroke(region);c.restore();}
 c.restore();
 // Foam: a bright line just off the shore, broken now and then.
 if(anyWater&&any){c.save();c.clip(water);c.setLineDash([22,5,9,6]);c.lineCap='round';c.strokeStyle='rgba(255,255,255,.62)';c.lineWidth=3.2;c.stroke(region);c.setLineDash([]);c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=9;c.stroke(region);c.restore();}
 bushWall(c,room,kind);
 groundCaches.set(key,canvas);while(groundCaches.size>CACHE_LIMIT)groundCaches.delete(groundCaches.keys().next().value);
 return canvas;
}
// The thicket's edge: round bushes (meadow, garden) or tree crowns (forest)
// in the blocked cells beside open ground, painted after the ground so they
// may lean a little over it. The staircase of cells reads as a living edge.
function bushWall(c,room,kind){
 if(!['grass','garden','canopy'].includes(kind))return;
 const col=colours(room,kind),walkable=t=>['g','=','s','b','k'].includes(t),edge=[];
 for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(room.tileAt(x,y)===' '&&!(room.skyline&&y<3&&kind!=='canopy')&&[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>walkable(room.tileAt(x+dx,y+dy))))edge.push([x,y]);
 if(kind==='canopy'){crowns(c,room,col,edge);return;}
 const [d,m,l]=kind==='garden'?['#365f45','#4f7f57','#86b07a']:[mix(col[0],'#335a3c',.4),mix(col[1],'#4c7d4a',.35),mix(col[2],'#93ba79',.3)];
 edge.sort((a,b)=>a[1]-b[1]);
 for(const [x,y] of edge){const gx=Math.round(room.col)*15+x,gy=Math.round(room.row)*15+y;
  for(let k=0;k<3;k++){const bx=x*32+5+k*11+noise(gx,gy,k+60)*3,by=y*32+11+noise(gx,gy,k+63)*10,r=9.5+noise(gx,gy,k+66)*3;
   E(c,bx+1.5,by+3,r+1,r*.8,'#1f332888');E(c,bx,by,r,r*.86,d);E(c,bx-1,by-1.5,r*.8,r*.66,m);E(c,bx-2.5,by-3.5,r*.36,r*.28,l);
   if(kind==='garden'&&noise(gx,gy,k+69)<.18)for(let i=0;i<3;i++)E(c,bx-3+i*3,by-2+(i%2)*3,1.3,1.3,['#f4dbe2','#ffffff','#f6eeb6'][i]);}
 }
}
// Cliff faces where the land really drops: weathered rock with a lit lip, a
// darker foot and a ragged lower edge, instead of flat grey blocks.
export function drawCliffFace(c,room,x,y){
 const col=colours(room,room.sky==='glacier'||room.sky==='violet'?'snowscree':'scree'),gx=Math.round(room.col)*15+x,gy=Math.round(room.row)*15+y,X=x*32,Y=y*32+28,f=i=>noise(gx,gy,i+80);
 const face=c.createLinearGradient(0,Y,0,Y+42);face.addColorStop(0,mix(col[1],col[0],.25));face.addColorStop(1,mix(col[0],'#2f3a3c',.35));
 // Where the ground above rounds its corner, the face turns the same corner.
 const soft=(a,b)=>{if(a<0||b<0||a>14||b>14)return false;const t=room.tileAt(a,b);return t===' '||t==='w'||t==='r';};
 const rl=soft(x-1,y)&&soft(x-1,y+1)?9:0,rr=soft(x+1,y)&&soft(x+1,y+1)?9:0;
 c.fillStyle=face;c.beginPath();c.moveTo(X+rl,Y-(rl?4:0));c.lineTo(X+32-rr,Y-(rr?4:0));if(rr)c.quadraticCurveTo(X+32,Y,X+31,Y+12);c.lineTo(X+32-rr*.4,Y+36+f(1)*5);c.lineTo(X+22,Y+40+f(2)*4);c.lineTo(X+11,Y+35+f(3)*6);c.lineTo(X+rl*.4,Y+38+f(4)*4);if(rl){c.lineTo(X+1,Y+12);c.quadraticCurveTo(X,Y,X+rl,Y-4);}c.closePath();c.fill();
 c.strokeStyle=mix(col[0],'#2a3335',.4);c.lineWidth=1;c.beginPath();for(const t of [7+f(5)*5,18+f(6)*6,27+f(7)*3]){c.moveTo(X+t,Y+5+f(8)*4);c.lineTo(X+t+f(9)*3-1.5,Y+30+f(10)*6);}c.stroke();
 R(c,X+rl,Y,32-rl-rr,3,mix(col[2],'#ffffff',.25));R(c,X+rl*.5,Y+3,32-(rl+rr)*.5,2,mix(col[1],col[0],.5));
 for(let i=0;i<2;i++)E(c,X+6+f(11+i)*20,Y+12+f(13+i)*14,2.4,1.4,mix(col[2],'#ffffff',.15));
}
export function drawGround(c,room,light){const layer=groundLayer(room,light);if(layer)c.drawImage(layer,0,0,480,480);}
