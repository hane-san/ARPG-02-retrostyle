import test from 'node:test';
import assert from 'node:assert/strict';
import {createMusicLoopCache} from '../music-loop.js';

test('loop preparation serializes work, skips obsolete choices and bounds the cache',async()=>{
 let active=0,peak=0;const prepared=[],releases=[];
 const cache=createMusicLoopCache(async(track,alive)=>{
  peak=Math.max(peak,++active);prepared.push(track);
  await new Promise(resolve=>releases.push(resolve));active--;return alive()?track:null;
 });
 const first=cache.get('a','a');await Promise.resolve();
 const skipped=cache.get('b','b'),last=cache.get('c','c');
 releases.shift()();assert.equal(await first,null);assert.equal(await skipped,null);
 await new Promise(resolve=>setImmediate(resolve));releases.shift()();assert.equal(await last,'c');
 assert.deepEqual(prepared,['a','c']);assert.equal(peak,1);
 for(const key of ['d','e']){
  const result=cache.get(key,key);await new Promise(resolve=>setImmediate(resolve));releases.shift()();await result;
 }
 assert.equal(cache.size,2);assert.equal(await cache.get('d','unused'),'d');
 cache.destroy();assert.equal(cache.size,0);assert.equal(await cache.get('f','f'),null);
});
test('OFF cancels an unfinished loop without caching its late result',async()=>{
 let complete;const cache=createMusicLoopCache(async()=>new Promise(resolve=>complete=resolve));
 const pending=cache.get('a','a');await Promise.resolve();cache.cancel();complete('late');
 assert.equal(await pending,null);assert.equal(cache.size,0);
});
