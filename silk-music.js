// 18 entirely original melodies for the Central-Asian-landscape-inspired
// fictional Starwind Passage. Nine places, two contrasting moods per place.
// Full phrases and harmonic paths intentionally differ from the original SRPG.
const MAJ=[0,2,4,5,7,9,11],MIN=[0,2,3,5,7,8,10],DOR=[0,2,3,5,7,9,10],
 MIX=[0,2,4,5,7,9,10],LYD=[0,2,4,6,7,9,11],PHRY=[0,1,3,5,7,8,10];
const R3=[1,.5,.5,1,.5,.5,1,1],R4=[1,.5,.5,1,1,.5,.5,3],S4=[.5,.5,1,1,.5,.5,1,3];
function melody(src){
 return src.split('|').map(s=>{const v=s.trim().split(/\s+/).map(Number);if(v.length!==8||v.some(n=>!Number.isFinite(n)))throw Error('Invalid original melody');return v;});
}
function part(title,bpm,scale,rhythm,chords,notes,features={}){
 return {title,bpm,scale,rhythm,chords,melody:melody(notes),arpVel:.072,leadVel:.29,padVel:.075,drumEvery:4,...features};
}
export const SILK_SCORES=[
 {name:'星風の草原',root:60,meter:4,lead:'strings',arp:'harp',
  ally:part('風が連れてきた道',116,MIX,R4,[0,3,5,4,0,5,3,4],'0 2 4 5 4 2 3 1 | 2 3 5 7 6 4 3 2 | 4 5 7 9 7 5 4 2 | 5 4 3 1 2 3 1 0',{bassVel:.2,drumEvery:2}),
  hostile:part('草海の遠い誓い',128,DOR,S4,[0,4,5,3,0,5,2,4],'0 3 4 5 3 2 1 0 | 2 4 5 7 5 4 3 2 | 5 7 8 6 5 4 2 3 | 6 5 3 2 4 2 1 0',{leadVel:.34,drumEvery:1,drumVel:.13})},
 {name:'北の光都',root:64,meter:4,lead:'strings',arp:'harp',
  ally:part('草原の果ての光都',118,LYD,R4,[0,5,3,4,0,2,5,4],'0 2 4 6 7 5 3 2 | 3 5 7 6 5 4 2 1 | 5 7 9 7 6 5 4 3 | 6 4 3 2 4 2 1 0',{padVel:.095,arpVel:.055}),
  hostile:part('まだ誰もいない未来',126,MIN,S4,[0,4,3,5,0,2,4,0],'4 3 2 0 2 3 5 4 | 5 7 6 4 3 5 4 2 | 6 7 9 7 5 4 2 3 | 5 3 2 1 2 1 0 -1',{padVel:.105,bassVel:.2})},
 {name:'乾いた海の廃港',root:57,meter:3,lead:'flute',arp:'harp',
  ally:part('海のいなくなった港',88,MIN,R3,[0,5,3,4,0,2,1,0],'4 2 3 1 0 2 1 -1 | 3 4 2 1 2 0 1 -1 | 5 4 3 1 2 4 3 1 | 2 1 0 -1 1 2 0 -1',{arpVel:.043,leadVel:.22,padVel:.103,drumEvery:8,bassVel:.11}),
  hostile:part('錆の中に眠る星',98,DOR,R3,[0,3,5,2,0,4,3,0],'0 1 3 2 4 3 2 0 | 3 5 4 2 3 2 1 0 | 5 7 5 4 3 1 2 4 | 3 2 1 -1 0 1 -1 0',{leadVel:.25,drumEvery:4})},
 {name:'石の峠とトンネル',root:55,meter:4,lead:'horn',arp:'strings',
  ally:part('峠を越える風',126,DOR,R4,[0,3,5,4,0,2,5,4],'0 4 3 5 4 2 3 1 | 2 4 5 7 6 4 3 2 | 4 5 7 9 7 6 4 3 | 5 4 2 3 4 2 1 0',{leadVel:.34,bassVel:.23,drumEvery:1,drumVel:.10}),
  hostile:part('露岩を貫く旅路',132,MIN,S4,[0,4,5,3,0,5,3,4],'7 5 4 3 5 3 2 1 | 2 4 5 4 6 5 3 2 | 4 6 7 5 4 3 5 2 | 5 4 3 1 2 1 0 -1',{leadVel:.36,bassVel:.28,drumEvery:1,drumVel:.14})},
 {name:'青鏡の巨大湖',root:62,meter:3,lead:'flute',arp:'harp',
  ally:part('湖は空をしまっている',90,MAJ,R3,[0,5,3,4,0,2,5,0],'0 2 4 5 4 2 1 0 | 2 4 6 7 6 4 3 2 | 5 7 9 7 6 4 5 3 | 4 3 2 0 2 1 -1 0',{leadVel:.24,arpVel:.051,padVel:.112,drumEvery:8}),
  hostile:part('帰らぬ光のさざ波',102,DOR,R3,[0,3,5,4,0,4,2,0],'4 3 2 0 1 3 2 1 | 2 4 5 3 4 2 1 0 | 5 7 6 4 5 3 2 4 | 3 2 1 0 2 1 -1 0',{leadVel:.26,padVel:.104,drumEvery:4})},
 {name:'風待ちの茶屋',root:59,meter:3,lead:'harp',arp:'flute',
  ally:part('午後の茶と旅話',103,MIX,R3,[0,3,4,0,5,3,4,0],'0 2 3 4 2 1 2 0 | 2 4 5 4 3 1 2 0 | 4 5 7 5 4 2 3 1 | 2 3 1 0 2 1 -1 0',{leadVel:.23,arpVel:.072,drumEvery:4}),
  hostile:part('湯気の向こうの故郷',96,MIN,R3,[0,5,3,4,0,2,1,0],'3 2 1 0 2 3 1 -1 | 2 4 3 2 1 0 1 2 | 5 4 3 1 2 3 4 2 | 3 2 1 -1 0 1 -1 0',{padVel:.09,drumEvery:8})},
 {name:'風の畝',root:61,meter:4,lead:'flute',arp:'harp',
  ally:part('風の畝、青い水路',105,MAJ,R4,[0,3,4,5,0,2,3,4],'0 2 4 3 5 4 3 2 | 2 4 5 7 6 5 3 2 | 4 5 7 6 4 3 5 2 | 4 3 2 0 1 2 1 0',{leadVel:.25,arpVel:.08,drumEvery:4}),
  hostile:part('夕焼けに残る畑',113,DOR,S4,[0,5,3,4,0,2,5,0],'4 3 2 0 2 4 3 1 | 3 5 4 2 3 5 4 2 | 5 7 6 4 5 3 2 1 | 3 2 1 -1 0 2 1 0',{leadVel:.29,drumEvery:2})},
 {name:'砂漠と青の都',root:60,meter:4,lead:'flute',arp:'harp',
  ally:part('砂の都、青の影',112,PHRY,R4,[0,1,4,3,0,5,1,4],'0 1 3 4 5 3 2 1 | 3 4 6 5 4 2 1 0 | 5 7 6 4 3 5 4 2 | 4 3 1 2 3 1 0 -1',{leadVel:.30,arpVel:.089,bassVel:.18}),
  hostile:part('月影の隊商',124,MIN,S4,[0,5,4,3,0,1,5,4],'0 2 3 5 4 2 3 1 | 4 5 7 6 5 3 4 2 | 5 7 9 7 6 4 3 2 | 4 3 1 0 2 3 1 0',{leadVel:.33,bassVel:.24,drumEvery:2})},
 {name:'赤峡の祈り',root:56,meter:4,lead:'horn',arp:'strings',
  ally:part('谷を渡る祈り',110,DOR,R4,[0,5,3,4,0,2,1,4],'4 2 3 5 4 3 2 0 | 2 4 5 7 6 4 3 1 | 5 7 9 7 6 5 3 4 | 5 3 2 1 2 1 0 -1',{padVel:.10,leadVel:.28,drumEvery:4}),
  hostile:part('断崖の向こうの明日',132,MIN,S4,[0,4,5,3,0,5,2,4],'7 5 4 2 3 5 4 2 | 3 4 6 5 7 5 3 2 | 5 7 9 7 6 5 4 3 | 6 4 3 2 4 2 1 0',{leadVel:.34,bassVel:.24,drumEvery:1,drumVel:.14})}
];
