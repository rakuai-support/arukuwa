import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '@/components/common/ProgressBar';
import Button from '@/components/common/Button';
import { useQuestion } from '@/contexts/QuestionContext';

interface QuestionLayoutProps {
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export default function QuestionLayout({
  children,
  onNext,
  onBack,
  nextDisabled = false,
  nextLabel = '次へ →',
}: QuestionLayoutProps) {
  const navigate = useNavigate();
  const { currentStep, totalSteps, previousStep } = useQuestion();

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
    } else if (onBack) {
      onBack();
    } else {
      previousStep();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>

          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="ヘルプ"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <ProgressBar current={currentStep} total={totalSteps} />

        {/* Main Content Card */}
        <div className="card mt-8">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex gap-4">
          <Button
            variant="secondary"
            onClick={handleBack}
            className="flex-1"
          >
            戻る
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            disabled={nextDisabled}
            className="flex-1"
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
