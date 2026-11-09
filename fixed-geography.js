import {fixedSource} from './fixed-journey-data.js';

// Physical shared edges. Lane numbers are identical on the two boards; a
// split edge can expose both banks without turning the ravine into a bridge.
export const FIXED_START={room:'watershed-wheel',x:7,y:11};
export const FIXED_GEOGRAPHY_LINKS=[['empty-basin','S','watershed-wheel'],['watershed-wheel','S','flour-bags'],['cloth-court','S','carving-porch'],['flour-bags','S','cloud-ring'],['letter-window','S','blue-roof-court']];
const authored={
 'canal-bend:E':[[3,5]],'watershed-wheel:E':[[10,12]],'watershed-wheel:S':[[3,11]],'watershed-wheel:N':[[4,6]],
 'lifting-water:E':[[3,9]],'glass-reflection:E':[[9,11]],'empty-basin:E':[[2,4]],
 'white-flower-road:E':[[1,7],[13,13]],'cairn-turn:E':[[2,4]],
 'rose-grass:E':[[2,12]],'violet-plain:E':[[9,11]],'forest-picnic:E':[[9,13]],
 'orchard-window:S':[[3,5]],'beech-tea:E':[[2,6]],'cloth-court:E':[[9,11]],
 'mint-terraces:E':[[3,11]],'flour-bags:E':[[2,10]],'dotted-water:E':[[9,11]],
 'night-distribution:E':[[2,4]],'harbour-cloth:E':[[9,13]],'night-arch:E':[[3,5]]
};
const sky=['blue','blue','mint','mint','amber','rose','violet','glacier','violet','blue'];
export function composeFixedGeography(defs){
 for(const r of defs){
  if(r.row===0){r.sky=sky[r.col];r.skyAnchor={x:r.col,y:0};r.skyline=true;}
  if(!r.atlas)continue;
  // Broad, curved land rather than a cross cut from the same room template.
  const n=(r.col*3+r.row)%4;
  r.polygon=[[1,2+n/2],[5,1],[10,1+n/2],[13,3],[14,8],[12,13],[8,14],[2,12],[0,7]];
  r.roads=r.land==='ridge'?[[[2,10],[4,11],[7,10],[10,8],[12,5]],[[4,11],[5,7],[3,5]]]:r.land==='shore'?[[[2,5],[4,8],[7,11],[10,11],[12,9]]]:[[[2,8],[4,10],[8,11],[12,9]],[[4,10],[5,6],[8,5]]];
 }
 const flowers=defs.find(r=>r.id==='white-flower-road');flowers.name='白花の裂け野';flowers.chartName='裂け野';flowers.role='花の原が斜めに切れ、見える対岸へ上側の先端を回る。上下の岸は隣の風見石にも続く。';
 const centre=defs.find(r=>r.id===FIXED_START.room);
 centre.name='旅支度の分水庭';centre.chartName='旅支度';centre.role='中央の旅支度。西の水路、北の乾いた器、東の石壁、南の畑へ出発する。';
 centre.returnStone={x:7,y:12};
 centre.npc={x:5,y:11,name:'道具を洗う人',color:'#819f9b',lines:['西は水路、北は乾いた器の道。東の石壁は、南の畑から回っても行けるよ。','空を広く見たい日は、北の縁まで。帰りの道標はこの庭にも残しておくね。']};
}
const hexMix=(a,b)=>'#'+[1,3,5].map(i=>Math.round((parseInt(a.slice(i,i+2),16)+parseInt(b.slice(i,i+2),16))/2).toString(16).padStart(2,'0')).join('');
export function geographySeam(a,d,b,oldWidth){
 if(!a.atlas&&!b.atlas)return {width:oldWidth,center:7,bands:[[7-(oldWidth-1)/2,7+(oldWidth-1)/2]],surface:'=',kind:'road'};
 const dir={N:'S',S:'N',E:'W',W:'E'}[d],seed=a.col*7+a.row*11+b.col*3+b.row;
 const bands=authored[a.id+':'+d]||authored[b.id+':'+dir]||((['forest','meadow','terrace'].includes(a.land)&&['forest','meadow','terrace'].includes(b.land))?[[2,12]]:[[1,3],[4,8],[9,11],[3,9]][seed%4]);
 const spans=typeof bands[0]==='number'?[bands]:bands,primary=spans.reduce((best,p)=>p[1]-p[0]>best[1]-best[0]?p:best),width=spans.reduce((n,[lo,hi])=>n+hi-lo+1,0);
 const broad=width>=9,wet=['river','canal','pond','marsh'].includes(a.land)&&['river','canal','pond','marsh'].includes(b.land);
 return {bands:spans,center:(primary[0]+primary[1])/2,width,surface:broad?'g':wet?'b':'=',kind:spans.length>1?'split':broad?'land':a.land==='ridge'||b.land==='ridge'?'pass':wet?'causeway':'road',ground:hexMix(fixedSource(a.sourceIndex??23).palette[0],fixedSource(b.sourceIndex??23).palette[0])};
}
export const seamLanes=seam=>seam.bands.flatMap(([a,b])=>Array.from({length:b-a+1},(_,i)=>a+i));
export const seamTile=(seam,j)=>seam.surface==='g'&&Math.abs(j-seam.center)<=1?'=':seam.surface;

