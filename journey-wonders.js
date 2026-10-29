// Optional observations along the existing pilgrimage. No new quest or ending.
const arch=(w,h)=>[{x:0,y:0,w:1,h},{x:w-1,y:0,w:1,h}];
const site=(id,form,name,x,y,w,h,chapter,entrance,solid,artTop,desc,aside)=>({
 id:'journey-wonder-'+id,kind:'pilgrimage',form:'wonder-'+form,name,x,y,w,h,chapter,entrance,solid,artTop,blocking:false,desc,aside
});
export const JOURNEY_WONDERS=[
 site('letters','letters','風待ちの便り棚',181,11,8,4,1,{x:185,y:17},[{x:0,y:0,w:8,h:1}],2,
  '布で包んだパンと、細長い封筒が並ぶ。宛先の読めない包みにも、新しい日除けが掛けてある。',
  '棚の下には子どもの背の高さで描いた舟。誰かが同じ色を継ぎ足している。届いた便りの棚は、手前だけ木肌が白い。'),
 site('wheel','wheel','三段の揚水輪',247,58,5,4,2,{x:249,y:63},[{x:0,y:0,w:1,h:4},{x:4,y:0,w:1,h:4}],5,
  '低い器から高い器へ、輪の小さな升が水を運ぶ。上の溝は畑へ、こぼれた分は足洗いへ戻る。',
  '升の数だけ、手入れの日を刻んだ札がある。輪が一周する間、手すりの小舟も一度だけ浮く。'),
 site('aqueduct','aqueduct','空を渡る細い水路',278,89,8,4,3,{x:282,y:94},arch(8,4),10,
  '道の上を、水の溝だけが渡っていく。二本の脚の間に、遠くの白い線が収まる。',
  '脚の根元には修理用の小さな足場。上の溝と同じ断面をした木片が、膝の高さに置かれている。'),
 site('ring','ring','雲の縁の円環',358,86,8,4,4,{x:362,y:91},arch(8,4),12,
  '人が何人も並べるほどの輪を、細い二本の脚が支えている。輪の内側を雲の影が通る。',
  '下の七本の刻みには、庭で見た水尺と同じ間隔がある。指先に触れる部分だけ、石が丸い。'),
 site('ribs','ribs','陸の船の骨',300,259,8,4,7,{x:304,y:264},arch(8,4),5,
  '舟底の間に、草と小さな通路がある。肋材に掛けた布は、雨を待つように丁寧に畳まれている。',
  '水を渡す庭の舟と同じ結び目。けれどこちらの舵は、風では動かない。板を替えた年だけが続いている。'),
 site('distribution','distribution','帝都の分水梁',302,158,7,5,11,{x:305,y:164},arch(7,5),16,
  '森で回した小さな輪と同じ形が、空を横切る梁に並ぶ。下の洗い場では、一人分の椀が満ちる。',
  '梁の先は岩に隠れて見えない。空の受け皿にも、満ちた受け皿にも、同じ速さで影が通っている。'),
 site('return','return','返事を待つ壁',447,170,8,4,12,{x:451,y:175},[{x:0,y:0,w:8,h:1}],6,
  '石の窪みに便りを留める板が並ぶ。森市と同じ舟の絵に、見知らぬ色の帆が足されている。',
  '読むための腰掛けは、来た道へ向いている。まだ白い板が一枚、雨の当たらない所に残る。')
];
export const WONDER_VISTAS=[['aqueduct','空に残る水の道','小さな修理足場から、帝都へ続く線を見る'],['ring','輪の向こうの雲海','足元の七つの刻みと、空ほどの輪'],['distribution','一人の椀、帝都の器','旅で触れた形が、地平の向こうにも続く']].map(([id,title,sub])=>{
 const s=JOURNEY_WONDERS.find(s=>s.id==='journey-wonder-'+id);
 return {id:s.id+'-vista',...s.entrance,radius:3,title,sub,kind:'wonder-'+id,chapter:s.chapter};
});
