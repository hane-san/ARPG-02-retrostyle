// Four original A / answer / variation / cadence pieces, appended after #106.
// Independent melodies, harmony, metre, pacing and instrumentation.
const rows=[
 ['葦の間を舟がほどく',88,3,55,'reed','harp',[0,2,3,5,7,9,10],[2,0,4,3,6,1,5,2,7,4,3,6,2,5,1,0],[6,3,8,4,7,2,5,9,4,6,1,5,3,7,2,0],[0,4,2,5,3,1,6,0],false,false],
 ['赤い風窓を越えて',118,4,58,'horn','pluck',[0,2,4,5,7,9,11],[0,3,5,2,6,4,8,5,3,7,4,6,2,5,1,0],[7,4,9,6,3,8,5,10,6,2,7,4,8,5,3,1],[0,3,5,2,4,1,6,0],false,true],
 ['木陰の港の寄り道',104,4,62,'flute','box',[0,2,3,5,7,9,10],[3,0,2,5,1,4,6,2,5,3,7,4,2,6,1,0],[7,3,6,1,5,8,4,2,6,9,5,3,7,4,2,0],[0,2,5,1,3,6,4,0],false,true],
 ['潮の石橋、夕べの道標',72,4,57,'piano','pad',[0,2,4,6,7,9,11],[4,0,6,2,7,3,5,1,8,4,2,6,3,5,1,0],[8,5,3,7,4,9,2,6,5,1,7,3,6,4,2,0],[0,5,1,4,2,6,3,0],true,false]
];
const parts=rows.map(([title,bpm,meter,root,lead,arp,scale,a,b,chords,sparse,percussion],i)=>({title,bpm,meter,root,lead,arp,scale,a,b,chords,sparse,percussion,western:true,study:12+i}));
export const SOUTHEAST_SCORES=[0,1].map(i=>({name:parts[i*2].title+'／'+parts[i*2+1].title,root:60,meter:4,lead:parts[i*2].lead,arp:parts[i*2].arp,western:true,ally:parts[i*2],hostile:parts[i*2+1]}));
