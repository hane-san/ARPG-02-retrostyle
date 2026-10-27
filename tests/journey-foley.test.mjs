import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFootstepClock,createJourneyFoley} from '../journey-foley.js';

function audioHarness(run,{state='running',fail=false,saved={}}={}){
 const previous=new Map(['AudioContext','webkitAudioContext','document'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const contexts=[],events=new Map(),values=new Map(Object.entries(saved));
 const storage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value)};
 class Param{
  constructor(value=0){this.value=value;this.events=[];}
  setValueAtTime(value,time){this.value=value;this.events.push(['set',value,time]);}
  linearRampToValueAtTime(value,time){this.value=value;this.events.push(['linear',value,time]);}
  exponentialRampToValueAtTime(value,time){this.value=value;this.events.push(['exponential',value,time]);}
  cancelScheduledValues(time){this.events.push(['cancel',time]);}
  cancelAndHoldAtTime(time){this.events.push(['hold',time]);}
 }
 class Node{
  constructor(){this.disconnected=false;this.connections=[];this.gain=new Param();this.frequency=new Param();this.Q=new Param();this.playbackRate=new Param(1);}
  connect(destination){if(!destination)throw new Error('missing destination');this.connections.push(destination);}
  disconnect(){this.disconnected=true;}
  start(time){this.started=time;}
  stop(time){this.stopped=time;}
  end(){this.onended?.();}
 }
 class Audio{
  constructor(){this.currentTime=0;this.state=state;this.sampleRate=48000;this.destination={};this.nodes=[];this.buffers=[];this.sources=[];this.events=new Map();this.resumes=0;contexts.push(this);}
  addEventListener(name,callback){this.events.set(name,callback);}
  changeState(next){this.state=next;this.events.get('statechange')?.();}
  resume(){this.resumes++;return Promise.resolve();}
  close(){this.state='closed';return Promise.resolve();}
  make(){if(fail)throw new Error('unavailable audio');const node=new Node();this.nodes.push(node);return node;}
  createGain(){return this.make();}
  createOscillator(){const node=this.make();this.sources.push(node);return node;}
  createBufferSource(){const node=this.make();this.sources.push(node);return node;}
  createBiquadFilter(){return this.make();}
  createBuffer(channels,length,rate){const data=new Float32Array(length),buffer={numberOfChannels:channels,length,sampleRate:rate,getChannelData:()=>data};this.buffers.push(buffer);return buffer;}
 }
 const document={hidden:false,addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:(name,callback)=>{if(events.get(name)===callback)events.delete(name);}};
 Object.defineProperty(globalThis,'AudioContext',{value:Audio,writable:true,configurable:true});
 Object.defineProperty(globalThis,'webkitAudioContext',{value:undefined,writable:true,configurable:true});
 Object.defineProperty(globalThis,'document',{value:document,writable:true,configurable:true});
 try{return run({contexts,storage,values,document,visibility:()=>events.get('visibilitychange')?.()});}
 finally{for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
}

test('ambient cues share the gesture context, mute, volume and voice budget',()=>audioHarness(({contexts,storage,document,visibility})=>{
 const sound=createJourneyFoley(storage),events=Array.from({length:8},(_,i)=>({id:String(i),kind:'bell',gain:1}));
 sound.ambience([],events);assert.equal(contexts.length,0,'no autoplay');
 sound.unlock();const c=contexts[0];sound.ambience([{id:'0',gain:1}],events);
 assert.equal(sound.snapshot().activeVoices,2,'two ambient voices');
 assert.equal(c.sources.length,4);
 c.currentTime=.1;sound.ambience([],[]);
 assert.ok(c.nodes.some(n=>n.gain.events.some(e=>e[0]==='linear'&&e[1]===0&&e[2]===.22)),'departure fades');
 sound.toggle();const played=sound.snapshot().played;sound.ambience([],events);
 assert.equal(sound.snapshot().played,played,'SFX OFF');
 sound.toggle();sound.setVolume(0);sound.ambience([],events);
 assert.equal(sound.snapshot().played,played,'zero volume');
 document.hidden=true;visibility();sound.ambience([],events);
 assert.equal(sound.snapshot().played,played,'background');
 sound.destroy();assert.equal(sound.snapshot().activeVoices,0);
}));

test('journey footfall cadence follows two tiles at any frame rate, never idle time',()=>{
 for(const hz of [30,60,90,120]){
  const clock=createFootstepClock();let count=0;
  for(let frame=0;frame<hz*10;frame++)count+=Number(clock.advance(6.15/hz));
  assert.equal(count,30,'ten seconds at '+hz+' Hz');
  assert.ok(Math.abs(clock.distance-1.5)<1e-7);
  for(let frame=0;frame<1000;frame++)assert.equal(clock.advance(0),false);
 }
 const clock=createFootstepClock();
 assert.equal(clock.advance(1.9),false);
 assert.equal(clock.advance(.1),true);
 assert.equal(clock.advance(.1),false);
 assert.equal(clock.advance(20),false,'teleport cannot make a burst of queued sounds');
 assert.equal(clock.distance,0);
 assert.equal(clock.advance(NaN),false);
 assert.equal(clock.advance(-1),false);
 clock.advance(1.9);clock.advance(.1,false);
 assert.equal(clock.advance(.1),false,'disabled distance is discarded');
});

test('old Web Audio volume changes preserve their calculated midpoint even with stale values',()=>audioHarness(({contexts,storage})=>{
 const sound=createJourneyFoley(storage);sound.unlock();const context=contexts[0],param=context.nodes[0].gain;
 param.cancelAndHoldAtTime=()=>{throw new Error('not supported');};
 sound.setVolume(.15);context.currentTime=.0175;
 param.value=0; // Some browsers expose the old base value during automation.
 sound.setVolume(.9);
 const held=param.events.filter(event=>event[0]==='set').at(-1);
 assert.ok(Math.abs(held[1]-.35)<1e-9);
 assert.equal(held[2],context.currentTime);
 context.currentTime=.035;param.cancelAndHoldAtTime=undefined;param.value=0;
 sound.setVolume(.1);
 assert.ok(Math.abs(param.events.filter(event=>event[0]==='set').at(-1)[1]-.625)<1e-9);
}));

test('replaced contexts cannot retire new voices, and destroy releases the engine',()=>audioHarness(({contexts,storage,document,visibility})=>{
 const sound=createJourneyFoley(storage);sound.unlock();const old=contexts[0];
 old.changeState('closed');sound.unlock();const current=contexts[1];
 assert.equal(sound.step(2,'g'),true);
 old.changeState('closed');
 assert.equal(sound.snapshot().activeVoices,1,'a late old-context callback leaves the current step alone');
 sound.destroy();
 assert.equal(current.state,'closed');assert.equal(sound.snapshot().activeVoices,0);
 assert.ok(current.nodes.every(node=>node.disconnected));
 document.hidden=true;visibility();document.hidden=false;
 sound.unlock();assert.equal(contexts.length,2);
 assert.equal(sound.step(2,'g'),false);assert.equal(sound.play('select'),false);
}));

test('journey audio has no autoplay, persists independent loudness and reuses its context',()=>audioHarness(({contexts,storage,values})=>{
 const sound=createJourneyFoley(storage);
 assert.equal(sound.enabled,true);assert.equal(sound.volume,.55);
 sound.play('select');sound.step(2,'g');
 assert.equal(contexts.length,0);assert.equal(sound.snapshot().state,'locked');
 sound.unlock();sound.unlock();
 assert.equal(contexts.length,1);
 sound.setVolume(.38);
 assert.equal(values.get('field-journey-sound-volume'),'0.38');
 assert.equal(new Map(values).has('tidal-atlas:field-journey-sound-volume'),false,'the caller supplies the existing namespaced storage');
 assert.equal(sound.toggle(),false);assert.equal(values.get('field-command-sound'),'false');
 assert.equal(sound.toggle(),true);assert.equal(contexts.length,1);
 assert.equal(sound.volume,.38);assert.equal(createJourneyFoley(storage).volume,.38);
 assert.equal(sound.setVolume(4),1);assert.equal(sound.setVolume(-2),0);
 assert.equal(sound.setVolume(NaN),0);assert.equal(sound.setVolume(Infinity),0);
}));

test('surface-specific short footsteps cache noise and disconnect every finished voice',()=>audioHarness(({contexts,storage})=>{
 const sound=createJourneyFoley(storage);sound.unlock();const context=contexts[0];
 const fundamentals=[];
 for(const tile of ['g','=','h','+','S']){
  const before=context.sources.length;
  assert.equal(sound.step(1,tile),false);assert.equal(sound.step(1,tile),true);
  const sources=context.sources.slice(before);
  assert.equal(sources.length,2,'one soft body and one filtered surface texture');
  fundamentals.push(sources[0].frequency.events[0][1]);
  assert.ok(sources.every(node=>node.started>=context.currentTime&&node.stopped-node.started<.25));
  for(const node of sources)node.end();
  assert.equal(sound.snapshot().activeVoices,0);
  assert.ok(context.nodes.slice(1).every(node=>node.disconnected),'only master gain remains connected');
  context.currentTime+=.4;
 }
 assert.equal(new Set(fundamentals).size,5);
 assert.equal(context.buffers.length,1,'noise reused across footsteps');
 assert.equal(sound.snapshot().steps,5);
 assert.equal(sound.play('soft-step'),false,'per-cell legacy sound cannot double the cadence');
}));

test('arrival cues coalesce, rapid inputs stay bounded and mute never revives old voices',()=>audioHarness(({contexts,storage})=>{
 const sound=createJourneyFoley(storage);sound.unlock();const context=contexts[0];
 assert.equal(sound.play('heal'),true);assert.equal(sound.play('select'),false);
 for(let i=0;i<100;i++)assert.equal(sound.play('confirm'),false);
 for(let i=0;i<20;i++){context.currentTime+=.18;sound.play('select');}
 assert.equal(sound.snapshot().activeVoices,6,'hard cap also survives delayed onended callbacks');
 context.currentTime+=.01;
 const old=context.sources.slice();
 sound.toggle();
 assert.ok(old.every(node=>node.stopped<=context.currentTime+.03001));
 const faded=context.nodes.filter(node=>node.gain.events.some(event=>event[0]==='linear'&&event[1]===0));
 assert.ok(faded.length>0,'mute fades envelopes instead of abruptly disconnecting');
 sound.toggle();
 assert.ok(old.every(node=>node.stopped<=context.currentTime+.03001),'unmuting cannot extend an old source');
 for(const node of old)node.end();
 assert.equal(sound.snapshot().activeVoices,0);
 assert.equal(sound.play('select'),true);
 const master=context.nodes[0];
 assert.ok(master.gain.events.some(event=>event[0]==='hold'));
 assert.ok(master.gain.events.some(event=>event[0]==='linear'&&Math.abs(event[2]-context.currentTime-.035)<1e-7));
}));

test('hidden, suspended, volume-zero and disabled walking never queues recovery footsteps',()=>audioHarness(({contexts,storage,document,visibility})=>{
 const sound=createJourneyFoley(storage);sound.unlock();const context=contexts[0];
 sound.step(1.8,'g');document.hidden=true;visibility();
 sound.step(2,'g');assert.equal(sound.play('confirm'),false);
 document.hidden=false;visibility();
 assert.equal(sound.step(.3,'g'),false);
 context.changeState('suspended');
 for(let i=0;i<20;i++)assert.equal(sound.step(.4,'g'),false);
 assert.equal(sound.play('select'),false);
 context.changeState('running');assert.equal(sound.step(.4,'g'),false);
 sound.setVolume(0);sound.step(2,'g');sound.setVolume(.55);
 assert.equal(sound.step(.4,'g'),false);
 sound.toggle();sound.step(2,'g');sound.toggle();
 assert.equal(sound.step(.4,'g'),false);
 assert.equal(sound.step(1.6,'g'),true);
 context.changeState('suspended');
 assert.equal(sound.snapshot().activeVoices,0,'suspended voices are disconnected before resume');
 assert.ok(context.sources.every(node=>node.disconnected));
}));

test('storage, unavailable audio and resume failures never escape into movement',()=>{
 audioHarness(({storage,contexts})=>{
  const sound=createJourneyFoley(storage);
  assert.equal(sound.volume,.55,'invalid persisted volume falls back');
  assert.doesNotThrow(()=>{sound.unlock();sound.step(2,'g');sound.play('heal');sound.toggle();sound.setVolume(.4);});
  assert.equal(contexts.length,1);
 },{fail:true,saved:{'field-journey-sound-volume':'bad'}});
 audioHarness(({contexts})=>{
  const storage={getItem(){throw new Error('blocked');},setItem(){throw new Error('full');}};
  const sound=createJourneyFoley(storage);sound.unlock();
  contexts[0].state='suspended';contexts[0].resume=()=>Promise.reject(new Error('gesture required'));
  assert.doesNotThrow(()=>{sound.unlock();sound.toggle();sound.toggle();sound.setVolume(.2);sound.step(2,'g');sound.play('confirm');});
  assert.equal(sound.snapshot().steps,0);
 });
});

test('temple replies wait on the audio clock, use the same context, and respect SE OFF and zero volume',()=>audioHarness(({contexts,storage})=>{
 const sound=createJourneyFoley(storage);
 assert.equal(sound.respond('sealed'),false,'gesture is required');
 sound.unlock();const c=contexts[0];
 assert.equal(sound.respond('sealed'),true);
 assert.equal(contexts.length,1);
 assert.ok(c.sources.every(s=>s.started>=.6),'a quiet wait precedes the response');
 sound.toggle();assert.equal(sound.respond('receiving-wet'),false);
 sound.toggle();sound.setVolume(0);assert.equal(sound.respond('receiving-dry'),false);
 sound.destroy();assert.equal(sound.snapshot().activeVoices,0);
}));
