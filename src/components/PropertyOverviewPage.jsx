import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProperty, getPropertyOverview } from '../api/propertiesApi';
import { ErrorState, LoadingState } from './PageState';
import '../App.css';

const containerStyle = {
  maxWidth: '980px',
  margin: '0 auto'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px'
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '16px',
  padding: '22px',
  cursor: 'pointer',
  minHeight: '150px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease'
};

const labelStyle = {
  margin: 0,
  fontSize: '0.72rem',
  lineHeight: 1.2,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: '#9f968d'
};

const valueStyle = {
  fontSize: '2.1rem',
  lineHeight: 1,
  letterSpacing: '-0.05em',
  fontWeight: 600,
  color: '#f8f2ea'
};

const subStyle = {
  margin: 0,
  fontSize: '0.9rem',
  lineHeight: 1.45,
  color: '#b8aea3'
};

const metaStripStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginBottom: '18px'
};

const metaChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '34px',
  padding: '8px 12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.02)',
  color: '#ddd4ca',
  fontSize: '0.78rem',
  lineHeight: 1.2,
  letterSpacing: '0.02em',
  fontWeight: 500
};

export default function PropertyOverviewPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      setError('');

      try {
        const [propertyData, overviewData] = await Promise.all([
          getProperty(propertyId),
          getPropertyOverview(propertyId)
        ]);

        setProperty(propertyData || null);
        setOverview(overviewData || null);
      } catch {
        setError('Could not load overview data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [propertyId]);

  const metrics = useMemo(() => {
    return {
      propertyType: overview?.propertyType || property?.propertyType || 'hotel',
      operationalMode: overview?.operationalMode || 'hotel',
      unitStatus: overview?.unitStatus || null,
      arrivalsPending: overview?.arrivalsPending ?? 0,
      departuresPending: overview?.departuresPending ?? 0,
      occupancy: overview?.occupancyPercent ?? 0,
      availableRooms: overview?.availableRooms ?? 0,
      totalRooms: overview?.totalRooms ?? 0,
      dirtyRooms: overview?.dirtyRooms ?? 0,
      occupiedRooms: overview?.occupiedRooms ?? 0
    };
  }, [overview, property]);

  const today = new Date().toISOString().slice(0, 10);
  const isVilla = metrics.operationalMode === 'villa';

  return (
    <div className="app">
      <header className="header">
        <h1>{property?.name || 'Property'} Overview</h1>
        <p>Daily operations snapshot</p>
      </header>

      {loading && <LoadingState message="Loading overview..." />}
      {!loading && <ErrorState message={error} />}

      {!loading && !error && (
        <div style={containerStyle}>
          <div style={metaStripStyle}>
            <div style={metaChipStyle}>
              {isVilla ? 'Property Type: Villa' : 'Property Type: Hotel'}
            </div>

            {isVilla ? (
              <div style={metaChipStyle}>
                Status: {metrics.unitStatus || 'Available'}
              </div>
            ) : (
              <>
                <div style={metaChipStyle}>
                  {metrics.occupancy}% occupancy
                </div>
                <div style={metaChipStyle}>
                  {metrics.totalRooms} total rooms
                </div>
                <div style={metaChipStyle}>
                  {metrics.availableRooms} available
                </div>
                <div style={metaChipStyle}>
                  {metrics.dirtyRooms} dirty
                </div>
              </>
            )}
          </div>

          <div style={gridStyle}>
            <article
              className="summary-card"
              style={cardStyle}
              onClick={() => navigate(`/properties/${propertyId}/bookings?date=${today}&status=Confirmed`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/properties/${propertyId}/bookings?date=${today}&status=Confirmed`);
                }
              }}
            >
              <h3 style={labelStyle}>Arrivals Today</h3>
              <div style={valueStyle}>{metrics.arrivalsPending}</div>
              <p style={subStyle}>
                {metrics.arrivalsPending === 0 ? 'No arrivals today' : 'Pending check-ins'}
              </p>
            </article>

            <article
              className="summary-card"
              style={cardStyle}
              onClick={() => navigate(`/properties/${propertyId}/bookings?date=${today}&status=Checked-in`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/properties/${propertyId}/bookings?date=${today}&status=Checked-in`);
                }
              }}
            >
              <h3 style={labelStyle}>Departures Today</h3>
              <div style={valueStyle}>{metrics.departuresPending}</div>
              <p style={subStyle}>
                {metrics.departuresPending === 0 ? 'No departures today' : 'Pending check-outs'}
              </p>
            </article>

            <article
              className="summary-card"
              style={cardStyle}
              onClick={() => navigate(`/properties/${propertyId}/rooms?status=Dirty`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/properties/${propertyId}/rooms?status=Dirty`);
                }
              }}
            >
              <h3 style={labelStyle}>{isVilla ? 'Cleaning Status' : 'Dirty Rooms'}</h3>
              <div style={valueStyle}>{metrics.dirtyRooms}</div>
              <p style={subStyle}>
                {metrics.dirtyRooms === 0 ? 'No cleaning needed' : 'Needs housekeeping'}
              </p>
            </article>

            <article
              className="summary-card"
              style={cardStyle}
              onClick={() => navigate(`/properties/${propertyId}/rooms?status=Available`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/properties/${propertyId}/rooms?status=Available`);
                }
              }}
            >
              <h3 style={labelStyle}>{isVilla ? 'Unit Availability' : 'Available Rooms'}</h3>
              <div style={valueStyle}>{metrics.availableRooms}</div>
              <p style={subStyle}>
                {isVilla ? 'Ready to book' : 'Ready to assign'}
              </p>
            </article>

            {!isVilla && (
              <article
                className="summary-card"
                style={cardStyle}
                onClick={() => navigate(`/properties/${propertyId}/rooms`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/properties/${propertyId}/rooms`);
                  }
                }}
              >
                <h3 style={labelStyle}>Occupancy</h3>
                <div style={valueStyle}>{metrics.occupancy}%</div>
                <p style={subStyle}>{metrics.totalRooms} total rooms</p>
              </article>
            )}
          </div>
        </div>
      )}
    </div>
  );
}