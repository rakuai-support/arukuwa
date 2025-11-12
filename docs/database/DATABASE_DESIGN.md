# データベース設計書 (Database Design Document)

## 1. 概要

本ドキュメントは、Arukuwaアプリケーションのデータベース設計を定義します。

### 1.1 データベース管理システム

- **開発環境**: SQLite 3.x
- **本番環境**: PostgreSQL 15.x
- **ORM**: SQLAlchemy 2.x
- **マイグレーション**: Alembic

### 1.2 設計方針

- 正規化を適切に適用（第3正規形まで）
- パフォーマンスのために必要に応じて非正規化
- プライバシー重視（最小限のデータ保存）
- 将来の拡張性を考慮

## 2. ER図

```
┌─────────────────┐
│    sessions     │
│─────────────────│
│ id (PK)         │
│ session_id      │◄─────┐
│ created_at      │      │
│ last_accessed   │      │
│ client_info     │      │
│ expires_at      │      │
└─────────────────┘      │
                         │
                         │
┌─────────────────┐      │
│  calculations   │      │
│─────────────────│      │
│ id (PK)         │      │
│ calculation_id  │      │
│ session_id (FK) │──────┘
│ input_data      │      ┌──────────┐
│ result_data     │◄─────│          │
│ ai_analysis     │      │  goals   │
│ created_at      │      │──────────│
│ updated_at      │      │ id (PK)  │
└─────────────────┘      │ goal_id  │
         ▲               │ session_id (FK)
         │               │ calculation_id (FK)
         │               │ title    │
         │               │ description
┌─────────────────┐      │ category │
│calculation_     │      │ frequency│
│yearly_data      │      │ status   │
│─────────────────│      │ progress │
│ id (PK)         │      │ start_date
│ calculation_id  │──────┤ completed_at
│ year            │      │ created_at
│ age             │      │ updated_at
│ balance         │      └──────────┘
│ annual_income   │
│ annual_expenses │
│ net_change      │
└─────────────────┘
```

## 3. テーブル定義

### 3.1 sessions テーブル

匿名ユーザーのセッション情報を管理します。

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(36) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    client_info JSONB,

    INDEX idx_session_id (session_id),
    INDEX idx_expires_at (expires_at)
);
```

**カラム説明**:

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|-----------|------|
| id | SERIAL | NO | - | プライマリキー |
| session_id | VARCHAR(36) | NO | - | UUID形式のセッションID |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |
| last_accessed | TIMESTAMP | NO | CURRENT_TIMESTAMP | 最終アクセス日時 |
| expires_at | TIMESTAMP | NO | - | 有効期限 |
| client_info | JSONB | YES | NULL | クライアント情報 (user_agent, screen_size等) |

**制約**:
- `session_id`: UNIQUE制約
- `expires_at`: インデックス（期限切れセッションのクリーンアップ用）

**サンプルデータ**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-11-12T10:30:00Z",
  "last_accessed": "2025-11-12T11:00:00Z",
  "expires_at": "2025-11-13T10:30:00Z",
  "client_info": {
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "screen_width": 1920,
    "screen_height": 1080,
    "timezone": "Asia/Tokyo"
  }
}
```

### 3.2 calculations テーブル

ライフプラン計算の結果を保存します。

```sql
CREATE TABLE calculations (
    id SERIAL PRIMARY KEY,
    calculation_id VARCHAR(50) UNIQUE NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    ai_analysis JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    INDEX idx_calculation_id (calculation_id),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
);
```

**カラム説明**:

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|-----------|------|
| id | SERIAL | NO | - | プライマリキー |
| calculation_id | VARCHAR(50) | NO | - | 計算結果の一意識別子 |
| session_id | VARCHAR(36) | NO | - | セッションIDの外部キー |
| input_data | JSONB | NO | - | 入力データ (年齢、生活費等) |
| result_data | JSONB | NO | - | 計算結果データ |
| ai_analysis | JSONB | YES | NULL | AI分析結果 (Gemini APIからの応答) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 更新日時 |

