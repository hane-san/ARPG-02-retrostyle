// Issue #65: what a field tap means in the default journey, judged in screen pixels.
// The far 0.6 view no longer grabs a neighbour two tiles away, and the close 1.8 view
// stays generous. A walking explorer under the finger means "stop here".
export const NPC_REACH_MIN=26,NPC_REACH_MAX=56,NPC_REACH_TILES=1.5;
export const HERO_REACH_MIN=22,HERO_REACH_TILES=.6;

export function npcReach(zoom,tile=32){
 return Math.min(NPC_REACH_MAX,Math.max(NPC_REACH_MIN,NPC_REACH_TILES*tile*zoom));
}

// toScreen(x,y) returns the screen centre of tile (x,y); hero.walking says a route is live.
export function pickJourneyTap({tap,toScreen,hero,npcs,zoom,tile=32}){
 const reach=npcReach(zoom,tile);
 let npc=null,npcDistance=Infinity;
 for(const n of npcs){
  const s=toScreen(n.x,n.y),d=Math.hypot(tap.x-s.x,tap.y-s.y);
  if(d<reach&&d<npcDistance){npc=n;npcDistance=d;}
 }
 if(hero.walking){
  const s=toScreen(hero.px,hero.py),d=Math.hypot(tap.x-s.x,tap.y-s.y);
  // The nearer actor wins, so stopping never steals a tap meant for a speaker.
  if(d<Math.max(HERO_REACH_MIN,HERO_REACH_TILES*tile*zoom)&&d<=npcDistance)return {kind:'stop'};
 }
 return npc?{kind:'npc',item:npc}:null;
}
