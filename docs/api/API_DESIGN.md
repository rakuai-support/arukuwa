# API設計書 (API Design Document)

## 1. 概要

本ドキュメントは、Arukuwa WebアプリケーションのRESTful API仕様を定義します。

### 1.1 ベースURL

```
開発環境: http://localhost:5000/api/v1
本番環境: https://arukuwa.example.com/api/v1
```

### 1.2 共通仕様

#### 1.2.1 レスポンスフォーマット

すべてのレスポンスはJSON形式です。

**成功レスポンス**:
```json
{
  "success": true,
  "data": { ... },
  "message": "操作が成功しました"
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": { ... }
  }
}
```

#### 1.2.2 HTTPステータスコード

| コード | 意味 | 使用場面 |
|--------|------|----------|
| 200 | OK | 成功 |
| 201 | Created | リソース作成成功 |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限エラー |
| 404 | Not Found | リソースが見つからない |
| 429 | Too Many Requests | レート制限超過 |
| 500 | Internal Server Error | サーバーエラー |
| 503 | Service Unavailable | サービス利用不可 |

#### 1.2.3 認証

初期版ではセッションベースの匿名認証を使用します。

**ヘッダー**:
```
Cookie: session_id=<session_id>
```

将来版では以下をサポート予定:
```
Authorization: Bearer <jwt_token>
```

#### 1.2.4 レート制限

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1234567890
```

- グローバル: 60リクエスト/分
- 計算API: 10リクエスト/分

## 2. エンドポイント一覧

### 2.1 ヘルスチェック

#### `GET /health`

サーバーの稼働状態を確認します。

**リクエスト**:
```http
GET /api/v1/health
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-11-12T10:30:00Z"
  }
}
```

### 2.2 セッション管理

#### `POST /session`

新しいセッションを作成します。

**リクエスト**:
```http
POST /api/v1/session
Content-Type: application/json

{
  "client_info": {
    "user_agent": "Mozilla/5.0...",
    "screen_width": 1920,
    "screen_height": 1080
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "expires_at": "2025-11-13T10:30:00Z"
  }
}
```

#### `GET /session/{session_id}`

セッション情報を取得します。

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-11-12T10:30:00Z",
    "last_accessed": "2025-11-12T11:00:00Z",
    "has_simulation": true
  }
}
```

### 2.3 ライフプラン計算

#### `POST /calculate`

ライフプランを計算します。Gemini APIを使用して詳細な分析を行います。

**リクエスト**:
```http
POST /api/v1/calculate
Content-Type: application/json

{
  "user_info": {
    "age": 50,
    "monthly_expenses": 150000,
    "total_assets": 10000000,
    "monthly_support": 65000,
    "support_type": "pension"
  },
  "options": {
    "use_ai_analysis": true,
    "simulation_years": 50
  }
}
```

**フィールド説明**:
- `age` (integer, required): 現在の年齢 (0-120)
- `monthly_expenses` (integer, required): 月間生活費 (円)
- `total_assets` (integer, required): 現在の総資産 (円)
- `monthly_support` (integer, optional): 月間受給額 (円)
- `support_type` (string, optional): 支援の種類 ("pension", "welfare", "none")
- `use_ai_analysis` (boolean, optional): AI分析を使用するか (default: true)
- `simulation_years` (integer, optional): シミュレーション年数 (default: 50)

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "calculation_id": "calc_123abc456def",
    "created_at": "2025-11-12T10:30:00Z",
    "input": {
      "age": 50,
      "monthly_expenses": 150000,
      "total_assets": 10000000,
      "monthly_support": 65000
    },
    "result": {
      "depletion_age": 65,
      "depletion_year": 2040,
      "years_until_depletion": 15,
      "total_years_simulated": 50,
      "yearly_data": [
        {
          "year": 2025,
          "age": 50,
          "balance": 10000000,
          "annual_income": 780000,
          "annual_expenses": 1800000,
          "net_change": -1020000
        },
        {
          "year": 2026,
          "age": 51,
          "balance": 8980000,
          "annual_income": 780000,
          "annual_expenses": 1800000,
          "net_change": -1020000
        }
        // ... 続く
      ],
      "summary": {
        "total_income": 39000000,
        "total_expenses": 90000000,
        "net_balance": -51000000,
        "average_monthly_balance": 8500000
      },
      "ai_analysis": {
        "risk_factors": [
          "現在の支出ペースでは15年後に資金が枯渇する可能性があります",
          "インフレーションにより実質的な購買力が低下する可能性があります"
        ],
        "suggestions": [
          "月々の生活費を10%削減することで、資金寿命を5年延ばせます",
          "障害年金や生活保護などの追加支援制度の利用を検討してください",
          "固定費の見直しから始めることをお勧めします"
        ],
        "advice_message": "現在の状況では、約15年後に資金が不足する可能性があります。でも大丈夫です。小さな工夫で改善できることがたくさんあります。まずは月に一度、支出を振り返ることから始めてみませんか？"
      }
    }
  }
}
```

**エラーレスポンス例**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": {
      "age": ["年齢は0から120の間で入力してください"],
      "monthly_expenses": ["生活費は0円以上で入力してください"]
    }
  }
}
```

