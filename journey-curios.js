// Issue #51: optional, original everyday oddities. No quest or history flags.
const curio=(id,name,form,x,y,desc,aside,sound)=>({id:'curio-'+id,name,kind:'art',form,x,y,w:2,h:2,
 entrance:{x:x+1,y:y+2},blocking:false,desc,aside,sound});
export const JOURNEY_CURIOS=[
 curio('kettle','休憩札の湯沸かし','kettle',47,70,'「休憩中」と書かれた湯沸かしが、こつこつ働いている。','沸いている時間は、休み時間に数えるらしい。札だけはずっと働いていない。','kettle'),
 curio('sign','気分しだいの道標','sign',24,31,'年季の入った道標。右：湖まで三日。左：湖まで三日。','真ん中：気分しだい。矢印は、真ん中だけ曲がっている。','wood'),
 curio('welcome','見送りの練習札','paper',5,75,'「おかえり」の字に、何度も上書きした跡がある。','裏には小さく「練習」と書いてある。本番用の札は、まだ見当たらない。','wood'),
 curio('ship-cup','陸の船酔い用コップ','cup',89,24,'舟に乗らない家の、船酔い用コップ。台の上で、ほんの少し傾いている。','持ち主いわく、船酔いだけは代々受け継いだそうだ。','creak'),
 curio('gauge','背伸びした水尺','sign',120,25,'水尺のいちばん上に、爪先立ちの足形が描いてある。','その高さの水を見た、とはどこにも書いていない。','wind'),
 curio('bell','一音欠けた風鈴','bell',156,22,'軒先の小さな風鈴。そのうち一本には、音を出す舌がついていない。','風はそこも律儀に揺らしていく。鳴らない一本の順番も飛ばさずに。','bell'),
 curio('bench','空だけ見る椅子','chair',169,25,'すわる？ と書いた椅子。背もたれの向こうには、空しかない。','……今日は、いい空だった。そう言う練習に、ちょうどよさそうだ。',null),
 curio('door','挨拶だけの戸口','frame',157,60,'「入る方へ、こんにちは」戸口の札は、とても丁寧な字で書かれている。','裏側には何もない。出ていく人にかける言葉は、まだ考え中らしい。','glass'),
 curio('boots','留守番の長靴','boots',119,105,'左右とも「右」と書かれた長靴が干してある。泥はきれいに落としてある。','履く人は、たいへん右へ行きたがる。そう書いた小さな札も、右側にある。','drip'),
 curio('clock','思い出す時計','hourglass',156,108,'時刻は止まっている。時計のそばの椅子には、誰も座っていない。','針だけが、思い出したように動く。待ち合わせの時刻を示すわけでもなく。','clock'),
 curio('lunch','遺跡の弁当台','cup',30,110,'古びた遺跡の弁当台。弁当の置き場所だけ、新しい布が敷いてある。','石版の読めない文字より、こちらの「食べるな」はよく分かる。','stone'),
 curio('reply','返事をしない石','stone',75,112,'石は何も言わない。耳を寄せても、表面に細い砂が残っているだけだ。','それなのに、少し遅れて、後ろで何かが返事をした。','echo')
];
// Existing places provide two more quiet sources. The sky bench stays silent.
export function journeySoundSources(sites){
 const attached=sites.filter(s=>s.sound).map(s=>({id:s.id,...s.entrance,kind:s.sound}));
 for(const [id,kind] of [['journey-ruins-sunken-bell','drip'],['journey-balance-gate','wind']]){
  const s=sites.find(s=>s.id===id);if(s)attached.push({id,...s.entrance,kind});
 }
 return attached;
}
