// Quiet, original journey sounds. Only user input unlocks the single context;
// movement supplies actual travelled distance rather than a repeating timer.
import {gainDuringFade} from './journey-sound.js';
const STRIDE=2,MAX_VOICES=6,DEFAULT_VOLUME=.55;
const clamp=value=>Math.max(0,Math.min(1,value));

export function createFootstepClock(stride=STRIDE){
 if(!Number.isFinite(stride)||stride<=0)stride=STRIDE;
 let distance=0;
 return {
  advance(travelled,active=true){
   // A discontinuity is not a backlog of footsteps. Normal frames travel < .5.
   if(!active||!Number.isFinite(travelled)||travelled<0||travelled>stride*2){distance=0;return false;}
   distance+=travelled;
   if(distance+1e-9<stride)return false;
   distance%=stride;
   if(distance<1e-9||stride-distance<1e-9)distance=0;
   return true;
  },
  reset(){distance=0;},
  get distance(){return distance;}
 };
}

const SURFACES={
 grass:{frequency:158,body:.029,rustle:.027,low:1100,high:260,duration:.15},
 earth:{frequency:169,body:.030,rustle:.023,low:1400,high:320,duration:.14},
 stone:{frequency:188,body:.026,rustle:.019,low:1800,high:420,duration:.12},
 wood:{frequency:153,body:.029,rustle:.016,low:1000,high:260,duration:.16},
 salt:{frequency:179,body:.024,rustle:.029,low:1700,high:500,duration:.15}
};
function surfaceOf(tile){
 if(['study-stone','study-masonry'].includes(tile))return SURFACES.stone;
 if(tile==='study-channel'||tile==='study-silt')return SURFACES.salt;
 if(tile==='study-meadow')return SURFACES.grass;
 if('gGvi'.includes(tile)&&tile)return SURFACES.grass;
 if('htp'.includes(tile)&&tile)return SURFACES.stone;
 if(tile==='+')return SURFACES.wood;
 if(tile==='S'||tile==='s')return SURFACES.salt;
 return SURFACES.earth;
}

