// 12 new original exploration score pairs (24 tracks), composed for Tidal Atlas.
// The baseline SRPG score engine synthesises everything in Web Audio; no samples.
// Four 8-note phrases per side; every phrase fills 2 bars (3/4 or 4/4).
const MAJ=[0,2,4,5,7,9,11],MIN=[0,2,3,5,7,8,10];
const DOR=[0,2,3,5,7,9,10],LYD=[0,2,4,6,7,9,11],MIX=[0,2,4,5,7,9,10];
const WALTZ=[1,.5,.5,1,.5,.5,1,1];
const WAVE=[.5,.5,1,1,.5,.5,1,1];
const WALK=[1,.5,.5,1,1,.5,.5,3];
const SAIL=[.5,.5,1,1,.5,.5,1,3];
const STEP=[.75,.25,.5,.5,1.5,.5,1,3];
// Parse an authored melody notation: four measures of eight scale-degree notes.
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
export const EXTRA_SCORES=[
 // 01 / A bright journey remembered with tenderness.
 {name:'夜明けの出帆',root:60,meter:3,lead:'flute',arp:'harp',
  ally:a('朝靄に船影',94,MAJ,WALTZ,[0,3,5,4,0,3,4,0],
   '0 2 4 5 4 2 3 1 | 2 4 5 7 6 4 3 2 | 5 7 6 4 2 4 5 3 | 4 3 2 0 1 2 1 0',
   {arpVel:.072,padVel:.066,drumEvery:4,leadArticulation:.93}),
  hostile:a('雲間に残る誓い',110,DOR,WAVE,[0,5,3,4,2,5,4,0],
   '0 2 3 4 5 4 3 2 | 4 5 7 6 5 3 4 2 | 3 5 7 5 4 2 3 1 | 4 3 2 0 2 1 0 -1',
   {leadVel:.35,arpVel:.085,drumEvery:2})},
 // 02 / Sea breeze and a postcard that has turned yellow.
 {name:'暮れゆく海浜',root:57,meter:3,lead:'strings',arp:'harp',
  ally:a('潮風のアルバム',90,MAJ,WAVE,[0,4,3,5,0,2,4,0],
   '4 3 2 0 1 2 4 3 | 5 4 2 3 4 6 5 3 | 7 6 4 2 3 2 0 1 | 2 4 3 1 2 1 0 -1',
   {padVel:.092,bassVel:.14,drumEvery:4}),
  hostile:a('遠雷の防波堤',108,MIN,WALTZ,[0,5,3,4,0,2,1,4],
   '0 1 3 2 4 3 2 1 | 3 4 5 3 2 1 3 4 | 6 5 4 2 3 4 2 1 | 3 2 0 1 2 1 0 -1',
   {padVel:.092,drumEvery:2,leadArticulation:.95})},
 // 03 / Warm port lamps; loneliness after all shops close.
 {name:'旧港の灯',root:62,meter:4,lead:'flute',arp:'harp',
  ally:a('店じまいの灯',102,MIX,SAIL,[0,3,4,5,2,3,4,0],
   '0 2 4 3 5 4 2 1 | 2 4 5 7 6 5 3 2 | 4 5 7 6 4 2 3 4 | 5 4 2 1 3 2 1 0',
   {arpVel:.105,bassVel:.17,drumEvery:4}),
  hostile:a('雨上がりの船乗り',114,DOR,WALK,[0,4,5,3,0,5,2,4],
   '0 2 3 5 4 3 2 0 | 2 3 5 7 6 4 3 2 | 4 6 5 3 4 2 1 3 | 4 3 2 0 1 2 1 0',
   {leadVel:.29,padVel:.102,drumEvery:2})},
 // 04 / Glass city optimism with a melancholic undertone.
 {name:'鏡の未来都市',root:64,meter:4,lead:'strings',arp:'harp',
  ally:a('ガラスの残光',118,LYD,SAIL,[0,5,3,4,0,2,5,4],
   '0 2 4 6 5 4 2 3 | 4 5 7 6 5 4 2 1 | 3 5 6 8 7 5 4 3 | 6 5 3 2 4 2 1 0',
   {padVel:.107,arpVel:.071,bassVel:.18,drumEvery:4}),
  hostile:a('白い塔の夢の跡',124,MIN,STEP,[0,3,5,4,0,2,4,5],
   '7 5 4 3 2 4 3 1 | 2 3 5 4 6 5 3 2 | 4 6 7 5 4 3 2 4 | 5 3 2 1 3 2 0 -1',
   {leadVel:.32,padVel:.095,drumEvery:2})},
 // 05 / Rain among abandoned walkways.
 {name:'霧雨の散策',root:65,meter:3,lead:'harp',arp:'strings',
  ally:a('濡れた石畳',87,DOR,WALTZ,[0,5,3,4,0,3,2,0],
   '4 3 2 0 1 2 3 1 | 2 4 3 2 0 2 1 -1 | 3 5 4 2 3 1 2 0 | 4 2 1 0 2 1 -1 0',
   {leadVel:.22,arpVel:.058,padVel:.115,drumEvery:8,bassVel:.12}),
  hostile:a('誰もいない待合室',95,MIN,WAVE,[0,2,5,4,0,1,3,4],
   '0 2 1 3 2 4 3 1 | 2 3 5 4 2 3 1 0 | 4 5 7 5 3 4 2 1 | 3 2 1 -1 0 1 -1 0',
   {leadVel:.23,padVel:.108,drumEvery:4})},
 // 06 / A friendly market that still remembers old departures.
 {name:'市場の夕風',root:59,meter:4,lead:'flute',arp:'harp',
  ally:a('懐かしい異邦人',110,MIX,WALK,[0,3,4,0,5,3,2,4],
   '0 2 4 5 4 3 2 0 | 2 4 5 6 5 3 4 2 | 5 6 7 5 4 2 3 1 | 4 3 2 1 2 4 1 0',
   {arpVel:.115,leadArticulation:.83,drumEvery:2}),
  hostile:a('去りゆく市の歌',116,MIN,STEP,[0,5,3,4,0,2,4,0],
   '4 3 1 0 2 3 4 2 | 3 5 4 2 3 1 0 2 | 5 7 6 4 3 4 2 1 | 3 2 1 -1 0 2 1 0',
   {padVel:.08,arpVel:.1,leadVel:.29})},
 // 07 / Heroism rising among ruined banners.
 {name:'薄明の城',root:55,meter:4,lead:'horn',arp:'strings',
  ally:a('古い旗と新しい朝',122,DOR,SAIL,[0,3,5,4,0,2,3,4],
   '0 4 3 5 4 2 3 0 | 2 4 5 7 6 5 3 2 | 4 5 7 9 7 6 5 3 | 5 4 2 3 4 2 1 0',
   {bassVel:.25,leadVel:.35,padVel:.09,drumEvery:2}),
  hostile:a('城壁に消える伝令',132,MIN,STEP,[0,4,5,3,0,1,4,0],
   '7 4 5 3 4 2 1 0 | 2 3 5 4 3 1 2 0 | 4 6 7 6 5 3 4 2 | 5 3 4 2 1 0 1 -1',
   {bassVel:.28,drumEvery:1,drumVel:.16,leadVel:.35})},
 // 08 / A steam whistle heard across an empty harbour.
 {name:'孤独な汽笛',root:57,meter:3,lead:'flute',arp:'strings',
  ally:a('航路の果てに',96,DOR,WAVE,[0,5,2,4,0,3,5,0],
   '7 5 4 2 3 1 2 0 | 4 3 1 2 3 4 2 1 | 5 6 4 3 2 4 3 1 | 2 3 1 -1 0 1 -1 0',
   {leadVel:.27,padVel:.1,drumEvery:4,bassVel:.13}),
  hostile:a('錆びた軌道の歌',108,MIN,WALTZ,[0,3,5,4,0,2,1,4],
   '0 1 3 5 4 3 2 0 | 2 4 5 3 4 2 1 0 | 4 6 5 3 2 1 3 2 | 3 1 0 -1 1 2 1 0',
   {padVel:.105,arpVel:.065,drumEvery:2})},
 // 09 / Joyful festival remnants, after people have gone home.
 {name:'祭りの後の静けさ',root:60,meter:4,lead:'flute',arp:'harp',
  ally:a('提灯が揺れるころ',118,MAJ,STEP,[0,3,4,5,0,3,2,4],
   '0 2 4 5 3 4 2 1 | 2 3 5 6 5 4 2 3 | 4 5 7 6 4 5 3 1 | 4 3 2 0 1 2 1 0',
   {arpVel:.115,drumEvery:2,drumVel:.085}),
  hostile:a('最後の太鼓',112,DOR,SAIL,[0,5,3,4,0,2,4,0],
   '4 2 3 1 0 2 3 4 | 5 4 2 3 1 2 0 1 | 3 5 7 6 5 3 2 4 | 5 3 2 1 2 1 0 -1',
   {drumEvery:1,drumVel:.115,padVel:.09})},
 // 10 / Hopeful, solitary crossing between two worlds.
 {name:'星を渡る橋',root:62,meter:4,lead:'strings',arp:'harp',
  ally:a('星明かりの橋梁',120,LYD,WALK,[0,5,3,4,0,2,5,4],
   '0 2 4 6 7 5 4 2 | 3 5 7 6 4 5 3 2 | 5 7 9 7 6 4 3 5 | 6 4 3 2 4 2 1 0',
   {padVel:.105,bassVel:.19,leadVel:.33,arpVel:.065}),
  hostile:a('宇宙港の影',128,MIN,STEP,[0,4,3,5,0,2,5,4],
   '0 3 4 5 3 2 4 1 | 2 5 4 3 5 6 4 2 | 4 7 6 5 4 3 2 4 | 5 3 2 0 1 2 0 -1',
   {leadVel:.34,padVel:.085,drumEvery:2})},
 // 11 / Memory of the gardens; emotional but not sentimental.
 {name:'風にほどける記憶',root:65,meter:3,lead:'flute',arp:'harp',
  ally:a('あの日の庭',91,MAJ,WALTZ,[0,5,3,4,0,2,3,0],
   '0 2 3 4 5 4 2 0 | 2 3 5 7 6 4 3 1 | 4 5 7 6 5 3 2 4 | 3 2 1 0 2 1 -1 0',
   {padVel:.085,drumEvery:8,arpVel:.08,leadArticulation:.96}),
  hostile:a('約束の碑',105,DOR,WAVE,[0,5,3,2,0,4,5,0],
   '4 3 1 2 0 2 3 1 | 2 4 5 3 2 3 1 0 | 3 5 7 6 4 3 2 4 | 5 4 2 1 3 2 1 0',
   {padVel:.09,drumEvery:4,leadVel:.29})},
 // 12 / Finale: the drive to return, shot through with farewell.
 {name:'帰還の地平線',root:58,meter:4,lead:'horn',arp:'strings',
  ally:a('帰る場所へ',136,DOR,SAIL,[0,3,5,4,2,5,3,4],
   '0 3 4 5 4 2 3 1 | 4 5 7 6 5 4 3 2 | 5 7 9 7 6 5 4 3 | 7 5 4 2 3 2 1 0',
   {leadVel:.34,padVel:.085,drumEvery:1,drumVel:.1,bassVel:.27}),
  hostile:a('はるかな凱歌',146,MIN,STEP,[0,4,5,3,0,5,2,4],
   '7 5 4 3 5 4 2 1 | 3 5 7 6 5 3 4 2 | 4 7 9 7 6 4 5 3 | 6 5 3 2 4 2 1 0',
   {leadVel:.35,padVel:.092,drumEvery:1,drumVel:.16,bassVel:.28})}
];
