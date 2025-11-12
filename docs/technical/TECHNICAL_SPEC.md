# 技術仕様書 (Technical Specification)

## 1. システム概要

Arukuwaは、引きこもり当事者向けのライフプラン可視化Webアプリケーションです。ブラウザベースで動作し、Google Gemini APIを活用して高度な計算とアドバイス生成を行います。

## 2. 技術スタック

### 2.1 フロントエンド

- **フレームワーク**: React 18.x
- **言語**: TypeScript 5.x
- **状態管理**: React Context API / Redux Toolkit
- **UIライブラリ**:
  - Tailwind CSS (スタイリング)
  - Chart.js (グラフ描画)
  - Framer Motion (アニメーション)
- **フォーム管理**: React Hook Form
- **HTTPクライアント**: Axios
- **ビルドツール**: Vite
- **パッケージマネージャー**: npm / pnpm

### 2.2 バックエンド

- **言語**: Python 3.11+
- **Webフレームワーク**: Flask 3.x
- **API**: RESTful API
- **AI統合**: Google Gemini API (gemini-pro)
- **バリデーション**: Marshmallow / Pydantic
- **環境変数管理**: python-dotenv
- **CORS**: Flask-CORS
- **セッション管理**: Flask-Session

### 2.3 データベース

- **開発環境**: SQLite 3
- **本番環境**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.x
- **マイグレーション**: Alembic

### 2.4 AI / ML

- **プロバイダー**: Google AI (Gemini)
- **モデル**: gemini-pro
- **SDKパッケージ**: google-generativeai
- **用途**:
  - ライフプラン計算の高度な分析
  - 家計状況に基づくパーソナライズされたアドバイス生成
  - 目標設定の提案
  - 支出パターンの分析

### 2.5 デプロイ・インフラ

- **コンテナ**: Docker, Docker Compose
- **Webサーバー**: Nginx (リバースプロキシ)
- **WSGI**: Gunicorn
- **SSL/TLS**: Let's Encrypt
- **クラウド候補**: AWS / GCP / Heroku

### 2.6 開発ツール

- **バージョン管理**: Git
- **コード品質**:
  - ESLint, Prettier (フロントエンド)
  - Black, Flake8, mypy (バックエンド)
- **テスティング**:
  - Jest, React Testing Library (フロントエンド)
  - Pytest (バックエンド)
- **API文書化**: OpenAPI (Swagger)

## 3. Gemini API統合仕様

### 3.1 API設定

```python
# 環境変数
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048
```

### 3.2 Gemini API使用場面

#### 3.2.1 ライフプラン計算の分析

**入力**:
- ユーザーの年齢
- 現在の生活費
- 親の資産額
- 支援受給の有無・金額

**処理**:
```python
prompt = f"""
あなたは家計の専門家です。以下の情報に基づいて、将来のライフプランを分析してください。

【現在の状況】
- 年齢: {age}歳
- 月間生活費: {monthly_cost}円
- 利用可能資産: {total_assets}円
- 月間収入: {monthly_income}円

この条件で、以下を分析してください:
1. 資金が枯渇する見込みの年齢
2. 年次ごとの残高推移
3. リスク要因
4. 改善のための具体的な提案

JSON形式で出力してください。
"""
```

**出力**:
```json
{
  "depletion_age": 65,
  "yearly_balance": [...],
  "risk_factors": ["インフレーション", "医療費増加"],
  "suggestions": ["支出削減の具体案", "収入増加の方法"]
}
```

#### 3.2.2 パーソナライズされたアドバイス生成

**入力**:
- 計算結果
- ユーザーの状況

**処理**:
```python
prompt = f"""
以下のライフプランの結果に基づいて、当事者に寄り添った優しいアドバイスを生成してください。

【計算結果】
- 資金枯渇予想: {depletion_year}年後
- 現在の月間収支: {monthly_balance}円

【注意点】
- 専門用語を避けてください
- 前向きで希望を持てる表現を使ってください
- 小さな一歩から始められる提案をしてください
- 心理的負担を与えないように配慮してください

3〜5文程度の短いメッセージで出力してください。
"""
```

#### 3.2.3 目標設定の提案

**入力**:
- ユーザーの状況
- 計算結果

**処理**:
```python
prompt = f"""
以下の状況の方に適した、小さな行動目標を3つ提案してください。

【状況】
- 年齢: {age}歳
- 月間収支: {monthly_balance}円

【目標の条件】
- 実現可能で小さなステップ
- 1ヶ月以内に始められる
- 心理的ハードルが低い
- 具体的で測定可能

JSON配列形式で出力してください。
"""
```

**出力**:
```json
[
  "1ヶ月に1回だけ支出を記録してみる",
  "週に1回、30分だけ散歩する",
  "月に1度、好きなことをする時間を作る"
]
```

### 3.3 エラーハンドリング

