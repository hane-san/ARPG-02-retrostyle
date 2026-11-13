import {drawFixedSky,FIXED_SKIES} from './fixed-sky.js';
import {journeyMaterial,journeyTile,journeySite,journeyBackground} from './fixed-journey-art.js';
import {drawForestTree} from './forest-market-art.js';
import {WEST_STUDIES} from './western-world.js';
import {drawWesternTile,drawWesternSite} from './western-art.js';
import {drawLandscapeSky,skyGeometry} from './landscape-sky.js';
import {drawLandscapeFeet,drawLandscapeCanopies} from './landscape-objects.js';
import {drawRegionalGroundDetail} from './regional-detail.js';
import {drawSrpgUnit} from './sprite-srpg.js';
import {drawVillager} from './sprite-villager.js';
import {fixedLayout,fixedExitMarker,fixedGuideLayout} from './fixed-screens.js';
import {drawFeatureGround,featureObjects,drawPondRim} from './fixed-feature-art.js';
import {drawSurroundings,drawPanorama} from './fixed-backdrop.js';

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
 // The blue roof seen from the hamlet keeps its bearing on the far land,
 // standing behind the middle land like the other distant houses.
 const away=Math.hypot(room.col-2,room.row);
 drawPanorama(c,room,w,h,layout,time,away>.01?(g,feet)=>{
  const dx=2*15+11-(room.col*15+7),dy=4-(room.row*15+7),d=Math.hypot(dx,dy),size=s/(1+d/18),x=w/2+dx*4.2*s;
  g.save();g.globalAlpha*=Math.min(.9,.45+22/(d+30))*Math.min(1,away);g.translate(x,feet);g.scale(size,size);drawFixedHouse(g,{x:-2.5,y:-3,w:5,h:3,landmark:true});g.restore();
 }:null);
}
function terrain(c,room,hero,screen,time,{destination=null,offsetX=0,offsetY=0,guides=false,labels=null}={}){
 const {w,h}=screen,l=fixedLayout(w,h),{sx,sy,proxy,trees}=materialWorld(room),s=l.scale;
 const spanL=Math.min(-64,-l.x/s-32),spanR=Math.max(544,(w-l.x)/s+32),left=Math.max(0,Math.floor((spanL-offsetX/s)/32)),right=Math.min(14,Math.ceil((spanR-offsetX/s)/32)),top=Math.max(0,Math.floor((-128-offsetY/s)/32)),bottom=Math.min(14,Math.ceil((544-offsetY/s)/32));
 c.save();c.translate(offsetX,offsetY);
 c.save();c.translate(l.x,l.y);c.scale(s,s);c.imageSmoothingEnabled=false;
 // The land's own surroundings lie behind the walkable board (2026-11-12).
 drawSurroundings(c,room);
 // Cliff faces remain only where a drop is natural: the fault, the ridges and
 // the northern rim's open sky. Elsewhere the land simply continues.
 const drop=(x,y)=>room.tileAt(x,y+1)==='r'||room.tileAt(x,y+1)===' '&&(room.land==='ridge'||room.skyline&&y+1<3);
 for(let y=bottom;y>=top;y--)for(let x=left;x<=right;x++)if(![' ','w','r'].includes(room.tileAt(x,y))&&drop(x,y)&&!(y===14&&room.connections.S&&room.gateAt(x,y))){R(c,x*32,y*32+28,32,42,'#7f9691');R(c,x*32,y*32+28,32,4,'#d4dac1');R(c,x*32+7,y*32+38,2,19,'#b3c3b080');}
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
 for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++)if(room.tileAt(x,y)==='w'||room.tileAt(x,y)==='k'){R(c,x*32+5,y*32+15+Math.sin(time/1600+x)*2,17,1,'#dbe6db88');}
 for(const f of room.features||[]){drawFeatureGround(c,room,f,time);drawPondRim(c,room,f);}
 for(const [d,seam] of Object.entries(room.seams))if(seam.ground)for(const [lo,hi]of seam.bands)for(let j=lo;j<=hi;j++)for(let k=0;k<3;k++){
  const xx=d==='N'||d==='S'?j:d==='W'?k:14-k,yy=d==='E'||d==='W'?j:d==='N'?k:14-k;
  if(room.walkable(xx,yy)){c.save();c.globalAlpha*=k===0?.64:k===1?.3:.1;R(c,xx*32,yy*32,32,32,seam.ground);c.restore();}
 }
 if(room.house?.landmark){R(c,6*32,5*32,5*32,4,'#e1dcc2');for(let i=0;i<4;i++)R(c,(6+i)*32,5*32+4,2,24,'#b7c5af');}
 if(room.returnStone){const {x,y}=room.returnStone;c.strokeStyle='#f1e6c5';c.lineWidth=3;c.beginPath();c.ellipse((x+.5)*32,(y+.5)*32,20,10,0,0,Math.PI*2);c.stroke();P(c,[[x*32+16,y*32+7],[x*32+22,y*32+16],[x*32+16,y*32+23],[x*32+10,y*32+16]],'#77a7ae');const g=fixedGuideLayout(room,s).stone,a=guides?nearAlpha(hero,x,y,labels,'stone'):0;if(a>.01){c.save();c.globalAlpha*=a;c.font=`600 ${g.font}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';nameTag(c,g.x,g.y,g.w,g.h);c.fillStyle='#2f5a62';c.fillText('帰りの道標',g.x,g.y+1);c.restore();}}
 const guidePoints=Object.entries(room.seams).flatMap(([d,seam])=>seam.bands.map(([lo,hi])=>{const m=fixedExitMarker(d,room),j=(lo+hi)/2;return {x:d==='N'||d==='S'?j:m.x,y:(d==='E'||d==='W'?j:m.y)+.8};}));
 if(guides)drawExitStones(c,room,l.scale,hero,labels);
 const market=room.sourceIndex===1;
 if(market)for(const d of trees.landscapeObjects)drawForestTree(c,d,'trunk');else drawLandscapeFeet(c,trees,{left:0,right:14,top:0,bottom:14});
 const objects=room.npcs.map(n=>({y:n.y+.5,paint:()=>drawVillager(c,n.x*32,n.y*32,n.color)}));
 for(const site of [room.site,...room.props||[]].filter(Boolean))objects.push({y:site.y+site.h,paint:()=>journeySite(c,site,time)});
 for(const f of room.features||[])objects.push(...featureObjects(c,room,f,time));
 if(room.house)objects.push({y:room.house.y+room.house.h,paint:()=>{drawFixedHouse(c,room.house);if(!room.house.landmark){c.strokeStyle='#8c9e92';c.lineWidth=1;c.beginPath();c.moveTo(2*32,8*32);c.lineTo(5.5*32,8*32);c.stroke();for(let i=0;i<4;i++)R(c,(2.2+i*.7)*32,8*32,14,19,['#b8c9c3','#dfc9ab','#a7bac0'][i%3]);}}});
 if(hero)objects.push({y:hero.py+.7,paint:()=>{c.save();c.beginPath();c.rect(0,0,480,480);c.clip();c.translate(0,hero.moving&&time!==0?-Math.abs(Math.sin(hero.stride*9))*1.5:0);drawSrpgUnit(c,{x:hero.px,y:hero.py,team:'ally',acted:false,type:'sword'});R(c,hero.px*32+8,hero.py*32+13,15,3,'#b8d9dc');R(c,hero.px*32+7,hero.py*32+16,5,7,'#7dbac5');c.restore();}});
 objects.sort((a,b)=>a.y-b.y);objects.forEach(o=>o.paint());if(market)for(const d of trees.landscapeObjects){c.save();if((hero&&Math.abs(hero.px-d.x)<3&&hero.py<d.y+.5&&hero.py>d.y-5)||guidePoints.some(m=>Math.abs(m.x-d.x)<3&&m.y<d.y+.5&&m.y>d.y-7.5))c.globalAlpha*=.24;drawForestTree(c,d,'canopy');c.restore();}else drawLandscapeCanopies(c,guides?{...trees,npcs:[...trees.npcs,...guidePoints]}:trees,{left:0,right:14,top:0,bottom:14},hero||{px:-100,py:-100});
 if(destination){for(const [col,lw] of [['#4f7a76cc',4],['#fff6d8',2]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.ellipse((destination.x+.5)*32,(destination.y+.5)*32,11,6.5,0,0,Math.PI*2);c.stroke();}}
 if(guides)drawExitPlaques(c,room,l.scale,hero,labels);
 // A small edge gap reads as the continuing road, without a development HUD.
 c.restore();c.restore();
}

// Low road stones and quiet name tags belong to the walkable ground.
// 2026-11-13: names no longer sit on the scenery all the time. A tag rises
// when the traveller arrives, comes near that exit or the waystone, or walks
// towards it, and settles away again; the stones alone mark the way. The tag
// geometry (and so the generous tap target in fixedExitTarget) is unchanged.
function nearAlpha(hero,x,y,labels,key){
 const d=hero?Math.hypot(hero.px-x,hero.py-y):Infinity,near=Math.max(0,Math.min(1,(3.6-d)/1.4));
 return Math.max(near,labels?.arrival??0,labels?.target===key?1:0);
}
function nameTag(c,x,y,w,h){
 const r=h*.5;c.save();c.shadowColor='#1d2f3240';c.shadowBlur=6;c.shadowOffsetY=1.5;c.beginPath();if(c.roundRect)c.roundRect(x-w/2,y-h/2,w,h,r);else c.rect(x-w/2,y-h/2,w,h);c.fillStyle='#f7f2e2e6';c.fill();c.restore();
}
function exitAlpha(room,d,hero,labels){const m=fixedExitMarker(d,room);return nearAlpha(hero,m.x,m.y,labels,d);}
function drawExitStones(c,room,scale,hero,labels){
 c.save();
 for(const [d] of Object.entries(room.connections)){
  const m=fixedExitMarker(d,room),a=d==='N'?-Math.PI/2:d==='S'?Math.PI/2:d==='W'?Math.PI:0,lit=exitAlpha(room,d,hero,labels);
  // A return waystone on the same cell keeps its diamond; the chevrons step
  // one cell nearer to the edge instead of being painted over it.
  const near=room.returnStone&&Math.abs(room.returnStone.x-m.x)<1.5&&Math.abs(room.returnStone.y-m.y)<1.5,push=near?.6:0;
  for(const [lo,hi]of room.seams[d].bands){const j=(lo+hi)/2,mark={x:d==='N'||d==='S'?j:m.x,y:d==='E'||d==='W'?j:m.y};
   c.save();c.translate((mark.x+.5)*32,(mark.y+.5)*32);c.rotate(a);c.translate(push*32,0);c.globalAlpha*=.62+.38*lit;
   for(const step of [0,15]){P(c,[[step-7,-7],[step+3,0],[step-7,7],[step-3,0]],'#f3ecd6a8');P(c,[[step-6,-5.5],[step+1.5,0],[step-6,5.5],[step-3,0]],'#4f7a76d0');}c.restore();
  }
 }
 c.restore();
}
// Name tags are painted above houses, sites and canopies so a large
// building can never hide where an exit leads. Over the traveller they thin.
function drawExitPlaques(c,room,scale,hero,labels){
 const layout=fixedGuideLayout(room,scale);c.save();c.textAlign='center';c.textBaseline='middle';
 for(const label of Object.values(layout.labels)){
  const a=exitAlpha(room,label.d,hero,labels);if(a<=.01)continue;
  const under=hero&&Math.abs((hero.px+.5)*32-label.x)<label.w/2+10&&Math.abs((hero.py+.35)*32-label.y)<label.h/2+18;
  c.save();c.globalAlpha*=a*(under?.5:1);c.font=`600 ${label.font}px system-ui,sans-serif`;
  nameTag(c,label.x,label.y,label.w,label.h);c.fillStyle='#2f5a5e';c.fillText(label.name,label.x,label.y+1);c.restore();
 }
 c.restore();
}

// The camera moves by one walking board, not one browser viewport. The same
// world-space terrain is visible on both sides, through a stable terrain window.
const layers=new WeakMap();
export function releaseFixedArt(c){const layer=layers.get(c);if(layer)layer.width=layer.height=1;}
export function drawFixedRoom(c,room,hero,screen,time,{destination=null,rooms=[room],transition=null,labels=null}={}){
 const l=fixedLayout(screen.w,screen.h),stride=480*l.scale;
 const u=transition?Math.min(1,transition.elapsed/transition.duration):0,p=u*u*u*(u*(u*6-15)+10);
 const cx=room.col+(transition?transition.to.col-room.col:0)*p,cy=room.row+(transition?transition.to.row-room.row:0)*p;
 background(c,{...room,col:cx,row:cy},screen.w,screen.h,l,time);
 const dpr=screen.dpr||1,sized=layer=>{if(layer.width!==Math.round(screen.w*dpr)||layer.height!==Math.round(screen.h*dpr)){layer.width=Math.round(screen.w*dpr);layer.height=Math.round(screen.h*dpr);}const g=layer.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return g;};
 let pair=layers.get(c);if(!pair){const front=document.createElement('canvas');front.id='fixedTerrainCanvas';const back=document.createElement('canvas');back.id='fixedNeighbourCanvas';pair={front,back};layers.set(c,pair);}
 const ground=sized(pair.front),behind=sized(pair.back);
 // Sky renderers own their cloud alpha. Fade the completed sky, using the
 // terrain buffer before clearing it, so no cloud can bypass the transition.
 if(transition){background(ground,{...transition.to,col:cx,row:cy},screen.w,screen.h,l,time);c.save();c.globalAlpha=p;c.drawImage(pair.front,0,0,screen.w,screen.h);c.restore();}
 ground.clearRect(0,0,screen.w,screen.h);behind.clearRect(0,0,screen.w,screen.h);
 // 2026-11-13: the walkable board(s) are drawn in front of the neighbours and
 // are never dissolved by the neighbours' fog, so a tall tower, windmill or
 // gate keeps its whole silhouette against the sky. Neighbouring boards fade
 // into the distant land behind it.
 // During a slide the arriving board rises out of the distance as the
 // leaving one sinks into it: each is drawn behind (faded, as a neighbour) and
 // in front with the slide's own weight, so nothing pops at either end.
 const front=transition?[[transition.to,p],[room,1-p]].filter(([,a])=>a>0):[[room,1]];
 const behindOnly=r=>!transition?r.id!==room.id:r.id===room.id?p>0:r.id===transition.to.id?p<1:true;
 const visible=rooms.filter(r=>Math.abs(r.col-cx)<=1.01&&Math.abs(r.row-cy)<=1.01&&behindOnly(r));
 const veilOf=r=>mixHex('#dce6e1',FIXED_SKIES[r.sky]?.colors?.[3]||'#dce6e1',.45),veil=transition?mixHex(veilOf(room),veilOf(transition.to),p):veilOf(room);
 const clipL=Math.min(l.x-64*l.scale,0),clipR=Math.max(l.x+l.width+64*l.scale,screen.w);
 behind.save();behind.beginPath();behind.rect(clipL,l.y-150*l.scale,clipR-clipL,l.height+214*l.scale);behind.clip();
 for(const r of visible){const ox=(r.col-cx)*stride,oy=(r.row-cy)*stride;
  behind.save();behind.beginPath();behind.rect(l.x+ox,l.y+oy-150*l.scale,l.width,l.height+150*l.scale);behind.clip();
  const person=transition&&[room.id,transition.to.id].includes(r.id)?transitionTraveller(room,transition,r,p):null;
  terrain(behind,r,person,screen,time,{offsetX:ox,offsetY:oy});
  // Neighbouring boards stay visible as continuing land under the sky's own
  // light haze, so the walkable board reads first.
  behind.globalAlpha=.2;behind.fillStyle=veil;behind.fillRect(l.x+ox,l.y+oy-150*l.scale,l.width,l.height+150*l.scale);behind.globalAlpha=1;
  behind.restore();
 }
 behind.restore();
 behind.save();behind.globalCompositeOperation='destination-in';const fog=behind.createLinearGradient(0,l.y-150*l.scale,0,l.y-36*l.scale);fog.addColorStop(0,'#0000');fog.addColorStop(.55,'#0007');fog.addColorStop(1,'#000');behind.fillStyle=fog;behind.fillRect(0,0,screen.w,screen.h);
 // In wide viewports the neighbouring boards end inside the screen: let them
 // dissolve into the distant land instead of stopping on a hard vertical cut.
 const x0=l.x-stride,x1=l.x+l.width+stride,band=72*l.scale;
 if(x0>-band||x1<screen.w+band){const side=behind.createLinearGradient(x0,0,x1,0),f=band/(x1-x0);side.addColorStop(0,'#0000');side.addColorStop(f,'#000');side.addColorStop(1-f,'#000');side.addColorStop(1,'#0000');behind.fillStyle=side;behind.fillRect(0,0,screen.w,screen.h);}
 behind.restore();
 c.drawImage(pair.back,0,0,screen.w,screen.h);
 for(const [r,weight] of front){const ox=(r.col-cx)*stride,oy=(r.row-cy)*stride;
  ground.save();ground.globalAlpha=weight;ground.beginPath();ground.rect(l.x+ox,-screen.h,l.width,screen.h+l.y+oy+l.height);ground.clip();
  const person=transition?transitionTraveller(room,transition,r,p):hero;
  terrain(ground,r,person,screen,time,{offsetX:ox,offsetY:oy,destination:r===room?destination:null,guides:r.id===room.id,labels});
  ground.restore();
 }
 c.drawImage(pair.front,0,0,screen.w,screen.h);
}
const mixHex=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');

// Both board clips paint portions of the same traveller at one world position.
export function transitionTraveller(from,transition,room,p){
 const a=transition.hero,b=transition.landing,to=transition.to;
 const x=from.col*15+a.px+(to.col*15+b.x-from.col*15-a.px)*p-room.col*15;
 const y=from.row*15+a.py+(to.row*15+b.y-from.row*15-a.py)*p-room.row*15;
 return {...a,x,y,px:x,py:y,moving:false};
}
