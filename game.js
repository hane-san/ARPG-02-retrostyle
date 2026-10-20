import {W as TIDAL_W,H as TIDAL_H,TILE,ZONES as TIDAL_ZONES,SITES as TIDAL_SITES,NPCS as TIDAL_NPCS,BRIDGES as TIDAL_BRIDGES,START,makeWorld,findPath,nearestWalkable,avoidTransitions} from './world.js';
import {SILK_W,SILK_H,SILK_ZONES,SILK_SITES,SILK_NPCS,SILK_BRIDGES,makeSilkWorld,silkPath} from './silk-world.js';
import {drawSilkTile,drawSilkSite,SILK_PALETTE} from './silk-art.js';
import {SILK_TALK,SILK_ASIDES} from './silk-dialogue.js';
import {MUSIC_LIBRARY,createMusic} from './music.js';
import {createAudio} from './audio.js';
import {drawSrpgUnit} from './sprite-srpg.js';
import {limitCamera,easeEdgeCamera,smoothPanCamera,PAN_SENSITIVITY} from './camera-limits.js';
import {pickZoneTrack} from './zone-music.js';
import {TALK,SITE_ASIDES} from './dialogue-data.js';
import {makePrototypeWorld} from './prototype-world.js';
import {makeJourneyWorld,routeJourneyWalk} from './journey-world.js';
import {drawJourneyTile,drawJourneySite,drawJourneyAtmosphere,JOURNEY_PALETTE} from './journey-art.js';
import {createJourneyMusicDirector,pickJourneyTrack} from './journey-music.js';
import {createJourneyView} from './journey-view.js';
import {installJourneyUI} from './journey-ui.js';
import {createJourneyFoley} from './journey-foley.js';
import {resolveGameMode} from './game-mode.js';
import {createJourneyCamera,journeyCameraScene,easeJourneyCamera} from './journey-camera.js';

const $=id=>document.getElementById(id);
const stage=$('stage'),canvas=$('worldCanvas'),ctx=canvas.getContext('2d',{alpha:false});
const gameMode=resolveGameMode(window.location.search);
const JOURNEY_MODE=gameMode==='journey';
const PROTOTYPE_MODE=gameMode==='prototype';
const worlds={tidal:JOURNEY_MODE?null:PROTOTYPE_MODE?makePrototypeWorld():makeWorld(),silk:null,journey:JOURNEY_MODE?makeJourneyWorld():null};
let currentWorldId=JOURNEY_MODE?'journey':'tidal',world=worlds[currentWorldId];
const DISCOVERY_TOTAL=JOURNEY_MODE||PROTOTYPE_MODE?world.sites.length:TIDAL_SITES.length+SILK_SITES.length;
let W=world.w,H=world.h,ZONES=world.zones,SITES=world.sites,NPCS=world.npcs,BRIDGES=world.bridges;
const storage={
 getItem(k){try{return localStorage.getItem('tidal-atlas:'+k);}catch{return null;}},
 setItem(k,v){try{localStorage.setItem('tidal-atlas:'+k,v);}catch{}}
};
const music=createMusic(storage),sfx=JOURNEY_MODE?createJourneyFoley(storage):createAudio(storage);
const spawn=world.start||START;
const hero={x:spawn.x,y:spawn.y,px:spawn.x,py:spawn.y,face:'down',path:[],arrival:null,stride:0,moving:false};
const journeyCamera=JOURNEY_MODE?createJourneyCamera():null;
const camera={x:(spawn.x+.5)*TILE,y:(spawn.y+.5)*TILE,zoom:journeyCamera?.target||1.25};
const journeyMusic=JOURNEY_MODE?createJourneyMusicDirector():null;
const journeyView=JOURNEY_MODE?createJourneyView(stage,world):null;
let panTarget=null;
let screen={w:1,h:1,dpr:1},last=0,zoneId='',noticeTimer=0,dialogue=null;
const discovered=new Set(),cache=new Map(),CHUNK=16,MAX_CHUNKS=42;
const palette={'~':'#497d93','.':'#8d9f7c',',':'#cbbc96',f:'#567864','=':'#baa986','+':'#ae987a',s:'#98b0b0',n:'#576d88',p:'#b7a993','#':'#58605d',M:'#9eb88a',A:'#aa986e',R:'#7f9188',F:'#3e6559',G:'#73a49e',P:'#d1d4c5',C:'#77adb7',D:'#d2b78e',T:'#bc856d',Q:'#789e9f',B:'#496d78',K:'#424563',E:'#528eae'};
// The previous two worlds remain explicitly available; the grassland journey is the current entrance.
if(PROTOTYPE_MODE){
 $('worldTitle').textContent='潮環・小さな旅';
 $('atlasTitle').textContent='小さな旅の地図';
 document.querySelector('.brand small').textContent='TIDAL ATLAS · SMALL JOURNEY';
 document.querySelector('.discover small').textContent='PLACES TO FIND';
 document.querySelector('.map-hint').textContent='森と港の4つの場所を探す · タップで歩く';
 $('worldCanvas').setAttribute('aria-label','小さな旅。森と旧港の探索マップ');
 $('mapPanel').querySelector('p.secondary').textContent=
  '森と旧港をつなぐ橋を歩いて、4つの場所を探してみましょう。地図や地区名をタップすると、そこまで歩きます。';
 $('helpPanel').querySelector('.sheet p').textContent=
  'これは潮環群島の小さな探索プロトタイプです。森と港を歩き、気になる4つの建物を訪ねてみましょう。目的地のタップ・地図・ドラッグ・NPCとの会話は通常版と同じです。';
}
if(JOURNEY_MODE){
 document.body.classList.add('journey-mode');
 const style=document.createElement('link');style.rel='stylesheet';style.href='./journey.css';document.head.append(style);
 $('worldTitle').textContent='小さく壮大な旅';
 $('atlasTitle').textContent='風と湖をめぐる地図';
 document.querySelector('.brand small').textContent='TIDAL ATLAS · A SMALL, VAST JOURNEY';
 document.querySelector('.discover small').textContent='PLACES ALONG THE WAY';
 document.querySelector('.map-hint').textContent='';
 $('worldCanvas').setAttribute('aria-label','中央アジアの地形に着想した、草原と湖を歩く試遊マップ');
 $('mapPanel').querySelector('p.secondary').textContent=
  '岸の向こうへも、歩いて行けます。';
 $('helpPanel').querySelector('.sheet p').textContent=
  '白い橋から円い草原へ。湖岸から塩原や石の峠へ。道を選ぶ順番は自由です。遠くを眺めたくなったら、岸や高台のそばで少し立ち止まってみてください。';
 const helpParagraphs=$('helpPanel').querySelectorAll('.sheet > p');
 helpParagraphs[1].textContent='地面や地図で行き先を選ぶと、主人公が道を探して歩きます。途中でも行き先を変えられます。建物や人を選ぶと、そのそばまで歩いて向かいます。';
 helpParagraphs[2].textContent='村では近くに、草原や湖では遠くへ。場所に合わせて景色がゆっくり広がります。指で見回し、「自分へ」で主人公のところに戻ります。立ち止まれば、＋／−で自分でも画角を選べます。会話は続きを読んでも、景色を選んでそのまま歩き出しても大丈夫です。';
 helpParagraphs[3].textContent='訪れた場所の記録は、この画面を開いているあいだだけ残ります。';
 $('musicPanel').querySelector('p.secondary').textContent=
  '土地ごとの曲が流れます。ここでは68曲から、好きな一曲を選ぶこともできます。';
 installJourneyUI();
}
const modeNav=document.createElement('p');
modeNav.className='secondary mode-nav';
for(const [mode,href,label] of [
 ['normal','./?mode=classic','以前の広い世界を歩く'],
 ['prototype','./?prototype=1','小さな旅を試す（台場ミニ版）'],
 ['journey','./?journey=1','草原と湖の旅を試す（新マップ）']
]){
 if(mode===(JOURNEY_MODE?'journey':PROTOTYPE_MODE?'prototype':'normal'))continue;
 if(modeNav.children.length)modeNav.append(document.createElement('br'));
 const link=document.createElement('a');link.href=href;link.textContent=label;link.style.color='#fff0b1';modeNav.append(link);
}
$('helpPanel').querySelector('.sheet').append(modeNav);
const clamp=(a,b,c)=>Math.max(b,Math.min(c,a));
function confineCamera(x=camera.x,y=camera.y,margin=.65){
 const bounded=limitCamera({x,y},{x:hero.px,y:hero.py},
  {width:screen.w,height:screen.h,zoom:camera.zoom},{width:W*TILE,height:H*TILE,tile:TILE},margin);
 camera.x=bounded.x;camera.y=bounded.y;
}
function centerCamera(){panTarget=null;confineCamera((hero.px+.5)*TILE,(hero.py+.5)*TILE);}
const hash=(x,y)=>{let n=Math.imul(x+23,374761393)+Math.imul(y+51,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
function line(c,points,color,width=2){
 c.strokeStyle=color;c.lineWidth=width;c.beginPath();
 points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
}
function toast(message){
 // Narrow screens: drop the notice below the location card instead of covering it.
 const label=document.querySelector('.zone-label'),below=!JOURNEY_MODE&&label?.parentElement===stage&&stage.clientWidth<=560;
 $('toast').style.top=below?(label.offsetTop+label.offsetHeight+8)+'px':'';
 $('toast').textContent=message;$('toast').classList.add('show');
 clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('toast').classList.remove('show'),2300);
}
function resize(){
 const r=stage.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 screen={w:r.width,h:r.height,dpr};
 canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));
 confineCamera();
 if(JOURNEY_MODE&&dialogue)placeJourneyDialogue();
}
const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
observer?.observe(stage);window.addEventListener('resize',resize);resize();

