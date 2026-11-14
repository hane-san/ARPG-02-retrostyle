# 採用判断と保留の記録

## 2026-11-14：100枚の地図は「地面はシック、空は美しく」（制作者チャット）

制作者「前の淡いやつも好き。いい塩梅に」に続き「全体をシックに、ただ空は美しく、淡くても透き通るような鮮やかさ、エモい夕焼けや夜景も。見せ方も工夫で。線がぱきっとしすぎ？見やすさとレトロゲームらしさの両立を」を採用。最初に入れた全画面一律の淡色フィルター（CSS＋ミントのscreen）は空まで褪せるため撤回し、既定 `./` のアトラスだけで描き分ける（`fixed-sky.js`）。

- 地面：遠景の地平から下にだけ、灰緑（夜は灰青）の薄い塗りで彩度とコントラストを下げ、線の硬さを和らげる。盤の奥には空の霞を少し、夕景では空の光を地面に薄く、画面の縁は空の最も深い色でごく弱く囲む（`gradeLand`）。ドット絵の拡大はにじませずレトロらしさを保つ。
- 空：グラデーションを実際に見えている空（遠景の上端 `skyFloor`）に収め、地平の光の帯で透明感を出す。夕焼けは太陽を地平近くに見せ、残照と下から照らされた細い雲を重ねる。夜は星のまたたきと淡い星の川、遠景に遠い家の灯り（`drawSkyAir`・`drawNightLights`）。
- 素材・地形・当たり判定・空の配置・音は変えない。`?walk=1`・classic・小さな旅は対象外。人間の色の受入・iPhone実機の見え方と描画負荷は未検証。

## 2026-11-03：シームレス旅と画面固定感の両立を、デッドゾーン追従で試す（Issue #104）

- **意思決定**：制作者が「ゼルダ的な画面単位の構図」と「MOTHER/ポケモン的な連続スクロール」のどちらが旅に合うか検討した後、シームレスを基本にして**デッドゾーン型カメラを試作すること**を明示承認。これは標準方式を入れ替える採用判断ではない。
- **旧・現行仕様**：Issue #96/#101の方向別先読みは連続徒歩の前方を広く見せる反面、少しの移動でもカメラの反応が気になる場合がある。現行標準のディレクタは維持。
- **新しい比較案**：`?camera=deadzone` のみ、約2.45タイルの画面相対の不感帯を越えるまで視界を保ち、長い移動では緩やかなsmoothstepで進行方向の余白へ移る。手動パン済みの先行画角を勝手に引き戻さず、現在の地図・会話・歩行速度と変化する大遠景ズームを維持。手引きに比較リンクを置くが、常設メタHUDは加えない。
- **今回実装しない**：固定部屋の設置、部屋間での画面切替、屋内マップの捏造、地形や物語の変更、クエストやセーブ、通常方式の廃止。
- **受入・判定**：Node/Chromiumの回帰と既存モード非干渉を確認。どちらのカメラが旅行の寂寥感と操作感を最も高めるかは、後のiPhone Safari試遊で比較してから決める。


## 2026-11-02 夜：前方視界はそのまま、カメラの『ぐいっ』を緩和（Issue #101）

- **制作者の明示的な修正希望**：「かなりいい感じ」な前方先読み（Issue #96/PR #97）について、「ちょっとカメラがぐいっと動きすぎ。もう少し自然に」。
- **旧仕様**：移動2.6マスで追従を開始し、4マスの線形増加で前方先読みを育て、指数補間の反応係数6.5で追いつく。最終構図は良いが、そこへの移行の体感が強すぎる。
- **試作仕様**：先読みの到達目標（縦持ち横方向34%、横持ち26.5%、縦方向18%/16%）は原則維持。先読みの立上りを当初6マスsmoothstep・応答4.2で試したが、実Chromiumの「移動1.6秒時点の前方視界」回帰で目標未達（主人公位置約36.7%）となったため、**5マスsmoothstep・応答4.6**へ微調整。2026-11-03の昼ランで、main統合後のCIが同じ検査の境界（0.3333 対 上限0.33）で揺らいだため、応答だけを**5.2**へ上げた（5マスsmoothstep・速度上限は不変。ローカル4回で0.308〜0.321）。それでも従来の4マス線形・6.5応答より立上りは穏やか。フレーム当たりの前方移動上限を、通常徒歩時の「歩行速度＋6タイル/秒」を基準に**現在の移動ペースと比例**させる。これにより速い地図徒歩でも同じ歩数で同程度の先読み構図へ落ち着く。2マスの短距離タップ、手動先行パンの保持、主人公可視、画角/地域ズーム/Reduced Motionは維持。
- **検証区分**：試用PRでNode/Chromiumのフレーム速度と長距離先読みを確認し、iPhone Safariの疲れ・揺れの改善は人間が試遊して判断。旧版を全面否定せず体感への漸進的な修正として扱う。


## 2026-11-02：進行方向の余白を増やすカメラ構図（Issue #96、試用）

- **採用した改善方向**：制作者が実機の横移動スクリーンショット2枚を示し、タップで歩き始めると進行方向へカメラが十分先行し、右移動中は主人公が画面左寄りに落ち着く体験を明示指示。上下・左右・縦横画面で割合を調整する。
- **旧仕様**：Issue #86で、前に手動パンした構図を維持し、2.6マス歩いて追いついたら4マスかけて先読み最大3マスへ移る。これは視点を引き戻さない長所があるが、広い画面で前方が少ない。
- **試用変更**：既定巡礼のみ、既存の「手動パン後追いつき待ち」と短距離の静かな構図を保存しながら、追従開始後の先読みを画面相対の方向別距離に変更。縦持ちの横移動は約20〜25%の主人公位置を目標にし、上下は控えめ。横画面の割合は弱め、フレームレート非依存の補間を少し応答良くする。現地/地図速度による移動構図を揃える。
- **変更しないもの**：既定屋外0.8と著者指定遠景倍率、世界の地形・衝突・A*、距離・速度、目的地・NPCタップ、停止/手動パン/会話、旧atlas/classic/prototype、音・保存キー。
- **判定**：この指示は比較試作PRの実装を採用した判断。Node/Chromiumテストは客観的な移動位置・境界・反転だけ検査する。iPhone Safariでのストレス軽減とカメラ酔いは未検証で、統合済みを意味しない。


## 2026-10-25：屋外の倍率を0.8で安定させ、特別な大遠景と実屋内だけ切替（Issue #70、試用PR）

