// Original adventure pieces: separate themes/answers, asymmetrical riffs and
// composed quiet/build/break/climax passages. Previous scores stay byte-identical.
const rows=[
 ['風を切る稜線',136,4,48,57,'horn','pulse',[0,2,3,5,7,9,10],[0,3,2,6,4,8,5,3,7,4,9,6,2,5,3,0],[7,4,8,3,6,10,5,9,4,7,2,6,8,5,3,1],[0,5,2,6,3,1,4,0]],
 ['裂け目を走る銅の拍',144,7,32,55,'reed','pulse',[0,2,3,5,7,8,10],[2,0,5,3,1,6,4,8,3,7,2,5,9,4,1,0],[6,3,8,4,7,2,9,5,3,10,6,4,8,5,2,0],[0,2,5,1,6,3,4,0]],
 ['赤砂を渡る翼',126,4,48,58,'horn','strings',[0,2,4,5,7,9,11],[0,4,2,7,5,3,8,6,4,9,5,2,6,3,1,0],[7,3,9,5,8,4,10,6,2,7,4,9,5,8,3,1],[0,4,1,5,3,6,2,0]],
 ['草原、青い風の助走',112,5,32,62,'flute','pulse',[0,2,3,5,7,9,10],[3,0,4,2,6,1,5,8,4,7,2,6,9,5,3,0],[8,4,6,1,7,3,10,5,2,9,6,4,8,5,2,1],[0,3,6,2,5,1,4,0]]
];
const parts=rows.map(([title,bpm,meter,bars,root,lead,arp,scale,a,b,chords])=>({title,bpm,meter,bars,root,lead,arp,scale,a,b,chords}));
export const ENERGY_SCORES=[0,1].map(i=>({name:parts[i*2].title+'／'+parts[i*2+1].title,root:parts[i*2].root,meter:parts[i*2].meter,lead:parts[i*2].lead,arp:parts[i*2].arp,energy:true,ally:parts[i*2],hostile:parts[i*2+1]}));
const midi=(p,n)=>p.root+12*Math.floor(n/7)+p.scale[((n%7)+7)%7];
export function energySection(p,bar){
 if(p.bars===48)return ['intro','theme','answer','break','climax','coda'][Math.floor(bar/8)];
 return ['intro','answer','break',bar>=p.bars-3?'coda':'climax'][Math.floor(bar/8)];
}
export function buildEnergyTrack(mapId,phase,score){
 const p=phase===1?score.ally:score.hostile,events=[],total=p.bars*p.meter;
 const push=(beat,duration,n,voice,velocity,pan=0)=>{if(beat<total)events.push({beat,duration:Math.min(duration,total-beat),midi:midi(p,n),voice,velocity,pan});};
 for(let bar=0;bar<p.bars;bar++){
  const section=energySection(p,bar),quiet=section==='intro'||section==='break'||section==='coda',full=section==='answer'||section==='climax',beat=bar*p.meter,chord=p.chords[(bar+(section==='answer'?3:0))%8];
  const melody=section==='answer'||section==='break'?p.b:p.a,j=bar%8*2,level=section==='climax'?.17:full?.145:quiet?.075:.12;
  // Quiet statements leave actual empty beats; the answer brings a new line.
  if(!quiet||bar%2===0||bar===p.bars-1)push(beat+(section==='break'?.5:0),p.meter*(quiet?.68:.4),section==='coda'&&bar===p.bars-1?0:melody[j],quiet?'piano':p.lead,level,-.12);
  if(!quiet)push(beat+p.meter*.57,p.meter*.35,melody[j+1],p.lead,level*.76,.08);
  if(full)push(beat+p.meter*.82,p.meter*.15,p.b[(j+5)%16],p.arp,.055,.2);
  if(bar%2===0||!quiet)for(const n of [chord-7,chord-3,chord-1])push(beat,p.meter*(quiet?1.7:.92),n,'pad',quiet?.021:.026,-.28);
  push(beat,p.meter*(quiet?.82:.42),chord-14,'bass',quiet?.04:.065);
  if(!quiet)push(beat+p.meter*.66,p.meter*.28,chord-10,'bass',.042);
  const riff=p.meter===7?[0,1.5,2.5,4,5.5,6.25]:p.meter===5?[0,.75,2,3.5,4.25]:[0,.75,1.5,2.75];
  if(!quiet)for(const [i,at] of riff.entries())push(beat+at,.36,chord+[0,4,2,6,1,5][(i+bar)%6],p.arp,full?.048:.031,.25);
  // A restrained pulse, never a sudden volume jump or a horror stinger.
  if(!quiet)for(const at of [0,p.meter*.5])events.push({beat:beat+at,duration:.08,midi:at?38:35,voice:'drum',velocity:full?.04:.024,pan:at?.12:-.08});
 }
 events.sort((a,b)=>a.beat-b.beat);
 return {mapId,side:phase===1?'ally':'hostile',title:p.title,bpm:p.bpm,beats:total,seconds:total*60/p.bpm,events};
}

// A softly filtered retro pulse/pluck, made locally from original oscillator
// partials. Gain release follows the same continuous-stop contract as old voices.
export function scheduleEnergyNote(context,destination,event,time,secondsPerBeat,holdEnvelopeAt){
 const duration=Math.max(.08,event.duration*secondsPerBeat),end=time+duration+.22,nodes=[],envelopes=[];
 const filter=context.createBiquadFilter();filter.type='lowpass';filter.Q.value=.7;
 filter.frequency.setValueAtTime(3200,time);filter.frequency.exponentialRampToValueAtTime(1050,time+duration);
 const pan=context.createStereoPanner?.();if(pan){pan.pan.value=Math.max(-.7,Math.min(.7,event.pan||0));filter.connect(pan);pan.connect(destination);}else filter.connect(destination);
 for(const [i,ratio] of [1,2,3].entries()){
  const o=context.createOscillator(),g=context.createGain(),peak=event.velocity*[.7,.2,.1][i];
  o.type=i?'sine':'triangle';o.frequency.setValueAtTime(440*2**((event.midi-69)/12)*ratio,time);
  const env=[{time,value:0},{time:time+.014,value:peak,curve:'linear'},{time:time+duration*.75,value:peak*.26,curve:'exponential'},{time:end,value:0,curve:'linear'}];
  g.gain.setValueAtTime(0,time);for(const pt of env.slice(1))g.gain[pt.curve+'RampToValueAtTime'](pt.value,pt.time);
  o.connect(g);g.connect(filter);o.start(time);o.stop(end+.01);nodes.push([o,g]);envelopes.push(env);
 }
 const clean=()=>{for(const [o,g] of nodes){o.disconnect();g.disconnect();}filter.disconnect();pan?.disconnect();};nodes[0][0].onended=clean;let releaseAt=Infinity;
 return {osc:nodes[0][0],end:end+.01,clean,stop(at=context.currentTime){at=Math.min(at,end);if(at>=releaseAt)return;releaseAt=at;nodes.forEach(([o,g],i)=>{try{holdEnvelopeAt(g.gain,envelopes[i],at);g.gain.linearRampToValueAtTime(0,at+.04);o.stop(at+.045);}catch{}});}};
}
