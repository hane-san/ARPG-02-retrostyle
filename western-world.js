import {landscapeShape,landscapeNoise} from './landscape-geometry.js';
// #106: western outer lands. Existing coordinates and lake remain intact.
export const WEST_HEIGHT=832,WEST_SCORE_START=45;
export const WEST_CLIFF_PATH=[[4,345],[35,347],[60,344],[95,346],[116,345],[150,347],[185,344],[222,345],[222,355],[175,357],[120,354],[65,357],[12,355],[12,365],[80,367],[145,365],[200,367],[238,365]];
const definitions=[
 ['cliff','雪嶺の長い崖道',19,4,290,232,80,116,345,'#b2b5aa','#e9d8b5','#8cbed0','#667d88','大鐘の余韻の向こう、雪の線が続く'],
 ['glass','記憶の温室庭園',20,8,380,104,55,60,412,'#aabf9d','#e8dcb7','#8dbabe','#668575','水盤の空から、ガラス越しの緑へ'],
 ['grass','風の草原街道',21,125,520,105,60,177,549,'#a8bf8a','#e9dfba','#a5c5c4','#71866d','丘の先の屋根まで、風と歩く'],
 ['impression','光の入り江',15,8,750,104,65,60,788,'#a8bbb0','#e5d7bf','#8eafb9','#6e8d91','柳の影が、色面になって水へ続く'],
 ['dots','点描の休日河岸',22,125,750,105,65,176,787,'#b7c39b','#f1dfb6','#99b7c3','#758e78','日陰と舟と、小さな光の集まり'],
 ['village','空の生活集落',23,125,380,105,55,176,413,'#b4c8bb','#eddfbd','#9ebed2','#748d93','洗濯物の上に、もう一つの屋根'],
 ['windmill','黄昏の風車丘',13,8,445,104,55,60,477,'#b9bd8e','#ecd4aa','#a7bbc2','#7f8d78','粉袋の道から、次の風車へ'],
 ['terrace','空の段畑',24,125,445,105,65,176,484,'#a2b38b','#ead7aa','#8fb4b6','#7b8870','畦の高さを変えると、空が広がる'],
 ['mountain','風鳴りの登山路',25,8,520,104,60,60,550,'#9eaeaa','#e2d8bd','#8caebc','#667d80','洞門の向こうで、山の形が変わる'],
 ['azure','蒼い遠原',26,4,590,232,80,118,631,'#a4bbb2','#dce4d0','#a3c4d0','#718b94','白い花と薄い水、遠い稜線'],
 ['lane','道のむこうの並木道',27,8,680,104,60,60,711,'#b4be9e','#eadbb6','#a5bec9','#748878','近い幹の間で、道が明るい丘へ曲がる'],
 ['shoal','空を映す浅瀬と砂州',28,125,680,105,60,176,712,'#c7cdb9','#f0e4c6','#91b6c6','#8ba3a3','水を越えず、空の映る縁をたどる']
];
export const WEST_STUDIES=definitions.map(([key,name,index,x,y,w,h,cx,cy,...tail],order)=>({key,name,index,x,y,w,h,cx,cy,palette:tail.slice(0,4),sub:tail[4],id:'pilgrim-'+index,music:[`${45+Math.floor(order/2)}:${order%2+1}`],theme:'west-'+key,entrance:{x:cx,y:cy},order}));
export const westernAt=(x,y)=>y<290||x<4||x>236?undefined:WEST_STUDIES.find(z=>x>=z.x&&x<=z.x+z.w&&y>=z.y&&y<=z.y+z.h);
export const westSkyRows=z=>({cliff:51,village:23,windmill:24,azure:35,lane:23,grass:23,terrace:6}[z.key]||0);
export const WEST_SITES=[],WEST_NPCS=[];
for(const z of WEST_STUDIES){
 const glass=z.key==='glass'||z.key==='village',w=glass?12:9,h=glass?(z.key==='glass'?5:6):6,x=z.cx-Math.floor(w/2),y=z.key==='cliff'?342:glass?z.cy-h-1:z.cy-h-4;
 WEST_SITES.push({id:'west-'+z.key,kind:'pilgrimage',form:'west-'+z.key,name:z.name+'の'+(glass?'ガラスの家':'休み場'),x,y,w,h,chapter:z.index,blocking:false,
 solid:glass?[{x:0,y:0,w:1,h},{x:w-1,y:0,w:1,h},{x:1,y:0,w:w-2,h:1}]:z.key==='grass'?[{x:Math.floor(w/2),y:h-1,w:1,h:1}]:['azure','lane','impression','dots'].includes(z.key)?[{x:0,y:h-1,w:1,h:1},{x:w-1,y:h-1,w:1,h:1}]:z.key==='shoal'?[{x:0,y:h-1,w:2,h:1},{x:w-2,y:h-1,w:2,h:1}]:[{x:0,y:h-2,w:2,h:2},{x:w-2,y:h-2,w:2,h:2}],artTop:glass?7:5,
 entrance:{x:z.cx,y:z.cy-2},desc:z.sub+'。手前に道があり、遠くの形は少しずつ霞んでいる。',aside:({glass:'水をやる人の通路と、見て回る人の通路が分かれている。休みの椅子はどちらからも見える。',terrace:'上段へは石垣の端の階段を使う。水門の下だけ、畦の色が濃い。',village:'食堂の窓は開いている。上に見える家にも、同じ色の洗濯物が揺れる。',windmill:'粉袋を直す人が、風の弱い時だけ外へ出る。'}[z.key]||'戻る道も、最初とは違う角度で景色を見せる。')});
 WEST_NPCS.push({id:'west-person-'+z.key,name:({glass:'鉢を運ぶ人',terrace:'水門を見る人',village:'食堂の人',windmill:'粉袋を縫う人'}[z.key]||'道で休む人'),role:'この道の人',x:z.cx+(z.key==='cliff'?8:4),y:z.cy+(z.key==='cliff'?1:2),color:z.palette[3],lines:[z.key==='glass'?'この鉢は日陰へ。花より先に、葉の向きを見るんだ。':z.key==='terrace'?'水を止める時は、下の畑の人に手を振るよ。':z.key==='village'?'昼のスープはまだあるよ。空を見ていると、冷めるけどね。':z.key==='windmill'?'風車の音で、袋の縫い目の数を忘れるんだ。':'向こうから来たの？ ここからは、来た道も少し違って見えるね。','急がなくていいよ。帰る道は、もう一本あるから。']});
}
// Working mills and ordinary houses share real, separately visible solid feet.
for(const [key,x,y,w,h] of [['windmill',23,470,5,4],['windmill',85,480,5,4],['village',150,416,6,4],['village',195,407,7,5],['village',210,422,5,4],['grass',205,547,6,4]]){
 const z=WEST_STUDIES.find(z=>z.key===key),home=key!=='windmill';
 WEST_SITES.push({id:`west-extra-${key}-${x}`,kind:'pilgrimage',form:home?'west-home':'west-windmill',name:home?'窓の開いた家':'丘の小さな風車',x,y,w,h,chapter:z.index,blocking:false,solid:home?[{x:0,y:0,w,h}]:[{x:0,y:h-2,w:2,h:2},{x:w-2,y:h-2,w:2,h:2}],artTop:5,entrance:{x:x+Math.floor(w/2),y:y+h+1},desc:home?'窓辺に、使ったばかりの椀が並んでいる。':'風の強さに合わせて、帆布を半分たたんである。',aside:'道の上からでも、暮らしの手順が見える。'});
}
// Trees line both sides of the avenue; their trunks, rather than crowns, are solid.
for(const [x,y] of [[20,704],[37,706],[80,704],[98,705],[20,719],[37,721],[80,718],[98,720]]){
 WEST_SITES.push({id:`west-avenue-${x}-${y}`,kind:'pilgrimage',form:'west-tree',name:'道を縁取る木',x,y,w:3,h:3,chapter:27,blocking:false,solid:[{x:1,y:2,w:1,h:1}],artTop:5,entrance:{x:x+1,y:y+4},desc:'幹の間から、道の明るい曲がり角が見える。',aside:'木陰を抜けるたび、向こうの丘の形が少し変わる。'});
}
for(const [x,y,name,line] of [[170,791,'舟を待つ人','次の舟まで、ここでお弁当を開こう。'],[182,792,'日陰の読書人','しおりが風で飛ぶから、石を置いているんだ。']])WEST_NPCS.push({id:'west-holiday-'+x,name,role:'河岸の人',x,y,color:'#87977b',lines:[line,'水の色が変わるのを見ていると、時間を忘れるね。']});
const dist=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
export function carveWestern({tiles,regions,w,h}){
 const set=(x,y,t,i)=>{if(x<1||y<1||x>=w-1||y>=h-1)return;if(y<288&&tiles[y][x]!=='X')return;const owner=westernAt(x,y);if(owner&&owner.index!==i)return;tiles[y][x]=t;regions[y*w+x]=i;};
 const line=(pts,width,i)=>{for(let n=1;n<pts.length;n++){const a=pts[n-1],b=pts[n];for(let y=Math.floor(Math.min(a[1],b[1])-width);y<=Math.ceil(Math.max(a[1],b[1])+width);y++)for(let x=Math.floor(Math.min(a[0],b[0])-width);x<=Math.ceil(Math.max(a[0],b[0])+width);x++)if(dist(x,y,a,b)<=width)set(x,y,'=',i);}};
 // Two independent returns join the old western/inn roads, never the lake.
 line([[45,270],[12,282],[3,300],[3,810]],2.5,19);line([[138,270],[236,282],[238,300],[238,810]],2.5,19);
 for(const z of WEST_STUDIES){
  for(let y=z.y;y<=z.y+z.h;y++)for(let x=z.x;x<=z.x+z.w;x++)set(x,y,z.key==='cliff'?(y<341+Math.round(2*Math.sin(x*.035)+Math.sin(x*.09))?'west-sky':'west-wall'):landscapeShape(z,x,y)<1?'west-ground':landscapeShape(z,x,y)<1.18?'west-wall':'X',z.index);
  if(z.key==='cliff'){
   line(WEST_CLIFF_PATH,2.4,z.index);
  }else{
   // Curved walks sit inside the broad field that bends each land's natural rim.
   const yy=z.cy;line([[2,yy],[z.x+9,yy+5],[z.cx-18,yy+3],[z.cx,yy],[z.cx+22,yy+4],[z.x+z.w-8,yy-3],[238,yy]],2.5,z.index);
   if(['glass','impression','dots','shoal','azure'].includes(z.key)){
    for(let y=z.y+5;y<z.y+z.h-4;y++)for(let x=z.x+5;x<z.x+z.w-4;x++){
     const pond=z.key==='azure'?((x-z.cx-28)/25)**2+((y-z.cy-12)/8)**2<1:z.key==='shoal'?(Math.sin((y-z.y)*.1)*9+z.cx+13+landscapeNoise(x,y,9)*5<x):((x-z.x-28)/11)**2+((y-z.y-17)/9)**2<1;
     if(pond&&Math.abs(y-yy)>6&&landscapeShape(z,x,y)<.88)set(x,y,'L',z.index);
    }
   }
   if(z.key==='impression')for(let y=z.y+6;y<=z.y+28;y++)for(let x=z.x+27;x<=z.x+29;x++)set(x,y,'west-bridge',z.index);
   if(westSkyRows(z))for(let y=z.y-8;y<z.y+westSkyRows(z);y++)for(let x=z.x;x<=z.x+z.w;x++)set(x,y,'west-sky',z.index);
   if(z.key==='terrace'||z.key==='mountain'){
    // Solid stone contour walls with visible stair openings alternating at the ends.
    for(let row=0;row<4;row++){
     const gap=row%2?z.x+15:z.x+z.w-16;
     for(let x=z.x+7;x<z.x+z.w-6;x++){
      const yy=z.y+(z.key==='terrace'?14:10)+row*11+(z.key==='terrace'?Math.round(3*Math.sin((x-z.x)*.045+row*.4)):0);
      const stair=Math.abs(x-gap)<4||(Math.abs(x-z.cx)<12&&Math.abs(yy-z.cy)<13);
      set(x,yy,stair?'west-stair':'west-wall',z.index);set(x,yy+1,stair?'west-stair':'west-wall',z.index);
     }
    }
   }
   // Guarantee the authored central walk after ponds/walls; never pave old water.
   if(z.key==='terrace'||z.key==='mountain')line([[2,yy],[z.cx,yy],[238,yy]],2.2,z.index);
  }
 }
 // Shorter cross-country returns between neighbouring lands avoid compulsory
 // trips to the outer edges. The northern sky of the huge plain stays unbridged.
 line([[118,365],[118,550],[110,562],[118,575],[126,562],[118,550]],2.5,19);line([[118,631],[118,788],[109,802],[118,810],[127,802],[118,788]],2.5,26);
 // A visible spine of stairs joins every terrace, including the narrow upper strip.
 // A climb continues through the upper mountain contours; the stair gaps must
 // intersect real soil, even where the natural rim curves inside a wall's end.
 for(let y=523;y<=576;y++)for(let x=59;x<=61;x++)if(tiles[y]?.[x]!=='X')set(x,y,'west-stair',25);
 const terraces=WEST_STUDIES.find(z=>z.key==='terrace');
 for(let y=terraces.y+6;y<=terraces.cy;y++)for(let x=terraces.cx-1;x<=terraces.cx+1;x++)set(x,y,'west-stair',terraces.index);
 // Facilities are planned on the central courts, clear of the authored ponds/sky.
 for(const s of WEST_SITES)for(let y=s.y-1;y<s.y+s.h+4;y++)for(let x=s.x-2;x<s.x+s.w+2;x++){
  if(((x-(s.x+s.w*.5))/(s.w*.5+2))**2+((y-(s.y+s.h*.55))/(s.h*.5+3))**2<=1&&!['L','west-sky','west-stair','='].includes(tiles[y]?.[x]))set(x,y,'west-ground',s.chapter);
 }
 // Raised planting beds are solid; the service lanes between them remain open.
 const garden=WEST_STUDIES.find(z=>z.key==='glass');
 for(let y=garden.y+10;y<garden.y+garden.h-5;y++)for(let x=garden.x+4;x<garden.x+garden.w-4;x++)if(x%12<2&&y%12<8&&Math.abs(y-garden.cy)>4&&tiles[y][x]==='west-ground'&&!WEST_SITES.some(s=>x>=s.x-2&&x<s.x+s.w+2&&y>=s.y-2&&y<s.y+s.h+3)&&!WEST_NPCS.some(n=>Math.hypot(x-n.x,y-n.y)<3))set(x,y,'west-wall',garden.index);
 // Connecting roads inherit the nearest land's cue rather than replaying the cliff everywhere.
 for(let y=288;y<=815;y++)for(let x=0;x<=240;x++)if(tiles[y][x]==='='&&!westernAt(x,y)){let near=WEST_STUDIES[0],d=Infinity;for(const z of WEST_STUDIES){const n=(x-z.cx)**2+(y-z.cy)**2;if(n<d){d=n;near=z;}}regions[y*w+x]=near.index;}
 return {line};
}
export function westernZone(z){return {id:z.id,index:z.index,at:Infinity,western:true,name:z.name,chartName:({cliff:'雪嶺',glass:'温室',grass:'草原',impression:'入り江',dots:'休日河岸',village:'空の集落',windmill:'風車丘',terrace:'段畑',mountain:'登山路',azure:'遠原',lane:'並木道',shoal:'砂州'}[z.key]),sub:z.sub,theme:z.theme,westKey:z.key,palette:z.palette,music:z.music,cx:z.cx,cy:z.cy,label:{x:z.cx,y:z.cy+8}};}
