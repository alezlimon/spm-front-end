import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import GuestsPage from './components/GuestsPage';
import RoomsPage from './components/RoomsPage';
import BookingsPage from './components/BookingsPage';
import AuthPage from './components/AuthPage';
import PropertiesPage from './components/PropertiesPage';
import Navbar from './components/Navbar';
import PropertyDetailPage from './components/PropertyDetailPage';

function AppLayout() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
        <Route path="/guests" element={<GuestsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Routes>
    </>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}