export function createJourneyFoley(storage){
 if(arguments.length===0)try{storage=globalThis.localStorage;}catch{}
 let enabled=true,volume=DEFAULT_VOLUME,context=null,master=null,noiseBuffer=null;
 let played=0,steps=0,cues=0,lastCue=-Infinity,seed=7401;
 const clock=createFootstepClock(),voices=new Set();
 let masterRamp={from:0,to:0,start:0,seconds:0},destroyed=false;
 try{enabled=storage?.getItem('field-command-sound')!=='false';}catch{}
 try{
  const saved=storage?.getItem('field-journey-sound-volume');
  if(saved!==null&&saved!==undefined&&saved!==''&&Number.isFinite(Number(saved)))volume=clamp(Number(saved));
 }catch{}
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const hidden=()=>!!globalThis.document?.hidden;
 const persist=(key,value)=>{try{storage?.setItem(key,String(value));}catch{}};
 const disconnect=node=>{try{node.disconnect();}catch{}};

 function clean(voice){
  if(!voices.delete(voice))return;
  for(const source of voice.sources){source.onended=null;disconnect(source);}
  for(const node of voice.nodes)disconnect(node);
 }
 function envelopeValue(envelope,time){
  const {start,attack,tail,end,peak}=envelope;
  if(time<=start||time>=end)return 0;
  if(time<start+attack)return peak*(time-start)/attack;
  if(time<tail)return peak*(.00001/peak)**((time-start-attack)/(tail-start-attack));
  return .00001*(end-time)/(end-tail);
 }
 function retireAll(immediate=false){
  if(!context)return;
  const now=context.currentTime;
  for(const voice of [...voices]){
   if(voice.retired&&!immediate)continue;
   voice.retired=true;
   for(const envelope of voice.envelopes)try{
    const param=envelope.node.gain;
    param.cancelScheduledValues(now);
    param.setValueAtTime(immediate?0:envelopeValue(envelope,now),now);
    param.linearRampToValueAtTime(0,now+.025);
   }catch{}
   for(const source of voice.sources)try{source.stop(now+(immediate?0:.03));}catch{}
   if(immediate)clean(voice);
  }
 }
 function level(){
  if(!master||!context)return;
  const param=master.gain,now=context.currentTime;
  const held=masterRamp.from+(masterRamp.to-masterRamp.from)*gainDuringFade(now-masterRamp.start,masterRamp.seconds);
  try{
   let nativeHeld=false;
   if(typeof param.cancelAndHoldAtTime==='function')try{param.cancelAndHoldAtTime(now);nativeHeld=true;}catch{}
   if(!nativeHeld){param.cancelScheduledValues(now);param.setValueAtTime(held,now);}
   const target=enabled?volume:0;
   param.linearRampToValueAtTime(target,now+.035);
   masterRamp={from:held,to:target,start:now,seconds:.035};
  }catch{}
 }
 function unlock(){
  if(destroyed||!enabled||volume===0||hidden())return;
  try{
   if(!context||context.state==='closed'){
    retireAll(true);
    disconnect(master);
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!Audio)return;
    context=new Audio();master=context.createGain();noiseBuffer=null;
    master.gain.setValueAtTime(volume,context.currentTime);master.connect(context.destination);
    masterRamp={from:volume,to:volume,start:context.currentTime,seconds:0};
    const opened=context;
    opened.addEventListener?.('statechange',()=>{
     if(context===opened&&opened.state!=='running'){clock.reset();lastCue=-Infinity;retireAll(true);}
    });
   }
   if(context.state!=='running')context.resume()?.catch?.(()=>{});
  }catch{/* Audio permission/device errors must never stop walking. */}
 }
 function ready(){
  const active=!destroyed&&enabled&&volume>0&&context?.state==='running'&&!hidden();
  if(!active){clock.reset();if(context&&context.state!=='running')retireAll(true);}
  return active;
 }
 function envelope(voice,peak,duration,attack=.012,delay=0){
  const node=context.createGain(),start=context.currentTime+.002+delay;
  const data={node,start,attack,tail:start+duration-.012,end:start+duration,peak};
  node.gain.setValueAtTime(0,start);
  node.gain.linearRampToValueAtTime(peak,start+attack);
  node.gain.exponentialRampToValueAtTime(.00001,data.tail);
  node.gain.linearRampToValueAtTime(0,data.end);
  node.connect(voice.output||master);voice.nodes.push(node);voice.envelopes.push(data);
  return data;
 }
 function source(voice,node,envelope){
  voice.sources.push(node);
  node.onended=()=>{voice.ended++;if(voice.ended===voice.sources.length)clean(voice);};
  node.start(envelope.start);
  node.stop(envelope.end+.004);
 }
 function tone(voice,frequency,peak,duration,end=frequency,delay=0){
  const e=envelope(voice,peak,duration,.012,delay),node=context.createOscillator();
  node.type='sine';node.frequency.setValueAtTime(frequency,e.start);
  node.frequency.exponentialRampToValueAtTime(end,e.end);
  node.connect(e.node);source(voice,node,e);
 }
 function rustle(voice,profile,variation){
  if(!noiseBuffer){
   noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*.23),context.sampleRate);
   const data=noiseBuffer.getChannelData(0);
   let total=0;
   for(let i=0;i<data.length;i++){data[i]=random()*2-1;total+=data[i];}
   const mean=total/data.length;
   for(let i=0;i<data.length;i++)data[i]-=mean;
  }
  const e=envelope(voice,profile.rustle*variation,profile.duration,.018);
  const node=context.createBufferSource(),high=context.createBiquadFilter(),low=context.createBiquadFilter();
  voice.nodes.push(high,low);node.buffer=noiseBuffer;node.playbackRate.value=.96+random()*.08;
  high.type='highpass';high.frequency.value=profile.high;high.Q.value=.5;
  low.type='lowpass';low.frequency.value=profile.low;low.Q.value=.55;
  node.connect(high);high.connect(low);low.connect(e.node);source(voice,node,e);
 }
 function voice(build){
  if(voices.size>=MAX_VOICES)return false;
  const item={sources:[],nodes:[],envelopes:[],ended:0,retired:false};voices.add(item);
  try{build(item);played++;return true;}
  catch{
   for(const node of item.sources)try{node.stop();}catch{}
   clean(item);return false;
  }
 }
 function step(distance,tile){
  if(!clock.advance(distance,ready()))return false;
  const profile=surfaceOf(tile),variation=.94+random()*.12;
  if(!voice(item=>{
   const frequency=profile.frequency*(steps%2?.97:1.03);
   tone(item,frequency,profile.body*variation,profile.duration,frequency*.76);
   rustle(item,profile,variation);
  }))return false;
  steps++;return true;
 }
 let lastTalk=-Infinity;
 // Issue #44: a soft rounded "po" for typed conversation. Its own short gap keeps
 // it from piling up, and it never consumes the menu-cue spacing.
 function talk(){
  if(!ready())return false;
  const now=context.currentTime;
  if(now-lastTalk<.055)return false;
  if(!voice(item=>tone(item,610+random()*50,.0075,.075,560)))return false;
  lastTalk=now;cues++;return true;
 }
 function play(kind){
  if(kind==='talk')return talk();
  // All footsteps enter through travelled distance; old per-cell calls do not
  // double the cadence. Arrival's heal + select becomes one quiet acknowledgement.
  if(!['select','cursor','cancel','confirm','heal','phase'].includes(kind)||!ready())return false;
  const now=context.currentTime;
  if(now-lastCue<.17)return false;
  const acknowledgement=['confirm','heal','phase'].includes(kind);
  if(!voice(item=>{
   tone(item,kind==='cancel'?370:acknowledgement?490:450,acknowledgement?.020:.017,acknowledgement?.19:.11);
   if(acknowledgement)tone(item,735,.007,.22);
  }))return false;
  lastCue=now;cues++;return true;
 }
 function toggle(){
  enabled=!enabled;persist('field-command-sound',enabled);clock.reset();lastCue=-Infinity;
  if(!enabled)retireAll(context?.state!=='running');
  else unlock();
  level();return enabled;
 }
 // Investigation uses the gesture-unlocked context and the existing voice
 // budget. Delays are audio-clock times, never timers or a loud arrival sting.
 function respond(form){
  if(!ready())return false;
  const wet=['confluence','receiving-wet'].includes(form),dry=form==='receiving-dry';
  if(!wet&&!dry&&!['sealed','echo-court','wheel'].includes(form))return false;
  return voice(v=>{
   const a=wet?740:dry?260:form==='sealed'?310:173;
   const delay=form==='sealed'?.6:form==='echo-court'?.25:.08;
   tone(v,a,.009,wet?.35:.22,a*.98,delay);
   tone(v,wet?390:173,.004,wet?.5:.4,wet?385:169,delay+(wet?.18:.3));
  });
 }
 function setVolume(value){
  const numeric=Number(value);
  if(!Number.isFinite(numeric))return volume;
  volume=clamp(numeric);persist('field-journey-sound-volume',volume);
  if(volume===0){clock.reset();retireAll(context?.state!=='running');}
  level();return volume;
 }
 const visibility=()=>{
  clock.reset();lastCue=-Infinity;
  if(hidden())retireAll(context?.state!=='running');
 };
 const timbres={kettle:[185,233],wood:[310,190],creak:[105,73],wind:[148,222],
  bell:[880,1320],glass:[1040,1560],drip:[740,390],clock:[610,430],stone:[260,173],echo:[72,108]};
 function ambience(levels,events){
  if(!ready())return;
  try{
  const gains=new Map(levels.map(s=>[s.id,clamp(s.gain)])),now=context.currentTime;
  for(const v of voices)if(v.ambientId){
   const target=gains.get(v.ambientId)||0,param=v.output.gain;
   const ramp=v.distanceRamp,held=ramp.from+(ramp.to-ramp.from)*Math.min(1,Math.max(0,(now-ramp.start)/.12));
   let nativeHeld=false;
   if(param.cancelAndHoldAtTime)try{param.cancelAndHoldAtTime(now);nativeHeld=true;}catch{}
   if(!nativeHeld){param.cancelScheduledValues(now);param.setValueAtTime(held,now);}
   param.linearRampToValueAtTime(target,now+.12);
   v.distanceRamp={from:held,to:target,start:now};
  }
  for(const event of events){
   if(!timbres[event.kind]||[...voices].filter(v=>v.ambientId).length>=2)continue;
   voice(v=>{
    v.ambientId=event.id;const gain=clamp(event.gain);
    v.distanceRamp={from:gain,to:gain,start:now};
    v.output=context.createGain();v.nodes.push(v.output);v.output.gain.setValueAtTime(gain,now);v.output.connect(master);
    const [a,b]=timbres[event.kind];
    tone(v,a,.012,event.kind==='echo'?.7:.32,a*.98);
    tone(v,b,.005,event.kind==='echo'?.95:.25,b*.99);
   });
  }
  }catch{/* A failing audio device must never interrupt exploration. */}
 }
 globalThis.document?.addEventListener?.('visibilitychange',visibility);
 return {unlock,play,step,ambience,respond,toggle,setVolume,get enabled(){return enabled;},get volume(){return volume;},
  destroy(){
   destroyed=true;clock.reset();retireAll(true);disconnect(master);
   globalThis.document?.removeEventListener?.('visibilitychange',visibility);
   try{context?.close?.()?.catch?.(()=>{});}catch{}
  },
  snapshot:()=>({enabled,volume,played,steps,cues,activeVoices:voices.size,state:context?.state||'locked'})};
}
