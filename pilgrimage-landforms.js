import {landscapeNoise} from './landscape-geometry.js';

// Grow connected niches into previously blocked ground. Existing floors, lake
// tiles, roads and architectural feet are never removed or painted over. Each
// generation grows from the previous one, so a distant sliver cannot be born.
export function extendPilgrimageBanks({tiles,regions,routeDistance,w,h,sites,zones}){
 const feet=new Uint8Array(w*h);
 for(const s of sites)for(const r of s.solid)for(let y=s.y+r.y;y<s.y+r.y+r.h;y++)for(let x=s.x+r.x;x<s.x+r.x+r.w;x++)feet[y*w+x]=1;
 const radii=[12,12,9,5.5,7,5.5,7,7,7,7,7,5.5,5.5];
 const open=(x,y)=>x>0&&x<w-1&&y>0&&y<h-1&&!feet[y*w+x]&&!['X','L','~','pil-wall'].includes(tiles[y][x]);
 for(let generation=0;generation<3;generation++){
  const next=[];
  for(let y=2;y<288;y++)for(let x=2;x<w-2;x++){
   const k=y*w+x,ci=regions[k],d=routeDistance[k];
   if(tiles[y][x]!=='X'||ci>12||feet[k]||!Number.isFinite(d))continue;
   const theme=zones[ci].theme,field=landscapeNoise(x+ci*13,y,11);
   const lobe=theme==='forest'?Math.sin(x*.1)*Math.cos(y*.08):theme==='canyon'?Math.sin(x*.08+y*.04):theme==='ridge'?Math.cos(x*.07-y*.09):theme==='salt'?Math.sin(y*.13)+Math.cos(x*.06):Math.sin(x*.04+y*.05);
   const edge=Math.min(14.3,radii[ci]+.8+field*2.7+lobe*1.1);
   if(d>edge||![[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(([a,b])=>open(a,b)))continue;
   next.push([x,y,'pil-'+ci]);
  }
  for(const [x,y,t] of next)tiles[y][x]=t;
 }
}