```python
class GeminiAPIError(Exception):
    """Gemini API関連のエラー"""
    pass

def call_gemini_api(prompt: str, retries: int = 3) -> dict:
    """
    Gemini APIを呼び出す

    Args:
        prompt: プロンプト文字列
        retries: リトライ回数

    Returns:
        APIレスポンス

    Raises:
        GeminiAPIError: API呼び出しに失敗した場合
    """
    for attempt in range(retries):
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            if attempt == retries - 1:
                raise GeminiAPIError(f"API呼び出しに失敗しました: {str(e)}")
            time.sleep(2 ** attempt)  # 指数バックオフ
```

### 3.4 レート制限対策

- **RPM制限**: 60リクエスト/分
- **対策**: キャッシング、リクエストキューイング
- **実装**: Flask-Limiter使用

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["60 per minute"]
)

@app.route("/api/calculate", methods=["POST"])
@limiter.limit("10 per minute")
def calculate():
    # ...
```

## 4. アーキテクチャ設計

### 4.1 システム構成図

```
┌─────────────────┐
│   ユーザー      │
│  (Webブラウザ)  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│     Nginx       │
│ (リバースプロキシ)│
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│Frontend │ │ Backend  │
│ (React) │ │ (Flask)  │
└─────────┘ └────┬─────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
   ┌────────┐ ┌─────┐ ┌────────┐
   │Database│ │Gemini│ │Session │
   │(SQLite)│ │ API │ │Storage │
   └────────┘ └─────┘ └────────┘
```

### 4.2 データフロー

1. **ユーザー入力** → フロントエンド (React)
2. **入力検証** → フロントエンドバリデーション
3. **API呼び出し** → バックエンド (Flask)
4. **サーバー側検証** → Marshmallow/Pydantic
5. **AI分析** → Gemini API呼び出し
6. **計算処理** → ライフプラン計算ロジック
7. **データ保存** → SQLite/PostgreSQL (オプション)
8. **結果返却** → JSON形式でフロントエンドへ
9. **可視化** → Chart.jsでグラフ描画

### 4.3 セキュリティ設計

#### 4.3.1 通信セキュリティ

- すべての通信をHTTPSで暗号化
- HSTS (HTTP Strict Transport Security) 有効化
- CSP (Content Security Policy) 設定

#### 4.3.2 認証・認可

- 初期版: セッションベース（匿名）
- 将来版: JWT認証、OAuth 2.0対応

#### 4.3.3 入力検証

- クライアント側: React Hook Form + Zod
- サーバー側: Marshmallow/Pydantic
- SQLインジェクション対策: SQLAlchemy ORM使用
- XSS対策: 入力サニタイゼーション

#### 4.3.4 API キー管理

- 環境変数での管理
- .envファイルは.gitignoreに追加
- 本番環境: シークレット管理サービス使用

## 5. パフォーマンス要件

### 5.1 レスポンス時間

- API呼び出し: < 3秒
- ページロード: < 2秒
- グラフ描画: < 1秒

### 5.2 最適化戦略

- **フロントエンド**:
  - コード分割 (React.lazy, Suspense)
  - 画像最適化
  - キャッシング戦略
  - CDN使用

- **バックエンド**:
  - データベースインデックス
  - クエリ最適化
  - Gemini APIレスポンスのキャッシング
  - 非同期処理

## 6. スケーラビリティ

### 6.1 水平スケーリング

- ステートレスなAPI設計
- セッションストアの外部化 (Redis)
- ロードバランサー対応

### 6.2 垂直スケーリング

- データベース接続プーリング
- ワーカープロセス数の調整

## 7. モニタリング・ログ

### 7.1 ログ収集

- アプリケーションログ: Python logging
- アクセスログ: Nginx
- エラートラッキング: Sentry (オプション)

### 7.2 メトリクス

- レスポンスタイム
- エラーレート
- API呼び出し回数
- Gemini API使用量

## 8. 開発環境

### 8.1 ローカル開発

```bash
# バックエンド
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask run

# フロントエンド
cd frontend
npm install
npm run dev
```

### 8.2 Docker環境

```bash
docker-compose up -d
```

## 9. テスト戦略

### 9.1 単体テスト

- フロントエンド: Jest + React Testing Library
- バックエンド: Pytest
- カバレッジ目標: 80%以上

### 9.2 統合テスト

- APIエンドポイントテスト
- データベーステスト

### 9.3 E2Eテスト

- Playwright / Cypress
- 主要ユーザーフローのテスト

## 10. 今後の拡張性

### 10.1 予定機能

- ユーザー登録・ログイン機能
- データのサーバー側永続化
- 複数シナリオの比較機能
- 家計簿連携
- 通知機能 (リマインダー)

### 10.2 技術的拡張

- GraphQL API対応
- WebSocket (リアルタイム機能)
- PWA対応
- マルチ言語対応 (i18n)

## 11. 制約事項

### 11.1 技術的制約

- Gemini APIのレート制限
- ブラウザのローカルストレージ容量制限
- 計算の簡易性（インフレ率等を考慮しない）

### 11.2 運用制約

- 小規模チームでの開発
- 予算制限
- メンテナンス時間の確保

## 12. 参考資料

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
