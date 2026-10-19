# 探索ゲームの残課題

## 現在の優先順位

初期開発の速度を優先する（2026-10-19の人間の追加指示）。main保護は保留。関連改善をまとめたIssue/PRと既存CIで進め、low/戻せるmediumの監査・実機試遊は遊べる区切りへまとめる。下記の未確認事項は、無関係な開発を止める前提条件ではない。

## 現時点
- [x] 既存ゲームの独立リポジトリ化と正式名への改名（`fantasy-adventure-test` → `ARPG-02-retrostyle`）。SRPG・ARPGとは別のGitHubリポジトリ。
- [x] 2つの世界、近道橋・遠方橋、地区曲68曲、スムーズなカメラ。
- [x] 開発手順・文書・テンプレート・ブラウザCIの導入（Issue #1 / PR #2 マージ済み、両ジョブ成功）。
- [x] 小さな旅の任意モード `?prototype=1` を実装・統合（Issue #6 / PR #7）。通常版は維持。既定入口の変更は未採用。
- [x] 改名後の資料修正PR #4を統合済み。現行mainから共通開発導線を同期（Issue #8）。
- [ ] 統合済みPR #7の別担当監査・iPhone試遊の証拠を確認し、なければ[PROTOTYPE](PROTOTYPE.md)の依頼で追跡する。GitHubレビュー一覧は空で、CIや自己確認は代替にならない。
- [ ] 人間のiPhone実機試遊：起動、両方向の橋、NPC会話、ズーム禁止、カメラ、音切れ。
- [ ] 【保留・安定化時に再検討】人間のGitHub Settings：main ruleset必須PR / rules / browser / force push禁止 / deletion禁止。効果確認（Issue #5）。現在は設定せず、開発・PR統合の前提にしない。
- [x] 第三ゲームの正式GitHubリポジトリ名を `ARPG-02-retrostyle` に決定・改名済み（2026-10-19）。ゲーム内タイトルは変更しない。
- [ ] Issue #3：改名後の新Pages URL `https://hane-san.github.io/ARPG-02-retrostyle/` をiPhone Safariで実機確認し、Codex/Claude連携・設定互換性を確認。GitHub ActionsのPagesデプロイは成功済み。

## 今後の改善候補（未採用）
- 任意のホーム画面アイコン / PWA manifest。既存の公開URLやService Workerのキャッシュに注意。
- ブラウザ実機に近い追加のカメラ・Web Audio検査（自動化には限界）。
- 設定/発見履歴セーブ（互換・リセット方針の検討が必要）。

候補はIssueとして提案し、人間が採用するまで実装しない。
