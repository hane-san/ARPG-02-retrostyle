import {drawFixedSky,FIXED_SKIES} from './fixed-sky.js';
import {WEST_STUDIES} from './western-world.js';
import {fixedSource} from './fixed-journey-data.js';
import {drawPilgrimTile,drawPilgrimSite} from './pilgrimage-art.js';
import {drawLandscapeSky,skyGeometry,skyPalette} from './landscape-sky.js';
import {drawPanorama,mix} from './fixed-backdrop.js';
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const P=(c,p,col)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const cache=new WeakMap();
export function journeyMaterial(room){
 if(cache.has(room))return cache.get(room);
 const z=fixedSource(room.sourceIndex),sx=z.cx-7,sy=z.cy-7;
 const tag=t=>z.southeast?({s:'se-stair',b:room.land==='shore'?'se-stonebridge':'se-boardwalk',w:'L',k:'L','#':'se-wall','=':'='}[t]||'se-ground'):z.western?({s:'west-stair',b:'west-bridge',w:'L',k:'L','#':'west-wall','=':'='}[t]||'west-ground'):({s:'=',b:'+',w:'L',k:'L','#':'X','=':'='}[t]||'.');
 const proxy={tileAt:(x,y)=>tag(room.tileAt(x-sx,y-sy)),walkable:(x,y)=>room.walkable(x-sx,y-sy),zoneAt:()=>z};
 const kind=room.sourceIndex===17?'pine':room.sourceIndex===27?'cypress':room.land==='forest'?'willow':room.land==='marsh'?'willow':room.land==='shore'?'rock':'cypress';
 // 2026-11-14: trees on the boards are leafy greens (still tinted by the land),
 // not the pale blue-grey of the distant pilgrimage palette.
 const leafy=[mix(z.palette[0],kind==='pine'?'#557e5c':'#6f9a63',.7),mix(z.palette[1],'#c2d9a0',.6),z.palette[2],mix(z.palette[3],kind==='pine'?'#2f5040':'#3f6a4a',.72)];
 const landscapeObjects=room.trees.map(([x,y],i)=>({x,y,kind,seed:.2+i*.1,solid:true,palette:kind==='rock'?z.palette:leafy}));
 if(['meadow','terrace','marsh','shore'].includes(room.land))for(let y=3;y<13;y+=3)for(let x=2;x<13;x+=4)if(room.tileAt(x,y)==='g')landscapeObjects.push({x,y,kind:room.land==='marsh'?'reed':'flower',seed:(x+y)%7/7,solid:false,palette:z.palette});
 const trees={landscapeObjects,npcs:room.npcs};
 const data={sx,sy,proxy,trees,tag,z};cache.set(room,data);return data;
}
export function journeyTile(c,room,x,y){
 const {sx,sy,proxy,tag,z}=journeyMaterial(room),t=room.tileAt(x,y);
 drawPilgrimTile(c,x+sx,y+sy,tag(t),proxy);
 if(t==='d'){
  const xx=(x+sx)*32,yy=(y+sy)*32;R(c,xx,yy,32,32,z.palette[3]);R(c,xx+5,yy,22,32,'#aa9f89');
  for(let i=0;i<3;i++)R(c,xx+7,yy+6+i*10,17,1,'#e3d6ae77');R(c,xx,yy,3,32,z.palette[1]);R(c,xx+29,yy,3,32,z.palette[1]);
 }
 const light=FIXED_SKIES[room.sky];if(light?.light){c.save();c.globalAlpha*=light.strength;R(c,(x+sx)*32,(y+sy)*32,32,32,light.light);c.restore();}
 if(t==='s'&&!z.western)for(let j=0;j<4;j++){R(c,(x+sx)*32,(y+sy)*32+j*8,32,2,z.palette[1]);R(c,(x+sx)*32,(y+sy)*32+j*8+2,32,1,z.palette[3]);}
}
export function journeySite(c,site,time){
 c.save();c.translate(site.x*32,site.y*32);c.scale(site.scale,site.scale);
 drawPilgrimSite(c,{...site,x:0,y:0,w:site.sourceW,h:site.sourceH},time,0);c.restore();
}
// Sky is outside the movement grid. Its source profiles, geology and repeated
// architecture give the small boards a shared, much larger surrounding world.
export function journeyBackground(c,room,w,h,l,time){
 const source=fixedSource(room.sourceIndex),z=WEST_STUDIES.find(z=>z.index===room.sourceIndex),profile=z&&skyGeometry(z)?z:WEST_STUDIES.find(z=>z.key==='azure');
 const coreSkies={forest:['#72969d','#b5cabb','#eadbc1'],garden:['#689eaf','#bddbd2','#f0e6c5'],dry:['#8d9caf','#d5cec3','#f0d8b2'],salt:['#8caec2','#d2dedb','#f1e6c7'],conifer:['#768eab','#b4c8cf','#d4ded6'],monolith:['#617f98','#a2b9c2','#d2d3bf'],capital:['#6b879c','#b8c6c5','#e5dfc5'],sealed:['#758393','#b4bdc1','#dedccd']};
 const horizon=l.y+32*l.scale*2.6,colors=coreSkies[source.theme]||skyPalette(profile.key),grad=c.createLinearGradient(0,0,0,Math.max(horizon,1));
 const authored=!!room.sky;
 if(authored)drawFixedSky(c,room,w,h,l,time);else{colors.forEach((col,i)=>grad.addColorStop(i/(colors.length-1),col));R(c,0,0,w,h,grad);
 const zoom=l.scale*.9,g=skyGeometry(profile),camera={x:(profile.cx+.5)*32+(room.col-5)*35,y:g.horizon-(horizon-h/2)/zoom,zoom};
 c.save();if(!z||!skyGeometry(z))c.globalAlpha*=.45;c.translate(w/2,h/2);c.scale(zoom,zoom);c.translate(-camera.x,-camera.y);drawLandscapeSky(c,profile,camera,{w,h},0,time);c.restore();}
 // The region beyond the boards: far, middle and near land in front of the sky.
 // The imperial wall is seen over the plain and through the mountain saddle,
 // then becomes the actual solid gate in capital-gate. Repeat its human doors;
 // it stands behind the middle land, so its foot is never in the air.
 const wall=['azure-plain','monolith-court','mountain-pass','snow-cliff','capital-gate','sealed-court'].includes(room.id);
 drawPanorama(c,room,w,h,l,time,wall?(g,feet,far)=>{
  const size=l.scale*(room.id==='capital-gate'?.62:room.id==='azure-plain'?.25:.4);
  g.save();g.translate(w*.56,feet+4*l.scale);g.scale(size,size);
  for(let i=-5;i<=6;i++){R(g,i*68,-80,48,80,far('#aab9b7'));R(g,i*68+8,-98,32,18,far('#d6d8cb'));R(g,i*68+16,-25,12,25,far('#839ba2'));}R(g,-5*68,-60,12*68,14,far('#b8c3bd'));g.restore();
 }:null);

}
