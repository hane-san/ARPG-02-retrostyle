// A newly drawn, opt-in walking country. No coordinates are cropped from either
// original world. The existing mainland A* already indexes by world.w / world.h.
import {silkPath} from './silk-world.js';

export const JOURNEY_W=112,JOURNEY_H=88;
export const STEPPE={x:36,y:38,r:24.5,roadRadius:22.2};
export const JOURNEY_START={x:19,y:70};
export const JOURNEY_ZONES=[
 {id:'journey-port',name:'白い船着場',sub:'水辺の灯りを、帰り道のしるしに',cx:13,cy:76,label:{x:14,y:82}},
 {id:'journey-steppe',name:'円い風の草原',sub:'どちらへ歩いても、風のまんなか',cx:36,cy:38,label:{x:34,y:37}},
 {id:'journey-tea',name:'水路のチャイハナ',sub:'湖の水と、行き交う人の小さな暮らし',cx:47,cy:70,label:{x:44,y:71}},
 {id:'journey-lake',name:'空をしまう湖',sub:'対岸は遠く、足元にはさざ波だけ',cx:106,cy:52,label:{x:81,y:53}},
 {id:'journey-salt',name:'海の記憶の塩原',sub:'白い岸に、もう来ない潮を待つ',cx:83,cy:27,label:{x:88,y:13}},
 {id:'journey-pass',name:'石影の峠',sub:'谷を曲がるたび、あの石が近づく',cx:62,cy:24,label:{x:58,y:7}},
 {id:'journey-sunset',name:'残照の岸',sub:'夕空が、旅人よりもずっと大きい',cx:77,cy:76,label:{x:79,y:81}}
];

// Working names and independent fragments, deliberately replaceable. No quest,
// historical truth, or main-story answer is established by these descriptions.
export const JOURNEY_SITES=[
 {id:'journey-terminal',name:'白い連絡舎',kind:'terminal',x:7,y:68,w:9,h:6,entrance:{x:12,y:75},desc:'海辺の連絡舎。白い折屋根の下で、草原を越える荷物と湖から届く籠が同じ台車を待っている。',aside:'帰りの船の時刻は書いていない。軒先の灯りは、誰が戻ってもいいようについている。'},
 {id:'journey-chaikhana',name:'水路の茶屋',kind:'teahouse',x:42,y:63,w:8,h:5,entrance:{x:46,y:69},desc:'湖から引いた小さな水路のそばのチャイハナ。畑の仕事がひと段落すると、誰かが黙って湯を足す。',aside:'片方だけの手袋が窓辺に並んでいる。落とし主は違っても、冬までには組になるらしい。'},
 {id:'journey-monolith',name:'名のない石',kind:'monolith',x:52,y:8,w:6,h:10,entrance:{x:55,y:19},desc:'草原から見えていた、ひとつだけの巨大な石。継ぎ目も窓もない。遠くでは細い線だった影が、ここでは空を分けている。',aside:'足元に、小石で押さえた古い紙がある。何も書かれていない面が上を向いている。'},
 {id:'journey-ship',name:'潮を待つ船',kind:'shipwreck',x:86,y:17,w:8,h:4,entrance:{x:90,y:22},desc:'白い塩地に船が残る。修理した舷側と、外して持ち帰った部品の跡。人がここを離れた日は、一日ではなかったのだろう。',aside:'船名の文字は薄い。誰かが最近、船底の陰に水の器を置いている。'},
 {id:'journey-hut',name:'青い岸の小屋',kind:'lakehut',x:95,y:67,w:6,h:4,entrance:{x:98,y:72},desc:'水位を測る棒と、干してある網。対岸の畑へ渡す種を、小屋の人が毎春預かっている。',aside:'空箱には「壊れ物ではないが、急がないこと」とだけ書いてある。'},
 {id:'journey-terrace',name:'夕空の石段',kind:'terrace',x:75,y:73,w:5,h:2,entrance:{x:77,y:76},blocking:false,desc:'湖へ向いた低い石段。座るためか、かつて水へ降りるためだったのか。今は夕焼けを見る人がときどき立ち寄る。',aside:'少し北へ戻れば湖岸、遠回りすれば茶屋。同じ水辺に、別の帰り道がある。'}
];
export const JOURNEY_NPCS=[
 {id:'journey-keeper',name:'灯りをともす人',role:'船着場の番人',x:18,y:76,color:'#d5b995',lines:['草原へ？ 橋を渡ったら、円い道の好きなほうへどうぞ。','遠くの黒い石は、ここからも見えるんです。夕方は湖の南岸がきれいですよ。','帰ってきたら、白い屋根を目印に。灯りは消しませんから。']},
 {id:'journey-host',name:'茶屋の主人',role:'チャイハナの店主',x:50,y:70,color:'#c7a7a4',lines:['この畑の水は湖から。お茶の水は峠の泉から。味が違うって、みんな言うんです。','塩原へは峠を越えても、湖の岸を回っても行けます。','手袋？ 落とし主が戻らない年もあるから、先に洗っておくんですよ。']},
 {id:'journey-surveyor',name:'白い岸の測り手',role:'水位を記す人',x:82,y:28,color:'#a6b9bc',lines:['湖の水位を測ったあと、ここにも線を一本引いて帰ります。測れる水はもうないんですが。','船の部品は少しずつ、南の暮らしへ戻っていきました。なくなった物ばかりではありません。']},
 {id:'journey-fisher',name:'網を繕う人',role:'湖畔の住人',x:101,y:72,color:'#c2b88d',lines:['対岸がよく見える日は、かえって遠く感じます。','峠の人には種を、茶屋には魚を。帰りの荷物が軽くならないんですよ。','南の石段なら、夕空を少し眺めていけます。急がないのであれば。']}
];
export const JOURNEY_BRIDGES=[
 {id:'journey-link',name:'白浜の連絡橋',axis:'h',x1:21,x2:32,y1:66,y2:68,center:{x:26,y:67}},
 {id:'journey-watercourse',name:'畑の水路橋',axis:'h',x1:50,x2:54,y1:73,y2:75,center:{x:52,y:74}}
];
export const JOURNEY_VISTAS=[
 {id:'departure',x:18,y:66,radius:5,title:'岸の向こう、石の影',sub:'まだ遠い石と、これから歩く草の海。',kind:'steppe'},
 {id:'stone',x:59,y:22,radius:5,title:'石影の向こうに',sub:'越えてきた道が、小さな線になる。',kind:'highland'},
 {id:'evening',x:77,y:76,radius:5,title:'夕空に、飲み込まれる',sub:'水も山も、いまは同じ光の中にある。',kind:'sunset'}
];

