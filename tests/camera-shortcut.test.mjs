import {test} from 'node:test';
import assert from 'node:assert/strict';
import {easeEdgeCamera,smoothPanCamera,PAN_SENSITIVITY,limitCamera,heroVisible} from '../camera-limits.js';
import {START,W,H,TILE,makeWorld,findPath} from '../world.js';

const viewport={width:390,height:640,zoom:1.25};
const map={width:W*TILE,height:H*TILE,tile:TILE};
const hero={x:START.x,y:START.y};
const center={x:(hero.x+.5)*TILE,y:(hero.y+.5)*TILE};
test('manual pan responds slightly faster but approaches its target smoothly',()=>{
 assert.ok(PAN_SENSITIVITY>.58&&PAN_SENSITIVITY<.85);
 const target={x:center.x+100,y:center.y+65};
 const first=smoothPanCamera(center,target,hero,viewport,map,.016);
 const second=smoothPanCamera(first,target,hero,viewport,map,.016);
 assert.ok(first.x>center.x&&first.x<target.x,'first frame should be interpolated');
 assert.ok(second.x>first.x&&second.x<=target.x,'should continue easing toward target');
 assert.ok(first.y>center.y&&first.y<target.y);
 assert.ok(heroVisible(first,hero,viewport,map));
 assert.ok(heroVisible(second,hero,viewport,map));
});
test('manual pan is frame-time independent and bounded by the protagonist',()=>{
 const target={x:1e7,y:-1e7};
 function run(dt,n){let p={...center};for(let i=0;i<n;i++)p=smoothPanCamera(p,target,hero,viewport,map,dt);return p;}
 const at60=run(1/60,60),at30=run(1/30,30);
 assert.ok(Math.abs(at60.x-at30.x)<.02);
 assert.ok(Math.abs(at60.y-at30.y)<.02);
 assert.ok(heroVisible(at60,hero,viewport,map));
 assert.ok(at60.x>=viewport.width/(2*viewport.zoom));
});
test('walking camera starts moving earlier with the same gentle ease',()=>{
 const person={x:START.x+5,y:START.y+5};
 const before=easeEdgeCamera(center,person,viewport,map,.016);
 assert.ok(before.x>center.x);
 assert.ok(before.y>center.y);
 assert.ok(heroVisible(before,person,viewport,map));
 const after=easeEdgeCamera(before,person,viewport,map,.016);
 assert.ok(after.x>=before.x&&after.y>=before.y);
 assert.ok(heroVisible(after,person,viewport,map));
});
test('short bridge beside starting position is both reachable and safe',()=>{
 const world=makeWorld();
 const shortcut=world.transitions.find(t=>t.name==='星風の小橋を渡る');
 assert.ok(shortcut);
 assert.ok(Math.abs(shortcut.x-START.x)<=5);
 assert.ok(Math.abs(shortcut.y-START.y)<=2);
 assert.equal(world.tileAt(shortcut.x,shortcut.y),'+');
 assert.ok(world.bridgeAt(shortcut.x,shortcut.y)?.id==='starwind-near');
 const route=findPath(world,START,{x:shortcut.x,y:shortcut.y});
 assert.ok(route?.length>=3&&route.length<=7);
 assert.equal(route.at(-1).x,shortcut.x);
 assert.equal(world.tileAt(44,37),'~','the bridge must span a real channel');
});
