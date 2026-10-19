# 探索ゲーム：共通AI開発ルール

対象：`hane-san/ARPG-02-retrostyle`（旧 `fantasy-adventure-test`、2026-10-19改名済み）。独立ゲーム『潮環群島 × 星風回廊』。
SRPG・ARPGと**共通なのは手順・レビュー・権限の境界**であり、各作品のゲーム仕様は共有しない。
共通契約は `AGENTS.md`、Claude Codeの入口は `CLAUDE.md`。チャット固有のメモリは正本ではない。

## 1. 作業開始・前提確認

1. `git status --short`、`git log -5 --oneline`、`git fetch origin`。他者の未コミット変更は消さない。
2. AGENTS・DESIGN・DECISIONS・ROADMAP・QAと対象Issueを読む。既存のIssue/PRも確認して編集衝突を避ける。
3. `npm run check` を実行し、既知の失敗と新規失敗を区別する。
4. `git switch -c type/ISSUE-topic origin/main`。main直書き、force push、auto mergeは禁止。

## 2. Chat → Issue → 実装 → PR → 監査 → 試遊 → main

1. **採用判断**：人間の明示採用をIssueに残す。提案・保留・過去の仕様・未検証を混同しない。
2. **Issue**：目的、範囲、実装してはいけない要素、肯否が確認できる受入条件、リスク、関連ファイル、再現・試遊条件を記載。
3. **AI実装**：Codex/Claude Code/Sonnet等を利用枠・環境・具体的タスクで選択。名前は固定バージョンでなく役割。複数実装者は変更予定ファイルをPR/Issueで調整。
4. **PR**：Issueをリンクし、変更点、対象外、テスト結果、環境、SHA、ブラウザ/iPhone未検証、独立監査と試遊項目を書く。ブランチだけをpushする。
5. **CI**：PRで `rules`（Node syntax・決定論的テスト）と `browser`（Chromiumの起動・UI・近道橋の渡航）が両方成功すること。
6. **独立監査**：low＝限定文言/資料で省略可（理由明記）。medium＝UI・カメラ・BGM・NPC・単一地形。high＝地形・経路・クロスワールド状態や将来の保存等。medium以上は別担当/別セッションにレビュー。highは事前設計と深い監査。担当者本人のセルフチェックは独立監査ではない。
7. **人間が試遊・採否判断**：特にiPhone Safariで移動・ドラッグ・ズーム禁止・BGMと足音・2本の橋・湖の印象をチェック。
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
- `game.js`：描画、タッチ/マウス/キー、NPC会話、UI、世界切替、カメラ統合。
- `camera-limits.js`：物理的なカメラの可視範囲、パン/追従の時間依存補間。
- `music.js`、`audio.js`、`zone-music.js`、`silk-music.js`：曲生成、合成、スケジューリング、クロスフェード、選曲、効果音。
- `scenic-biomes.js`、`silk-art.js`、`sprite-srpg.js`：32px基準の手描き風ドット絵。
- `dialogue-data.js`、`silk-dialogue.js`：会話・施設の叙述。名称と設定が分離している場合は矛盾を確認。
- `tests/`：決定論テストと最小のブラウザ検査。テストのために本番アプリへ公開デバッグAPIを追加しない。

実機挙動、音切れの完全な解消、カメラの体感はNodeテストだけでは保証しない。音声再生には利用者操作によるWeb Audioアンロックが必要。

## 5. 人間が行うGitHubの管理画面操作

SRPG／ARPGの既存設定に準拠。これは権限上、ファイル追加やPR作成だけでは有効にならない。

1. **Settings → Rules → Rulesets → New branch ruleset**。名前 `main-protection`、対象 `main`、Active、Require pull request、Block force pushes（non-fast-forward）、Restrict deletions、Require status checksを設定。必須ジョブ名は成功したPRから **`rules` / `browser`** を選択。Strict（mainへの追従必須）。他人のApproveを必須にして個人開発が詰まらないようレビュー数0。実際に拒否されることまでテスト。
2. **Settings → Pages**：改名後の新URL `https://hane-san.github.io/ARPG-02-retrostyle/` を確認する。GitHub ActionsのPagesデプロイは成功しているが、実機で新URLを開く確認は別。
3. **Codex / Claude Code / GitHub**：このrepoだけを個別に接続・有効化。AIの独断でmainを変更しない権限ルールを優先する。
4. **リポジトリ改名（Issue #3）**：第三ゲームのGitHub名は `ARPG-02-retrostyle` として**改名済み**。元の `fantasy-adventure-test` とGit履歴・Issue・PRは同一リポジトリで引き継ぎ済み。Pages URL・相対リンク・外部連携・設定/保存キー影響を確認する。既存の `SRPG` / `ARPG` の改名は対象外。

## 6. 引き継ぎ

次のAIには Issue URL・作業ブランチ・PR・Git SHA・CI URL・実施/未実施・残るリスク・試遊項目を渡す。誰かのローカルトークンやチャット全文は保存しない。
