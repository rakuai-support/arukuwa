import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants';

// Pages (will be implemented later)
import HomePage from '@/pages/HomePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-50">
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          {/* More routes will be added here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
