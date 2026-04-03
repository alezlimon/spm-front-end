import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function PropertyOverviewPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      setError('');

      try {
        const [propertyRes, overviewRes] = await Promise.all([
          fetch(`${API_URL}/properties/${propertyId}`),
          fetch(`${API_URL}/properties/${propertyId}/overview`)
        ]);

        if (!propertyRes.ok || !overviewRes.ok) {
          throw new Error('Could not load overview data');
        }

        const [propertyData, overviewData] = await Promise.all([
          propertyRes.json(),
          overviewRes.json()
        ]);

        setProperty(propertyData?.property || propertyData || null);
        setOverview(overviewData || null);
      } catch (err) {
        setError('Could not load overview data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [propertyId]);

  const metrics = useMemo(() => {
    return {
      arrivalsCompleted: overview?.arrivalsCompleted ?? 0,
      arrivalsPending: overview?.arrivalsPending ?? 0,
      departuresCompleted: overview?.departuresCompleted ?? 0,
      departuresPending: overview?.departuresPending ?? 0,
      occupancy: overview?.occupancyPercent ?? 0,
      availableRooms: overview?.availableRooms ?? 0,
      totalRooms: overview?.totalRooms ?? 0
    };
  }, [overview]);

  return (
    <div className="app">
      <header className="header">
        <h1>{property?.name || 'Property'} Overview</h1>
        <p>Daily operational snapshot for arrivals, departures, occupancy, and room availability.</p>
      </header>

      {loading && <p className="page-feedback">Loading overview...</p>}
      {error && <p className="page-feedback page-feedback-error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="rooms-kpi-grid" style={{ marginBottom: '20px' }}>
            <article className="summary-card">
              <h3>Arrivals</h3>
              <p style={{ fontSize: '0.95rem' }}>
                Completed: <strong>{metrics.arrivalsCompleted}</strong>
              </p>
              <p style={{ fontSize: '0.95rem' }}>
                Pending: <strong>{metrics.arrivalsPending}</strong>
              </p>
            </article>

            <article className="summary-card">
              <h3>Departures</h3>
              <p style={{ fontSize: '0.95rem' }}>
                Completed: <strong>{metrics.departuresCompleted}</strong>
              </p>
              <p style={{ fontSize: '0.95rem' }}>
                Pending: <strong>{metrics.departuresPending}</strong>
              </p>
            </article>

            <article className="summary-card">
              <h3>Occupancy</h3>
              <p>{metrics.occupancy}%</p>
              <p style={{ fontSize: '0.85rem' }}>
                {metrics.totalRooms} total rooms
              </p>
            </article>

            <article className="summary-card">
              <h3>Available Rooms</h3>
              <p>{metrics.availableRooms}</p>
              <p style={{ fontSize: '0.85rem' }}>Ready to assign</p>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
