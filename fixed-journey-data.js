import {PILGRIM_ZONES,PILGRIM_SITES} from './pilgrimage-world.js';
// A fixed-screen recomposition of adopted main-world materials, not a crop.
const specs=[
 ['watershed',2,2,2,'水路を渡る庭','水の庭','空の集落から、水を受け渡す土地へ。','canal',null],
 ['wet-temple',3,2,2,'水を受ける七段','受水殿','器と溝をたどり、流れの用途を歩いて見る。','canal','pilgrim-place-2'],
 ['dry-temple',4,2,6,'水の失せた七段','乾殿','同じ器と溝。底の音と水位の跡が残る。','dry','pilgrim-place-6'],
 ['salt-boats',5,2,7,'白い舟の原','舟原','乾いた白い地面に、手入れされた舟がある。','salt','pilgrim-detail-21'],
 ['lantern-inn',6,2,8,'青い灯の休み処','宿','鍋と椀のそばで、次の土地へ向かう間を置く。','village','pilgrim-place-8'],
 ['grass-road',7,2,21,'風の草原の分岐','草原','明るく速い風。登山路と赤砂へ道が分かれる。','meadow',null],
 ['mesa-window',8,2,29,'赤砂の風窓','風窓','地層を回り、岩の窓に海の色を見つける。','ridge','se-mesa-window'],
 ['wet-stairs',3,3,2,'下の庭へ流す階段','水段','使い終えた水を次の庭へ渡す、静かな通路。','canal',null],
 ['dry-stairs',4,3,6,'水位跡の降り道','乾段','同じ幅の橋と段を、流れのない溝に沿って下る。','dry',null],
 ['reed-walk',5,3,31,'潮風の葦の板道','葦原','曲がる板道を選んで、葦の中の水を越える。','marsh','se-marsh-shelter'],
 ['river-port',6,3,30,'木陰の河港','河港','橋の先に食堂。舟と水車のある生活の岸。','river','se-port-kitchen'],
 ['tidal-shore',7,3,32,'潮だまりの回り道','潮岸','海へ直行せず、岩の縁と潮だまりをたどる。','shore',null],
 ['sea-arch',8,3,32,'潮の石橋','海門','岩の橋を人の尺度で見上げ、赤砂へ戻る。','shore','se-coast-arch'],
 ['glass-court',3,1,20,'記憶の温室の庭','温室','水盤とガラス越しの緑。北の畑と森市への分岐。','pond','west-glass'],
 ['forest-market',4,1,1,'木陰の布の市','森市','開いた軒と布、輪を運ぶ人の明るい広場。','forest','forest-cloth'],
 ['forest-workshop',5,1,1,'木彫りの工房道','工房','市と同じ曲のまま、木工と茶の匂いの道を抜ける。','forest','forest-carver'],
 ['mist-pines',6,1,17,'霧の針葉樹林','霧森','見通しが細くなり、列石への脇道が現れる。','forest',null],
 ['mountain-pass',7,1,25,'風鳴りの登山口','登山','段を登り、岩の洞門の向こうに雪を見る。','ridge','west-mountain'],
 ['snow-cliff',8,1,19,'雪嶺を遠望する崖道','雪嶺','大鐘の余韻と青い雪。帝都へ続く登りの前の間。','ridge','west-cliff'],
 ['terraced-fields',3,0,24,'空の段畑の畦','段畑','畦と階段を回り、水を配る高さを見る。','terrace','west-terrace'],
 ['windmill-hill',4,0,13,'黄昏の風車丘','風車','粉袋と回る羽。登った道を夕色の中で振り返る。','meadow','west-extra-windmill-23'],
 ['azure-plain',5,0,26,'蒼い遠原の白い花','遠原','目立つ出来事を置かず、遠さを感じて通り抜ける。','meadow',null],
 ['monolith-court',6,0,5,'間を測る列石','列石','器と水尺の反復が、人の背より大きく現れる。','stone','pilgrim-place-5'],
 ['capital-gate',7,0,11,'帝都の外郭の足元','帝門','遠くで見た門の柱の間へ。設備の尺度が変わる。','stone','pilgrim-place-11'],
 ['sealed-court',8,0,10,'扉のない受水殿の庭','閉殿','狭い正面の先は閉ざされ、器だけが満ちている。','stone','pilgrim-place-10']
];
const shape={
 meadow:[[1,3],[6,1],[12,2],[14,5],[13,12],[9,14],[2,12],[0,8]],
 ridge:[[4,0],[10,1],[12,4],[14,7],[12,10],[9,14],[4,13],[1,9],[2,4]],
 shore:[[2,1],[10,1],[13,5],[14,9],[10,13],[3,14],[1,10],[0,5]],
 forest:[[2,1],[10,0],[13,3],[14,10],[10,14],[3,13],[0,9],[1,4]],
 court:[[1,1],[12,1],[14,5],[13,12],[9,14],[2,13],[0,8]]
};
export function fixedSource(index){return PILGRIM_ZONES[index];}
export function fixedObject(id,options={}){if(!id)return null;const source=PILGRIM_SITES.find(s=>s.id===id);if(!source)throw Error('Unknown ported site '+id);
 const width=source.form==='gate'?11:source.form==='monolith'?8:['boat','bowl','gauge'].includes(source.form)?4:source.form.startsWith('forest-')?7:9;
 const x=source.form==='gate'?2:3,y=source.form==='west-glass'?4:source.form==='se-kitchen'?3:1;
 const size=options.width??width,factor=size/source.w;
 return {...source,x:options.x??x,y:options.y??y,sourceId:id,sourceW:source.w,sourceH:source.h,scale:factor,w:size,h:source.h*factor,entrance:options.entrance||{x:7,y:9},lines:[source.desc||'道は建物の脇にも続いている。',source.aside||'戻る道から見ると、さっきの形が少し違って見える。']};
}
export const FIXED_EXPANSION=specs.map(([id,col,row,sourceIndex,name,chartName,role,land,site],i)=>{
 const source=fixedSource(sourceIndex),siteObject=fixedObject(site);
 const roads=[[[7,0],[7,5],[6,7],[7,10],[7,14]],[[0,7],[4,8],[7,9],[11,8],[14,7]]];
 if(land==='shore')roads.splice(0,roads.length,[[7,0],[6,4],[8,8],[7,11],[7,14]],[[0,7],[4,9],[7,11],[11,9],[14,7]]);
 if(land==='forest')roads.splice(0,roads.length,[[7,0],[6,3],[8,7],[7,10],[7,14]],[[0,7],[3,8],[7,9],[11,8],[14,7]]);
 if(land==='ridge')roads.splice(0,roads.length,[[7,0],[8,4],[6,7],[7,10],[7,14]],[[0,7],[4,9],[7,10],[11,8],[14,7]],[[6,7],[3,6]]);
 if(land==='meadow')roads.splice(0,roads.length,[[7,0],[6,5],[8,9],[7,14]],[[0,7],[4,6],[8,9],[11,9],[14,7]]);
 if(land==='marsh')roads.splice(0,roads.length,[[7,0],[6,4],[7,8],[9,11],[7,14]],[[0,7],[3,9],[7,8],[11,6],[14,7]]);
 const water=['canal','dry'].includes(land)?[[[10,0],[10,5],[9,10],[10,14]]]:land==='river'?[[[11,0],[10,5],[10,11],[12,14]]]:land==='marsh'?[[[3,0],[4,5],[10,7],[11,14]]]:land==='shore'?[[[12,0],[11,6],[12,11],[10,14]]]:land==='pond'?[[[11,0],[10,5],[11,14]]]:null;
 const trees=land==='forest'?[[2,4],[11,4],[2,11],[12,12]]:land==='meadow'?[[2,11],[12,3]]:land==='marsh'||land==='shore'?[[2,11]]:[];
 const npc=[0,3,8,9,12,13,14,19].includes(i)?{x:4,y:10,name:sourceIndex===1?'布を干す人':sourceIndex===8?'鍋を見ている人':'この道の人',color:source.palette[3],lines:[source.sub||role,'帰る道は、もう一本あるから。']}:null;
 return {id,col,row,name,chartName,role,sourceIndex,cue:source.music[0],land,quiet:id==='sealed-court',polygon:shape[land]||shape.court,roads,trees,water,dry:land==='dry',site:siteObject,npc,maintenanceBridge:['wet-temple','dry-temple'].includes(id)?[[10,1]]:id==='sea-arch'?[[11,6]]:[],stairs:['terrace','ridge','canal','dry'].includes(land)?[[6,3],[7,3],[8,3],[6,11],[7,11],[8,11]]:[]};
});
export const FIXED_EXPANSION_LINKS=[['homewind','E','watershed'],['watershed','E','wet-temple']];
const connect=(ids,d)=>{for(let i=1;i<ids.length;i++)FIXED_EXPANSION_LINKS.push([ids[i-1],d,ids[i]]);};
connect(['wet-temple','dry-temple','salt-boats','lantern-inn','grass-road','mesa-window'],'E');
connect(['sea-arch','tidal-shore','river-port','reed-walk','dry-stairs','wet-stairs'],'W');
connect(['glass-court','terraced-fields'],'N');
connect(['terraced-fields','windmill-hill','azure-plain','monolith-court','capital-gate','sealed-court'],'E');
connect(['snow-cliff','mountain-pass','mist-pines','forest-workshop','forest-market','glass-court'],'W');
FIXED_EXPANSION_LINKS.push(['mesa-window','S','sea-arch'],['wet-stairs','N','wet-temple'],['wet-temple','N','glass-court'],['sealed-court','S','snow-cliff'],['dry-temple','N','forest-market'],['grass-road','N','mountain-pass'],['river-port','N','lantern-inn'],['monolith-court','S','mist-pines']);
