# フロントエンド設計書 (Frontend Design Document)

## 1. 概要

本ドキュメントは、Arukuwa Webアプリケーションのフロントエンド設計を定義します。

### 1.1 技術スタック

- **フレームワーク**: React 18.x
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 5.x
- **状態管理**: React Context API + useReducer
- **ルーティング**: React Router v6
- **スタイリング**: Tailwind CSS 3.x
- **UIコンポーネント**: Headless UI
- **フォーム**: React Hook Form + Zod
- **グラフ**: Chart.js 4.x + react-chartjs-2
- **アニメーション**: Framer Motion
- **HTTP**: Axios
- **日付**: date-fns

### 1.2 設計方針

- モバイルファースト
- アクセシビリティ重視（WCAG 2.1 AA準拠）
- コンポーネントベース設計
- 心理的負担の軽減（優しいUI/UX）
- レスポンシブデザイン

## 2. プロジェクト構造

```
frontend/
├── public/                 # 静的ファイル
│   ├── index.html
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── assets/            # アセット（画像、フォントなど）
│   ├── components/        # 再利用可能なコンポーネント
│   │   ├── common/        # 共通コンポーネント
│   │   ├── layout/        # レイアウトコンポーネント
│   │   ├── forms/         # フォームコンポーネント
│   │   └── charts/        # グラフコンポーネント
│   ├── pages/             # ページコンポーネント
│   │   ├── Home.tsx
│   │   ├── Question.tsx
│   │   ├── Result.tsx
│   │   └── Goals.tsx
│   ├── hooks/             # カスタムフック
│   ├── contexts/          # Contextプロバイダー
│   ├── services/          # API通信
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ユーティリティ関数
│   ├── constants/         # 定数
│   ├── styles/            # グローバルスタイル
│   ├── App.tsx            # ルートコンポーネント
│   ├── main.tsx           # エントリーポイント
│   └── vite-env.d.ts
├── .env.example           # 環境変数サンプル
├── .eslintrc.json         # ESLint設定
├── .prettierrc            # Prettier設定
├── tsconfig.json          # TypeScript設定
├── tailwind.config.js     # Tailwind設定
├── vite.config.ts         # Vite設定
└── package.json
```

## 3. 画面設計

### 3.1 画面一覧

| 画面名 | パス | 説明 |
|--------|------|------|
| ホーム | `/` | アプリの説明とスタート画面 |
| 質問ステップ | `/questions/:step` | 質問入力画面（ステップ1-4） |
| 計算中 | `/calculating` | 計算処理中の待機画面 |
| 結果表示 | `/result/:calculationId` | ライフプラン結果表示 |
| 目標設定 | `/goals/new` | 新しい目標を設定 |
| 目標一覧 | `/goals` | 設定した目標の一覧 |
| ヘルプ | `/help` | 使い方・FAQ |
| プライバシー | `/privacy` | プライバシーポリシー |

### 3.2 画面遷移図

```
[ホーム] → [質問1] → [質問2] → [質問3] → [質問4] → [計算中] → [結果表示]
                                                                      ↓
                                                              [目標設定] ← → [目標一覧]
```

### 3.3 画面詳細設計

#### 3.3.1 ホーム画面 (`/`)

**目的**: アプリの説明と利用開始

**レイアウト**:
```
┌──────────────────────────────────┐
│         Header                    │
├──────────────────────────────────┤
│                                   │
│   [ロゴ/イラスト]                │
│                                   │
│   将来のお金の不安を              │
│   見える化しましょう              │
│                                   │
│   簡単な質問に答えるだけで、      │
│   あなたの将来設計が分かります    │
│                                   │
│   ✓ 質問は4つだけ（約3分）       │
│   ✓ 登録不要・匿名で使えます     │
│   ✓ 入力情報は保存されません     │
│                                   │
│   ┌────────────────────┐         │
│   │  はじめる  →       │         │
│   └────────────────────┘         │
│                                   │
│   詳しく見る / プライバシー       │
│                                   │
└──────────────────────────────────┘
```

**コンポーネント構成**:
```tsx
<HomePage>
  <Header />
  <Hero>
    <HeroImage />
    <HeroTitle />
    <HeroDescription />
    <FeatureList />
    <StartButton />
  </Hero>
  <Footer />
</HomePage>
```

#### 3.3.2 質問ステップ画面 (`/questions/:step`)

**目的**: ユーザー情報を1つずつ収集

