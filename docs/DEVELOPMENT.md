# 探索ゲーム：共通AI開発ルール

対象：`hane-san/ARPG-02-retrostyle`（旧 `fantasy-adventure-test`、2026-10-19改名済み）。独立ゲーム『潮環群島 × 星風回廊』。
SRPG・ARPGと**共通なのは手順・レビュー・権限の境界**であり、各作品のゲーム仕様は共有しない。
共通契約は `AGENTS.md`、Claude Codeの入口は `CLAUDE.md`。チャット固有のメモリは正本ではない。

## 現在の運用：初期開発を優先

2026-10-19の人間の指示により、**main保護の設定は後回し**。設定待ちで開発を止めない。既存のCIは確認用に動かし続け、GitHubの必須チェック・必須Approveを新設しない。この方針はARPG-02だけに適用する。

- 採用済みの関連改善は1つのIssue/PRにまとめてよい。Chatの依頼を目的・受入条件として短く転記し、同じ採用判断を毎回聞き直さず実装する。
- 小さく戻せる変更は、作業ブランチ→簡潔なPR（目的・差分・確認結果・残件）→人間のマージ判断で進める。テンプレートの全見出しを毎回埋める必要はない。
- lowと戻せるmediumの独立監査・iPhone試遊は、遊べる区切りでまとめて確認できる。過去の未確認記録を理由に無関係な開発を止めず、未検証の記録は残す。経路探索の基盤・世界遷移・保存契約を変えるhighは対象を絞った事前設計・レビューを維持する。
- 関連テストとCI結果は確認し、失敗や未検証を成功扱いしない。main直接push・force push・auto-mergeは引き続き行わない。
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
