import { APP_NAME } from '@/constants';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-6">
          {APP_NAME}
        </h1>
        <p className="text-xl md:text-2xl text-neutral-700 mb-4">
          将来のお金の不安を
          <br />
          見える化しましょう
        </p>
        <p className="text-base md:text-lg text-neutral-600 mb-8">
          簡単な質問に答えるだけで、あなたの将来設計が分かります
        </p>

        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-2 text-neutral-700">
            <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>質問は4つだけ（約3分）</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-neutral-700">
            <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>登録不要・匿名で使えます</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-neutral-700">
            <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>入力情報は保存されません</span>
          </div>
        </div>

        <button className="btn btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          はじめる →
        </button>

        <div className="mt-12 text-sm text-neutral-500">
          <a href="#" className="hover:text-primary-600 transition-colors mr-4">
            詳しく見る
          </a>
          <a href="#" className="hover:text-primary-600 transition-colors">
            プライバシー
          </a>
        </div>
      </div>
    </div>
  );
}
