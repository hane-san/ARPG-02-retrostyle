// Starwind Passage: a fictional pastel fantasy land with Central-Asian-inspired landforms.
import {W as OW,H as OH,TILE} from './world.js';
export const SILK_W=430,SILK_H=270;
const STILE=TILE;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const hash=(x,y,s=0)=>{let n=Math.imul(x+117,374761393)^Math.imul(y+59,668265263)^Math.imul(s+31,2246822519);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
export const SILK_ZONES=[
 {id:'silk-steppe',name:'星風の草原',sub:'果てまで続く、風と空の回廊',cx:194,cy:50},
 {id:'silk-future',name:'草海の光都',sub:'人の気配が薄い、北の蜃気楼',cx:353,cy:39},
 {id:'silk-aral',name:'水なき船の原',sub:'消えた海が残した白い岸',cx:52,cy:45},
 {id:'silk-mountain',name:'露岩の峠路',sub:'むき出しの山肌と連なる石のトンネル',cx:161,cy:117},
 {id:'silk-lake',name:'青鏡の大湖',sub:'向こう岸の見えない、空色の水',cx:289,cy:155},
 {id:'silk-tea',name:'風待ちの茶庭',sub:'旅の速度を落とす木陰のチャイハナ',cx:95,cy:146},
 {id:'silk-farms',name:'緑水の耕野',sub:'畑と水路が遠くまで続く土地',cx:129,cy:182},
 {id:'silk-oasis',name:'砂都の青影',sub:'砂と水を守る淡青の商都',cx:67,cy:216},
 {id:'silk-canyon',name:'緋の峡谷',sub:'赤い断崖に刻まれた細い道',cx:187,cy:227}
];
const Z=Object.fromEntries(SILK_ZONES.map(z=>[z.id,z]));
export function silkZoneAt(x,y){
 if(x>=303&&y<88)return Z['silk-future'];
 if(x>196&&y>=94&&y<=240)return Z['silk-lake'];
 if(x>=142&&y>=185)return Z['silk-canyon'];
 if(x<108&&y>181)return Z['silk-oasis'];
 if(x<105&&y<97)return Z['silk-aral'];
 if(x>127&&x<210&&y>=85&&y<170)return Z['silk-mountain'];
 if(x>=71&&x<=118&&y>=112&&y<=165)return Z['silk-tea'];
 if(x>=95&&x<166&&y>=139)return Z['silk-farms'];
 return Z['silk-steppe'];
}
export const SILK_SITES=[
 {id:'silk-gate',kind:'bridgegate',name:'星風橋の道標',x:22,y:130,w:10,h:10,entrance:{x:27,y:142},desc:'海辺の群島から渡ってきた者を迎える道標。地図はここから先を「記憶ではなく、風で読む土地」と呼ぶ。'},
 {id:'silk-aralship',kind:'shipwreck',name:'干潟に眠る方舟',x:40,y:40,w:18,h:12,entrance:{x:49,y:54},desc:'海のない地面に残された巨船。ここを「港」と呼んだ人々の言葉だけはまだ錆びていない。'},
 {id:'silk-araltower',kind:'ruintower',name:'塩白の灯台跡',x:70,y:53,w:8,h:10,entrance:{x:74,y:65},desc:'もう船が来ないのに灯りを守ってきた塔。見張り台には、水平線の高さに引かれた古い印がある。'},
 {id:'silk-chai',kind:'teahouse',name:'風待ちのチャイハナ',x:87,y:125,w:13,h:11,entrance:{x:93,y:138},desc:'旅人の時間だけが遅く流れる茶屋。茶碗の底に、一人ひとり違う小さな空が映る。'},
 {id:'silk-oasis',kind:'bluecity',name:'青玉のオアシス都',x:55,y:204,w:23,h:15,entrance:{x:66,y:222},desc:'淡青の塔と中庭を重ねた砂漠都市。水を囲む壁は、外から人を遠ざけるためではなく、旅人を守るために築かれた。'},
 {id:'silk-farm',kind:'windfarm',name:'耕野の風車と水庭',x:123,y:162,w:13,h:12,entrance:{x:129,y:176},desc:'細い水路を集めて耕地に届ける庭。遠くからはただの模様に見える畑にも、幾世代もの試行錯誤がある。'},
 {id:'silk-tunnel',kind:'tunnelgate',name:'七重の石門',x:155,y:93,w:13,h:10,entrance:{x:162,y:105},desc:'削り出した岩に、石門の影が何重にも続く。トンネルは山の中へ隠れるというより、山の骨格を見せつけている。'},
 {id:'silk-lake',kind:'lakepier',name:'青鏡の湖畔亭',x:216,y:88,w:13,h:9,entrance:{x:222,y:99},desc:'湖畔に立つ小さな展望亭。湖の向こうに着いた光は、まだどこかの岸へ帰っていないのかもしれない。'},
 {id:'silk-lakesouth',kind:'lakepier',name:'星砂の南岸',x:277,y:221,w:12,h:7,entrance:{x:283,y:230},desc:'巨大な湖の南の浜。北岸から歩いてきた旅人は、ようやく湖の大きさを知る。'},
 {id:'silk-canyon',kind:'monastery',name:'赤峡の風読院',x:183,y:214,w:14,h:10,entrance:{x:190,y:227},desc:'谷風を読む人々が住む岩寺。水の轟音の合間に、細い鐘がただ一度だけ鳴る。'},
 {id:'silk-steppe',kind:'stonecircle',name:'草海の環石',x:194,y:33,w:12,h:9,entrance:{x:200,y:44},desc:'人の建てたものか、風の偶然か。草原の石環は夜、遠い光都の方角に長い影を落とす。'},
 {id:'silk-future',kind:'futurecity',name:'彼方の白い未来都',x:340,y:26,w:25,h:19,entrance:{x:352,y:48},desc:'北の草海を越えた先に、白磁と薄青の塔が静かに立つ。都市を作った者の名前だけが、どの記録にもない。'}
];
export const SILK_NPCS=[
 {id:'silk-n1',name:'風向きを記す子',role:'草原の地図師',x:39,y:143,color:'#a2bcbd',lines:['橋を越えると風の匂いが変わるの。','でもこの土地の境界線は、紙には描ききれないんだよね。']},
 {id:'silk-n2',name:'空舟の番人',role:'失われた海の守人',x:61,y:65,color:'#cbb79b',lines:['港の地図をしまってあるんだ。','船はないけど、帰りを待つ人はいるからね。']},
 {id:'silk-n3',name:'茶碗を磨く女主人',role:'チャイハナの主',x:108,y:140,color:'#d8ac8b',lines:['急ぐ旅人ほど、お茶を飲むのが上手なのよ。']},
 {id:'silk-n4',name:'オアシスの水守',role:'水路番',x:80,y:227,color:'#9fc6c3',lines:['水には所有者がいる。でも渇きにはいない。']},
 {id:'silk-n5',name:'畝を数える旅農夫',role:'耕作の旅人',x:115,y:182,color:'#d4c18f',lines:['畑を一枚ずつ見れば小さい。でも地平線まで続けば、空と同じぐらい広い。']},
 {id:'silk-n6',name:'岩を削る整備士',role:'峠の修繕人',x:144,y:112,color:'#aaacb5',lines:['この山道は、山を隠すためじゃなく見せるために掘ったんだ。']},
 {id:'silk-n7',name:'岸辺で眠る詩人',role:'湖畔の詩人',x:232,y:89,color:'#b7ccde',lines:['湖の向こうを見たいんだけど、まだ届かないんだよね。']},
 {id:'silk-n8',name:'谷の鐘を聴く僧',role:'渓谷の旅僧',x:176,y:235,color:'#c7afa5',lines:['水の音が大きいほど、鐘の小ささがわかる。']},
 {id:'silk-n9',name:'草を編む遊牧人',role:'草原の旅人',x:171,y:48,color:'#c9c5a6',lines:['家のない人じゃないよ。地平線を家にしているんだ。']},
 {id:'silk-n10',name:'未来都の観測係',role:'銀塔の観測者',x:366,y:52,color:'#b9c8de',lines:['誰が建てたのかわからないなら、住んでいる人が名前をつけてもいいのかな。']},
 {id:'silk-n11',name:'南岸の画家',role:'水彩画家',x:293,y:226,color:'#b5cbb5',lines:['どこまで塗っても、湖は画用紙からはみ出してしまうんです。']},
 {id:'silk-n12',name:'峠を越えた伝令',role:'旅の伝令',x:186,y:103,color:'#d2a59b',lines:['トンネルを抜けるたび、違う色の空が出迎えてくれるんです。']}
];
export const SILK_BRIDGES=[
 {id:'wind-gate',name:'海の記憶へ渡る橋',axis:'h',x1:8,x2:30,y1:144,y2:148,center:{x:16,y:146},desc:'潮環群島に帰るための橋'},
 {id:'canyon-crossing',name:'谷風橋',axis:'h',x1:172,x2:196,y1:231,y2:235,center:{x:184,y:233},desc:'緋の峡谷に架かる石の橋'}
];
export const SILK_TRANSITIONS=[
 {x:13,y:146,target:'tidal',spawn:{x:156,y:38},name:'潮環群島へ戻る'}
];
export const LAKE={cx:294,cy:157,rx:91,ry:55};
export const SILK_START={x:28,y:146};
function inBounds(x,y){return x>=0&&x<SILK_W&&y>=0&&y<SILK_H;}
function lakeDistance(x,y){return ((x-LAKE.cx)/LAKE.rx)**2+((y-LAKE.cy)/LAKE.ry)**2;}
function patchSiteBlocks(sites,occupied){
 for(const s of sites)for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)if(inBounds(x,y))occupied[y*SILK_W+x]=1;
 for(const s of sites)occupied[s.entrance.y*SILK_W+s.entrance.x]=0;
}
export function makeSilkWorld(){
 const tiles=Array.from({length:SILK_H},()=>Array(SILK_W).fill('g'));
 const occupied=new Uint8Array(SILK_W*SILK_H);
 const set=(x,y,t)=>{if(inBounds(x,y))tiles[y][x]=t;};
 for(let y=0;y<SILK_H;y++)for(let x=0;x<SILK_W;x++){
  const z=silkZoneAt(x,y).id,q=hash(x,y,7),slow=hash(Math.floor(x/9),Math.floor(y/9),14),wave=Math.sin(x/14)+Math.cos(y/11);
  let t='g';
  if(z==='silk-aral')t=q>.63?'u':'b';
  else if(z==='silk-oasis')t=slow>.43?'d':'o';
  else if(z==='silk-mountain')t=slow>.47?'h':'s';
  else if(z==='silk-lake')t=q>.64?'b':'g';
  else if(z==='silk-tea')t=slow>.5?'q':'o';
  else if(z==='silk-farms')t=slow>.33?'i':'o';
  else if(z==='silk-canyon')t=slow>.48?'k':'h';
  else if(z==='silk-future')t=slow>.5?'e':'v';
  else t=q>.55?'g':'b';
  if(z==='silk-steppe'&&slow>.73)t='G';
  if(z==='silk-oasis'&&q>.95)t='O';
  if(z==='silk-aral'&&slow>.79)t='U';
  if(z==='silk-canyon'&&Math.abs(x-183+Math.sin(y/11)*7)<3)t='r';
  if(z==='silk-mountain'&&x>133&&x<201&&y>92&&y<149){
    const ridge=Math.abs(y-(111+Math.sin(x/7)*16));
    if(ridge<5+slow*12)t='X';
  }
  const ld=lakeDistance(x,y);
  if(ld<1)t=ld>.88?'l':'L';
  else if(ld<1.16)t='-';
  set(x,y,t);
 }
 // Open-air 'tunnels' are walls hollowed by the main road: the cliff remains
 // visible alongside the pass, but the path inside each stone arch is walkable.
 function route(points,width=1,type='='){
  for(let p=1;p<points.length;p++){
   const a=points[p-1],b=points[p],n=Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
   for(let j=0;j<=n;j++){
    const x=Math.round(a.x+(b.x-a.x)*j/Math.max(n,1));
    const y=Math.round(a.y+(b.y-a.y)*j/Math.max(n,1));
    for(let oy=-width;oy<=width;oy++)for(let ox=-width;ox<=width;ox++){
     const px=x+ox,py=y+oy;
     if(inBounds(px,py)&&tiles[py][px]!=='L'&&tiles[py][px]!=='l')set(px,py,type);
    }
   }
  }
 }
 const roads=[
  [{x:10,y:146},{x:38,y:146},{x:64,y:143},{x:94,y:145},{x:116,y:151},{x:126,y:174}],
  [{x:94,y:145},{x:113,y:124},{x:130,y:118},{x:144,y:107},{x:162,y:106},{x:177,y:123},{x:185,y:113},{x:205,y:106},{x:222,y:99}],
  [{x:205,y:106},{x:218,y:92},{x:252,y:87},{x:287,y:86},{x:332,y:83},{x:352,y:47}],
  [{x:170,y:111},{x:163,y:82},{x:169,y:60},{x:200,y:45},{x:242,y:43},{x:310,y:42},{x:352,y:47}],
  [{x:94,y:145},{x:88,y:105},{x:68,y:76},{x:49,y:55}],
  [{x:49,y:55},{x:72,y:65},{x:92,y:94},{x:94,y:145}],
  [{x:93,y:145},{x:79,y:176},{x:66,y:224},{x:45,y:248}],
  [{x:126,y:174},{x:151,y:190},{x:173,y:217},{x:190,y:227},{x:212,y:236},{x:254,y:233},{x:283,y:230}],
  [{x:132,y:177},{x:149,y:163},{x:172,y:149},{x:177,y:123}],
  [{x:200,y:45},{x:201,y:26},{x:265,y:26},{x:310,y:42}]
 ];
 for(const points of roads)route(points,1,'=');
 // Two exposed stone galleries with roof arches along the mountain trail.
 route([{x:143,y:107},{x:148,y:106},{x:155,y:106},{x:163,y:106}],1,'t');
 route([{x:173,y:121},{x:178,y:118},{x:181,y:116},{x:187,y:112}],1,'t');
 // Long central farm parcels and irrigation ditches (never flood the road).
 for(let y=147;y<=198;y+=9)for(let x=108;x<=156;x++){
  if(tiles[y]?.[x]==='i'||tiles[y]?.[x]==='o')set(x,y,'w');
 }
 // Canyon river keeps its line except where the stone bridge spans it.
 route([{x:171,y:232},{x:198,y:233}],2,'+');
 // Return passage is a visibly long, pale bridge leading off the west edge.
 route([{x:7,y:146},{x:34,y:146}],2,'+');
 // Clear a naturally navigable shoulder around each facility entrance.
 for(const site of SILK_SITES){
  const e=site.entrance;
  const radius=3;
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   const x=e.x+dx,y=e.y+dy;
   if(inBounds(x,y)&&tiles[y][x]!=='L'&&tiles[y][x]!=='l'&&Math.abs(dx)+Math.abs(dy)<=radius)
    set(x,y,'=');
  }
 }
 patchSiteBlocks(SILK_SITES,occupied);
 for(const site of SILK_SITES)set(site.entrance.x,site.entrance.y,'=');
 for(const n of SILK_NPCS){
  if(tiles[n.y][n.x]==='L'||tiles[n.y][n.x]==='l'||tiles[n.y][n.x]==='X'||tiles[n.y][n.x]==='r')
   set(n.x,n.y,'=');
  occupied[n.y*SILK_W+n.x]=0;
 }
 const blocked=new Set(['L','l','X','r']);
 return {
  id:'silk',w:SILK_W,h:SILK_H,tile:TILE,tiles,occupied,
  sites:SILK_SITES,npcs:SILK_NPCS,bridges:SILK_BRIDGES,zones:SILK_ZONES,start:SILK_START,transitions:SILK_TRANSITIONS,
  tileAt(x,y){return inBounds(x,y)?tiles[y][x]:'X';},
  walkable(x,y){return inBounds(x,y)&&!blocked.has(tiles[y][x])&&!occupied[y*SILK_W+x];},
  zoneAt(x,y){return silkZoneAt(x,y);},
  siteAt(x,y){return SILK_SITES.find(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);},
  npcAt(x,y){return SILK_NPCS.find(n=>n.x===x&&n.y===y);},
  bridgeAt(x,y){return SILK_BRIDGES.find(b=>x>=b.x1&&x<=b.x2&&y>=b.y1&&y<=b.y2);},
  transitionAt(x,y){return SILK_TRANSITIONS.find(t=>t.x===x&&t.y===y);}
 };
}
export function silkPath(world,from,to){
 if(!world.walkable(from.x,from.y)||!world.walkable(to.x,to.y))return null;
 const width=world.w,height=world.h,si=from.y*width+from.x,goal=to.y*width+to.x;
 if(si===goal)return [{...from}];
 const g=new Float64Array(width*height).fill(Infinity);
 const back=new Int32Array(width*height).fill(-1);
 const heap=[];g[si]=0;
 const push=(id,score)=>{let i=heap.length;heap.push({id,score});while(i){const p=(i-1)>>1;if(heap[p].score<=score)break;heap[i]=heap[p];i=p;}heap[i]={id,score};};
 const pop=()=>{const a=heap,value=a[0],tail=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=2*i+1;if(c+1<a.length&&a[c+1].score<a[c].score)c++;if(a[c].score>=tail.score)break;a[i]=a[c];i=c;}a[i]=tail;}return value;};
 const steps=[[1,0],[-1,0],[0,1],[0,-1]];
 push(si,0);let count=0;
 while(heap.length&&count++<width*height*3){
  const top=pop(),id=top.id,x=id%width,y=Math.floor(id/width);
  const h=Math.abs(x-to.x)+Math.abs(y-to.y);
  if(top.score>g[id]+h*0.75+.00001)continue;
  if(id===goal){const out=[];let t=id;while(t!==-1){out.push({x:t%width,y:Math.floor(t/width)});t=back[t];}return out.reverse();}
  for(const [dx,dy] of steps){
   const nx=x+dx,ny=y+dy;if(!world.walkable(nx,ny))continue;
   const ni=ny*width+nx,t=world.tileAt(nx,ny),cost=t==='X'?Infinity:t==='='||t==='t'||t==='+'?.8:1;
   const n=g[id]+cost;if(n>=g[ni])continue;
   g[ni]=n;back[ni]=id;push(ni,n+(Math.abs(nx-to.x)+Math.abs(ny-to.y))*.75);
  }
 }
 return null;
}
