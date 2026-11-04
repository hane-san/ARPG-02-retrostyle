import {landscapeShape,landscapeNoise,segmentDistance} from './landscape-geometry.js';

export const SOUTHEAST_STUDIES=[
 {key:'mesa',index:29,name:'赤砂の風窓台地',chartName:'風窓台地',x:250,y:290,w:218,h:125,cx:366,cy:366,music:['54:1'],palette:['#c5a589','#ead2ac','#9eb9b5','#967963'],sub:'地層を回り込むと、岩の窓に次の空が見える',cameraScene:'journey-scenic-wide'},
 {key:'port',index:30,name:'木陰の河港街',chartName:'河港街',x:250,y:430,w:218,h:140,cx:410,cy:506,music:['52:1'],palette:['#a9b99a','#ead6ad','#83b3b6','#618578'],sub:'舟と木陰、開いた食堂へつながる両岸の道'},
 {key:'marsh',index:31,name:'潮風の葦原',chartName:'葦原',x:246,y:574,w:223,h:138,cx:359,cy:648,music:['51:1'],palette:['#a7b9a6','#e2d8b5','#8bafb3','#698d86'],sub:'板道が水の枝を渡り、葦の穂先だけが揺れる'},
 {key:'coast',index:32,name:'潮の石橋海岸',chartName:'石橋海岸',x:246,y:724,w:224,h:98,cx:405,cy:779,music:['52:2'],palette:['#c3c7bb','#eee1c5','#8cabbc','#879a9a'],sub:'潮だまりの向こう、大きな岩の橋が海へ続く',cameraScene:'journey-scenic-wide'}
].map(z=>({...z,id:'pilgrim-'+z.index,theme:'se-'+z.key,at:Infinity,western:true,southeast:true,label:{x:z.cx,y:z.cy+8}}));
export const southeastAt=(x,y)=>x<242||y<288?undefined:SOUTHEAST_STUDIES.find(z=>x>=z.x&&x<=z.x+z.w&&y>=z.y&&y<=z.y+z.h);
export const portRiver=y=>410+15*Math.sin((y-430)*.035)+4*Math.sin((y-430)*.083);
export const marshRiver=y=>397-(y-574)*.45+17*Math.sin((y-574)*.04)+4*Math.sin((y-574)*.09);
export const coastShore=y=>422-(y-724)*.5+12*Math.sin((y-724)*.04)+4*Math.sin((y-724)*.11);
const site=(key,name,form,x,y,w,h,entrance,solid,desc,sound)=>({id:'se-'+key,kind:'pilgrimage',name,form:'se-'+form,x,y,w,h,entrance,solid,blocking:false,artTop:7,chapter:({mesa:29,port:30,marsh:31,coast:32}[key.split('-')[0]]),desc,aside:'手前の足元と、向こうへ抜ける道を見比べられる。',sound});
const pillars=(w,h)=>[{x:0,y:h-2,w:2,h:2},{x:w-2,y:h-2,w:2,h:2}];
export const SOUTHEAST_SITES=[
 site('mesa-window','風窓の岩門','windarch',358,351,16,11,{x:366,y:364},pillars(16,11),'風が削った窓の下に、人が歩く石段が通っている。','wind'),
 site('port-kitchen','河岸の昼の食堂','kitchen',398,495,10,6,{x:403,y:502},[{x:0,y:0,w:10,h:6}],'湯気の出る椀と、舟を待つ人のための長い腰掛け。'),
 site('marsh-shelter','葦を束ねる観察台','shelter',349,633,8,6,{x:353,y:640},pillars(8,6),'湿った道具を乾かす屋根。板道の下で水が二つに分かれる。','drip'),
 site('coast-arch','海の大きな石橋','seaarch',397,769,19,9,{x:405,y:779},pillars(19,9),'海食のアーチの足元から、岩の島へ石橋が延びている。','echo'),
 site('port-home-a','舟の窓辺の家','home',375,477,6,4,{x:378,y:482},[{x:0,y:0,w:6,h:4}],'窓の下に、乾いた舟の櫂を立てかけてある。'),
 site('port-home-b','木陰の布屋','home',378,512,7,5,{x:381,y:518},[{x:0,y:0,w:7,h:5}],'濡れた帆布と、干し上がった帆布を別の棚に並べている。'),
 site('port-home-c','対岸の小さな家','home',429,491,6,5,{x:432,y:497},[{x:0,y:0,w:6,h:5}],'橋のこちらと向こうで、同じ色の洗濯物が揺れる。'),
 site('port-wheel','河港の揚水輪','waterwheel',406,475,6,7,{x:409,y:483},pillars(6,7),'川の水を、畑へ運ぶ小さな溝へ渡している。','wheel'),
 site('marsh-rest','水の分かれる腰掛け','pier',310,676,7,4,{x:313,y:681},pillars(7,4),'長い板が一枚ずつ取り替えられ、色の違う継ぎ目が残っている。'),
 site('coast-bench','潮を待つ石の席','shelter',366,791,7,4,{x:369,y:796},pillars(7,4),'干した縄を避けて、二人分の空きが残してある。')
];
export const SOUTHEAST_NPCS=[
 {id:'se-mesa-person',name:'窓の下で休む人',x:370,y:368,chapter:29,lines:['坂を回ると、同じ窓が違う山を囲むんだ。','帰りは水車の街へ下りる道もあるよ。']},
 {id:'se-port-cook',name:'川の食堂の人',x:407,y:507,chapter:30,lines:['舟が着くころには、スープをもう一度温めるよ。','向こう岸の人にも、橋から声をかけてきて。']},
 {id:'se-port-sail',name:'帆布を干す人',x:389,y:518,chapter:30,lines:['乾いたら裏返す。風が強い日は、もう一本縄を足す。','この日陰は涼しいけど、布を干すには少し惜しいね。']},
 {id:'se-port-reader',name:'対岸の便りを読む人',x:433,y:500,chapter:30,lines:['橋の向こうで書いた便りを、ここで読んでいるんだ。','近くても、紙だとゆっくり伝えられることがあるね。']},
 {id:'se-marsh-person',name:'葦を結ぶ人',x:354,y:651,chapter:31,lines:['水の枝は毎年少し違う。板を足す前に、歩いて確かめるよ。','穂は風に任せて、根元だけ結ぶんだ。']},
 {id:'se-coast-person',name:'縄をほどく人',x:395,y:783,chapter:32,lines:['結ぶより、塩を洗ってほどくほうが時間がかかる。','岩の向こうはよく響くよ。小さな声で十分さ。']}
].map(n=>({...n,role:'この土地の人',color:SOUTHEAST_STUDIES[n.chapter-29].palette[3]}));

