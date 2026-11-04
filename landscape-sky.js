import {landscapeHash as hash} from './landscape-geometry.js';
import {westSkyRows,westSkyFringe} from './western-world.js';

const DAY=['#287fb8','#65b5d4','#a5d8df','#e3e6ce','#f4d6a6'];
const DUSK=['#353c79','#74699f','#bd92af','#f3b99d','#f7dcaf'];
const profiles={
 ridge:{day:['#4b92be','#82c5da','#b4dfe2','#e0ede1','#f0e9d4'],ridge:108,cloud:'#f8f5e6',shade:'#abc9d7'},
 cliff:{day:DAY,dusk:DUSK,ridge:320,cloud:'#fff3d9',shade:'#a4bdcb',snow:'#f5f5e7'},
 village:{day:['#5b97c5','#93c5da','#c9dce2','#eee4d1','#f5d9b5'],ridge:170,cloud:'#fff1da',shade:'#afbdce'},
 windmill:{day:['#42477f','#81749d','#cfa0ad','#f2c397','#f9dfac'],ridge:175,cloud:'#ffe2b7',shade:'#a78d9e',sun:'#ffecb8'},
 terrace:{day:['#438bb9','#7bc0d1','#b7dedc','#e1e7ca','#f1dbad'],ridge:95,cloud:'#fff3dc',shade:'#a8c6c5'},
 azure:{day:['#398ebd','#7ec3db','#b8e0e3','#dcebe3','#ecedda'],ridge:82,cloud:'#f4f4e5',shade:'#aacbd3'},
 lane:{day:['#5e9dbf','#9bcad5','#d4e0d8','#eee1c6','#f4d9b2'],ridge:94,cloud:'#fff0d4',shade:'#b6c7c4'},
 grass:{day:['#3c96c4','#84cadb','#c6e7e2','#e4e9cc','#f0ddac'],ridge:115,cloud:'#fff4d7',shade:'#a2c5cb'}
};
export const CORE_SKY_STUDIES=[{key:'ridge',index:4,cx:186,cy:87,x:155,y:47,w:66,h:35,skyRect:true}];
export const blendSky=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
export function skyPalette(key,phase=0){
 const p=profiles[key]||profiles.azure,t=key==='cliff'?Math.max(0,Math.min(1,phase)):0;
 return p.day.map((a,i)=>blendSky(a,(p.dusk||p.day)[i],t));
}
export function skyWorldWindow(z){
 if(z.skyRect)return {x:z.x*32,y:z.y*32,w:(z.w+1)*32,h:(z.h+1)*32};
 const rows=westSkyRows(z);if(!rows)return null;
 // Terrain uses inclusive bounds. The last sky column must not be left dark.
 return {x:z.x*32,y:(z.y-(z.key==='cliff'?0:8))*32,w:(z.w+1)*32,h:(z.key==='cliff'?55:rows+8+westSkyFringe(z))*32};
}
const snow=[.28,.42,.35,.82,.48,.6,.4,.92,.56,.67,.9,.52,.36,.58,.85,.55,.62,.4,.88,.5,.3];
const geometries=new Map();
export function skyGeometry(z){
 if(geometries.has(z.key))return geometries.get(z.key);
 const box=skyWorldWindow(z),p=profiles[z.key];if(!box||!p)return null;
 const horizon=box.y+box.h-(z.key==='cliff'?80:0),depth=z.key==='cliff'?850:z.key==='azure'?420:z.key==='windmill'?700:520,ridges=[];
 for(let layer=0;layer<3;layer++){
  const points=[];
  for(let i=0;i<=120;i++){
   const u=i/120*20,j=Math.min(19,Math.floor(u)),crest=snow[j]*(1-(u-j))+snow[j+1]*(u-j);
   const roll=.32+.19*Math.sin(i*.052+z.index*.8+layer)+.18*Math.cos(i*.103+layer*.7)+.065*Math.sin(i*.31+z.index);
   const height=z.key==='cliff'&&layer===0?crest+.016*Math.sin(i*.91):Math.max(.12,roll);
   points.push([box.x+i*box.w/120,horizon-height*p.ridge*(1-layer*.21)+layer*21]);
  }
  ridges.push(points);
 }
 const clouds=[];
 for(let layer=0;layer<3;layer++)for(let i=0;i<Math.ceil(box.w/350);i++){
  const q=hash(i+z.index*17,layer+72),wide=(layer===0?240:180)+q*220;
  clouds.push({x:box.x+(i+.15+hash(layer,i)*.6)*350,y:horizon-depth*(.9-layer*.27-q*.1),w:wide,h:layer===0?12+q*17:28+q*28,layer,seed:q});
 }
 const result={box,horizon,depth,ridges,clouds};geometries.set(z.key,result);return result;
}
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const polygon=(c,points,col)=>{c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function cloudPath(c,x,y,w,h,seed){
 c.beginPath();c.moveTo(x,y+h*.7);
 c.bezierCurveTo(x-w*.02,y+h*.33,x+w*.12,y+h*.27,x+w*.2,y+h*.38);
 c.bezierCurveTo(x+w*.18,y-h*.12,x+w*.39,y-h*(.22+seed*.3),x+w*.48,y+h*.21);
 c.bezierCurveTo(x+w*.58,y-h*.04,x+w*.72,y+h*.08,x+w*.75,y+h*.36);
 c.bezierCurveTo(x+w*.9,y+h*.26,x+w*1.02,y+h*.51,x+w,y+h*.7);
 c.bezierCurveTo(x+w*.78,y+h*1.04,x+w*.2,y+h*.96,x,y+h*.7);c.closePath();
}
export function drawLandscapeSky(c,z,camera,screen,phase=0,time=0){
 const g=skyGeometry(z);if(!g)return false;
 const {box:b,horizon,depth,ridges,clouds}=g,p=profiles[z.key],colors=skyPalette(z.key,phase);
 const left=camera.x-screen.w/(2*camera.zoom),right=camera.x+screen.w/(2*camera.zoom),top=camera.y-screen.h/(2*camera.zoom),bottom=camera.y+screen.h/(2*camera.zoom);
 if(b.x+b.w<left||b.x>right||b.y+b.h<top||b.y>bottom)return false;
 const dusk=z.key==='cliff'?phase:z.key==='windmill'?.9:0;
 c.save();c.beginPath();c.rect(b.x,b.y,b.w,b.h);c.clip();
 const wash=c.createLinearGradient(0,horizon-depth,0,horizon);[0,.29,.61,.84,1].forEach((stop,i)=>wash.addColorStop(stop,colors[i]));rect(c,b.x,b.y,b.w,b.h,wash);
 // World-anchored light, never attached to the HUD or stretched on rotation.
 const sunX=(z.cx+3)*32,sunY=horizon-(z.key==='cliff'?420:z.key==='windmill'?160:b.h*.34),radius=z.key==='windmill'?23:17;
 if(sunX+230>=left&&sunX-230<=right&&sunY+230>=top&&sunY-230<=bottom){
  const glow=c.createRadialGradient(sunX,sunY,radius*.3,sunX,sunY,230);glow.addColorStop(0,(p.sun||'#fff7de')+'88');glow.addColorStop(.3,colors[3]+'33');glow.addColorStop(1,colors[3]+'00');rect(c,sunX-230,sunY-230,460,460,glow);
  c.fillStyle=(p.sun||'#fff9e8')+'cc';c.beginPath();c.arc(sunX,sunY,radius,0,Math.PI*2);c.fill();
 }
 for(const cloud of clouds){
  const x=cloud.x+Math.sin(time/95000+cloud.seed*7)*9,y=cloud.y,w=cloud.w,h=cloud.h;
  if(x+w<left||x>right||y+h<top||y-h>bottom)continue;
  c.save();c.globalAlpha=cloud.layer===0?.34:cloud.layer===1?.67:.78;
  const light=blendSky(p.cloud,'#ffd5ae',dusk*.48),shade=blendSky(p.shade,'#9c82a6',dusk*.58);
  const volume=c.createLinearGradient(0,y-h*.2,0,y+h);volume.addColorStop(0,light);volume.addColorStop(.36,blendSky(light,colors[2],.12));volume.addColorStop(1,shade);
  cloudPath(c,x,y,w,h,cloud.seed);c.fillStyle=volume;c.fill();c.clip();
  // Uneven reflected light and a low shelf give each bank thickness.
  polygon(c,[[x,y+h*.76],[x+w*.23,y+h*.52],[x+w*.54,y+h*.74],[x+w*.77,y+h*.57],[x+w,y+h*.78],[x+w,y+h],[x,y+h]],shade+'44');
  c.strokeStyle=light+'aa';c.lineWidth=2;c.beginPath();c.moveTo(x+w*.19,y+h*.3);c.bezierCurveTo(x+w*.3,y-h*.14,x+w*.38,y-h*.16,x+w*.47,y+h*.17);c.stroke();c.restore();
 }
 const ridgeColors=[blendSky('#a6c9d5','#b4a1bb',dusk),blendSky('#8cb4c4','#9790ae',dusk),blendSky('#709aa8','#777f99',dusk)];
 for(const [layer,crest] of ridges.entries()){
  polygon(c,[[b.x,b.y+b.h+10],...crest,[b.x+b.w,b.y+b.h+10]],ridgeColors[layer]);
  if(z.key==='cliff'&&layer===0){
   const snowLine=crest.map(([x,y],i)=>[x,y+Math.max(0,(horizon-p.ridge*.39-y)*.42)*(1+.19*Math.sin(i*.87))]);
   polygon(c,[...crest,...snowLine.slice().reverse()],blendSky(p.snow,'#f2ceb9',dusk));
   for(let i=4;i<crest.length-4;i+=5){const [x,y]=crest[i],depth=snowLine[i][1]-y;if(depth<9)continue;polygon(c,[[x,y],[x+3,y+depth*.88],[x-5,y+depth*.36]],blendSky('#c5dce0','#dcc7d2',dusk));}
  }
  // Air between ridges softens their bases, not their distinctive silhouettes.
  const mist=c.createLinearGradient(0,horizon-45,0,b.y+b.h);mist.addColorStop(0,colors[3]+'00');mist.addColorStop(1,colors[3]+(layer===2?'22':'33'));rect(c,b.x,horizon-45,b.w,b.y+b.h-horizon+45,mist);
 }
 if(dusk>.84)for(let i=0;i<18;i++){
  const x=b.x+hash(i,z.index)*b.w,y=b.y+hash(z.index,i)*b.h*.38;
  if(x<left||x>right||y<top||y>bottom)continue;
  c.globalAlpha=(dusk-.84)*2;rect(c,x,y,2,2,'#fff1cf');
 }
 c.restore();return true;
}
