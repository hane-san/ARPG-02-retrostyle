import {drawFixedSky} from './fixed-sky.js';
import {journeyMaterial,journeyTile,journeySite,journeyBackground} from './fixed-journey-art.js';
import {drawForestTree} from './forest-market-art.js';
import {WEST_STUDIES} from './western-world.js';
import {drawWesternTile,drawWesternSite} from './western-art.js';
import {drawLandscapeSky,skyGeometry} from './landscape-sky.js';
import {drawLandscapeFeet,drawLandscapeCanopies} from './landscape-objects.js';
import {drawRegionalGroundDetail} from './regional-detail.js';
import {drawSrpgUnit} from './sprite-srpg.js';
import {drawVillager} from './sprite-villager.js';
import {fixedLayout,fixedExitMarker,FIXED_ROOMS} from './fixed-screens.js';

export const FIXED_SOURCE=WEST_STUDIES.find(z=>z.key==='village');
const P=(c,p,col)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const tag=t=>({g:'west-ground','=':'=',s:'west-stair',b:'west-bridge',w:'L',t:'west-ground',h:'west-ground','#':'west-wall'}[t]||'west-sky');
const renderData=new WeakMap();
const mix=(a,b,t)=>{const c=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));return '#'+c(a).map((v,i)=>Math.round(v+(c(b)[i]-v)*Math.max(0,Math.min(1,t))).toString(16).padStart(2,'0')).join('');};
export function fixedClimate(x,y){const east=Math.max(0,Math.min(1,x/45)),south=Math.max(0,Math.min(1,y/45));return {ground:mix(mix('#b8bdad','#a5c4b7',east),mix('#c4c8a7','#b0c8b0',east),south),road:mix('#d4d1ba','#ede0b9',south),sky:mix('#9fc4d4','#c0d7cf',south),stone:mix('#a3b4b4','#d1cbb4',south)};}
function materialWorld(room){
 if(room.sourceIndex!==undefined)return journeyMaterial(room);
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
 if(room.sourceIndex!==undefined)return journeyBackground(c,room,w,h,layout,time);
 const {scale:s,y}=layout,source=FIXED_SOURCE,g=skyGeometry(source),horizon=y+32*s*2.6;
 const authored=drawFixedSky(c,room,w,h,layout,time);
 if(!authored){R(c,0,0,w,h,'#a6cad2');
 const zoom=s*.9,camera={x:(source.cx+.5)*32+(room.col-1)*85,y:g.horizon-(horizon-h/2)/zoom,zoom};
 c.save();c.translate(w/2,h/2);c.scale(zoom,zoom);c.translate(-camera.x,-camera.y);drawLandscapeSky(c,source,camera,{w,h},0,time);c.restore();}
 // Shared terrain coordinates and roof: the same destination changes scale,
 // bearing and occlusion as the traveller goes round the two connected loops.
 for(let layer=0;layer<3;layer++){
  const points=[[0,h]];for(let i=0;i<=40;i++){const x=i*w/40,world=i*.19+room.col*.4;points.push([x,horizon+layer*21*s-Math.sin(world+room.row*.22)*29*s-Math.sin(world*2.1+layer)*10*s]);}points.push([w,h]);P(c,points,['#a8c1bd','#96b3ac','#8ba69b'][layer]);
 }
 for(let i=0;i<5;i++){
  const xx=(i+.4)*w/5+(room.col-1)*9*s,yy=horizon+10*s+Math.sin(i*2)*17*s;
  c.save();c.globalAlpha*=.32;c.translate(xx,yy);c.scale(s*.19,s*.19);drawFixedHouse(c,{x:0,y:-3,w:4,h:3});c.restore();
 }
 if(Math.hypot(room.col-2,room.row)>.01){
  const dx=2*15+11-(room.col*15+7),dy=4-(room.row*15+7),d=Math.hypot(dx,dy),size=s/(1+d/18),x=w/2+dx*4.2*s,base=horizon+12*s;
  c.save();c.globalAlpha*=Math.min(.88,.38+22/(d+30))*Math.min(1,Math.hypot(room.col-2,room.row));c.translate(x,base);c.scale(size,size);drawFixedHouse(c,{x:-2.5,y:-3,w:5,h:3,landmark:true});c.restore();
 }
 const air=c.createLinearGradient(0,0,0,horizon);air.addColorStop(0,fixedClimate(room.col*15+7,room.row*15+7).sky+'44');air.addColorStop(1,'#f4e6c222');R(c,0,0,w,horizon,air);
 // The distant valley remains separate from the connected walking ground.
 const mist=c.createLinearGradient(0,horizon,0,h);mist.addColorStop(0,'#d9e1ce22');mist.addColorStop(1,'#c4d1b455');R(c,0,horizon,w,h-horizon,mist);
}
function terrain(c,room,hero,screen,time,{destination=null,offsetX=0,offsetY=0,guides=false}={}){
 const {w,h}=screen,l=fixedLayout(w,h),{sx,sy,proxy,trees}=materialWorld(room),s=l.scale;
 const left=Math.max(0,Math.floor((-64-offsetX/s)/32)),right=Math.min(14,Math.ceil((544-offsetX/s)/32)),top=Math.max(0,Math.floor((-128-offsetY/s)/32)),bottom=Math.min(14,Math.ceil((544-offsetY/s)/32));
 c.save();c.translate(offsetX,offsetY);
 c.save();c.translate(l.x,l.y);c.scale(s,s);c.imageSmoothingEnabled=false;
 // Vertical cliff feet are separate from the grid top; the sky remains outside.
 for(let y=bottom;y>=top;y--)for(let x=left;x<=right;x++)if(![' ','w','r'].includes(room.tileAt(x,y))&&[' ','r'].includes(room.tileAt(x,y+1))&&!(y===14&&room.connections.S&&room.gateAt(x,y))){R(c,x*32,y*32+28,32,42,'#7f9691');R(c,x*32,y*32+28,32,4,'#d4dac1');R(c,x*32+7,y*32+38,2,19,'#b3c3b080');}
 for(let yy=top;yy<=bottom;yy++)for(let xx=left;xx<=right;xx++)if(room.tileAt(xx,yy)==='r'){
  const depth=c.createLinearGradient(0,yy*32,0,yy*32+32);depth.addColorStop(0,'#405969');depth.addColorStop(1,'#7f9fa8');R(c,xx*32,yy*32,32,32,depth);R(c,xx*32+8,yy*32+14,15,1,'#bed0c355');
 }
 c.save();c.translate(-sx*32,-sy*32);
 for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
  const t=room.tileAt(x,y);if(t===' '||t==='r')continue;
  if(room.sourceIndex!==undefined)journeyTile(c,room,x,y);else{drawWesternTile(c,x+sx,y+sy,tag(t),proxy);drawRegionalGroundDetail(c,x+sx,y+sy,tag(t),proxy);}
 }
 c.restore();
 for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
  const t=room.tileAt(x,y),gx=room.col*15+x,gy=room.row*15+y,p=room.sourceIndex===undefined?fixedClimate(gx,gy):null;
  if(room.sourceIndex===undefined&&['g','=','s','b'].includes(t)){
   R(c,x*32,y*32,32,32,(t==='g'?p.ground:p.road)+'99');
   if(t==='g'&&gy<15&&Math.sin(gx*.31+gy*.17)+Math.sin(gx*.11-gy*.41)>.55){const n=(gx*13+gy*7)%9;P(c,[[x*32+3+n/2,y*32+24],[x*32+10+n,y*32+10+n/2],[x*32+25-n/2,y*32+22]],p.stone);R(c,x*32+8,y*32+24,18,1,'#edf0d255');}
   else if(t==='g'){for(let i=0;i<3;i++){const xx=x*32+5+(gx*7+gy*11+i*9)%23,yy=y*32+7+i*7;R(c,xx,yy,1,4,'#6f98726a');if((gx+gy+i)%5===0)R(c,xx-1,yy,3,2,gy>30?'#e9d5a5':'#dae8ce');}}
   if(t==='s')for(let j=0;j<4;j++)R(c,x*32,y*32+j*8,32,1,'#768c8c88');
   if(t==='b')for(let j=0;j<4;j++)R(c,x*32+j*8,y*32,1,32,'#7b8e8188');
  }
 }
 for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++)if(room.tileAt(x,y)==='w'){R(c,x*32+5,y*32+15+Math.sin(time/1600+x)*2,17,1,'#dbe6db88');}
 for(const [d,seam] of Object.entries(room.seams))if(seam.ground)for(const [lo,hi]of seam.bands)for(let j=lo;j<=hi;j++)for(let k=0;k<3;k++){
  const xx=d==='N'||d==='S'?j:d==='W'?k:14-k,yy=d==='E'||d==='W'?j:d==='N'?k:14-k;
  if(room.walkable(xx,yy)){c.save();c.globalAlpha*=k===0?.64:k===1?.3:.1;R(c,xx*32,yy*32,32,32,seam.ground);c.restore();}
 }
 if(room.house?.landmark){R(c,6*32,5*32,5*32,4,'#e1dcc2');for(let i=0;i<4;i++)R(c,(6+i)*32,5*32+4,2,24,'#b7c5af');}
 if(room.returnStone){const {x,y}=room.returnStone;c.strokeStyle='#f1e6c5';c.lineWidth=3;c.beginPath();c.ellipse((x+.5)*32,(y+.5)*32,20,10,0,0,Math.PI*2);c.stroke();P(c,[[x*32+16,y*32+7],[x*32+22,y*32+16],[x*32+16,y*32+23],[x*32+10,y*32+16]],'#77a7ae');c.font=`${Math.max(14,11/s)}px system-ui`;c.textAlign='center';c.fillStyle='#3e646d';c.fillText('帰りの道標',(x+.5)*32,(y+1.3)*32);}
 const guidePoints=Object.entries(room.seams).flatMap(([d,seam])=>seam.bands.map(([lo,hi])=>{const m=fixedExitMarker(d,room),j=(lo+hi)/2;return {x:d==='N'||d==='S'?j:m.x,y:(d==='E'||d==='W'?j:m.y)+.8};}));
 if(guides)drawExitStones(c,room,l.scale);
 const market=room.sourceIndex===1;
 if(market)for(const d of trees.landscapeObjects)drawForestTree(c,d,'trunk');else drawLandscapeFeet(c,trees,{left:0,right:14,top:0,bottom:14});
 const objects=room.npcs.map(n=>({y:n.y+.5,paint:()=>drawVillager(c,n.x*32,n.y*32,n.color)}));
 for(const site of [room.site,...room.props||[]].filter(Boolean))objects.push({y:site.y+site.h,paint:()=>journeySite(c,site,time)});
 if(room.house)objects.push({y:room.house.y+room.house.h,paint:()=>{drawFixedHouse(c,room.house);if(!room.house.landmark){c.strokeStyle='#8c9e92';c.lineWidth=1;c.beginPath();c.moveTo(2*32,8*32);c.lineTo(5.5*32,8*32);c.stroke();for(let i=0;i<4;i++)R(c,(2.2+i*.7)*32,8*32,14,19,['#b8c9c3','#dfc9ab','#a7bac0'][i%3]);}}});
 if(hero)objects.push({y:hero.py+.7,paint:()=>{c.save();c.beginPath();c.rect(0,0,480,480);c.clip();c.translate(0,hero.moving&&time!==0?-Math.abs(Math.sin(hero.stride*9))*1.5:0);drawSrpgUnit(c,{x:hero.px,y:hero.py,team:'ally',acted:false,type:'sword'});R(c,hero.px*32+8,hero.py*32+13,15,3,'#b8d9dc');R(c,hero.px*32+7,hero.py*32+16,5,7,'#7dbac5');c.restore();}});
 objects.sort((a,b)=>a.y-b.y);objects.forEach(o=>o.paint());if(market)for(const d of trees.landscapeObjects){c.save();if((hero&&Math.abs(hero.px-d.x)<3&&hero.py<d.y+.5&&hero.py>d.y-5)||guidePoints.some(m=>Math.abs(m.x-d.x)<3&&m.y<d.y+.5&&m.y>d.y-7.5))c.globalAlpha=.24;drawForestTree(c,d,'canopy');c.restore();}else drawLandscapeCanopies(c,guides?{...trees,npcs:[...trees.npcs,...guidePoints]}:trees,{left:0,right:14,top:0,bottom:14},hero||{px:-100,py:-100});
 if(destination){c.strokeStyle='#fff1c5';c.lineWidth=2;c.beginPath();c.ellipse((destination.x+.5)*32,(destination.y+.5)*32,10,6,0,0,Math.PI*2);c.stroke();}
 // A small edge gap reads as the continuing road, without a development HUD.
 c.restore();c.restore();
}

