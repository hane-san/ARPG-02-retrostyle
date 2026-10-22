// Mysterious modern-art objects and weird melancholic mobs for the wind-and-lake journey map.
// Objects give deep, fading-world explanations when checked.
// Positions scattered across grassland, lake shores, salt, tea, port, and nearby areas.

export const ART_OBJECTS = [
  {
    id: 'art-fading-mirror',
    name: '消えゆく鏡',
    kind: 'art',
    form: 'disc',
    x: 32, y: 28, w: 4, h: 3,
    entrance: {x: 34, y: 32},
    blocking: false,
    desc: '草原に置かれた、歪んだ金属の円盤。近づくと自分の姿が薄くなり、遠くの石が逆に濃く映る。',
    aside: '鏡は何も写さなくなった日を待っている。でもその日が来ても、誰も気づかないだろう。人は鏡を見て自分を確認するより、鏡が自分を忘れ始めるのを恐れている。'
  },
  {
    id: 'art-silent-bell',
    name: '鳴らない鐘',
    kind: 'art',
    form: 'bell',
    x: 58, y: 42, w: 3, h: 4,
    entrance: {x: 59, y: 47},
    blocking: false,
    desc: '風が吹いても音を出さない、薄い金属の鐘。表面には無数の細い傷が、誰かの指の跡のように残っている。',
    aside: 'この鐘はかつて、水位が下がるたびに鳴らされていた。今は水が減っても鳴らさない。音を失った鐘は、ただ「鳴るべきだった時間」を数えている。'
  },
  {
    id: 'art-salt-flower',
    name: '塩の花',
    kind: 'art',
    form: 'flower',
    x: 84, y: 20, w: 3, h: 3,
    entrance: {x: 85, y: 24},
    blocking: false,
    desc: '白い塩の結晶が、まるで花のように開いた物体。触ると冷たく、すぐに形が崩れる。',
    aside: '塩は水を覚えている。この花は、かつて湖の底で咲いていた植物の記憶を、結晶という形で保存している。崩れた後も、風が新しい結晶を同じ形に育てようとする。'
  },
  {
    id: 'art-empty-frame',
    name: '空の額縁',
    kind: 'art',
    form: 'frame',
    x: 96, y: 58, w: 5, h: 3,
    entrance: {x: 98, y: 62},
    blocking: false,
    desc: '湖岸に立てられた、何も入っていない額縁。向こうの景色が額縁の中に収まるように配置されている。',
    aside: '額縁は景色を切り取らない。逆に、景色が額縁を必要としなくなった日を待っている。人が「ここが美しい」と決めた場所にだけ、額縁が残る。'
  },
  {
    id: 'art-broken-compass',
    name: '壊れた方位盤',
    kind: 'art',
    form: 'disc',
    x: 40, y: 50, w: 4, h: 4,
    entrance: {x: 42, y: 55},
    blocking: false,
    desc: '針が常に同じ方向を指し続ける、古い方位盤。どの方向を向いても、針は「かつて水があった場所」を指す。',
    aside: '方位を失った盤は、それでも「どこかへ帰る」ことを忘れない。針が止まった場所は、地図には載っていない。でも誰かがそこにいたという痕跡だけは残っている。'
  },
  {
    id: 'art-glass-path',
    name: 'ガラスの道',
    kind: 'art',
    form: 'path',
    x: 70, y: 68, w: 6, h: 2,
    entrance: {x: 73, y: 71},
    blocking: false,
    desc: '地面に埋め込まれた、薄いガラスの板。踏むと下の土が見える。誰かが何度も通った跡が、ガラスの内側に残っている。',
    aside: 'ガラスの道は、人が歩くたびに少しずつ傷つく。でも傷が増えるほど、下の土の色がはっきり見える。道は、人が通ることでしか自分の存在を確認できない。'
  },
  {
    id: 'art-memory-stone',
    name: '記憶の石',
    kind: 'art',
    form: 'stone',
    x: 22, y: 40, w: 3, h: 4,
    entrance: {x: 23, y: 45},
    blocking: false,
    desc: '表面に何も刻まれていない、滑らかな石。触ると、誰かがここにいたときの温度が、わずかに残っている気がする。',
    aside: 'この石は、誰かの「帰りたい」という気持ちを吸い取った。刻みがないのは、記憶が石の内側に沈んでしまったからだ。石は黙っているが、触れた人の指の跡だけは、次の日には消えている。'
  },
  {
    id: 'art-fading-light',
    name: '薄れる灯り',
    kind: 'art',
    form: 'lantern',
    x: 16, y: 70, w: 3, h: 3,
    entrance: {x: 17, y: 74},
    blocking: false,
    desc: '船着場の近くに置かれた、火が消えてもまだ温かい灯り。近づくと、ほんの少しだけ明るくなる。',
    aside: '灯りは、誰かが戻ってくるのを待っている。でも待つ時間が長くなるほど、明るさは薄れていく。完全に消えたら、もう誰もこの場所を「帰り道」と呼べなくなる。'
  }
];

export const WEIRD_MOBS = [
  {id:'weird-m01', name:'影を数える人', role:'草原の観察者', x:25, y:35, color:'#b8a8c0', lines:['自分の影が二つある日は、誰かが隣を歩いている気がする。','でも影は、いつも少し遅れてついてくる。']},
  {id:'weird-m02', name:'水の音を聞く人', role:'湖岸の人', x:95, y:50, color:'#a8c0b8', lines:['水の音が聞こえる場所と、聞こえない場所がある。','聞こえない場所の方が、昔は水があったらしい。']},
  {id:'weird-m03', name:'石に話しかける老人', role:'塩原の住人', x:82, y:15, color:'#c0b8a8', lines:['石は返事をしない。でも話しかけると、少しだけ軽くなる。','返事がない方が、安心する日もある。']},
  {id:'weird-m04', name:'道を逆に歩く人', role:'茶屋の近く', x:48, y:65, color:'#c8b0a0', lines:['みんなと同じ方向に歩くと、景色が同じに見える。','逆に歩くと、誰かの足跡を踏まないで済む。']},
  {id:'weird-m05', name:'風を集める人', role:'草原の住人', x:35, y:42, color:'#a0b8c8', lines:['風を集めても、どこにも持っていけない。','でも集めた風は、次の人に少しだけ残る。']},
  {id:'weird-m06', name:'鏡を避ける人', role:'旅人', x:30, y:30, color:'#c0a8b8', lines:['鏡を見ると、昨日の自分と今日の自分が重なる。','重ならない日の方が、楽な気がする。']},
  {id:'weird-m07', name:'塩を数える子供', role:'塩原の子供', x:86, y:22, color:'#b8c0a0', lines:['塩の粒を数えても、すぐに風が持っていく。','数えた数は、どこにも残らない。']},
  {id:'weird-m08', name:'灯りを消す人', role:'港の近く', x:18, y:74, color:'#a8b0c0', lines:['灯りを消すと、誰かが戻ってくるのが見えなくなる。','でも消さないと、いつまでも待っている気がする。']},
  {id:'weird-m09', name:'地図を折る人', role:'草原の旅人', x:42, y:38, color:'#c8a0b0', lines:['地図を折ると、折り目の場所が一番大事に見える。','でも折り目は、実際の道とは違う。']},
  {id:'weird-m10', name:'対岸を想像する人', role:'湖岸の住人', x:100, y:55, color:'#b0c0a8', lines:['対岸に誰かがいる気がする。','近づくと、また別の対岸が見える。']}
];
