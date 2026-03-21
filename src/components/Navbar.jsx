import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{
      background: '#111827',
      padding: '12px 0',
      marginBottom: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#60a5fa' : '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '1.1em' })} end>Home</NavLink>
        <NavLink to="/guests" style={({ isActive }) => ({ color: isActive ? '#60a5fa' : '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '1.1em' })}>Guests</NavLink>
        <NavLink to="/rooms" style={({ isActive }) => ({ color: isActive ? '#60a5fa' : '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '1.1em' })}>Rooms</NavLink>
        <NavLink to="/bookings" style={({ isActive }) => ({ color: isActive ? '#60a5fa' : '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '1.1em' })}>Bookings</NavLink>
      </div>
    </nav>
  );
}