const distance=(x,y,[ax,ay],[bx,by])=>{
 const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(x-ax-t*dx,y-ay-t*dy);
};
const ridge=[[44,5],[53,10],[61,17],[64,26],[59,34]];
const trails=[
 {points:[[13,76],[18,73],[20,68],[32,67],[32,61]],type:'=',width:1},
 {points:[[48,57],[46,61],[46,69],[46,74],[54,74],[64,76],[77,76],[98,74],[105,66],[107,54],[106,42],[101,34],[91,32],[78,32],[70,32],[62,39],[58,39]],type:'=',width:.8},
 {points:[[53,53],[57,58],[62,64],[65,72],[64,76]],type:'=',width:.85},
 {points:[[47,19],[49,21],[50,19],[55,19],[60,21],[62,24],[68,24],[71,28],[78,32]],type:'t',width:1},
 {points:[[72,28],[79,26],[84,24],[90,22],[98,25],[101,34]],type:'=',width:.85},
 {points:[[32,61],[38,67],[46,69]],type:'=',width:.8},
 {points:[[98,74],[98,72]],type:'=',width:1}
];

export function makeJourneyWorld(){
 const w=JOURNEY_W,h=JOURNEY_H;
 const tiles=Array.from({length:h},()=>Array(w).fill('~')),occupied=new Uint8Array(w*h);
 const inside=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<w&&y<h;
 const set=(x,y,t)=>{if(inside(x,y))tiles[y][x]=t;};
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const radial=Math.hypot(x-STEPPE.x,y-STEPPE.y);
  const coast=(Math.abs(x-59)/50)**3+(Math.abs(y-45)/37)**3;
  const island=((x-13)/12)**2+((y-73)/10)**2;
  if(coast<1+.025*Math.sin(x*.29+y*.14)||island<1||radial<STEPPE.r+1.3){
   let t='b';
   if(radial<STEPPE.r)t='g';
   // Broad, quiet grass tones, not isolated random squares or concentric rings.
   if(t==='g'&&Math.sin(x*.13)+Math.cos(y*.17)>.8)t='G';
   if(radial>=STEPPE.r&&radial<STEPPE.r+1.3)t='v';
   if(x>50&&y<37)t='h';
   if(x>=37&&x<=49&&y>=72&&y<=78)t='i';
   if(x<23&&y>65)t='p';
   const salt=((x-85)/21)**2+((y-21)/11)**2;
   if(salt<1.12)t=salt<.84?'S':'s';
   if(ridge.slice(1).some((p,i)=>distance(x,y,ridge[i],p)<3.2))t='X';
   const lake=((x-81)/23.4)**2+((y-52)/17.5)**2;
   if(lake<1+.055*Math.sin(y*.5)+.025*Math.cos(x*.45))t='L';
   // A real inlet separates the familiar white quay from the journey country.
   if(y===63&&x<31)t='~';
   if(y>=64&&x>=24+Math.round(Math.sin(y*.2))&&x<=29+Math.round(Math.sin(y*.2)))t='~';
   if(x===52&&y>=68&&y<=79)t='L';
   tiles[y][x]=t;
  }
 }
 // The circular path is a choice of directions, not a forced tour itinerary.
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  if(Math.abs(Math.hypot(x-STEPPE.x,y-STEPPE.y)-STEPPE.roadRadius)<.8)set(x,y,'=');
 }
 for(const {points,type,width} of trails)for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];
  for(let y=Math.floor(Math.min(a[1],b[1])-width);y<=Math.ceil(Math.max(a[1],b[1])+width);y++)
   for(let x=Math.floor(Math.min(a[0],b[0])-width);x<=Math.ceil(Math.max(a[0],b[0])+width);x++){
    if(!inside(x,y)||distance(x,y,a,b)>width)continue;
    // Only the explicit mountain pass cuts rock. Trails never pave lake water.
    if(['~','L'].includes(tiles[y][x])||tiles[y][x]==='X'&&type!=='t')continue;
    set(x,y,type);
   }
 }
 for(const b of JOURNEY_BRIDGES)for(let y=b.y1;y<=b.y2;y++)for(let x=b.x1;x<=b.x2;x++)set(x,y,'+');
 for(const s of JOURNEY_SITES){
  for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++){
   if(s.blocking!==false)occupied[y*w+x]=1;
   if(['~','L','X'].includes(tiles[y][x]))set(x,y,s.kind==='monolith'?'h':s.kind==='shipwreck'?'S':'p');
  }
  occupied[s.entrance.y*w+s.entrance.x]=0;set(s.entrance.x,s.entrance.y,'=');
 }
 for(const n of JOURNEY_NPCS){set(n.x,n.y,'=');occupied[n.y*w+n.x]=0;}
 // Shallow water still blocks walking. Its light edge joins the land palette.
 const wet=t=>['~','L','l'].includes(t);
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  if(tiles[y][x]!=='L')continue;
  if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!wet(tiles[y+dy][x+dx])))set(x,y,'l');
 }
 const byId=id=>JOURNEY_ZONES.find(z=>z.id==='journey-'+id);
 const world={
  id:'journey',w,h,tiles,occupied,start:{...JOURNEY_START},sites:JOURNEY_SITES,npcs:JOURNEY_NPCS,zones:JOURNEY_ZONES,
  bridges:JOURNEY_BRIDGES,vistas:JOURNEY_VISTAS,transitions:[],
  tileAt(x,y){return inside(x,y)?tiles[y][x]:'~';},
  walkable(x,y){return inside(x,y)&&!['~','L','l','X'].includes(tiles[y][x])&&!occupied[y*w+x];},
  siteAt(x,y){return JOURNEY_SITES.find(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);},
  npcAt(x,y){return JOURNEY_NPCS.find(n=>n.x===x&&n.y===y);},
  bridgeAt(x,y){return JOURNEY_BRIDGES.find(b=>x>=b.x1&&x<=b.x2&&y>=b.y1&&y<=b.y2);},
  transitionAt(){return undefined;},
  findPath:silkPath,
  zoneAt(x,y){
   if(x<30&&y>=64)return byId('port');
   if(x>=70&&y<33)return byId('salt');
   if(x>=49&&y<35)return byId('pass');
   if(y>=72&&x>=65&&x<=90)return byId('sunset');
   if(y>=61&&x<58)return byId('tea');
   if(x>=57&&y>=32||x>=54&&Math.hypot((x-81)/23.4,(y-52)/17.5)<1.2)return byId('lake');
   return byId('steppe');
  }
 };
 return world;
}

// Finish the already occupied edge before rerouting. Starting a new path from
// the previous tile while between cells can otherwise cut an obstacle's corner.
export function routeJourneyWalk(world,hero,target){
 const inTransit=Math.hypot(hero.px-hero.x,hero.py-hero.y)>.0001;
 const next=inTransit&&hero.path.length?hero.path[0]:null;
 const path=world.findPath(world,next||{x:hero.x,y:hero.y},target);
 return path?(next?path:path.slice(1)):null;
}
