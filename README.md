# Arukuwa - 引きこもり当事者向けライフプラン可視化Webアプリ

## プロジェクト概要

Arukuwaは、引きこもり状態にある当事者が将来の家計（収入・支出・残高など）を見える化できるよう支援するWebアプリケーションです。Gemini APIを活用し、働けない・働きにくい状況の中で「このまま生活していくといつお金が尽きるのか」「生活費はどのくらい必要か」といった漠然とした将来の不安を、数字やグラフで具体的に把握できるようにします。

## 主な機能

- **ステップ形式の質問入力**: 心理的負担の少ない一問一答形式
- **ライフプラン自動計算**: Gemini APIを活用した将来の家計キャッシュフロー予測
- **結果の可視化**: グラフと数値で分かりやすく表示
- **行動目標設定**: 小さな一歩を踏み出すための目標管理機能
- **プライバシー重視**: ログイン不要、匿名利用可能

## 技術スタック

- **フロントエンド**: React / Vue.js
- **バックエンド**: Python (Flask)
- **AI**: Google Gemini API
- **データベース**: PostgreSQL / SQLite
- **デプロイ**: Docker対応

## ディレクトリ構造

```
arukuwa/
├── docs/                    # ドキュメント
│   ├── technical/          # 技術仕様書
│   ├── api/                # API設計書
│   ├── database/           # データベース設計書
│   ├── frontend/           # フロントエンド設計書
│   ├── security/           # セキュリティ・プライバシー設計書
│   └── setup/              # セットアップガイド
├── backend/                # バックエンドアプリケーション
│   ├── app/                # アプリケーションコード
│   └── tests/              # テストコード
├── frontend/               # フロントエンドアプリケーション
│   ├── src/                # ソースコード
│   └── public/             # 静的ファイル
└── database/               # データベーススキーマ
```

## ドキュメント

- [技術仕様書](docs/technical/TECHNICAL_SPEC.md)
- [API設計書](docs/api/API_DESIGN.md)
- [データベース設計書](docs/database/DATABASE_DESIGN.md)
- [フロントエンド設計書](docs/frontend/FRONTEND_DESIGN.md)
- [セキュリティ設計書](docs/security/SECURITY_DESIGN.md)
- [開発環境セットアップガイド](docs/setup/SETUP_GUIDE.md)
- [実装計画](docs/IMPLEMENTATION_PLAN.md)

## セットアップ

詳細は [開発環境セットアップガイド](docs/setup/SETUP_GUIDE.md) を参照してください。

## ライセンス

このプロジェクトは開発中です。
