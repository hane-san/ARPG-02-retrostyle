import test from 'node:test';
import assert from 'node:assert/strict';
import {envelopeAt,holdEnvelopeAt} from '../audio-envelope.js';

const envelope=[{time:1,value:0},{time:1.1,value:.1,curve:'linear'},{time:2,value:.001,curve:'exponential'},{time:2.1,value:0,curve:'linear'}];
test('future note release restores the exact ramp instead of a stale base gain',()=>{
 assert.equal(envelopeAt(envelope,.9).value,0);
 assert.ok(Math.abs(envelopeAt(envelope,1.05).value-.05)<1e-9);
 assert.ok(Math.abs(envelopeAt(envelope,1.55).value-.01)<1e-9);
 assert.ok(Math.abs(envelopeAt(envelope,2.05).value-.0005)<1e-9);
 assert.equal(envelopeAt(envelope,3).value,0);
 const calls=[],param={value:1,cancelScheduledValues:t=>calls.push(['cancel',t]),exponentialRampToValueAtTime:(v,t)=>calls.push(['exp',v,t])};
 holdEnvelopeAt(param,envelope,1.55);
 assert.equal(calls[0][0],'cancel');assert.equal(calls[1][0],'exp');
 assert.ok(Math.abs(calls[1][1]-.01)<1e-9);
});
test('native hold and a partially implemented native API both preserve envelopes',()=>{
 const native=[];holdEnvelopeAt({cancelAndHoldAtTime:t=>native.push(t)},envelope,1.05);assert.deepEqual(native,[1.05]);
 const calls=[];
 holdEnvelopeAt({cancelAndHoldAtTime(){throw Error('unsupported');},cancelScheduledValues(){},linearRampToValueAtTime:v=>calls.push(v)},envelope,1.05);
 assert.ok(Math.abs(calls[0]-.05)<1e-9);
});
