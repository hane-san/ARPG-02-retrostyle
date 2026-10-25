import test from 'node:test';
import assert from 'node:assert/strict';
import {pickJourneyTap,npcReach,NPC_REACH_MIN,NPC_REACH_MAX} from '../journey-tap.js';

// Camera centred on tile (10,10); toScreen mirrors game.js (tile centre, CSS px).
const view=(zoom,cx=10,cy=10,tile=32)=>(x,y)=>({x:200+((x+.5)-(cx+.5))*tile*zoom,y:400+((y+.5)-(cy+.5))*tile*zoom});

test('reach is measured in screen pixels and clamped for far and close views',()=>{
 assert.equal(npcReach(.6),Math.max(NPC_REACH_MIN,1.5*32*.6));
 assert.equal(npcReach(1),48);
 assert.equal(npcReach(1.8),NPC_REACH_MAX);
});

test('the far 0.6 view does not grab a speaker two tiles away',()=>{
 const toScreen=view(.6),npcs=[{id:'a',x:12,y:10}];
 const tap=toScreen(10,10);
 assert.equal(pickJourneyTap({tap,toScreen,npcs,zoom:.6,hero:{px:0,py:0,walking:false}}),null);
 // Tapping the speaker itself still works.
 assert.equal(pickJourneyTap({tap:toScreen(12,10),toScreen,npcs,zoom:.6,hero:{px:0,py:0,walking:false}}).item.id,'a');
});

test('the nearest of two close speakers wins instead of list order',()=>{
 const toScreen=view(1),npcs=[{id:'far',x:11,y:10},{id:'near',x:10,y:10}];
 const tap={x:toScreen(10,10).x+4,y:toScreen(10,10).y};
 assert.equal(pickJourneyTap({tap,toScreen,npcs,zoom:1,hero:{px:0,py:0,walking:false}}).item.id,'near');
});

test('tapping the walking explorer stops; tapping it while idle does nothing special',()=>{
 const toScreen=view(.6),hero={px:10.4,py:10,walking:true};
 const tap=toScreen(10.4,10);
 assert.deepEqual(pickJourneyTap({tap,toScreen,npcs:[],zoom:.6,hero}),{kind:'stop'});
 assert.equal(pickJourneyTap({tap,toScreen,npcs:[],zoom:.6,hero:{...hero,walking:false}}),null);
});

test('a speaker closer to the finger than the explorer keeps priority over stopping',()=>{
 const toScreen=view(1),npcs=[{id:'guide',x:11,y:10}];
 const hero={px:10,py:10,walking:true};
 const tap={x:toScreen(11,10).x-6,y:toScreen(11,10).y};
 assert.equal(pickJourneyTap({tap,toScreen,npcs,zoom:1,hero}).item.id,'guide');
 const onHero={x:toScreen(10,10).x+3,y:toScreen(10,10).y};
 assert.deepEqual(pickJourneyTap({tap:onHero,toScreen,npcs,zoom:1,hero}),{kind:'stop'});
});
