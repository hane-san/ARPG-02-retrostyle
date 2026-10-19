# 探索ゲームの残課題

## 現時点
- [x] 既存ゲームの独立リポジトリ化（`fantasy-adventure-test`）。SRPGやARPGとは別でGitHub Pages公開済み。
- [x] 2つの世界、近道橋・遠方橋、地区曲68曲、スムーズなカメラ。
- [ ] 開発手順・文書・テンプレート・ブラウザCIの導入（Issue #1 のPRで検証中）。
- [ ] 人間のiPhone実機試遊：起動、両方向の橋、NPC会話、ズーム禁止、カメラ、音切れ。
- [ ] 人間のGitHub Settings：main ruleset必須PR / rules / browser / force push禁止 / deletion禁止。効果確認。
- [x] 第三ゲームの正式GitHubリポジトリ名を `ARPG-02` に決定（2026-10-19）。ゲーム内タイトルは変更しない。
- [ ] Issue #3：本人がSettingsでrepoを `ARPG-02` に改名し、Pages・資料・AI連携・設定互換性を確認。PR #2の統合後に実施。

## 今後の改善候補（未採用）
- 任意のホーム画面アイコン / PWA manifest。既存の公開URLやService Workerのキャッシュに注意。
- ブラウザ実機に近い追加のカメラ・Web Audio検査（自動化には限界）。
- 設定/発見履歴セーブ（互換・リセット方針の検討が必要）。

候補はIssueとして提案し、人間が採用するまで実装しない。
