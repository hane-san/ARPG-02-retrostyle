import test from 'node:test';
import assert from 'node:assert/strict';
import {makePilgrimageWorld} from '../pilgrimage-world.js';
import {turnPilgrimPlay,pilgrimPlayPhase,pilgrimPlayKind} from '../pilgrimage-play.js';
test('independent wet and dry toys cycle three grooves without changing any world contract',()=>{
 const w=makePilgrimageWorld(),before=JSON.stringify([w.tiles,[...w.occupied],w.sites]);
 for(const id of ['pilgrim-place-1','journey-wonder-wheel','pilgrim-place-6']){
  const s=w.sites.find(s=>s.id===id);assert.equal(pilgrimPlayPhase(s),-1);
  for(const n of [0,1,2,0]){const text=turnPilgrimPlay(s);assert.equal(pilgrimPlayPhase(s),n);assert.match(text,/もう一度/);if(pilgrimPlayKind(s)==='dry')assert.match(text,/水は来ない/);}
 }
 const unrelated=w.sites.find(s=>s.id==='pilgrim-place-12');assert.equal(turnPilgrimPlay(unrelated),null);assert.equal(pilgrimPlayPhase(unrelated),-1);
 assert.equal(turnPilgrimPlay({id:'pilgrim-place-1',kind:'ruins'}),null);
 assert.equal(JSON.stringify([w.tiles,[...w.occupied],w.sites]),before);
});
