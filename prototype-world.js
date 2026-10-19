// Small Journey (opt-in): a reduced view of the existing archipelago.
// Coordinates intentionally remain unchanged. world.js's findPath uses the
// original 164-tile stride, so never renumber cells in this view.
import {makeWorld} from './world.js';

export const PROTOTYPE_WIDTH=80;
export const PROTOTYPE_HEIGHT=110;
export const PROTOTYPE_SITE_IDS=['windmill','shrine','oldport','market'];
export const PROTOTYPE_NPC_IDS=['n1','n2','n6','n7'];

export function makePrototypeWorld(){
 const source=makeWorld();
 const w=PROTOTYPE_WIDTH,h=PROTOTYPE_HEIGHT;
 const selectedSites=new Set(PROTOTYPE_SITE_IDS);
 const selectedNpcs=new Set(PROTOTYPE_NPC_IDS);
 const sites=source.sites.filter(s=>selectedSites.has(s.id));
 const npcs=source.npcs.filter(n=>selectedNpcs.has(n.id));
 const zones=source.zones.filter(z=>z.id==='garden'||z.id==='harbour');
 const bridges=source.bridges.filter(b=>b.id==='oldnorth');
 const tiles=source.tiles.slice(0,h).map(row=>row.slice(0,w));
 const occupied=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  occupied[y*w+x]=source.occupied[y*source.w+x];
 }
 // Non-selected landmarks are scenery again, not invisible walls.
 for(const s of source.sites){
  if(selectedSites.has(s.id))continue;
  for(let y=Math.max(0,s.y);y<Math.min(h,s.y+s.h);y++)
   for(let x=Math.max(0,s.x);x<Math.min(w,s.x+s.w);x++)
    occupied[y*w+x]=0;
 }
 function inside(x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<w&&y<h;}
 const world={
  id:'tidal',w,h,tiles,occupied,sites,npcs,zones,bridges,
  start:{...source.start},transitions:[],
  tileAt(x,y){return inside(x,y)?tiles[y][x]:'~';},
  walkable(x,y){return inside(x,y)&&!['~','#'].includes(tiles[y][x])&&!occupied[y*w+x];},
  siteAt(x,y){return sites.find(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);},
  npcAt(x,y){return npcs.find(n=>n.x===x&&n.y===y);},
  bridgeAt(x,y){return bridges.find(b=>x>=b.x1&&x<=b.x2&&y>=b.y1&&y<=b.y2);},
  transitionAt(){return undefined;},
  zoneAt(x,y){return source.zoneAt(x,y);}
 };
 return world;
}
