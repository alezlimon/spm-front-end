import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const navStyle = {
  background: 'rgba(5, 6, 8, 0.82)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(14px)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)'
};

const navInnerStyle = {
  maxWidth: '1360px',
  margin: '0 auto',
  padding: '0 clamp(12px, 4vw, 32px)',
  minHeight: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px'
};

const brandStyle = {
  color: '#F5F7FA',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 'clamp(1rem, 2.8vw, 1.08rem)',
  letterSpacing: '-0.05em'
};

const logoutStyle = {
  color: 'rgba(245, 247, 250, 0.82)',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.88rem',
  letterSpacing: '0.01em',
  transition: 'color 0.18s ease',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  cursor: 'pointer',
  borderRadius: '999px',
  padding: '7px 12px',
  whiteSpace: 'nowrap'
};

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={navStyle}>
      <div style={navInnerStyle}>
        <NavLink to="/properties" style={brandStyle}>
          Reva
        </NavLink>

        <button type="button" style={logoutStyle} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}