- **意思決定：採用して試作**。夕方の人間試遊で「ズームがコロコロ変わり疲れる。今の少し引き気味を標準に、屋内と特別な超遠景だけ変わるようにしてPRで試したい」と明示。
- **旧仕様**：Issue #62の地域別6目標（港1.0、茶屋1.15、街道0.8、広大な野外0.6、狭い屋外遺跡1.35、特殊屋外近景1.8）、景観地点へ接近時にも自動切替。
- **新仕様**：既定旅モードの通常屋外はすべて0.8。作者指定の特別な大遠景 `journey-scenic-wide` だけ0.6。実際の屋内のみ将来1.35だが屋内マップは未実装。屋外で1.0、1.15、1.35、1.8への接近切替をしない。特殊地点との出入りは滑らかにし、頻繁なズームを回避する。
- **変更理由**：画面が変化し続ける疲れを減らし、「ただ歩いて気持ちよい」「少し遠くまで見通せる」体験を優先。カメラの進路先読み追従、主人公可視、停止中の手動パン、手動ズーム禁止は維持。
- **対象／影響**：`journey-camera.js`、既定旅の手引き、関連テスト。旧classic・mini、地形/衝突/経路/速度/音源/保存キーは不変。
- **実装・検証区分**：本決定は当該PRの試作を承認するものであり、main統合・iPhone Safariでの疲れの改善・屋内実装を意味しない。自動テスト・CI結果をPRに記録し、実機試遊は未検証として引き継ぐ。


## 2026-10-21：ノンストップ試作フェーズと毎日15時の昼ラン（2026-10-21）

- 決裁：はねさん（2026-10-21のチャット）。「今はアイデアをどんどん投げて変わっていく様子を見たいフェーズ。マージまでノンストップで、帰りに遊べるようにしたい。開発中盤以降は変える」。
- 内容：毎日15時ごろ、Claude Codeの昼ランがARPG-02とSRPGの採用済みIssue・PRを監査・修正・実装し、条件（rules/browser成功・衝突なし・監査BLOCKなし・`hold`なし）を満たしたPRをmerge commitでマージ、Pagesを確認する。独立監査とiPhone試遊は夕方の試遊にまとめ、未実施は未実施と記録する。
- 維持：main直push・force-push・GitHubのauto-merge機能・Approve・Settings変更・テスト弱体化・保存キー変更の禁止。68曲・湖・世界接続・`tidal-atlas:` 保存キー。マージするのは昼ランだけ。
- 終了条件：はねさんが安定化フェーズへの切替を指示したとき。手順は `.claude/skills/steward/SKILL.md`。

## 2026-10-20：Claude Codeを監督にした明け方の巡回（採用）

- 決裁：はねさん（2026-10-20のチャット）。GPT/Codex等のPRを、Claude Codeが監督として朝までに検証・反映できるようにする。
- 時刻：毎日4:12（日本時間）。朝の通勤中に試遊・修正し、昼には利用枠が回復する配分。
- 担当：専用セッション「明け方の監督巡回（独立監査担当）」へ、定期タスクが届く。対象は ARPG-01・ARPG-02・SRPG・chess・ADV の5リポジトリ。PRの実装に関わっていないセッションなので、独立監査として記録できる。
- 権限：PRの目的の範囲内の小修正は、検査を通してから、1回の巡回につき1回までPRブランチへpushしてよい（はねさんが方針をClaudeに委任）。マージ・承認・main直push・force-push・Settings変更はしない。手順は `.claude/skills/steward/SKILL.md`。
- 経緯：Claude Codeのセッションから作った「毎回新しいセッション」型の定期タスクは、リポジトリが付かずGitHubが403になった。リポジトリ付きの専用セッションへ届ける形に変え、2026-10-20に接続を試運転済み（5リポのclone・PR一覧の取得・ARPG-01のcheckが成功）。

## 2026-10-20：Claude引継ぎ前の安定化（Issue #16）

人間の依頼により停止作業・未反映PR・カメラ/UIを整理し、関連PRの統合まで進める。PR #10/#13/#15は既に統合済み。今回のカメラ修正は入力の取消・複数指の境界・補間終了だけを対象とし、速度・倍率・地形・経路・既定入口・保存・68曲は変えない。main直接push・force push・auto-merge・Settings変更は許可しない。実機受入と未採用のUX案は残す。

## 2026-10-19：中央アジア風の新しい旅マップを明示採用（Issue #14）

ユーザー添付の正式実装依頼により、従来の「中央アジア試作は検討中」と時点を分け、`?journey=1` の独立試遊版を採用。既存2モードの置換はしない。112×88の円形草原・湖・塩原・峠・モノリスと任意の夕景、既存68曲の地域再割当を実装対象とする。地域選曲は連続滞在2.2秒と保持12秒で安定させる。地名・会話は仮、主筋・戦闘・クエスト・セーブは未採用のまま。詳細は [JOURNEY](JOURNEY.md)。Issue #11の未採用UX案、アイコンPR #13、運用PR #10を一括採用したものではない。

記録日：2026-10-19。既存の実装および採用されたチャット要求をもとにした初期整理。詳細は実コード・テストを優先する。

同日の追加依頼により、新モードは下部に道具と現在地を集約し、上部の常設UI・操作のメタ表記・発見数表示を省く。窓と会話は淡色の小さなカードに統一し、下部の道具や歩行への復帰を妨げない。旧モードのUIは継続し、未採用のUX案全体を導入するものではない。

## 採用済み
- 戦記と島のARPGとは**独立した第三の2D探索ゲーム**とする。過去のゲームと同一リポジトリに統合しない。
- 潮環群島と星風回廊を長い橋で往復。スタート近くにも簡単に渡れる小橋を設置。
- 星風回廊は中央アジア地理・旅情から着想するが、世界観・文化・位置関係は**現実の中央アジアの再現ではない**。両マップ共通の淡いファンタジー表現。
- 湖はスマホで最大ズームアウトしても全景が見えないほど大きい。草原・トンネル・オアシス・田畑・茶屋・渓谷・干上がった港・未来都市を含む。
- 歩行は少しゆったり、指カメラのスムーズな動きと少し速い追従、小さな足音、音楽のクリック音抑制、移動中ズームロック、余分な歩数UI廃止。
- SRPG/ARPGと開発手順を統一：Issue→ブランチ→PR→CI→必要な独立監査→人間の実機試遊・承認→main。**ゲーム仕様は独立**。

## 現行の技術状態（採用と実装の確認範囲を分ける）
- 2マップ、近道と遠方の橋、基本会話、68曲の合成Web Audioを保持。2026-10-19のmainではNode自動テスト31件。
- 実際のスマホでのポップノイズ消滅や全体の快適さは、テスト成功だけで確証できない。

