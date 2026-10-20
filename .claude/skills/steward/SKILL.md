---
name: steward
description: ARPG-02-retrostyle のPR（Codex/GPT/人間/他のClaudeセッションが作ったもの）をClaude Codeが監督として受け取り、競合・CI・差分監査・記録まで進める手順。「PRを見て」「CIを直して」「夜間巡回」「監督して」と言われたときや、PRのCI・レビューのイベントを受けたときに使う。
---

# TIDAL ATLAS / 潮環群島 × 星風回廊（2D探索） のPR監督

正本は `CLAUDE.md` → `AGENTS.md` / `docs/DEVELOPMENT.md`。このスキルはそれを実行する手順で、矛盾したら正本が勝つ。
現在は**初期開発（rapid prototype）**。low・戻せるmediumの独立監査とiPhone試遊は遊べる区切りへまとめてよい（未実施と明記）。経路探索・世界遷移・保存契約のhighは事前設計と重点レビューを省かない。

## 権限の境界（どのPRでも同じ）

- mainへ直接push・force-push・rebaseによる履歴の書換え・auto-merge・PRの承認(Approve)・マージをしない。main統合はいつも人間。
- GitHubのSettings・Ruleset・Secrets・Pages設定・リポジトリ名・表示名・保存キーを変えない。
- 他の人やAIのブランチを直すときは、最新mainを **merge commit** で取り込む（rebase・amendしない）。
- 承認されていない仕様（新しいマップ・数値・演出・物語・ルール・課金・保存）を、PRの「ついで」で足さない。必要なら提案Issueを書いて人間に返す。
- トークン・個人のチャット・ローカルのスクリーンショットや `test-results/` をコミットしない。

## 1本のPRを監督する手順

1. **現在地**：`git fetch origin`、PRのhead SHA・base・対応Issue・作成者（Codex/GPT/人間/Claude）を確認。Issueが無い・採用根拠が書かれていないPRは、コメントで「採用根拠の確認待ち」と人間に返し、仕様の中身を推測で補わない。
2. **競合**：mainと競合していれば、PR headへmainをmergeして解消し、関係するテストを再実行してからpush。両側が同じロジックを変えて片方の振る舞いを失う場合は、直さず人間へ質問。
3. **CI**：`rules` / `browser`（このrepoのジョブ名は下）を確認。赤ければ原因をこのPRの差分の中で特定して直す。「たまたま失敗」は原因にしない。再実行は1回まで。テストのスキップ・削除・弱体化で緑にしない。
4. **差分の監査**：下の「リスクの見分け方」で low/medium/high を決め、AGENTS.mdの不変条件を1つずつ照合。PR作成者がClaudeでなければ、このレビューを**独立監査**として記録できる。Claude自身のコミットが入ったPRでは「自己確認」と書き、独立監査と呼ばない。
5. **直してよい範囲**：CI失敗・明白なバグ・テスト追加・誤字・PRの目的の範囲内の小修正は、そのPRのブランチへ直接pushしてよい。設計を変える提案（ファイル横断のリファクタリング、仕様・数値・API・保存形式の変更）はコメントで提案し、人間かPR作成者に判断を返す。
6. **記録**：PRへ1件のコメントで、次の形で残す（PASS/WARN/BLOCKは報告語で、CIや人間承認の代わりにならない）。

```
## Claude監督レビュー
- 判定：PASS / WARN / BLOCK（リスク：low/medium/high、独立監査 or 自己確認）
- 対象SHA：<sha>
- 実行したテスト：<コマンドと結果>
- 不変条件の照合：<破れていない/破れている項目>
- 直したこと：<push したコミット、なければ「なし」>
- 未検証：iPhone実機・WebKit・実耳 など
- 人間に決めてほしいこと：<なければ「なし」>
- 試遊項目：<iPhoneで見る操作>
```

7. **引継ぎ**：PRが人間の判断待ちになったら、それ以上の変更はしない。次の巡回でmain・CI・レビューが変わった時だけ再び動く。

## 夜間巡回（スケジュール実行で使うとき）

1. 開いているPRを古い順に全部見る。各PRで上の手順1〜7。1PRの作業が長引いても、他のPRの状態確認は必ず済ませる。
2. 開いているPRが無い・全部が人間待ちなら、`docs/ROADMAP.md` の未完了項目（`[ ]`）とIssueのうち、**人間が採用済みと明記したもの**だけを1件選び、`claude/<issue>-<topic>` ブランチ→PRで進める。採用済みが無くても、既存の仕様どおりに動かない明白な不具合（重なり・押せない・エラー・テストの穴）は、Issue→修正PRにしてよい。新しい体験・仕様の思いつきは「提案Issue」に留め、実装しない。
3. 朝の報告は、PRごとに「判定・対象SHA・直したこと・人間に決めてほしいこと・試遊項目」を1行ずつ。成功していないものを成功と書かない。

## このrepoの検査

CIのジョブ：`Atlas checks` の `rules` / `browser`

```sh
npm run check            # 構文 + 決定論テスト（Node 22+）
npm run test:browser     # Chromium（クラウドではSessionStartフックがplaywrightとCHROMIUM_EXECUTABLEを用意）
```

## リスクの見分け方

| リスク | このrepoでの例 |
|---|---|
| low | docs、文言、`dialogue-data.js` / `silk-dialogue.js` の誤字 |
| medium | `game.js` のUI・入力、`camera-limits.js`、`style.css` / `journey.css`、音（`music.js` `audio.js` `zone-music.js` `silk-music.js` `journey-*`）、単一の地形パッチ、ドット絵 |
| high | `world.js` / `silk-world.js` / `journey-world.js` / `prototype-world.js` の経路探索・水域・橋・ワープ、世界の切替、`tidal-atlas:` 保存キー |

## 監査で必ず照合する不変条件（要約。詳細はAGENTS.md）

- 2つの世界（164×120 / 430×270）、START(41,40)、橋(45,40)/(160,38)→大陸(28,146)、24施設・25NPCの到達性、水と建物を通らない経路。
- 巨大湖は歩けない水のまま。カメラは静止優先・主人公可視・移動中ズーム禁止。
- 68曲と地区選曲、BGM既定OFF・SE既定ON・音で移動を止めない。
- `tidal-atlas:` 保存名、戦闘・クエスト・セーブなし、CDN・外部音源なし。
- 既定入口 `./` は2世界のまま。`?prototype=1` と `?journey=1` は別モード。
