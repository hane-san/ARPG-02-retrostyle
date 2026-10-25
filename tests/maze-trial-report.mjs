import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeJourneyWorld,routeJourneyWalk} from '../journey-world.js';
import {createMazeTrial,MAZE_TRIAL_AREA} from '../journey-maze-trial.js';

const world=makeJourneyWorld(),results=[];
for(const [start,target] of [[{x:17,y:102},{x:33,y:118}],[{x:33,y:118},{x:22,y:103}]]){
 const original=routeJourneyWalk(world,{...start,px:start.x,py:start.y,path:[]},target);
 const trial=createMazeTrial('?maze=turns');trial.arrive(start);
 let pos=start,steps=0;const choices=[];
 while(pos.x!==target.x||pos.y!==target.y){
  if(choices.length>original.length)throw Error('No progress');
  const route=routeJourneyWalk(world,{...pos,px:pos.x,py:pos.y,path:[]},target),choice=trial.plan(route,pos,world);
  if(!choice.path?.length)throw Error('No route');
  steps+=choice.path.length;choice.path.forEach(p=>trial.arrive(p));pos=choice.path.at(-1);
  choices.push({stop:pos,steps:choice.path.length,limited:choice.limited});
 }
 results.push({start,target,A:{choices:1,steps:original.length},B:{choices:choices.length,steps,stops:choices}});
}
const tiles=Array.from({length:world.h},(_,y)=>Array.from({length:world.w},(_,x)=>world.tileAt(x,y)).join(''));
const report={sourceMain:'68b8f84f40e3d0f31cdb577473d1c459da316f29',command:'node tests/maze-trial-report.mjs --save',area:MAZE_TRIAL_AREA,
 geometrySha256:createHash('sha256').update(JSON.stringify(tiles)).digest('hex'),results,
 unverified:['iPhone','human enjoyment','touch burden outside the scripted route','independent audit'],
 limits:['Map travel bypasses B by design','Only authored ancient floor A within the rectangle','Walking a corner learns it for this page only','No default pathfinding change']};
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--save'))writeFileSync(new URL('../docs/maze-trial-72-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
