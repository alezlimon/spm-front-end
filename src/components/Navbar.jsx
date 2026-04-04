import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navStyle = {
  background: '#050608',
  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const navInnerStyle = {
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '0 24px',
  minHeight: '68px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px'
};

const brandStyle = {
  color: '#F5F7FA',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1.05rem',
  letterSpacing: '-0.04em'
};

const logoutStyle = {
  color: 'rgba(245, 247, 250, 0.72)',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.88rem',
  letterSpacing: '0.01em',
  transition: 'color 0.18s ease',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer'
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