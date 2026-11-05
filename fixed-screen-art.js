import {WEST_STUDIES} from './western-world.js';
import {drawWesternTile,drawWesternSite} from './western-art.js';
import {drawLandscapeSky,skyGeometry} from './landscape-sky.js';
import {drawLandscapeFeet,drawLandscapeCanopies} from './landscape-objects.js';
import {drawRegionalGroundDetail} from './regional-detail.js';
import {drawSrpgUnit} from './sprite-srpg.js';
import {drawVillager} from './sprite-villager.js';
import {fixedLayout} from './fixed-screens.js';

export const FIXED_SOURCE=WEST_STUDIES.find(z=>z.key==='village');
const P=(c,p,col)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const tag=t=>({g:'west-ground','=':'=',s:'west-stair',b:'west-bridge',w:'L',t:'west-ground',h:'west-ground','#':'west-wall'}[t]||'west-sky');
const renderData=new WeakMap();
function materialWorld(room){
 if(renderData.has(room))return renderData.get(room);
 const sx=130+room.col*30,sy=382+room.row*14;
 const proxy={tileAt:(x,y)=>tag(room.tileAt(x-sx,y-sy)),walkable:(x,y)=>room.walkable(x-sx,y-sy),zoneAt:()=>FIXED_SOURCE};
 const trees={landscapeObjects:room.trees.map(([x,y],i)=>({x,y,kind:'cypress',seed:.2+i*.1,solid:true,palette:FIXED_SOURCE.palette})),npcs:room.npcs};
 const data={sx,sy,proxy,trees};renderData.set(room,data);return data;
}
export function drawFixedHouse(c,house){
 drawWesternSite(c,{...house,form:'west-home',chapter:23},0);
 if(house.landmark){const x=house.x*32,y=house.y*32,w=house.w*32;P(c,[[x-7,y+2],[x+w*.5,y-35],[x+w+7,y+2]],'#92adb9');R(c,x+w*.7,y-25,12,24,'#b8c9c8');R(c,x+w*.7-2,y-28,16,5,'#78959f');}
}
function background(c,room,w,h,layout,time){
 const {scale:s,y}=layout,source=FIXED_SOURCE,g=skyGeometry(source),horizon=y+32*s*2.6;
 R(c,0,0,w,h,'#a6cad2');
 const zoom=s*.9,camera={x:(source.cx+.5)*32+(room.col-1)*85,y:g.horizon-(horizon-h/2)/zoom,zoom};
 c.save();c.translate(w/2,h/2);c.scale(zoom,zoom);c.translate(-camera.x,-camera.y);drawLandscapeSky(c,source,camera,{w,h},0,time);c.restore();
 // Shared terrain coordinates and roof: the same destination changes scale,
 // bearing and occlusion as the traveller goes round the two connected loops.
 for(let layer=0;layer<3;layer++){
  const points=[[0,h]];for(let i=0;i<=40;i++){const x=i*w/40,world=i*.19+room.col*.4;points.push([x,horizon+layer*21*s-Math.sin(world+room.row*.22)*29*s-Math.sin(world*2.1+layer)*10*s]);}points.push([w,h]);P(c,points,['#a8c1bd','#96b3ac','#8ba69b'][layer]);
 }
 for(let i=0;i<5;i++){
  const xx=(i+.4)*w/5+(room.col-1)*9*s,yy=horizon+10*s+Math.sin(i*2)*17*s;
  c.save();c.globalAlpha=.32;c.translate(xx,yy);c.scale(s*.19,s*.19);drawFixedHouse(c,{x:0,y:-3,w:4,h:3});c.restore();
 }
 if(room.id!=='highgarden'){
  const dx=2*15+11-(room.col*15+7),dy=4-(room.row*15+7),d=Math.hypot(dx,dy),size=s/(1+d/18),x=w/2+dx*4.2*s,base=horizon+12*s;
  c.save();c.globalAlpha=Math.min(.88,.38+22/(d+30));c.translate(x,base);c.scale(size,size);drawFixedHouse(c,{x:-2.5,y:-3,w:5,h:3,landmark:true});c.restore();
 }
 // Ground beyond the traversable island belongs to the distant valley.
 const mist=c.createLinearGradient(0,horizon,0,h);mist.addColorStop(0,'#d9e1ce22');mist.addColorStop(1,'#c4d1b455');R(c,0,horizon,w,h-horizon,mist);
}
export function drawFixedRoom(c,room,hero,screen,time,{destination=null,offsetX=0,offsetY=0}={}){
 const {w,h}=screen,l=fixedLayout(w,h),{sx,sy,proxy,trees}=materialWorld(room),s=l.scale;
 c.save();c.translate(offsetX,offsetY);c.beginPath();c.rect(0,0,w,h);c.clip();background(c,room,w,h,l,time);
 c.save();c.translate(l.x,l.y);c.scale(s,s);c.imageSmoothingEnabled=false;
 // Vertical cliff feet are separate from the grid top; the sky remains outside.
 for(let y=14;y>=0;y--)for(let x=0;x<15;x++)if(room.tileAt(x,y)!==' '&&room.tileAt(x,y)!=='w'&&room.tileAt(x,y+1)===' '){R(c,x*32,y*32+28,32,42,'#7f9691');R(c,x*32,y*32+28,32,4,'#d4dac1');R(c,x*32+7,y*32+38,2,19,'#b3c3b080');}
 c.save();c.translate(-sx*32,-sy*32);
 for(let y=0;y<15;y++)for(let x=0;x<15;x++){
  const t=room.tileAt(x,y);if(t===' ')continue;
  drawWesternTile(c,x+sx,y+sy,tag(t),proxy);drawRegionalGroundDetail(c,x+sx,y+sy,tag(t),proxy);
 }
 c.restore();
 if(room.connections.N){
  // The north road disappears under a real rock notch at the walking edge;
  // it must not end as a cut-off rectangle in the open sky.
  P(c,[[5*32,64],[5*32,-11],[6*32,-32],[6*32,55]],'#7e9693');
  P(c,[[9*32,55],[9*32,-32],[10*32,-8],[10*32,64]],'#7e9693');
  P(c,[[5*32,-11],[6*32,-32],[8*32,-37],[10*32,-8],[9*32,4],[6*32,4]],'#a5b7aa');
  P(c,[[6*32,-22],[8*32,-27],[9*32,-12],[6*32,-8]],'#d7ddc3');
 }
 for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(room.tileAt(x,y)==='w'){R(c,x*32+5,y*32+15+Math.sin(time/1600+x)*2,17,1,'#dbe6db88');}
 if(room.house?.landmark){R(c,6*32,5*32,5*32,4,'#e1dcc2');for(let i=0;i<4;i++)R(c,(6+i)*32,5*32+4,2,24,'#b7c5af');}
 if(room.returnStone){const {x,y}=room.returnStone;c.strokeStyle='#f1e6c5';c.lineWidth=3;c.beginPath();c.ellipse((x+.5)*32,(y+.5)*32,20,10,0,0,Math.PI*2);c.stroke();P(c,[[x*32+16,y*32+7],[x*32+22,y*32+16],[x*32+16,y*32+23],[x*32+10,y*32+16]],'#77a7ae');c.font=`${Math.max(14,11/s)}px system-ui`;c.textAlign='center';c.fillStyle='#3e646d';c.fillText('帰りの道標',(x+.5)*32,(y+1.3)*32);}
 drawLandscapeFeet(c,trees,{left:0,right:14,top:0,bottom:14});
 const objects=room.npcs.map(n=>({y:n.y+.5,paint:()=>drawVillager(c,n.x*32,n.y*32,n.color)}));
 if(room.house)objects.push({y:room.house.y+room.house.h,paint:()=>{drawFixedHouse(c,room.house);if(!room.house.landmark){c.strokeStyle='#8c9e92';c.lineWidth=1;c.beginPath();c.moveTo(2*32,8*32);c.lineTo(5.5*32,8*32);c.stroke();for(let i=0;i<4;i++)R(c,(2.2+i*.7)*32,8*32,14,19,['#b8c9c3','#dfc9ab','#a7bac0'][i%3]);}}});
 objects.push({y:hero.py+.7,paint:()=>{c.save();c.translate(0,hero.moving&&time!==0?-Math.abs(Math.sin(hero.stride*9))*1.5:0);drawSrpgUnit(c,{x:hero.px,y:hero.py,team:'ally',acted:false,type:'sword'});R(c,hero.px*32+8,hero.py*32+13,15,3,'#b8d9dc');R(c,hero.px*32+7,hero.py*32+16,5,7,'#7dbac5');c.restore();}});
 objects.sort((a,b)=>a.y-b.y);objects.forEach(o=>o.paint());drawLandscapeCanopies(c,trees,{left:0,right:14,top:0,bottom:14},hero);
 if(destination){c.strokeStyle='#fff1c5';c.lineWidth=2;c.beginPath();c.ellipse((destination.x+.5)*32,(destination.y+.5)*32,10,6,0,0,Math.PI*2);c.stroke();}
 // A small edge gap reads as the continuing road, without a development HUD.
 c.restore();c.restore();
}