## 別途決める・保留
- 公式ゲームタイトル（現行の仮題「潮環群島 × 星風回廊」を保持）。
- **2026-10-19採用・実施済み**：第三ゲームの正式GitHubリポジトリ名は **`ARPG-02-retrostyle`**（`hane-san/ARPG-02-retrostyle`）。元の `fantasy-adventure-test` から改名済み（Issue #3）。一時案の `ARPG-02` は正式名ではない。既存の `ARPG`・`SRPG` は改名しない。
- **確認待ち**：新Pages URL `https://hane-san.github.io/ARPG-02-retrostyle/` でのiPhone Safari実機起動・音声、Codex/Claudeの対象リポジトリ選択、main保護Rulesetの設定。GitHub PagesのデプロイActionは成功済み。
- 戦闘、クエスト、セーブ等の追加。現段階の機能だとは記載しない。

## 旧仕様と混同しない
- SRPGの戦闘ルール・合流・待機やARPGの一人称スティック操作はこの2D探索ゲームの仕様ではない。
- チャット履歴・案ベースの将来機能を、実装済みの決定にしない。

## 2026-10-19：統合状況と開発導線の現在地

- 共通開発基盤PR #2、正式repo名参照PR #4、小さな旅PR #7は人間が統合済み。確認時mainは `263e62ed8fa1e2746405e09f4db7323967e3dd7c`。
- 小さな旅は[PROTOTYPE](PROTOTYPE.md)に従う任意の試遊モードとして実装済み。通常版の置換・既定入口への切替、正式タイトル変更は採用しない。
- 今回の依頼（Issue #8）は既存の共通契約・テンプレート・CIを活かし、現行mainとの案内のずれを補う。エンジン・本番ソース・設定キー・CI構成は変更しない。
- GitHub上のPR #2/#4/#7のレビュー一覧は空。人間による統合は確認済みだが、別担当の独立監査・iPhone試遊の証拠は未確認。CI成功や今回の自己確認で完了扱いにしない。
- main保護と公開・他環境の接続確認はIssue #5で継続。旧「既存SRPG/ARPGは改名しない」という記録は本作の作業範囲を示す。両repoの人間が選んだ現在名は `SRPG-01-FEstyle` / `ARPG-01-SkyrimStyle`。

## 2026-10-19：初期開発を優先する運用へ

- 人間の追加指示：「それ一旦後回しで、開発初期の今はガンガン入れられるように」。main保護の即時設定を保留し、設定作業を開発開始・PR統合の前提にしない。PR #9は人間が統合済み。
- 既存CIを確認用に維持。関連する小さな改善はIssue/PRへまとめ、記録は目的・差分・確認結果・残件を中心に短くする。毎回の同じ採用確認を不要とする。
- low/戻せるmediumの独立監査と実機試遊は遊べる区切りでまとめる。未確認事項は残件であり、無関係な新規開発の停止条件にはしない。highの経路・世界遷移・保存契約の設計/レビューは維持する。
- 対象はARPG-02のみ。他2作品のRulesetsやCIを変更しない。作業ブランチ・PR・人間の統合判断は維持し、main直接push・force push・auto-mergeは許可しない。
- 以前の保護設定・監査・試遊の記録と手順は削除しない。安定化・公開範囲を広げる時点で人間が保護導入を再判断する（Issue #5）。


## 2026-10-20：草原湖を入口に、場所に応じた5段階の画角

人間の明示依頼（Issue #28）により、`./` は草原湖を開く。旧2世界は `?mode=classic`、台場ミニは `?prototype=1` に保持する。草原や湖の広さと村の近さを5つの目標倍率で描き分け、境界滞在・場面保持・滑らかな補間を設ける。進行度の保存や倍率の解放は追加しない。手動ズームは歩行中ロックのまま、自動演出のみ移行できる。音の停止予約で波形が変わる問題も実合成で再現して修正する。詳細・検証・Claude再監査の入口は [JOURNEY-PRESENTATION](JOURNEY-PRESENTATION.md)。

## 2026-10-20：BGMの連続再生と手動倍率廃止（Issue #30）

追加回答「BGMがONのときに聞こえる」を受け、曲を端末内で先にPCMへ合成しnativeループで再生する。mainスレッドのノート予約から独立させ、準備は同時1曲・完了保持は2曲に制限する。初回音の待ち時間とSafari実機の負荷は監査へ残す。前回の停止包絡線とbusフェードは保持する。

手動倍率を全モードで廃止。草原湖は近い1→遠い5という番号で、街3（1.0）・街道4（旧最遠景0.8）・広大5（新0.6）を使う。2（1.35）は将来の実屋内、1（1.8）は最寄り用。現在は屋内未実装なので使わない。4道具へ整理し、初回徒歩と滑らかな補間のmain #33も保持する。[現行仕様と監査項目](JOURNEY-PRESENTATION.md)。

## 2026-10-24：移動中の進路先読みと自動構図（Issue #58、採用）

- ユーザーの追加明示依頼：進行方向を多めに見せる追従カメラ。地面タップによる短距離移動と広域地図からの長距離移動の双方で、歩行中は手動カメラ操作を要しない。自分で見回すときはより滑らかに。
- 実装方針：既定の旅マップでは先の経路・既存の景観演出地点を参照する時間補間の自動構図を採用。徒歩中のドラッグはカメラに反映せず、タップで行き先は再指定できる。停止中は自由パンと現在構図の保持を優先する。
- 既存の5段階自動ズーム、旧2世界とミニ版の画角、経路探索・地形・マップ接続・音声・保存設定は維持。新しいイベントムービーや手動ズームは追加しない。
- PRで変更・検証予定。rules/browserとiPhone Safari試遊の合格、およびmainへの統合はPR上で個別に確認する（文書への記載時点で完了扱いにしない）。

## 2026-10-24 夜：街を基準にした6画角と軽快な手動パン（Issue #62、採用）

- 決裁：ユーザーはiPhone縦画面のチャイハナ周辺スクリーンショットを標準にする案に対し、地域別の倍率と手動スクロール案を明示採用。
- 新目標値：町・港・交易都市1.0、小さな村と茶屋・湖畔の小屋1.15、街道と普通のフィールド0.8、広大な湖・草原・高地・絶景0.6、狭い遺跡と回廊1.35、指定された異質な近接演出1.8。旧5目標値へ1.15を追加し6種類にする。1.15は全NPCに一律適用しない。
- 切替は土地の属性と手で指定された景観地点によって決まり、目的地／経路長／移動速度で不用意にズームしない。通常エリアは滞在1.2秒・保持5秒、景観地点の接近・退出は別のヒステリシス（入域は広め、退出はさらに少し広め、別の短い保持）で演出の取りこぼしと長すぎる残像を抑える。補間中も主人公可視を保つ。
- 停止中の手動パンの感度と補間は旅モードだけ0.95／11.5へ変更（従来0.72／9.5）。旧世界とミニ版のドラッグ特性、自動追従とタップでの行き先変更、5段階に基づく旧設計文書の歴史的な記録は維持する。手動ズームは復活させない。
- Issue #62と対応PRで実装・Node/ブラウザチェック。iPhone Safariの体感と画面酔い評価は実機で別途受入判定（CIと混同しない）。

