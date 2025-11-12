# 開発環境セットアップガイド (Development Setup Guide)

## 1. 前提条件

### 1.1 必要なソフトウェア

以下のソフトウェアがインストールされている必要があります:

| ソフトウェア | バージョン | 用途 |
|--------------|------------|------|
| Python | 3.11+ | バックエンド |
| Node.js | 18+ | フロントエンド |
| npm / pnpm | 最新 | パッケージ管理 |
| Git | 2.30+ | バージョン管理 |
| Docker | 20+ (オプション) | コンテナ環境 |
| PostgreSQL | 15+ (本番環境のみ) | データベース |

### 1.2 アカウント準備

- **Google AI Studio**: Gemini APIキーの取得
  - https://makersuite.google.com/app/apikey にアクセス
  - APIキーを作成・保存

## 2. プロジェクトのクローン

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/arukuwa.git
cd arukuwa

# ブランチ確認
git branch
```

## 3. バックエンドのセットアップ

### 3.1 Python仮想環境の作成

```bash
cd backend

# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Pythonバージョンの確認
python --version  # 3.11以上であることを確認
```

### 3.2 依存パッケージのインストール

```bash
# requirements.txtの作成（まだない場合）
cat > requirements.txt << EOF
Flask==3.0.0
Flask-CORS==4.0.0
Flask-Session==0.5.0
Flask-Limiter==3.5.0
Flask-Talisman==1.1.0
SQLAlchemy==2.0.23
Alembic==1.13.0
psycopg2-binary==2.9.9
marshmallow==3.20.1
python-dotenv==1.0.0
google-generativeai==0.3.1
redis==5.0.1
pytest==7.4.3
pytest-flask==1.3.0
black==23.11.0
flake8==6.1.0
mypy==1.7.1
EOF

# パッケージのインストール
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.3 環境変数の設定

```bash
# .envファイルの作成
cat > .env << EOF
# Flask設定
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")

# データベース設定
DATABASE_URL=sqlite:///arukuwa.db

# Gemini API設定
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048

# Redis設定（オプション）
REDIS_URL=redis://localhost:6379

# CORS設定
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# セッション設定
SESSION_TYPE=filesystem
PERMANENT_SESSION_LIFETIME=86400
EOF

# 注意: .envファイルは.gitignoreに含める
echo ".env" >> .gitignore
```

**重要**: `GEMINI_API_KEY` を実際のAPIキーに置き換えてください。

### 3.4 ディレクトリ構造の作成

```bash
# バックエンドのディレクトリ構造
mkdir -p app/{models,routes,services,utils}
mkdir -p tests
mkdir -p logs
mkdir -p flask_session

# 初期ファイルの作成
touch app/__init__.py
touch app/models/__init__.py
touch app/routes/__init__.py
touch app/services/__init__.py
touch app/utils/__init__.py
```

### 3.5 データベースの初期化

```bash
# Alembicの初期化
alembic init alembic

# データベースマイグレーションの作成
alembic revision --autogenerate -m "Initial migration"

# マイグレーションの実行
alembic upgrade head
```

### 3.6 開発サーバーの起動

```bash
# Flaskアプリケーションの起動
flask run --host=0.0.0.0 --port=5000

# または
python -m flask run
```

サーバーが起動したら、http://localhost:5000/api/v1/health にアクセスして動作確認してください。

## 4. フロントエンドのセットアップ

### 4.1 Node.jsパッケージのインストール

