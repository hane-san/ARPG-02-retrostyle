// Mysterious modern-art objects and weird melancholic mobs for the wind-and-lake journey map.
// Objects give deep, fading-world explanations when checked.
// Positions scattered across grassland, lake shores, salt, tea, port, and nearby areas.

export const ART_OBJECTS = [
  // (existing objects kept)
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
    x: 57, y: 44, w: 3, h: 4,
    entrance: {x: 58, y: 49},
    blocking: false,
    desc: '風が吹いても音を出さない、薄い金属の鐘。表面には無数の細い傷が、誰かの指の跡のように残っている。',
    aside: 'この鐘はかつて、水位が下がるたびに鳴らされていた。今は水が減っても鳴らさない。音を失った鐘は、ただ「鳴るべきだった時間」を数えている。'
  },
  {
    id: 'art-salt-flower',
    name: '塩の花',
    kind: 'art',
    form: 'flower',
    x: 82, y: 20, w: 3, h: 3,
    entrance: {x: 83, y: 24},
    blocking: false,
    desc: '白い塩の結晶が、まるで花のように開いた物体。触ると冷たく、すぐに形が崩れる。',
    aside: '塩は水を覚えている。この花は、かつて湖の底で咲いていた植物の記憶を、結晶という形で保存している。崩れた後も、風が新しい結晶を同じ形に育てようとする。'
  },
  {
    id: 'art-empty-frame',
    name: '空の額縁',
    kind: 'art',
    form: 'frame',
    x: 100, y: 63, w: 5, h: 3,
    entrance: {x: 102, y: 67},
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
    x: 61, y: 74, w: 6, h: 2,
    entrance: {x: 64, y: 77},
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
  },
  {
    id: 'art-empty-chair',
    name: '誰も座らない椅子',
    kind: 'art',
    form: 'chair',
    x: 45, y: 35, w: 3, h: 3,
    entrance: {x: 46, y: 39},
    blocking: false,
    desc: '草原のまんなかに置かれた、古い木の椅子。誰かが座った跡が、少しだけへこんでいる。',
    aside: 'この椅子は、誰かが「少し休もう」と思った場所に置かれた。でも休む人は減り、椅子だけが残った。座面のへこみは、誰かの体重をまだ覚えている。'
  },
  {
    id: 'art-broken-hourglass',
    name: '砂の落ちない砂時計',
    kind: 'art',
    form: 'hourglass',
    x: 57, y: 58, w: 3, h: 4,
    entrance: {x: 58, y: 63},
    blocking: false,
    desc: '砂が半分残ったまま、落ちなくなった砂時計。ガラスの内側に、細かい傷が無数にある。',
    aside: '砂が落ちなくなったとき、誰かがこの時計を「止まった」と呼んだ。でも砂は、落ちるのをやめたのではなく、落ちる場所を失っただけかもしれない。'
  },
  {
    id: 'art-white-thread',
    name: '白い糸',
    kind: 'art',
    form: 'thread',
    x: 28, y: 52, w: 5, h: 2,
    entrance: {x: 30, y: 55},
    blocking: false,
    desc: '地面に張られた、細い白い糸。風が吹くと少し揺れ、どこかで切れている。',
    aside: '糸は、誰かが「ここまで」と決めた境界だった。でも境界の向こうに人がいなくなって、糸だけが残った。切れた先は、もう誰も結び直さない。'
  },
  {
    id: 'art-fading-footprint',
    name: '薄れる足跡',
    kind: 'art',
    form: 'mark',
    x: 38, y: 19, w: 4, h: 2,
    entrance: {x: 40, y: 21},
    blocking: false,
    desc: '草の中に残る、誰かの足跡。雨が降るたびに少しずつ薄くなり、それでもまだ形を保っている。',
    aside: '足跡は、誰かがここにいたという証拠。でも証拠は、時間が経つほど弱くなる。完全に消えたら、誰もこの道を「通ったことがある」と言えなくなる。'
  },
  {
    id: 'art-silent-boat',
    name: '音を出さない小舟',
    kind: 'art',
    form: 'boat',
    x: 102, y: 45, w: 5, h: 3,
    entrance: {x: 104, y: 49},
    blocking: false,
    // Drawn half on the water on purpose; the lake under it stays unwalkable.
    afloat: true,
    desc: '湖岸に置かれた、小さな木の舟。漕いでも水の音がしないように、底が薄い。',
    aside: 'この舟は、誰かが「静かに渡りたい」と思ったときに作られた。でも渡る人がいなくなって、舟だけが残った。音を出さないのは、誰にも気づかれないようにするためかもしれない。'
  },
  {
    id: 'art-empty-well',
    name: '水のない井戸',
    kind: 'art',
    form: 'well',
    x: 75, y: 30, w: 4, h: 4,
    entrance: {x: 77, y: 35},
    blocking: false,
    desc: '塩原の近くに残る、古い井戸。底は乾いていて、それでも誰かが水を汲もうとした跡がある。',
    aside: '井戸は水を待っている。でも水が来なくなっても、人は井戸の周りを歩き続ける。水がないことを、誰も口にしない。'
  },
  {
    id: 'art-folded-paper',
    name: '折られた紙',
    kind: 'art',
    form: 'paper',
    x: 52, y: 62, w: 3, h: 2,
    entrance: {x: 53, y: 65},
    blocking: false,
    desc: '石の下に挟まれた、何も書かれていない紙。折り目が何度も重ねられている。',
    aside: '紙は、誰かが「伝えたい」と思った言葉を待っていた。でも言葉が書かれないまま、折り目だけが増えた。紙は、言葉より先に折られることを覚えた。'
  },
  {
    id: 'art-distant-bell',
    name: '遠くで鳴る鐘',
    kind: 'art',
    form: 'bell',
    x: 92, y: 34, w: 3, h: 3,
    entrance: {x: 93, y: 37},
    blocking: false,
    desc: '塩原の端に置かれた、小さな鐘。近づいても音は聞こえず、遠くにいるときだけ、かすかに鳴る。',
    aside: 'この鐘は、近くにいる人には聞こえない。遠くにいる人にだけ、音が届く。誰かが戻ってくるのを、遠くから知らせるためかもしれない。'
  }
];