## 2026-10-28：現行地図を約10分の巡礼体験へ再編集（Issue #80、採用）

制作者は現行地図の上書き、地形/当たり判定の見直し、NPC削減/再配置、多数のオブジェと淡い地域色の大胆な実験を採用。巡礼の一周から、帰る旅の代わりに景色が変わる後半、巨大な最終拠点へ至る歩きの試作とする。既定journeyは新配置へ更新し、旧atlasの座標/NPC数/施設配置維持は新地図の条件にはしない。旧版は `?atlas=previous` と迷路Bで再現でき、旧回帰は保持する。

旧classic/prototype、原曲68と既存追加曲、BGM OFF/SE ON、設定保存名、2D探索、水不可、手動ズームなしは維持。屋外0.8/明示大遠景0.6、歩行5.7/地図7.35も維持する。ラスボス「拠点のような景観」であり、ボス戦・シナリオ・クエスト・時間操作の採用ではない。約10分は観察込みの設計目安で、人間の所要時間は未検証。

[実装前の技術計画・推奨順路・検証](PILGRIMAGE-LOOP.md)を参照。

## 2026-11-04 — #106：西側十二地域と空、独自の十二曲

- 採用元はIssue #106の本文＋追加2コメント。12地域の実装を依頼され、Codexに本Issueのマージまで明示委任。一般のマージ役割を恒久変更せず、このIssueで通常PRの全ゲートを確認する。
- 最新main b94901fに#105 ae866c5を統合。通常#96/#101とデッドゾーン比較を両方維持し、追従アルゴリズムは変更しない。#93全提案の採用や#98の未決定メニュー停止方針を混ぜない。
- 巨大湖を守るため元の座標を動かさず480×832へ拡張。#99の黄昏／湖畔ID13/15を西の新景観と共有し、旧道／目印も残す。十の新IDで29地域・76地点・26NPC。二つの縦幹線と横断路、隣り合う土地の中央連絡路で複数の回遊を保つ。
- 地形と足元を正本に、空は世界の開口にマスクし、地形キャッシュを前に描く。実画面で不透明チャンクが開口を黒くする問題を発見し、西側チャンクのalphaを有効にした。植栽の見た目と固体、段畑の最上段の接続も実検査で修正。階段を描く場所は通れる段差として扱い、建物の足元だけは別の固体。
- 十二曲は32小節A/B/A′/終止、異なる旋律・和声・拍節・編成。旧90曲のデータとIDはSHA256でも固定検査。西側の初回主曲を明示、650ms境界確認／1600ms保持、1.2秒クロスフェード。単曲地域のランダム再選曲がundefinedになる既存分岐も修正。
- 夕景は実際の崖道の矩形内での累計3分。再入場／逆走で戻さず、背景の大きな時間差を捨てる。時計や物語の確定情報をHUDへ追加しない。
- 拡大した地図は静的な地形だけ2px/タイルでキャッシュし、名前／発見／現在地は都度描く。横持ちは地域一覧を独立スクロールさせる。移動速度、元のA*、旧モード、設定キーは維持。
- 証拠・試聴・実機未確認は[景観台帳](WESTERN-SKY-STUDIES.md)。自己確認は独立監査ではない。

- 実描画の比較から、到着位置で空が読めるよう開口を北の未使用地へ延ばし、遠原だけ地域全体の.6を作者指定。大きな足元の共通ブロックは休息石／木の幹／流木の実寸へ分けた。遠原は涼しい昼、風車丘は夕色を保ち、崖道の時間を全地域の昼夜へ拡大しない。

## 2026-11-04 — #108：改善版を標準にし、土地の連続性と南東を磨く

- 制作者が#105のカメラを標準に選択。#104の採用待ちを更新し、以前の#96/#101を`?camera=directional`へ残す。新しい追従アルゴリズム、倍率や速度の変更は混ぜない。
- 480×832を維持し、南東に4地域／10地点／6人／4独自曲。西と南東を複数の道で結び、川の両岸・葦原の枝道・海の石橋へ歩いて出られる。33地域・86地点・32NPC・106曲。旧102曲は譜面とイベントのSHA256で保護。
- 西側の矩形全面舗装をやめ、輪郭の連続場、曲がる主道、入口に沿う庭、岩面、群落へ。ガラスの花壇幅、段畑上段の余白、登山路上段の階段を修正。岸の１マス先端だけを丸める。島を検査後に消して接続済みとする救済は使わず、全床BFSで独立検査する。
- 固体自然物は5×5の床の余裕を確認し、道や水を狭めない。幹と樹冠を別描画し、人物の前の葉は透かす。描画は既存チャンクと可視範囲で制限する。
- 今回もCodexへのマージ明示委任。全PRゲートと公開確認は必要。実耳／iPhone／独立監査／創作の人間受入は機械検査と区別する。[技術計画・試遊](LIVING-LANDSCAPES.md)。

## 2026-11-04 — #110：空と地形を磨き、試遊の道標と緩急のある4曲

- 制作者が描き込み・自然で個性的な地形・空の美術・格好いい曲と緩急・試遊ワープを採用し、本件も通常マージまで明示委任した。
- 固定した世界座標の空に、雲の厚み・縁の光・雪の谷と霞を加える。低い視点で見える空の色を重視し、画面サイズで山を伸ばす処理を廃止。崖道の3分だけ昼夕、他地域の固有の時間帯は維持する。
- 西の二本の直線の外周道を曲がる道にし、湾・尾根・林間・湿地の枝を地域別に変える。元の巡礼は既存の床と湖を保ち、隣のXへ接続した小地形を広げる。原湖と43区間の回帰は維持。
- 旧106曲を変更せず、新4曲を追加。主曲は登山路53:1、裂け目53:2、風窓54:1、草原54:2。静かな区間と山場は楽譜の音数・編成・強さで作り、既存の音量設定を変えて作らない。
- 船着場の道標は試遊専用。原雲上も含め19候補を抽選し、通常の一巡では重複しない。到着後の再抽選と手引きの帰還で比べる。カメラ／音楽のarrival APIは明示した試遊移動だけへ使い、歩行の待ち時間や追従を変えない。旧モードには出さず、発見数・セーブ・女神の能力の設定にしない。
- 全33地域の台帳・試遊と未検証範囲は[SKY-AND-TRIAL-TRAVEL](SKY-AND-TRIAL-TRAVEL.md)。独立監査と実機・実耳の未実施をCI成功と区別する。

