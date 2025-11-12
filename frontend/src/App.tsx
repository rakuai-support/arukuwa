import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { QuestionProvider } from '@/contexts/QuestionContext';

// Pages
import HomePage from '@/pages/HomePage';
import QuestionsPage from '@/pages/QuestionsPage';
import CalculatingPage from '@/pages/CalculatingPage';
import ResultPage from '@/pages/ResultPage';

function App() {
  return (
    <Router>
      <QuestionProvider>
        <div className="min-h-screen bg-neutral-50">
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.QUESTIONS} element={<QuestionsPage />} />
            <Route path={ROUTES.CALCULATING} element={<CalculatingPage />} />
            <Route path={ROUTES.RESULT} element={<ResultPage />} />
            {/* More routes will be added here */}
          </Routes>
        </div>
      </QuestionProvider>
    </Router>
  );
}

export default App;