// All water crossings are authored bridge/boardwalk paths, not invisible soil.
export const SOUTHEAST_WALKS=[
 {region:29,points:[[420,268],[448,286],[451,309],[420,321],[396,346],[366,366]]},
 {region:29,points:[[238,365],[270,380],[303,378],[335,389],[366,366],[423,386],[438,420]]},
 {region:30,points:[[438,420],[443,450],[432,487],[410,506],[391,529],[363,548],[320,554],[238,549]],bridge:'se-boardwalk'},
 {region:30,points:[[238,477],[278,467],[321,486],[375,487],[432,487]],bridge:'se-boardwalk'},
 {region:30,points:[[378,482],[389,487],[403,502],[410,506]],bridge:'se-boardwalk'},
 {region:30,points:[[381,518],[391,519],[410,506]],bridge:'se-boardwalk'},
 {region:30,points:[[432,497],[433,500],[439,519],[422,547]],bridge:'se-boardwalk'},
 {region:30,points:[[422,547],[432,567],[432,587],[422,620]],bridge:'se-boardwalk'},
 {region:31,points:[[363,548],[347,577],[329,606],[300,626],[322,646],[336,654],[359,648],[383,648],[422,620]],bridge:'se-boardwalk'},
 {region:31,points:[[238,631],[275,630],[300,626]]},
 {region:31,points:[[359,648],[353,640],[340,633]],bridge:'se-boardwalk'},
 {region:31,points:[[300,626],[281,670],[313,681],[340,698],[363,716]],bridge:'se-boardwalk'},
 {region:31,points:[[313,681],[300,696],[340,698]],bridge:'se-boardwalk'},
 {region:31,points:[[383,648],[417,678],[408,704],[363,716]],bridge:'se-boardwalk'},
 {region:32,points:[[363,716],[340,741],[363,764],[395,779],[438,779]],bridge:'se-stonebridge'},
 {region:32,points:[[238,787],[277,779],[309,790],[340,789],[369,796],[395,779]],bridge:'se-stonebridge'}
];
export function carveSoutheast({tiles,regions,w,h}){
 const inside=(x,y)=>x>0&&y>0&&x<w-1&&y<h-1;
 const set=(x,y,t,index)=>{if(!inside(x,y)||(y<288&&tiles[y][x]!=='X'))return;tiles[y][x]=t;regions[y*w+x]=index;};
 // Broad land necks join the neighbouring countries. The stream bends through
 // the port / marsh neck instead of stopping at a rectangular region boundary.
 for(const [cx,cy,rx,ry,index] of [[438,422,28,39,30],[361,573,78,31,31],[363,717,77,28,32]]){
  for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<1){
   let t='se-ground';if(cy===573){const a=Math.max(0,Math.min(1,(y-562)/24)),river=portRiver(562)*(1-a)+marshRiver(586)*a;if(Math.abs(x-river)<5.8)t='L';}
   set(x,y,t,index);
  }
 }
 for(const z of SOUTHEAST_STUDIES){
  for(let y=z.y;y<=z.y+z.h;y++)for(let x=z.x;x<=z.x+z.w;x++){
   const shape=landscapeShape(z,x,y);if(shape>1.18)continue;
   let t=shape<1?'se-ground':'se-wall';
   if(z.key==='port'&&Math.abs(x-portRiver(y))<5.5)t='L';
   if(z.key==='marsh'&&(Math.abs(x-marshRiver(y))<6.5||Math.abs(x-marshRiver(y)+55+7*Math.sin(y*.055))<2.7+.8*Math.sin(y*.09)||landscapeNoise(x+30,y,18)>.7))t='L';
   if(z.key==='marsh'&&x>440&&shape>.7)t='L';
   if(z.key==='coast'){
    if(x>coastShore(y)||((x-355)/9)**2+((y-766)/6)**2<1)t='L';
    if(((x-438)/7)**2+((y-779)/5.2)**2<1)t='se-ground';
   }
   set(x,y,t,z.index);
  }
  if(z.key==='mesa')for(let row=0;row<2;row++)for(let x=278;x<448;x++){
   const y=328+row*27+Math.round(5*Math.sin(x*.035+row));
   for(let dy=0;dy<2;dy++)if(tiles[y+dy][x]==='se-ground')set(x,y+dy,'se-wall',z.index);
  }
 }
 for(const r of SOUTHEAST_WALKS)for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i],width=r.bridge?1.8:2.3;
  for(let y=Math.floor(Math.min(a[1],b[1])-8);y<=Math.ceil(Math.max(a[1],b[1])+8);y++)for(let x=Math.floor(Math.min(a[0],b[0])-8);x<=Math.ceil(Math.max(a[0],b[0])+8);x++)if(inside(x,y)&&x>=242&&tiles[y][x]==='X'&&segmentDistance(x,y,a,b)<7+landscapeNoise(x,y,9)*2)set(x,y,'se-ground',southeastAt(x,y)?.index??r.region);
  for(let y=Math.floor(Math.min(a[1],b[1])-width);y<=Math.ceil(Math.max(a[1],b[1])+width);y++)for(let x=Math.floor(Math.min(a[0],b[0])-width);x<=Math.ceil(Math.max(a[0],b[0])+width);x++){
   if(!inside(x,y)||segmentDistance(x,y,a,b)>width)continue;
   const old=tiles[y][x],z=southeastAt(x,y);if(x<236&&y>=288)continue;
   if(old==='L'&&!r.bridge)continue;
   set(x,y,old==='L'?r.bridge:old==='se-wall'?'se-stair':'=',z?.index??r.region);
  }
 }
 // Site pads follow their actual floor. Stilt decks over water remain visibly wood.
 for(const s of SOUTHEAST_SITES){
  for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++){
   if(!inside(x,y))continue;
   if(s.form==='se-seaarch'&&tiles[y][x]==='L'&&Math.abs(x-s.entrance.x)>2&&!s.solid.some(r=>x>=s.x+r.x&&x<s.x+r.x+r.w&&y>=s.y+r.y&&y<s.y+r.y+r.h))continue;
   const old=tiles[y][x];if(old!=='='&&old!=='se-stair'&&old!=='se-stonebridge')set(x,y,old==='L'?(s.chapter===32?'se-stonebridge':'se-boardwalk'):'se-ground',s.chapter);
  }
  const e=s.entrance;
  for(let y=e.y-1;y<=e.y+1;y++)for(let x=e.x-1;x<=e.x+1;x++){const old=tiles[y][x];if(!['se-boardwalk','se-stonebridge'].includes(old))set(x,y,old==='L'?(s.chapter===32?'se-stonebridge':'se-boardwalk'):'=',s.chapter);}
 }
}
