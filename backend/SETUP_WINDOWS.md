# Windows環境でのバックエンドセットアップガイド

## 前提条件

- Python 3.11以上がインストールされていること
- PowerShellまたはコマンドプロンプトが使用可能なこと

## セットアップ手順

### 1. バックエンドディレクトリに移動

```powershell
cd C:\Users\utaka\arukuwa\backend
```

### 2. 仮想環境の作成（推奨）

```powershell
# 仮想環境を作成
python -m venv venv

# 仮想環境をアクティベート
.\venv\Scripts\Activate.ps1
```

**注意**: PowerShellでスクリプト実行がブロックされる場合は、以下を実行してください：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. 依存関係のインストール

**開発環境用（PostgreSQL/Redis不要）：**

```powershell
pip install -r requirements-dev.txt
```

**本番環境用（すべての依存関係）：**

```powershell
pip install -r requirements.txt
```

### 4. 環境変数の設定

`.env`ファイルを作成します：

```powershell
# .env.exampleをコピー
Copy-Item .env.example .env
```

`.env`ファイルを編集して、必要な設定を行います：

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your_secret_key_here

# Database (開発環境ではSQLiteを使用)
DATABASE_URL=sqlite:///arukuwa.db

# Gemini API (後で設定)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. データベースの初期化

```powershell
# Flaskアプリケーションのシェルを起動
flask shell

# Pythonシェルで以下を実行
>>> from app.extensions import db
>>> db.create_all()
>>> exit()
```

または、Pythonスクリプトで直接実行：

```powershell
python -c "from app import create_app; from app.extensions import db; app = create_app(); app.app_context().push(); db.create_all()"
```

### 6. アプリケーションの起動

```powershell
python app.py
```

または：

```powershell
flask run
```

サーバーが起動したら、`http://localhost:5000` でアクセスできます。

### ヘルスチェック

ブラウザで以下のURLにアクセスして、正常に動作しているか確認：

```
http://localhost:5000/api/v1/health
```

正常に動作している場合、以下のようなJSONが返ります：

```json
{
  "status": "healthy",
  "timestamp": "2025-11-12T..."
}
```

## トラブルシューティング

### psycopg2のインストールエラー

開発環境では`requirements-dev.txt`を使用してください。PostgreSQLは本番環境でのみ必要です。

### Redisのエラー

開発環境ではRedisは不要です。`.env`ファイルで以下の行をコメントアウトしてください：

```env
# REDIS_URL=redis://localhost:6379
# RATELIMIT_STORAGE_URL=redis://localhost:6379
```

### ポート5000が使用中

別のアプリケーションがポート5000を使用している場合、`app.py`を編集してポートを変更してください：

```python
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)  # 5001に変更
```

## 次のステップ

1. フロントエンドを起動（別のターミナルで）
2. ブラウザで `http://localhost:5173` にアクセス
3. アプリケーションを使用して動作確認
