# 探索ゲーム：共通AI開発ルール

対象：`hane-san/ARPG-02-retrostyle`（旧 `fantasy-adventure-test`、2026-10-19改名済み）。独立ゲーム『潮環群島 × 星風回廊』。
SRPG・ARPGと**共通なのは手順・レビュー・権限の境界**であり、各作品のゲーム仕様は共有しない。
共通契約は `AGENTS.md`、Claude Codeの入口は `CLAUDE.md`。チャット固有のメモリは正本ではない。

## 現在の運用：ノンストップ試作（2026-10-21〜、人間の指示）

アイデアをどんどん投げて、変わっていく様子をその日のうちに遊ぶ段階。安定化へ切り替えると人間が決めるまで、この節が下の「人間がマージする」手順より優先する。

- **毎日15時ごろ（日本時間）の昼ラン**：Claude Codeが ARPG-02 と SRPG の開いているIssue・PRを監査→修正→実装→**マージ**→Pages確認まで進める。手順は `.claude/skills/steward/SKILL.md` の「毎日15時の昼ラン」。
- **採用済みの扱い**：持ち主のアカウント（GPTやCodexが代理で作ったものを含む）が作ったIssue・PRは採用済み。ただしタイトルが「提案」で始まるもの、本文に「未採用」「保留」「マージ保留」とあるもの、`hold` / `proposal` ラベル付きは実装・マージしない。
- **マージの条件**（最新head SHAで全部）：Actionsの `rules` / `browser` 成功、最新mainと衝突なし、昼ランの監査でBLOCKなし、`hold` ラベルなし。PRの通常のmerge commitで統合し、mainのActionsとPagesを確認。壊れたら同じランでrevert PRを作ってマージする。
- **人間の確認は夕方の試遊にまとめる**：独立監査・iPhone実機は未実施として記録し、済んだとは書かない。止めたいPRには `hold` ラベルを付ける。
- **引き続き禁止**：mainへ直接push、force-push・履歴の書換え、GitHubのauto-merge機能、PRのApprove、Settings変更、テストの削除・弱体化、repo名・表示名・保存キーの変更、他のリポジトリの操作。
- マージするのは昼ランだけ。明け方の巡回や他のセッションは、レビューとPRブランチの修正までで、マージしない。
- **1日のループ**：朝・昼にGPTチャットへ改善点を投げる（GPTがIssue・小PRを作る）→ 15時ごろの昼ランがClaudeでゲームに反映してマージ → 夕方にPagesで遊ぶ → 夜に抽象的な改善やシナリオの方向性をGPTチャットで議論してIssue化し、Codexが夜のうちにちゃんとしたPRへ整える（Codexはマージしない）→ 翌日15時の昼ランが、夜のCodex PRと朝・昼のIssue/PRをまとめて総論的に調整してマージ。
- シナリオ・世界観の方向性は `docs/DIRECTION.md`（最初に必要になったPRで作る）にまとめる。方向性のPRは文書だけでもよく、昼ランはそれをマージし、はねさんが採用した部分だけを実装する。

## 以前の運用：初期開発を優先（2026-10-19。上の節と矛盾しない範囲で有効）

2026-10-19の人間の指示により、**main保護の設定は後回し**。設定待ちで開発を止めない。既存のCIは確認用に動かし続け、GitHubの必須チェック・必須Approveを新設しない。この方針はARPG-02だけに適用する。

- 採用済みの関連改善は1つのIssue/PRにまとめてよい。Chatの依頼を目的・受入条件として短く転記し、同じ採用判断を毎回聞き直さず実装する。
- 小さく戻せる変更は、作業ブランチ→簡潔なPR（目的・差分・確認結果・残件）→人間のマージ判断で進める。テンプレートの全見出しを毎回埋める必要はない。
- lowと戻せるmediumの独立監査・iPhone試遊は、遊べる区切りでまとめて確認できる。過去の未確認記録を理由に無関係な開発を止めず、未検証の記録は残す。経路探索の基盤・世界遷移・保存契約を変えるhighは対象を絞った事前設計・レビューを維持する。
- 関連テストとCI結果は確認し、失敗や未検証を成功扱いしない。main直接push・force push・auto-mergeは引き続き行わない（マージは上の昼ランだけ）。
- 厳格な保護・毎回の実機受入へ戻す時期は、安定化や公開範囲を広げる段階で人間が決める。以下の標準手順は、この初期開発方針に従って適用する。

