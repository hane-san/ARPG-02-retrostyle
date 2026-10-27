// Six original study pieces. Same synth, envelopes and bounded loop cache as every old score.
const dorian=[0,2,3,5,7,9,10],minor=[0,2,3,5,7,8,10],major=[0,2,4,5,7,9,11];
const rhythm=[1,.5,.5,1,1,.5,.5,1];
const phrases=s=>s.split('|').map(p=>p.trim().split(/\s+/).map(Number));
const part=(title,bpm,scale,notes,chords,detail={})=>({title,bpm,scale,rhythm,chords,melody:phrases(notes),
 leadVel:.20,arpVel:.035,padVel:.045,bassVel:.075,offbeatBassVel:.035,drumVel:0,drumEvery:8,leadArticulation:.72,...detail});
const water='0 2 4 2 1 3 2 0 | 2 3 5 4 2 1 0 -1 | 0 2 4 5 4 2 1 3 | 2 1 0 -1 0 2 1 0';
export const IMPERIAL_SCORES=[
 {name:'二つの受水庭',root:60,meter:3,lead:'flute',arp:'harp',
  ally:part('器から器へ',88,dorian,water,[0,3,0,5,2,3,4,0]),
  hostile:part('同じ溝に砂がある',80,minor,water,[0,5,3,0,2,5,4,0],{leadVel:.17,arpVel:.018,leadArticulation:.49})},
 {name:'応答を待つ石',root:55,meter:3,lead:'harp',arp:'flute',
  ally:part('触れた後の間',82,dorian,'0 0 4 3 0 1 -1 0 | 2 0 4 3 1 0 -1 0 | 4 2 0 1 3 2 0 -1 | 0 2 1 0 -1 0 1 0',[0,0,5,3,0,5,4,0],{arpVel:.012,bassVel:.045}),
  hostile:part('扉のない返事',80,minor,'0 -1 0 4 3 0 1 -1 | 2 0 -1 3 2 0 -2 -1 | 4 2 0 -1 1 0 -2 -1 | 0 1 -1 0 -2 -1 0 -1',[0,5,0,2,0,5,1,0],{leadVel:.15,arpVel:.012,padVel:.035,bassVel:.045})},
 {name:'帝都の遠い門',root:57,meter:3,lead:'horn',arp:'harp',
  ally:part('幾つもの門の向こう',92,major,'0 2 4 5 4 2 3 1 | 2 4 5 7 6 4 3 2 | 4 5 7 6 4 2 3 4 | 5 4 2 1 3 2 1 0',[0,3,5,4,0,2,3,0],{leadVel:.18,leadArticulation:.96}),
  hostile:part('帰り舟のない街道',86,dorian,'4 2 3 0 1 3 2 0 | 5 3 4 2 0 2 1 -1 | 3 5 6 4 2 3 1 2 | 4 3 1 2 0 -1 1 0',[0,3,5,2,0,5,3,0],{leadVel:.16,arpVel:.025})}
];
