import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import GuestsPage from './components/GuestsPage';
import RoomsPage from './components/RoomsPage';
import BookingsPage from './components/BookingsPage';
import AuthPage from './components/AuthPage';
import PropertiesPage from './components/PropertiesPage';
import Navbar from './components/Navbar';
import PropertyLayout from './components/PropertyLayout';
import PropertyOverviewPage from './components/PropertyOverviewPage';
import { useAuth } from './context/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app"><p className="page-feedback">Loading session...</p></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const showNavbar = location.pathname !== '/' && isAuthenticated && !isLoading;

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/properties" replace /> : <AuthPage />} />
        <Route path="/properties" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
        <Route path="/properties/:propertyId" element={<ProtectedRoute><PropertyLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<PropertyOverviewPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="guests" element={<GuestsPage />} />
        </Route>
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