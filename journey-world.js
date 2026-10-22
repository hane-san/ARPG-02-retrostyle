// A newly drawn, opt-in walking country. No coordinates are cropped from either
// original world. The existing mainland A* already indexes by world.w / world.h.
import {silkPath} from './silk-world.js';
import {EXTENSION_ZONES,EXTENSION_SITES,EXTENSION_NPCS,EXTENSION_VISTAS,paintJourneyExpansion,paintJourneyExpansionRoads,extensionZoneAt} from './journey-expansion.js';
import {GROK_VILLAGERS} from './grok-villagers.js';
import {ART_OBJECTS, WEIRD_MOBS} from './art-objects.js';
import {RUINS_ZONES,RUINS_SITES,RUINS_NPCS,RUINS_VISTAS,paintJourneyRuins,paintJourneyRuinsRoads,ruinsZoneAt} from './journey-ruins.js';

export const JOURNEY_W=176,JOURNEY_H=136;
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
JOURNEY_ZONES.push(...EXTENSION_ZONES);
export const JOURNEY_SITES=[
 {id:'journey-terminal',name:'白い連絡舎',kind:'terminal',x:7,y:68,w:9,h:6,entrance:{x:12,y:75},desc:'海辺の連絡舎。白い折屋根の下で、草原を越える荷物と湖から届く籠が同じ台車を待っている。',aside:'帰りの船の時刻は書いていない。軒先の灯りは、誰が戻ってもいいようについている。'},
 {id:'journey-chaikhana',name:'水路の茶屋',kind:'teahouse',x:42,y:63,w:8,h:5,entrance:{x:46,y:69},desc:'湖から引いた小さな水路のそばのチャイハナ。畑の仕事がひと段落すると、誰かが黙って湯を足す。',aside:'片方だけの手袋が窓辺に並んでいる。落とし主は違っても、冬までには組になるらしい。'},
 {id:'journey-monolith',name:'名のない石',kind:'monolith',x:52,y:8,w:6,h:10,entrance:{x:55,y:19},desc:'草原から見えていた、ひとつだけの巨大な石。継ぎ目も窓もない。遠くでは細い線だった影が、ここでは空を分けている。',aside:'足元に、小石で押さえた古い紙がある。何も書かれていない面が上を向いている。'},
 {id:'journey-ship',name:'潮を待つ船',kind:'shipwreck',x:86,y:17,w:8,h:4,entrance:{x:90,y:22},desc:'白い塩地に船が残る。修理した舷側と、外して持ち帰った部品の跡。人がここを離れた日は、一日ではなかったのだろう。',aside:'船名の文字は薄い。誰かが最近、船底の陰に水の器を置いている。'},
 {id:'journey-hut',name:'青い岸の小屋',kind:'lakehut',x:95,y:67,w:6,h:4,entrance:{x:98,y:72},desc:'水位を測る棒と、干してある網。対岸の畑へ渡す種を、小屋の人が毎春預かっている。',aside:'空箱には「壊れ物ではないが、急がないこと」とだけ書いてある。'},
 {id:'journey-terrace',name:'夕空の石段',kind:'terrace',x:75,y:73,w:5,h:2,entrance:{x:77,y:76},blocking:false,desc:'湖へ向いた低い石段。座るためか、かつて水へ降りるためだったのか。今は夕焼けを見る人がときどき立ち寄る。',aside:'少し北へ戻れば湖岸、遠回りすれば茶屋。同じ水辺に、別の帰り道がある。'}
];
// Reversible scenario sketches: grounded places, not an adopted chronology.
// Reliefs are nonblocking to preserve the established walking network.
JOURNEY_SITES.push(...[
 {
  "id": "journey-pilgrim-deck",
  "name": "巡礼船の甲板",
  "kind": "relic",
  "form": "boat",
  "x": 8,
  "y": 78,
  "w": 6,
  "h": 3,
  "entrance": {
   "x": 15,
   "y": 80
  },
  "blocking": false,
  "desc": "幼い巡礼者が夜ごと戻った船。甲板には消えかけた遊びの線と、幾つもの背丈を刻んだ柱。",
  "aside": "今は船が動かなくても、誰かの帰りを待つ灯りがともる。"
 },
 {
  "id": "journey-waterline",
  "name": "昔の水位標",
  "kind": "relic",
  "form": "marker",
  "x": 24,
  "y": 55,
  "w": 4,
  "h": 3,
  "entrance": {
   "x": 28,
   "y": 59
  },
  "blocking": false,
  "desc": "高い位置にいくつもの水位の刻み。いまは草の根が届くほど遠くなった水面を、昔は毎年測っていた。",
  "aside": "最後の三本だけ、文字が急いで彫られている。"
 },
 {
  "id": "journey-children-gate",
  "name": "子供道の石門",
  "kind": "relic",
  "form": "arch",
  "x": 22,
  "y": 26,
  "w": 5,
  "h": 3,
  "entrance": {
   "x": 26,
   "y": 30
  },
  "blocking": false,
  "desc": "小さな靴跡が石を磨いた巡礼道。かつて大人が子供たちをここで引き返させた。",
  "aside": "今では誰も止めない。あんなに遠かった向こう側まで、ほんの数歩だ。"
 },
 {
  "id": "journey-watchpost",
  "name": "関守の見张り台",
  "kind": "relic",
  "form": "watch",
  "x": 48,
  "y": 42,
  "w": 5,
  "h": 3,
  "entrance": {
   "x": 50,
   "y": 46
  },
  "blocking": false,
  "desc": "巡礼団を見守る木と石の台。古い札には『ここから先は大人と』とある。",
  "aside": "止める人がいなくなった後も、札を直す人はいる。"
 },
 {
  "id": "journey-compass",
  "name": "星図の方位盤",
  "kind": "relic",
  "form": "disc",
  "x": 39,
  "y": 22,
  "w": 5,
  "h": 3,
  "entrance": {
   "x": 42,
   "y": 27
  },
  "blocking": false,
  "desc": "草原の巨大な方位盤。線は方角を示すようで、消えた島々にも向いている。",
  "aside": "水上の巡礼で聞いた港の名前が、石の端に刻まれている。"
 },
 {
  "id": "journey-chain-mark",
  "name": "連環の基標",
  "kind": "relic",
  "form": "disc",
  "x": 33,
  "y": 49,
  "w": 6,
  "h": 4,
  "entrance": {
   "x": 36,
   "y": 54
  },
  "blocking": false,
  "desc": "草に半分埋もれた環状の礎石。線は不思議なほど真っ直ぐで、道とは角度が違う。",
  "aside": "巡礼者は祝福の印、測り手は古い座標と呼ぶ。"
 },
 {
  "id": "journey-sunken-aisle",
  "name": "水底の回廊",
  "kind": "relic",
  "form": "arch",
  "x": 55,
  "y": 39,
  "w": 6,
  "h": 4,
  "entrance": {
   "x": 55,
   "y": 44
  },
  "blocking": false,
  "desc": "水底から現れた直線の回廊。波間に見えていた柱は、長い構造物の先端だった。",
  "aside": "古い石畳に日陰ができ、涼しい時間だけ小さな店が開く。"
 },
 {
  "id": "journey-new-garden",
  "name": "移住者の苗床",
  "kind": "relic",
  "form": "garden",
  "x": 56,
  "y": 65,
  "w": 6,
  "h": 4,
  "entrance": {
   "x": 62,
   "y": 69
  },
  "blocking": false,
  "desc": "昔の漁網を支柱にして苗木を育てる庭。住民は失われた港の名前を木につける。",
  "aside": "豊かな土ではない。でも雨のあと、最初に芽を出すのはここだ。"
 },
 {
  "id": "journey-new-market",
  "name": "石陰の夕市",
  "kind": "relic",
  "form": "market",
  "x": 65,
  "y": 69,
  "w": 6,
  "h": 4,
  "entrance": {
   "x": 69,
   "y": 74
  },
  "blocking": false,
  "desc": "露出した橋脚の陰の夕市。塩採り、船乗り、巡礼者が同じ屋台に並ぶ。",
  "aside": "巨大な壁は怖くないかと聞くと、店主は『夏は涼しい』と笑う。"
 },
 {
  "id": "journey-reverse-steps",
  "name": "水のない船階段",
  "kind": "relic",
  "form": "stairs",
  "x": 72,
  "y": 76,
  "w": 5,
  "h": 3,
  "entrance": {
   "x": 73,
   "y": 79
  },
  "blocking": false,
  "desc": "水面へ降りていた石段が、今は旧湖底へ続く。濡れていた段ほど明るい色をしている。",
  "aside": "一番下に子供の名前が彫られている。誰がいつ書いたのかは分からない。"
 },
 {
  "id": "journey-circle-altar",
  "name": "現れた円環祭壇",
  "kind": "relic",
  "form": "disc",
  "x": 71,
  "y": 21,
  "w": 7,
  "h": 5,
  "entrance": {
   "x": 75,
   "y": 28
  },
  "blocking": false,
  "desc": "沈んでいた同心円が露出した。中央の祭壇には持ち寄られた灯りが並ぶ。",
  "aside": "古代人が祈るために作ったのか、後世の人が祈る場所にしたのか。"
 },
 {
  "id": "journey-new-parvis",
  "name": "露出聖地の門前町",
  "kind": "relic",
  "form": "market",
  "x": 77,
  "y": 10,
  "w": 7,
  "h": 5,
  "entrance": {
   "x": 81,
   "y": 17
  },
  "blocking": false,
  "desc": "石段を見に人が集まってできた新しい町。祈る人、商う人、ただ見たい人。",
  "aside": "鐘と鍛冶の音と荷車のきしみ。古い文明の全身が現れても夕飯の仕度は続く。"
 },
 {
  "id": "journey-salt-well",
  "name": "塩採りの共同井戸",
  "kind": "relic",
  "form": "well",
  "x": 95,
  "y": 22,
  "w": 5,
  "h": 4,
  "entrance": {
   "x": 96,
   "y": 27
  },
  "blocking": false,
  "desc": "白い塩地の共同井戸。水は乏しいが、旅人にも一杯だけ分ける約束がある。",
  "aside": "誰が決めたのか。祖母はもっと昔からだと言った。"
 },
 {
  "id": "journey-giant-wall",
  "name": "白い巨壁の足元",
  "kind": "relic",
  "form": "wall",
  "x": 98,
  "y": 29,
  "w": 7,
  "h": 5,
  "entrance": {
   "x": 102,
   "y": 35
  },
  "blocking": false,
  "desc": "視界の端まで真っ直ぐ伸びる壁。昔水面から見えたのは頂上の細い縁だけだった。",
  "aside": "等間隔の傷は文字ではない。なのに誰かの選択を数えているように見える。"
 },
 {
  "id": "journey-balance-gate",
  "name": "天秤の石門",
  "kind": "relic",
  "form": "arch",
  "x": 69,
  "y": 17,
  "w": 5,
  "h": 4,
  "entrance": {
   "x": 71,
   "y": 23
  },
  "blocking": false,
  "desc": "山と塩原の境に立つ二本の柱。左右に釣り合う溝があるが、同じ量を載せた形跡はない。",
  "aside": "『公平』とは何を等しくすることか、と小さく彫られている。"
 },
 {
  "id": "journey-lost-bells",
  "name": "散った鈴の石畳",
  "kind": "relic",
  "form": "marker",
  "x": 27,
  "y": 43,
  "w": 5,
  "h": 3,
  "entrance": {
   "x": 30,
   "y": 47
  },
  "blocking": false,
  "desc": "巡礼者の小さな鈴が石畳の隙間に残る。誰かが拾わず並べ直している。",
  "aside": "昔の仲間がつけた結び目がひとつだけ残っていた。"
 }
]);