## 2026-11-05 — #112：固定画面は独立した枝道で比較する

- 制作者は、既存世界を残した8画面程度の固定構図・上下左右の探索とワープ往復を採用。全体方式の採否は未決定。main統合まで依頼され、本件は通常PRマージと既存の全ゲートで進める。
- 15×15を8画面。2つの回遊路を持ち、名所・会話だけでなく、遮蔽・分岐・登り・到着前の間・帰路にも役割を置く。地域23の素材と曲47:2を活用し、全室で曲を再始動しない。
- 独立Canvasと状態器を使い、元の世界・通常カメラ・選曲の状態を保持する。復帰は元の安全床と構図へ。遷移入力は破棄し、画面内の経路が出口を近道に使わない。単に既存マップを等分する方式は採らない。
- 全室共通の等方倍率と280msスライド、Reduced Motionの即時切替。空は歩行盤の外にも描く。画面別の特別倍率は今回見送り、別の比較論点として残す。[台帳・試遊](FIXED-SCREEN-BRANCHES.md)。

## 2026-11-06 / #120：固定画面で様々な土地と音を歩き比べる

制作者は現行メインの景観・地形・音楽・オブジェを広く移植し、マージして試遊するよう依頼。既存世界を置き換えず、気に入った8画面の帰り並木の東へ25画面を接続する。元21地域/21cueの実素材・solid・音源を再利用し、15×15/共通倍率/560msを維持。全体固定画面化・別倍率・神話の真相は未決定。今回の通常PRマージをCodexへ明示委任、exact-head rules/browser等のゲートは維持。[台帳・未検証](FIXED-GRAND-JOURNEY.md)。

## 2026-11-06 / #122：一画面のマス数ではなく、100枚へ広げる

「40×40」は枚数の意図との制作者の訂正を受け、10×10＝100画面を採用。一画面15×15と見やすさ、旧33の位置、通常世界との往復を維持する。67枚に役割/曲/空/設備を付け、元main全33地域を活用。青空を残す11の空気と38のcueで比較する。全体採用・本番地理・神話の答えは確定しない。検証を省かずbrowserを5グループに分割し、集約browserは全成功時のみ成功。継続する通常PRマージ委任と全ゲートを適用。[設計と台帳](FIXED-HUNDRED-ATLAS.md)。

## 2026-11-09 / #124：中央出発、幅と位置の異なる連続地形

制作者は広い面同士・斜めの切れ目・見える対岸への上側迂回・中央から四方の景観・北端の空を採用。長方形は裁量とされ、今回は人物の大きさと既存の安定した構図を保つ15×15を選んだ。100枚の位置/旧主要ループを維持し、5接続と共有通行帯、実衝突の裂け目を追加。出発は(4,5)分水庭へ。全体への採用と物語の確定には広げない。[実装/検証/未実施](FIXED-CONNECTED-GEOGRAPHY.md)。

## 2026-11-10 / UIの快適さの見直し（制作者のチャット指示）

制作者が「3本のゲームのUI面の快適さを改めてチェックして、調整してマージして」と依頼。本件に限り、このセッションのClaude Codeが通常PRのマージまで行う（最新headのrules／browser成功、最新mainと無競合、hold/BLOCKなし、通常merge後にmain CIとPagesを確認。直push・force・auto-merge・Approve・Settings変更はしない）。

現行の巡礼（既定画面）の `journey.css` だけを調整した：シートの閉じるボタン・BGM/足音の切替・曲の選択・会話と展望カードの閉じるボタンを見た目も44px以上に、道具の名前10→11px、補足の文字11→12px、地図の地区ボタン11→12px、会話の本文13→14px。配置・シート・ドック・地図・カメラ・音は変えていない。未対応として残したもの：横向きでは縦長の全体地図がシートの高さに合わせて小さく表示される（地図のタップ検査が多数あり、配置変更は別途の判断が必要）。iPhone実機・独立監査は未実施。

## 2026-11-12 / 画面切替を既定に、音楽はエリアごと、背景レイヤーと遊び心のある地形（制作者のチャット指示）

制作者が、縦画面前提で「マップ上のオブジェクトの後ろに背景があるのが基本（場所次第、自然さ優先）」「全マップで曲が違うのではなくエリアごと。今の曲はうまく再配置してあまり減らさず、サウンドルームで全部聴ける」「地形にゼルダのような遊び心」「既定を画面切替に」と依頼。#112〜#124の「全体方式は未決定」を**画面切替を既定に採用**へ置き換える。

- `./` は100枚の画面切替。つながった巡礼は `./?walk=1`、手引き、道標から。他の比較URLと旧モードはそのまま。
- 20エリアに4〜7曲のプレイリスト。エリア内は曲を変えず、境でだけ切替。聴取2ループ・150秒以上で次の曲へ。全110曲を配置し、サウンドルームは110曲のまま。
- 盤面の空白セルを土地の自然な周りで埋め、遠景3層を空の前に置く。断層・尾根・北端の上段だけ崖と空を残す。
- 88枚に茂み・岩の小さな囲い、小さな発見、飛び石、池、道しるべ。全床の連続を置くたびに検査する。
- 詳細・台帳・未検証は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md)。iPhone実機・実耳・独立監査は未実施。

## 2026-11-13 / 画面切替の見栄えの総点検（制作者のチャット指示）

画面の端、没入感を削ぐ地名表示、高い建物の上部のフェード、遠景の重なりの不自然さを総点検して整える依頼。

- 歩ける盤面を隣の盤面より手前に描き、高い建物を霞で欠けさせない。スライド中は前後の2枚を進み具合で重ねる。
- 出口の地名札は、着いた直後・近づいたとき・向かっているときだけ。枠線のない札にし、矢印を控えめにした。
- 遠景の家並み・柱列・帝都の外郭は中景の後ろに立てる。近景は土地の周りの模様で画面の端まで続ける。
- 詳細は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md) の6節。iPhone実機・独立監査・制作者の見た目の受け入れは未実施。

## 2026-11-13 / 移動・会話・当たり判定のUI見直し（制作者のチャット指示）

- 縦画面で細くしか見えない左右・下の隣の盤面は描かず、土地の周りの模様と、外へ伸びて消える出口の道にした。
- 周りと歩ける地面の境目に、土地ごとの障害物の縁（生け垣・柵・胸壁・石の列・白波・葦）を描く。床に似た周りは少し暗くした。
- 内側の障害物（茂み・岩・木・建物・周り）をタップすると、横の最寄りの床まで歩く。水面と外周の端は何もしない。
- 会話の札は主人公を指す位置に出し、肩書きはエリア名にした。スライド中も歩く動きを続ける。呼び名は「画面切替の旅」。
- 詳細は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md) の7節。iPhone実機・独立監査は未実施。

