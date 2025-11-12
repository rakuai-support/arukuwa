import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestion } from '@/contexts/QuestionContext';
import { calculationService } from '@/services/calculationService';
import { APP_NAME, ROUTES } from '@/constants';
import type { CalculationInput } from '@/types';

export default function CalculatingPage() {
  const navigate = useNavigate();
  const { answers } = useQuestion();
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // Perform calculation
    const performCalculation = async () => {
      try {
        // Validate we have all required answers
        if (!answers.age || !answers.monthly_expenses || answers.total_assets === undefined) {
          setError('必要な情報が不足しています');
          setTimeout(() => navigate(ROUTES.QUESTIONS), 2000);
          return;
        }

        const input: CalculationInput = {
          user_info: {
            age: answers.age!,
            monthly_expenses: answers.monthly_expenses!,
            total_assets: answers.total_assets!,
            monthly_support: answers.monthly_support || 0,
            support_type: answers.support_type || 'none',
          },
        };

        const result = await calculationService.calculate(input);

        // Complete progress
        setProgress(100);

        // Wait a bit before navigating
        setTimeout(() => {
          // Navigate to result page with calculation ID
          navigate(`/result/${result.calculation_id}`, { state: { result } });
        }, 500);
      } catch (err) {
        console.error('Calculation error:', err);
        setError('計算中にエラーが発生しました。もう一度お試しください。');
        setTimeout(() => navigate(ROUTES.QUESTIONS), 3000);
      } finally {
        clearInterval(progressInterval);
      }
    };

    performCalculation();

    return () => {
      clearInterval(progressInterval);
    };
  }, [answers, navigate]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* App Name */}
        <h1 className="text-2xl font-bold text-primary-600 mb-8">
          {APP_NAME}
        </h1>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            {/* Spinning circle */}
            <div className="absolute inset-0 border-8 border-primary-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-8 border-transparent border-t-primary-500 rounded-full animate-spin"></div>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Text */}
        {error ? (
          <div className="mb-6">
            <p className="text-lg font-medium text-red-600 mb-2">
              {error}
            </p>
            <p className="text-sm text-neutral-600">
              質問画面に戻ります...
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-lg font-medium text-neutral-800 mb-2">
              計算しています...
            </p>
            <p className="text-sm text-neutral-600">
              あなたの将来設計を分析中です
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-neutral-500">{progress}%</p>

        {/* Loading steps */}
        {!error && (
          <div className="mt-8 space-y-2 text-left max-w-xs mx-auto">
            <div className={`flex items-center space-x-2 transition-opacity ${progress >= 30 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress >= 30 ? 'bg-primary-500' : 'bg-neutral-300'}`}>
                {progress >= 30 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-neutral-700">入力内容の確認</span>
            </div>
            <div className={`flex items-center space-x-2 transition-opacity ${progress >= 60 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress >= 60 ? 'bg-primary-500' : 'bg-neutral-300'}`}>
                {progress >= 60 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-neutral-700">将来設計のシミュレーション</span>
            </div>
            <div className={`flex items-center space-x-2 transition-opacity ${progress >= 90 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress >= 90 ? 'bg-primary-500' : 'bg-neutral-300'}`}>
                {progress >= 90 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-neutral-700">結果の準備</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
