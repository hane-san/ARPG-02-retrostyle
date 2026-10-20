# Claude受渡し：ARPG-02（2026-10-20）

正本は現在のorigin/main、CLAUDE.md → AGENTS.md / DEVELOPMENT.md。通常版 `./`、台場ミニ `?prototype=1`、草原湖 `?journey=1` は別モード。既定入口の変更、戦闘・クエスト・進行保存は未採用。

## 整理した範囲

- PR #10（初期開発運用）、#13（アイコン）、#15（草原湖）は統合済み。#15のmergeは `14ea85b3fdceb6a730e1da462816f10d0e96275d`。README等の古い未統合案内を同期。
- Issue #16は二本指→片指→二本指の例外、pinch残指のパン化、キャンセル済み指の遅い解放、resize/blur/背景化の入力残留を修正。パン目標再制限と静止時のカメラ跳ねも対象。
- 7件の新規Node境界テストは実際のgame.jsのlistener/animation部分をDOMスタブで実行する。本番デバッグAPIは追加しない。最初の4入力テストは修正前に失敗を確認。ブラウザではCDPの実touchStart/Move/End/Cancelと画面回転を三モードで実行し、キャンセル後に下部メニューが勝手に開かないことも検証する。
- 地形・経路基盤・歩行速度6.15・ズーム0.66〜2.5・移動中ズームロック・世界接続・`tidal-atlas:`・既存68曲を維持。

## 検証を区別する

`npm run check` と `npm run test:browser`（既存の長い徒歩・NPC・遠望・音声波形・UIと新入力検査）。任意の `CHROMIUM_EXECUTABLE` はローカルの対応実行ファイル用で、CIは従来のPlaywright付属Chromiumを使う。対象SHA・実行結果・独立監査・mainとPagesは今回のPRとIssue #16の最新コメントを読む。自己確認を独立監査と呼ばず、ChromiumをiPhone実機と呼ばない。

## 残っているもの

- iPhone Safari：実際のpinch・画面回転・背景復帰・歩き終わり・下部UI・スピーカー/イヤホン・描画負荷。
- Issue #11は企画検討。移動中ズーム解除・遠景モード・新しい速度/倍率/地図公開ルールは未採用。今回の修正を理由に導入しない。
- Issue #5のmain保護は意図的保留。独立した初回Claude接続を試すためにRulesetや新自動化を作らない。

Claudeの最初の作業は最新main SHAと未処理PRを再取得し、この修正の差分と既存JOURNEY-REVIEWの対象を照合すること。既に終わったPRを再実装せず、実機で残った具体的な不具合があれば1つのIssueから扱う。

## 2026-10-20 Claude Code初回点検の結果

- 対象main `2c2b98ecf6588bd7c2a9d7d119ef5d03efbbe808`、未処理PR 0。`npm run check` 53/53、main CIとPages配信の成功を確認。公開ページの直接取得はクラウド環境のネット設定で未確認。
- 重大1件：近道の小橋 (45,40) を通過するだけの経路で星風回廊へワープする（Issue #18、修正PR #19）。経路探索の結果は検査済みだったが、途中で入口を踏むかは未検査だった。
- 小さな残件：PR #17の回転後クリック抑止はclickの `pointerId` に依存し、Safariでの効き目は未確認。iPhoneの消音スイッチ中はWeb Audioが鳴らない可能性。旧2モードの歩行中の行き先変更で絵が1マス弱斜めに動く既存挙動。
- `game.js` に入力・カメラ・会話・描画・3モード分岐が集まる。`game.js` を変えるPRは同時に1本とし、並行作業の衝突を避ける。

## 分担と夜間点検

- 人間：採用・iPhone試遊・main統合。ChatGPT：企画とIssue化。Claude Code：高リスクの修正計画、他担当のPRの独立監査、全体整合。Codex／Claude Code（第二ライン）：実装。作った担当と別の担当・別セッションが監査する。
- `.claude/settings.json` は読取・検査コマンドだけを許可する。push・削除・設定変更は許可しない。
- 夜間点検は人間の承認（2026-10-20）による定期タスク。毎晩、新しいセッションで未処理PRとCIを読み、対象SHAごとにPASS/WARN/BLOCK・実行テスト・未検証・iPhone試遊項目をPRへ記録する。同じSHAの再監査はしない。マージ・main直接push・force-push・auto-merge・Settings変更・新機能の実装はしない。未処理PRがなければ何もせず終わる。
