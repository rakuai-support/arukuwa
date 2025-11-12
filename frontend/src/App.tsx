import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { QuestionProvider } from '@/contexts/QuestionContext';

// Pages
import HomePage from '@/pages/HomePage';
import QuestionsPage from '@/pages/QuestionsPage';

function App() {
  return (
    <Router>
      <QuestionProvider>
        <div className="min-h-screen bg-neutral-50">
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.QUESTIONS} element={<QuestionsPage />} />
            {/* More routes will be added here */}
          </Routes>
        </div>
      </QuestionProvider>
    </Router>
  );
}

export default App;
