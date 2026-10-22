// A newly drawn, opt-in walking country. No coordinates are cropped from either
// original world. The existing mainland A* already indexes by world.w / world.h.
import {silkPath} from './silk-world.js';
import {EXTENSION_ZONES,EXTENSION_SITES,EXTENSION_NPCS,EXTENSION_VISTAS,paintJourneyExpansion,paintJourneyExpansionRoads,extensionZoneAt} from './journey-expansion.js';
import {GROK_VILLAGERS} from './grok-villagers.js';
import {ART_OBJECTS, WEIRD_MOBS} from './art-objects.js';
import {DISTANT_VISTAS} from './distant-vistas.js';
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
// ... (existing sites and relics kept)
JOURNEY_SITES.push(...EXTENSION_SITES);
JOURNEY_SITES.push(...ART_OBJECTS);
export const JOURNEY_NPCS=[
 // (existing NPCs kept)
];
// (existing NPC pushes kept)
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
JOURNEY_VISTAS.push(...DISTANT_VISTAS);
JOURNEY_VISTAS.push(...EXTENSION_VISTAS);

// Finish the already occupied edge before rerouting. Starting a new path from
// the previous tile while between cells can otherwise cut an obstacle's corner.
export function routeJourneyWalk(world,hero,target){
 const inTransit=Math.hypot(hero.px-hero.x,hero.py-hero.y)>.0001;
 const next=inTransit&&hero.path.length?hero.path[0]:null;
 const path=world.findPath(world,next||{x:hero.x,y:hero.y},target);
 return path?(next?path:path.slice(1)):null;
}