## 2026-11-13 / 出口の地名の札をなくす（制作者のチャット指示）

- 画面切替の旅の盤面から、出口の「〜へ」の札をなくした。どこから移動できるかは地面の二重矢印だけで示す（少し大きく、普段から少し濃く）。隣の地名は地図で読める。
- 見えない札の位置はタップ先にしない。描いた矢印は、角の2本目も含めてすべて自分の出口のタップ先になる。
- 帰りの道標の札は残した。詳細は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md) の8節。iPhone実機・独立監査は未実施。

## 2026-11-13 / ゼルダのように自然な地面・縁・つながりとエリア名（制作者のチャット指示）

- 画面切替の旅の歩ける地面を、その土地の地面（芝・森の土・砂・砂利・雪・塩の地面・敷石）として描き、道は角の丸い一本の道にした。
- 草地と庭では、周りとの境を丸い茂みの壁にした。崖は岩肌にした。盤面の境では、両側の地面と道の中間色へ3マスかけて近づける。
- 出口の近くの木は、矢印を本当に覆う時だけ薄くする。
- 音楽のエリアが変わったときだけ、エリア名を空の上に約2.6秒浮かべる。
- 当たり判定・経路・地図データは変えていない。詳細は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md) の9節。iPhone実機・独立監査は未実施。

## 2026-11-14 / 建物・小物・村人・木の絵の仕上げ（制作者のチャット指示）

- 画面切替の旅の建物・設備・家・村人・固い小地形に、足もとの影、濃い輪郭、左上からの光を共通の仕上げとして加えた。元の絵は直接描いたまま、輪郭を下に、光を上に重ねる。
- 塗り壁の家に薄い板張りの筋を入れた。盤面の木を葉の緑にした。
- 元の巡礼の絵・つながった大地・旧モード・当たり判定は変えていない。詳細は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md) の10節。iPhone実機・独立監査は未実施。
- 続けて（制作者「岸とかも！改善すべきとこ全部！」）：歩ける地面の角を、水や歩けない周りに面する所で丸めた。盤面の中の水を海・川の色にそろえて浅瀬の帯とさざ波を入れ、岸に泡の線と濡れた地面の帯を描く。崖の角も地面の丸みに合わせた。詳細は11節。

## 2026-11-14 / 地域の文化：建物の形と人の服装（制作者のチャット指示・実験）

- 画面切替の旅で、土地ごとに9つの架空の文化（森の木組み・草原の天幕・白壁の里・水路の町・葦の高床・網の浜・日干し煉瓦・青い丸屋根・石積みの峰）を決めた。住まいの建物と村人の服装を、その文化で描く。実在の民族や衣装を写したものではない。
- 宿・食堂・家・ガラスの家は、役割（青い灯・日よけと湯気・布・窓ガラス・花）を残したまま描き直した。名所は元の絵のまま。
- 家のない24枚に、文化ごとの小さな住まい（2×2マスの固い地形、一行の説明つき）を置いた。床がひとつながりのままであることを検査する。
- つながった大地・旧モード・当たり判定の原則は変えていない。詳細は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md) の12節。iPhone実機・独立監査は未実施。

## 2026-11-14 / 盤面の小さな動き（制作者のチャット指示）

- 立っている盤面に、揺れる草、水のきらめきと魚の輪、雲の影、蝶、落ち葉、蛍、雪、ときどき横切る鳥の群れ、煙突・天幕・小屋の煙と食堂の湯気を加えた。物理・操作・保存はなく、Reduced Motion では止まる。詳細は [FIXED-DEFAULT-AREAS](FIXED-DEFAULT-AREAS.md) の13節。


## 2026-11-14 / AGENTS.md の整理で移した原文（docs/slim-contract）

規則の中身は変えずに、AGENTS.md を「いま有効な規程」だけに細くした。日付つきの節と、上書きを重ねていたカメラの条文の原文をここへそのまま移す。現在値は AGENTS.md の「3. Game invariants」が正本。

### Opt-in camera framing comparison (2026-11-03, Issue #104)

The producer approved trying a Zelda-like stable screen feel **without replacing seamless travel**. Keep the standard #96/#101 pilgrimage follow at `/`. The temporary `/?camera=deadzone` variant uses a screen-relative dead zone on short walks and soft, forward-biased tracking on sustained walks. Do not change map coordinates, zoom, pathfinding, normal menu/dialogue, or the older worlds. The variant is linked from Help only (reload resets the current journey position). This does **not** approve Zelda-style room transitions or indoor room maps. Do not merge this A/B experiment into default behaviour unless the producer separately chooses it after iPhone playtesting.

### Adopted default journey replacement (2026-10-28, Issue #80)

The producer explicitly authorizes overwriting the current journey terrain and layout, reducing/repositioning NPCs, and experimenting boldly with many objects, regional pastel colours, stable framing, music and monumental unease. The default journey is now the authored pilgrimage loop and changed final approach in `pilgrimage-world.js`; its implementation plan is `docs/PILGRIMAGE-LOOP.md`. Previous atlas coordinate/count preservation applies to that historical version, not this new default. `?atlas=previous` retains the previous data for comparison/regression; `?maze=turns` remains its existing opt-in maze trial. The old classic/prototype worlds, original 68 plus added tracks, non-traversable water, storage namespace and no combat/quest/save/payment remain invariant. Field/map speeds remain 5.7/7.35 and outdoor framing 0.8 with only authored wide vantages at 0.6. The approximately ten-minute duration includes observation and is not a verified human playtime.

### Adopted catch-up framing and world studies (2026-10-29, Issue #86)

The producer's follow-up supersedes the field/map framing distinction above **only for the current pilgrimage**: both hold a manually panned view until the traveller catches its forward side, then follow the occupied route edge without recoiling. The authored regional scales are ordinary 0.8, ridge 0.46, capital/citadel 0.38 (Reduced Motion 0.6); use regional entry/exit dwell and hold instead of zooming around individual objects. See `docs/WORLD-STUDIES.md`. Seven optional studies and three vistas add story inspiration without deciding the open mythology or introducing quest/completion/save state. Historical modes keep their existing camera.

### Western landscape integration (2026-11-04, Issue #106)

The producer explicitly delegates **this Issue's normal PR merge to Codex**, overriding the role/time restriction above only for #106 and the incorporated #105 camera commit. All exact-head rules/browser, latest-main conflict, no BLOCK/hold, normal merge, main CI and Pages checks remain required. No direct main push, force push, auto-merge, Approve or Settings changes. Independent audit, actual iPhone and ear listening remain unverified until separately performed.

