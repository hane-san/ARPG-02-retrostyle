// Six reversible landscape studies beyond the established 112x88 country.
// Existing terrain (except two deliberate connecting footbridges) is untouched.
// The architecture and dialogue are playtest sketches, not canonical history.
export const EXTENSION_ZONES=[
 {id:'journey-canyon',name:'朱霞の裂谷',sub:'赤い断崖に刻まれた、雨の戻り道',cx:130,cy:35,label:{x:130,y:19}},
 {id:'journey-highland',name:'雲縁の高地',sub:'風と霧が古い階段を隠す山の国',cx:156,cy:27,label:{x:155,y:12}},
 {id:'journey-sky-edge',name:'空の涯',sub:'崖の向こうは、帰る道もないほど大きな空',cx:168,cy:25,label:{x:169,y:5}},
 {id:'journey-river',name:'逆流する河畔',sub:'季節に合わせて船と道が入れ替わる',cx:121,cy:68,label:{x:120,y:53}},
 {id:'journey-glass',name:'玻璃の庭園都',sub:'水に頼る機械と暮らしが隣り合う',cx:161,cy:70,label:{x:160,y:55}},
 {id:'journey-wetlands',name:'蘆雨の浮草郷',sub:'季節にだけ現れる道と水辺の学び舎',cx:122,cy:112,label:{x:120,y:118}},
 {id:'journey-whitebasin',name:'白暈の旧水底',sub:'塩と影の上に、新しい隊商路が生まれる',cx:158,cy:115,label:{x:158,y:129}}
];

