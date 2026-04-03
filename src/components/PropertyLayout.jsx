import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { PROPERTIES } from '../propertiesConfig';

const subNavStyle = {
  background: '#0D0E10',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  position: 'sticky',
  top: '68px',
  zIndex: 90
};

const subNavInnerStyle = {
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '0 24px',
  minHeight: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px'
};

const propertyNameStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const backLinkStyle = {
  color: 'rgba(245, 247, 250, 0.44)',
  textDecoration: 'none',
  fontSize: '0.83rem',
  fontWeight: 500,
  letterSpacing: '0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  transition: 'color 0.18s ease'
};

const separatorStyle = {
  color: 'rgba(255, 255, 255, 0.15)',
  fontSize: '0.85rem'
};

const titleStyle = {
  color: '#F5F7FA',
  fontWeight: 600,
  fontSize: '0.93rem',
  letterSpacing: '-0.02em'
};

const typeStyle = {
  color: 'rgba(245, 247, 250, 0.38)',
  fontSize: '0.78rem',
  fontWeight: 500,
  marginLeft: '8px'
};

const tabsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px'
};

const getTabStyle = ({ isActive }) => ({
  color: isActive ? '#FFFFFF' : 'rgba(245, 247, 250, 0.54)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 500,
  fontSize: '0.88rem',
  letterSpacing: '0.01em',
  padding: '5px 12px',
  borderRadius: '6px',
  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
  transition: 'all 0.18s ease'
});

export default function PropertyLayout() {
  const { propertyId } = useParams();
  const property = PROPERTIES.find((p) => p._id === propertyId);

  return (
    <>
      <nav style={subNavStyle}>
        <div style={subNavInnerStyle}>
          <div style={propertyNameStyle}>
            <Link to="/properties" style={backLinkStyle}>
              ← Properties
            </Link>
            <span style={separatorStyle}>·</span>
            <div>
              <span style={titleStyle}>{property?.name || 'Property'}</span>
              {property?.type && (
                <span style={typeStyle}>{property.type}</span>
              )}
            </div>
          </div>

          <div style={tabsStyle}>
            <NavLink to={`/properties/${propertyId}/rooms`} style={getTabStyle}>
              Rooms
            </NavLink>
            <NavLink to={`/properties/${propertyId}/bookings`} style={getTabStyle}>
              Bookings
            </NavLink>
            <NavLink to={`/properties/${propertyId}/guests`} style={getTabStyle}>
              Guests
            </NavLink>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}