The current pilgrimage is **480×832**, with 29 regions, 76 sites and 26 NPCs. Twelve west studies reuse the #99 twilight/shore IDs and add ten IDs; the old six detour paths and the original lake/43-leg loop remain. Original ninety pieces keep their IDs, followed by twelve original 60–120s pieces (45:1 through 50:2). See [western ledger and technical plan](docs/WESTERN-SKY-STUDIES.md). Cliff time advances only inside its actual world rectangle, with session-local accumulation. Sky openings require alpha in the western terrain chunks; never paint opaque black over them. Keep both #105 camera followers and the default selection unchanged. Outdoor scales remain .8, authored plain .6, cliff/ridge .46, capital .38, Reduced Motion .6.

### Adopted composed camera and living landscapes (2026-11-04, Issue #108)

The producer explicitly selected the improved #105 composed follower as the default and delegated this Issue's normal PR merge to Codex. This supersedes #104's pending default-selection rule and #106's unchanged-default clause for the current pilgrimage only. `/` and `?camera=deadzone` use the composed follower; `?camera=directional` retains the #96/#101 comparison. Old atlas/maze/classic/prototype framing, regional scales and speeds are unchanged. The role/time merge restriction is overridden only for #108; exact-head rules/browser success, latest-main conflict check, no hold/BLOCK, normal merge, main CI, Pages and live boot remain required. No direct main push, force push, auto-merge, Approve or Settings changes.

The 480×832 pilgrimage now has 33 regions, 86 sites, 32 NPCs and 106 pieces. Four southeast river/plateau/marsh/coast countries follow the original 29 regions; four original pieces follow the previous 102 without changing any old score/event output. The western twelve landscapes retain their anchors/cues and gain natural rims, curved roads, shared broad surface fields and clustered flora. Real water, solid feet and stair/bridge floors remain the collision source. See [living-landscape plan, ledger and QA](docs/LIVING-LANDSCAPES.md). Full-floor connectivity and object-clearance tests are required. Independent audit, actual ear listening, iPhone and human aesthetic acceptance remain unverified until performed.

### Adopted sky, natural landforms and trial travel (2026-11-04, Issue #110)

The producer explicitly delegates this Issue's normal PR merge to Codex, overriding the role/time restriction only for #110. Exact-head rules/browser success, latest-main conflict check, no hold/unresolved BLOCK, normal merge, main CI, Pages and live boot are still required. No direct main push, force push, auto-merge, Approve or Settings changes. Real ear listening, physical iPhone, independent audit and human aesthetic acceptance stay unverified.

The current pilgrimage remains 480×832 and 33 regions, with 87 sites (one is a trial utility), 32 NPCs and 110 pieces. The previous 106 score data and event output keep their IDs and exact hashes. Four energetic original compositions at 53:1–54:2 replace the primary cues of mountain/canyon/mesa/grass only; all previous pieces remain in the sound room. Preserve OFF/ON defaults, independent volumes and continuous release/crossfade.

The explicitly approved trial waystone at (25,104), entrance (26,107), is the only exception to normal seamless walking. It offers a session-local random bag of 19 curated lands, a repeat jump and return via Help. Do not treat it as goddess lore, a quest or saved progress; do not expose it in older modes or inflate discovery counts. The arrival APIs of camera/music are only for explicit trial jumps; ordinary walking dwell/follow/zoom stays unchanged. Keep all original walking regressions; they must not use this tool to bypass routes.

Eight world sky openings (seven west plus the existing cloud ridge) use immutable world geometry, layered light/clouds and blocked transparent sky cells. Original lake and route floors remain intact in the core; the western cliff fringe protects roads, architecture and NPCs. All-floor connectivity remains mandatory. Regional terrain and detail must be read from physical floor/wall/bridge/water data, with bounded chunks and visible-range objects. See [sky/trial ledger and QA](docs/SKY-AND-TRIAL-TRAVEL.md).

### Independent fixed-screen comparison (2026-11-05, Issue #112)

The producer explicitly authorizes implementation through main integration and permits a smoother delivery route. This Issue uses a work branch and normal PR merge after exact-head rules/browser success, latest-main conflict check and no hold/unresolved BLOCK, then main CI, Pages and public startup. This overrides the role/time restriction only for #112. Do not use direct main push, force push, auto-merge, Approve or Settings changes in this chosen workflow.

Only the separate eight-room `fixed-screens` experiment uses fixed framing and cardinal screen transitions; adoption throughout the game remains undecided. Each room has a 15×15 grid and common isotropic viewport-fit scale. Ordinary pilgrimage and older modes keep their existing camera, map, routes, collision and music library. The existing trial dialogue and Help expose the named entrance. Retain the original world in memory; return to its safe occupied cell, held camera and previous track, discarding stale routes/input. Music remains continuous across rooms. Keep all existing walking regressions, add real browser tests of field gates, repeated returns and transition input, and distinguish emulation from physical iPhone, ears and independent audit. See [plan and room ledger](docs/FIXED-SCREEN-BRANCHES.md).

### Adopted fixed-screen grand journey (2026-11-06, Issue #120)

The producer explicitly delegates this Issue's normal PR merge to Codex, overriding the role/time restriction for #120. Exact-head rules/browser success, latest-main conflict check, no hold/unresolved BLOCK, normal merge, main CI, Pages and public boot remain mandatory. No direct main push, force, auto-merge, Approve or Settings changes.

The independent fixed comparison now has 33 screens (original eight plus 25), each 15×15, and a 135×60 overview. Port 21 current-main regions and their 21 cue assignments through existing original renderers, source solid footprints and music; the closed court retains its quiet state. Use common isotropic viewport fit, 560ms transitions, real tap/path walking, source-correct collision, old safe return and uninterrupted same-region music. Whole-world fixed-screen adoption remains undecided; the current main map, camera, 110-piece library and all old modes remain available. See [ledger, plan, cue map and QA](docs/FIXED-GRAND-JOURNEY.md). Real iPhone/Safari, ear listening, independent audit and human aesthetic acceptance remain unverified.

### Adopted hundred-screen atlas (2026-11-06, Issue #122)

The producer clarified that the count is **10×10 maps = 100 screens**, not a 40×40 walking grid. Preserve each 15×15 board, common isotropic fit and 560ms transitions. Keep the original 33 boards and main world, add 67 authored boards, all 33 main-region primary cues plus selected existing mood variants (38 assignments including the quiet court), and 11 sky compositions. No new mythology answers or whole-world fixed-screen adoption. See [hundred-screen ledger and QA](docs/FIXED-HUNDRED-ATLAS.md).