**レイアウト** (質問1: 年齢):
```
┌──────────────────────────────────┐
│   [←]  質問 1/4           [?]    │
├──────────────────────────────────┤
│                                   │
│   ●○○○                          │
│   プログレスバー                  │
│                                   │
│   現在のあなたの年齢を            │
│   教えてください                  │
│                                   │
│   ┌──────────────────┐          │
│   │     [  50  ] 歳  │          │
│   └──────────────────┘          │
│                                   │
│   年齢は将来設計の基準となります  │
│                                   │
│   ┌────────────────────┐         │
│   │  次へ  →           │         │
│   └────────────────────┘         │
│                                   │
└──────────────────────────────────┘
```

**質問の種類**:

1. **質問1: 年齢**
   - 入力タイプ: 数値入力
   - バリデーション: 0-120
   - ヘルプ: "現在の年齢を入力してください"

2. **質問2: 月間生活費**
   - 入力タイプ: 数値入力（円）
   - バリデーション: 0以上
   - ヘルプ: "大まかな金額で構いません"
   - デフォルト例示: "例: 150,000円"

3. **質問3: 利用可能な資産**
   - 入力タイプ: 数値入力（円）
   - バリデーション: 0以上
   - ヘルプ: "預貯金や親の資産など、生活に使える金額"

4. **質問4: 公的支援**
   - 入力タイプ: 選択 + 数値入力
   - 選択肢: なし / 障害年金 / 生活保護 / その他
   - 金額入力: "なし"以外を選んだ場合

**コンポーネント構成**:
```tsx
<QuestionPage step={currentStep}>
  <Header>
    <BackButton />
    <ProgressIndicator current={1} total={4} />
    <HelpButton />
  </Header>
  <QuestionContent>
    <ProgressBar current={1} total={4} />
    <QuestionTitle />
    <QuestionInput type="number" />
    <QuestionHint />
    <NavigationButtons>
      <BackButton />
      <NextButton />
    </NavigationButtons>
  </QuestionContent>
</QuestionPage>
```

#### 3.3.3 計算中画面 (`/calculating`)

**目的**: 計算処理中の待機とローディング表示

**レイアウト**:
```
┌──────────────────────────────────┐
│                                   │
│                                   │
│       [ローディングアニメーション]  │
│                                   │
│   あなたのライフプランを          │
│   計算しています...               │
│                                   │
│   もう少しお待ちください          │
│                                   │
└──────────────────────────────────┘
```

#### 3.3.4 結果表示画面 (`/result/:calculationId`)

**目的**: ライフプラン計算結果の可視化

**レイアウト**:
```
┌──────────────────────────────────┐
│   結果                   [共有]   │
├──────────────────────────────────┤
│   あなたのライフプラン            │
│                                   │
│   現在の状況では、約15年後        │
│   (2040年頃)に資金が不足する      │
│   可能性があります                │
│                                   │
│   [残高推移グラフ]                │
│                                   │
│   ┌─ サマリー ───────────┐      │
│   │ 現在の年齢: 50歳      │      │
│   │ 月間収支: -85,000円   │      │
│   │ 資産寿命: 約15年      │      │
│   └───────────────────┘      │
│                                   │
│   ┌─ AIのアドバイス ─────┐      │
│   │ でも大丈夫です。      │      │
│   │ 小さな工夫で改善...   │      │
│   └───────────────────┘      │
│                                   │
│   改善のヒント                    │
│   • 月々の生活費を10%削減...     │
│   • 障害年金などの追加支援...    │
│                                   │
│   ┌────────────────────┐         │
│   │  目標を設定する →  │         │
│   └────────────────────┘         │
│                                   │
│   ┌────────────────────┐         │
│   │  再計算する        │         │
│   └────────────────────┘         │
│                                   │
└──────────────────────────────────┘
```

**コンポーネント構成**:
```tsx
<ResultPage>
  <Header>
    <Title />
    <ShareButton />
  </Header>
  <ResultContent>
    <SummaryCard>
      <MainMessage />
      <DepletionWarning />
    </SummaryCard>
    <BalanceChart data={yearlyData} />
    <StatsSummary>
      <StatItem label="現在の年齢" value="50歳" />
      <StatItem label="月間収支" value="-85,000円" />
      <StatItem label="資産寿命" value="約15年" />
    </StatsSummary>
    <AIAdviceCard>
      <AdviceMessage />
    </AIAdviceCard>
    <SuggestionsList>
      <SuggestionItem />
      <SuggestionItem />
    </SuggestionsList>
    <ActionButtons>
      <GoToGoalsButton />
      <RecalculateButton />
    </ActionButtons>
  </ResultContent>
</ResultPage>
```

#### 3.3.5 目標設定画面 (`/goals/new`)

**目的**: 行動目標の設定

