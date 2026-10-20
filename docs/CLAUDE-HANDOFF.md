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