function paintTile(c,x,y,t){
 if(currentWorldId==='journey'){drawJourneyTile(c,x,y,t,world);return;}
 if(currentWorldId==='silk'){drawSilkTile(c,x,y,t);return;}
 const px=x*TILE,py=y*TILE,n=hash(x,y),n2=hash(y,x);
 rect(c,px,py,32,32,palette[t]||'#7b8c79');
 if(t==='~'){
  rect(c,px,py+23,32,1,'#376e85');
  rect(c,px+Math.floor(n*16),py+9,12,1,'#8eb5b5');
  rect(c,px+Math.floor(n2*18),py+19,8,1,'#73a9b6');
  if(n>.82)rect(c,px+14,py+28,6,1,'#b3c9c2');
 }else if(t===','){
  rect(c,px+Math.floor(n*25),py+Math.floor(n2*25),3,2,'#e0d2aa');
  if(n>.74)rect(c,px+16,py+19,6,2,'#b3a47e');
 }else if(t==='.'||t==='f'){
  for(let i=0;i<4;i++)
   rect(c,px+Math.floor(hash(x+i,y)*27),py+Math.floor(hash(x,y+i)*27),2,3,t==='f'?'#3b6952':'#748e65');
  if(t==='f'){
   rect(c,px+13,py+18,5,13,'#735c49');
   rect(c,px+4,py+8,25,15,'#294f42');
   rect(c,px+8,py+3,19,14,'#3d6f55');
   rect(c,px+14,py+5,10,6,'#72966d');
  }else if(n>.86){
   rect(c,px+12,py+17,2,8,'#446d49');
   rect(c,px+7,py+15,10,7,'#e6d6b5');
   rect(c,px+10,py+12,5,4,'#f8e6c5');
  }
 }else if(t==='='||t==='p'){
  rect(c,px,py,32,1,t==='='?'#8f8067':'#8a8a80');
  rect(c,px,py+16,32,1,'#988974');
  rect(c,px+(x%2)*14,py,1,16,'#9e8f77');
  rect(c,px+((x+1)%2)*13,py+16,1,16,'#a49a82');
  if(n>.91)rect(c,px+12,py+6,5,2,'#e0c8a0');
 }else if(t==='s'||t==='n'){
  rect(c,px,py+31,32,1,t==='n'?'#3a576b':'#738d98');
  rect(c,px+31,py,1,32,t==='n'?'#3b5a72':'#76969e');
  if((x+y)%4===0)rect(c,px+11,py+12,10,1,t==='n'?'#659bb7':'#d4d9c7');
  if(t==='n'&&n>.72){
   rect(c,px+5,py+5,4,4,'#3b7e82');rect(c,px+6,py+6,2,2,'#6fe4cd');
  }
 }else if(t==='+'){
  rect(c,px,py,32,32,'#9b8b71');
  for(let j=0;j<32;j+=8)rect(c,px,py+j,32,1,'#d5bc8e');
  if((x+y)%3===0)rect(c,px+7,py+4,18,2,'#c6c1aa');
 }
 // Fine-grained scene changes: each coherent region has its own architecture,
 // planting and street furniture. All overlays are decorative, not obstacles.
 if(t==='M'){
  rect(c,px+3,py+3,26,26,'#abc69830');
  for(let i=0;i<4;i++){
   const fx=px+6+Math.floor(hash(x+i*7,y)*20),fy=py+5+Math.floor(hash(x,y+i*7)*20);
   rect(c,fx,fy,2,8,'#4b846b');rect(c,fx-3,fy,7,4,i%2?'#f0d5ae':'#f3bfc6');rect(c,fx-1,fy+1,2,2,'#ffe4ad');
  }
 }else if(t==='A'||t==='F'){
  const dark=t==='F';
  rect(c,px+13,py+17,6,14,dark?'#3c544b':'#785744');
  rect(c,px+4,py+9,25,15,dark?'#204d4b':'#a25e46');
  rect(c,px+8,py+3,18,15,dark?'#356f5d':'#d49252');
  rect(c,px+13,py+5,9,5,dark?'#72a78a':'#efc07a');
 }else if(t==='R'){
  rect(c,px+2,py+14,28,16,'#67786f');rect(c,px+5,py+16,22,12,'#a6aaa0');
  rect(c,px+8,py+2,5,21,'#c1bfad');rect(c,px+19,py+6,5,18,'#b3b4a4');
  rect(c,px+5,py+1,12,5,'#d8d0bc');rect(c,px+16,py+4,11,5,'#a6b7a7');
  rect(c,px+12,py+26,8,4,'#567e69');
 }else if(t==='G'){
  rect(c,px+2,py+3,28,26,'#b9d4c777');
  rect(c,px+3,py+4,26,2,'#e1eee0');rect(c,px+4,py+24,24,2,'#6f8c9a');
  rect(c,px+12,py+8,9,16,'#428476');rect(c,px+7,py+12,18,8,'#5fa28a');
  rect(c,px+15,py+11,3,3,'#cae2bc');
 }else if(t==='P'){
  for(let i=0;i<3;i++)rect(c,px,py+i*11,32,1,'#a4ada8');
  rect(c,px+(x%2)*16,py,1,32,'#a8b7b4');
  if(n>.56){
   c.strokeStyle='#80b0ae';c.lineWidth=2;c.beginPath();c.arc(px+16,py+16,9,0,Math.PI*2);c.stroke();
   rect(c,px+13,py+12,6,9,'#78bcc7');
  }
 }else if(t==='C'){
  rect(c,px+2,py+3,28,25,'#a8cdd2');rect(c,px+4,py+5,24,21,'#5a9eaf');
  rect(c,px+3,py+27,26,3,'#d5e8de');
  rect(c,px+7,py+11,12,1,'#d8eee2');rect(c,px+13,py+19,10,1,'#98c8c7');
 }else if(t==='D'){
  for(let i=0;i<4;i++)rect(c,px+(i*9+x%3)%29,py+(i*11+y%7)%29,7,2,'#e9d1a6');
  if(n>.65){rect(c,px+5,py+12,23,4,'#796f5e');rect(c,px+9,py+16,2,10,'#6b6558');rect(c,px+22,py+16,2,10,'#6b6558');}
 }else if(t==='T'){
  for(let i=0;i<3;i++)rect(c,px,py+i*10,32,1,'#d6aa86');
  rect(c,px+16,py+3,2,7,'#7d625d');rect(c,px+9,py+14,2,6,'#846b5e');
  if(n>.74){rect(c,px+12,py+20,8,9,'#708370');rect(c,px+13,py+18,6,3,'#6d9776');}
 }else if(t==='Q'){
  rect(c,px+2,py+2,28,28,'#8eada1');
  for(let i=0;i<4;i++)rect(c,px+(i*8),py+14,7,2,'#c9ccac');
  rect(c,px+14,py,4,32,'#5f8c9c');rect(c,px+15,py+4,2,10,'#c5e2d5');
 }else if(t==='B'){
  rect(c,px+6,py+12,20,15,'#285966');rect(c,px+12,py+9,9,20,'#296f70');
  rect(c,px+4,py+16,9,6,'#419c9d');
  rect(c,px+13,py+7,7,9,'#75e2cb');rect(c,px+19,py+19,6,7,'#8ccad3');
  rect(c,px+4,py+10,2,2,'#d4ebbf');
 }else if(t==='K'){
  for(let i=0;i<3;i++)rect(c,px,py+i*12,32,1,'#547086');
  rect(c,px+15,py,2,32,'#7594a7');rect(c,px+2,py+3,7,2,'#7f71af');
  if(n>.66){rect(c,px+25,py+7,4,14,'#e5a5cb');rect(c,px+24,py+6,6,2,'#afd6d0');}
 }else if(t==='E'){
  rect(c,px+1,py+1,30,30,'#386b87');
  rect(c,px+4,py+4,24,1,'#92c9d1');rect(c,px+4,py+27,24,1,'#92c9d1');
  rect(c,px+15,py+5,2,22,'#72c8ce');
  rect(c,px+10,py+15,12,2,'#8be0cc');
  rect(c,px+14,py+14,4,4,'#d2eac5');
 }
}
function chunk(cx,cy){
 const key=cx+','+cy;
 if(cache.has(key)){const value=cache.get(key);cache.delete(key);cache.set(key,value);return value;}
 const cvs=document.createElement('canvas');cvs.width=CHUNK*TILE;cvs.height=CHUNK*TILE;
 const c=cvs.getContext('2d',{alpha:false});c.imageSmoothingEnabled=false;
 c.translate(-cx*CHUNK*TILE,-cy*CHUNK*TILE);
 for(let y=cy*CHUNK;y<Math.min(H,(cy+1)*CHUNK);y++)
  for(let x=cx*CHUNK;x<Math.min(W,(cx+1)*CHUNK);x++)paintTile(c,x,y,world.tileAt(x,y));
 cache.set(key,cvs);if(cache.size>MAX_CHUNKS)cache.delete(cache.keys().next().value);
 return cvs;
}
function bridgeArt(c,b,time){
 c.save();
 if(b.id==='starwind-near'){
  // A small luminous wooden footbridge across the starting garden's stream.
  const x=b.x1*TILE,y=b.y1*TILE,w=(b.x2-b.x1+1)*TILE,h=(b.y2-b.y1+1)*TILE;
  rect(c,x,y-4,w,5,'#78999b');rect(c,x,y+h-1,w,5,'#78999b');
  for(let i=0;i<4;i++){const xx=x+8+i*37;rect(c,xx,y-9,5,13,'#e1c6a0');rect(c,xx,y+h-2,5,12,'#e1c6a0');}
  line(c,[[x,y-4],[x+w,y-4]],'#d3ece1',2);
  line(c,[[x,y+h+4],[x+w,y+h+4]],'#d3ece1',2);
  c.restore();return;
 }
 const x=b.x1*TILE,y=b.y1*TILE,w=(b.x2-b.x1+1)*TILE,h=(b.y2-b.y1+1)*TILE;
 if(b.axis==='h'){
  rect(c,x,y-7,w,6,'#425e6c');rect(c,x,y-6,w,2,'#c6c4aa');
  rect(c,x,y+h,w,6,'#425e6c');rect(c,x,y+h+1,w,2,'#c6c4aa');
  for(let px=x+10;px<x+w;px+=TILE*3){
   rect(c,px,y-10,5,13,'#5e6773');rect(c,px,y+h-3,5,13,'#5e6773');
   rect(c,px+1,y-13,3,4,'#ffe8ad');
  }
  const mid=x+w*.5;line(c,[[mid-80,y-7],[mid-25,y-90],[mid+25,y-90],[mid+80,y-7]],'#f6dcb3',3);
  line(c,[[mid-80,y+h+6],[mid-25,y+h+90],[mid+25,y+h+90],[mid+80,y+h+6]],'#688d95',2);
 }else{
  rect(c,x-7,y,6,h,'#466477');rect(c,x-6,y,2,h,'#ddd3b0');
  rect(c,x+w,y,6,h,'#466477');rect(c,x+w+1,y,2,h,'#ddd3b0');
  for(let py=y+8;py<y+h;py+=TILE*3){
   rect(c,x-10,py,13,5,'#657481');rect(c,x+w-3,py,13,5,'#657481');
   rect(c,x-12,py+1,4,3,'#f8d7a6');
  }
 }
 c.restore();
}
function drawSite(c,s,t){
 if(currentWorldId==='journey'){drawJourneySite(c,s,t);return;}
 if(currentWorldId==='silk'){drawSilkSite(c,s,t);return;}
 const x=s.x*TILE,y=s.y*TILE,w=s.w*TILE,h=s.h*TILE,mid=x+w/2;
 const night=s.kind==='arcology'||s.kind==='observatory'||s.kind==='wheel';
 c.save();
 rect(c,x+12,y+h-14,w-24,19,'#203b4b5c');
 if(s.kind==='castle'||s.kind==='oldport'){
  rect(c,x+10,y+34,w-20,h-55,'#9a9e93');
  rect(c,x+20,y+45,w-40,h-68,'#d6d1af');
  for(let dx=10;dx<w-15;dx+=38){
   rect(c,x+dx,y+26,23,16,'#a7b2a6');rect(c,x+dx+4,y+20,15,10,'#c7cbb7');
   rect(c,x+dx+10,y+65,5,15,'#496574');
  }
  rect(c,x+20,y+h-62,w-40,27,'#a6aca0');rect(c,mid-13,y+h-74,26,65,'#415662');
  rect(c,mid-9,y+h-68,18,58,'#344750');
  rect(c,mid-6,y+h-68,12,12,'#f0c9a5');
  for(let dx=42;dx<w-30;dx+=75)rect(c,x+dx,y+12,21,11,'#d7d7bf');
 }else if(s.kind==='windmill'){
  rect(c,x+55,y+105,w-110,h-123,'#e5d9b6');
  line(c,[[x+46,y+112],[mid,y+35],[x+w-46,y+112]],'#775d53',18);
  rect(c,mid-13,y+35,26,h-68,'#cabd9d');
  c.save();c.translate(mid,y+106);c.rotate(t*.00028);
  for(let j=0;j<4;j++){c.rotate(Math.PI/2);rect(c,-7,-114,14,100,'#f4ead2');rect(c,-3,-109,6,85,'#839596');}
  c.restore();
  rect(c,mid-13,y+h-52,26,42,'#4b5d5f');
 }else if(s.kind==='shrine'){
  rect(c,x+40,y+60,w-80,h-80,'#e6d8b4');
  rect(c,x+30,y+42,w-60,21,'#6f5457');
  line(c,[[x+20,y+45],[mid,y+8],[x+w-20,y+45]],'#ad7863',13);
  rect(c,mid-17,y+h-89,34,70,'#4b4748');
  rect(c,x+55,y+h-60,12,45,'#e8c8a3');
  rect(c,x+w-68,y+h-60,12,45,'#e8c8a3');
 }else if(s.kind==='museum'){
  rect(c,x+22,y+90,w-44,h-112,'#c2d5d5');rect(c,x+30,y+105,w-60,h-145,'#8ba8af');
  rect(c,x+13,y+48,w-26,35,'#e3e8d9');
  line(c,[[x+13,y+48],[mid,y+13],[x+w-13,y+48]],'#e9f0e6',17);
  for(let i=0;i<5;i++)rect(c,x+50+i*66,y+118,25,h-183,'#587986');
  rect(c,mid-24,y+h-92,48,74,'#355768');
 }else if(s.kind==='spire'){
  rect(c,mid-62,y+90,124,h-112,'#94adb5');
  rect(c,mid-47,y+67,94,h-100,'#dce5dc');
  line(c,[[mid-48,y+77],[mid,y-55],[mid+48,y+77]],'#b8d9da',25);
  rect(c,mid-12,y-81,24,53,'#f4eee1');
  for(let py=y+112;py<y+h-40;py+=30){rect(c,mid-40,py,80,9,'#5a8e9a');rect(c,mid-33,py+2,66,3,'#d5e8e4');}
  rect(c,mid-21,y+h-70,42,54,'#3d6073');
 }else if(s.kind==='exhibition'){
  rect(c,x+24,y+83,w-48,h-110,'#bdcac9');
  for(let i=0;i<5;i++){
   const xx=x+15+i*92;
   line(c,[[xx,y+78],[xx+45,y+7+i%2*15],[xx+92,y+78]],'#f3f0df',22);
   rect(c,xx+28,y+92,55,h-148,'#a3bbc2');
  }
  rect(c,mid-25,y+h-76,50,55,'#446779');
 }else if(s.kind==='market'){
  rect(c,x+22,y+65,w-44,h-88,'#98856f');
  for(let dx=18;dx<w-48;dx+=76){
   rect(c,x+dx,y+105,60,h-143,'#b8a589');
   line(c,[[x+dx-7,y+106],[x+dx+30,y+57],[x+dx+66,y+106]],(dx/76)%2<1?'#b35c59':'#e8ba79',16);
   rect(c,x+dx+8,y+h-82,44,29,'#574b47');rect(c,x+dx+10,y+h-103,40,11,'#ebbf75');
  }
  rect(c,mid-15,y+h-64,30,38,'#614743');
 }else if(s.kind==='dock'){
  rect(c,x+22,y+58,w-44,h-82,'#796f61');
  rect(c,x+36,y+90,w-72,h-120,'#c4b28e');
  for(let dx=40;dx<w-28;dx+=34)rect(c,x+dx,y+90,2,h-121,'#9f8c72');
  line(c,[[x+60,y+85],[x+60,y-35]],'#f3dec1',4);
  line(c,[[x+61,y-29],[x+143,y+64],[x+61,y+64]],'#e9e5d5',5);
  rect(c,mid-15,y+h-58,30,37,'#655244');
 }else if(s.kind==='wheel'){
  const radius=Math.min(w,h)*.38,cx=mid,cy=y+h*.42;
  c.strokeStyle='#7dd9db';c.lineWidth=11;c.beginPath();c.arc(cx,cy,radius,0,Math.PI*2);c.stroke();
  c.strokeStyle='#325f76';c.lineWidth=4;c.beginPath();c.arc(cx,cy,radius-9,0,Math.PI*2);c.stroke();
  for(let a=0;a<12;a++){
   const q=a*Math.PI/6;t=Number(t)||0;
   line(c,[[cx,cy],[cx+Math.cos(q)*radius,cy+Math.sin(q)*radius]],'#bbd8d5',2);
   rect(c,cx+Math.cos(q)*radius-6,cy+Math.sin(q)*radius-4,12,9,a%2?'#f9cd99':'#80b9cb');
  }
  line(c,[[cx,cy],[cx-90,y+h-28]],'#a3bcc3',12);line(c,[[cx,cy],[cx+90,y+h-28]],'#a3bcc3',12);
  rect(c,cx-64,y+h-43,128,24,'#456c81');
 }else if(s.kind==='arcology'){
  rect(c,x+22,y+72,w-44,h-100,'#52667a');
  for(let i=0;i<5;i++){
   const bx=x+15+i*79,bh=h-91-(i%3)*44;
   rect(c,bx,y+h-bh-33,61,bh,'#45677d');
   rect(c,bx+9,y+h-bh-43,43,22,'#8bc4c7');
   for(let yy=y+h-bh+12;yy<y+h-47;yy+=29)for(let xx=bx+8;xx<bx+58;xx+=19)rect(c,xx,yy,10,8,hash(xx,yy)>.35?'#74d6d9':'#a4b2bd');
   rect(c,bx+7,y+h-bh-48,48,8,'#67b9aa');
  }
  rect(c,mid-26,y+h-98,52,80,'#264a63');
 }else if(s.kind==='observatory'){
  rect(c,x+16,y+78,w-32,h-105,'#607e8e');
  c.fillStyle='#adcbd4';c.beginPath();c.ellipse(mid,y+76,w*.38,75,0,Math.PI,2*Math.PI);c.fill();
  line(c,[[mid-61,y+71],[mid+56,y+71]],'#dae9df',13);
  rect(c,mid-21,y+h-93,42,66,'#254960');
  for(let i=0;i<8;i++)rect(c,x+32+i*43,y+h-133,17,14,'#8bced8');
 }else{
  rect(c,x+25,y+70,w-50,h-90,night?'#506a82':'#a7aa93');
  rect(c,x+30,y+52,w-60,36,'#cbd0c0');rect(c,mid-25,y+h-70,50,53,'#375366');
 }
 // Shared entry marker: makes a faraway building recognisably interactive.
 const ex=s.entrance.x*TILE+16,ey=s.entrance.y*TILE+16;
 c.fillStyle='#fff2bf';c.beginPath();c.arc(ex,ey,6+Math.sin(performance.now()*.003)*2,0,Math.PI*2);c.fill();
 c.strokeStyle='#496d75';c.lineWidth=2;c.stroke();
 c.font='bold 13px system-ui';c.textAlign='center';c.lineWidth=4;
 c.strokeStyle='#21394a';c.strokeText(s.name,mid,y-21);
 c.fillStyle='#fff5d8';c.fillText(s.name,mid,y-21);
 c.restore();
}
function drawNpc(c,n,t){
 // Draw an approximately full 32×32 tile actor, like the SRPG unit sprite.
 // NPCs are visibly distinct through costume colour and silhouette.
 const x=n.x*TILE,y=n.y*TILE;
 const bob=Math.sin(t*.002+(n.x%6))*.65;
 c.save();c.translate(x,y-bob);
 rect(c,4,28,25,3,'#173a4860');
 rect(c,8,24,7,6,'#2b3944');rect(c,19,24,7,6,'#2b3944');
 rect(c,6,13,22,14,'#273944');
 rect(c,8,14,18,11,n.color);
 rect(c,11,3,13,12,'#344349');
 rect(c,12,7,11,8,'#f0d5a9');
 rect(c,10,2,17,6,'#51494b');
 rect(c,6,14,4,12,'#baaa91');rect(c,25,14,4,12,'#baaa91');
 rect(c,14,11,2,2,'#2e3a41');rect(c,21,11,2,2,'#2e3a41');
 rect(c,9,16,3,8,'#ffffff50');
 c.font='bold 17px system-ui';c.textAlign='center';c.lineWidth=3;
 c.strokeStyle='#203747';c.strokeText('…',x*0+16,-4+Math.sin(t*.002)*2);
 c.fillStyle='#ffecb6';c.fillText('…',16,-4+Math.sin(t*.002)*2);
 c.restore();
}