**input_data JSON構造**:
```json
{
  "age": 50,
  "monthly_expenses": 150000,
  "total_assets": 10000000,
  "monthly_support": 65000,
  "support_type": "pension"
}
```

**result_data JSON構造**:
```json
{
  "depletion_age": 65,
  "depletion_year": 2040,
  "years_until_depletion": 15,
  "total_years_simulated": 50,
  "summary": {
    "total_income": 39000000,
    "total_expenses": 90000000,
    "net_balance": -51000000
  }
}
```

**ai_analysis JSON構造**:
```json
{
  "risk_factors": [
    "現在の支出ペースでは15年後に資金が枯渇する可能性があります"
  ],
  "suggestions": [
    "月々の生活費を10%削減することで、資金寿命を5年延ばせます"
  ],
  "advice_message": "現在の状況では...",
  "generated_at": "2025-11-12T10:30:00Z",
  "model_version": "gemini-pro"
}
```

### 3.3 calculation_yearly_data テーブル

年次ごとの詳細データを保存します。

```sql
CREATE TABLE calculation_yearly_data (
    id SERIAL PRIMARY KEY,
    calculation_id VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    age INTEGER NOT NULL,
    balance BIGINT NOT NULL,
    annual_income BIGINT NOT NULL,
    annual_expenses BIGINT NOT NULL,
    net_change BIGINT NOT NULL,

    FOREIGN KEY (calculation_id) REFERENCES calculations(calculation_id) ON DELETE CASCADE,
    INDEX idx_calculation_id (calculation_id),
    INDEX idx_year (year),
    UNIQUE (calculation_id, year)
);
```

**カラム説明**:

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|-----------|------|
| id | SERIAL | NO | - | プライマリキー |
| calculation_id | VARCHAR(50) | NO | - | 計算結果IDの外部キー |
| year | INTEGER | NO | - | 年 (西暦) |
| age | INTEGER | NO | - | その年の年齢 |
| balance | BIGINT | NO | - | その年末の残高 (円) |
| annual_income | BIGINT | NO | - | その年の収入 (円) |
| annual_expenses | BIGINT | NO | - | その年の支出 (円) |
| net_change | BIGINT | NO | - | その年の収支 (円) |

**制約**:
- `(calculation_id, year)`: UNIQUE制約（同じ計算で同じ年は1レコードのみ）

**サンプルデータ**:
```sql
INSERT INTO calculation_yearly_data VALUES
(1, 'calc_123abc456def', 2025, 50, 10000000, 780000, 1800000, -1020000),
(2, 'calc_123abc456def', 2026, 51, 8980000, 780000, 1800000, -1020000),
(3, 'calc_123abc456def', 2027, 52, 7960000, 780000, 1800000, -1020000);
```

### 3.4 goals テーブル

ユーザーが設定した行動目標を管理します。

```sql
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    goal_id VARCHAR(50) UNIQUE NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    calculation_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    frequency VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    progress INTEGER NOT NULL DEFAULT 0,
    start_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (calculation_id) REFERENCES calculations(calculation_id) ON DELETE SET NULL,
    INDEX idx_goal_id (goal_id),
    INDEX idx_session_id (session_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    CHECK (progress >= 0 AND progress <= 100),
    CHECK (status IN ('active', 'completed', 'archived', 'paused'))
);
```