The producer's continuing instruction to complete related improvements through merge covers #122. Use a branch and normal PR merge only after exact-head rules and **all five browser groups** succeed, latest-main no conflicts, no hold/unresolved BLOCK; then verify main CI, Pages and public play. No direct main push, force, auto-merge, Approve or Settings changes. Browser checks are sharded into core/landscapes/journey/fixed/atlas without dropping the existing checks; the `browser` aggregate requires every group. Physical iPhone/Safari, ears, independent audit and human aesthetic acceptance stay unverified.

### Adopted connected fixed geography (2026-11-09, Issue #124)

The producer's continuing normal-PR merge delegation covers #124 after exact-head rules/all five browser groups/browser, latest-main no conflict, no hold/unresolved BLOCK, then main CI/Pages/public play. Keep all prohibitions and deferred physical iPhone/ears/independent audit. The 100-screen comparison still uses 15×15/common isotropic fit/560ms, but starts at central (4,5) watershed-wheel. Shared offset and split bands replace centered-only seams in the new terrain; preserve every lane, physical faults/water/solid feet, and safe return. New diagonal fault must be walked around its upper tip, not bridged by connectivity repair. Old 8/33-room regressions walk from central entry before their retained routes. All ten northern boards have authored sky bearings. See [technical plan, geography, routes and QA](docs/FIXED-CONNECTED-GEOGRAPHY.md). Whole-world adoption remains undecided.

### Adopted screen-switching default, area music and playful terrain (2026-11-12, producer chat)

The producer chose the screen-switching atlas as the **default entrance** (superseding "whole-world fixed-screen adoption remains undecided"). `./` enters the 100-board atlas at the central hub after preparing the connected pilgrimage underneath; `./?walk=1`, `?journey=1`, `?atlas=previous`, `?maze=turns` and `?camera=*` open the connected world directly, and Help switches between both. Old classic/prototype modes are unchanged.

Music in the atlas follows **20 contiguous areas** (`fixed-areas.js`), not single boards: one piece continues across an area and changes only at area edges; each area's 4–7 piece playlist moves on after two loops and at least 150 s of actual listening. All 110 pieces are placed in the field, the sound room lists all 110, and the 110 score hashes are unchanged. Portrait-first layering: objects in front, walkable ground, the land's natural surroundings filling non-walkable board cells, neighbouring boards, then a layered regional panorama in front of the sky (cliffs and sky remain at the fault, ridges and the northern rim). 88 boards gain seeded, physically honest playful landforms (nooks of bushes/boulders, glints with a line of text, stepping stones, ponds, signposts) that are rejected whenever any lane, doorstep or person would be cut off. No items, quests, scores or saved progress. See [plan, area ledger and QA](docs/FIXED-DEFAULT-AREAS.md). Physical iPhone/Safari, ear listening, independent audit and human aesthetic acceptance remain unverified.

### Former camera invariant bullets (verbatim)

- Camera is static-first: manual drag eases to a bounded target, route/edge follow is gentle, the explorer remains visible, map bounds hold, and manual zoom is disabled in all modes (Issue #30). **Issue #70 supersedes the place-based outdoor zoom targets of #28/#39/#62 only for the default journey**: all regular outdoor terrain, towns, outdoor ruins, architecture and normal scenic beats use a steady **0.8** from the first frame; only specifically authored `journey-scenic-wide` vantages may use **0.6** and return to 0.8 with hysteresis. Actual interiors may use **1.35** when implemented; there are currently no indoor maps, and outdoor structures or monoliths must not trigger a close zoom. Historical six-stage values remain in older decision/test history, not the active default camera. Preserve route-aware forward framing, stopped manual pan, region names and NPC interactions, and do not change classic or prototype framing.
- Human instruction 2026-10-29 supersedes the 0.6 minimum only at the current pilgrimage's authored grand vantages: cloud ridge 0.46, capital/citadel 0.38, with spatial/temporal hysteresis. Reduced Motion uses 0.6. Ordinary outdoor travel stays 0.8; field taps retain the composition and only follow at edges, while atlas walks retain route lookahead. Older modes keep their existing framing.
- Human instruction 2026-11-02 (Issue #96) refines the **current pilgrimage** camera's forward follow: preserve the Issue #86 manually panned composition until catch-up, then grow a direction-sensitive, viewport-relative lookahead on sustained walking (stronger horizontal lead in portrait, gentler vertical lead and landscape bias). Do not reintroduce 3-tile fixed lead or recenter on short taps; keep 0.8 / 0.46 / 0.38 zoom, bounds and visibility. Legacy atlas/classic/prototype remain untouched.
- Human playtest correction 2026-11-02 evening (Issue #101): **the #96 directional framing should stay, but the camera must reach it more naturally**. For the current pilgrimage, grow the lead through a five-tile smoothstep instead of a four-tile linear surge (refined after real Chromium composition feedback); soften response and bound per-frame catch-up speed relative to player movement; scale both responsiveness and speed cap with the traveller's pace so field/atlas settle to the same frame after comparable distances. Preserve the forward panned view until catch-up, short taps, the eventual lead and zoom invariants. The user's iPhone Safari feel is not verified by CI alone.

### Former earlier-phase section (verbatim)

### Earlier phase: rapid prototype iteration (2026-10-19, still applies where not overridden above)

Human instruction on 2026-10-19: defer main protection and prioritize adding and trying improvements during early development. This phase applies only to ARPG-02 and takes precedence over the per-change review/device steps below.

- Do not make Ruleset setup or old pending review/device records a prerequisite for new development. Leave the current unprotected main setting as it is; retain existing CI as feedback.
- Related small improvements may share an Issue and PR. Copy the adopted Chat request into a short scope/acceptance summary and continue without repeatedly asking for the same approval. PRs can be concise: purpose, changes, checks and remaining items.
- For low-risk and reversible medium-risk changes, independent review and iPhone playtests may be batched at a playable milestone instead of blocking every PR. Record what was deferred; do not call it tested or independently approved. Keep targeted design/review for high-risk pathfinding, cross-world or storage-contract changes.
- Use a work branch and PR, run relevant checks and report failures honestly. Merging follows the nonstop phase above; direct main push, force-push and GitHub auto-merge are still prohibited. Resume stricter release checks when the human chooses stabilization or wider distribution.


### Former release / handoff section (verbatim)

### Release / handoff

Record Issue, PR, verified commit SHA, exact executed tests, risk/audit outcome, untested behavior, live Pages result, and required iPhone steps. Main merge and repository Settings remain human controlled. The repository was renamed to **ARPG-02-retrostyle** on 2026-10-19 (Issue #3); use the current repository name and the Pages URL `https://hane-san.github.io/ARPG-02-retrostyle/`. Do not rename the display title or the `tidal-atlas:` storage namespace. Validate Pages, links, Actions and AI integrations after renaming; branch protection is still a separate GitHub Settings task.
