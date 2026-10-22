import {EXTRA_SCORES} from './extra-music.js';
import {SILK_SCORES} from './silk-music.js';
import {GROK_SCORES} from './grok-music.js';
import {UNEASY_SCORES} from './uneasy.js';
import {holdFadeAt} from './journey-sound.js';
import {holdEnvelopeAt} from './audio-envelope.js';
import {renderMusicLoop,createMusicLoopCache} from './music-loop.js';
// Original map scores. No samples, downloads, quotes or melodies from other games.
// A score has a composed A/B melody, harmony, bass and countermelody, then a varied reprise.
const major=[0,2,4,5,7,9,11],minor=[0,2,3,5,7,8,10];
export const SCORES=[
 {name:'霧河',root:62,meter:3,lead:'flute',arp:'harp',ally:{title:'川霧を越えて',bpm:98,scale:major,chords:[0,3,4,0,5,3,4,0],melody:[[0,2,4,5,4,2,1,0],[2,4,6,7,6,4,3,2],[5,7,6,4,3,2,4,1],[2,3,4,6,5,2,1,0]]},hostile:{title:'霧中の足音',bpm:108,scale:minor,chords:[0,5,3,4,0,2,4,0],melody:[[4,4,3,1,0,2,3,4],[5,4,2,1,3,2,0,-1],[0,2,3,5,4,3,1,2],[4,3,2,1,0,-1,1,0]]}},
 {name:'二戦線',root:57,meter:4,lead:'strings',arp:'harp',ally:{title:'守り継ぐ旗',bpm:116,scale:minor,chords:[0,3,5,4,0,2,3,4],melody:[[0,0,4,3,2,3,4,7],[6,5,4,2,3,4,2,1],[3,5,7,6,5,3,2,4],[5,4,3,2,1,-1,1,0]]},hostile:{title:'挟撃の鼓動',bpm:124,scale:minor,chords:[0,4,0,5,3,2,4,4],melody:[[0,1,0,-1,2,1,3,2],[4,3,4,2,1,0,2,1],[5,5,4,2,3,2,0,-1],[4,2,1,-1,0,1,-1,0]]}},
 {name:'灰城',root:52,meter:4,lead:'horn',arp:'strings',ally:{title:'灰を裂く光',bpm:112,scale:minor,chords:[0,5,2,4,3,5,4,0],melody:[[0,4,7,6,4,3,2,4],[5,7,6,4,2,3,4,2],[3,4,5,7,6,5,3,4],[2,4,6,5,4,2,1,0]]},hostile:{title:'城壁の残響',bpm:120,scale:minor,chords:[0,1,4,0,5,3,4,0],melody:[[0,0,-1,0,3,2,1,-1],[4,3,1,0,2,1,-1,-3],[3,4,3,1,0,2,1,0],[4,2,3,1,0,-1,1,0]]}},
 {name:'三橋',root:55,meter:3,lead:'flute',arp:'harp',ally:{title:'三つの橋の旅路',bpm:108,scale:major,chords:[0,4,5,3,0,2,3,4],melody:[[4,5,7,6,4,2,3,4],[2,3,5,4,2,1,0,2],[5,6,7,9,7,5,4,3],[4,6,5,3,2,4,1,0]]},hostile:{title:'流れを塞ぐ槍',bpm:118,scale:minor,chords:[0,3,4,0,5,2,4,0],melody:[[2,2,4,3,1,0,1,2],[4,5,3,2,0,-1,0,1],[5,4,6,5,3,2,3,4],[3,2,4,2,1,-1,1,0]]}},
 {name:'雨森',root:62,meter:3,lead:'harp',arp:'flute',ally:{title:'木洩れ雨の回廊',bpm:88,scale:minor,chords:[0,3,5,2,0,5,3,4],melody:[[4,2,3,0,1,3,2,0],[5,3,4,2,0,2,1,-1],[3,5,6,4,2,3,1,2],[4,3,1,2,0,-1,1,0]]},hostile:{title:'雨幕の追跡',bpm:102,scale:minor,chords:[0,5,0,4,3,1,4,0],melody:[[0,2,1,3,2,4,3,1],[2,4,3,5,4,2,1,0],[3,2,5,4,6,3,2,1],[4,3,2,0,1,-1,1,0]]}},
 {name:'暁城',root:60,meter:4,lead:'horn',arp:'harp',ally:{title:'暁の城塞へ',bpm:122,scale:major,chords:[0,5,3,4,0,2,3,4],melody:[[0,4,3,5,7,6,4,2],[3,5,4,6,7,5,4,3],[5,7,9,7,6,4,5,3],[4,6,7,5,4,2,1,0]]},hostile:{title:'最後の防壁',bpm:130,scale:minor,chords:[0,4,5,3,0,1,4,0],melody:[[7,4,5,3,4,2,3,0],[5,3,4,2,3,1,2,-1],[3,6,5,7,4,5,2,3],[4,3,1,2,0,-1,1,0]]}}
];
export const BONUS_SCORES=[
];
export const MUSIC_LIBRARY=[...SCORES,...BONUS_SCORES,...EXTRA_SCORES,...SILK_SCORES,...GROK_SCORES,...UNEASY_SCORES];
const degree=(root,scale,n)=>root+12*Math.floor(n/7)+scale[((n%7)+7)%7];
export function buildTrack(mapId,phase=1){
 const score=MUSIC_LIBRARY[mapId]||SCORES[0],side=phase===1?'ally':'hostile',part=score[side],bar=score.meter,length=bar*32;
 const rhythm=part.rhythm||(bar===3?[.5,.5,.5,.5,1,.5,.5,2]:[1,.5,.5,1,1,1,1,2]),events=[];
 const push=(beat,duration,n,voice,velocity,pan=0)=>events.push({beat,duration,midi:degree(score.root,part.scale,n),voice,velocity,pan});
 for(let pass=0;pass<4;pass++)for(let phrase=0;phrase<4;phrase++){
  let beat=pass*bar*8+phrase*bar*2;
  for(const [i,n]of part.melody[phrase].entries()){push(beat,rhythm[i]*(part.leadArticulation??.9),n+(pass===2&&phrase===2?7:0),score.lead,part.leadVel??.32,0);if(pass%2===1&&i%2===0)push(beat+.08,Math.min(rhythm[i],.8),n-7,'flute',.07,.3);beat+=rhythm[i];}
 }
 for(let i=0;i<32;i++){
  const beat=i*bar,chord=part.chords[i%8];
  for(const n of [chord-7,chord-5,chord-3])push(beat,bar*.94,n,'pad',part.padVel??.075,-.18);
  push(beat,bar*.65,chord-14,'bass',part.bassVel??.24,0);if(side==='hostile'||bar===4)push(beat+bar/2,.7,chord-10,'bass',part.offbeatBassVel??.14,0);
  for(let j=0;j<bar*2;j++)push(beat+j/2,.35,chord+(part.arpPattern||[0,2,4,2,0,4,2,4])[j%8],score.arp,part.arpVel??.09,.22);
  if(i%(part.drumEvery??(side==='hostile'?1:2))===0)events.push({beat,duration:.12,midi:38,voice:'drum',velocity:part.drumVel??(side==='hostile'?.18:.10),pan:0});
 }
 events.sort((a,b)=>a.beat-b.beat);
 return {mapId,side,title:part.title,bpm:part.bpm,beats:length,seconds:length*60/part.bpm,events};
}
