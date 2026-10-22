// Reversible south-western journey experiment: walkable ruins, not an alternate world.
// Historical interpretation and any "response" from these devices are deliberately provisional.
export const RUINS_ZONES=[
 {id:'journey-ancient',name:'風蝕の神殿迷路',sub:'数えきれない道が、風に磨かれている',cx:27,cy:110,label:{x:22,y:108}},
 {id:'journey-void',name:'黙する黒石回廊',sub:'足音だけが先へ行き、遅れて戻ってくる',cx:61,cy:111,label:{x:62,y:120}},
 {id:'journey-drowned',name:'水底の祈り庭',sub:'岸に近づくほど、古い祈りの形が見える',cx:94,cy:115,label:{x:93,y:128}},
 {id:'journey-sky-ruins',name:'空へ昇る風台',sub:'最後の石段の上に、まだ道がある',cx:65,cy:92,label:{x:67,y:86}}
];
const site=(id,name,form,x,y,w,h,ex,ey,desc,aside,effect)=>({
 id:'journey-ruins-'+id,name,kind:'ruins',form,x,y,w,h,
 entrance:{x:ex,y:ey},blocking:false,desc,aside,effect
});
export const RUINS_SITES=[
 site('outer-gate','忘却の外門','gate',15,97,6,4,19,102,
  '崩れた門は、港からの街道に背を向ける。刻まれた距離は、帰り道だけ一つ短い。','風を待つと、門の裏に地図のような傷が見える。','壁の小さな溝を風が通り、遠くで石笛のような音がする。'),
 site('maze-tablet','巡る道の石版','tablet',26,105,6,4,29,110,
  '四つの方位が刻まれた石版。正面の回廊を進んでも、遠回りの列柱から戻って来られる。','擦り減った線には、何人もの指の跡が残る。なかには途中で引き返した線もある。','触れた線が淡く光り、閉じていたはずの回廊に風が通る。'),
 site('sand-clock','砂を受ける日時計','dial',30,118,6,4,33,124,
  '影を測る円盤。刻みは時刻ではなく、ここを通った人たちの季節を分けている。','ひとつだけ、人が数えなかった空白の年がある。','砂の間から小さな環が現れ、しばらく震えて止まる。'),
 site('west-wind','風返しの封印柱','pillar',44,120,5,4,47,125,
  '倒れかけた柱には、旅の方角ではなく、湖へ帰る風の名前が並ぶ。','誰かが新しい風の名を足した跡がある。湖の南から吹く風の名らしい。','細い羽根がゆっくり回り、離れた柱の輪郭に青白い光が走る。'),
 site('stair-marker','登り口の石段','stairs',45,94,5,3,48,99,
  '誰かの歩幅に合わせたように低い石段。上りと下りで数が違って見える。','近道は見えない。遠い景色だけが、ここから先を教えてくれる。','石段の端の印が浮かび、次の足場の縁をひとつずつ照らす。'),
 site('sky-gallery','浮遊城を望む風台','outlook',62,87,6,4,65,93,
  '崖上の風台。遙かな雲の上に、繋がった城塞と橋が浮かんで見える。ここから届く道はまだない。','ここまで歩いても、城は遠い。だがはじめて、遠さに形ができた。','風見の環が向きを変え、空に浮かぶ幾つかの塔が一瞬だけ並んで見える。'),
 site('monolith-core','無音の共鳴石','monolith',57,106,6,5,60,113,
  '黒い柱に継ぎ目はない。近くで声を出すと、石よりずっと遠い場所から戻ってくる気がする。','まわりの石畳には、立ち止まった人のための小さな円がある。','柱の溝に冷たい紫の光が落ち、少しのあいだ周囲の石が静かに呼応する。'),
 site('echo-arch','片側だけの反響門','echo',71,105,5,5,74,112,
  '半分しか残らない門。通った人の足音だけを、何度も同じ順番で返している。','戻って確認すると、最初より一歩だけ響きが遅い。','門の縁が一度明滅し、歩いてきた通路の向こうに灯りが移る。'),
 site('shore-seal','沈んだ祈りの封印','seal',89,108,6,5,92,116,
  '浅瀬の環状石。浮かんだ紋様と沈んだ紋様が、水面でちょうど重なる。','信仰の印なのか水位の目盛りなのか、ここには記されていない。','水面に円い波紋が広がる。近くの石灯籠が二つだけ淡く輝く。'),
 site('sunken-bell','水の底の鐘楼','bell',99,104,5,4,103,109,
  '大きな鐘があったはずの空洞。舟から見えたものは、塔のいちばん高い部分だった。','屋根ではなく、水面の方に古い文字が残っている。','ひび割れに水が伝い、音のない鐘の揺れだけが水面に映る。'),
 site('crossing','祈り庭の細い渡し','bridge',97,119,5,3,99,124,
  '石から石へ渡る低い橋。水位が高かった時代には、ここは橋ではなかったのだろう。','水の向こうには昔の階段、手前には新しい草の道が続く。','橋脚の古い水尺が光り、水の下に続く別の回廊を一瞬映す。'),
 site('sentry','消えた街道の見張り','watch',76,95,5,4,79,101,
  '高い壁の影に、小さな人のための見張り台がある。海と湖を見張ったのか、空を見たのか。','誰もいない台に、風よけの布だけ新しく結ばれている。','古い反射板が傾き、谷の奥の黒い石を白く縁取る。')
];
const npc=(id,name,role,x,y,a,b)=>({id:'journey-ruins-'+id,name,role,x,y,color:'#afb8b1',lines:[a,b]});
export const RUINS_NPCS=[
 npc('cartographer','回廊を写す旅人','迷宮の測り手',23,112,'何度曲がっても戻れる道を描こうとしているんです。','怖いのは迷うことより、誰かがもう地図を必要としないことかもしれません。'),
 npc('listener','風を聴く人','黒石谷の旅人',69,114,'大声を出すと、ここでは自分だけがよそ者になった気がする。','でも静かな場所には、小さい草が育っているんですよ。'),
 npc('reed-keeper','浅瀬の灯守','水底庭の世話人',91,123,'沈んでいたものを全部掘り出せば、昔が戻るわけじゃない。','だからここでは、水がある場所には水を残すようにしています。'),
 npc('climber','風台から下りる人','巡る道の案内人',58,98,'一番上で、雲の向こうに城が見えたんです。','登ってよかった。でも降りて、もう一度普通のご飯を食べたくなりました。')
];
export const RUINS_VISTAS=[
 {id:'journey-ruins-ancient-vista',x:27,y:110,radius:5,title:'風蝕の迷宮を見渡す',sub:'列柱の果てが、幾つもの忘れられた道になっている。',kind:'ruins-ancient'},
 {id:'journey-ruins-black-vista',x:61,y:113,radius:5,title:'音を失くした回廊',sub:'黒い石のあいだに、一人ぶんの道が続いている。',kind:'ruins-void'},
 {id:'journey-ruins-water-vista',x:93,y:116,radius:5,title:'湖底に残った祈り',sub:'かつて水面だった高さを、いまは風が渡る。',kind:'ruins-drowned'},
 {id:'journey-ruins-sky-vista',x:65,y:93,radius:6,title:'雲の上の、届かない城',sub:'登りきった先に、空へ浮かぶ城と橋が広がる。',kind:'ruins-castle'}
];
export const RUINS_PALETTE={
 A:'#c4bba7',B:'#777983',C:'#9aaca9',D:'#aab9b6',
 R:'#847e75',M:'#393e50',U:'#719ba2',F:'#ddd0b4',K:'#d0c8b4',P:'#a6c5ba'
};
const distance=(x,y,a,b)=>{
 const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
};
export function ruinsZoneAt(x,y){
 if(y<100&&x>=42&&x<=83)return 'sky-ruins';
 if(x<48)return 'ancient';
 if(x<80)return 'void';
 return 'drowned';
}
export function paintJourneyRuins(tiles,set){
 const w=tiles[0].length,h=tiles.length;
 for(let y=81;y<Math.min(h-1,134);y++)for(let x=5;x<Math.min(w-1,116);x++){
  if(tiles[y][x]!=='~')continue; // preserve the old world and eastern extension
  const dx=(x-58)/52,dy=(y-109)/25.5;
  const fringe=.09*Math.sin(y*.17+x*.04)+.05*Math.sin(x*.31-y*.08);
  const coast=dx*dx+dy*dy;
  const northernLink=distance(x,y,[46,77],[49,98])<5.3;
  const eastLink=distance(x,y,[102,111],[116,111])<4.2;
  if(coast>=.96+fringe&&!northernLink&&!eastLink)continue;
  const biome=ruinsZoneAt(x,y);
  let t=biome==='ancient'?'A':biome==='void'?'B':biome==='drowned'?'C':'D';
  if(biome==='drowned'&&[[87,108,5],[99,120,5],[101,107,3]].some(([cx,cy,r])=>Math.hypot((x-cx)/r,(y-cy)/(r*.78))<1))t='U';
  if(biome==='sky-ruins'&&x>71&&y<92&&Math.sin(x*.4+y*.15)>.3)t='R';
  set(x,y,t);
 }
 // Broken, intentionally non-closed walls: the maze is navigable and has loops.
 for(const y of [99,106,113,120])for(let x=15;x<=43;x+=10)
  for(let i=0;i<5;i++)if(tiles[y]?.[x+i]==='A')set(x+i,y,'R');
 // The monoliths are genuine obstacles, not invisible collision boxes.
 for(const [cx,cy] of [[53,103],[63,104],[72,117],[54,121],[79,110]])
  for(let y=cy;y<cy+4;y++)for(let x=cx;x<cx+2;x++)
   if(['B','D'].includes(tiles[y]?.[x]))set(x,y,'M');
}
export function paintJourneyRuinsRoads(tiles,set){
 const routes=[
  {points:[[46,76],[46,87],[49,99],[38,105],[29,110],[20,111],[17,119],[29,126],[47,125],[60,113],[74,112],[92,116],[103,111],[115,111]],width:1.45},
  {points:[[49,95],[39,94],[25,98],[19,102],[20,111]],width:1.1},
  {points:[[49,99],[55,95],[65,93],[77,99],[74,112]],width:1.4,stairs:true},
  {points:[[29,110],[42,112],[60,113],[61,103],[77,99]],width:1.05},
  {points:[[74,112],[86,105],[101,106],[103,111],[99,124],[92,116]],width:1.3,water:true},
  {points:[[47,125],[50,118],[54,107],[65,93]],width:.85},
  {points:[[92,116],[99,113],[115,111]],width:1,water:true}
 ];
 for(const route of routes)for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i];
  for(let y=Math.floor(Math.min(a[1],b[1])-2);y<=Math.ceil(Math.max(a[1],b[1])+2);y++)
   for(let x=Math.floor(Math.min(a[0],b[0])-2);x<=Math.ceil(Math.max(a[0],b[0])+2);x++){
    if(x<1||y<1||x>=tiles[0].length-1||y>=tiles.length-1||distance(x,y,a,b)>route.width)continue;
    const before=tiles[y][x];
    // Never pave the original lake or old port inlet. On the new northern spur
    // the earthen landform was laid down in paintJourneyRuins first.
    if(['~','L','l','W','V'].includes(before))continue;
    if(before==='U')set(x,y,'P'); // legible stone-plank causeway over water
    else if(['R','M','A','B','C','D','F','K','P'].includes(before))
     set(x,y,route.stairs?'K':'F');
  }
 }
}
export const RUINS_ACTIVATED=new Set();
export function activateRuinsDevice(site){
 if(site.kind!=='ruins'||!site.effect)return null;
 const first=!RUINS_ACTIVATED.has(site.id);
 RUINS_ACTIVATED.add(site.id);
 return first?site.effect:'装置はまだ淡く応えている。さっき触れたときの光が、石の奥に残っている。';
}