JOURNEY_SITES.push(...EXTENSION_SITES);
JOURNEY_SITES.push(...ART_OBJECTS);
export const JOURNEY_NPCS=[
 {id:'journey-keeper',name:'灯りをともす人',role:'船着場の番人',x:18,y:76,color:'#d5b995',lines:['草原へ？ 橋を渡ったら、円い道の好きなほうへどうぞ。','遠くの黒い石は、ここからも見えるんです。夕方は湖の南岸がきれいですよ。','帰ってきたら、白い屋根を目印に。灯りは消しませんから。']},
 {id:'journey-host',name:'茶屋の主人',role:'チャイハナの店主',x:50,y:70,color:'#c7a7a4',lines:['この畑の水は湖から。お茶の水は峠の泉から。味が違うって、みんな言うんです。','塩原へは峠を越えても、湖の岸を回っても行けます。','手袋？ 落とし主が戻らない年もあるから、先に洗っておくんですよ。']},
 {id:'journey-surveyor',name:'白い岸の測り手',role:'水位を記す人',x:82,y:28,color:'#a6b9bc',lines:['湖の水位を測ったあと、ここにも線を一本引いて帰ります。測れる水はもうないんですが。','船の部品は少しずつ、南の暮らしへ戻っていきました。なくなった物ばかりではありません。']},
 {id:'journey-fisher',name:'網を繕う人',role:'湖畔の住人',x:101,y:72,color:'#c2b88d',lines:['対岸がよく見える日は、かえって遠く感じます。','峠の人には種を、茶屋には魚を。帰りの荷物が軽くならないんですよ。','南の石段なら、夕空を少し眺めていけます。急がないのであれば。']}
];
JOURNEY_NPCS.push(...[
 {
  "id": "journey-deck-cook",
  "name": "船の炊事係",
  "role": "巡礼船の乗組員",
  "x": 18,
  "y": 79,
  "color": "#c9b5a1",
  "lines": [
   "船の台所は狭いけど、子供が十人来たって平気だったよ。",
   "今も毎年同じ献立を作ってる。誰かが帰るかもしれないから。"
  ]
 },
 {
  "id": "journey-pilgrim-friend",
  "name": "地図を持つ旅人",
  "role": "元・子供巡礼者",
  "x": 20,
  "y": 76,
  "color": "#d9c4a3",
  "lines": [
   "子供の頃、知らない島を全部地図に描いたんだ。",
   "今見たら、島の間にも道ができていた。地図が古くなっただけさ。"
  ]
 },
 {
  "id": "journey-gatekeeper",
  "name": "門に座る老人",
  "role": "巡礼道の語り手",
  "x": 31,
  "y": 29,
  "color": "#b8b2a2",
  "lines": [
   "昔は山道に大人の番人がいた。危ないから、というのも本当だったよ。",
   "誰にとって危なかったのかは、教えてくれなかったけどね。"
  ]
 },
 {
  "id": "journey-watch-scribe",
  "name": "古札を写す人",
  "role": "関所の記録係",
  "x": 47,
  "y": 48,
  "color": "#cdbca8",
  "lines": [
   "この札を撤去してほしい人も、残してほしい人もいる。",
   "もう通れない子のためか、通れる大人のためか。難しいですね。"
  ]
 },
 {
  "id": "journey-map-maker",
  "name": "線を引く絵師",
  "role": "地図を描く旅人",
  "x": 43,
  "y": 32,
  "color": "#b7bbc9",
  "lines": [
   "円く描いた島々が、実は一つの図形だったなんて。",
   "でも上から見た図形は、人が毎日歩く道とは違う。どちらも地図だよ。"
  ]
 },
 {
  "id": "journey-bells-keeper",
  "name": "鈴を集める子",
  "role": "新しい巡礼の案内人",
  "x": 34,
  "y": 56,
  "color": "#d7bca7",
  "lines": [
   "海を知らない子もいるよ。だから昔の船の話を聞くのが好き。",
   "ぼくらは陸路、おじいちゃんは船。どちらが本当の巡礼だろう。"
  ]
 },
 {
  "id": "journey-seed-grower",
  "name": "網を編む庭師",
  "role": "移住者の苗木職人",
  "x": 59,
  "y": 71,
  "color": "#a4bfa4",
  "lines": [
   "魚を捕る網だった。今は苗木が倒れないように使ってる。",
   "前と同じ暮らしじゃない。でも育てるのは、案外よく似ているよ。"
  ]
 },
 {
  "id": "journey-evening-seller",
  "name": "日陰の菓子売り",
  "role": "旧港の商人",
  "x": 67,
  "y": 78,
  "color": "#d2a795",
  "lines": [
   "昔は船の甲板で売っていた甘いものだよ。今は陸路を歩く子に売る。",
   "商売だけど、子供に一つ多く渡したのも本当さ。"
  ]
 },
 {
  "id": "journey-new-believer",
  "name": "円環に祈る人",
  "role": "新しい聖地の信徒",
  "x": 76,
  "y": 27,
  "color": "#c7c0a9",
  "lines": [
   "海が退いたのは祝福という人も、罰という人もいる。",
   "わたしは水を分け合うことの方を祈りと呼びたい。"
  ]
 },
 {
  "id": "journey-young-mason",
  "name": "古壁を測る石工",
  "role": "露出遺構の職人",
  "x": 95,
  "y": 29,
  "color": "#a8afb5",
  "lines": [
   "同じ間隔の線ばかり。造った人は途方もない忍耐があったんだろう。",
   "でも誰を守るための壁かは、石から分からない。"
  ]
 },
 {
  "id": "journey-wagon-driver",
  "name": "船を引く荷車乗り",
  "role": "元・川船の船員",
  "x": 108,
  "y": 37,
  "color": "#d5b5a1",
  "lines": [
   "昔は水路、今は荷車の道。便利になった場所もある。",
   "でも海を渡る歌を知る人は減っちまった。"
  ]
 },
 {
  "id": "journey-balance-guardian",
  "name": "二本柱の番人",
  "role": "門の案内役",
  "x": 70,
  "y": 19,
  "color": "#c0b8b4",
  "lines": [
   "左右を同じにするのが公平なら、片方にしか病人がいない日はどうする？",
   "ここを造った人も、答えに苦労したんでしょうね。"
  ]
 }
]);

