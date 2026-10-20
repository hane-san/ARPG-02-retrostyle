import test from 'node:test';
import assert from 'node:assert/strict';
import {gainDuringFade,holdFadeAt} from '../journey-sound.js';

test('fade midpoint is computed from automation timing rather than stale AudioParam.value',()=>{
 assert.equal(gainDuringFade(-.1,.24),0);
 assert.equal(gainDuringFade(.12,.24),.5);
 assert.equal(gainDuringFade(.5,.24),1);
 const calls=[];
 const browserFallback={value:0,cancelScheduledValues:t=>calls.push(['cancel',t]),setValueAtTime:(v,t)=>calls.push(['set',v,t])};
 assert.ok(Math.abs(holdFadeAt(browserFallback,2.12,2,.24)-.5)<1e-9);
 assert.deepEqual(calls.map(x=>x[0]),['cancel','set']);
 assert.equal(calls[1][2],2.12);
 assert.ok(Math.abs(calls[1][1]-.5)<1e-9);
});

test('native hold is preferred and a throwing implementation safely falls back',()=>{
 const native=[];
 const gain={cancelAndHoldAtTime:t=>native.push(t),cancelScheduledValues:()=>{throw Error('should not fall back')}};
 holdFadeAt(gain,10.06,10,.24);
 assert.deepEqual(native,[10.06]);
 const fallback=[];
 const partial={cancelAndHoldAtTime:()=>{throw Error('unsupported');},cancelScheduledValues:t=>fallback.push(['cancel',t]),setValueAtTime:(v,t)=>fallback.push(['set',v,t])};
 holdFadeAt(partial,10.06,10,.24);
 assert.ok(Math.abs(fallback[1][1]-.25)<1e-8);
});
