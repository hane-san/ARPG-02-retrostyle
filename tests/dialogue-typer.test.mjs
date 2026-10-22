import test from 'node:test';
import assert from 'node:assert/strict';
import {createTyper,TYPE_CHARS_PER_SECOND} from '../dialogue-typer.js';
import {WALK_SPEED,walkSpeed} from '../walk-speed.js';

test('conversation pages type out character by character and can be finished at once',()=>{
 const line='草原へ？ 橋を渡ったら、円い道の好きなほうへどうぞ。';
 const typer=createTyper(line);
 assert.equal(typer.text,'');assert.equal(typer.done,false);
 typer.step(3/TYPE_CHARS_PER_SECOND+.001);
 assert.ok(typer.text.length>=2&&typer.text.length<line.length,typer.text);
 assert.ok(line.startsWith(typer.text));
 typer.finish();
 assert.equal(typer.text,line);assert.equal(typer.done,true);
 assert.equal(typer.step(1),false,'a finished page never sounds again');
});
test('punctuation lingers and blips are sparse, never one per character',()=>{
 const plain=createTyper('あいうえおかきくけこ'),paused=createTyper('あ。い。う。え。お。');
 plain.step(.2);paused.step(.2);
 assert.ok(paused.text.length<plain.text.length,'sentence ends add a short pause');
 const typer=createTyper('ぽぽぽぽぽぽぽぽぽぽぽぽぽぽぽぽぽぽぽぽ');let blips=0,frames=0;
 while(!typer.done&&frames<500){if(typer.step(1/60))blips++;frames++;}
 assert.ok(blips>=5&&blips<=11,'about one blip per two voiced characters: '+blips);
 const quiet=createTyper('、、、。。。……');let any=false;
 while(!quiet.done)any=quiet.step(1/60)||any;
 assert.equal(any,false,'punctuation alone is silent');
});
test('field steps are slower and atlas destinations faster than the old single speed',()=>{
 assert.ok(WALK_SPEED.field<6.15&&WALK_SPEED.map>6.15);
 assert.equal(walkSpeed('field'),5.7);assert.equal(walkSpeed('map'),7.35);
 assert.equal(walkSpeed('keyboard'),WALK_SPEED.field,'unknown sources walk at the field pace');
});
