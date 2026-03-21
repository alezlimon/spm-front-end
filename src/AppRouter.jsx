
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestsPage from './components/GuestsPage';
import RoomsPage from './components/RoomsPage';
import BookingsPage from './components/BookingsPage';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';

export default function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guests" element={<GuestsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Routes>
    </Router>
  );
}
