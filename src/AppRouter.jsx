import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestsPage from './components/GuestsPage';
import App from './App';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/guests" element={<GuestsPage />} />
      </Routes>
    </Router>
  );
}
