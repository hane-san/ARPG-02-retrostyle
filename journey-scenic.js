// Reversible micro-landscape and camera composition experiments (Issue #50).
// No new blocking tiles, quests, real time progression or adopted lore.
const prop=(id,kind,x,y,variant=0)=>({id:'scenic-'+id,kind,x,y,variant});
export const JOURNEY_SCENIC_PROPS=[
 prop('port-lanterns','lantern',14,75),prop('quay-ropes','ropes',22,74),
 prop('boat-flags','flags',10,79),prop('waiting-kites','kite',19,82),
 prop('meadow-seeds','seed',29,37),prop('meadow-ribbons','flags',38,44,1),
 prop('grass-clock','disc',45,36),prop('steppe-flowerpath','flowers',33,23),
 prop('children-ribbons','flags',25,30,2),prop('lost-wreath','flowers',33,47),
 prop('tea-canopy','lantern',43,69,1),prop('water-wheel-spray','spray',54,73),
 prop('pass-moss','flowers',59,27,1),prop('silent-facets','glyph',54,20),
 prop('ruin-rainline','threads',73,22),prop('sunken-shards','glyph',82,27,1),
 prop('salt-prisms','prism',88,32),prop('ship-ghost-flags','flags',91,21,3),
 prop('shore-flowers','flowers',101,69),prop('lake-sparkles','spray',89,47,1),
 prop('sunset-bells','bell',78,77),prop('scattered-steps','steps',73,69),
 prop('crimson-wind-chimes','bell',128,34,1),prop('canyon-lines','threads',137,41,1),
 prop('red-rock-eye','glyph',140,27,2),prop('canyon-drift','seed',118,42,1),
 prop('highland-prayerflags','flags',155,25,4),prop('mist-chimes','bell',162,34,2),
 prop('mountain-spring','spray',166,40,2),prop('sky-seat-cloth','flags',168,26,5),
 prop('river-boats','ropes',114,59,1),prop('ford-reeds','reeds',137,69),
 prop('reversing-wheel-splash','spray',125,80,3),prop('river-fireflies','firefly',130,73),
 prop('garden-awning','flags',153,64,6),prop('glass-reflections','prism',159,69,1),
 prop('orchard-lantern','lantern',166,85,2),prop('glass-seedlings','flowers',169,77,2),
 prop('wetland-rafts','ropes',116,109,2),prop('wetland-reed-bells','reeds',128,116,1),
 prop('mud-shrine-glow','firefly',129,124,1),prop('marsh-fogposts','threads',137,110,2),
 prop('white-step-shadows','steps',158,104,1),prop('caravan-fires','lantern',166,117,3),
 prop('salt-constellation','glyph',159,126,3),prop('white-mirage','prism',167,125,2),
 prop('ruins-approach','steps',20,101,2),prop('maze-compass','disc',30,113,1),
 prop('ruins-shadow-ribbon','threads',46,109,3),prop('black-pulses','glyph',64,115,4),
 prop('echo-arch-bells','bell',74,110,3),prop('sky-ruins-windsock','flags',64,94,7),
 prop('drowned-lamps','lantern',93,115,4),prop('sunken-watermirror','spray',101,119,4)
];
export const JOURNEY_SCENIC_BEATS=[
 {id:'canyon-gauge',x:119,y:25,r:3,scene:'journey-scenic-near'},
 {id:'canyon-release',x:141,y:42,r:4,scene:'journey-scenic-wide'},
 {id:'bell-steps',x:158,y:22,r:3,scene:'journey-scenic-near'},
 {id:'rain-pier',x:118,y:59,r:3,scene:'journey-scenic-near'},
 {id:'river-ford',x:136,y:71,r:4,scene:'journey-scenic-wide'},
 {id:'orchard-threshold',x:166,y:84,r:3,scene:'journey-scenic-detail'},
 {id:'reed-school',x:118,y:105,r:3,scene:'journey-scenic-near'},
 {id:'marsh-shrine',x:129,y:123,r:4,scene:'journey-scenic-wide'},
 {id:'white-colonnade',x:155,y:108,r:4,scene:'journey-scenic-near'},
 {id:'white-horizon',x:166,y:127,r:3,scene:'journey-scenic-wide'},
 {id:'ruins-stair',x:48,y:99,r:3,scene:'journey-scenic-near'},
 {id:'drowned-bell',x:103,y:109,r:3,scene:'journey-scenic-near'}
];
export const JOURNEY_SCENIC_LANES=[
 {id:'canyon-walk',x1:120,x2:147,y1:30,y2:45},
 {id:'riverbank-walk',x1:117,x2:136,y1:75,y2:96},
 {id:'white-crossing',x1:148,x2:171,y1:110,y2:130},
 {id:'black-passage',x1:48,x2:76,y1:103,y2:121}
];
export const JOURNEY_SCENIC_VISTAS=[
 {id:'scenic-steppe-sky',x:36,y:38,radius:4,title:'円い草原のまんなか',sub:'道の曲線に沿って風が回る。遠い人影も、この場所では小さな旅人だ。',kind:'steppe'},
 {id:'scenic-waterline',x:55,y:19,radius:4,title:'水の高さにあった空',sub:'昔は波の下だった石の線が、今は街道の彼方まで続く。',kind:'geometric'},
 {id:'scenic-river-twist',x:126,y:84,radius:4,title:'曲がってゆく河の道',sub:'石の間を通った水は、遠くでまた人の暮らしに出会う。',kind:'flood'},
 {id:'scenic-glass-orchard',x:166,y:84,radius:4,title:'小さな温室の向こうの都市',sub:'人工の柱の陰に、木々が別の速さで成長している。',kind:'glass-city'},
 {id:'scenic-reed-school',x:118,y:105,radius:4,title:'葦原の学び舎から',sub:'水に揺れた道も、子供たちの地図の中ではずっと続いている。',kind:'reeds'},
 {id:'scenic-basin-pillars',x:155,y:108,radius:4,title:'白い柱列の終わり',sub:'昔は見えなかった石の足元を、荷車と旅人が横切る。',kind:'white'}
];
// Landmarks are authored regions, not one-frame positional triggers.
// Enter before the exact focal tile, and allow extra space on exit so walking
// backwards over the border cannot repeatedly flip the camera.
export function journeyScenicScene(hero,acceptedScene=null){
 for(const b of JOURNEY_SCENIC_BEATS){
  const radius=b.r+(acceptedScene===b.scene?4:2);
  if(Math.hypot(hero.px-b.x,hero.py-b.y)<=radius)return b.scene;
 }
 return null;
}
export function scenicLaneAt(hero){
 return JOURNEY_SCENIC_LANES.find(a=>hero.px>=a.x1&&hero.px<=a.x2&&hero.py>=a.y1&&hero.py<=a.y2)||null;
}
// Subtle journey-only lead for long road walks. At rest, the original static camera wins.
export function easeScenicRoadGlide(camera,hero,path,dt,viewport,world){
 if(!scenicLaneAt(hero)||!path?.length||path.length<5)return camera;
 const next=path[0],dx=next.x-hero.px,dy=next.y-hero.py,d=Math.hypot(dx,dy)||1;
 const hx=(hero.px+.5)*world.tile,hy=(hero.py+.5)*world.tile;
 const leadX=hx+dx/d*world.tile*.55,leadY=hy+dy/d*world.tile*.55;
 const factor=1-Math.exp(-Math.min(Math.max(0,dt),.12)*1.65);
 const desired={x:camera.x+(leadX-camera.x)*factor,y:camera.y+(leadY-camera.y)*factor};
 return limitScenicCamera(desired,{x:hero.px,y:hero.py},viewport,world);
}
// Dependency stays tiny and pure so Node tests can exercise camera safety.
import {limitCamera as limitScenicCamera} from './camera-limits.js';
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c,points,col){c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
export function drawJourneyScenicDetails(c,view,time){
 const phase=(Number.isFinite(time)?time:0)*.001;
 for(const p of JOURNEY_SCENIC_PROPS){
  if(p.x<view.left-4||p.x>view.right+4||p.y<view.top-4||p.y>view.bottom+4)continue;
  const x=p.x*32,y=p.y*32,v=p.variant||0,sway=Math.sin(phase*1.1+p.x*.4+p.y*.3);
  if(p.kind==='flags'){
   rect(c,x+12,y+2,3,42,'#71868a');
   for(let j=0;j<3;j++){const yy=y+7+j*9,w=17-j*4;
    poly(c,[[x+15,yy],[x+15+w+sway*2,yy+sway],[x+16+w*.65,yy+5],[x+15,yy+5]],
      ['#c7b7ac','#b0c6bc','#e6d6b6','#b4abb7'][((v+j)%4)]);}
  }else if(p.kind==='bell'){
   rect(c,x+14,y+3,3,28,'#75878b');rect(c,x+3,y+8,25,3,'#d5d3be');
   for(let j=0;j<2;j++){const xx=x+9+j*13,cy=y+25+Math.sin(phase*1.2+j+v)*1.1;
    rect(c,xx,cy-6,7,9,'#bda88e');rect(c,xx+2,cy+3,3,3,'#617983');}
  }else if(p.kind==='lantern'){
   rect(c,x+14,y+3,3,31,'#687d7b');rect(c,x+9,y+10,13,4,'#8c8e82');
   rect(c,x+10,y+14,11,12,'#c9af91');
   rect(c,x+13,y+16,5,8,Math.sin(phase*1.4+v)>.1?'#fae5a6':'#f1d2a0');
   rect(c,x+11,y+29,12,2,'#5b7579');
  }else if(p.kind==='flowers'||p.kind==='seed'){
   for(let j=0;j<8;j++){const xx=x+3+(j*11)%37,yy=y+11+(j*13)%21;
    rect(c,xx,yy-5,2,8,'#779d88');
    rect(c,xx-2,yy-6,6,4,p.kind==='flowers'?(j%2?'#e9dbc1':'#c0c8d7'):'#c8bea0');}
   if(p.kind==='seed'&&Math.sin(phase*.6+v)>.3)rect(c,x+24+Math.sin(phase)*4,y+5,3,2,'#e7ddcc');
  }else if(p.kind==='reeds'){
   for(let j=0;j<8;j++){const xx=x+3+j*6,yy=y+12+j%3*4;
    rect(c,xx+sway*1.1,yy,2,23,'#86a69a');rect(c,xx-2+sway,yy-8,7,12,'#b6b89c');}
  }else if(p.kind==='firefly'){
   for(let j=0;j<5;j++){const xx=x+6+j*9,yy=y+6+(j%3)*9;
    const alpha=Math.sin(phase*1.2+j*1.4+v)>.2?'#f6e5b2':'#b1c4b7';
    rect(c,xx+sway*2,yy+Math.sin(phase+j)*3,3,3,alpha);}
  }else if(p.kind==='spray'){
   for(let j=0;j<9;j++){const xx=x+j*5,yy=y+8+(j*7)%22;
    rect(c,xx+Math.sin(phase+j)*2,yy,7,1,j%2?'#d1e1d2':'#95c4bc');}
  }else if(p.kind==='ropes'){
   for(let j=0;j<4;j++){rect(c,x+4+j*8,y+12+j%2*8,23,2,'#a69e8b');}
   rect(c,x+10,y+10,3,27,'#788b86');
  }else if(p.kind==='steps'){
   for(let j=0;j<5;j++){rect(c,x+j*3,y+3+j*6,38-j*6,5,j%2?'#b5bbaa':'#d8d4c0');}
  }else if(p.kind==='glyph'||p.kind==='disc'){
   const cx=x+20,cy=y+20;
   c.save();c.lineWidth=2.5;c.strokeStyle=p.kind==='glyph'?'#89b0b1':'#c3bda6';c.beginPath();
   c.ellipse(cx,cy,17,12,0,0,Math.PI*2);c.stroke();
   if(v%2===0){rect(c,cx-2,cy-2,5,5,'#dae2cd');}
   else {rect(c,cx-13,cy,27,2,'#708c92');rect(c,cx,cy-10,2,21,'#9faeb0');}
   c.restore();
  }else if(p.kind==='threads'){
   for(let j=0;j<6;j++){const xx=x+3+j*9,yy=y+4+j%3*6;
    rect(c,xx,yy,2,38,'#9aa9a6');rect(c,xx-1+Math.sin(phase+j)*2,yy+8,7,3,'#c9bcb1');}
  }else if(p.kind==='prism'){
   for(let j=0;j<3;j++){const xx=x+3+j*15,h=19+j%2*11;
    poly(c,[[xx,y+32],[xx+8,y+32-h],[xx+15,y+32]],j%2?'#c6d6cf':'#a2babc');
    rect(c,xx+7,y+32-h,2,h*.75,'#e5e2ce');}
  }else if(p.kind==='kite'){
   poly(c,[[x+23,y+2+sway*2],[x+38,y+17],[x+23,y+28],[x+9,y+17]],'#d3c0b9');
   rect(c,x+23,y+14,2,35,'#d1d0c0');rect(c,x+17,y+44,13,2,'#9aafaa');
  }
 }
}
