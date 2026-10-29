// #80: a deliberately edited walking study. The former atlas is retained separately.
import {silkPath} from './silk-world.js';
export const PILGRIM_W=480,PILGRIM_H=288;
const p=(x,y)=>({x:Math.round(x*1.5),y:Math.round(y*1.5)});
export const PILGRIM_ROUTE=[
 [19,70],[19,25],[95,25],[95,13],[160,13],[160,38],[124,38],[124,58],
 [183,58],[183,23],[235,23],[235,55],[293,55],[293,85],[250,85],[250,111],
 [291,111],[291,159],[225,159],[225,138],[196,138],[196,172],[135,172],
 [135,148],[92,148],[92,174],[30,174],[30,127],[58,127],[58,105],[19,105],[19,76],
 [49,76],[49,94],[79,94],[79,70],[135,70],[135,104],[197,104],[197,132],
 [237,132],[237,112],[282,112],[306,112]
].map(([x,y])=>p(x,y));
const chapterData=[
 [0,'白い船着場','帰りの舟を、ここに結ぶ','harbour',['#b6c9bc','#e2dcc5','#729ba6','#8a9e92'],'30:1','13:1'],
 [2,'輪を結ぶ草原','生活の音が、湖の方へ薄くなる','meadow',['#b7c69c','#e2d5ad','#8faea4','#94a382'],'34:2','40:1'],
 [5,'水を渡す庭','三つの溝へ、同じ水を分ける','garden',['#a6c5b7','#dce1c9','#74a7a4','#7b9c91'],'42:1','23:1'],
 [8,'赤い裂け目の街道','岩の切れ目に、空が残る','canyon',['#c6ac9b','#ead2b1','#92a5aa','#a08b85'],'36:1','36:2'],
 [11,'雲の上の水尺','高さだけが、水を覚えている','ridge',['#bdcbd0','#e7dfcf','#8ba7bb','#929eaa'],'41:2','27:1'],
 [14,'間を測る列石','石よりも、石と石の間が大きい','monolith',['#a5b7b7','#d1d2c0','#819d9e','#6d7d87'],'43:1','7:2'],
 [17,'水の失せた七段','同じ器の底を、今は歩ける','dry',['#d2c7ad','#eee0bd','#a2b4ad','#aaa58e'],'42:2','27:2'],
 [21,'白い舟の眠る原','桟橋の下に、草が生えている','salt',['#d5d8cd','#f0e9d4','#a2bbc0','#b2b4a5'],'35:2','38:2'],
 [25,'青い灯の宿道','一周しても、同じ夜には戻らない','inn',['#b4c0be','#ded9c6','#8bafaf','#8d999a'],'35:1','30:2'],
 [31,'静かな分水嶺','来た道のすぐ奥で、水の色が変わる','threshold',['#bcc1b7','#ded8c7','#91a8a5','#989f94'],'43:2','38:1'],
 [35,'扉のない受水殿','働いているのに、人の気配がない','sealed',['#aab7b3','#d5d6c6','#839997','#738785'],'43:2','7:2'],
 [38,'帝都の外郭','細かった線が、空より高くなる','capital',['#bfc0ad','#e8dfc0','#94a69b','#8c978a'],'44:1','22:2'],
 [43,'最後の器','すべての流れが、空の玉座へ続く','citadel',['#afb8ae','#e3dcc4','#91a29d','#788b82'],'5:2','39:2']
];
export const PILGRIM_ZONES=chapterData.map(([at,name,sub,theme,palette,...music],i)=>{
 const point=PILGRIM_ROUTE[at];return {id:'pilgrim-'+i,index:i,at,name,chartName:['船着場','草原','水庭','裂け目','雲上','列石','七段','白い舟','宿道','分水嶺','閉殿','帝都','最後の器'][i],sub,theme,palette,music:[...new Set([...music,'29:1','23:2'])].slice(0,3),cx:point.x,cy:point.y,label:i===0?{x:point.x-3,y:point.y-19}:i===9?{x:point.x+40,y:point.y+13}:i===12?{x:point.x-20,y:point.y+16}:{x:point.x+9,y:point.y-7}};
});
const chapter=i=>{let n=0;for(let k=1;k<PILGRIM_ZONES.length;k++)if(i>=PILGRIM_ZONES[k].at)n=k;return n;};
export const PILGRIM_BLOCKED=new Set(['L','~','X','pil-wall']);
export const PILGRIM_START={...PILGRIM_ROUTE[0]};
const names=['船着場の待合','草原の輪の台','水を渡す三つの器','風を通す裂け門','雲上の水尺','間を測る巨石','水を失った七段','高い桟橋の影','青い灯の宿','静かな分水器','扉のない受水殿','帝都の外郭門','最後の大きな器'];
const forms=['tea','wheel','garden','arch','stairs','monolith','garden','pier','tea','wheel','sealed','gate','citadel'];
export const PILGRIM_SITES=[];
for(const [i,z] of PILGRIM_ZONES.entries()){
 const point=PILGRIM_ROUTE[z.at],cx=point.x+(i===9?12:i===0?-9:0),cy=point.y,form=forms[i];
 const tall=['monolith','citadel','sealed'].includes(form),w=form==='gate'?17:tall?9:13,h=tall?5:9;
 const x=cx-Math.floor(w/2),y=cy-h-2;
 let solid;
 if(form==='garden')solid=[0,w-1].flatMap(x=>[2,4,6,7].map(y=>({x,y,w:1,h:1})));
 else if(['arch','gate','citadel'].includes(form)){solid=[{x:0,y:0,w:2,h},{x:w-2,y:0,w:2,h}];if(form==='citadel')solid.push({x:3,y:h-2,w:3,h:2});}
 else if(form==='monolith')solid=[{x:2,y:0,w:w-4,h},{x:w-1,y:0,w:1,h}];
 else if(form==='sealed')solid=[{x:1,y:0,w:w-2,h}];
 else if(form==='stairs')solid=[0,3,5,7,9].map(x=>({x,y:h-1,w:1,h:1}));
 else if(form==='pier')solid=Array.from({length:7},(_,i)=>({x:Math.floor((12+i*(w*32-24)/7)/32),y:h-1,w:1,h:1}));
 else if(form==='wheel')solid=[{x:1,y:h-2,w:w-2,h:2}];
 else solid=[{x:1,y:2,w:w-2,h:h-2}];
 PILGRIM_SITES.push({id:'pilgrim-place-'+i,kind:'pilgrimage',form,name:names[i],x,y,w,h,blocking:false,solid,artTop:tall?14:form==='gate'?8:2,
  entrance:{x:cx,y:cy},chapter:i,desc:z.sub+'。石の表面には、手で直された部分と元の形が並んでいる。',
  aside:i>=9?'器の向きと水尺は前の庭と同じだ。ここでは音が返るまで、少しだけ間がある。':'道は湖に沿って続く。来た方向からは見えなかった面に、小さな通路が残っている。',
  sound:[0,2,6,8].includes(i)?(i===8?'kettle':'drip'):i===5?'echo':i===1?'wood':undefined});
}
// Smaller inspectable objects share the same ground/collision contract as the landmarks.
for(let k=1;k<PILGRIM_ROUTE.length-1;k+=2){
 const q=PILGRIM_ROUTE[k],study=((k-1)/2)%4;
 PILGRIM_SITES.push({id:'pilgrim-detail-'+k,kind:'pilgrimage',form:['gauge','bowl','boat','arch'][study],name:['道端の水尺','使いこまれた受け皿','陸に残る舟','欠けた通り門'][study],
  x:q.x+3,y:q.y-4,w:4,h:3,blocking:false,solid:study===3?[{x:0,y:0,w:1,h:3},{x:3,y:0,w:1,h:3}]:study===0?[{x:2,y:0,w:1,h:3}]:[{x:0,y:1,w:4,h:2}],artTop:1,entrance:{x:q.x+2,y:q.y},chapter:chapter(k),
  desc:'かつての手順が、石と木の形に残っている。近づくと、同じもののはずなのに少しずつ違う。',aside:'水に浸かった線は水平だが、その上の傷は、人の手の高さでばらばらに付いている。'});
}
export const PILGRIM_NPCS=[0,1,2,3,4,6,7,8,9,11].map((ci,i)=>{
 const remarks=[['帆は今日は畳んだまま。縄だけ乾かしておくんだ。','湖の反対側でも、同じ結び方を見かけるよ。'],['この輪、三回までは音がするの。四回目はしない！','わたしのはこっち。大人の大きな輪は重くて回らないよ。'],['浅い溝は足洗い。深い方は下の畑へ。','古い石もあるけど、減ったところは今も直すんだ。'],['ここで帽子を飛ばされて、三つ先の角まで追ったよ。','風を待ってから行くと、帰りに砂を払わずに済む。'],['いちばん上の線にも、同じ指の傷がある。','写す紙がもう足りない。線だけにすればよかったな。'],['向こうでは水に隠れていた底を写しているんだ。','同じ七段だと思ったけど、最後の溝だけ向きが違う。'],['舟は動かないけれど、帆は毎年たたみ直すんだ。','布が破れると鳥の巣になる。そこまでなら構わないけどね。'],['椀は全部違うよ。割れたときだけ買い足すから。','急ぎでも、鍋が煮える速さは変わらないよ。'],['ここに人がいなくても、器は同じだけ満たす。','余った分は下へ。今日も、昨日と同じ手順だよ。'],['あの細い白い線が、門の上だったんだ。','近づいたら、一枚の紙に入りきらなくなった。']];
 const z=PILGRIM_ZONES[ci];return {id:'pilgrim-person-'+i,name:['舟を結ぶ人','輪を運ぶ子','溝を直す人','風待ちの旅人','水尺を写す人','底を歩く人','帆をたたむ人','鍋を見ている人','空の器を洗う人','門を写す人'][i],role:'この道の人',
  x:z.cx-3,y:z.cy+2,color:z.palette[3],lines:remarks[i]};
});
export const PILGRIM_VISTAS=PILGRIM_ZONES.filter((_,i)=>![0,1,8].includes(i)).map(z=>({id:'pilgrim-vista-'+z.index,x:z.cx,y:z.cy,radius:5,title:z.name,sub:z.sub,kind:'pilgrim-'+z.theme,chapter:z.index}));
const hash=(x,y)=>{let n=Math.imul(x+117,374761393)^Math.imul(y+59,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
export function makePilgrimageWorld(){
 const w=PILGRIM_W,h=PILGRIM_H,tiles=Array.from({length:h},()=>Array(w).fill('X')),occupied=new Uint8Array(w*h),regions=new Uint8Array(w*h),routeDistance=new Float32Array(w*h);routeDistance.fill(Infinity);
 const inside=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<w&&y<h;
 // A broad, non-traversable lake remains a real distance between shores.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(((x-235)/126)**2+((y-137)/76)**2<1)tiles[y][x]='L';
 for(let i=0;i<PILGRIM_ROUTE.length-1;i++){
  const a=PILGRIM_ROUTE[i],b=PILGRIM_ROUTE[i+1],dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,ci=chapter(i);
  for(let y=Math.max(1,Math.min(a.y,b.y)-15);y<Math.min(h-1,Math.max(a.y,b.y)+16);y++)for(let x=Math.max(1,Math.min(a.x,b.x)-15);x<Math.min(w-1,Math.max(a.x,b.x)+16);x++){
   const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/len)),d=Math.hypot(x-a.x-t*dx,y-a.y-t*dy),k=y*w+x;
   const radius=ci===3||ci===5?5.5:ci===0||ci===1?12:ci===2?9:7;
   if(d<=routeDistance[k]){routeDistance[k]=d;regions[k]=ci;}
   if(d<radius+Math.sin((x+y)*.13)*.65){
    const late=i>=31,old=tiles[y][x];
    tiles[y][x]=d<1.7?(late&&old==='L'?'+':'='):'pil-'+ci;
   }
  }
 }
 // Spacious courts create places to wander, not only a narrow prescribed line.
 for(const z of PILGRIM_ZONES)for(let y=z.cy-15;y<=z.cy+15;y++)for(let x=z.cx-15;x<=z.cx+15;x++){
  if(!inside(x,y)||Math.hypot(x-z.cx,(y-z.cy)*.9)>14)continue;
  if(tiles[y][x]!=='='){tiles[y][x]='pil-'+z.index;regions[y*w+x]=z.index;}
 }
 // Ground far from the road still belongs to a landscape, rather than a grey void.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(routeDistance[y*w+x]===Infinity){
  let best=Infinity;for(const z of PILGRIM_ZONES){const d=(x-z.cx)**2+(y-z.cy)**2;if(d<best){best=d;regions[y*w+x]=z.index;}}
 }
 // At a chapter's own court, its material belongs to that place even at a road junction.
 for(const z of PILGRIM_ZONES)for(let y=z.cy-4;y<=z.cy+4;y++)for(let x=z.cx-4;x<=z.cx+4;x++)if(inside(x,y)&&Math.hypot(x-z.cx,y-z.cy)<=4)regions[y*w+x]=z.index;
 // Real architectural collision: solid piers, open floors, and legal doorsteps.
 for(const s of PILGRIM_SITES){
  for(const r of s.solid)for(let y=s.y+r.y;y<s.y+r.y+r.h;y++)for(let x=s.x+r.x;x<s.x+r.x+r.w;x++)if(inside(x,y))occupied[y*w+x]=1;
  occupied[s.entrance.y*w+s.entrance.x]=0;
 }
 const walkable=(x,y)=>inside(x,y)&&!PILGRIM_BLOCKED.has(tiles[y][x])&&!occupied[y*w+x];
 const decor=[];
 // Dense, finite, regional objects. Decorative pieces never create invisible collision.
 for(let i=0;i<PILGRIM_ROUTE.length-1;i++){
  const a=PILGRIM_ROUTE[i],b=PILGRIM_ROUTE[i+1],length=Math.hypot(b.x-a.x,b.y-a.y),dx=(b.x-a.x)/length,dy=(b.y-a.y)/length;
  for(let s=3;s<length;s+=3)for(const side of [-1,1]){
   const off=3.2+hash(i,s)*3.8,x=Math.round(a.x+dx*s-dy*off*side),y=Math.round(a.y+dy*s+dx*off*side);
   if(!walkable(x,y)||PILGRIM_SITES.some(p=>x>=p.x-1&&x<p.x+p.w+1&&y>=p.y-1&&y<p.y+p.h+1))continue;
   const variant=Math.floor(hash(s,i)*12),solid=[2,4,7,9].includes(variant)&&!PILGRIM_ROUTE.some(p=>Math.hypot(x-p.x,y-p.y)<4)&&!PILGRIM_NPCS.some(p=>Math.hypot(x-p.x,y-p.y)<2);
   if(solid)occupied[y*w+x]=1;
   decor.push({x,y,chapter:chapter(i),variant,solid,seed:hash(i,s+side)});
  }
 }
 const world={id:'journey',pilgrimage:true,w,h,tile:32,tiles,occupied,decor,regions,route:PILGRIM_ROUTE,start:{...PILGRIM_START},sites:PILGRIM_SITES,npcs:PILGRIM_NPCS,zones:PILGRIM_ZONES,vistas:PILGRIM_VISTAS,bridges:[],transitions:[],
  tileAt(x,y){return inside(x,y)?tiles[y][x]:'~';},walkable,
  siteAt(x,y){return PILGRIM_SITES.filter(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h).sort((a,b)=>a.w*a.h-b.w*b.h)[0];},
  npcAt(x,y){return PILGRIM_NPCS.find(n=>n.x===x&&n.y===y);},bridgeAt(){},transitionAt(){},findPath:silkPath,
  zoneAt(x,y){x=Math.max(0,Math.min(w-1,Math.floor(x)));y=Math.max(0,Math.min(h-1,Math.floor(y)));return PILGRIM_ZONES[regions[y*w+x]];}
 };
 return world;
}
export function pilgrimCameraScene(world,hero,accepted){
 // Hysteresis is spatial as well as temporal; ordinary regional borders never zoom.
 const spots=[[PILGRIM_ROUTE[11],'journey-reveal'],[PILGRIM_ROUTE[38],'journey-monument'],[PILGRIM_ROUTE[43],'journey-monument']];
 const radius=['journey-reveal','journey-monument'].includes(accepted)?12:7;
 return spots.find(([p])=>Math.hypot(hero.px-p.x,hero.py-p.y)<radius)?.[1]||'journey-road';
}
export function pilgrimFloor(world,site,p){return !!(world.pilgrimage&&site&&site.blocking===false&&p.x>=site.x&&p.x<site.x+site.w&&p.y>=site.y&&p.y<site.y+site.h&&world.walkable(Math.floor(p.x),Math.floor(p.y)));}
export function pilgrimQuiet(world,p,wasQuiet=false){const z=PILGRIM_ZONES.find(z=>z.theme==='sealed');return !!world.pilgrimage&&Math.hypot(p.x-z.cx,p.y-z.cy)<(wasQuiet?9:5);}

// Keep an explorer behind tall foreground art legible without changing terrain,
// camera or the monument's footprint. Opacity blends over a tile at the edges.
export function pilgrimSiteOpacity(world,site,hero){
 if(!world.pilgrimage||pilgrimFloor(world,site,{x:Math.floor(hero.px),y:Math.floor(hero.py)}))return 1;
 const horizontal=Math.min(hero.px+.9-site.x,site.x+site.w+.3-hero.px);
 const vertical=Math.min(hero.py+1-(site.y-(site.artTop||0)),site.y+site.h-hero.py);
 return 1-.84*Math.max(0,Math.min(1,horizontal,vertical));
}

// Visual high parts can be investigated, but never add collision above a foot.
// Only the solid pier's horizontal span is picked; a gate's open centre stays open.
export function pilgrimArtHit(world,p){
 if(!world.pilgrimage)return null;
 return world.sites.filter(s=>p.y<s.y&&p.y>=s.y-(s.artTop||0)&&s.solid.some(r=>p.x>=s.x+r.x&&p.x<s.x+r.x+r.w)).sort((a,b)=>(a.y+a.h)-(b.y+b.h)).at(-1)||null;
}
