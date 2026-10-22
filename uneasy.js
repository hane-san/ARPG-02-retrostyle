// Subtle unease: Mother / Zelda-style "deep reading makes it scary" NPCs
// and attractive-but-eerie tracks for the wind-and-lake map.
// Not straight horror. Things that almost make sense until you think about them.

export const UNEASY_MOBS = [
  {id:'uneasy-m01', name:'昨日もここにいた人', role:'草原の住人', x:34, y:38, color:'#a090a0', lines:['昨日も、同じところを歩いていたね。','……今日が、初めてだとしても。']},
  {id:'uneasy-m02', name:'名前を知っている子供', role:'湖岸の子供', x:102, y:60, color:'#b0a8b8', lines:['あなたの名前、知ってるよ。','誰かに聞いたわけじゃないけど。']},
  {id:'uneasy-m03', name:'帰ってきた人', role:'塩原の人', x:78, y:22, color:'#a8a0b0', lines:['やっと帰ってきた。','でも、帰る場所はもうないのに。']},
  {id:'uneasy-m04', name:'数えている老人', role:'茶屋の近く', x:47, y:68, color:'#b8a8a0', lines:['あなたが通った回数、数えてるよ。','……三回目、だね。']},
  {id:'uneasy-m05', name:'影の方を向いている人', role:'草原の観察者', x:28, y:38, color:'#a0b0a8', lines:['あなたの影、今日は少し長いね。','自分の影より、長くなってる。']},
  {id:'uneasy-m06', name:'水の中の人', role:'湖岸の住人', x:105, y:52, color:'#a8b0b8', lines:['水の中から、誰かが呼んでる気がする。','……あなたの声に、似てる。']},
  {id:'uneasy-m07', name:'地図にいない道を知る人', role:'旅人', x:40, y:28, color:'#b0a0a8', lines:['この道、地図には載ってない。','でも、昨日はあった気がする。']},
  {id:'uneasy-m08', name:'まだここにいる人', role:'港の近く', x:16, y:76, color:'#a8a8b0', lines:['もう帰った人なのに、まだここにいる。','……あなたも、そうかもしれない。']},
  {id:'uneasy-m09', name:'石に似ている人', role:'モノリス近く', x:52, y:18, color:'#b0b0a0', lines:['あの石、昔は人だったって話、聞いたことある？','……似てる、と思っただけだよ。']},
  {id:'uneasy-m10', name:'次に来る人を待っている人', role:'塩原の端', x:88, y:16, color:'#a0a8b0', lines:['次に来る人を、待ってる。','……あなたが、次の人だったらいいな。']}
];

const MIN=[0,2,3,5,7,8,10],DOR=[0,2,3,5,7,9,10];
const WAVE=[.5,.5,1,1,.5,.5,1,1];
const SAIL=[.5,.5,1,1,.5,.5,1,3];
// The same lapping pulse stretched to fill a 4/4 phrase (eight beats).
const WAVE4=[1,.5,.5,1,.5,.5,1,3];
const WALTZ=[1,.5,.5,1,.5,.5,1,1];

function phrases(src){
 const lines=src.trim().split('|');
 if(lines.length!==4)throw Error('four phrases required');
 return lines.map(p=>{
  const notes=p.trim().split(/\s+/).map(Number);
  if(notes.length!==8||notes.some(n=>!Number.isFinite(n)))throw Error('eight scale degrees required');
  return notes;
 });
}
function part(title,bpm,scale,rhythm,chords,notes,detail={}){
 return {title,bpm,scale,rhythm,chords,melody:phrases(notes),...detail};
}
const a=(title,bpm,scale,rhythm,chords,notes,detail)=>part(title,bpm,scale,rhythm,chords,notes,detail);

export const UNEASY_SCORES=[
 // Attractive but slightly wrong. Beautiful minor with a thin, persistent pulse.
 {name:'まだここにいる',root:58,meter:4,lead:'flute',arp:'harp',
  ally:a('名前を呼ばれる前に',96,MIN,SAIL,[0,3,5,4,0,2,3,0],
   '0 2 3 5 4 2 1 0 | 2 3 5 4 2 3 1 0 | 4 3 2 0 1 2 3 1 | 3 2 1 0 2 1 0 -1',
   {arpVel:.065,padVel:.085,drumEvery:4,leadArticulation:.95}),
  hostile:a('次の人が来るまで',104,DOR,WAVE4,[0,5,3,4,2,5,4,0],
   '4 3 1 0 2 3 2 1 | 2 4 5 3 2 1 0 2 | 5 4 2 3 1 2 0 1 | 3 2 1 0 1 2 1 0',
   {leadVel:.28,padVel:.09,drumEvery:2})},

 // Cool, slightly dissonant, but still melodic. Zelda-dark-world feeling.
 {name:'水の中の声',root:62,meter:3,lead:'strings',arp:'harp',
  ally:a('対岸から聞こえる',90,MIN,WALTZ,[0,3,5,2,0,4,3,0],
   '4 2 3 0 1 3 2 0 | 5 3 4 2 0 2 1 -1 | 3 5 4 2 3 1 2 0 | 4 3 1 2 0 -1 1 0',
   {padVel:.1,bassVel:.13,drumEvery:4,leadArticulation:.92}),
  hostile:a('自分の声に似ている',98,DOR,WAVE,[0,5,3,4,0,2,1,4],
   '0 2 3 5 4 3 2 1 | 3 4 5 3 2 1 3 2 | 5 4 2 3 1 2 0 1 | 4 3 2 0 1 2 1 0',
   {leadVel:.27,padVel:.095,drumEvery:2})}
];