function drawHero(c,t){
 const bob=hero.moving?Math.abs(Math.sin(hero.stride*9))*2:Math.sin(t*.002)*.4;
 c.save();c.translate(0,-bob);
 drawSrpgUnit(c,{x:hero.px,y:hero.py,team:'ally',acted:false,type:'sword'});
 // Light-blue travel scarf distinguishes the sole playable explorer.
 const x=hero.px*TILE,y=hero.py*TILE;
 rect(c,x+8,y+13,15,3,'#b8d9dc');rect(c,x+7,y+16,5,7,'#7dbac5');
 c.restore();
}
function drawDestination(c,t){
 if(hero.path.length<=1)return;
 const p=hero.path[hero.path.length-1],x=(p.x+.5)*TILE,y=(p.y+.5)*TILE;
 c.save();c.strokeStyle='#fff4c2';c.lineWidth=3;c.globalAlpha=.65+.25*Math.sin(t*.005);
 c.beginPath();c.arc(x,y,11+Math.sin(t*.005)*2,0,Math.PI*2);c.stroke();
 c.fillStyle='#fff2ca';c.beginPath();c.moveTo(x,y-15);c.lineTo(x-4,y-22);c.lineTo(x+4,y-22);c.closePath();c.fill();c.restore();
}
function paint(t){
 ctx.setTransform(screen.dpr,0,0,screen.dpr,0,0);
 rect(ctx,0,0,screen.w,screen.h,'#46788f');
 ctx.save();ctx.translate(screen.w/2,screen.h/2);ctx.scale(camera.zoom,camera.zoom);
 ctx.translate(-camera.x,-camera.y);ctx.imageSmoothingEnabled=false;
 const left=Math.max(0,Math.floor((camera.x-screen.w/(2*camera.zoom))/TILE)-3),
  top=Math.max(0,Math.floor((camera.y-screen.h/(2*camera.zoom))/TILE)-3),
  right=Math.min(W-1,Math.ceil((camera.x+screen.w/(2*camera.zoom))/TILE)+3),
  bottom=Math.min(H-1,Math.ceil((camera.y+screen.h/(2*camera.zoom))/TILE)+3);
 for(let cy=Math.floor(top/CHUNK);cy<=Math.floor(bottom/CHUNK);cy++)
  for(let cx=Math.floor(left/CHUNK);cx<=Math.floor(right/CHUNK);cx++)
   ctx.drawImage(chunk(cx,cy),cx*CHUNK*TILE,cy*CHUNK*TILE);
 for(const b of BRIDGES)
  if(b.x1<=right&&b.x2>=left&&b.y1<=bottom&&b.y2>=top)bridgeArt(ctx,b,t);
 if(JOURNEY_MODE)drawJourneyAtmosphere(ctx,{left,right,top,bottom},t);
 // Landmarks marking the portals at the far end of each bridge.
 for(const portal of world.transitions||[]){
  if(portal.x<left||portal.x>right||portal.y<top||portal.y>bottom)continue;
  const px=(portal.x+.5)*TILE,py=(portal.y+.5)*TILE;
  const glow=6+2*Math.sin(t*.003);
  ctx.save();ctx.fillStyle='#d8fff1a0';ctx.beginPath();ctx.arc(px,py,glow,0,Math.PI*2);ctx.fill();
  ctx.textAlign='center';ctx.font='bold 13px system-ui';ctx.lineWidth=3;ctx.strokeStyle='#344d57';
  const label=currentWorldId==='tidal'?'星風回廊 ⇢':'⇠ 潮環群島';
  ctx.strokeText(label,px,py-24);ctx.fillStyle='#fff0cd';ctx.fillText(label,px,py-24);ctx.restore();
 }
 // Detail props add rhythm without showing tactical grid lines.
 for(let y=top;y<=bottom;y+=6)for(let x=left;x<=right;x+=7){
  if(world.tileAt(x,y)!=='~')continue;
  const px=x*TILE+hash(x,y)*21,py=y*TILE+hash(y,x)*17;
  rect(ctx,px,py+Math.sin(t*.0008+x)*3,24,2,'#98c2c3a0');
 }
 const objects=[];
 for(const s of SITES)if(s.x<=right+3&&s.x+s.w>=left-3&&s.y<=bottom+3&&s.y+s.h>=top-3)
  objects.push({y:s.y+s.h,render:()=>drawSite(ctx,s,t)});
 for(const n of NPCS)if(n.x>=left-1&&n.x<=right+1&&n.y>=top-1&&n.y<=bottom+1)
  objects.push({y:n.y+.5,render:()=>drawNpc(ctx,n,t)});
 objects.push({y:hero.py+.7,render:()=>drawHero(ctx,t)});
 objects.sort((a,b)=>a.y-b.y);for(const obj of objects)obj.render();
 drawDestination(ctx,t);
 ctx.restore();
 const vignette=ctx.createRadialGradient(screen.w*.5,screen.h*.48,screen.h*.2,screen.w*.5,screen.h*.5,Math.max(screen.w,screen.h)*.75);
 vignette.addColorStop(0,'#0c233000');vignette.addColorStop(1,'#10203355');
 ctx.fillStyle=vignette;ctx.fillRect(0,0,screen.w,screen.h);
}
function screenToWorld(clientX,clientY){
 const r=canvas.getBoundingClientRect(),sx=clientX-r.left,sy=clientY-r.top;
 return {x:Math.floor((camera.x+(sx-screen.w/2)/camera.zoom)/TILE),
  y:Math.floor((camera.y+(sy-screen.h/2)/camera.zoom)/TILE)};
}
function updateZone(){
 const z=world.zoneAt(hero.x,hero.y);
 if(z.id===zoneId)return;
 zoneId=z.id;$('zoneName').textContent=z.name;$('zoneSub').textContent=z.sub;
 // Randomly pick among songs matching the atmosphere; never immediately repeat.
 if(!JOURNEY_MODE){
  const nextSong=pickZoneTrack(z.id,$('trackSelect').value);
  $('trackSelect').value=nextSong;applyTrack();
 }
 if(!JOURNEY_MODE)toast(z.name+' — '+z.sub);
}
function updateDiscoveries(){
 $('discovered').textContent=discovered.size+' / '+DISCOVERY_TOTAL;
}
function updateJourneyMusic(now){
 if(!journeyMusic)return;
 const accepted=journeyMusic.update(world.zoneAt(hero.x,hero.y).id,now);
 if(accepted){$('trackSelect').value=pickJourneyTrack(accepted,$('trackSelect').value);applyTrack();}
}
function switchWorld(id,spawn){
 if(JOURNEY_MODE||PROTOTYPE_MODE)return;
 if(id===currentWorldId)return;
 if(id!=='tidal'&&id!=='silk')return;
 if(id==='silk'&&!worlds.silk)worlds.silk=makeSilkWorld();
 const next=worlds[id];if(!next.walkable(spawn.x,spawn.y))throw Error('Invalid arrival tile '+id);
 currentWorldId=id;world=next;W=world.w;H=world.h;
 ZONES=world.zones;SITES=world.sites;NPCS=world.npcs;BRIDGES=world.bridges;
 Object.assign(hero,{x:spawn.x,y:spawn.y,px:spawn.x,py:spawn.y,path:[],arrival:null,moving:false});
 camera.x=(spawn.x+.5)*TILE;camera.y=(spawn.y+.5)*TILE;
 cache.clear();zoneId='';panTarget=null;syncTravelState();closeDialogue();closePanels();
 $('worldTitle').textContent=id==='silk'?'星風回廊':'潮環群島';
 $('atlasTitle').textContent=id==='silk'?'星風回廊の地図':'潮環群島の地図';
 rebuildZoneList();updateDiscoveries();updateZone();
 toast(id==='silk'?'星風回廊へようこそ。遠い湖と草原を歩いてみましょう。':'潮環群島に帰ってきました。');
}