## 1. 作業開始・前提確認

1. `git status --short`、`git log -5 --oneline`、`git fetch origin`。他者の未コミット変更は消さない。
2. AGENTS・DESIGN・DECISIONS・ROADMAP・QAと対象Issueを読む。既存のIssue/PRも確認して編集衝突を避ける。
   通常版と小さな旅は同じソースを使うため、[PROTOTYPE](PROTOTYPE.md)の不変条件と統合後の未確認事項も読む。
3. `npm run check` を実行し、既知の失敗と新規失敗を区別する。
4. `git switch -c type/ISSUE-topic origin/main`。main直書き、force push、auto mergeは禁止。

## 2. Chat → Issue → 実装 → PR → 監査 → 試遊 → main

1. **採用判断**：人間の明示採用をIssueに残す。提案・保留・過去の仕様・未検証を混同しない。
2. **Issue**：目的、範囲、実装してはいけない要素、肯否が確認できる受入条件、リスク、関連ファイル、再現・試遊条件を記載。
3. **AI実装**：Codex/Claude Code/Sonnet等を利用枠・環境・具体的タスクで選択。名前は固定バージョンでなく役割。複数実装者は変更予定ファイルをPR/Issueで調整。
4. **PR**：Issueをリンクし、変更点、対象外、テスト結果、環境、SHA、ブラウザ/iPhone未検証、独立監査と試遊項目を書く。ブランチだけをpushする。
5. **CI**：PRで `rules`（Node syntax・決定論的テスト）と `browser`（Chromiumの起動・UI・近道橋の渡航）が両方成功すること。
6. **独立監査**：安定化時の標準はlow＝限定文言/資料で省略可（理由明記）、medium＝UI・カメラ・BGM・NPC・単一地形は別担当/別セッション、high＝地形・経路・クロスワールド状態や将来の保存等は事前設計と深い監査（必要なら利用可能なOpusへ上申）。現在の初期開発では上記のlow/戻せるmediumのまとめ確認を適用する。担当者本人のセルフチェックは独立監査ではない。担当や実機を確保できなければ未検証として引き継ぎ、PASSと書かない。
7. **人間が試遊・採否判断**：初期開発では遊べる区切りにまとめる。特にiPhone Safariで移動・ドラッグ・ズーム禁止・BGMと足音・2本の橋・湖の印象をチェック。
8. **main統合/Pages確認**：人間の最終承認後にのみPRをマージ。ビルド完了・Pages表示・操作確認・SHAを記録。

監査所見には「PASS/WARN/BLOCK、対象SHA、手順・期待/実際、根拠、実施テスト、未確認、修正案、人間の試遊項目」を記録する。**これはGitHub Actionsの必須ステータスとは別**。監査未実施なら完了と書かない。

## 3. 実行と環境

Node.js 22+、Python 3.12、GitHub Pages。アプリに本番npm依存・外部CDN・バックエンドはない。
```sh
npm run dev              # python3 -m http.server 4173
npm run check            # syntax + deterministic Node tests
npm run test:browser     # Playwright installed separately (see QA)
```

Chromium検査は一時的に `npm install --no-save --package-lock=false playwright@1.57.0` と `npx playwright install chromium` が必要。CIは別ジョブで依存をインストール。iPhone本体とタッチ模擬は同一視しない。
**dist生成は不要**。公開時はrootの `index.html` が入口。移動・会話・音楽等を変えても独立した他ゲームの `main` や依存元は変更しない。

## 4. 実装境界

