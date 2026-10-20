import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveGameMode} from '../game-mode.js';
test('the default entrance is the grassland journey, with explicit legacy entrances',()=>{
 assert.equal(resolveGameMode(''),'journey');
 assert.equal(resolveGameMode('?other=value'),'journey');
 assert.equal(resolveGameMode('?journey=1'),'journey');
 assert.equal(resolveGameMode('?mode=classic'),'classic');
 assert.equal(resolveGameMode('?journey=0'),'classic');
 assert.equal(resolveGameMode('?prototype=1'),'prototype');
});
test('old opt-in journey URLs retain precedence without accidentally opening another world',()=>{
 assert.equal(resolveGameMode('?prototype=1&journey=1'),'journey');
 assert.equal(resolveGameMode('?mode=classic&prototype=1'),'prototype');
 assert.equal(resolveGameMode('?mode=classic&journey=1'),'journey');
});
