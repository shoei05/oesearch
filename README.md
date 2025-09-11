# OpenEvidence Search Helper (MV3)

OpenEvidence（https://www.openevidence.com/ ）向けに、検索語の末尾へ英語プロンプトを自動付与して検索するChrome拡張です。

拡張機能はこちらから追加できます。
https://chromewebstore.google.com/detail/openevidence-search-helpe/odkpiebgplcfjbljjokafdlfcjkplcfj?authuser=0&hl=ja

既定の付与文:

```
Provide a comprehensive explanation drawing on systematic reviews and meta-analyses (SR/MA), and list recommendations according to the GRADE system.
```

## 機能
- Omnibox: アドレスバーで `oe` → スペース → 検索語 → Enter。
- コンテキストメニュー: テキスト選択 → 右クリック → "Search OpenEvidence…"。
- ポップアップ: 拡張アイコンから検索。OpenEvidence に開いて検索欄へ自動入力し、ボタンを自動クリックします。
- オプション: 付与する英文（末尾プロンプト）を変更可能。
- 日本語 IME 対応: ポップアップ入力で変換確定中の Enter は送信しません。

## インストール（手元 / Unpacked）
1. Chrome を開き `chrome://extensions` へ。
2. 右上の「デベロッパーモード」を ON。
3. 「パッケージ化されていない拡張機能を読み込む」→ `openevidence-search-helper` フォルダを選択。

## 使い方
- Omnibox: `oe influenza vaccination pregnancy` など。新しいタブで検索結果が開きます。
- 右クリック: ページ上で語句を選択 → 右クリックメニューから実行。
- ポップアップ: テキストボックスに入力して Search。歯車リンクからオプションを開いてカスタマイズ可能。

## 実装メモと仕様変更
- `background.js`: OpenEvidence を常に新規タブで開き、URL パラメータ `oe_q` にクエリ（付与英文込み）を付けて渡します。これにより `tabs` 権限なしで動作します。
- `content-oe.js`: URL パラメータ `oe_q` を読み取り、テキストエリアへ設定して送信。SPA 遅延に備えてリトライあり。IMEガードはオプションでON/OFF。
- `popup.html` / `popup.js`: シンプルな入力ボックスのみ。IME 変換中の Enter は無視。検索はバックグラウンドではなく、URL パラメータ経由で渡します。
- `options.html` / `options.js`: 付与文とIMEガード設定を `chrome.storage.sync` に保存。

> Note: マニフェストの `icons` は省略しています（任意）。必要なら `icons/` に PNG を置き、`manifest.json` の `icons` フィールドを追加してください。

### 既知の注意点
- OpenEvidence がログイン必須の場合、ログイン後に自動入力・自動クリックが行われます（ログイン画面では実行されません）。