```bash
cd ../frontend

# package.jsonの作成（まだない場合）
npm init -y

# 依存パッケージのインストール
npm install react react-dom react-router-dom
npm install axios react-hook-form @hookform/resolvers zod
npm install chart.js react-chartjs-2
npm install framer-motion
npm install date-fns
npm install dompurify

# 開発用依存パッケージ
npm install -D @vitejs/plugin-react
npm install -D typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

または、`package.json`を直接作成:

```json
{
  "name": "arukuwa-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "framer-motion": "^10.16.5",
    "date-fns": "^2.30.0",
    "dompurify": "^3.0.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/dompurify": "^3.0.5",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.7",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "prettier": "^3.1.1",
    "eslint-config-prettier": "^9.1.0",
    "vitest": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

```bash
npm install
```

### 4.2 Viteの設定

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### 4.3 TypeScriptの設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4.4 Tailwind CSSの設定

```bash
# Tailwind CSSの初期化
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: [
          'Noto Sans JP',
          'Hiragino Kaku Gothic ProN',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}
```

```css
/* src/styles/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* カスタムスタイル */
@layer base {
  body {
    @apply font-sans text-gray-900;
  }
}
```

### 4.5 環境変数の設定

```bash
# .env.local ファイルの作成
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Arukuwa
VITE_APP_VERSION=1.0.0
EOF
```

### 4.6 ディレクトリ構造の作成

```bash
# フロントエンドのディレクトリ構造
mkdir -p src/{assets,components/{common,layout,forms,charts},pages,hooks,contexts,services,types,utils,constants,styles}

# 初期ファイルの作成
touch src/App.tsx
touch src/main.tsx
touch src/vite-env.d.ts
```

### 4.7 開発サーバーの起動

```bash
# Vite開発サーバーの起動
npm run dev
```

サーバーが起動したら、http://localhost:5173 にアクセスしてください。

## 5. Dockerを使用したセットアップ（オプション）

### 5.1 Docker Composeの設定

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://arukuwa:password@db:5432/arukuwa
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./backend:/app
      - /app/venv
    depends_on:
      - db
      - redis
    command: flask run --host=0.0.0.0

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=arukuwa
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=arukuwa
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 5.2 Dockerfileの作成

**バックエンド**:
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Pythonパッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのコピー
COPY . .

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
```

**フロントエンド**:
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# パッケージのインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### 5.3 Dockerコンテナの起動

```bash
# 環境変数の設定
export GEMINI_API_KEY=your_api_key_here

# コンテナのビルドと起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# コンテナの停止
docker-compose down

# データを含めて削除
docker-compose down -v
```

## 6. データベースのセットアップ（PostgreSQL）

### 6.1 PostgreSQLのインストール

**macOS** (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
```

**Windows**:
- https://www.postgresql.org/download/windows/ からインストーラーをダウンロード

### 6.2 データベースの作成

```bash
# PostgreSQLに接続
psql -U postgres

# データベースとユーザーの作成
CREATE DATABASE arukuwa;
CREATE USER arukuwa_app WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE arukuwa TO arukuwa_app;

# 接続確認
\c arukuwa
\dt

# 終了
\q
```

### 6.3 .envファイルの更新

```bash
# backend/.env
DATABASE_URL=postgresql://arukuwa_app:strong_password@localhost:5432/arukuwa
```

## 7. APIキーの取得と設定

### 7.1 Gemini APIキーの取得

1. https://makersuite.google.com/app/apikey にアクセス
2. Googleアカウントでログイン
3. "Create API Key" をクリック
4. 既存のGoogle Cloudプロジェクトを選択、または新規作成
5. APIキーをコピー

### 7.2 APIキーの設定

```bash
# backend/.envに追加
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### 7.3 APIキーのテスト

```python
# test_gemini.py
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# APIキーの設定
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# モデルの初期化
model = genai.GenerativeModel('gemini-pro')

# テストリクエスト
response = model.generate_content('Hello, Gemini!')
print(response.text)
```

```bash
python test_gemini.py
```

## 8. 開発ツールの設定

### 8.1 VSCode設定

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.formatting.blackArgs": ["--line-length", "100"],
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

推奨拡張機能:
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- Black Formatter (ms-python.black-formatter)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)

### 8.2 Git設定

```bash
# .gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
*.egg-info/
.pytest_cache/

# Node
node_modules/
dist/
build/
*.log

# 環境変数
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# データベース
*.db
*.sqlite

# ログ
logs/
*.log

# OS
.DS_Store
Thumbs.db
```

## 9. テストの実行

### 9.1 バックエンドテスト

```bash
cd backend

# 全テストの実行
pytest

# カバレッジ付きで実行
pytest --cov=app --cov-report=html

# 特定のテストファイルを実行
pytest tests/test_api.py

# テスト結果の確認
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

### 9.2 フロントエンドテスト

```bash
cd frontend

# 全テストの実行
npm run test

# カバレッジ付きで実行
npm run test -- --coverage

# ウォッチモード
npm run test -- --watch
```

## 10. トラブルシューティング

### 10.1 よくある問題と解決方法

**問題**: `ModuleNotFoundError: No module named 'flask'`
```bash
# 解決策: 仮想環境が有効化されているか確認
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows

# 再インストール
pip install -r requirements.txt
```

**問題**: `Error: Cannot find module 'react'`
```bash
# 解決策: node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

**問題**: Gemini APIエラー
```bash
# 解決策: APIキーを確認
echo $GEMINI_API_KEY

# .envファイルの確認
cat backend/.env | grep GEMINI_API_KEY
```

**問題**: データベース接続エラー
```bash
# 解決策: PostgreSQLが起動しているか確認
pg_isready

# データベースの存在確認
psql -U postgres -l | grep arukuwa
```

### 10.2 ログの確認

```bash
# バックエンドログ
tail -f backend/logs/arukuwa.log

# Dockerログ
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 11. 次のステップ

セットアップが完了したら:

1. [実装計画](../IMPLEMENTATION_PLAN.md) を確認
2. 開発タスクの割り当て
3. 機能の実装開始
4. テストの作成

## 12. 参考リンク

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