// One continuous, authored diagonal fault across two boards. Each tip can be
// walked around, so the far bank is real ground reached by an upper detour.
export const FIXED_FAULT=[[77,93],[82,97],[88,100],[93,100],[98,97],[101,93]];
function distance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
export function faultCell(def,x,y){return ['white-flower-road','cairn-turn'].includes(def.id)&&FIXED_FAULT.slice(1).some((b,i)=>distance(def.col*15+x,def.row*15+y,FIXED_FAULT[i],b)<.85);}

// Connect only disconnected land pockets around equipment. Water, dry
// channels, fault and solid feet are immutable; no straight bridge is rescued
// across an authored obstacle. Lowest excavation cost favours existing roads.
export function connectFixedLand(tiles,walkable){
 const inside=(x,y)=>x>0&&x<14&&y>0&&y<14,neighbors=(x,y)=>[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([x,y])=>x>=0&&x<15&&y>=0&&y<15),key=(x,y)=>y*15+x;
 function flood(){const first=tiles.flat().findIndex(walkable);if(first<0)throw Error('Empty fixed land');const q=[first],seen=new Set(q);for(let i=0;i<q.length;i++)for(const [x,y]of neighbors(q[i]%15,Math.floor(q[i]/15)))if(walkable(tiles[y][x])&&!seen.has(key(x,y))){seen.add(key(x,y));q.push(key(x,y));}return seen;}
 for(let iteration=0;iteration<225;iteration++){
  const seen=flood(),unconnected=tiles.flat().findIndex((t,i)=>walkable(t)&&!seen.has(i));if(unconnected<0)return;
  const dist=Array(225).fill(Infinity),parent=Array(225).fill(-1),open=new Set(seen);for(const k of seen)dist[k]=0;let end=-1;
  while(open.size){let k=-1;for(const v of open)if(k<0||dist[v]<dist[k])k=v;open.delete(k);if(walkable(tiles[Math.floor(k/15)][k%15])&&!seen.has(k)){end=k;break;}
   for(const [x,y]of neighbors(k%15,Math.floor(k/15))){const t=tiles[y][x],j=key(x,y);if(!walkable(t)&&!(t===' '&&inside(x,y)))continue;const cost=dist[k]+(walkable(t)?1:18);if(cost<dist[j]){dist[j]=cost;parent[j]=k;open.add(j);}}
  }
  if(end<0)throw Error('Land is cut off by an immutable obstacle');
  for(let k=end;!seen.has(k);k=parent[k])if(tiles[Math.floor(k/15)][k%15]===' ')tiles[Math.floor(k/15)][k%15]='=';
 }
 throw Error('Fixed land connection did not converge');
}
