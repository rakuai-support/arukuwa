# Arukuwa Frontend

引きこもり当事者向けライフプラン可視化Webアプリのフロントエンド

## 技術スタック

- **React** 18.2
- **TypeScript** 5.3
- **Vite** 5.0
- **Tailwind CSS** 3.3
- **React Router** 6.20
- **Axios** 1.6
- **Chart.js** 4.4
- **React Hook Form** + **Zod**

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集してAPIエンドポイントを設定

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら http://localhost:5173 にアクセスしてください。

## 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルドしたアプリのプレビュー
npm run preview

# リント
npm run lint

# フォーマット
npm run format

# テスト
npm run test
```

## プロジェクト構造

```
src/
├── assets/          # 画像、フォントなどの静的ファイル
├── components/      # 再利用可能なコンポーネント
│   ├── common/      # ボタン、入力フォームなどの共通コンポーネント
│   ├── layout/      # ヘッダー、フッターなどのレイアウトコンポーネント
│   ├── forms/       # フォーム関連コンポーネント
│   └── charts/      # グラフコンポーネント
├── pages/           # ページコンポーネント
├── hooks/           # カスタムフック
├── contexts/        # Reactコンテキスト
├── services/        # API通信サービス
├── types/           # TypeScript型定義
├── utils/           # ユーティリティ関数
├── constants/       # 定数
├── styles/          # グローバルスタイル
├── App.tsx          # ルートコンポーネント
└── main.tsx         # エントリーポイント
```

## 開発ガイドライン

- コンポーネントはTypeScriptで記述する
- スタイリングはTailwind CSSを使用する
- 状態管理はReact Context APIを使用する
- APIリクエストはservices/以下のサービスクラスを使用する
- 型定義はtypes/index.tsに集約する
