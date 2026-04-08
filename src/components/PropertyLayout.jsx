import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { getProperty } from '../api/propertiesApi';

const subNavStyle = {
  background: 'rgba(13, 14, 16, 0.82)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(14px)',
  position: 'sticky',
  top: '64px',
  zIndex: 90,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.12)'
};

const subNavInnerStyle = {
  maxWidth: '1360px',
  margin: '0 auto',
  padding: '0 clamp(12px, 4vw, 32px)',
  minHeight: '58px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px'
};

const propertyNameStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: 0
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
  gap: '6px',
  minWidth: 0
};

const propertyTitleTextStyle = {
  maxWidth: '180px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
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

const mobileMenuButtonStyle = ({ isOpen }) => ({
  color: '#F5F7FA',
  background: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  fontSize: '0.83rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
  padding: '8px 10px',
  lineHeight: 1,
  cursor: 'pointer'
});

const mobileTabsPanelStyle = {
  margin: '0 clamp(12px, 4vw, 32px) 10px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(8, 10, 14, 0.96)',
  padding: '8px',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '6px'
};

const getMobileTabStyle = ({ isActive }) => ({
  color: isActive ? '#FFFFFF' : 'rgba(245, 247, 250, 0.66)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 500,
  fontSize: '0.92rem',
  letterSpacing: '0.01em',
  padding: '10px 12px',
  borderRadius: '10px',
  background: isActive ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
  border: isActive ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent'
});

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div style={subNavInnerStyle} className="property-subnav-inner">
          <div style={propertyNameStyle} className="property-subnav-name-wrap">
            <Link to="/properties" style={backLinkStyle} className="property-subnav-back">
              ← Properties
            </Link>
            <span style={separatorStyle}>·</span>
            <div>
              <Link to={`/properties/${propertyId}/overview`} style={titleStyle} className="property-subnav-title-link">
                <span style={propertyTitleTextStyle} className="property-subnav-title-text">{property?.name || 'Property'}</span>
                {property?.type && <span style={typeStyle} className="property-subnav-type">{property.type}</span>}
              </Link>
            </div>
          </div>

          <button
            type="button"
            className="property-tabs-mobile-toggle"
            style={mobileMenuButtonStyle({ isOpen: isMenuOpen })}
            onClick={() => setIsMenuOpen((previous) => !previous)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle property navigation"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>

          <div style={tabsStyle} className="property-tabs-desktop">
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

        {isMenuOpen && (
          <div style={mobileTabsPanelStyle} className="property-tabs-mobile-panel">
            <NavLink to={`/properties/${propertyId}/bookings`} style={getMobileTabStyle} onClick={() => setIsMenuOpen(false)}>
              Reservations
            </NavLink>
            <NavLink to={`/properties/${propertyId}/rooms`} style={getMobileTabStyle} onClick={() => setIsMenuOpen(false)}>
              Rooms
            </NavLink>
            <NavLink to={`/properties/${propertyId}/guests`} style={getMobileTabStyle} onClick={() => setIsMenuOpen(false)}>
              Guests
            </NavLink>
            <NavLink to={`/properties/${propertyId}/billing`} style={getMobileTabStyle} onClick={() => setIsMenuOpen(false)}>
              Billing
            </NavLink>
          </div>
        )}
      </nav>

      <Outlet />
    </>
  );
}
