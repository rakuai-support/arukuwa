import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { calculationService } from '@/services/calculationService';
import Button from '@/components/common/Button';
import { APP_NAME, CHART_COLORS, ROUTES } from '@/constants';
import type { CalculationResult } from '@/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { calculationId } = useParams<{ calculationId: string }>();

  const [result, setResult] = useState<CalculationResult | null>(
    location.state?.result || null
  );
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // If we don't have result from state, fetch it
    if (!result && calculationId) {
      const fetchResult = async () => {
        try {
          const data = await calculationService.getCalculation(calculationId);
          setResult(data);
        } catch (err) {
          console.error('Failed to fetch calculation:', err);
          setError('計算結果の取得に失敗しました');
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    }
  }, [calculationId, result]);

  const handleRestart = () => {
    navigate(ROUTES.HOME);
  };

  const handleNewGoal = () => {
    navigate(ROUTES.GOALS_NEW, { state: { calculationId: result?.calculation_id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">
            {error || '結果を表示できません'}
          </h2>
          <p className="text-neutral-600 mb-6">
            もう一度最初からやり直してください
          </p>
          <Button variant="primary" onClick={handleRestart}>
            最初に戻る
          </Button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: result.yearly_data.map((d) => `${d.age}歳`),
    datasets: [
      {
        label: '資産残高',
        data: result.yearly_data.map((d) => d.balance),
        borderColor: CHART_COLORS.PRIMARY,
        backgroundColor: CHART_COLORS.PRIMARY_LIGHT,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `資産: ¥${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            if (value >= 10000000) {
              return `${(value / 10000000).toFixed(0)}千万`;
            } else if (value >= 10000) {
              return `${(value / 10000).toFixed(0)}万`;
            }
            return value.toLocaleString();
          },
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const isAtRisk = result.depletion_age !== null && result.depletion_age < 100;
  const riskLevel = result.risk_level || 'medium';

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600 mb-2">
            {APP_NAME}
          </h1>
          <p className="text-neutral-600">
            あなたの将来設計の分析結果
          </p>
        </div>

        {/* Summary Card */}
        <div className={`card mb-6 ${isAtRisk ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
          <h2 className="text-xl font-bold text-neutral-800 mb-4">
            総合診断
          </h2>

          {isAtRisk ? (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-800">
                    資産が<span className="text-red-600 font-bold">{result.depletion_age}歳</span>で枯渇する可能性があります
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    現在の生活を続けた場合、約{result.depletion_age - (result.yearly_data[0]?.age || 0)}年後に資産が尽きる計算です
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-800">
                    資産は長期的に維持できる見込みです
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    現在の生活水準を維持できると予測されます
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            資産残高の推移
          </h3>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            ※ この予測は入力された情報に基づく簡易シミュレーションです。実際の将来を保証するものではありません。
          </p>
        </div>

        {/* AI Analysis */}
        {result.ai_analysis && (
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              AIからのアドバイス
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-neutral-700 whitespace-pre-line">
                {result.ai_analysis}
              </p>
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {result.risk_factors && result.risk_factors.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              注意すべきポイント
            </h3>
            <ul className="space-y-2">
              {result.risk_factors.map((risk, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span className="text-neutral-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions && result.suggestions.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              改善のための提案
            </h3>
            <ul className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span className="text-neutral-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="secondary"
            onClick={handleRestart}
            className="flex-1"
          >
            最初からやり直す
          </Button>
          <Button
            variant="primary"
            onClick={handleNewGoal}
            className="flex-1"
          >
            目標を設定する →
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>このシミュレーション結果は参考情報です</p>
          <p className="mt-1">詳しい相談が必要な場合は、専門家にご相談ください</p>
        </div>
      </div>
    </div>
  );
}