**カラム説明**:

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|-----------|------|
| id | SERIAL | NO | - | プライマリキー |
| goal_id | VARCHAR(50) | NO | - | 目標の一意識別子 |
| session_id | VARCHAR(36) | NO | - | セッションIDの外部キー |
| calculation_id | VARCHAR(50) | YES | NULL | 関連する計算結果ID |
| title | VARCHAR(200) | NO | - | 目標タイトル |
| description | TEXT | YES | NULL | 目標の詳細説明 |
| category | VARCHAR(50) | YES | NULL | カテゴリー (finance, health, social, other) |
| frequency | VARCHAR(50) | YES | NULL | 頻度 (daily, weekly, monthly) |
| status | VARCHAR(20) | NO | 'active' | ステータス |
| progress | INTEGER | NO | 0 | 進捗率 (0-100) |
| start_date | DATE | YES | NULL | 開始日 |
| completed_at | TIMESTAMP | YES | NULL | 完了日時 |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 更新日時 |

**制約**:
- `progress`: 0〜100の範囲
- `status`: 'active', 'completed', 'archived', 'paused' のいずれか

**サンプルデータ**:
```sql
INSERT INTO goals VALUES
(
  1,
  'goal_789ghi012jkl',
  '550e8400-e29b-41d4-a716-446655440000',
  'calc_123abc456def',
  '1ヶ月に1回だけ支出を記録してみる',
  '家計簿アプリを使って、月に一度支出を確認します',
  'finance',
  'monthly',
  'active',
  0,
  '2025-11-12',
  NULL,
  '2025-11-12 10:30:00',
  '2025-11-12 10:30:00'
);
```

## 4. インデックス戦略

### 4.1 主要インデックス

| テーブル | カラム | 理由 |
|----------|--------|------|
| sessions | session_id | 高頻度のルックアップ |
| sessions | expires_at | クリーンアップクエリの最適化 |
| calculations | calculation_id | 高頻度のルックアップ |
| calculations | session_id | セッションごとの計算履歴取得 |
| calculations | created_at | 時系列での検索 |
| calculation_yearly_data | calculation_id | 年次データの取得 |
| calculation_yearly_data | (calculation_id, year) | 複合ユニークキー |
| goals | goal_id | 高頻度のルックアップ |
| goals | session_id | セッションごとの目標取得 |
| goals | status | ステータスでのフィルタリング |

### 4.2 パフォーマンス最適化

```sql
-- 複合インデックスの例
CREATE INDEX idx_goals_session_status ON goals(session_id, status);

-- 部分インデックスの例（PostgreSQL）
CREATE INDEX idx_active_goals ON goals(session_id) WHERE status = 'active';

-- JSONB フィールドのインデックス（PostgreSQL）
CREATE INDEX idx_calculations_input_age ON calculations USING GIN ((input_data->'age'));
```

## 5. データ保持ポリシー

### 5.1 セッション

- 有効期限: 作成から24時間
- クリーンアップ: 期限切れセッションは毎日自動削除

```sql
-- クリーンアップクエリ
DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
```

### 5.2 計算結果

- 初期版: セッション削除時にカスケード削除
- 将来版: ユーザー登録後は永続保存

### 5.3 目標

- 初期版: セッション削除時にカスケード削除
- 将来版: ユーザー登録後は永続保存（アーカイブ機能）

## 6. セキュリティ

### 6.1 個人情報の扱い

- 最小限のデータのみ保存
- 個人を特定できる情報は保存しない
- IPアドレスは保存しない（ログのみ）

### 6.2 データ暗号化

- 通信: TLS/SSL
- 保存: PostgreSQLの透過的暗号化機能使用（本番環境）
- バックアップ: 暗号化して保存

### 6.3 アクセス制御

```sql
-- アプリケーション用ユーザー（制限付き権限）
CREATE USER arukuwa_app WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO arukuwa_app;

-- 読み取り専用ユーザー（分析用）
CREATE USER arukuwa_readonly WITH PASSWORD 'strong_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO arukuwa_readonly;
```

## 7. マイグレーション

### 7.1 Alembic設定

```python
# alembic/env.py
from sqlalchemy import engine_from_config, pool
from app.models import Base

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=Base.metadata
        )

        with context.begin_transaction():
            context.run_migrations()
```

### 7.2 マイグレーションコマンド

