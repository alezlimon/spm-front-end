import { NavLink } from 'react-router-dom';

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

const rightSideStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '28px'
};

const navLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '28px',
  flexWrap: 'wrap'
};

const logoutStyle = {
  color: 'rgba(245, 247, 250, 0.72)',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.88rem',
  letterSpacing: '0.01em',
  transition: 'color 0.18s ease'
};

const getLinkStyle = ({ isActive }) => ({
  color: isActive ? '#FFFFFF' : 'rgba(245, 247, 250, 0.64)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 500,
  fontSize: '0.93rem',
  letterSpacing: '0.01em',
  transition: 'color 0.18s ease'
});

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <div style={navInnerStyle}>
        <NavLink to="/properties" style={brandStyle}>
          Reva
        </NavLink>

        <div style={rightSideStyle}>
          <div style={navLinksStyle}>
            <NavLink to="/properties" style={getLinkStyle}>
              Properties
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

          <NavLink to="/" style={logoutStyle}>
            Log out
          </NavLink>
        </div>
      </div>
    </nav>
  );
}