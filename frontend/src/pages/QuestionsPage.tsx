import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestion } from '@/contexts/QuestionContext';
import QuestionLayout from '@/components/layout/QuestionLayout';
import Input from '@/components/common/Input';
import { SUPPORT_TYPES, VALIDATION } from '@/constants';

export default function QuestionsPage() {
  const navigate = useNavigate();
  const { currentStep, answers, setAnswer, nextStep, isValid } = useQuestion();
  const [localError, setLocalError] = useState<string>('');

  // Clear error when step changes
  useEffect(() => {
    setLocalError('');
  }, [currentStep]);

  const handleNext = () => {
    // Validate current step
    if (!isValid) {
      setLocalError('入力内容を確認してください');
      return;
    }

    if (currentStep < 4) {
      nextStep();
    } else {
      // Navigate to calculation page
      navigate('/calculating');
    }
  };

  const renderQuestion = () => {
    switch (currentStep) {
      case 1:
        return (
          <QuestionStep1
            value={answers.age}
            onChange={(value) => setAnswer('age', value)}
            error={localError}
          />
        );
      case 2:
        return (
          <QuestionStep2
            value={answers.monthly_expenses}
            onChange={(value) => setAnswer('monthly_expenses', value)}
            error={localError}
          />
        );
      case 3:
        return (
          <QuestionStep3
            value={answers.total_assets}
            onChange={(value) => setAnswer('total_assets', value)}
            error={localError}
          />
        );
      case 4:
        return (
          <QuestionStep4
            supportType={answers.support_type}
            monthlySupport={answers.monthly_support}
            onSupportTypeChange={(value) => setAnswer('support_type', value)}
            onMonthlySupportChange={(value) => setAnswer('monthly_support', value)}
            error={localError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <QuestionLayout
      onNext={handleNext}
      nextDisabled={!isValid}
      nextLabel={currentStep === 4 ? '計算する' : '次へ →'}
    >
      {renderQuestion()}
    </QuestionLayout>
  );
}

// Question Step 1: Age
function QuestionStep1({
  value,
  onChange,
  error,
}: {
  value?: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numValue = parseInt(val, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        現在のあなたの年齢を
        <br />
        教えてください
      </h2>

      <Input
        type="number"
        value={inputValue}
        onChange={handleChange}
        placeholder="例: 50"
        min={VALIDATION.AGE.MIN}
        max={VALIDATION.AGE.MAX}
        required
        error={error}
        helpText="年齢は将来設計の基準となります"
        className="text-2xl"
        autoFocus
      />

      <div className="text-sm text-gray-500">
        <p>※ 現在の年齢を入力してください（{VALIDATION.AGE.MIN}〜{VALIDATION.AGE.MAX}歳）</p>
      </div>
    </div>
  );
}

// Question Step 2: Monthly Expenses
function QuestionStep2({
  value,
  onChange,
  error,
}: {
  value?: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numValue = parseInt(val, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        1か月あたりの生活費を
        <br />
        教えてください
      </h2>

      <Input
        type="number"
        value={inputValue}
        onChange={handleChange}
        placeholder="例: 150000"
        min={VALIDATION.MONTHLY_EXPENSES.MIN}
        max={VALIDATION.MONTHLY_EXPENSES.MAX}
        required
        error={error}
        helpText="大まかな金額で構いません。食費、光熱費、通信費などの合計です。"
        className="text-2xl"
        autoFocus
      />

      <div className="text-sm text-gray-500">
        <p>※ 月々の支出額を円単位で入力してください</p>
        <p className="mt-1">目安: 一人暮らしで10万〜15万円程度</p>
      </div>
    </div>
  );
}

// Question Step 3: Total Assets
function QuestionStep3({
  value,
  onChange,
  error,
}: {
  value?: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numValue = parseInt(val, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        現在、利用できる資産は
        <br />
        どのくらいありますか？
      </h2>

      <Input
        type="number"
        value={inputValue}
        onChange={handleChange}
        placeholder="例: 10000000"
        min={VALIDATION.TOTAL_ASSETS.MIN}
        max={VALIDATION.TOTAL_ASSETS.MAX}
        required
        error={error}
        helpText="預貯金や親の資産など、生活に使える金額を入力してください"
        className="text-2xl"
        autoFocus
      />

      <div className="text-sm text-gray-500">
        <p>※ 現在利用可能な資産の総額を円単位で入力してください</p>
        <p className="mt-1">親の資産を含めても構いません</p>
      </div>
    </div>
  );
}

// Question Step 4: Public Support
function QuestionStep4({
  supportType,
  monthlySupport,
  onSupportTypeChange,
  onMonthlySupportChange,
  error,
}: {
  supportType?: string;
  monthlySupport?: number;
  onSupportTypeChange: (value: string) => void;
  onMonthlySupportChange: (value: number) => void;
  error?: string;
}) {
  const [inputValue, setInputValue] = useState(monthlySupport?.toString() || '');
  const selectedType = supportType || 'none';

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSupportTypeChange(value);

    // Reset amount if "none" is selected
    if (value === 'none') {
      setInputValue('0');
      onMonthlySupportChange(0);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numValue = parseInt(val, 10);
    if (!isNaN(numValue)) {
      onMonthlySupportChange(numValue);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        公的支援を受けていますか？
      </h2>

      <div>
        <label className="block text-lg font-medium text-gray-900 mb-2">
          支援の種類
        </label>
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className="input"
        >
          {SUPPORT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {selectedType !== 'none' && (
        <Input
          type="number"
          value={inputValue}
          onChange={handleAmountChange}
          placeholder="例: 65000"
          min={VALIDATION.MONTHLY_SUPPORT.MIN}
          max={VALIDATION.MONTHLY_SUPPORT.MAX}
          label="月間受給額（円）"
          error={error}
          helpText="毎月受け取っている金額を入力してください"
          className="text-2xl"
        />
      )}

      <div className="text-sm text-gray-500">
        <p>※ 障害年金や生活保護など、定期的に受け取っている支援があれば選択してください</p>
        <p className="mt-1">受けていない場合は「なし」を選択してください</p>
      </div>
    </div>
  );
}
