// Seamless, deterministic 32px-tile open world. The grid is never drawn.
export const W=164,H=120,TILE=32;
const INFINITY=Number.POSITIVE_INFINITY;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const hash=(x,y,s=0)=>{let n=Math.imul(x+113,374761393)+Math.imul(y+71,668265263)+s*1442695041;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
export const ZONES=[
 {id:'garden',name:'風環の庭',sub:'霧の森と空を仰ぐ旧王国',cx:40,cy:30,rx:37,ry:26},
 {id:'future',name:'白磁の未来都',sub:'海上に建てられた技術と記憶の学府',cx:123,cy:30,rx:37,ry:26},
 {id:'harbour',name:'潮騒の旧港',sub:'石畳と帆船、かつての湾岸都市',cx:40,cy:89,rx:37,ry:26},
 {id:'neon',name:'蒼光の新港',sub:'ネオン・発光庭園・観測塔',cx:123,cy:89,rx:37,ry:26}
];
export const SITES=[
 {id:'windmill',name:'風車の祈り',kind:'windmill',x:18,y:14,w:10,h:9,entrance:{x:23,y:24},desc:'森の上に風を送る、古い時代の観測施設。羽根は毎夜、海の方角にだけ向くといわれている。'},
 {id:'castle',name:'白霧の旧城',kind:'castle',x:47,y:17,w:13,h:12,entrance:{x:53,y:30},desc:'湾岸を見渡す石造の城。砲台が据えられた痕跡と、なぜか現代式の光学レンズが一緒に残っている。'},
 {id:'shrine',name:'森の渡り社',kind:'shrine',x:28,y:40,w:10,h:7,entrance:{x:33,y:48},desc:'木立に抱かれた祈りの場。異なる時代から漂着した小さな奉納品が並んでいる。'},
 {id:'museum',name:'潮環資料館',kind:'museum',x:99,y:15,w:14,h:11,entrance:{x:106,y:27},desc:'かつてこの海を埋め立てた人々と、空から降りた「来訪者」の資料を同じ順路で展示する建物。'},
 {id:'spire',name:'銀の軌道塔',kind:'spire',x:130,y:12,w:10,h:16,entrance:{x:135,y:29},desc:'海上都市の象徴。塔の先端は、夜になると水平線ではなく星々を指している。'},
 {id:'exhibition',name:'白環展示宮',kind:'exhibition',x:110,y:40,w:16,h:8,entrance:{x:118,y:49},desc:'折り紙のように白い屋根が重なる展示施設。どの入口から入っても、海が見える回廊に出る。'},
 {id:'oldport',name:'海門城と水門',kind:'castle',x:20,y:72,w:14,h:12,entrance:{x:27,y:85},desc:'海の交易を守った小城。今では運河と運河をつなぐ水門が残り、潮の音が響く。'},
 {id:'market',name:'潮見バザール',kind:'market',x:46,y:84,w:16,h:10,entrance:{x:54,y:95},desc:'異国の布、植物、時計部品まで並ぶ港の市場。食べ物の匂いと機械油の匂いが混ざる。'},
 {id:'dock',name:'帆船桟橋',kind:'dock',x:13,y:98,w:12,h:8,entrance:{x:19,y:107},desc:'船の発着場。遠い島々へ向かう渡し舟は、満ち潮とともにやってくる。'},
 {id:'wheel',name:'星環観覧輪',kind:'wheel',x:95,y:70,w:15,h:15,entrance:{x:103,y:86},desc:'海岸線の上にそびえる巨大な観覧輪。夜には輪郭だけが青白く発光する。'},
 {id:'arcology',name:'蒼光のアーコロジー',kind:'arcology',x:128,y:78,w:15,h:16,entrance:{x:135,y:95},desc:'人が住む都市であり、一つの巨大な生態系でもある塔。高層の空中庭園は無人のまま手入れされている。'},
 {id:'observatory',name:'海霧観測所',kind:'observatory',x:105,y:99,w:13,h:9,entrance:{x:111,y:109},desc:'海霧と潮の満ち引き、そして夜空から届く不規則な信号を記録する小さな研究所。'}
];
export const NPCS=[
 {id:'n1',name:'庭園の案内人',role:'森の案内人',x:38,y:35,color:'#d7b785',lines:['ここは風環の庭。海の向こうに白い建物が見えるでしょう？','虹架橋を渡れば、あそこまで歩いて行けます。戦うための道ではなく、歩くための道なんですよ。']},
 {id:'n2',name:'花を集める子',role:'採集者',x:16,y:39,color:'#e6a4a8',lines:['森の花は毎朝、潮風の色に染まるんです。','風車の近くでは、少し違った花が咲きます。']},
 {id:'n3',name:'旅の歴史家',role:'考古学者',x:64,y:43,color:'#b7a4ec',lines:['あの旧城に、まだ使われていない光学装置があるそうです。','古いものと新しいものの境界は、案外はっきりしないのかもしれません。']},
 {id:'n4',name:'資料館の研究者',role:'学芸員',x:111,y:32,color:'#b8e8e3',lines:['この都市は、過去を展示しているのではありません。','同じ場所に、いくつもの未来が積み重なっていることを見せたいんです。']},
 {id:'n5',name:'白衣の技師',role:'都市技師',x:142,y:40,color:'#f0c88f',lines:['街の端から端まで歩けるように、橋は全部つながっています。','曲がりくねっていても、一度タップすれば自分で道を探しますよ。']},
 {id:'n6',name:'波止場の船乗り',role:'船乗り',x:34,y:99,color:'#c8ad86',lines:['昔の港に着く船は帆で走って、未来の港に着く船は光で走る。','同じ海を使っているのに、不思議なもんだ。']},
 {id:'n7',name:'露店の商人',role:'市場の商人',x:65,y:101,color:'#f0af9f',lines:['向こうの島まで？ なら東の暮潮橋が早いですよ。','道が見えなくても大丈夫。足元の石畳が案内してくれます。']},
 {id:'n8',name:'夜光の庭師',role:'光学庭師',x:119,y:100,color:'#b4d9ff',lines:['光る葉っぱは、太陽の代わりに人工の星を浴びています。','でも潮風がないと元気がなくなる。機械仕掛けでも自然の中にいるんですね。']},
 {id:'n9',name:'港湾の観測者',role:'天文観測員',x:144,y:101,color:'#e4b8f2',lines:['星環観覧輪の頂上からは、旧城の灯りと軌道塔が同時に見えます。','この島では、時代の違う景色が一枚に収まるんです。']}
 ,{id:'n10',name:'星を数える宮守',role:'社の守り手',x:45,y:41,color:'#d1c8a5',lines:['祈りの場でも、星を見る人はいるんです。']}
 ,{id:'n11',name:'帰り道の旅人',role:'旅人',x:126,y:42,color:'#b0c2db',lines:['懐かしい景色は、不思議と見たことのない景色です。']}
 ,{id:'n12',name:'橋を直す設計士',role:'橋梁設計士',x:55,y:101,color:'#d9a7bb',lines:['都市の正解って、橋の幅みたいに測れたら楽なんですけど。']}
 ,{id:'n13',name:'夜灯の配達人',role:'配達人',x:132,y:103,color:'#aabf8e',lines:['夜の光は、見知らぬ故郷を思い出させるんです。']}
];
export const BRIDGES=[
 {id:'rainbow',name:'虹架橋',axis:'h',x1:72,x2:91,y1:29,y2:33,center:{x:82,y:31},desc:'西の森と東の未来都を結ぶ、海上の長い連絡橋。'},
 {id:'twilight',name:'暮潮連絡橋',axis:'h',x1:72,x2:91,y1:88,y2:92,center:{x:82,y:90},desc:'二つの港を結ぶ橋。海面をかすめて伸びる。'},
 {id:'oldnorth',name:'北の縦断橋',axis:'v',x1:39,x2:43,y1:53,y2:67,center:{x:41,y:60},desc:'森の庭園から旧港へ下る歩道橋。'},
 {id:'silverlink',name:'銀浜連絡橋',axis:'v',x1:120,x2:124,y1:53,y2:67,center:{x:122,y:60},desc:'展示都と蒼光の街を結ぶ夜景の橋。'}
];
const BLOCKED=new Set(['~','#']);
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
export const zoneFor=(x,y)=>ZONES[(x>=82?1:0)+(y>=60?2:0)];
export function makeWorld(){
 const tiles=Array.from({length:H},()=>Array(W).fill('~')),occupied=new Uint8Array(W*H);
 const set=(x,y,t)=>{if(inside(x,y))tiles[y][x]=t;};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const zone=zoneFor(x,y),a=Math.abs((x-zone.cx)/zone.rx),b=Math.abs((y-zone.cy)/zone.ry);
  const swell=(hash(Math.floor(x/4),Math.floor(y/4),4)-.5)*.09;
  if(a**4+b**4<.98+swell){
   const q=hash(x,y,22),base=zone.id==='future'?'s':zone.id==='neon'?'n':zone.id==='harbour'?'p':'.';
   let t=base;
   if(zone.id==='garden'&&q>.78)t='f';
   if(zone.id==='harbour'&&q>.84)t='.';
   if(zone.id==='neon'&&q>.9)t='s';
   set(x,y,t);
  }
 }
 // Thin beige beaches give the artificial islands a readable outline.
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  if(tiles[y][x]==='~')continue;
  if(DIRS.some(([dx,dy])=>tiles[y+dy][x+dx]==='~'))tiles[y][x]=',';
 }
 for(const b of BRIDGES)for(let y=b.y1;y<=b.y2;y++)for(let x=b.x1;x<=b.x2;x++)set(x,y,'+');
 function stripe(a,b,width=1,type='='){
  let x=a.x,y=a.y;const walk=(ax,ay)=>{for(let oy=-width;oy<=width;oy++)for(let ox=-width;ox<=width;ox++){const xx=ax+ox,yy=ay+oy;if(inside(xx,yy)&&tiles[yy][xx]!=='~'&&tiles[yy][xx]!=='+')set(xx,yy,type);}};
  walk(x,y);
  while(x!==b.x){x+=Math.sign(b.x-x);walk(x,y);}
  while(y!==b.y){y+=Math.sign(b.y-y);walk(x,y);}
 }
 const hubs=[{x:41,y:37},{x:122,y:37},{x:41,y:91},{x:122,y:92}];
 for(const [i,z] of ZONES.entries()){
  const hub=hubs[i],kind=i===1?'s':i===3?'n':i===2?'p':'=';
  stripe({x:hub.x,y:14+(i>=2?63:0)},{x:hub.x,y:48+(i>=2?53:0)},1,kind);
  stripe({x:15+(i%2)*83,y:hub.y},{x:67+(i%2)*83,y:hub.y},1,kind);
 }
 stripe(hubs[0],{x:75,y:31},1);stripe(hubs[1],{x:89,y:31},1,'s');
 stripe(hubs[2],{x:75,y:90},1);stripe(hubs[3],{x:89,y:90},1,'n');
 stripe(hubs[0],{x:41,y:55},1);stripe(hubs[2],{x:41,y:66},1,'p');
 stripe(hubs[1],{x:122,y:55},1,'s');stripe(hubs[3],{x:122,y:66},1,'n');
 for(const site of SITES){const zone=zoneFor(site.x,site.y);const hub=hubs[ZONES.indexOf(zone)];stripe(hub,site.entrance,1,zone.id==='future'?'s':zone.id==='neon'?'n':'=');}
 // The building footprints are fully impassable; each site has a clear entry square.
 for(const s of SITES)for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++){
  if(inside(x,y)){occupied[y*W+x]=1;if(tiles[y][x]==='~')set(x,y,zoneFor(x,y).id==='neon'?'n':'p');}
 }
 for(const s of SITES){occupied[s.entrance.y*W+s.entrance.x]=0;set(s.entrance.x,s.entrance.y,'=');}
 for(const n of NPCS){if(tiles[n.y][n.x]==='~')set(n.x,n.y,'=');occupied[n.y*W+n.x]=0;}
 const world={tiles,occupied,sites:SITES,npcs:NPCS,bridges:BRIDGES,w:W,h:H,
  tileAt(x,y){return inside(x,y)?tiles[y][x]:'~';},
  walkable(x,y){return inside(x,y)&&!BLOCKED.has(tiles[y][x])&&!occupied[y*W+x];},
  siteAt(x,y){return SITES.find(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);},
  npcAt(x,y){return NPCS.find(n=>n.x===x&&n.y===y);},
  bridgeAt(x,y){return BRIDGES.find(b=>x>=b.x1&&x<=b.x2&&y>=b.y1&&y<=b.y2);},
  zoneAt(x,y){return zoneFor(x,y);}
 };
 return world;
}
function cost(tile){return tile==='f'?1.45:tile==='='||tile==='p'||tile==='s'||tile==='n'||tile==='+'?.86:1;}
export function nearestWalkable(world,x,y,maxRadius=7){
 if(world.walkable(x,y))return {x,y};
 for(let r=1;r<=maxRadius;r++){let best=null,score=Infinity;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
   const nx=x+dx,ny=y+dy;if(!world.walkable(nx,ny))continue;
   const s=Math.abs(dx)+Math.abs(dy);
   if(s<score){best={x:nx,y:ny};score=s;}
  }if(best)return best;
 }return null;
}
class MinHeap{
 constructor(){this.data=[];}
 push(v){const a=this.data;let i=a.length;a.push(v);while(i){const p=(i-1)>>1;if(a[p].f<=v.f)break;a[i]=a[p];i=p;}a[i]=v;}
 pop(){const a=this.data,res=a[0],end=a.pop();if(a.length){let i=0;while(2*i+1<a.length){let c=2*i+1;if(c+1<a.length&&a[c+1].f<a[c].f)c++;if(a[c].f>=end.f)break;a[i]=a[c];i=c;}a[i]=end;}return res;}
 get length(){return this.data.length;}
}
export function findPath(world,from,to){
 if(!world.walkable(from.x,from.y)||!world.walkable(to.x,to.y))return null;
 const start=from.y*W+from.x,goal=to.y*W+to.x;if(start===goal)return [{...from}];
 const g=new Float64Array(W*H).fill(INFINITY),prev=new Int32Array(W*H).fill(-1),heap=new MinHeap();
 g[start]=0;heap.push({id:start,f:0,g:0});let examined=0;
 while(heap.length&&examined++<W*H*8){
  const top=heap.pop(),id=top.id;if(top.g>g[id]+1e-6)continue;
  if(id===goal){const path=[];let p=id;while(p!==-1){path.push({x:p%W,y:(p/W)|0});p=prev[p];}return path.reverse();}
  const x=id%W,y=(id/W)|0;
  for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy;if(!world.walkable(nx,ny))continue;
   const next=ny*W+nx,trial=g[id]+cost(world.tileAt(nx,ny));if(trial>=g[next])continue;
   prev[next]=id;g[next]=trial;heap.push({id:next,g:trial,f:trial+(Math.abs(nx-to.x)+Math.abs(ny-to.y))*.85});
  }
 }
 return null;
}
export const START={x:41,y:40};
