// Issue #78: reversible landscape studies, not the adopted history of the world.
export const IMPERIAL_W=320,IMPERIAL_H=192;
export const IMPERIAL_ZONES=[
 {id:'journey-confluence',name:'合水の巡礼路',sub:'小さな流れが、石の中で出会う',cx:198,cy:84,label:{x:194,y:95}},
 {id:'journey-blackreach',name:'返響の列石谷',sub:'同じ間隔の向こうに、少しだけ違う影',cx:222,cy:61,label:{x:220,y:40}},
 {id:'journey-empty-ridge',name:'空槽の尾根',sub:'水の高さを、風だけが覚えている',cx:262,cy:32,label:{x:258,y:23}},
 {id:'journey-imperial-remains',name:'遠い帝都の残骸',sub:'門を越えても、街の果てはまだ見えない',cx:293,cy:80,label:{x:292,y:91}},
 {id:'journey-living-water',name:'水を受ける庭',sub:'器から器へ、暮らしの方へ',cx:222,cy:145,label:{x:222,y:152}},
 {id:'journey-dry-water',name:'水を失った庭',sub:'同じ石の窪みに、白い砂がたまる',cx:262,cy:145,label:{x:262,y:152}},
 {id:'journey-return-causeway',name:'帰り舟のない街道',sub:'船のいた高さより下を、歩いて帰る',cx:240,cy:164,label:{x:240,y:173}}
];
export function imperialZoneAt(x,y){
 if(x<176)return null;
 if(y>=157)return 'return-causeway';
 if(y>=103)return x<243?'living-water':'dry-water';
 if(x>=277)return 'imperial-remains';
 if(x>=244)return 'empty-ridge';
 if(x>=207&&y<91)return 'blackreach';
 return 'confluence';
}
const site=(id,name,form,x,y,w,h,ex,ey,desc,aside,options={})=>({
 id:'journey-imperial-'+id,name,kind:'imperial',form,x,y,w,h,
 entrance:{x:ex,y:ey},blocking:true,desc,aside,...options
});
export const IMPERIAL_SITES=[
 site('watercourt','合水の神殿','confluence',190,73,12,8,196,82,
  '三方から来た細い水路が、屋根のない庭で合わさる。縁の低い器には、両手を添える窪みがある。',
  '足台だけは新しい木だ。器の石は、足台よりずっと古い。',
  {sound:'drip',responses:['水を一杯注ぐ。三つの溝のうち、低い方へ静かに流れた。','輪を一つ回す。流れは変わり、石の裏側から小さく音が返る。','手を離す。溝の端に残った一滴が、遅れて落ちた。']}),
 site('receiving-wet','水を受ける神殿','receiving-wet',217,124,10,8,222,133,
  '六本の柱と、左右に並ぶ浅い槽。水面には、柱の根元より上の模様まで映っている。',
  '遠い東の庭にも、同じ数の柱が、同じ向きに並んでいるという。',
  {sound:'drip',responses:['器を傾ける。細い水の筋が、左、右、中央の順に走る。','水が石の段を下りていく。戻ってきた音は、注いだ量より小さい。']}),
 site('receiving-dry','水を失った神殿','receiving-dry',257,124,10,8,262,133,
  '六本の柱と、左右に並ぶ浅い槽。水を受ける庭と同じ配置だが、底の段差まで歩いて見渡せる。',
  '水面の下にあった部分ほど、磨かれて滑らかだ。',
  {sound:'stone',responses:['空の器を傾ける。石の下で、乾いた小さなものが一つ転がった。','輪は同じ位置まで回る。溝の先には砂がある。水音は返らない。']}),
 site('closed-temple','閉じた応答殿','sealed',248,58,10,9,253,68,
  '窓のない低い神殿。人が通る扉は見当たらない。外壁に、手を添える幅だけの細い溝がある。',
  '飾りのような溝は、壁の向こう側へ続いている。',
  {responses:['手を添えて離す。入口のない壁の内側から、一度だけ石の擦れる音がした。','もう一度待つ。今度は何も聞こえない。石は同じ温度のままだ。']}),
 site('echo-court','巡音の石庭','echo-court',235,81,8,6,239,88,
  '低い石の環が四つ、重ならない間隔で置かれている。花も供物台もない。',
  '環の内側だけ、砂が細かく揃っている。風は外側にも吹いている。',
  {sound:'echo',responses:['小石で縁を打つ。近い環からではなく、奥の環から先に響いた。','同じ場所を打つ。同じ順序で、少しずつ短い音が返る。']}),
 site('black-pair','間のある二枚石','monolith',218,48,5,11,221,60,
  '二枚の黒い石のあいだに、細い空が残っている。片方の表面にだけ、乾いた水の跡がある。',
  '離れて見ると、あいだの空の方が一枚の石に見える。',{sound:'echo'}),
 site('ridge-gauge','空槽の水尺','gauge',259,40,6,6,262,47,
  '尾根の上に、深い石槽と水位の刻みがある。水を汲んだ人のための段が、底まで続く。',
  '一番高い線には、指先が届かない。低い線にも誰かの傷がある。'),
 site('first-wall','帝都外郭の切れ目','gate',282,64,14,6,289,71,
  '大きな門の左右に、折れた壁が続く。飾りの帯と水尺の線が、同じ高さで途切れている。',
  '遠くで細い線に見えたものは、門のいちばん上の縁だった。',{blocking:false,solid:[{x:0,y:0,w:5,h:6},{x:9,y:0,w:5,h:6}]}),
 site('acropolis','帝都の奥の高壇','acropolis',286,34,14,12,293,47,
  '幾重もの石段と、屋根を失った列柱。その奥に、まだ別の建物の輪郭が重なっている。',
  '誰がここを帝都と呼び始めたのか、街道の人も知らなかった。'),
 site('goddess-fragment','顔のない壁龕','niche',301,47,6,11,304,59,
  '壁の高い窪みに、像の膝と衣の端だけが残っている。表情を確かめられる部分はない。',
  '衣の襞の下に、水を逃がす穴がある。その先の溝には砂がたまっている。'),
 site('capital-cistern','帝都の空の貯水庭','cistern',283,82,14,9,290,92,
  '街区ほどの槽に、乾いた底石が見える。柱には、別々の高さで小さな舟の擦り跡が残る。',
  '入口の石段は一つだが、水があった頃には、どこからでも舟で入れたのだろう。',{blocking:false}),
 site('road-inn','水路宿の灯','inn',211,156,9,6,215,163,
  '古い船着場に、旅人のための小さな宿がある。入口の上には舟の櫂が一本。',
  '夕食の椀は全部違う。割れたときだけ、隣の町から買い足すらしい。',{sound:'kettle'}),
 site('wet-stairs','水へ降りる七段','stairs-wet',211,109,5,5,213,115,
  '七段の石段のうち、下の三段は水に隠れている。岸には小舟を結ぶ輪。',
  '水を受ける庭の柱と、輪の高さが揃っている。',{blocking:false,afloat:true}),
 site('dry-stairs','水を待つ七段','stairs-dry',251,109,5,5,253,115,
  '同じ七段の石段が、白い底へ降りている。舟を結ぶ輪は、頭より高い。',
  '段の途中に、今は小さな草が根を張っている。',{blocking:false}),
 site('dry-pier','陸に残った桟橋','pier',278,139,9,5,282,145,
  '背の高い橋脚と、何も載っていない荷揚げ台。真下を歩くと、舟の大きさが初めて分かる。',
  '柱の陰で、誰かが昼食の殻をまとめて捨てている。',{blocking:false}),
 site('relay-bowl','街道の受け皿','bowl',200,98,5,4,202,103,
  '神殿から離れた小さな受け皿。器の縁は、道の方へ少し低い。',
  '旅人は手を洗い、山羊はその先の溝から水を飲む。',{sound:'drip',blocking:false}),
 site('capital-road','帝都を指す古い里程柱','marker',268,31,4,5,270,37,
  '文字は読めないが、柱の矢印は、山ではなく壁の切れ目に向いている。',
  '裏面には、反対方向へ行く人のための小さな印。',{blocking:false}),
 site('little-game','輪を回す小さな台','wheel',195,111,5,4,198,116,
  '低い台に石の輪が一つ。小さな手でも回せる幅に、縁が丸く削られている。',
  '輪の先から伸びる溝は、地面の下へ消えている。',
  {sound:'wood',blocking:false,responses:['輪が一つ回る。台の下で、小さな石が持ち上がって戻った。','同じ位置まで回す。同じ音がする。少し遠くの水音は変わらない。']}),
 site('outer-bridge','古水道の横断橋','bridge',243,154,8,4,247,159,
  '橋の下には、もう川のない水路がある。橋を残したまま、横に新しい踏み跡ができている。',
  'どちらを通っても、帰り舟のない街道へ出る。',{blocking:false})
];
const npc=(id,name,role,x,y,a,b)=>({id:'journey-imperial-'+id,name,role,x,y,color:'#c2b6a2',lines:[a,b]});
export const IMPERIAL_NPCS=[
 npc('cup-child','器を洗う子','水路の子供',204,84,'下の畑へ行く水だから、砂を入れないでって。','でも落ち葉はいいんだって。落ち葉だけ、ずるい。'),
 npc('channel-mender','溝を直す人','水路の職人',202,108,'石が減ったぶんだけ継ぎ足す。大きく直すと、流れが変わるからね。','昔の人も、何度も直しているよ。古い石の全部が最初の石じゃない。'),
 npc('reed-maker','籠を編む人','水庭の住人',227,145,'水は毎日来る。だから籠も毎日濡れる。干す場所が足りないよ。','東の庭の人とは、市で会う。あっちは砂が細かいんだ。'),
 npc('dry-reader','底石を写す人','干上がった庭の旅人',267,145,'向こうでは見えなかった溝が、ここでは全部見える。','同じ形だと思ったら、最後の分かれ目だけ少し違う。'),
 npc('ridge-walker','尾根を越える人','街道の旅人',269,43,'遠くの白い線？ あれが門の上だよ。門までは、まだ歩く。','見えたら着いた気になるんだ。毎回ね。'),
 npc('capital-mason','門を写す石工','帝都跡の測り手',280,74,'この門の真ん中は、今でも水準が揃っている。','隣の崩れた所の方が近道だけど、わたしはこっちを通る。'),
 npc('inn-cook','鍋を見ている人','水路宿の主人',219,163,'舟が来なくなってから、入口をこっちへ付け替えたんだ。','北から来たなら座っていきな。帰る人にも、これからの人にも同じ鍋だ。'),
 npc('quiet-listener','石の間を測る人','列石谷の旅人',229,72,'石の幅より、石と石の間を測っているんです。','少しずつ違うでしょう。違わないところもあるんです。')
];
export const IMPERIAL_VISTAS=[
 {id:'imperial-confluence',x:205,y:88,radius:4,title:'三つの水が合わさる',sub:'小さな器から、畑まで続く流れが見える。',kind:'imperial-confluence'},
 {id:'imperial-blackreach',x:228,y:73,radius:4,title:'石ではなく、間を見る',sub:'遠くほど揃って見える列が、近くでは少しずつ違っている。',kind:'imperial-blackreach'},
 {id:'imperial-ridge',x:269,y:43,radius:4,title:'白い線の向こう',sub:'尾根の先に、門と水道と街の残骸が重なる。',kind:'imperial-capital'},
 {id:'imperial-gate',x:293,y:76,radius:4,title:'帝都の門前に立つ',sub:'門の向こうにも、まだ幾つもの門がある。',kind:'imperial-capital-near'},
 {id:'imperial-wet',x:222,y:145,radius:4,title:'水面が隠す神殿',sub:'柱と舟の輪が、同じ水面に映っている。',kind:'imperial-wet'},
 {id:'imperial-dry',x:262,y:145,radius:4,title:'水が去って見える神殿',sub:'同じ配置の底に、段と溝と大きな橋脚が現れる。',kind:'imperial-dry'},
 {id:'imperial-sealed',x:253,y:70,radius:4,title:'扉のない神殿',sub:'低い壁と、外から触れられる細い溝。それ以外は閉じている。',kind:'imperial-sealed'},
 {id:'imperial-return',x:240,y:164,radius:4,title:'水のいた高さを歩く',sub:'高い桟橋の下を、宿へ向かう小さな道が通る。',kind:'imperial-return'}
];
export const IMPERIAL_PALETTE={
 'study-meadow':'#a5b7a0','study-stone':'#c3c0ad','study-silt':'#d7cbb1',
 'study-water':'#6b9999','study-cliff':'#7e8987','study-black':'#444b50','study-masonry':'#9e9a88'
};
export const IMPERIAL_BLOCKED=['study-water','study-cliff','study-black','study-masonry'];
const shore=[[183,65],[194,56],[197,39],[209,24],[234,19],[250,30],[266,19],[293,23],[309,42],[312,73],[301,92],[307,116],[299,144],[278,163],[246,178],[220,172],[205,156],[195,143],[192,113],[181,97]];
function inPolygon(x,y){let inside=false;for(let i=0,j=shore.length-1;i<shore.length;j=i++){
 const [a,b]=shore[i],[c,d]=shore[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;
}return inside;}
export function basinChannel(dx,dy){
 return (Math.abs(dx)>=8&&Math.abs(dx)<=10&&dy>=-16&&dy<=15)||
  (Math.abs(dx)<=10&&dy>=-16&&dy<=-11)||
  (Math.abs(dx)<=10&&dy>=8&&dy<=11);
}
export function paintImperialLand(tiles,set){
 for(let y=16;y<=179;y++)for(let x=181;x<=313;x++){
  if(!inPolygon(x,y))continue;
  const zone=imperialZoneAt(x,y);
  let tile=zone==='confluence'||zone==='living-water'?'study-meadow':zone==='blackreach'||zone==='imperial-remains'?'study-stone':'study-silt';
  if(zone==='empty-ridge'&&Math.abs(x-255-Math.sin(y*.12)*3)<2.5&&y>41&&y<81)tile='study-cliff';
  if(zone==='confluence'&&y>=76&&y<=112&&Math.abs(x-(205+2*Math.sin(y*.13)))<1.2)tile='study-water';
  for(const [cx,wet] of [[222,true],[262,false]])if(basinChannel(x-cx,y-127))tile=wet?'study-water':'study-silt';
  set(x,y,tile);
 }
 // Visible, finite obstacles. The column valley has more than one route around it.
 for(const [cx,cy] of [[212,48],[226,45],[233,63],[215,74],[229,82]])
  for(let y=cy;y<cy+5;y++)for(let x=cx;x<cx+2;x++)if(tiles[y][x]!=='~')set(x,y,'study-black');
 // Broken city walls, with actual gaps at the road and courtyards.
 for(let y=51;y<=100;y++)if(y<66||y>71)for(let x=279;x<=280;x++)if(tiles[y][x]!=='~')set(x,y,'study-masonry');
 for(let x=281;x<=302;x++)if(x<289||x>294)if(tiles[79][x]!=='~')set(x,79,'study-masonry');
}
const distance=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
export const IMPERIAL_CONNECTOR={x1:170,x2:188,y:72};
export function paintImperialRoads(tiles,set){
 // The only edits west of x=176 are this explicit physical bridge across the old coast.
 for(let x=170;x<=188;x++)set(x,72,['~','study-water'].includes(tiles[72][x])?'+':tiles[72][x]);
 const roads=[
  [[188,72],[188,83],[196,82],[198,84],[211,86],[223,80],[222,61],[233,56],[245,46],[262,32],[270,37],[278,39],[280,48],[293,47]],
  [[198,84],[202,103],[202,108],[198,116],[202,137],[210,151],[213,163],[240,164],[265,159],[282,145],[293,126],[293,100],[293,80],[293,76],[289,71],[280,71]],
  [[210,151],[222,145],[222,133]],[[222,133],[222,112],[223,80]],
  [[265,159],[262,145],[262,133]],[[262,133],[262,112],[271,99],[279,100],[290,100],[290,92]],
  [[211,86],[213,98],[213,115]],[[245,96],[253,115]],
  [[233,56],[245,56],[245,69],[253,68],[253,70],[261,91],[245,96],[239,88],[223,80]],
  [[262,32],[269,43],[262,47]],[[293,47],[297,59],[304,59]],
  [[280,71],[278,52],[280,48]],[[293,76],[293,80]],
  [[240,164],[247,159],[265,159]],[[253,115],[262,112]]
 ];
 for(const points of roads)for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];
  for(let y=Math.floor(Math.min(a[1],b[1])-1);y<=Math.ceil(Math.max(a[1],b[1])+1);y++)
   for(let x=Math.floor(Math.min(a[0],b[0])-1);x<=Math.ceil(Math.max(a[0],b[0])+1);x++){
    if(x<181||distance(x,y,a,b)>1.05)continue;
    const old=tiles[y]?.[x];
    if(!old||['~','study-black','study-masonry','study-cliff'].includes(old))continue;
    set(x,y,old==='study-water'?'+':'=');
   }
 }
}
const replies=new Map();
export function imperialResponse(site){
 if(site.kind!=='imperial'||!site.responses)return null;
 const state=(replies.get(site.id)||0);replies.set(site.id,state+1);
 return site.responses[state%site.responses.length];
}
export function imperialPhase(id){return replies.get(id)||0;}