const point=(id,name,form,x,y,w,h,ex,ey,desc,aside)=>({
 id:'journey-'+id,name,kind:'expansion',form,x,y,w,h,
 entrance:{x:ex,y:ey},blocking:false,desc,aside
});
export const EXTENSION_SITES=[
 point('scarlet-gauge','紅崖の水尺','gauge',116,20,6,4,119,25,'川が赤い岩を削った深さを刻む石尺。昔の舟運びは、この高さまで洪水が来るのを知っていた。','高い目盛りにも子供の筆跡がある。その年、誰がここで水を待っていたのだろう。'),
 point('canyon-temple','峡谷の裏寺','temple',138,37,6,4,141,42,'表の祭壇からは見えない岩陰の小さな祈祷所。赤い壁には水路を直した人の名が彫られる。','大きな神殿より、この小さな日陰へ毎朝来る人が多い。理由はそれぞれ違う。'),
 point('sky-seat','風待ちの小さな石','bench',164,22,4,3,168,25,'長い山道の終わりに置かれた、座るためだけの石。崖の向こうには、道も建物もない。','ここを知る人は、何かを見に来るのではなく、何も見えない遠さを眺めに来る。'),
 point('cloud-bell','雲際の鐘楼','bell',154,16,7,5,158,22,'谷を見下ろす鐘楼。霞んだ朝は頂上が見えず、鐘の音だけが道の存在を教えてくれる。','下から見たときには塔が雲を支えているようだった。でも中には小さな階段が続いている。'),
 point('snow-spring','雪解けの水庭','spring',163,36,7,4,166,42,'山の冷たい水を細い溝へ分ける庭。湧き水の量を記す帳面は、村の子供でも読める。','古い装置を触る前に、まず水を飲んでいきなさい、と水守は言う。'),
 point('rain-pier','雨季の寄港桟橋','pier',114,54,6,4,118,59,'乾季は青い草地、雨季は舟が着く桟橋。家には船底と車輪の部品が並べて掛けられている。','昨日の道が今日の水路になる。ここでは地図を毎年描き直す。'),
 point('reversing-wheel','逆流の水車','wheel',125,78,6,4,128,83,'流れが変わる季節には水車の羽根の向きを変える。だから住民は車輪を自慢しない。','水の動きが変わることと、水がなくなることは違う、と若い技師が語った。'),
 point('glass-promenade','霞硝子の回廊','glass',152,54,7,5,156,60,'水と薄玻璃を重ねた長い歩道。昼は温室のように穏やかで、夜には向こう岸が映る。','誰もいないはずの回廊に、ときどき二人分の足音がする。'),
 point('glass-orchard','灯火の温室街','garden',163,78,6,5,166,84,'昔の導水管を使って果樹を育てる小さな町。人工の光と本物の雨の両方が必要だ。','巨大な都市の部品だったものが、今では幼い木を支える柱になっている。'),
 point('reed-school','浮草の学び舎','stilt',115,100,6,4,118,105,'葦と木を組んだ高床の学校。子供たちは川と湖と、もう水のない道を地図に描く。','船に乗ったことがない子が、水の流れを一番正確に描いていた。'),
 point('marsh-shrine','泥星の祠','shrine',126,118,6,4,129,123,'浅い水の上に立つ小さな祠。満ち引きで足元の星模様が消えたり現れたりする。','信徒たちは季節ごとに道を直す。祈りはここでは土木仕事でもある。'),
 point('white-colonnade','白環の柱列','columns',151,102,7,5,155,108,'塩の平野から列柱の下部が現れた。水面から見えていた柱頭だけでは想像できない広がり。','近くの商人は、柱が道しるべになって助かると言う。古代の意味を知らなくても役立つものがある。'),
 point('caravan-rest','帰る隊商宿','inn',161,112,7,5,165,119,'渡し舟の船員たちが始めた宿。荷車を停める広場には、船室の古い小窓が取り付けられている。','夕飯には昔の船唄が流れるが、今の子には陸の旅の歌に聞こえるらしい。')
];
const person=(id,name,role,x,y,color,a,b)=>({id:'journey-'+id,name,role,x,y,color,lines:[a,b]});
export const EXTENSION_NPCS=[
 person('red-stonekeeper','赤い岸の石守','水尺の守り手',118,28,'#cda790','洪水は敵じゃない。水に合わせて暮らす方法を教えてくれる。','でも今度の水の減り方だけは、父の帳面にないんだ。'),
 person('canyon-cook','峡谷の釜炊き','旅人に食事を出す人',144,44,'#d9b7a3','山の影が差したら、石窯をあたためるんだ。','遠い古代の壁より、今日の雨雲の方が気になるね。'),
 person('sky-wanderer','空を知る巡礼者','崖道で休む旅人',157,33,'#bec1b3','向こうに何か見えますか。わたしには空ばかりです。','それでも、ときどきここに来たくなるんです。'),
 person('cloud-guide','霧道の案内人','高地の道案内',161,24,'#b7c6c2','よく見える日は、ここから旧湖の縁まで見える。','見えない日は、代わりに足元の花を数えるといいよ。'),
 person('snow-keeper','湧水を量る少年','水庭の記録係',168,44,'#a3bac5','昨日は十一杯、今日は九杯。だから今日は九杯だけ分ける。','数字が合っても、みんなが納得するとは限らないんだ。'),
 person('ferry-child','渡し舟を待つ子','河畔の子供',115,64,'#b8c7a6','雨季ならここに船が来るよ。乾季には駆けっこする道になるんだ。','遠くの村の子が遊びに来るのは、水が多い時だけ。'),
 person('wheel-engineer','車輪を替える人','河畔の職人',126,87,'#c6b79d','船にも畑にも部品が要る。ここは両方直せるのが自慢さ。','世界が全部同じ流れになったら、この仕事もなくなるかね。'),
 person('glass-gardener','光を畳む庭師','人工庭園の管理人',156,66,'#9bc5c4','温室の灯りは古いけど、花は毎年新しい。','怖い装置かもしれない。だけど今朝の水やりまで怖がりたくはないんだ。'),
 person('glass-seller','青い果実売り','玻璃街の店主',167,90,'#d9bea7','遠くの山の雪が少ないと、果実が小さくなるの。','細い管の向こうにも土地と暮らしがあることを、忘れないでね。'),
 person('schoolkeeper','舟を描く先生','湿原の教師',120,111,'#b2bea3','教科書の海と、この子たちが見る湿原は同じ水の話なんです。','正解を教えるより、違いを観察する方がずっと難しいですね。'),
 person('caravan-singer','荷車のうたびと','旧船乗り',169,120,'#cdb4a7','水の上では船が揺れて、ここでは荷車が揺れる。','どちらも遠くに行けるのに、帰り道だけは同じ夢を見るんだ。')
];
export const EXTENSION_VISTAS=[
 {id:'journey-sky-edge-vista',x:168,y:25,radius:4,title:'空の涯に立つ',sub:'もう少しだけ、ここにいたい。',kind:'sky-edge'},
 {id:'journey-scarlet-vista',x:129,y:36,radius:5,title:'朱い谷が開く',sub:'古い水位の線より下に、新しい通り道が見える。',kind:'scarlet'},
 {id:'journey-cloud-vista',x:163,y:27,radius:5,title:'雲と石階の向こう',sub:'近くの鐘を小さくし、霧の向こうに石の段が重なる。',kind:'cloud'},
 {id:'journey-flood-vista',x:121,y:68,radius:5,title:'水が行ったり来たりする国',sub:'舟と道が入れ替わる季節の川。その向こうに人の暮らしが続く。',kind:'flood'},
 {id:'journey-glass-vista',x:158,y:70,radius:5,title:'薄い光の都市',sub:'古代の壁を足場に、人々は緑を育てている。',kind:'glass-city'},
 {id:'journey-reed-vista',x:123,y:113,radius:5,title:'雨と葦の遠景',sub:'青と緑のあいだに家が浮かび、子供たちの声が届く。',kind:'reeds'},
 {id:'journey-white-vista',x:158,y:115,radius:5,title:'白い海底の幾何学',sub:'遠くの柱と新しい隊商路が、同じ地平線まで続いている。',kind:'white'}
];
export const EXTENSION_PALETTE={
 c:'#b88779',r:'#a16f66',m:'#a4b8b7',Y:'#738790',V:'#bfd0d0',
 a:'#90b7aa',W:'#78aeb3',H:'#a8b8ca',j:'#9bbd9d',z:'#e2dacd',o:'#ddc0a8'
};
// A single broad landform, not a random scattering of mini-biomes.
export function paintJourneyExpansion(tiles,set){
 const w=tiles[0].length,h=tiles.length;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  if(x<112&&y<88)continue;
  const dx=Math.abs((x-143)/36),dy=Math.abs((y-73)/61);
  const coast=dx**4+dy**4;
  if(coast>0.91+Math.sin(y*.19+x*.04)*.02)continue;
  const zone=extensionZoneAt(x,y);
  let t=zone==='canyon'?'c':zone==='highland'?'m':zone==='river'?'a':zone==='glass'?'H':zone==='wetlands'?'j':'z';
  if(zone==='canyon'&&Math.sin(x*.25+y*.1)>.72)t='r';
  if(zone==='highland'&&Math.sin(x*.2-y*.16)>.7)t='o';
  if(zone==='river'&&Math.cos(x*.17+y*.13)>.62)t='j';
  if(zone==='wetlands'&&Math.sin(x*.22+y*.19)>.58)t='a';
  if(zone==='whitebasin'&&Math.sin(x*.24+y*.08)>.6)t='o';
  if(zone==='canyon'&&x>=124&&x<=146&&Math.abs(y-(24+3*Math.sin(x*.21)))<1.35)t='Y';
  if(zone==='river'||zone==='wetlands'){
   const stream=135+4*Math.sin(y*.16);
   if(y>=53&&y<=111&&Math.abs(x-stream)<1.35)t='W';
   if(zone==='wetlands'&&[[113,118,2.4],[118,96,2],[144,112,2]].some(([cx,cy,r])=>Math.hypot(x-cx,y-cy)<r))t='W';
  }
  set(x,y,t);
 }
 // Beyond the northern highland, pale empty air replaces the water-coloured
 // out-of-bounds tiles. This is an impassable precipice, not a shortcut.
 for(let y=11;y<=42;y++)for(let x=162;x<=174;x++){
  if(tiles[y][x]==='~')set(x,y,'V');
 }
}
// Deliberate footbridges, paired cross-valley and cross-river routes. All other
// natural water and sheer rock remain impassable.
function distance(x,y,[ax,ay],[bx,by]){
 const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(x-ax-t*dx,y-ay-t*dy);
}
export function paintJourneyExpansionRoads(tiles,set){
 const trails=[
  {bridge:true,points:[[102,40],[120,40]],width:1.2},
  {bridge:true,points:[[98,73],[103,79],[122,79]],width:1.2},
  {points:[[120,40],[130,35],[131,30],[147,27],[163,27],[167,38]],width:1},
  {points:[[130,35],[125,52],[120,68],[121,79],[122,106],[137,119],[156,118],[166,96],[165,72],[166,52],[163,27]],width:1.1},
  {points:[[120,68],[127,70],[136,70],[154,70],[165,72]],width:1},
  {points:[[122,98],[132,97],[138,97],[158,97],[166,96]],width:1},
  {points:[[146,27],[145,47],[155,58],[154,70]],width:.9},
  {points:[[163,27],[168,25]],width:.9},
  {points:[[121,79],[128,83],[132,90],[122,98]],width:.85}
 ];
 const w=tiles[0].length,h=tiles.length;
 for(const t of trails)for(let i=1;i<t.points.length;i++){
  const a=t.points[i-1],b=t.points[i];
  for(let y=Math.floor(Math.min(a[1],b[1])-t.width);y<=Math.ceil(Math.max(a[1],b[1])+t.width);y++)
   for(let x=Math.floor(Math.min(a[0],b[0])-t.width);x<=Math.ceil(Math.max(a[0],b[0])+t.width);x++){
    if(x<0||y<0||x>=w||y>=h||distance(x,y,a,b)>t.width)continue;
    const before=tiles[y][x],naturalWater=['~','W','L','l'].includes(before);
    if(!t.bridge&&before==='~')continue;
    if(naturalWater&&!(t.bridge||['W'].includes(before)&&[70,97].some(crossY=>Math.abs(y-crossY)<=2)))continue;
    // A bridge is actual walkable wood over otherwise blocked water, never magic walking.
    set(x,y,naturalWater?'+':before==='Y'?'t':'=');
   }
 }
}
export function extensionZoneAt(x,y){
 if(x<147&&y<47)return 'canyon';
 if(y<47&&Math.hypot(x-168,y-25)<=9)return 'sky-edge';
 if(y<47)return 'highland';
 if(x<147&&y<89)return 'river';
 if(y<89)return 'glass';
 return x<147?'wetlands':'whitebasin';
}
