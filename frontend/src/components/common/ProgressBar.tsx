interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export default function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full mb-6">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            質問 {current} / {total}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {percentage}%
          </span>
        </div>
      )}

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              step < current
                ? 'bg-primary-500 text-white'
                : step === current
                ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < current ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              step
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
