# OpenEvidence Search Helper — Tester Guide (EN/JA)

This guide helps you install and test the pre‑release build from GitHub Releases.

## 1) Download (from Releases)
- URL: https://github.com/shoei05/oesearch/releases
- Download asset: `oesearch-mv3.zip`

## 2) Install (Unpacked) — Chrome
- Open `chrome://extensions`.
- Toggle on “Developer mode” (top‑right).
- Click “Load unpacked” and select the unzipped folder of `oesearch-mv3.zip` (the folder that contains `manifest.json`).

## 3) What to test
- Popup search:
  - Click the toolbar icon → type any query (JP/EN) → “Search”.
  - Confirm: new tab opens `openevidence.com`, the query plus the English SR/MA + GRADE prompt is auto‑filled once, and the search button auto‑clicks.
- IME behavior (Japanese):
  - While composing (かな漢字変換中), hitting Enter should NOT submit. After composition ends, Enter submits.
- Context menu:
  - Select text on any page → right‑click → “Search OpenEvidence…”.
  - Confirm the same auto‑fill + submit behavior.
- Omnibox:
  - In the address bar, type `oe` + space + your query → Enter.
- No duplicate prompt:
  - The appended English prompt must appear only once in the search box.

## 4) Options
- Click the extension icon → “Customize appended prompt…”
- Edit the English prompt and save. Try searching again to confirm it’s applied.

## 5) Known notes
- If OpenEvidence requires login, log in first; the auto‑fill + submit will work after the page loads.
- Site support is limited to `https://openevidence.com/` and `https://www.openevidence.com/`.

## 6) Feedback / Issues
- Please report problems or suggestions here: https://github.com/shoei05/oesearch/issues

---

# OpenEvidence Search Helper — テスター向け手順（日本語）

GitHub Releases からプレリリースの ZIP を入れて動作確認する手順です。

## 1) ダウンロード
- URL: https://github.com/shoei05/oesearch/releases
- 取得ファイル: `oesearch-mv3.zip`

## 2) インストール（手動 / Unpacked）
- Chrome で `chrome://extensions` を開く。
- 右上の「デベロッパーモード」を ON。
- 「パッケージ化されていない拡張機能を読み込む」→ `oesearch-mv3.zip` を解凍してできたフォルダ（`manifest.json` が直下にある）を選択。

## 3) テスト観点
- ポップアップ検索:
  - ツールバーのアイコン → 検索語（日本語/英語）を入力 → “Search”。
  - 期待: 新規タブで `openevidence.com` が開き、検索欄に「検索語 — 英文プロンプト」が1回だけ自動入力され、ボタンが自動クリックされる。
- 日本語IME:
  - かな漢字変換中の Enter は送信されない。確定後の Enter で送信。
- 右クリック検索:
  - 文字列を選択 → 右クリック → “Search OpenEvidence…”。
- Omnibox:
  - アドレスバーで `oe` → スペース → 検索語 → Enter。
- 二重付与なし:
  - 英文プロンプトが二重で付かないこと。

## 4) オプション
- 拡張アイコン → “Customize appended prompt…” → 英文プロンプトを編集 → Save → 再検索で反映確認。

## 5) 補足
- OpenEvidence がログイン必須の場合は、先にログインしてください（ログイン後に自動入力＋送信が動作）。
- 対応ドメインは `openevidence.com` / `www.openevidence.com` です。

## 6) フィードバック
- 不具合・要望はこちらへ: https://github.com/shoei05/oesearch/issues
