// Issue #99 P0: three short walks carved into the pilgrimage's unused ground.
// Each is entrance -> bend -> opening view -> small find -> back to the road.
// Only impassable 'X' ground is carved: the lake stays water, existing roads and
// courts are untouched, and every walk joins the existing network at both ends.
export const DETOUR_THEMES=Object.freeze(['dusk','climb','shore']);
const path=(...pts)=>pts.map(([x,y])=>({x,y}));
export const DETOURS=Object.freeze([
 {
  theme:'dusk',name:'黄昏の丘陵路',chartName:'黄昏の丘',sub:'丘の背で、影だけが長くなる',
  palette:['#c9a387','#ecc79a','#9d8fb4','#8c6f78'],music:['19:1','21:1','23:2'],
  // From the western road, a narrow climb bends along a ridge to one wind-bent tree, then down to the inn road.
  legs:[path([45,236],[60,236],[70,228],[84,224],[96,214],[112,210]),path([112,210],[124,218],[132,230],[132,244],[140,252])],
  width:1.6,court:{x:112,y:210,r:4.5},
  site:{form:'dusk-tree',name:'丘のひとつ木',x:111,y:205,w:3,h:3,solid:[{x:1,y:2,w:1,h:1}],entrance:{x:112,y:209},
   desc:'丘の背に一本だけ残った木。風下へ傾いた枝の先に、湖と遠い帝都の線が同じ色で沈んでいく。',
   aside:'登ってくるあいだは草しか見えなかった。振り返ると、来た道が細い金色の筋になっている。'}
 },
 {
  theme:'climb',name:'風見石の小さな頂',chartName:'小さな頂',sub:'三つ折り返せば、空が近い',
  palette:['#aab3a7','#dcd9c4','#8fa7b6','#6f7a72'],music:['28:1','41:1','24:1'],
  // Three switchbacks up from the eastern ridge road; a gentler path back down the far side.
  legs:[path([396,83],[396,68],[430,68],[430,54],[402,54],[402,40],[424,40],[424,28]),path([424,28],[448,30],[456,48],[452,70],[446,83])],
  width:1.5,court:{x:424,y:26,r:4},
  site:{form:'summit-cairn',name:'風見石',x:423,y:20,w:3,h:4,solid:[{x:1,y:2,w:1,h:2}],entrance:{x:424,y:25},
   desc:'積み石の上に、薄い石の羽根がひとつ。風が変わるたび、かすかに向きを変えて鳴る。',
   aside:'ここから見ると、さっき歩いた折り返しが三本の線に重なる。下では一本の坂にしか見えなかった。'}
 },
 {
  theme:'shore',name:'湖畔の夕暮れ道',chartName:'湖畔の夕',sub:'水の音だけが、帰り道を知っている',
  palette:['#b9b2a4','#e6d6b8','#8aa6b2','#7c7a83'],music:['29:1','14:1','34:1'],
  // A boardwalk hugging the lake's south shore from the inn road to the eastern road.
  shore:{x0:206,x1:296,offset:1},width:1.3,court:{x:251,y:217,r:3},
  site:{form:'shore-bench',name:'水辺の腰掛け',x:250,y:218,w:3,h:2,solid:[{x:0,y:1,w:1,h:1},{x:2,y:1,w:1,h:1}],entrance:{x:251,y:217},
   desc:'湖へ向いた古い腰掛け。座面の端だけが、誰かの手で何度も削り直されている。',
   aside:'向こう岸の灯がひとつずつ増えていく。水面に映る数のほうが、少しだけ多い。'}
 }
]);
const LAKE={cx:235,cy:137,rx:126,ry:76};
// The shore path follows the lake's southern edge a couple of tiles inland.
export function shorePoints({x0,x1,offset}){
 const pts=[];
 for(let x=x0;x<=x1;x+=2){const t=(x-LAKE.cx)/LAKE.rx;if(Math.abs(t)>=1)continue;pts.push({x,y:Math.round(LAKE.cy+LAKE.ry*Math.sqrt(1-t*t))+offset});}
 return pts;
}
export function detourPoints(d){return d.shore?[shorePoints(d.shore)]:d.legs;}

// Carves the walks into the world. `index` is the zone index of each detour.
export function carveDetours({tiles,regions,w,h,inside,set,zoneIndex,isOpen}){
 const carved=[];
 DETOURS.forEach((d,k)=>{
  const zi=zoneIndex+k;
  const paint=(x,y,center)=>{
   if(!inside(x,y))return;const t=tiles[y][x];
   // Never pave water or an existing road/court: only impassable ground becomes a walk.
   if(t==='L'||t==='~')return;
   if(t==='X'){set(x,y,center?'=':'pil-'+zi);regions[y*w+x]=zi;carved.push({x,y});}
   // The road line may run over this walk's own fresh ground, never over anything older.
   else if(center&&t==='pil-'+zi)set(x,y,'=');
  };
  for(const leg of detourPoints(d))for(let i=0;i<leg.length-1;i++){
   const a=leg[i],b=leg[i+1],len=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));
   for(let s=0;s<=len;s+=.5){
    const cx=a.x+(b.x-a.x)*s/len,cy=a.y+(b.y-a.y)*s/len;
    for(let y=Math.floor(cy-d.width-1);y<=Math.ceil(cy+d.width+1);y++)for(let x=Math.floor(cx-d.width-1);x<=Math.ceil(cx+d.width+1);x++){
     const r=Math.hypot(x-cx,y-cy);if(r<=d.width)paint(x,y,r<.75);
    }
   }
  }
  const c=d.court;for(let y=c.y-Math.ceil(c.r);y<=c.y+Math.ceil(c.r);y++)for(let x=c.x-Math.ceil(c.r);x<=c.x+Math.ceil(c.r);x++)if(Math.hypot(x-c.x,y-c.y)<=c.r)paint(x,y,false);
  // Ground right beside a walk reads as that place too, so its edges take the new palette.
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(tiles[y][x]==='X'&&!isOpen(x,y)){
   const near=detourPoints(d).some(leg=>leg.some(p=>Math.abs(p.x-x)<6&&Math.abs(p.y-y)<6));if(near)regions[y*w+x]=zi;
  }
 });
 return carved;
}
