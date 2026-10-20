import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const html=readFileSync(new URL('index.html',root),'utf8');
function png(filename,size){
 const bytes=readFileSync(new URL('assets/'+filename,root));
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',filename+' must be PNG');
 assert.equal(bytes.readUInt32BE(16),size,filename+' wrong width');
 assert.equal(bytes.readUInt32BE(20),size,filename+' wrong height');
}
test('pastel journey artwork is supplied locally for browser and iPhone',()=>{
 png('travel-icon-32.png',32);
 png('travel-icon-180.png',180);
 png('travel-icon-512.png',512);
 assert.match(html,/rel="icon" href="\.\/assets\/travel-icon-32\.png"/);
 assert.match(html,/rel="apple-touch-icon" href="\.\/assets\/travel-icon-180\.png"/);
 assert.match(html,/class="brand-mark"><img src="\.\/assets\/travel-icon-180\.png"/);
});
test('editable pixel source has no externally loaded assets',()=>{
 const svg=readFileSync(new URL('assets/travel-icon.svg',root),'utf8');
 assert.match(svg,/viewBox="0 0 64 64"/);
 assert.match(svg,/<polygon/);
 assert.doesNotMatch(svg,/<image\b|<script\b|href="https?:/);
});
