// Producer request 2026-11-12: small, Zelda-like playfulness in the terrain.
// Each board gains a few authored-by-seed landforms: bush clumps and boulders
// that make little nooks, stepping stones across a stream, a pond, a signpost
// that names the exits, and a quiet glint to look at. They are physical where
// they look solid, and they never cut a lane, a landing, a doorstep or a
// person off: every placement is kept only if the whole floor stays connected.
// There is no item, score, quest or saved state. Solid pieces use their own
// tile 'o', so a building's foot ('h') is never mistaken for a bush.
import {seamLanes} from './fixed-geography.js';
const SKIP=new Set(['watershed-wheel','white-flower-road','cairn-turn','sealed-court']);
const seedOf=id=>{let h=2166136261;for(const ch of id)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
function random(seed){let s=seed||1;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)%100000)/100000;};}
const GLINTS={
 forest:['根元の苔に、小さな木彫りの鳥が置いてある。誰かの忘れ物だろうか。','木の洞をのぞくと、乾いた木の実がきちんと並んでいた。','落ち葉の下に、平たい石が三つ。子どもの遊びの跡らしい。'],
 meadow:['草の中に、白い石で描いた小さな円。遊び場の跡らしい。','風が止むと、足もとで小さな鈴が鳴った。草に結んだ鈴だ。','花のあいだに、木の札が埋もれている。「ここで昼寝」とだけ。'],
 village:['垣根の下で、欠けた器が植木鉢になっている。','石の隙間に、舟の絵を描いた紙が挟んであった。','軒先の小石の列は、誰かが数えながら並べたらしい。'],
 water:['浅瀬の石の下で、小さな魚が向きをそろえて休んでいる。','水際に、誰かが積んだ小石の塔がある。','岸の草に、舟をつなぐ古い輪が残っている。'],
 stone:['岩の陰に、風よけの小さな囲い。旅人の休み場だったらしい。','石の面に、古い水位の線が刻まれている。数字はもう読めない。','足もとの敷石に、ひとつだけ星の形が彫ってある。'],
 dry:['白い地面に、舟の竜骨のような細い溝が続いている。','乾いた溝の底で、小さな貝殻がひとつ光った。','ひび割れの模様が、ここだけ渦を巻いている。']
};
const family=land=>['forest'].includes(land)?'forest':['meadow','terrace'].includes(land)?'meadow':land==='village'?'village':['canal','river','pond','marsh','shore'].includes(land)?'water':['salt','dry'].includes(land)?'dry':'stone';
const ARROWS={N:'↑',E:'→',S:'↓',W:'←'};
// The usable interior keeps clear of the outer two rows, and of every lane
// and landing reaching four cells (0-3) in from its edge. A placed cell also keeps a step away from roads.
const interior=(x,y)=>x>=2&&x<=12&&y>=2&&y<=12;
export function placeFixedFeatures(room,tiles,floor,names){
 if(SKIP.has(room.id)||room.sourceIndex===undefined)return [];
 const rnd=random(seedOf(room.id)),fam=family(room.land),features=[],key=(x,y)=>x+','+y;
 const keep=new Set();
 const mark=(p,r=1)=>{if(!p)return;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)keep.add(key(p.x+dx,p.y+dy));};
 for(const s of [room.site,...(room.props||[])].filter(Boolean)){mark(s.entrance,1);
  // Nothing goes inside or right beside a building, gate or piece of equipment.
  for(let y=Math.floor(s.y)-1;y<Math.ceil(s.y+s.h)+1;y++)for(let x=Math.floor(s.x)-1;x<Math.ceil(s.x+s.w)+1;x++)keep.add(key(x,y));}
 if(room.house)for(let y=room.house.y-1;y<=room.house.y+room.house.h;y++)for(let x=room.house.x-1;x<=room.house.x+room.house.w;x++)keep.add(key(x,y));
 for(const n of room.npcs)mark(n,1);
 if(room.returnStone)mark(room.returnStone,1);
 for(const [d,seam] of Object.entries(room.seams||{}))for(const j of seamLanes(seam))for(let k=0;k<=3;k++)for(const o of [0]){const x=d==='N'||d==='S'?j+o:d==='W'?k:14-k,y=d==='E'||d==='W'?j+o:d==='N'?k:14-k;keep.add(key(x,y));}
 const at=(x,y)=>tiles[y]?.[x];
 const open=(x,y)=>interior(x,y)&&at(x,y)==='g'&&!keep.has(key(x,y));
 const nearRoad=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>['=','s','b'].includes(at(x+dx,y+dy)));
 // One flood from every lane must still reach each floor cell, doorstep and person.
 function connected(){
  const start=[];for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(floor(tiles[y][x])&&(x===0||y===0||x===14||y===14))start.push([x,y]);
  if(!start.length)return false;const seen=new Set(start.map(([x,y])=>key(x,y))),q=[...start];
  for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>14||ny>14||seen.has(key(nx,ny))||!floor(tiles[ny][nx]))continue;seen.add(key(nx,ny));q.push([nx,ny]);}}
  for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(floor(tiles[y][x])&&!seen.has(key(x,y)))return false;
  for(const s of [room.site,...(room.props||[])].filter(Boolean))if(!seen.has(key(s.entrance.x,s.entrance.y)))return false;
  for(const n of room.npcs)if(!seen.has(key(n.x,n.y)))return false;
  return true;
 }
 function trySolid(cells,feature){
  if(!cells.every(([x,y])=>open(x,y)))return false;
  const old=cells.map(([x,y])=>tiles[y][x]);cells.forEach(([x,y])=>tiles[y][x]=feature.tile||'o');
  if(!connected()){cells.forEach(([x,y],i)=>tiles[y][x]=old[i]);return false;}
  cells.forEach(([x,y])=>mark({x,y},0));features.push({...feature,cells});return true;
 }
 const pickCell=(test=open)=>{const c=[];for(let y=2;y<=12;y++)for(let x=2;x<=12;x++)if(test(x,y))c.push([x,y]);return c.length?c[Math.floor(rnd()*c.length)]:null;};
 // 1. Stepping stones: a short stream crossing that offers a second way.
 if(fam==='water'){
  const runs=[];
  for(let y=2;y<=12;y++)for(let x=2;x<=12;x++)for(const [dx,dy] of [[1,0],[0,1]])for(const len of [1,2,3]){
   const cells=Array.from({length:len},(_,i)=>[x+dx*i,y+dy*i]);
   if(!cells.every(([cx,cy])=>interior(cx,cy)&&at(cx,cy)==='w'))continue;
   const a=[x-dx,y-dy],b=[x+dx*len,y+dy*len];
   if(['g','='].includes(at(...a))&&['g','='].includes(at(...b))&&!keep.has(key(...a))&&!keep.has(key(...b)))runs.push(cells);
  }
  if(runs.length){const cells=runs[Math.floor(rnd()*runs.length)];cells.forEach(([x,y])=>tiles[y][x]='k');features.push({kind:'stones',cells});}
 }
 // 2. A little nook: two or three solid pieces with a glint tucked inside.
 const solidKind=fam==='forest'||fam==='village'||fam==='meadow'?'bush':'boulder';
 const shapes=[[[0,0],[1,0],[0,1]],[[0,0],[1,0],[1,1]],[[0,0],[0,1],[1,1]],[[1,0],[0,1],[1,1]]];
 let nook=null;
 for(let attempt=0;attempt<40&&!nook;attempt++){
  const c=pickCell((x,y)=>open(x,y)&&open(x+1,y)&&open(x,y+1)&&open(x+1,y+1)&&!nearRoad(x,y)&&!nearRoad(x+1,y+1));if(!c)break;
  const shape=shapes[Math.floor(rnd()*shapes.length)],cells=shape.map(([dx,dy])=>[c[0]+dx,c[1]+dy]);
  const inside=[[0,0],[1,0],[0,1],[1,1]].map(([dx,dy])=>[c[0]+dx,c[1]+dy]).find(([x,y])=>!cells.some(([a,b])=>a===x&&b===y));
  if(trySolid(cells,{kind:solidKind,seed:rnd()})){nook=inside;mark({x:inside[0],y:inside[1]},0);}
 }
 // 3. A few loose pieces for texture; each is physical and checked.
 const loose=fam==='water'?['reeds','boulder']:fam==='dry'||fam==='stone'?['boulder','cairn']:['bush','stump'];
 for(let i=0,count=1+Math.floor(rnd()*2);i<count;i++){
  for(let attempt=0;attempt<20;attempt++){const c=pickCell((x,y)=>open(x,y)&&!nearRoad(x,y));if(!c)break;const kind=loose[Math.floor(rnd()*loose.length)];if(kind==='reeds'){features.push({kind,cells:[c],seed:rnd()});mark({x:c[0],y:c[1]},0);break;}if(trySolid([c],{kind,seed:rnd()}))break;}
 }
 // 4. A small pond in open grass, sometimes, where the land is gentle.
 if(['meadow','village','forest'].includes(fam)&&rnd()<.45){
  for(let attempt=0;attempt<30;attempt++){const c=pickCell((x,y)=>open(x,y)&&open(x+1,y)&&open(x,y+1)&&open(x+1,y+1)&&!nearRoad(x,y)&&!nearRoad(x+1,y+1));if(!c)break;if(trySolid([[c[0],c[1]],[c[0]+1,c[1]],[c[0],c[1]+1],[c[0]+1,c[1]+1]],{kind:'pond',tile:'w',seed:rnd()}))break;}
 }
 // 5. A signpost beside the road, naming where the roads go.
 const exits=Object.keys(room.connections).filter(d=>names[room.connections[d]]);
 if(exits.length>=2&&rnd()<.6){
  for(let attempt=0;attempt<30;attempt++){const c=pickCell((x,y)=>open(x,y)&&nearRoad(x,y));if(!c)break;
   const lines=[['N','E','S','W'].filter(d=>exits.includes(d)).map(d=>ARROWS[d]+' '+names[room.connections[d]]).join('　'),'道しるべの角は、みんなが触るところだけ丸く光っている。'];
   if(trySolid([c],{kind:'sign',seed:rnd(),name:'道しるべ',lines}))break;}
 }
 // 6. The glint: walkable, quiet, and only a line of text when looked at.
 const pool=GLINTS[fam],glint=nook&&tiles[nook[1]][nook[0]]==='g'?nook:pickCell((x,y)=>open(x,y)&&!nearRoad(x,y))||pickCell(open);
 if(glint){features.push({kind:'glint',cells:[glint],x:glint[0],y:glint[1],name:'小さな発見',lines:[pool[Math.floor(rnd()*pool.length)]],seed:rnd()});}
 // Flower beds or a ring of stones on open ground are ground detail only.
 const deco=fam==='dry'||fam==='stone'?'ring':fam==='water'?'lilies':'flowers';
 for(let i=0;i<2;i++){const c=pickCell((x,y)=>deco==='lilies'?at(x,y)==='w':at(x,y)==='g'&&!keep.has(key(x,y)));if(c)features.push({kind:deco,cells:[c],seed:rnd(),ground:true});}
 return features;
}
// Looking at a solid sign or a walkable glint uses an ordinary approach cell.
export function featureAt(room,x,y){return (room.features||[]).find(f=>f.lines&&f.cells.some(([a,b])=>a===x&&b===y))||null;}