**レイアウト**:
```
┌──────────────────────────────────┐
│   [←]  目標を設定                │
├──────────────────────────────────┤
│                                   │
│   小さな一歩から始めましょう      │
│                                   │
│   AIのおすすめ目標:               │
│                                   │
│   ○ 1ヶ月に1回だけ支出を記録     │
│      してみる                     │
│                                   │
│   ○ 週に2回、図書館に行く        │
│                                   │
│   ○ 月に1度、自炊の日を作る      │
│                                   │
│   または、自分で目標を作成:       │
│   ┌──────────────────┐          │
│   │ 目標を入力...      │          │
│   └──────────────────┘          │
│                                   │
│   ┌────────────────────┐         │
│   │  目標を保存する    │         │
│   └────────────────────┘         │
│                                   │
│   あとでもできます                │
│                                   │
└──────────────────────────────────┘
```

## 4. コンポーネント設計

### 4.1 コンポーネント階層

```
App
├── Router
│   ├── Layout
│   │   ├── Header
│   │   ├── Main
│   │   │   ├── HomePage
│   │   │   ├── QuestionPage
│   │   │   │   ├── QuestionStep
│   │   │   │   ├── ProgressBar
│   │   │   │   └── QuestionInput
│   │   │   ├── CalculatingPage
│   │   │   ├── ResultPage
│   │   │   │   ├── BalanceChart
│   │   │   │   ├── StatsSummary
│   │   │   │   └── AIAdviceCard
│   │   │   └── GoalsPage
│   │   │       ├── GoalList
│   │   │       └── GoalItem
│   │   └── Footer
│   └── Providers
│       ├── SessionProvider
│       ├── ThemeProvider
│       └── ToastProvider
```

### 4.2 主要コンポーネント定義

#### 4.2.1 BalanceChart

**目的**: 年次残高推移をグラフ表示

```tsx
interface BalanceChartProps {
  data: YearlyData[];
  depletionYear?: number;
  currentYear: number;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({
  data,
  depletionYear,
  currentYear
}) => {
  // Chart.js設定
  const chartData = {
    labels: data.map(d => d.year),
    datasets: [{
      label: '残高（万円）',
      data: data.map(d => d.balance / 10000),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.parsed.y}万円`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}万円`
        }
      }
    }
  };

  return (
    <div className="h-64 md:h-96">
      <Line data={chartData} options={options} />
      {depletionYear && (
        <div className="mt-2 text-sm text-red-600">
          ⚠️ {depletionYear}年頃に資金が不足する可能性があります
        </div>
      )}
    </div>
  );
};
```

#### 4.2.2 QuestionInput

**目的**: 質問ごとの入力フォーム

```tsx
interface QuestionInputProps {
  type: 'number' | 'select' | 'radio';
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
  helpText?: string;
  placeholder?: string;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  type,
  label,
  value,
  onChange,
  options,
  validation,
  helpText,
  placeholder
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: any) => {
    // バリデーション
    if (validation) {
      if (validation.required && !newValue) {
        setError('この項目は必須です');
        return;
      }
      if (validation.min && newValue < validation.min) {
        setError(`${validation.min}以上の値を入力してください`);
        return;
      }
      if (validation.max && newValue > validation.max) {
        setError(`${validation.max}以下の値を入力してください`);
        return;
      }
    }

    setError(null);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="text-lg font-medium text-gray-900">
        {label}
      </label>

      {type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          placeholder={placeholder}
          className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      )}

      {type === 'select' && options && (
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {helpText && (
        <p className="text-sm text-gray-600">{helpText}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

#### 4.2.3 ProgressBar

**目的**: 質問の進捗を視覚的に表示

```tsx
interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total
}) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          質問 {current} / {total}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

## 5. 状態管理

### 5.1 Context構成

```tsx
// SessionContext: セッション管理
interface SessionContextType {
  sessionId: string | null;
  isLoading: boolean;
  createSession: () => Promise<void>;
  clearSession: () => void;
}

// QuestionContext: 質問回答の状態管理
interface QuestionContextType {
  answers: QuestionAnswers;
  currentStep: number;
  setAnswer: (step: number, value: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetAnswers: () => void;
}

// CalculationContext: 計算結果の状態管理
interface CalculationContextType {
  calculation: CalculationResult | null;
  isCalculating: boolean;
  calculate: (input: CalculationInput) => Promise<void>;
  clearCalculation: () => void;
}

// GoalContext: 目標管理
interface GoalContextType {
  goals: Goal[];
  isLoading: boolean;
  addGoal: (goal: CreateGoalInput) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  fetchGoals: () => Promise<void>;
}
```

### 5.2 状態管理の例

