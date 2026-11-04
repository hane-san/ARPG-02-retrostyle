// Stable, broad shapes. The same fields drive the land mask and its surface art.
export const landscapeHash=(x,y)=>{let n=Math.imul(x+317,374761393)^Math.imul(y+193,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
const smooth=t=>t*t*(3-2*t);
export function landscapeNoise(x,y,span=12){
 const a=Math.floor(x/span),b=Math.floor(y/span),u=smooth(x/span-a),v=smooth(y/span-b);
 const top=landscapeHash(a,b)*(1-u)+landscapeHash(a+1,b)*u;
 const bottom=landscapeHash(a,b+1)*(1-u)+landscapeHash(a+1,b+1)*u;
 return top*(1-v)+bottom*v;
}
export function landscapeShape(z,x,y){
 const nx=(x-z.x-z.w*.5)/(z.w*.46),ny=(y-z.y-z.h*.52)/(z.h*.47);
 let u=nx,v=ny;
 // Different landforms, not a row of identical oval courts. These fields are
 // also shared by the static ground art, so their colour follows the terrain.
 switch(z.key){
  case 'glass':u+=.09*Math.cos(ny*5);v+=.07*Math.sin(nx*4);break;
  case 'village':u+=ny*.18;v+=.06*Math.sin(nx*7);break;
  case 'windmill':u+=ny*.24;v-=.1*Math.cos(nx*4);break;
  case 'terrace':u-=ny*.16;v+=.09*Math.sin(nx*4);break;
  case 'mountain':u*=1+.17*Math.cos(ny*5.3);v+=.07*Math.sin(nx*7);break;
  case 'azure':v+=.12*Math.sin(nx*4);u+=ny*.04;break;
  case 'lane':u+=.16*Math.sin(ny*3.5);v+=nx*.08;break;
  case 'shoal':u+=.1*Math.sin(ny*7);v+=.07*Math.sin(nx*5);break;
  case 'impression':u+=.17*Math.sin(ny*3);v+=.09*Math.cos(nx*5);break;
  case 'dots':u-=ny*.16;v+=.08*Math.sin(nx*8);break;
  case 'grass':v+=.13*Math.sin(nx*5);u+=ny*.1;break;
  case 'mesa':u+=ny*.22;v+=.1*Math.sin(nx*6);break;
  case 'port':u+=.14*Math.sin(ny*4.7);v+=.06*Math.sin(nx*6);break;
  case 'marsh':u+=.17*Math.sin(ny*5.2);v+=.09*Math.sin(nx*9);break;
  case 'coast':v+=.13*Math.sin(nx*6.3);u+=.05*Math.sin(ny*5);break;
 }
 return u*u+v*v-(landscapeNoise(x+z.index*17,y,16)-.5)*.34;
}
export function segmentDistance(x,y,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function pathDistance(x,y,points){let d=Infinity;for(let i=1;i<points.length;i++)d=Math.min(d,segmentDistance(x,y,points[i-1],points[i]));return d;}

// Round rasterised soil tips only. Structures, bridges and water are not
// moved. This removes the one-cell hooks at a curved shore or contour wall;
// reachability is checked separately, never repaired by deleting whole islands.
export function roundLandscapeTips(tiles,w,h,protectedPoints){
 const blocked=new Set(['X','L','~','west-wall','west-sky','se-wall']);
 for(let pass=0;pass<4;pass++){
  const changes=[];
  for(let y=288;y<h-1;y++)for(let x=1;x<w-1;x++){
   const t=tiles[y][x];if(!['west-ground','se-ground','west-stair','se-stair','='].includes(t))continue;
   if(protectedPoints.some(p=>Math.abs(x-p.x)<3&&Math.abs(y-p.y)<3))continue;
   const around=[tiles[y][x-1],tiles[y][x+1],tiles[y-1][x],tiles[y+1][x]];
   if(around.filter(a=>!blocked.has(a)).length<=1)changes.push([x,y,around.includes('L')?'L':x>=242?'se-wall':'west-wall']);
  }
  if(!changes.length)break;for(const [x,y,t] of changes)tiles[y][x]=t;
 }
}