function startWalk(target,arrival=null){
 if(!world.walkable(target.x,target.y)){toast('ここには歩いて行けません。道や橋を選んでください。');return;}
 // Start from the next occupied grid cell instead of instantly teleporting away.
 // A portal crosses worlds on arrival, so only a route ending there may use it.
 const from={x:hero.x,y:hero.y},route=avoidTransitions(world,target),path=JOURNEY_MODE?routeJourneyWalk(world,hero,target):
  currentWorldId==='silk'?silkPath(route,from,target):findPath(route,from,target);
 if(!path){toast('この場所へ続く道が見つかりません。');return;}
 hero.path=JOURNEY_MODE?path:path.slice(1);hero.arrival=arrival;
 panTarget=null;syncTravelState();
 if(hero.path.length===0){hero.px=hero.x;hero.py=hero.y;onArrive();return;}
 // Walking does not display distances or step counts: explore visually.
 sfx.play('confirm');
}
function onArrive(){
 const obj=hero.arrival;hero.arrival=null;
 if(!obj)return;
 if(obj.kind==='npc'){openDialogue(obj.item.name,obj.item.role,JOURNEY_MODE?obj.item.lines:(currentWorldId==='silk'?SILK_TALK:TALK)[obj.item.id]||obj.item.lines);return;}
 if(obj.kind==='site'){
  const fresh=!discovered.has(obj.item.id);discovered.add(obj.item.id);
  updateDiscoveries();if(fresh)sfx.play('heal');
  if(JOURNEY_MODE){openDialogue(obj.item.name,'この場所で',[obj.item.desc,obj.item.aside]);return;}
  openDialogue(obj.item.name,'DISCOVERED PLACE',[
   obj.item.desc,
   JOURNEY_MODE?obj.item.aside:(currentWorldId==='silk'?SILK_ASIDES:SITE_ASIDES)[obj.item.id]||'',
   fresh?'新しい場所を見つけました。発見した建物：'+discovered.size+' / '+DISCOVERY_TOTAL:
    'この場所は、すでに訪れたことがあります。',
   PROTOTYPE_MODE&&fresh&&discovered.size===DISCOVERY_TOTAL?
    '森から港へ、4つの場所を巡りました。小さな旅はここでひと区切り。まだ歩いていても大丈夫です。':''
  ]);
 }
}
function walkToNpc(n){
 let best=null,lowest=Infinity;
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[0,0]]){
  const p={x:n.x+dx,y:n.y+dy};
  if(!world.walkable(p.x,p.y))continue;
  const score=Math.abs(p.x-hero.x)+Math.abs(p.y-hero.y);
  if(score<lowest){best=p;lowest=score;}
 }
 if(best)startWalk(best,{kind:'npc',item:n});
}
function handleTap(e){
 if(dialogue){if(!JOURNEY_MODE)return;closeDialogue();}
 music.unlock();sfx.unlock();
 const p=screenToWorld(e.clientX,e.clientY);
 if(p.x<0||p.y<0||p.x>=W||p.y>=H)return;
 // A tap on the small glowing portal always means crossing the bridge.
 const directGate=world.transitionAt?.(p.x,p.y);
 if(directGate){startWalk({x:directGate.x,y:directGate.y});return;}
 const npc=NPCS.find(n=>Math.hypot(n.x-p.x,n.y-p.y)<1.8);
 if(npc){walkToNpc(npc);return;}
 const site=world.siteAt(p.x,p.y);
 if(site){startWalk(site.entrance,{kind:'site',item:site});return;}
 const bridge=world.bridgeAt(p.x,p.y);
 // Either Starwind bridge, including the one beside the spawn, leads across.
 if(bridge){
  const gate=world.transitions?.find(p=>p.x>=bridge.x1&&p.x<=bridge.x2&&p.y>=bridge.y1&&p.y<=bridge.y2);
  if(gate){startWalk({x:gate.x,y:gate.y});toast(bridge.name+'を渡って、新しい景色へ。');return;}
 }
 const t=world.walkable(p.x,p.y)?p:nearestWalkable(world,p.x,p.y,4);
 if(!t){toast('海の上は歩けません。橋をタップしてください。');return;}
 startWalk(t);
 if(bridge)toast(bridge.name+'へ歩いて向かいます。');
}
function openDialogue(name,role,lines){
 dialogue={name,role,lines:lines.filter(Boolean),index:0,openedAt:performance.now()};
 $('dialogueName').textContent=name;$('dialogueRole').textContent=role;
 $('dialogueText').textContent=dialogue.lines[0];
 $('dialogueNext').innerHTML=JOURNEY_MODE?'つづき <span>›</span>':'タップしてつづく <span>›</span>';
 $('dialogue').classList.remove('hidden');
 if(JOURNEY_MODE)placeJourneyDialogue();
 sfx.play('select');
}
function placeJourneyDialogue(){
 const card=$('dialogue');
 // Keep the people visible without moving the camera when conversation starts.
 // A traveller near the lower edge needs the reading card on the opposite side.
 const heroY=screen.h/2+((hero.py+.5)*TILE-camera.y)*camera.zoom;
 const cardHeight=card.getBoundingClientRect().height;
 card.classList.toggle('journey-dialogue-above',heroY>screen.h-cardHeight-42&&heroY>cardHeight+50);
}
function closeDialogue(){dialogue=null;$('dialogue').classList.add('hidden');}
function advanceDialogue(){
 if(!dialogue)return;
 dialogue.index++;
 if(dialogue.index>=dialogue.lines.length){closeDialogue();return;}
 $('dialogueText').textContent=dialogue.lines[dialogue.index];
 $('dialogueNext').innerHTML=JOURNEY_MODE?
  (dialogue.index===dialogue.lines.length-1?'とじる <span>×</span>':'つづき <span>›</span>'):
  (dialogue.index===dialogue.lines.length-1?'どこでもタップして閉じる <span>×</span>':'タップしてつづく <span>›</span>');
 sfx.play('select');
}
// Capture the click before the underlying map/menu can receive it. A dialogue
// opened by a pointer-up must not advance on that same gesture's subsequent click.
document.addEventListener('click',e=>{
 if(!dialogue)return;
 // This journey's quiet reading card never captures the rest of the interface.
 // Field taps already resume walking in handleTap; menus can dismiss it too.
 if(JOURNEY_MODE&&!e.target.closest('#dialogue')){
  // An adjacent NPC opens on pointerup; its following click belongs to the
  // same gesture and must not immediately dismiss the newly opened card.
  if(e.target===canvas&&performance.now()-dialogue.openedAt<180)return;
  closeDialogue();return;
 }
 e.preventDefault();e.stopImmediatePropagation();
 if(e.target.closest('#dialogueClose')){closeDialogue();return;}
 if(performance.now()-dialogue.openedAt<180)return;
 advanceDialogue();
},true);

