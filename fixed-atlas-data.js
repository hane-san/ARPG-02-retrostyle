import {FIXED_EXPANSION,fixedObject,fixedSource} from './fixed-journey-data.js';
// The producer means 100 authored screens, not 40 cells squeezed into a phone.
// Coordinates preserve the existing 33-screen trip at the northwest corner.
const rows=[
 [9,0,'sky-distribution','空の分水梁','分水梁',12,'stone','blue','pilgrim-place-12','旅で見た器の反復を、大きな梁の足元で見る。'],
 [9,1,'violet-saddle','薄明の雪の鞍部','鞍部',4,'ridge','violet','pilgrim-place-4','雪嶺と外郭の間を、細い段でつなぐ。'],
 [9,2,'copper-cut','赤壁を回る切通し','赤壁',3,'ridge','copper','pilgrim-place-3','裂け門をくぐらず、足元の回り道も選べる。'],
 [9,3,'rose-inlet','入江へ降りる白段','白段',15,'shore','coral','west-impression','赤い岩から柳の水面へ、光を変えながら下る。'],
 [0,3,'orchard-window','果樹の窓辺','果樹',23,'village','blue','west-extra-village-210','帰路の家を別の高さから見る、南の旅の入口。'],
 [1,3,'lane-bridge','草の小橋','草橋',27,'meadow','blue',null,'木々の切れ目から、畦と水車の影を見る。'],
 [2,3,'bucket-bank','釣瓶の畦道','釣瓶',2,'canal','mint','journey-wonder-wheel','水を上げる輪の脇で、下の庭への分岐を選ぶ。'],
 [0,4,'beech-tea','蜂蜜色の木陰の茶棚','茶棚',1,'forest','amber','forest-tea','茶の棚の明るさと、奥の木立の暗さを通り比べる。'],
 [1,4,'cloth-court','布の乾く小さな庭','布庭',1,'forest','coral','forest-cloth','布の間を抜ける短い生活の通路。'],
 [2,4,'lifting-water','揚水輪の細い路地','揚水',2,'canal','mint','journey-wonder-wheel','器へ送る水の高さを、輪と段で読む。'],
 [3,4,'glass-reflection','ガラスに映る池','映池',20,'pond','blue','west-glass','温室の開いた内側と水辺の外周を歩ける。'],
 [4,4,'empty-basin','器を乾かす七段の縁','空器',6,'dry','amber',null,'同じ水尺と橋が、音の少ない溝に続く。'],
 [5,4,'salt-pier','白い桟橋の下の道','白桟',7,'salt','amber','pilgrim-place-7','海のない足元と、高い桟橋の影を見上げる。'],
 [6,4,'canyon-turn','裂け目の二つの曲がり角','裂路',3,'ridge','copper',null,'一度門を隠し、次の曲がりで再び見せる。'],
 [7,4,'mesa-stair','赤砂の細い石段','砂段',29,'ridge','copper','se-mesa-window','岩の窓を横から見て、台地の縁を回る。'],
 [8,4,'chalk-post','白亜の風化柱','白亜',16,'ridge','haze','pilgrim-detour-plateau','白い露頭の間を静かに通る、到着前の間。'],
 [9,4,'willow-sunset','夕雲の柳の入り江','柳夕',15,'shore','coral','west-impression','水面の長い反射を、柳越しに追う。'],
 [0,5,'forest-picnic','木洩れ日の昼休み','木漏',1,'forest','blue',null,'名所を置かず、茶棚と工房の間を休ませる。'],
 [1,5,'carving-porch','削り屑の匂いの軒','木軒',1,'forest','amber','forest-carver','木彫りの軒を回ると、先の河岸が少し見える。'],
 [2,5,'river-mill','川をくみ上げる輪','川輪',30,'river','rose','se-port-wheel','板道から揚水輪の回る生活の岸へ着く。'],
 [3,5,'canal-bend','二つの橋の水路','二橋',2,'canal','mint',null,'流れを二度渡り、水の向きを足で覚える。'],
 [4,5,'watershed-wheel','静かな分水の庭','分庭',9,'stone','haze','pilgrim-place-9','同じ量を送り続ける輪の脇から先へ進む。'],
 [5,5,'answer-wall','返事を待つ壁の脇','返壁',5,'stone','violet','journey-wonder-return','壁の表と裏で、見えていた列石の間を測る。'],
 [6,5,'buried-threshold','草に埋まる門の肩','埋門',18,'meadow','rose','pilgrim-detour-windruin','通り門の用途を残す低い石を越えて回る。'],
 [7,5,'white-steppe','乾いた高原の折返し','白原',16,'salt','amber','pilgrim-detour-plateau','白い地面の小さな起伏を目印に歩く。'],
 [8,5,'sandbar-light','空を置く砂州','砂州',28,'shore','blue','west-shoal','浅瀬を渡らず、砂州と橋を選んで進む。'],
 [9,5,'dotted-holiday','点描の休日の岸','休日',22,'pond','rose','west-dots','小舟と花の明るい岸で、夕色の長い道を休む。'],
 [0,6,'cedar-shadow','倒れた杉の木陰','杉陰',17,'forest','mist','pilgrim-detour-conifer','大樹の側を回り、狭くなった見通しを抜ける。'],
 [1,6,'spiced-tea','香草を干す茶棚','香草',1,'forest','amber','forest-tea','森市のにぎわいを、茶と香草の小さな軒へ戻す。'],
 [2,6,'laundry-lane','洗濯物の向こうの道','洗路',27,'village','coral','west-extra-village-150','布の隙間に次の段畑が見える、暮らしの通過路。'],
 [3,6,'mint-terraces','青緑の段畑の水口','水口',24,'terrace','mint','west-terrace','水口と畦の段を回り、畑の高さを比べる。'],
 [4,6,'flour-bags','粉袋を数える風車','粉袋',13,'meadow','amber','west-extra-windmill-85','人の背丈の袋と大きな羽の尺度を比べる。'],
 [5,6,'white-flower-road','白い花の何もない道','花道',26,'meadow','blue',null,'仕掛けを増やさず、遠原を抜ける時間を残す。'],
 [6,6,'cairn-turn','風見石へ曲がる尾根','風見',14,'ridge','violet','pilgrim-detour-climb','小さな石を見つけて、雪の方角へ折れる。'],
 [7,6,'mountain-sill','山の洞門の敷居','洞門',25,'ridge','violet','west-mountain','大きな洞門の足元から、細い登りに入る。'],
 [8,6,'glacier-rest','氷色の雪嶺の休み場','氷嶺',19,'ridge','glacier','west-cliff','雪を見たあと、低い腰掛けから道を振り返る。'],
 [9,6,'fog-coast','霧に沈む海の席','霧海',32,'shore','mist','se-coast-bench','海へ突き出た足場から、見えない先を待つ。'],
 [0,7,'pine-evening','松影の青い夕道','松夕',17,'forest','indigo',null,'枝が空を隠し、木立の先の灯りだけを予感する。'],
 [1,7,'letter-window','便りを待つ灯の窓','便窓',23,'village','violet','journey-wonder-letters','旅の用事の気配を残す、小さな明るい窓。'],
 [2,7,'soup-evening','夕飯の鍋のある宿','夕宿',8,'village','amber','pilgrim-place-8','夕色の道と温かい食堂の間に間を置く。'],
 [3,7,'rose-grass','ばら色の風の草原','紅草',21,'meadow','rose','west-grass','速い風と曲の先に、開けた草の道を見せる。'],
 [4,7,'cloud-ring','雲の縁の小さな円環','雲環',4,'ridge','violet','journey-wonder-ring','人の背より大きい輪と、遠い雲の尺度を比べる。'],
 [5,7,'violet-plain','藤色の遠原の帰り道','藤原',26,'meadow','violet',null,'同じ白い花を薄明で見直す、静かな帰り道。'],
 [6,7,'night-monolith','星明かりの列石の間','星石',5,'stone','indigo','pilgrim-place-5','石の表面を見尽くさず、空に続く高さを残す。'],
 [7,7,'ship-ribs','陸の舟の骨と夕風','舟骨',7,'salt','coral','journey-wonder-ribs','水の設備の記憶を、乾いた舟の形へつなぐ。'],
 [8,7,'harbour-return','船着場のもう一つの待合','待合',0,'river','blue','pilgrim-place-0','遠い旅の後に、人の用事がある岸へ戻る。'],
 [9,7,'river-lamps','川の窓に灯る明かり','川灯',30,'river','indigo','se-port-home-a','窓と水面の小さな灯をたどる、夜の生活道。'],
 [0,8,'rain-grove','雨上がりの針葉の小径','雨森',17,'forest','mist',null,'木立に隠れた短い通路で、開ける前の間を取る。'],
 [1,8,'blue-roof-court','青い屋根の向こうの庭','青庭',23,'village','blue','west-village','出発の青屋根と似た家を、別の暮らしの尺度で見る。'],
 [2,8,'school-glass','鉢の並ぶ学びの温室','鉢庭',20,'pond','mint','west-glass','鉢と水盤の整った庭を、開いた前面から歩く。'],
 [3,8,'sunset-fields','夕日に向かう畦の段','夕畦',24,'terrace','coral','west-terrace','畦を上り下りし、振り返る水口の色を変える。'],
 [4,8,'gold-windmill','金色の粉の丘','金丘',13,'meadow','amber','west-windmill','長い羽の影と袋を見て、次の白い土地へ向かう。'],
 [5,8,'rose-chalk','桃色の白い露頭','桃岩',16,'salt','rose','pilgrim-detour-plateau','白い岩が夕色を受ける、静かな高原の間。'],
 [6,8,'air-aqueduct','空を渡す細い水路','空樋',9,'stone','violet','journey-wonder-aqueduct','小さな水路が画面の外へ続く、配水の道。'],
 [7,8,'reeds-sunset','夕焼けの葦の束ね場','夕葦',31,'marsh','rose','se-marsh-shelter','水面を避ける板道から、葦を干す足場へ着く。'],
 [8,8,'river-supper','河岸の夕飯の窓','河飯',30,'river','coral','se-port-kitchen','明るい窓を一度脇へ回り、海の音へ出る。'],
 [9,8,'night-arch','夜の海の石橋','夜門',32,'shore','indigo','se-coast-arch','同じ大きな橋を、星と水面の暗さで見直す。'],
 [0,9,'waterside-avenue','水辺へ続く並木','水木',27,'forest','mist','west-lane','南の外周を静かに結ぶ、木陰の長い道。'],
 [1,9,'forest-wheel-court','輪を運ぶ森の広場','輪庭',1,'forest','amber','pilgrim-place-1','森の暮らしの輪と、遠くの大きな配水輪を比べる。'],
 [2,9,'departure-pier','夕雲を待つ船着場','夕港',0,'river','coral','pilgrim-place-0','出発にも帰路にも見える、生活のある港。'],
 [3,9,'lily-rest','柳と水草の腰掛け','柳席',15,'pond','rose','pilgrim-detour-shore','長い周回の途中に、小さな休息の余白を置く。'],
 [4,9,'dotted-water','水の上の点と光','点水',22,'pond','blue','west-dots','点描の岸と流れの粒を、ゆっくり通り抜ける。'],
 [5,9,'sandbar-sunset','夕空を映す砂州','夕砂',28,'shore','amber','west-shoal','水に入らず、砂の舌と橋をたどる。'],
 [6,9,'night-distribution','静かな分水梁の庭','夜梁',9,'stone','indigo','journey-wonder-distribution','用途どおり続く配水設備を、夜の人間の尺度で見る。'],
 [7,9,'mist-reeds','白い霧の葦の腰掛け','霧葦',31,'marsh','mist','se-marsh-rest','霧の中で板道を選び、外周の帰り道を見つける。'],
 [8,9,'harbour-cloth','夜の河港の布屋','夜布',30,'river','indigo','se-port-home-b','乾く布と窓の灯を目印に、旅の最後の曲がりを作る。'],
 [9,9,'last-headland','夕空の岬の回り道','夕岬',32,'shore','coral','se-coast-arch','海の大きな空を見て、別の道へ折り返せる岬。']
];
const templates={village:'lantern-inn',forest:'forest-market',meadow:'grass-road',canal:'wet-stairs',dry:'dry-stairs',pond:'glass-court',ridge:'mountain-pass',salt:'salt-boats',stone:'capital-gate',river:'river-port',shore:'tidal-shore',terrace:'terraced-fields',marsh:'reed-walk'};
const small=['pilgrim-detail-1','pilgrim-detail-3','pilgrim-detail-5','pilgrim-detail-9','pilgrim-detail-11'];
export const FIXED_ATLAS=rows.map(([col,row,id,name,chartName,sourceIndex,land,sky,site,role],i)=>{
 const base=FIXED_EXPANSION.find(r=>r.id===templates[land]),z=fixedSource(sourceIndex);
 const polygon=base.polygon.map(([x,y],j)=>[Math.max(0,Math.min(14,x+(j%3===0?(i%3)-1:0))),Math.max(0,Math.min(14,y+(j%3===1?(i%3)-1:0)))]);
 const main=site?fixedObject(site,{x:3,y:3,width:site==='pilgrim-place-12'?8:site==='pilgrim-place-5'?7:site.startsWith('pilgrim-detour')?4:site==='journey-wonder-wheel'?5:site==='se-port-wheel'?6:8,entrance:{x:7,y:11}}):null;
 const props=i%3===0?[]:[fixedObject(small[i%small.length],{x:3,y:10,width:2,entrance:{x:5,y:11}})];
 const cue=sky==='indigo'&&land==='forest'?'32:2':sky==='indigo'&&land==='river'?'22:1':sky==='violet'&&land==='meadow'?'29:2':sourceIndex===16&&sky==='haze'?'35:2':id==='copper-cut'?'36:1':z.music[0];
 const trees=land==='forest'?[[1,4],[13,4],[3,13],[11,13]]:['meadow','village'].includes(land)?[[1,4],[13,11]]:land==='marsh'?[[1,4]]:[];
 return {...base,id,name,chartName,col,row,sourceIndex,land,sky,skyAnchor:{x:col,y:row},role,cue,atlas:true,polygon,trees,site:main,props,npc:i%7===0?{x:6,y:11,color:z.palette[3],name:land==='forest'?'棚を片づける人':land==='river'?'窓辺の人':'道を使う人',lines:[land==='forest'?'棚の茶は、まだ温かいよ。':land==='river'?'向こう岸の窓も、夕飯のしたくをしているね。':'行きと帰りで、見える色が違うの。']}:null,maintenanceBridge:land==='shore'?[[11,6],[11,7]]:land==='river'?[[11,11]]:[],quiet:false};
});
// Existing paths are retained. These links add two long rims and frequent,
// walkable cross routes, while cliffs keep some adjacent edges closed.
export const FIXED_ATLAS_LINKS=[['sealed-court','E','sky-distribution'],['snow-cliff','E','violet-saddle'],['mesa-window','E','copper-cut'],['sea-arch','E','rose-inlet'],['sky-distribution','S','violet-saddle'],['violet-saddle','S','copper-cut'],['copper-cut','S','rose-inlet'],['orchard-window','E','lane-bridge'],['lane-bridge','E','bucket-bank'],['bucket-bank','E','wet-stairs'],['watershed','S','bucket-bank']];
const at=(x,y)=>FIXED_ATLAS.find(r=>r.col===x&&r.row===y)?.id||({3:'wet-stairs',4:'dry-stairs',5:'reed-walk',6:'river-port',7:'tidal-shore',8:'sea-arch'}[x]);
for(let y=4;y<10;y++)for(let x=0;x<9;x++)FIXED_ATLAS_LINKS.push([at(x,y),'E',at(x+1,y)]);
for(let y=3;y<9;y++)for(const x of [0,3,6,9,...(y%2?[2,8]:[5])])FIXED_ATLAS_LINKS.push([at(x,y),'S',at(x,y+1)]);
