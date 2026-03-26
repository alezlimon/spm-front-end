import { NavLink } from 'react-router-dom';

const navStyle = {
  background: '#1E1A17',
  borderBottom: '1px solid rgba(255, 248, 240, 0.08)',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const navInnerStyle = {
  maxWidth: '1020px',
  margin: '0 auto',
  padding: '0 22px',
  minHeight: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px'
};

const brandStyle = {
  color: '#FFF9F2',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  letterSpacing: '-0.02em'
};

const navLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const getLinkStyle = ({ isActive }) => ({
  color: isActive ? '#FFFDF8' : 'rgba(255, 248, 240, 0.72)',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.93rem',
  letterSpacing: '0.01em',
  padding: '8px 14px',
  borderRadius: '999px',
  background: isActive ? '#332C26' : 'transparent',
  border: isActive ? '1px solid rgba(255, 248, 240, 0.08)' : '1px solid transparent',
  transition: 'all 0.18s ease'
});

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <div style={navInnerStyle}>
        <NavLink to="/" style={brandStyle} end>
          StayFlow
        </NavLink>

        <div style={navLinksStyle}>
          <NavLink to="/" style={getLinkStyle} end>
            Home
          </NavLink>

          <NavLink to="/guests" style={getLinkStyle}>
            Guests
          </NavLink>

          <NavLink to="/rooms" style={getLinkStyle}>
            Rooms
          </NavLink>

          <NavLink to="/bookings" style={getLinkStyle}>
            Bookings
          </NavLink>
        </div>
      </div>
    </nav>
  );
}