#### `GET /calculate/{calculation_id}`

過去の計算結果を取得します。

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "calculation_id": "calc_123abc456def",
    "created_at": "2025-11-12T10:30:00Z",
    "result": { ... }
  }
}
```

### 2.4 目標管理

#### `POST /goals`

新しい目標を作成します。

**リクエスト**:
```http
POST /api/v1/goals
Content-Type: application/json

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "calculation_id": "calc_123abc456def",
  "goal": {
    "title": "1ヶ月に1回だけ支出を記録してみる",
    "description": "家計簿アプリを使って、月に一度支出を確認します",
    "category": "finance",
    "frequency": "monthly",
    "start_date": "2025-11-12"
  }
}
```

**フィールド説明**:
- `title` (string, required): 目標タイトル (最大100文字)
- `description` (string, optional): 目標の詳細説明 (最大500文字)
- `category` (string, optional): カテゴリー ("finance", "health", "social", "other")
- `frequency` (string, optional): 頻度 ("daily", "weekly", "monthly")
- `start_date` (string, optional): 開始日 (ISO 8601形式)

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "goal_id": "goal_789ghi012jkl",
    "created_at": "2025-11-12T10:30:00Z",
    "goal": {
      "title": "1ヶ月に1回だけ支出を記録してみる",
      "description": "家計簿アプリを使って、月に一度支出を確認します",
      "category": "finance",
      "frequency": "monthly",
      "start_date": "2025-11-12",
      "status": "active",
      "progress": 0
    }
  }
}
```

#### `GET /goals`

目標一覧を取得します。

**クエリパラメータ**:
- `session_id` (string, required): セッションID
- `status` (string, optional): ステータスフィルター ("active", "completed", "archived")
- `limit` (integer, optional): 取得件数 (default: 20, max: 100)
- `offset` (integer, optional): オフセット (default: 0)

**リクエスト**:
```http
GET /api/v1/goals?session_id=550e8400-e29b-41d4-a716-446655440000&status=active
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "goal_id": "goal_789ghi012jkl",
        "title": "1ヶ月に1回だけ支出を記録してみる",
        "description": "家計簿アプリを使って、月に一度支出を確認します",
        "category": "finance",
        "frequency": "monthly",
        "status": "active",
        "progress": 0,
        "created_at": "2025-11-12T10:30:00Z",
        "updated_at": "2025-11-12T10:30:00Z"
      }
      // ... 続く
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

#### `PATCH /goals/{goal_id}`

目標を更新します。

**リクエスト**:
```http
PATCH /api/v1/goals/goal_789ghi012jkl
Content-Type: application/json

{
  "status": "completed",
  "progress": 100,
  "completed_at": "2025-12-12T10:30:00Z"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "goal_id": "goal_789ghi012jkl",
    "status": "completed",
    "progress": 100,
    "completed_at": "2025-12-12T10:30:00Z",
    "updated_at": "2025-12-12T10:30:00Z"
  }
}
```

#### `DELETE /goals/{goal_id}`

目標を削除（アーカイブ）します。

**レスポンス**:
```json
{
  "success": true,
  "message": "目標を削除しました"
}
```

### 2.5 AI提案

#### `POST /ai/suggest-goals`

AIによる目標提案を取得します。

**リクエスト**:
```http
POST /api/v1/ai/suggest-goals
Content-Type: application/json

