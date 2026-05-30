# QuizGen — Project Rules

## プロジェクト概要

**QuizGen** は「友達にクイズを作って答えさせる」Gen Z 向けバイラルジョークアプリ。
AI がクイズを自動生成し、スコアアニメーション・Web Share API でバイラル拡散させる。

- リポジトリ: `/Users/matsuzakiyuusuke/Git/quizgen/`
- 会社ルール: `/Users/matsuzakiyuusuke/Git/abokke-company/.company/CLAUDE.md`（最優先）
- 設計書: `docs/design-doc-dynamic.html` / `.company/decisions/20260529-whoami-dynamic-architecture.md`

## 確定技術スタック

| レイヤー | 採用技術 | 備考 |
|---------|---------|------|
| ホスティング | Vercel Hobby | 静的フロント + Node.js Functions |
| KV / DB | Upstash Redis | `@upstash/redis` + `Redis.fromEnv()` ※@vercel/kv は sunset済み |
| LLM | Groq Llama 3.3 70B | 1,000 RPD 無料枠。`GROQ_API_KEY` 環境変数 |
| フロントエンド | 静的 HTML/CSS/JS | フレームワーク導入禁止 |
| ウェイトリスト | Tally.so embed | GDPR compliant（EU企業） |
| メール | Resend（任意） | 確認メールのみ。3,000/月 無料 |

## ファイル構成

```
quizgen/
├── CLAUDE.md           ← このファイル
├── index.html          ← メインアプリ（ステップ型クイズ UI）
├── lp.html             ← ランディングページ
├── app.js              ← アプリロジック（i18n / quiz / share / animation）
├── styles.css          ← スタイル（ダークテーマ / ティール / コーラル）
├── ogp.png             ← 静的 OGP 画像（1200×630px）
├── api/                ← Vercel Functions（未実装）
│   ├── generate.js     ← Groq API プロキシ
│   ├── shorten.js      ← 短縮 URL 作成
│   ├── quiz.js         ← 短縮 URL 解決
│   └── waitlist.js     ← ウェイトリスト（Upstash 自前実装の場合）
├── docs/               ← 設計書・プロダクト資料（デプロイ対象外）
├── scripts/            ← ビルドツール（デプロイ対象外）
├── mockup/             ← 初期モックアップ（参照用）
└── .claude/agents/     ← エージェント定義
```

## 主要決定（変更禁止）

1. フロントエンドは静的 HTML/CSS/JS のまま（フレームワーク導入しない）
2. `@vercel/kv` は使わない → `@upstash/redis` のみ
3. Edge Runtime は原則使わない → Node.js runtime + `maxDuration: 30`
4. Groq 以外の LLM プロバイダーは使わない
5. 広告は入れない（バイラル・Freemium モデルで収益化）
6. 月額コスト上限 $20

## コーディング規約

- コメントは「なぜ」が非自明な場合のみ書く（何をするかは書かない）
- i18n キーは `en` / `ja` 両対応必須
- 新規ライブラリ追加は最小限（CDN 経由も要検討）
- `api/` 配下は全て Node.js 形式（`export default function handler(req, res)`）

## エージェント役割早見表

| エージェント | 主な責務 | 所有ファイル |
|------------|---------|-----------|
| pdm | 要件・優先順位・プロダクト名 | `docs/` |
| architect | 技術設計・API 仕様 | `docs/`, `vercel.json` |
| frontend | UI 実装 | `index.html`, `lp.html`, `app.js`, `styles.css` |
| backend | API 実装 | `api/*.js`, `package.json` |
| research | 技術・市場調査 | 読み取り専用 |
