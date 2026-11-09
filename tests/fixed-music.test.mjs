import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MUSIC_QUICK,MUSIC_TRANSITION,rampLevel} from '../music.js';

test('board changes use a prompt but soft crossfade, faster than the long ambient fade',()=>{
 assert.ok(MUSIC_QUICK.fadeIn>=.4&&MUSIC_QUICK.fadeIn<1.2,'incoming piece swells quickly but not abruptly');
 assert.ok(MUSIC_QUICK.fadeOut>=MUSIC_QUICK.fadeIn&&MUSIC_QUICK.fadeOut<1.2,'outgoing piece overlaps the incoming one');
 assert.ok(MUSIC_QUICK.duck>0&&MUSIC_QUICK.duck<1&&MUSIC_QUICK.duckSeconds>=.2,'the waiting dip is audible yet gentle');
 assert.ok(MUSIC_QUICK.fadeIn>MUSIC_TRANSITION.fade,'no click-short change');
});
test('a gain ramp is held at its true level, including a dip from a partial fade-in',()=>{
 const fadeIn={from:0,to:1,start:10,seconds:.7};
 assert.equal(rampLevel(fadeIn,9),0);assert.ok(Math.abs(rampLevel(fadeIn,10.35)-.5)<1e-9);assert.equal(rampLevel(fadeIn,20),1);
 const dip={from:.5,to:.42,start:10.35,seconds:.45};
 assert.ok(Math.abs(rampLevel(dip,10.35)-.5)<1e-12);assert.ok(Math.abs(rampLevel(dip,11)-.42)<1e-12);
 assert.equal(rampLevel({from:1,to:1,start:0,seconds:0},5),1);
});
test('the fixed view asks for the next board\'s music when the slide starts, and only quick-fades there',()=>{
 const view=readFileSync(new URL('../fixed-screen-view.js',import.meta.url),'utf8'),game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 assert.match(view,/onTransition:\(\)=>\{[^}]*cue\(state\.transition\.to\)/);
 assert.match(game,/onCue:\(cue,quiet\)=>\{[^}]*applyTrack\(\{quick:true\}\)/);
 assert.equal((game.match(/quick:true/g)||[]).length,1,'other modes keep their existing fades');
});