function updateMove(dt){
 if(dialogue||!hero.path.length){hero.moving=false;return;}
 let remaining=Math.min(dt,0.08)*6.15;
 while(remaining>0&&hero.path.length){
  const step=hero.path[0];
  const dx=step.x-hero.px,dy=step.y-hero.py,distance=Math.hypot(dx,dy);
  if(JOURNEY_MODE)sfx.step(Math.min(distance,remaining),world.tileAt(step.x,step.y));
  if(distance<=remaining+.0001){
   hero.px=step.x;hero.py=step.y;hero.x=step.x;hero.y=step.y;
   hero.path.shift();remaining-=distance;
   if(!JOURNEY_MODE&&distance>.001)sfx.play('soft-step');
   const passage=world.transitionAt?.(hero.x,hero.y);
   if(passage){switchWorld(passage.target,passage.spawn);return;}
   if(!hero.path.length){hero.moving=false;syncTravelState();onArrive();break;}
  }else{
   hero.px+=dx/distance*remaining;hero.py+=dy/distance*remaining;remaining=0;
  }
  if(Math.abs(dx)>Math.abs(dy))hero.face=dx>0?'right':'left';
  else if(Math.abs(dy)>0)hero.face=dy>0?'down':'up';
  hero.stride+=distance>.001?dt*3:0;
 }
 hero.moving=hero.path.length>0;updateZone();
}
let lastPaint=-Infinity,lastPaintCamera={x:camera.x,y:camera.y};
function animate(time){
 const dt=last?Math.min(.07,(time-last)/1000):0;last=time;
 updateMove(dt);
 updateJourneyMusic(time);
 journeyView?.update(hero,!!dialogue||isPanelOpen(),time);
 if(journeyCamera){
  const target=journeyCamera.update(journeyCameraScene(world,hero),time);
  if(!dialogue&&!isPanelOpen()&&!gesture&&!panTarget&&$('vistaCard').hidden){
   Object.assign(camera,easeJourneyCamera(camera,{x:hero.px,y:hero.py},target,dt,
    {width:screen.w,height:screen.h},{width:W*TILE,height:H*TILE,tile:TILE}));
   syncTravelState();
  }
 }
 // Time-based smoothing makes both fingertip panning and edge-following fluid.
 const viewport={width:screen.w,height:screen.h,zoom:camera.zoom};
 const bounds={width:W*TILE,height:H*TILE,tile:TILE};
 if(panTarget){
  // The hero or viewport can change after a drag; settle against the current
  // reachable target instead of keeping an impossible target alive forever.
  panTarget=limitCamera(panTarget,{x:hero.px,y:hero.py},viewport,bounds);
  const next=smoothPanCamera(camera,panTarget,{x:hero.px,y:hero.py},viewport,bounds,dt);
  camera.x=next.x;camera.y=next.y;
  if(!gesture?.drag&&Math.hypot(next.x-panTarget.x,next.y-panTarget.y)<.6)panTarget=null;
 }else if(hero.moving){
  const next=easeEdgeCamera(camera,{x:hero.px,y:hero.py},viewport,bounds,dt);
  camera.x=next.x;camera.y=next.y;
 }else confineCamera(camera.x,camera.y,.08);
 // Prioritize 60fps while the camera moves, but retain low-cost idle frames.
 const scrolling=panTarget!==null||Math.hypot(camera.x-lastPaintCamera.x,camera.y-lastPaintCamera.y)>.05;
 const frameMs=scrolling?1000/60:hero.moving?1000/45:1000/24;
 if(time-lastPaint>=frameMs){
  paint(time);lastPaint=time;lastPaintCamera={x:camera.x,y:camera.y};
 }
 requestAnimationFrame(animate);
}
let lastTravelBusy=null;
function syncTravelState(){
 const busy=hero.path.length>0;
 if(busy!==lastTravelBusy){lastTravelBusy=busy;canvas.setAttribute('aria-busy',String(busy));}
}
$('homeBtn').addEventListener('click',centerCamera);
// Framing is authored by place. Wheel and multi-touch never alter magnification.
canvas.addEventListener('wheel',e=>e.preventDefault(),{passive:false});

