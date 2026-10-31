import test from 'node:test';
import assert from 'node:assert/strict';
import {turnPilgrimToy,pilgrimToyPhase,pilgrimToyKind,resetPilgrimToys,NUT_CAPACITY,drawPilgrimToy} from '../pilgrimage-toys.js';
import {makePilgrimageWorld} from '../pilgrimage-world.js';

// Issue #93 B05/B06: market toys turn on inspection and touch nothing else.
const world=makePilgrimageWorld(),site=id=>world.sites.find(s=>s.id===id);

test('the cloth window turns through three angles and wraps',()=>{
 resetPilgrimToys();const cloth=site('forest-cloth');
 assert.equal(pilgrimToyKind(cloth),'cloth');
 const lines=[1,2,3].map(()=>turnPilgrimToy(cloth));
 assert.equal(new Set(lines).size,3);assert.equal(pilgrimToyPhase(cloth),0);
});

test('the nut scale fills one nut at a time, then everything rolls back',()=>{
 resetPilgrimToys();const carver=site('forest-carver');
 for(let i=1;i<=NUT_CAPACITY;i++){turnPilgrimToy(carver);assert.equal(pilgrimToyPhase(carver),i);}
 assert.match(turnPilgrimToy(carver),/元の籠へ戻った/);assert.equal(pilgrimToyPhase(carver),0);
});

test('other places are not toys, and toys never change the world',()=>{
 const tiles=JSON.stringify(world.tiles),occ=Buffer.from(world.occupied).toString('base64');
 assert.equal(turnPilgrimToy(site('forest-tea')),null);assert.equal(turnPilgrimToy(world.sites[0]),null);
 const c={fillStyle:'',strokeStyle:'',lineWidth:1,fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){},save(){},restore(){}};
 for(const id of ['forest-cloth','forest-carver'])for(let i=0;i<6;i++){turnPilgrimToy(site(id));drawPilgrimToy(c,site(id));}
 assert.equal(JSON.stringify(world.tiles),tiles);assert.equal(Buffer.from(world.occupied).toString('base64'),occ);
});