JOURNEY_NPCS.push(...EXTENSION_NPCS);
const EXTRA_VOICE=[
 '遠いところへ行った人も、帰る人も、この風のなかでは同じ旅人ですね。',
 'わたしは昨日と今日の道の違いを見つけると、少し嬉しくなるんです。',
 'あそこに小さな灯りがあると、何故だか帰り道を覚えていられます。',
 '何年も経ってから、今のこの景色を思い出すのかもしれません。'
];
JOURNEY_NPCS.push(...GROK_VILLAGERS.map((n,i)=>({...n,lines:[...n.lines,EXTRA_VOICE[i%EXTRA_VOICE.length]]})));
JOURNEY_NPCS.push(...WEIRD_MOBS);
export const JOURNEY_BRIDGES=[
 {id:'journey-link',name:'白浜の連絡橋',axis:'h',x1:21,x2:32,y1:66,y2:68,center:{x:26,y:67}},
 {id:'journey-watercourse',name:'畑の水路橋',axis:'h',x1:50,x2:54,y1:73,y2:75,center:{x:52,y:74}}
];
export const JOURNEY_VISTAS=[
 {id:'departure',x:18,y:66,radius:5,title:'岸の向こう、石の影',sub:'まだ遠い石と、これから歩く草の海。',kind:'steppe'},
 {id:'stone',x:59,y:22,radius:5,title:'石影の向こうに',sub:'越えてきた道が、小さな線になる。',kind:'highland'},
 {id:'evening',x:77,y:76,radius:5,title:'夕空に、飲み込まれる',sub:'水も山も、いまは同じ光の中にある。',kind:'sunset'}
];