const pointerMap=new Map();let gesture=null;
const cancelledClickPointers=new Set();
function cancelCameraGesture(){
 const ids=[...pointerMap.keys()];pointerMap.clear();gesture=null;panTarget=null;
 for(const id of ids)cancelledClickPointers.add(id);
 // OS-cancelled contacts may never produce a click; bound retained IDs.
 while(cancelledClickPointers.size>32)cancelledClickPointers.delete(cancelledClickPointers.values().next().value);
 for(const id of ids)if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
}
// After resize/cancel, a still-held finger may be released over the dock.
// Suppress only that contact's synthetic click, never a fresh toolbar gesture.
document.addEventListener('pointerdown',e=>cancelledClickPointers.delete(e.pointerId),true);
window.addEventListener('click',e=>{
 if(!cancelledClickPointers.delete(e.pointerId))return;
 e.preventDefault();e.stopImmediatePropagation();
},true);
function finishCameraPointer(id){
 if(!pointerMap.has(id))return;
 pointerMap.delete(id);
 if(!pointerMap.size)gesture=null;
 else if(gesture){
  // A multi-finger group stays a pinch until every finger is lifted. Never
  // reinterpret its remaining finger as a tap or an old-origin manual pan.
  gesture.pinch=true;gesture.drag=true;gesture.pinchStart=null;
 }
}
window.addEventListener('resize',cancelCameraGesture);
window.addEventListener('blur',cancelCameraGesture);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelCameraGesture();});
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);
 panTarget=null;
 pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointerMap.size===1)gesture={id:e.pointerId,x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,drag:false,pinch:false};
 else if(gesture){gesture.pinch=true;gesture.drag=true;gesture.pinchStart=null;}
},{passive:false});
canvas.addEventListener('pointermove',e=>{
 const p=pointerMap.get(e.pointerId);if(!p)return;
 p.x=e.clientX;p.y=e.clientY;
 if(!gesture)return;
 if(pointerMap.size>1){
  gesture.pinch=true;gesture.drag=true;
  return;
 }
 if(gesture.pinch||gesture.id!==e.pointerId)return;
 const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
 if(Math.hypot(dx,dy)>9)gesture.drag=true;
 if(gesture.drag){
  panTarget=limitCamera({x:gesture.cx-dx*PAN_SENSITIVITY/camera.zoom,y:gesture.cy-dy*PAN_SENSITIVITY/camera.zoom},
   {x:hero.px,y:hero.py},{width:screen.w,height:screen.h,zoom:camera.zoom},
   {width:W*TILE,height:H*TILE,tile:TILE});
 }
});
canvas.addEventListener('pointerup',e=>{
 const g=gesture;const tapped=g&&g.id===e.pointerId&&!g.drag&&!g.pinch;
 finishCameraPointer(e.pointerId);
 if(tapped)handleTap(e);
});
canvas.addEventListener('pointercancel',e=>{if(pointerMap.has(e.pointerId))cancelCameraGesture();});
canvas.addEventListener('lostpointercapture',e=>{
 // Implicit capture loss follows normal pointerup. Only an unexpected loss
 // of a still-active pointer cancels the group and any pending camera motion.
 if(pointerMap.has(e.pointerId))cancelCameraGesture();
});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('dragstart',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeDialogue();closePanels();journeyView?.close(true);return;}
 if(dialogue){
  if(e.key==='Enter'||e.key===' '){e.preventDefault();advanceDialogue();return;}
  if(JOURNEY_MODE&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key))closeDialogue();
  else return;
 }
 if(isPanelOpen())return;
 const dirs={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
 const d=dirs[e.key];if(!d)return;
 e.preventDefault();sfx.unlock();music.unlock();
 const next={x:hero.x+d[0],y:hero.y+d[1]};
 if(world.walkable(next.x,next.y))startWalk(next);
});