{
  "calculation_id": "calc_123abc456def",
  "user_context": {
    "age": 50,
    "monthly_balance": -85000,
    "interests": ["reading", "cooking"]
  },
  "count": 3
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "title": "1ヶ月に1回だけ支出を記録してみる",
        "description": "スマホのメモアプリでも大丈夫。月末に振り返るだけで気づきがあります",
        "category": "finance",
        "frequency": "monthly",
        "estimated_difficulty": "easy"
      },
      {
        "title": "週に2回、図書館に行く",
        "description": "無料で本が読め、外出のきっかけにもなります",
        "category": "social",
        "frequency": "weekly",
        "estimated_difficulty": "medium"
      },
      {
        "title": "月に1度、自炊の日を作る",
        "description": "簡単なレシピから始めて、食費の節約と健康的な食事を両立",
        "category": "health",
        "frequency": "monthly",
        "estimated_difficulty": "medium"
      }
    ],
    "generated_at": "2025-11-12T10:30:00Z"
  }
}
```

#### `POST /ai/advice`

状況に応じたアドバイスを取得します。

**リクエスト**:
```http
POST /api/v1/ai/advice
Content-Type: application/json

{
  "calculation_id": "calc_123abc456def",
  "question": "生活費を減らすにはどうすればいいですか？",
  "context": {
    "monthly_expenses": 150000,
    "monthly_support": 65000
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "advice": "月々の支出が15万円とのことですね。まずは固定費の見直しから始めてみましょう。携帯電話を格安SIMに変更するだけで月3,000円程度の節約になります。また、電気・ガスの契約プランを見直すことで、さらに2,000円程度節約できる可能性があります。小さな積み重ねが大きな変化につながります。",
    "related_suggestions": [
      "固定費の見直しをする",
      "格安SIMへの乗り換えを検討する",
      "電力会社のプラン比較をする"
    ],
    "generated_at": "2025-11-12T10:30:00Z"
  }
}
```

### 2.6 データエクスポート

#### `GET /export/{calculation_id}`

計算結果をエクスポートします。

**クエリパラメータ**:
- `format` (string, optional): フォーマット ("json", "csv", "pdf") (default: "json")

**リクエスト**:
```http
GET /api/v1/export/calc_123abc456def?format=csv
```

**レスポンス** (CSV):
```csv
年,年齢,残高,年間収入,年間支出,収支
2025,50,10000000,780000,1800000,-1020000
2026,51,8980000,780000,1800000,-1020000
...
```

## 3. エラーコード一覧

| コード | 説明 |
|--------|------|
| `VALIDATION_ERROR` | 入力値のバリデーションエラー |
| `SESSION_NOT_FOUND` | セッションが見つからない |
| `SESSION_EXPIRED` | セッションの有効期限切れ |
| `CALCULATION_NOT_FOUND` | 計算結果が見つからない |
| `GOAL_NOT_FOUND` | 目標が見つからない |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 |
| `AI_API_ERROR` | Gemini API呼び出しエラー |
| `DATABASE_ERROR` | データベースエラー |
| `INTERNAL_ERROR` | 内部エラー |

## 4. バージョニング

APIバージョンはURLパスに含めます。

```
/api/v1/...  # Version 1
/api/v2/...  # Version 2 (将来)
```

メジャーバージョンアップ時は以下の互換性ポリシーに従います:
- 旧バージョンは最低6ヶ月間サポート
- 廃止予定APIには `X-API-Deprecated: true` ヘッダーを付与
- 新バージョンリリース前に事前告知

## 5. セキュリティ

### 5.1 CORS設定

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://arukuwa.example.com"],
        "methods": ["GET", "POST", "PATCH", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
        "max_age": 3600
    }
})
```

### 5.2 入力サニタイゼーション

すべての文字列入力に対して以下を実施:
- HTMLタグのエスケープ
- SQLインジェクション対策（ORM使用）
- XSS対策

## 6. テスト

### 6.1 APIテスト例

```python
def test_calculate_lifeplan():
    response = client.post('/api/v1/calculate', json={
        'user_info': {
            'age': 50,
            'monthly_expenses': 150000,
            'total_assets': 10000000,
            'monthly_support': 65000
        }
    })
    assert response.status_code == 200
    assert response.json['success'] == True
    assert 'calculation_id' in response.json['data']
```

## 7. 今後の拡張

- WebSocket対応（リアルタイム通知）
- GraphQL対応
- Webhook機能
- バッチ処理API
- 管理者用API
