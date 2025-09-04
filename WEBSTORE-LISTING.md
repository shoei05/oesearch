# Chrome Web Store Listing (EN/JA)

## Title / タイトル
OpenEvidence Search Helper (Unofficial) / OpenEvidence Search Helper（非公式）

## Short description (EN ≤132 chars)
OpenEvidence search via omnibox/menu/popup; appends an SR/MA + GRADE prompt.

## 概要（JA ≤132字）
アドレスバー/右クリック/ポップアップからOpenEvidence検索。SR/MA＋GRADEの英文を末尾に自動付与。

## Full description (English)
- Overview:
  - Search OpenEvidence from the omnibox (type `oe` + space), the context menu, or the toolbar popup.
  - The extension appends an English prompt requesting SR/MA-based synthesis and GRADE-rated recommendations.
  - Works after login if OpenEvidence requires authentication.
- Key features:
  - Omnibox: type `oe <query>` and press Enter.
  - Context menu: right‑click selected text → “Search OpenEvidence…”.
  - Popup: quick search box; customize the appended prompt in Options.
  - IME‑safe: ignores Enter during Japanese composition in the popup.
  - Auto‑fill + submit with resilient selectors on openevidence.com.
- Notes:
  - Unofficial; not affiliated with OpenEvidence.
  - No personal data is collected or transmitted.
- Source/Support: https://github.com/shoei05/oesearch

## 詳細説明（日本語）
- 概要:
  - アドレスバー（`oe`＋スペース）、右クリック、ツールバーのポップアップからOpenEvidenceをすぐ検索できます。
  - SR/MAに基づく要約とGRADEによる推奨を依頼する英文を自動で末尾に付与します。
  - OpenEvidenceがログイン必須の場合は、ログイン後に自動入力・送信します。
- 主な機能:
  - Omnibox: `oe <検索語>` → Enter。
  - コンテキストメニュー: 選択文字列 → 右クリック → “Search OpenEvidence…”。
  - ポップアップ: 簡易検索ボックス。付与英文はオプションで編集可能。
  - 日本語入力対応: ポップアップでIME変換中のEnterは送信しません。
  - openevidence.com上の検索欄へ自動入力＋送信（堅牢なセレクタ）。
- 注意:
  - 非公式拡張であり、OpenEvidenceとは提携していません。
  - 個人データの収集・送信は行いません。
- ソース/サポート: https://github.com/shoei05/oesearch

## Privacy / プライバシー
- Data collection: none. No analytics or third‑party SDKs.
- Permissions rationale:
  - storage: saves your custom appended prompt.
  - contextMenus: enables right‑click “Search OpenEvidence…” action.
  - tabs: opens openevidence.com and automates the search.
- Host permissions rationale:
  - openevidence.com / www.openevidence.com: required to inject only the minimal content script that enters your query and clicks the search button.
- Remote code: not used. All code is packaged.

## Single Purpose / 単一用途
EN: The extension’s single purpose is to facilitate searches on openevidence.com by appending an SR/MA + GRADE prompt and automating form entry.

JA: 本拡張の単一の目的は、openevidence.comにおける検索を補助すること（SR/MA＋GRADEの英文を付与し、フォーム入力を自動化）です。
