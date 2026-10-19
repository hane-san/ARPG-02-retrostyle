# 品質検証・判定基準

初期開発では既存CIを確認用に維持し、main保護や必須Approveを新設しない。low/戻せるmediumの独立監査・iPhone試遊は遊べる区切りでまとめ、毎PRの前提にしない。失敗・未検証は明記する。適用範囲は[DEVELOPMENT](DEVELOPMENT.md)の現在の運用を参照。

## CI（GitHub Actions）

- `rules`: Node.js 22で `npm run check`。構文解析と `tests/*.test.mjs` の地形・可達性・カメラ・音楽・会話検証（2026-10-19基準31件）。
- `browser`: Chromium + Playwright 1.57.0。実際のroot版index.htmlを起動して、読み込み・初期UI・68曲の音楽室・スタート地点近くの小橋をタップして星風回廊へ移動する操作を検査。続けて `?prototype=1` の4施設表示・2地区の地図・森→旧港の徒歩移動・通常版へのリンクを検査。
- CI成功は機械テストの成功のみ。人間の採用判断・独立監査・iPhone実機試遊の代わりにならない。

## ローカル

```sh
npm run check
npm install --no-save --package-lock=false playwright@1.57.0
npx playwright install chromium
npm run test:browser
```

ブラウザテストは内部でPython静的サーバーを開くため、先に `npm run dev` を同じポートで起動しない。
予期せぬ失敗ではブラウザスクリーンショットを `test-results/` に保存する（Gitに入れない）。CIは失敗時の添付のみ。

## GitHub Pages改名後の公開確認

- 新しいURLは **https://hane-san.github.io/ARPG-02-retrostyle/**。GitHubのPagesデプロイActionは成功しているが、実際のSafari起動・リソース取得は未検証。
- 旧 `fantasy-adventure-test` のPages URLの自動転送は前提にしない。ホーム画面・ブックマークを新URLへ更新する。
- `tidal-atlas:` のlocalStorageプレフィックスは改名しても維持。別パスでの起動でも同じ `hane-san.github.io` オリジンならブラウザ側の設定共有が見込まれる。

## iPhone Safari 実機で確かめること

1. 画面開始位置から東約4マスに小橋が見え、タップすると星風回廊へ渡れるか。
2. マップ・会話・場所への徒歩移動、橋の往復、施設の入口で正しく止まるか。
3. カメラが指に対して滑らかか、主人公が画面外に出ないか、移動中ピンチズームが効かないか。
4. 湖・トンネル・砂漠・草原の見え方と、湖が十分大きいか。
5. BGMをONにして地区切替時の音切れ・ノイズ・足音の大きさを実耳で確認。スピーカー/イヤホン別も有益。
6. 既存GitHub Pages URLが開き、Safariの再訪でも更新が反映されるか。
7. `?prototype=1` で小さな旅を開き、4施設訪問と森→旧港の移動・会話を確認。ヘルプから通常版へ戻り、2世界の橋を維持しているか確認。
8. BGM/SEの設定を変えて再訪し、`tidal-atlas:`の設定保持を確認。ゲーム進行のセーブ機能は未実装。

実測していない項目は**未検証**と記載。シミュレーションだけで「iPhoneで動いた」「音切れゼロ」と表現しない。