export const WEIRD_MOBS = [
  {id:'weird-m01', name:'影を数える人', role:'草原の観察者', x:25, y:35, color:'#b8a8c0', lines:['自分の影が二つある日は、誰かが隣を歩いている気がする。','でも影は、いつも少し遅れてついてくる。']},
  {id:'weird-m02', name:'水の音を聞く人', role:'湖岸の人', x:76, y:35, color:'#a8c0b8', lines:['水の音が聞こえる場所と、聞こえない場所がある。','聞こえない場所の方が、昔は水があったらしい。']},
  {id:'weird-m03', name:'石に話しかける老人', role:'塩原の住人', x:82, y:15, color:'#c0b8a8', lines:['石は返事をしない。でも話しかけると、少しだけ軽くなる。','返事がない方が、安心する日もある。']},
  {id:'weird-m04', name:'道を逆に歩く人', role:'茶屋の近く', x:50, y:63, color:'#c8b0a0', lines:['みんなと同じ方向に歩くと、景色が同じに見える。','逆に歩くと、誰かの足跡を踏まないで済む。']},
  {id:'weird-m05', name:'風を集める人', role:'草原の住人', x:33, y:44, color:'#a0b8c8', lines:['風を集めても、どこにも持っていけない。','でも集めた風は、次の人に少しだけ残る。']},
  {id:'weird-m06', name:'鏡を避ける人', role:'旅人', x:30, y:26, color:'#c0a8b8', lines:['鏡を見ると、昨日の自分と今日の自分が重なる。','重ならない日の方が、楽な気がする。']},
  {id:'weird-m07', name:'塩を数える子供', role:'塩原の子供', x:86, y:22, color:'#b8c0a0', lines:['塩の粒を数えても、すぐに風が持っていく。','数えた数は、どこにも残らない。']},
  {id:'weird-m08', name:'灯りを消す人', role:'港の近く', x:18, y:74, color:'#a8b0c0', lines:['灯りを消すと、誰かが戻ってくるのが見えなくなる。','でも消さないと、いつまでも待っている気がする。']},
  {id:'weird-m09', name:'地図を折る人', role:'草原の旅人', x:42, y:38, color:'#c8a0b0', lines:['地図を折ると、折り目の場所が一番大事に見える。','でも折り目は、実際の道とは違う。']},
  {id:'weird-m10', name:'対岸を想像する人', role:'湖岸の住人', x:58, y:48, color:'#b0c0a8', lines:['対岸に誰かがいる気がする。','近づくと、また別の対岸が見える。']},
  {id:'weird-m11', name:'椅子を見つめる人', role:'草原の住人', x:47, y:38, color:'#b0a0c0', lines:['あの椅子に座ると、誰かの体温が残っている気がする。','でも座ると、すぐに冷たくなる。']},
  {id:'weird-m12', name:'砂を待つ人', role:'茶屋の近く', x:57, y:57, color:'#a8b0a0', lines:['砂が落ちなくなった時計を見ている。','落ちない砂は、もう時間を数えていない。']},
  {id:'weird-m13', name:'糸を結ぼうとする人', role:'草原の観察者', x:22, y:50, color:'#c0a8a0', lines:['切れた糸を結び直そうとする。','でも結び直しても、またすぐ切れる。']},
  {id:'weird-m14', name:'足跡を踏まない人', role:'旅人', x:36, y:25, color:'#a0c0b0', lines:['足跡を踏まないように歩く。','でも自分の足跡が、また誰かに踏まれる。']},
  {id:'weird-m15', name:'舟を見ている人', role:'湖岸の人', x:100, y:66, color:'#b8c0b0', lines:['あの舟は、誰も漕がない。','漕がない舟は、どこへも行かない。']},
  {id:'weird-m16', name:'靴を脱いで歩く人', role:'草原の住人', x:29, y:40, color:'#c0b0a8', lines:['靴を脱ぐと、草の温度がよく分かる。','でも誰も靴を履いていない道は、もうない。']},
  {id:'weird-m17', name:'同じ場所をぐるぐる回る人', role:'円い道の人', x:38, y:36, color:'#a8b8c0', lines:['同じ円を何周も歩いている。','一周するたびに、風の匂いが少し変わる。']},
  {id:'weird-m18', name:'石を拾っては戻す人', role:'草原の観察者', x:33, y:48, color:'#b8a0c0', lines:['石を拾うと、地面に穴が残る。','戻しても、穴はすぐには埋まらない。']},
  {id:'weird-m19', name:'誰かの名前を呼ぶ人', role:'茶屋の近く', x:44, y:68, color:'#c0a8b0', lines:['誰かの名前を呼んでも、返事はない。','でも呼ぶのをやめると、もっと静かになる。']},
  {id:'weird-m20', name:'灯りの下で待つ人', role:'港の人', x:16, y:73, color:'#a0c0b8', lines:['灯りの下にいると、誰かが戻ってくる気がする。','でも灯りは、戻ってくる人を照らさない。']},
  {id:'weird-m21', name:'草を数える子供', role:'草原の子供', x:35, y:33, color:'#b0c0a8', lines:['草を一本ずつ数えている。','数えた草は、次の日にはもう増えている。']},
  {id:'weird-m22', name:'道を消そうとする人', role:'旅人', x:39, y:44, color:'#c8b0a8', lines:['自分の足跡を消して歩いている。','でも消しても、また誰かが同じところを通る。']},
  {id:'weird-m23', name:'風に話しかけている人', role:'草原の住人', x:26, y:43, color:'#a8c0a0', lines:['風に話しかけると、少しだけ返事がある気がする。','返事は、いつも同じ方向から来る。']},
  {id:'weird-m24', name:'茶を飲まない客', role:'茶屋の人', x:50, y:67, color:'#b8c0c0', lines:['茶を頼んでも、飲まないでいる。','飲まない茶は、だんだん冷たくなる。']},
  {id:'weird-m25', name:'対岸を指差す人', role:'湖岸の人', x:84, y:70, color:'#c0b8b0', lines:['対岸を指差しても、誰も見てくれない。','指差すのをやめると、対岸が少し遠く見える。']},
  {id:'weird-m26', name:'塩を舐める人', role:'塩原の人', x:80, y:25, color:'#a0b0c0', lines:['塩を舐めると、昔の水の味がする。','でもすぐに、ただの塩に戻る。']},
  {id:'weird-m27', name:'地図を裏返す人', role:'草原の旅人', x:36, y:28, color:'#c0a0b8', lines:['地図を裏返すと、何も書かれていない。','何もない面の方が、歩きやすい気がする。']},
  {id:'weird-m28', name:'石段に寝ている人', role:'夕景の人', x:74, y:74, color:'#b0a8c0', lines:['石段に寝ると、夕空が近く感じる。','でも寝ていると、誰かが通り過ぎる音がよく聞こえる。']},
  {id:'weird-m29', name:'船の影を見る人', role:'港の近く', x:20, y:70, color:'#a8b0c8', lines:['船の影を見ている。','影は、船より長く残っている。']},
  {id:'weird-m30', name:'誰もいない道を選ぶ人', role:'草原の歩き手', x:23, y:38, color:'#c0c0a8', lines:['誰もいない道を選ぶ。','誰もいない道は、草が一番濃い。']}
];
