import {WEST_STUDIES} from './western-world.js';
import {SOUTHEAST_STUDIES} from './southeast-world.js';

// A producer's playtest tool, not a power or event in the fiction. All old
// entrances remain ordinary walking destinations; this adds no saved state.
export const TRIAL_WAYSTONE={id:'trial-waystone',kind:'trial',form:'trial-waystone',name:'試遊の道標',chapter:0,x:25,y:104,w:3,h:3,artTop:1,solid:[],blocking:false,entrance:{x:26,y:107},desc:'いろいろな土地を、順番を決めずに歩き比べるための道標。',aside:'行き先へ着いたら、この案内を閉じて歩き出せる。'};
export const TRIAL_REGION_IDS=[1,3,4,...WEST_STUDIES.map(z=>z.index),...SOUTHEAST_STUDIES.map(z=>z.index)];
export function trialDestinations(world){
 if(!world.pilgrimage)return [];
 return TRIAL_REGION_IDS.map(index=>{const z=world.zones[index];if(!z||!world.walkable(z.cx,z.cy))throw Error('Invalid trial landing '+index);return {id:z.id,name:z.name,x:z.cx,y:z.cy};});
}
export function createTrialBag(world,random=Math.random){
 const destinations=trialDestinations(world);let bag=[],last=null;
 const refill=()=>{bag=destinations.slice();for(let i=bag.length-1;i>0;i--){const r=random(),j=Math.floor((Number.isFinite(r)?Math.max(0,Math.min(.999999,r)):0)*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}};
 return {next(fromId){
  if(destinations.length<2)throw Error('Trial travel needs at least two lands');
  if(!bag.length)refill();
  // Defer the current land rather than removing it from a fresh cycle. It can
  // be visited later after moving elsewhere, so each normal cycle stays whole.
  let i=bag.findIndex(z=>z.id!==fromId&&z.id!==last);
  // A sole remaining land already reached on foot counts as seen.
  if(i<0){refill();i=bag.findIndex(z=>z.id!==fromId&&z.id!==last);}
  const target=bag.splice(i,1)[0];last=target.id;return target;
 }};
}
export function placeTrialTraveller(world,hero,target){
 if(!world.pilgrimage||!world.walkable(target.x,target.y))throw Error('Unsafe trial landing');
 Object.assign(hero,{x:target.x,y:target.y,px:target.x,py:target.y,path:[],arrival:null,moving:false,stride:0,face:'down',walkSource:'field'});
}
