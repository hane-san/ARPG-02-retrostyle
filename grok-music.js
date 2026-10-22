// Grok-composed tracks for the journey map.
// Same structure as EXTRA_SCORES to avoid audio glitches.
// Melancholic yet cool, with a slightly different drive.
// Higher weight on southeast zones (sunset, salt, lake).

const MAJ=[0,2,4,5,7,9,11],MIN=[0,2,3,5,7,8,10];
const DOR=[0,2,3,5,7,9,10],MIX=[0,2,4,5,7,9,10];
const WALTZ=[1,.5,.5,1,.5,.5,1,1];
const WAVE=[.5,.5,1,1,.5,.5,1,1];
const SAIL=[.5,.5,1,1,.5,.5,1,3];
const STEP=[.75,.25,.5,.5,1.5,.5,1,3];

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

export const GROK_SCORES=[
 // Melancholic drive: thin melody over a steady pulse.
 {name:'薄れゆく水平線',root:62,meter:4,lead:'flute',arp:'harp',
  ally:a('遠景に残る光',108,MIX,SAIL,[0,3,4,5,0,2,4,0],
   '0 2 4 3 5 4 2 1 | 2 4 5 7 6 4 3 2 | 4 5 7 6 4 2 3 1 | 5 4 2 1 3 2 1 0',
   {arpVel:.08,padVel:.07,drumEvery:4,leadArticulation:.9}),
  hostile:a('消えかけた影',116,DOR,STEP,[0,5,3,4,2,5,4,0],
   '4 3 2 0 1 2 3 1 | 2 4 5 3 2 1 0 2 | 5 4 2 3 1 2 0 -1 | 3 2 1 0 2 1 0 -1',
   {leadVel:.3,padVel:.085,drumEvery:2})},

 // Cool melancholy with a bit of forward motion.
 {name:'塩原の残響',root:57,meter:3,lead:'strings',arp:'harp',
  ally:a('白い岸の記憶',96,MIN,WALTZ,[0,3,5,2,0,4,3,0],
   '4 2 3 0 1 3 2 0 | 5 3 4 2 0 2 1 -1 | 3 5 6 4 2 3 1 2 | 4 3 1 2 0 -1 1 0',
   {padVel:.09,bassVel:.15,drumEvery:4}),
  hostile:a('風に削られる白',104,DOR,WAVE,[0,5,3,4,0,2,1,4],
   '0 2 3 5 4 3 2 1 | 3 4 5 3 2 1 3 2 | 5 4 2 3 1 2 0 1 | 4 3 2 0 1 2 1 0',
   {leadVel:.28,padVel:.095,drumEvery:2})},

 // Slightly faster, melancholic cool.
 {name:'夕空の疾走',root:60,meter:4,lead:'horn',arp:'strings',
  ally:a('残照を追いかけて',122,DOR,SAIL,[0,4,3,5,0,2,3,4],
   '0 3 4 5 4 2 3 1 | 2 4 5 7 6 5 3 2 | 4 5 7 6 4 2 3 4 | 5 4 2 3 4 2 1 0',
   {bassVel:.22,leadVel:.33,padVel:.08,drumEvery:2}),
  hostile:a('薄れゆく足元',130,MIN,STEP,[0,3,5,4,0,2,4,0],
   '7 4 5 3 4 2 1 0 | 2 3 5 4 3 1 2 0 | 4 6 5 3 4 2 1 3 | 5 3 2 1 0 1 0 -1',
   {bassVel:.25,drumEvery:1,drumVel:.14,leadVel:.34})},

 // Strange beauty, not too slow.
 {name:'遠い石の影',root:65,meter:3,lead:'flute',arp:'harp',
  ally:a('線になった石',100,MIX,WALTZ,[0,5,3,4,0,2,3,0],
   '0 2 4 5 4 2 3 1 | 2 4 5 7 6 4 3 2 | 4 5 7 6 4 2 3 4 | 5 4 2 1 3 2 1 0',
   {arpVel:.075,padVel:.08,drumEvery:4}),
  hostile:a('近づいても遠い',108,MIN,WAVE,[0,4,5,3,0,2,1,4],
   '4 3 1 0 2 3 4 2 | 3 5 4 2 3 1 0 2 | 5 4 2 3 1 2 0 1 | 3 2 1 0 2 1 0 -1',
   {leadVel:.29,padVel:.09,drumEvery:2})}
];