// Low road stones and direction plaques belong to the walkable ground.
function drawExitStones(c,room,scale){
 c.save();
 for(const [d,id] of Object.entries(room.connections)){
  const m=fixedExitMarker(d,room),a=d==='N'?-Math.PI/2:d==='S'?Math.PI/2:d==='W'?Math.PI:0;
  for(const [lo,hi]of room.seams[d].bands){const j=(lo+hi)/2,mark={x:d==='N'||d==='S'?j:m.x,y:d==='E'||d==='W'?j:m.y};
   c.save();c.translate((mark.x+.5)*32,(mark.y+.5)*32);c.rotate(a);
   for(const step of [0,21])P(c,[[step-7,-7],[step+2,0],[step-7,7],[step-3,0]],'#698d87');c.restore();
  }
  const text=FIXED_ROOMS.find(r=>r.id===id)?.chartName||'',font=Math.max(14,12/scale),x=(m.x+.5)*32,y=(m.y+.5)*32+font+10;
  c.font=`${font}px system-ui`;c.textAlign='center';const w=c.measureText(text+'へ').width+12;
  R(c,x-w/2,y-font,w,font+5,'#eee6cded');c.fillStyle='#3b6468';c.fillText(text+'へ',x,y);
 }
 c.restore();
}

// The camera moves by one walking board, not one browser viewport. The same
// world-space terrain is visible on both sides, through a stable terrain window.
const layers=new WeakMap();
export function releaseFixedArt(c){const layer=layers.get(c);if(layer)layer.width=layer.height=1;}
export function drawFixedRoom(c,room,hero,screen,time,{destination=null,rooms=[room],transition=null}={}){
 const l=fixedLayout(screen.w,screen.h),stride=480*l.scale;
 const u=transition?Math.min(1,transition.elapsed/transition.duration):0,p=u*u*u*(u*(u*6-15)+10);
 const cx=room.col+(transition?transition.to.col-room.col:0)*p,cy=room.row+(transition?transition.to.row-room.row:0)*p;
 background(c,{...room,col:cx,row:cy},screen.w,screen.h,l,time);
 let layer=layers.get(c);if(!layer){layer=document.createElement('canvas');layer.id='fixedTerrainCanvas';layers.set(c,layer);}const dpr=screen.dpr||1;if(layer.width!==Math.round(screen.w*dpr)||layer.height!==Math.round(screen.h*dpr)){layer.width=Math.round(screen.w*dpr);layer.height=Math.round(screen.h*dpr);}const ground=layer.getContext('2d');ground.setTransform(dpr,0,0,dpr,0,0);
 // Sky renderers own their cloud alpha. Fade the completed sky, using the
 // terrain buffer before clearing it, so no cloud can bypass the transition.
 if(transition){background(ground,{...transition.to,col:cx,row:cy},screen.w,screen.h,l,time);c.save();c.globalAlpha=p;c.drawImage(layer,0,0,screen.w,screen.h);c.restore();}
 ground.clearRect(0,0,screen.w,screen.h);const skyContext=c;c=ground;
 c.save();c.beginPath();c.rect(l.x-64*l.scale,l.y-128*l.scale,l.width+128*l.scale,l.height+192*l.scale);c.clip();
 const visible=new Set(rooms.filter(r=>Math.abs(r.col-cx)<=1.01&&Math.abs(r.row-cy)<=1.01).map(r=>r.id));
 for(const r of [...rooms.filter(r=>r.id!==room.id),room]){if(!visible.has(r.id))continue;const ox=(r.col-cx)*stride,oy=(r.row-cy)*stride;
  c.save();c.beginPath();c.rect(l.x+ox,l.y+oy-128*l.scale,l.width,l.height+128*l.scale);c.clip();
  const person=transition&&[room.id,transition.to.id].includes(r.id)?transitionTraveller(room,transition,r,p):r.id===room.id?hero:null;
  terrain(c,r,person,screen,time,{offsetX:ox,offsetY:oy,destination:r===room?destination:null,guides:r.id===room.id});c.restore();
 }
 c.restore();
 c.save();c.globalCompositeOperation='destination-in';const fog=c.createLinearGradient(0,l.y-128*l.scale,0,l.y-48*l.scale);fog.addColorStop(0,'#0000');fog.addColorStop(1,'#000');c.fillStyle=fog;c.fillRect(0,0,screen.w,screen.h);c.restore();
 skyContext.drawImage(layer,0,0,screen.w,screen.h);
}

// Both board clips paint portions of the same traveller at one world position.
export function transitionTraveller(from,transition,room,p){
 const a=transition.hero,b=transition.landing,to=transition.to;
 const x=from.col*15+a.px+(to.col*15+b.x-from.col*15-a.px)*p-room.col*15;
 const y=from.row*15+a.py+(to.row*15+b.y-from.row*15-a.py)*p-room.row*15;
 return {...a,x,y,px:x,py:y,moving:false};
}
