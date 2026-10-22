// Central Asia / Kyrgyz-inspired touches for the wind-and-lake map.
// Felt, high pasture, seasonal movement, tea, horses — subtle, not costume.
// Travel-feeling tracks: gentle but with forward motion (Ansaga-roller style rolling).

export const STEPPE_MOBS = [
  {id:'steppe-m01', name:'フェルトを編む人', role:'草原の住人', x:32, y:32, color:'#c4b090', lines:['この模様、昔はもっと赤かった。','今は風の色に近づいてる。']},
  {id:'steppe-m02', name:'季節を数える人', role:'高地の観察者', x:48, y:24, color:'#b8a888', lines:['羊が動く前に、草が先に動く。','草が動く前に、風が先に知ってる。']},
  {id:'steppe-m03', name:'馬の蹄を聞く人', role:'峠の近く', x:59, y:23, color:'#a89880', lines:['蹄の音が、遠くで止まらなくなった。','近づくと、もう誰も乗っていない。']},
  {id:'steppe-m04', name:'茶を運ぶ人', role:'茶屋の手伝い', x:44, y:62, color:'#c0a890', lines:['この茶は、峠を越えてきた。','味は、越えた回数で変わる。']},
  {id:'steppe-m05', name:'白い布を干す人', role:'塩原の端', x:82, y:26, color:'#d0c0a8', lines:['布は、塩の白さを覚えてる。','でも風が吹くと、また少し灰色になる。']},
  {id:'steppe-m06', name:'円い道を一周する人', role:'草原の歩き手', x:36, y:42, color:'#b0a080', lines:['一周するたびに、同じ風に出会う。','でも、出会う場所が少しずつずれる。']},
  {id:'steppe-m07', name:'石の模様を見る人', role:'モノリス近く', x:50, y:12, color:'#a89070', lines:['この模様、誰かが手で描いたのか。','それとも、風が長い時間をかけて描いたのか。']},
  {id:'steppe-m08', name:'帰りを待つ羊飼い', role:'草原の住人', x:28, y:30, color:'#c8b898', lines:['羊は、もう戻ってこない。','でも、戻ってくる場所は、まだここにある。']}
];

export const STEPPE_OBJECTS = [
  {
    id: 'steppe-felt',
    name: '風に干すフェルト',
    kind: 'art',
    form: 'cloth',
    x: 30, y: 36, w: 4, h: 3,
    entrance: {x: 32, y: 40},
    blocking: false,
    desc: '草原に広げられた、古いフェルト。模様は半分風に削られている。',
    aside: 'この模様は、かつて季節の境を示していた。今は風が、模様を少しずつ消している。フェルトは、消えることを拒否しない。'
  },
  {
    id: 'steppe-circle',
    name: '円い石の跡',
    kind: 'art',
    form: 'disc',
    x: 41, y: 28, w: 5, h: 4,
    entrance: {x: 43, y: 33},
    blocking: false,
    desc: '草の中に残る、円く並んだ石の跡。誰かがここでしばらく留まった形跡。',
    aside: '円は、移動する人が「今日はここまで」と決めた印だった。次の日には、別の円が作られる。この円だけが、風に残っている。'
  },
  {
    id: 'steppe-tea-stone',
    name: '茶を置いた石',
    kind: 'art',
    form: 'stone',
    x: 48, y: 59, w: 3, h: 3,
    entrance: {x: 49, y: 62},
    blocking: false,
    desc: '茶屋の近くに置かれた、平らな石。誰かが茶の器を置いた跡が、少しだけ残っている。',
    aside: 'この石は、峠を越えてきた茶を、一度だけ休ませた。器はもうない。石だけが、茶の温度を少し覚えている。'
  }
];

const MIX=[0,2,4,5,7,9,10],DOR=[0,2,3,5,7,9,10];
const SAIL=[.5,.5,1,1,.5,.5,1,3];
const STEP=[.75,.25,.5,.5,1.5,.5,1,3];
const WALK=[1,.5,.5,1,1,.5,.5,3];

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

export const STEPPE_SCORES=[
 {name:'草原の道のり',root:60,meter:4,lead:'flute',arp:'harp',
  ally:a('風に乗って',112,MIX,SAIL,[0,3,4,5,0,2,4,0],
   '0 2 4 5 4 2 3 1 | 2 4 5 7 6 4 3 2 | 4 5 7 6 4 2 3 4 | 5 4 2 1 3 2 1 0',
   {arpVel:.08,padVel:.07,drumEvery:4,leadArticulation:.9}),
  hostile:a('草の向こうへ',120,DOR,STEP,[0,4,3,5,0,2,3,4],
   '0 3 4 5 4 2 3 1 | 2 4 5 7 6 5 3 2 | 4 5 7 6 4 2 3 4 | 5 4 2 3 4 2 1 0',
   {leadVel:.3,padVel:.08,drumEvery:2})},

 // Its walking phrases fill eight beats, so the bar is 4/4 (it was marked 3/4 and drifted off the chords).
 {name:'峠を越える風',root:57,meter:4,lead:'strings',arp:'harp',
  ally:a('高い草の上',104,DOR,WALK,[0,3,5,4,0,2,3,0],
   '0 2 4 3 5 4 2 1 | 2 4 5 7 6 4 3 2 | 4 5 7 6 4 2 3 1 | 5 4 2 1 3 2 1 0',
   {padVel:.085,bassVel:.16,drumEvery:4}),
  hostile:a('風が先に知っている',112,MIX,SAIL,[0,5,3,4,2,5,4,0],
   '4 3 2 0 1 2 3 1 | 2 4 5 3 2 1 0 2 | 5 4 2 3 1 2 0 1 | 3 2 1 0 2 1 0 -1',
   {leadVel:.28,padVel:.09,drumEvery:2})}
];