JOURNEY_VISTAS.push(...[
 {
  "id": "pilgrim-boat",
  "x": 19,
  "y": 79,
  "radius": 5,
  "title": "港に帰れば、仲間がいる",
  "sub": "濡れた桟橋、煮炊きの湯気。船の上にもう一つの故郷がある。",
  "kind": "fleet"
 },
 {
  "id": "child-threshold",
  "x": 29,
  "y": 31,
  "radius": 5,
  "title": "あの日の通れなかった道",
  "sub": "子供の肩より高かった門も、いまは景色の一部になった。",
  "kind": "pilgrim"
 },
 {
  "id": "exposed-altar",
  "x": 76,
  "y": 27,
  "radius": 5,
  "title": "現れた円環",
  "sub": "沈んでいた同心円が、いまは祈りの場になっている。",
  "kind": "altar"
 }
]);

JOURNEY_VISTAS.push(...EXTENSION_VISTAS);

// Finish the already occupied edge before rerouting. Starting a new path from
// the previous tile while between cells can otherwise cut an obstacle's corner.
export function routeJourneyWalk(world,hero,target){
 const inTransit=Math.hypot(hero.px-hero.x,hero.py-hero.y)>.0001;
 const next=inTransit&&hero.path.length?hero.path[0]:null;
 const path=world.findPath(world,next||{x:hero.x,y:hero.y},target);
 return path?(next?path:path.slice(1)):null;
}
