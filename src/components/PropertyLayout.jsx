import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { getProperty } from '../api/propertiesApi';

const subNavStyle = {
  background: 'rgba(13, 14, 16, 0.82)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(14px)',
  position: 'sticky',
  top: '72px',
  zIndex: 90,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.12)'
};

const subNavInnerStyle = {
  maxWidth: '1360px',
  margin: '0 auto',
  padding: '0 32px',
  minHeight: '58px',
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
  color: 'rgba(245, 247, 250, 0.52)',
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
  color: 'rgba(255, 255, 255, 0.18)',
  fontSize: '0.85rem'
};

const titleStyle = {
  color: '#F5F7FA',
  fontWeight: 600,
  fontSize: '0.95rem',
  letterSpacing: '-0.02em',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px'
};

const typeStyle = {
  color: 'rgba(245, 247, 250, 0.58)',
  fontSize: '0.74rem',
  fontWeight: 500,
  marginLeft: '8px',
  padding: '3px 7px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.03)'
};

const tabsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '3px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.05)'
};

const billingTabStyle = ({ isActive }) => ({
  ...getTabStyle({ isActive }),
  marginLeft: '18px'
});

const getTabStyle = ({ isActive }) => ({
  color: isActive ? '#FFFFFF' : 'rgba(245, 247, 250, 0.54)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 500,
  fontSize: '0.88rem',
  letterSpacing: '0.01em',
  padding: '7px 12px',
  borderRadius: '999px',
  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
  border: isActive ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
  transition: 'all 0.18s ease'
});

export default function PropertyLayout() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getProperty(propertyId);
        setProperty(data);
      } catch {
        setProperty(null);
      }
    };

    fetchProperty();
  }, [propertyId]);

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
              <Link to={`/properties/${propertyId}/overview`} style={titleStyle}>
                <span>{property?.name || 'Property'}</span>
                {property?.type && <span style={typeStyle}>{property.type}</span>}
              </Link>
            </div>
          </div>

          <div style={tabsStyle}>
            <NavLink to={`/properties/${propertyId}/bookings`} style={getTabStyle}>
              Reservations
            </NavLink>
            <NavLink to={`/properties/${propertyId}/rooms`} style={getTabStyle}>
              Rooms
            </NavLink>
            <NavLink to={`/properties/${propertyId}/guests`} style={getTabStyle}>
              Guests
            </NavLink>
            <NavLink to={`/properties/${propertyId}/billing`} style={billingTabStyle}>
              Billing
            </NavLink>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}