```tsx
// contexts/QuestionContext.tsx
export const QuestionProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(questionReducer, initialState);

  const setAnswer = useCallback((step: number, value: any) => {
    dispatch({ type: 'SET_ANSWER', payload: { step, value } });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS_STEP' });
  }, []);

  const value = {
    answers: state.answers,
    currentStep: state.currentStep,
    setAnswer,
    nextStep,
    previousStep,
    resetAnswers: () => dispatch({ type: 'RESET' })
  };

  return (
    <QuestionContext.Provider value={value}>
      {children}
    </QuestionContext.Provider>
  );
};
```

## 6. スタイリング

### 6.1 デザインシステム

#### カラーパレット

```js
// tailwind.config.js
module.exports = {
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
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          500: '#737373',
          700: '#404040',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: [
          'Noto Sans JP',
          'Hiragino Kaku Gothic ProN',
          'Hiragino Sans',
          'sans-serif'
        ],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    }
  }
};
```

#### タイポグラフィ

- **見出し**: 太字、大きめのサイズ
- **本文**: 読みやすい行間（1.6〜1.8）
- **注釈**: 小さめ、グレー

#### レイアウト

- **最大幅**: 768px (モバイル中心)
- **余白**: 一貫したスペーシング
- **カード**: 角丸、シャドウ控えめ

### 6.2 レスポンシブデザイン

```scss
// ブレークポイント
sm: 640px   // スマホ横向き
md: 768px   // タブレット
lg: 1024px  // ノートPC
xl: 1280px  // デスクトップ
```

```tsx
// 使用例
<div className="
  px-4 py-6
  md:px-8 md:py-10
  lg:px-12 lg:py-14
">
  {/* コンテンツ */}
</div>
```

## 7. アクセシビリティ

### 7.1 対応事項

- **キーボード操作**: Tab, Enter, Escapeでの操作対応
- **スクリーンリーダー**: ARIA属性の適切な使用
- **色覚異常**: カラーだけに依存しない表現
- **コントラスト**: WCAG AA基準（4.5:1以上）
- **フォーカス表示**: 明確なフォーカスリング

### 7.2 実装例

```tsx
<button
  aria-label="次の質問へ進む"
  aria-describedby="question-help"
  className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
>
  次へ
</button>

<div id="question-help" className="sr-only">
  この質問はあなたの将来設計に使用されます
</div>
```

## 8. パフォーマンス最適化

### 8.1 コード分割

```tsx
// 遅延ロード
const ResultPage = lazy(() => import('./pages/Result'));
const GoalsPage = lazy(() => import('./pages/Goals'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/result/:id" element={<ResultPage />} />
    <Route path="/goals" element={<GoalsPage />} />
  </Routes>
</Suspense>
```

### 8.2 画像最適化

- WebP形式の使用
- 遅延ローディング
- レスポンシブ画像

```tsx
<img
  src="hero.webp"
  alt="イメージ"
  loading="lazy"
  srcSet="hero-sm.webp 640w, hero-md.webp 768w"
  sizes="(max-width: 640px) 100vw, 768px"
/>
```

### 8.3 メモ化

```tsx
const expensiveCalculation = useMemo(() => {
  return calculateBalanceProjection(data);
}, [data]);

const handleSubmit = useCallback((values) => {
  onSubmit(values);
}, [onSubmit]);
```

## 9. テスト

### 9.1 テスト戦略

- **単体テスト**: Vitest + React Testing Library
- **コンポーネントテスト**: Storybook
- **E2Eテスト**: Playwright

### 9.2 テスト例

```tsx
// BalanceChart.test.tsx
import { render, screen } from '@testing-library/react';
import { BalanceChart } from './BalanceChart';

describe('BalanceChart', () => {
  const mockData = [
    { year: 2025, age: 50, balance: 10000000, annual_income: 780000, annual_expenses: 1800000, net_change: -1020000 },
    { year: 2026, age: 51, balance: 8980000, annual_income: 780000, annual_expenses: 1800000, net_change: -1020000 }
  ];

  it('グラフを正しく描画する', () => {
    render(<BalanceChart data={mockData} currentYear={2025} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('資金枯渇年が設定されている場合、警告を表示する', () => {
    render(
      <BalanceChart
        data={mockData}
        currentYear={2025}
        depletionYear={2040}
      />
    );
    expect(screen.getByText(/2040年頃に資金が不足/)).toBeInTheDocument();
  });
});
```

## 10. 今後の拡張

- PWA対応（オフライン機能）
- ダークモード
- 多言語対応 (i18n)
- データエクスポート (PDF/CSV)
- SNSシェア機能
- チャットボット風UI
- アニメーション強化
