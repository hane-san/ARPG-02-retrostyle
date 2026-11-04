// Twelve original compositions in six library pairs. Not quotes or transpositions
// of reference works: separate melody/answer, harmony, metre and orchestration.
const scales={bright:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],minor:[0,2,3,5,7,8,10],open:[0,2,4,6,7,9,11]};
const notes=s=>s.split(' ').map(Number);
const rows=[
 ['雪の彼方へ、鐘は渡る',64,4,48,'bell','pad','open','0 4 2 6 4 7 5 2 1 4 6 3 2 5 1 0','4 6 9 7 5 8 6 4 3 7 5 9 6 4 2 1',[0,4,1,5,2,6,3,0]],
 ['ガラスの朝の水やり',78,3,62,'box','harp','bright','0 2 4 1 3 5 2 6 4 3 1 5 2 4 1 0','4 7 6 3 5 2 6 4 7 5 3 1 4 2 5 0',[0,3,1,4,5,2,4,0]],
 ['丘を越える青い便り',114,4,60,'flute','harp','bright','0 1 4 2 5 3 7 4 6 2 5 1 4 3 1 0','7 5 6 3 4 8 7 5 2 6 4 9 7 4 2 0',[0,5,3,4,1,5,2,4]],
 ['柳の色は水へほどける',80,4,59,'piano','strings','open','2 4 1 5 3 6 2 0 4 7 3 5 1 4 2 0','5 8 6 4 7 3 9 6 4 8 5 2 6 3 1 0',[1,4,0,3,5,1,6,2]],
 ['日曜日の小舟のワルツ',94,3,64,'flute','harp','bright','4 1 3 0 5 2 4 1 6 3 5 2 4 1 2 0','7 4 6 2 5 8 3 6 4 7 2 5 3 6 1 0',[0,2,4,1,5,3,4,0]],
 ['屋根の上の昼の食卓',86,5,57,'box','reed','dorian','0 3 1 4 2 6 3 5 1 4 0 2 5 3 1 0','5 2 6 4 8 3 7 5 4 9 6 2 5 7 3 1',[0,3,5,1,4,2,6,0]],
 ['風車が数える粉の袋',102,6,60,'reed','harp','dorian','0 2 3 5 1 4 2 6 3 7 4 2 5 3 1 0','5 7 4 8 6 3 7 5 9 4 6 2 5 3 4 1',[0,5,2,3,1,4,6,0]],
 ['段畑を渡す手の合図',98,6,62,'flute','pluck','dorian','0 3 2 5 4 1 6 3 7 5 2 4 6 3 1 0','7 4 8 5 9 6 3 7 4 6 2 5 8 4 2 0',[0,3,1,5,2,4,6,0]],
 ['次の折り返しの空',124,4,57,'reed','pluck','minor','0 2 1 4 3 6 2 5 4 7 3 6 5 2 4 1','7 4 6 3 8 5 9 6 4 7 2 5 6 3 1 0',[0,5,3,1,4,2,5,0]],
 ['遠原に残る白い花',82,4,60,'piano','pad','dorian','4 2 5 1 6 3 0 4 2 7 5 3 1 6 2 0','7 5 9 6 4 8 3 7 5 2 6 4 8 3 1 0',[0,3,5,2,6,4,1,0]],
 ['木陰から道のむこうへ',88,4,55,'pluck','flute','bright','0 4 1 3 5 2 6 4 1 5 3 7 2 4 1 0','5 2 7 4 6 3 8 5 2 6 4 7 3 5 2 0',[0,4,2,5,1,3,6,0]],
 ['砂州に置いた空の余白',70,4,62,'piano','pad','open','0 5 2 7 3 6 1 4 2 8 5 3 6 1 4 0','6 3 8 5 2 7 4 9 5 1 6 3 7 2 4 0',[0,1,4,2,5,3,6,0]]
];
const parts=rows.map(([title,bpm,meter,root,lead,arp,scale,a,b,chords],i)=>({title,bpm,meter,root,lead,arp,scale:scales[scale],a:notes(a),b:notes(b),chords,western:true,study:i}));
export const WESTERN_SCORES=Array.from({length:6},(_,i)=>({name:parts[i*2].title+'／'+parts[i*2+1].title,root:60,meter:4,lead:parts[i*2].lead,arp:parts[i*2].arp,western:true,ally:parts[i*2],hostile:parts[i*2+1]}));
const midi=(root,scale,n)=>root+12*Math.floor(n/7)+scale[((n%7)+7)%7];
export function buildWesternTrack(mapId,phase,score){
 const p=phase===1?score.ally:score.hostile,events=[],bar=p.meter;
 const push=(beat,duration,n,voice,velocity,pan=0)=>events.push({beat,duration,midi:midi(p.root,p.scale,n),voice,velocity,pan});
 for(let b=0;b<32;b++){
  const section=Math.floor(b/8),phrase=b%8,chord=p.chords[(b+(section===1?2:0))%8],beat=b*bar;
  const sparse=p.sparse??(p.study===0||p.study===11),mel=section===1?p.b:p.a;
  const n1=mel[(phrase*2)%16],n2=mel[(phrase*2+1)%16];
  // A, answer B, softened A', then a spacious closing cadence.
  if(!(section===3&&phrase%3===1))push(beat+(section===2?.25:0),bar*(section===3?.8:.48),section===3&&phrase===7?0:n1,p.lead,sparse?.12:.17,-.08);
  if(section!==3||phrase%2===0)push(beat+bar*.55,bar*.42,n2,section===2&&p.study!==0?p.arp:p.lead,sparse?.07:.12,.12);
  if(!sparse&&section===1)push(beat+bar*.3,bar*.2,p.a[(phrase+5)%16],p.arp,.045,.24);
  for(const n of [chord-7,chord-3,chord-1])push(beat,bar*.96,n,'pad',sparse?.035:.023,-.2);
  push(beat,bar*.88,chord-14,'bass',sparse?.065:.075,0);
  if(!sparse){
   const count=p.study===1?2:p.study===9?1:bar;
   for(let j=0;j<count;j++)if(!(section===3&&j%2))push(beat+j*bar/count,.45,chord+[0,4,2,6,1,5][(j+b)%6],p.arp,p.study===1?.045:.035,.25);
   if((p.percussion??[2,6,7,8].includes(p.study)))events.push({beat:beat+bar*.5,duration:.09,midi:38,voice:'drum',velocity:.035,pan:0});
  }
 }
 events.sort((a,b)=>a.beat-b.beat);return {mapId,side:phase===1?'ally':'hostile',title:p.title,bpm:p.bpm,beats:32*bar,seconds:32*bar*60/p.bpm,events};
}
// A soft bell/box/piano/reed/pluck bank. Partial envelopes remain continuous on stop.
export function scheduleWesternNote(context,destination,event,time,secondsPerBeat,holdEnvelopeAt){
 const bell=event.voice==='bell',box=event.voice==='box',piano=event.voice==='piano',reed=event.voice==='reed';
 const duration=Math.max(.08,event.duration*secondsPerBeat),release=bell?2.8:box?1.1:piano?.5:.12,end=time+duration+release;
 const ratios=bell?[1,2.01,3.97]:box?[1,3,5]:[1,2],weights=bell?[.62,.25,.13]:box?[.8,.15,.05]:[.88,.12],nodes=[],envelopes=[];
 const frequency=440*2**((event.midi-69)/12);
 for(let i=0;i<ratios.length;i++){
  const o=context.createOscillator(),g=context.createGain();o.type=reed?'triangle':'sine';o.frequency.setValueAtTime(frequency*ratios[i],time);
  const attack=bell?.055:box?.012:.018,peak=event.velocity*weights[i],env=[{time,value:0},{time:time+attack,value:peak,curve:'linear'},{time:time+duration*.7,value:peak*(bell?.35:.25),curve:'exponential'},{time:end,value:0,curve:'linear'}];
  g.gain.setValueAtTime(0,time);for(const pt of env.slice(1))g.gain[pt.curve+'RampToValueAtTime'](pt.value,pt.time);
  o.connect(g);g.connect(destination);o.start(time);o.stop(end+.01);nodes.push([o,g]);envelopes.push(env);
 }
 const clean=()=>{for(const [o,g] of nodes){o.disconnect();g.disconnect();}};nodes[0][0].onended=clean;let releaseAt=Infinity;
 return {osc:nodes[0][0],end:end+.01,clean,stop(at=context.currentTime){at=Math.min(at,end);if(at>=releaseAt)return;releaseAt=at;nodes.forEach(([o,g],i)=>{try{holdEnvelopeAt(g.gain,envelopes[i],at);g.gain.linearRampToValueAtTime(0,at+.04);o.stop(at+.045);}catch{}});}};
}