function closePanels(restoreFocus=true){
 const active=JOURNEY_MODE&&restoreFocus?document.activeElement?.closest('.overlay'):null;
 for(const id of ['mapPanel','musicPanel','helpPanel'])$(id).classList.add('hidden');
 if(JOURNEY_MODE)for(const id of ['mapBtn','soundBtn','helpBtn'])$(id).setAttribute('aria-expanded','false');
 if(active)$({mapPanel:'mapBtn',musicPanel:'soundBtn',helpPanel:'helpBtn'}[active.id]).focus();
}
function isPanelOpen(){return ['mapPanel','musicPanel','helpPanel'].some(id=>!$(id).classList.contains('hidden'));}
function showPanel(id){
 journeyView?.close();
 const wasOpen=!$(id).classList.contains('hidden');
 closePanels(false);if(JOURNEY_MODE&&wasOpen)return;
 $(id).classList.remove('hidden');music.unlock();sfx.unlock();
 if(JOURNEY_MODE){
  $({mapPanel:'mapBtn',musicPanel:'soundBtn',helpPanel:'helpBtn'}[id]).setAttribute('aria-expanded','true');
  $(id).querySelector('[data-close]').focus({preventScroll:true});
 }
 if(id==='mapPanel'){rebuildZoneList();drawMinimap();}
}
$('mapBtn').addEventListener('click',()=>showPanel('mapPanel'));
$('soundBtn').addEventListener('click',()=>showPanel('musicPanel'));
$('helpBtn').addEventListener('click',()=>showPanel('helpPanel'));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closePanels));
document.querySelectorAll('.overlay').forEach(e=>e.addEventListener('click',ev=>{if(ev.target===e)closePanels();}));
const mini=$('miniMap');
function drawMinimap(){
 mini.width=520;mini.height=Math.round(520*H/W);
 mini.style.aspectRatio=`${W}/${H}`;
 const c=mini.getContext('2d'),sx=mini.width/W,sy=mini.height/H;
 c.clearRect(0,0,mini.width,mini.height);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  c.fillStyle=(JOURNEY_MODE?JOURNEY_PALETTE:currentWorldId==='silk'?SILK_PALETTE:palette)[world.tileAt(x,y)]||'#91a49a';c.fillRect(x*sx,y*sy,sx+1,sy+1);
 }
 c.strokeStyle='#f3e5c8';c.lineWidth=2;
 for(const z of ZONES){
  if(z.rx&&z.ry)c.strokeRect((z.cx-z.rx)*sx,(z.cy-z.ry)*sy,z.rx*2*sx,z.ry*2*sy);
  c.textAlign='center';c.fillStyle='#fff6db';c.font='bold 12px system-ui';
  const lx=JOURNEY_MODE?z.label.x:z.cx,ly=JOURNEY_MODE?z.label.y:z.cy-13;
  c.strokeStyle='#17374a';c.lineWidth=3;c.strokeText(z.name,lx*sx,ly*sy);
  c.fillText(z.name,lx*sx,ly*sy);
 }
 for(const s of SITES){
  if(JOURNEY_MODE&&!discovered.has(s.id)&&s.kind!=='terminal')continue;
  c.fillStyle=discovered.has(s.id)?'#fff0a1':'#f8d5b0';c.fillRect(s.entrance.x*sx-3,s.entrance.y*sy-3,6,6);
 }
 c.fillStyle='#fae5a1';c.beginPath();c.arc((hero.px+.5)*sx,(hero.py+.5)*sy,6,0,Math.PI*2);c.fill();
 c.strokeStyle='#244658';c.lineWidth=2;c.stroke();
}
mini.addEventListener('click',e=>{
 const r=mini.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
 if(JOURNEY_MODE){
  const site=world.siteAt(Math.floor(x),Math.floor(y));
  if(site){closePanels();startWalk(site.entrance,{kind:'site',item:site});return;}
 }
 const target=nearestWalkable(world,Math.max(0,Math.min(W-1,Math.floor(x))),Math.max(0,Math.min(H-1,Math.floor(y))),14);
 closePanels();
 if(target){
  const bridge=world.bridgeAt(target.x,target.y);
  const exit=bridge&&world.transitions?.find(p=>p.x>=bridge.x1&&p.x<=bridge.x2&&p.y>=bridge.y1&&p.y<=bridge.y2);
  startWalk(exit?{x:exit.x,y:exit.y}:target);
 }else toast('水域は歩けません。陸か橋を選んでください。');
});
$('mapHome').addEventListener('click',()=>{
 centerCamera();closePanels();
});
function rebuildZoneList(){
 $('zoneList').replaceChildren();
 for(const z of ZONES){
 const btn=document.createElement('button');
 const title=document.createElement('span');title.textContent=z.name;
 const sub=document.createElement('small');sub.textContent=z.sub;
 btn.append(title,sub);
 btn.addEventListener('click',()=>{
  const target=nearestWalkable(world,z.cx,z.cy,12);
  closePanels();if(target)startWalk(target);
 });
 $('zoneList').append(btn);
 }
}
rebuildZoneList();
const trackSelect=$('trackSelect');
MUSIC_LIBRARY.forEach((score,i)=>{
 for(const [phase,key]of [[1,'ally'],[2,'hostile']]){
  const opt=document.createElement('option');opt.value=i+':'+phase;
  opt.textContent=(i<6?'本編':i<25?'追加':'星風')+' '+String(i+1).padStart(2,'0')+' · '+score[key].title;
  trackSelect.append(opt);
 }
});
function saveTrack(){storage.setItem('selected-track',trackSelect.value);}
let chosen=storage.getItem('selected-track')||'3:1';
if(![...trackSelect.options].some(o=>o.value===chosen))chosen='3:1';
trackSelect.value=chosen;
function chosenTrack(){const parts=trackSelect.value.split(':').map(Number);return {id:parts[0],phase:parts[1]};}
function applyTrack(){
 const p=chosenTrack();saveTrack();
 if(music.enabled){music.setScene(p.id,p.phase);music.unlock();}
 $('nowPlaying').textContent=music.enabled?'再生中：'+MUSIC_LIBRARY[p.id][p.phase===1?'ally':'hostile'].title:'音楽は停止中';
}
function syncMusic(){
 $('musicToggle').textContent=music.enabled?'ON':'OFF';
 $('musicToggle').classList.toggle('on',music.enabled);
 $('musicToggle').setAttribute('aria-pressed',String(music.enabled));
 $('sfxToggle').textContent=sfx.enabled?'ON':'OFF';
 $('sfxToggle').classList.toggle('on',sfx.enabled);
 $('sfxToggle').setAttribute('aria-pressed',String(sfx.enabled));
 $('volumeRange').value=Math.round(music.volume*100);
 $('volumeLabel').textContent=Math.round(music.volume*100)+'%';
 if(JOURNEY_MODE){
  $('sfxVolumeRange').value=Math.round(sfx.volume*100);
  $('sfxVolumeLabel').textContent=Math.round(sfx.volume*100)+'%';
 }
 applyTrack();
}
trackSelect.addEventListener('change',()=>{music.unlock();applyTrack();});
$('musicToggle').addEventListener('click',()=>{
 music.setEnabled(!music.enabled);music.unlock();syncMusic();
});
$('volumeRange').addEventListener('input',e=>{
 music.setVolume(Number(e.target.value)/100);$('volumeLabel').textContent=e.target.value+'%';
});
$('sfxToggle').addEventListener('click',()=>{sfx.toggle();syncMusic();});
if(JOURNEY_MODE)$('sfxVolumeRange').addEventListener('input',e=>{
 sfx.setVolume(Number(e.target.value)/100);sfx.unlock();$('sfxVolumeLabel').textContent=e.target.value+'%';
});
syncMusic();
updateDiscoveries();updateZone();updateJourneyMusic(performance.now());requestAnimationFrame(animate);
