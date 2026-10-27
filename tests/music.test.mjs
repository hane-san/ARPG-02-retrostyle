import {IMPERIAL_SCORES} from '../imperial-music.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MUSIC_LIBRARY,ORIGINAL_SCORE_COUNT,buildTrack} from '../music.js';
import {GROK_SCORES} from '../grok-music.js';
import {UNEASY_SCORES} from '../uneasy.js';
import {STEPPE_SCORES} from '../steppe-asia.js';
import {SCORES,BONUS_SCORES} from '../music.js';
import {EXTRA_SCORES} from '../extra-music.js';
import {SILK_SCORES} from '../silk-music.js';

test('six battle scores, seven legacy bonus scores, 12 new exploration scores',()=>{
 assert.equal(SCORES.length,6);
 assert.equal(BONUS_SCORES.length,7);
 assert.equal(EXTRA_SCORES.length,12);
 assert.equal(SILK_SCORES.length,9);
 assert.equal(ORIGINAL_SCORE_COUNT,34);
 assert.equal(ORIGINAL_SCORE_COUNT*2,68);
 // The original 68 pieces keep their numbers; tracks added on 2026-10-22 append after them.
 assert.deepEqual(MUSIC_LIBRARY.slice(0,ORIGINAL_SCORE_COUNT),[...SCORES,...BONUS_SCORES,...EXTRA_SCORES,...SILK_SCORES]);
 assert.deepEqual(MUSIC_LIBRARY.slice(ORIGINAL_SCORE_COUNT),[...GROK_SCORES,...UNEASY_SCORES,...STEPPE_SCORES,...IMPERIAL_SCORES]);
});
test('the 68 original pieces and every later addition have unique titles and valid timings',()=>{
 const titles=new Set();
 for(let i=0;i<MUSIC_LIBRARY.length;i++){
  const score=MUSIC_LIBRARY[i];
  for(const [phase,part] of [[1,score.ally],[2,score.hostile]]){
   assert.ok(part.title&&part.title.length>2,'missing title for '+i+':'+phase);
   assert.ok(!titles.has(part.title),'duplicate title '+part.title);
   titles.add(part.title);
   assert.ok(part.bpm>=80&&part.bpm<=180,'bpm');
   assert.equal(part.melody.length,4);
   const rhythm=part.rhythm||(score.meter===3?[.5,.5,.5,.5,1,.5,.5,2]:[1,.5,.5,1,1,1,1,2]);
   assert.equal(rhythm.length,8);
   // Legacy score rhythms and newer composed phrases both fit their configured meter.
   if(i>=13)assert.ok(Math.abs(rhythm.reduce((a,b)=>a+b,0)-score.meter*2)<.00001,part.title);
   for(const phrase of part.melody)assert.equal(phrase.length,8);
   const track=buildTrack(i,phase);
   assert.equal(track.title,part.title);
   assert.ok(track.events.length>200,part.title);
   assert.ok(track.seconds>0);
   for(const e of track.events){
    assert.ok(Number.isFinite(e.beat)&&e.beat>=0&&e.beat<track.beats+2);
    assert.ok(Number.isFinite(e.midi)&&Number.isFinite(e.duration)&&e.duration>0);
   }
  }
 }
 assert.equal(titles.size,MUSIC_LIBRARY.length*2);
 assert.ok(titles.size>=68);
});