- `world.js`、`silk-world.js`：地形、遮断、水域、道、施設、NPC、橋、ワープ接続・A*。
- `prototype-world.js`：通常版の座標系を保つ80×110の切り出し。4施設・4NPC・2地区、通常版と共通の経路探索。小さな旅の詳細と未確認の独立監査は[PROTOTYPE](PROTOTYPE.md)。
- `game.js`：描画、タッチ/マウス/キー、NPC会話、UI、世界切替、カメラ統合。
- `camera-limits.js`：物理的なカメラの可視範囲、パン/追従の時間依存補間。
- `music.js`、`audio.js`、`zone-music.js`、`silk-music.js`：曲生成、合成、スケジューリング、クロスフェード、選曲、効果音。
- `scenic-biomes.js`、`silk-art.js`、`sprite-srpg.js`：32px基準の手描き風ドット絵。
- `dialogue-data.js`、`silk-dialogue.js`：会話・施設の叙述。名称と設定が分離している場合は矛盾を確認。
- `tests/`：決定論テストと最小のブラウザ検査。テストのために本番アプリへ公開デバッグAPIを追加しない。

実機挙動、音切れの完全な解消、カメラの体感はNodeテストだけでは保証しない。音声再生には利用者操作によるWeb Audioアンロックが必要。

## 5. 後日行うGitHubの管理画面操作（現在は保留）

以下のmain保護は初期開発では設定せず、開発やPR統合の前提にしない。安定化段階で再検討するため手順を保持する。これはファイル追加やPR作成だけでは有効にならない。

1. **Settings → Rules → Rulesets → New ruleset → New branch ruleset**。名前 `main-protection`、Enforcement statusは **Active**。Target branchesの **Add target → Include by pattern** に `main` を入力（`refs/heads/main`に一致）。Bypass listは空。**Require a pull request before merging**（required approvalsは0）、**Require status checks to pass**で成功したPRの **`rules` / `browser`**（GitHub Actions）を追加し、**Require branches to be up to date before merging**を有効化。**Block force pushes** と **Restrict deletions**も有効化して保存。これは文書の追加だけでは設定されない。
   2026-10-19確認ではRulesetsは0件、mainはprotected=false（[Issue #5](https://github.com/hane-san/ARPG-02-retrostyle/issues/5)）。設定後はmainの有効ルールを読み取り確認する。失敗CIの遮断を実地確認する場合は別Issue・専用PRで行い、mainへの試験pushや意図的な失敗PRのマージはしない。他repoの成功例はこのrepoの設定済み証拠にはならない。
2. **Settings → Pages**：改名後の新URL `https://hane-san.github.io/ARPG-02-retrostyle/` を確認する。GitHub ActionsのPagesデプロイは成功しているが、実機で新URLを開く確認は別。
3. **Codex / Claude Code / GitHub**：このrepoだけを個別に接続・有効化。AIの独断でmainを変更しない権限ルールを優先する。
4. **リポジトリ改名（Issue #3）**：第三ゲームのGitHub名は `ARPG-02-retrostyle` として**改名済み**（参照修正PR #4も統合済み）。元の `fantasy-adventure-test` とGit履歴・Issue・PRは同一リポジトリで引き継ぎ済み。Pages URL・相対リンク・外部連携・設定/保存キー影響を確認する。別repoの現在名は `SRPG-01-FEstyle` / `ARPG-01-SkyrimStyle`。本作のためにそれらを変更しない。

## 6. 引き継ぎ

次のAIには Issue URL・作業ブランチ・PR・Git SHA・CI URL・実施/未実施・残るリスク・試遊項目を渡す。誰かのローカルトークンやチャット全文は保存しない。

## Claude Codeによる監督・夜間巡回

Codex/GPT等が作ったPRをClaude Codeが受け取るときの手順（競合→CI→差分監査→1件の記録コメント→人間待ち）と、夜間巡回の範囲は `.claude/skills/steward/SKILL.md`。クラウドのセッションでは `.claude/hooks/session-start.sh` がブラウザ検査の依存を用意する。マージ・承認・Settings変更はしない。

昼ラン：毎日15時ごろ（日本時間）に、ARPG-02とSRPGの採用済みIssue・PRを監査・実装・マージする（2026-10-21 採用、上の「ノンストップ試作」）。

明け方の巡回：毎日4:12（日本時間）に、専用セッション「明け方の監督巡回（独立監査担当）」が5つのリポジトリのPRを、このスキルの手順で見回る（2026-10-20 採用）。