```bash
# 新しいマイグレーション作成
alembic revision --autogenerate -m "テーブル追加"

# マイグレーション実行
alembic upgrade head

# ロールバック
alembic downgrade -1
```

## 8. バックアップ戦略

### 8.1 バックアップ頻度

- フルバックアップ: 毎日 3:00 AM
- 差分バックアップ: 6時間ごと
- WALアーカイブ: 継続的（PostgreSQL）

### 8.2 バックアップコマンド

```bash
# PostgreSQL ダンプ
pg_dump -U arukuwa_app -F c -b -v -f backup_$(date +%Y%m%d).dump arukuwa_db

# リストア
pg_restore -U arukuwa_app -d arukuwa_db -v backup_20251112.dump
```

### 8.3 保持期間

- 日次バックアップ: 30日間
- 月次バックアップ: 1年間
- 年次バックアップ: 5年間

## 9. モニタリング

### 9.1 監視対象

- テーブルサイズ
- インデックス使用状況
- スロークエリ
- 接続数
- デッドロック

### 9.2 スロークエリログ設定

```sql
-- PostgreSQL設定
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1秒以上のクエリをログ
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

## 10. SQLAlchemyモデル例

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BIGINT, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(Integer, primary_key=True)
    session_id = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_accessed = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    client_info = Column(JSONB)

    # Relationships
    calculations = relationship('Calculation', back_populates='session', cascade='all, delete-orphan')
    goals = relationship('Goal', back_populates='session', cascade='all, delete-orphan')

class Calculation(Base):
    __tablename__ = 'calculations'

    id = Column(Integer, primary_key=True)
    calculation_id = Column(String(50), unique=True, nullable=False)
    session_id = Column(String(36), ForeignKey('sessions.session_id', ondelete='CASCADE'), nullable=False)
    input_data = Column(JSONB, nullable=False)
    result_data = Column(JSONB, nullable=False)
    ai_analysis = Column(JSONB)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    session = relationship('Session', back_populates='calculations')
    yearly_data = relationship('CalculationYearlyData', back_populates='calculation', cascade='all, delete-orphan')
    goals = relationship('Goal', back_populates='calculation')

class CalculationYearlyData(Base):
    __tablename__ = 'calculation_yearly_data'

    id = Column(Integer, primary_key=True)
    calculation_id = Column(String(50), ForeignKey('calculations.calculation_id', ondelete='CASCADE'), nullable=False)
    year = Column(Integer, nullable=False)
    age = Column(Integer, nullable=False)
    balance = Column(BIGINT, nullable=False)
    annual_income = Column(BIGINT, nullable=False)
    annual_expenses = Column(BIGINT, nullable=False)
    net_change = Column(BIGINT, nullable=False)

    # Relationships
    calculation = relationship('Calculation', back_populates='yearly_data')

class Goal(Base):
    __tablename__ = 'goals'

    id = Column(Integer, primary_key=True)
    goal_id = Column(String(50), unique=True, nullable=False)
    session_id = Column(String(36), ForeignKey('sessions.session_id', ondelete='CASCADE'), nullable=False)
    calculation_id = Column(String(50), ForeignKey('calculations.calculation_id', ondelete='SET NULL'))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    frequency = Column(String(50))
    status = Column(String(20), nullable=False, default='active')
    progress = Column(Integer, nullable=False, default=0)
    start_date = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    session = relationship('Session', back_populates='goals')
    calculation = relationship('Calculation', back_populates='goals')
```

## 11. 今後の拡張

### 11.1 将来追加予定のテーブル

- `users`: ユーザー登録機能実装時
- `notifications`: 通知機能実装時
- `audit_logs`: 監査ログ
- `feature_flags`: 機能フラグ管理

### 11.2 パーティショニング

大量データに対応するため、時系列でのパーティショニングを検討:

```sql
-- PostgreSQL パーティショニング例
CREATE TABLE calculations_2025 PARTITION OF calculations
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```
