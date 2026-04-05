import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listInvoices } from '../api/billingApi';
import { listAllBookings } from '../api/bookingsApi';
import { listProperties } from '../api/propertiesApi';
import { listRooms } from '../api/roomsApi';
import { formatDisplayDate } from '../utils/date';
import { formatCurrency } from '../utils/money';
import { EmptyState, ErrorState, LoadingState } from './PageState';
import '../App.css';

import alpineHouseImage from '../assets/properties/Property Images/Alpine House.png';
import duneHouseImage from '../assets/properties/Property Images/Dune House.png';
import harborClubImage from '../assets/properties/Property Images/Harbor Club.png';
import riadNoirImage from '../assets/properties/Property Images/Riad Noir.png';
import villaAzureImage from '../assets/properties/Property Images/Villa Azure.png';
import villaMiradorImage from '../assets/properties/Property Images/Villa Mirador.png';
import villaSoleneImage from '../assets/properties/Property Images/Villa Solene.png';

const propertyImageMap = {
  'Alpine House': alpineHouseImage,
  'Dune House': duneHouseImage,
  'Harbor Club': harborClubImage,
  'Riad Noir': riadNoirImage,
  'Villa Azure': villaAzureImage,
  'Villa Mirador': villaMiradorImage,
  'Villa Solene': villaSoleneImage
};

const getEntityId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

const getUtcDateKey = (value) => {
  if (!value) return null;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
};

const todayUtcKey = getUtcDateKey(new Date());

const createEmptyMetrics = () => ({
  totalRooms: 0,
  readyRooms: 0,
  occupiedRooms: 0,
  dirtyRooms: 0,
  outOfServiceRooms: 0,
  arrivalsToday: 0,
  departuresToday: 0,
  nextArrivalDate: null,
  overdueInvoices: 0,
  outstandingAmount: 0
});

const getRoomOperationalState = (room) => {
  if (room.status === 'Maintenance') return 'Out of Service';
  if (room.status === 'Occupied') return 'Occupied';
  if (room.status === 'Available' && room.isClean) return 'Ready';
  return 'Dirty';
};

const getPortfolioTone = (metrics) => {
  if (metrics.overdueInvoices > 0 || metrics.dirtyRooms >= 3 || metrics.outstandingAmount > 0) {
    return {
      label: 'Needs Attention',
      className: 'property-health-attention'
    };
  }

  if (metrics.arrivalsToday > 0 || metrics.departuresToday > 0) {
    return {
      label: 'High Turnover',
      className: 'property-health-turnover'
    };
  }

  return {
    label: 'Stable',
    className: 'property-health-stable'
  };
};

const getAttentionScore = (metrics) => {
  return (metrics.overdueInvoices * 100)
    + (metrics.dirtyRooms * 15)
    + (metrics.arrivalsToday * 8)
    + (metrics.departuresToday * 6)
    + (metrics.outstandingAmount > 0 ? 4 : 0);
};

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      setError('');

      try {
        const [propertiesData, roomsData, bookingsData, invoicesData] = await Promise.all([
          listProperties(),
          listRooms(),
          listAllBookings(),
          listInvoices({ status: 'all' })
        ]);

        setProperties(propertiesData || []);
        setRooms(roomsData || []);
        setBookings(bookingsData || []);
        setInvoices(invoicesData || []);
      } catch {
        setError('Could not load properties');
        setProperties([]);
        setRooms([]);
        setBookings([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const handleOpenProperty = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  const propertyMetricsMap = useMemo(() => {
    const metricsMap = new Map();
    const roomPropertyMap = new Map();

    properties.forEach((property) => {
      metricsMap.set(String(property._id), createEmptyMetrics());
    });

    rooms.forEach((room) => {
      const propertyId = getEntityId(room.property) || getEntityId(room.propertyId);

      if (!propertyId) {
        return;
      }

      roomPropertyMap.set(String(room._id), String(propertyId));

      const metrics = metricsMap.get(String(propertyId)) || createEmptyMetrics();
      metrics.totalRooms += 1;

      const roomState = getRoomOperationalState(room);

      if (roomState === 'Ready') metrics.readyRooms += 1;
      if (roomState === 'Occupied') metrics.occupiedRooms += 1;
      if (roomState === 'Dirty') metrics.dirtyRooms += 1;
      if (roomState === 'Out of Service') metrics.outOfServiceRooms += 1;

      metricsMap.set(String(propertyId), metrics);
    });

    bookings.forEach((booking) => {
      const bookingRoomId = getEntityId(booking.room) || getEntityId(booking.roomId);
      const propertyId = roomPropertyMap.get(String(bookingRoomId))
        || getEntityId(booking.property)
        || getEntityId(booking.propertyId);

      if (!propertyId) {
        return;
      }

      const metrics = metricsMap.get(String(propertyId)) || createEmptyMetrics();
      const checkInKey = getUtcDateKey(booking.checkIn || booking.checkInDate);
      const checkOutKey = getUtcDateKey(booking.checkOut || booking.checkOutDate);

      if (checkInKey === todayUtcKey) {
        metrics.arrivalsToday += 1;
      }

      if (checkOutKey === todayUtcKey) {
        metrics.departuresToday += 1;
      }

      if (checkInKey && checkInKey >= todayUtcKey) {
        if (!metrics.nextArrivalDate || checkInKey < getUtcDateKey(metrics.nextArrivalDate)) {
          metrics.nextArrivalDate = booking.checkIn || booking.checkInDate;
        }
      }

      metricsMap.set(String(propertyId), metrics);
    });

    invoices.forEach((invoice) => {
      const propertyId = getEntityId(invoice.propertyId) || getEntityId(invoice.property);

      if (!propertyId) {
        return;
      }

      const metrics = metricsMap.get(String(propertyId)) || createEmptyMetrics();
      metrics.outstandingAmount += Number(invoice.balanceDue || 0);

      if (invoice.status === 'overdue') {
        metrics.overdueInvoices += 1;
      }

      metricsMap.set(String(propertyId), metrics);
    });

    return metricsMap;
  }, [bookings, invoices, properties, rooms]);

  const propertyCards = useMemo(() => {
    return properties
      .map((property) => {
        const metrics = propertyMetricsMap.get(String(property._id)) || createEmptyMetrics();
        const totalRooms = metrics.totalRooms || 0;
        const occupancyRate = totalRooms === 0
          ? 0
          : Math.round((metrics.occupiedRooms / totalRooms) * 100);

        return {
          property,
          metrics,
          occupancyRate,
          tone: getPortfolioTone(metrics),
          attentionScore: getAttentionScore(metrics)
        };
      })
      .sort((left, right) => right.attentionScore - left.attentionScore);
  }, [properties, propertyMetricsMap]);

  const portfolioSummary = useMemo(() => {
    return propertyCards.reduce(
      (accumulator, item) => {
        accumulator.totalProperties += 1;
        accumulator.totalRooms += item.metrics.totalRooms;
        accumulator.dirtyRooms += item.metrics.dirtyRooms;
        accumulator.arrivalsToday += item.metrics.arrivalsToday;
        accumulator.overdueInvoices += item.metrics.overdueInvoices;
        accumulator.outstandingAmount += item.metrics.outstandingAmount;
        return accumulator;
      },
      {
        totalProperties: 0,
        totalRooms: 0,
        dirtyRooms: 0,
        arrivalsToday: 0,
        overdueInvoices: 0,
        outstandingAmount: 0
      }
    );
  }, [propertyCards]);

  return (
    <div className="app">
      <header className="properties-page-header properties-page-header-minimal">
        <div className="properties-page-heading-block properties-page-heading-block-minimal">
          <h1>Properties</h1>
          <p className="properties-page-meta properties-page-meta-minimal">
            Portfolio control tower · {properties.length} properties
          </p>
        </div>
      </header>

      {!loading && !error && properties.length > 0 && (
        <section className="properties-portfolio-kpis">
          <div className="summary-card summary-card-static">
            <h3>Portfolio</h3>
            <p>{portfolioSummary.totalProperties}</p>
          </div>
          <div className="summary-card summary-card-static">
            <h3>Arrivals Today</h3>
            <p>{portfolioSummary.arrivalsToday}</p>
          </div>
          <div className="summary-card summary-card-static">
            <h3>Dirty Rooms</h3>
            <p>{portfolioSummary.dirtyRooms}</p>
          </div>
          <div className="summary-card summary-card-static">
            <h3>Outstanding</h3>
            <p>{formatCurrency(portfolioSummary.outstandingAmount)}</p>
          </div>
        </section>
      )}

      {loading && <LoadingState message="Loading properties..." />}
      {!loading && <ErrorState message={error} />}
      {!loading && !error && properties.length === 0 && (
        <EmptyState message="No properties found." />
      )}

      <div className="properties-grid properties-grid-compact">
        {!loading && !error && propertyCards.map(({ property, metrics, occupancyRate, tone }) => {
            const propertyImage = propertyImageMap[property.name] || property.image;

            return (
              <article
                key={property._id}
                className="property-card property-card-compact property-card-clickable property-card-dashboard"
                onClick={() => handleOpenProperty(property._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenProperty(property._id);
                  }
                }}
              >
                <div className="property-card-image-wrap property-card-image-wrap-compact">
                  <img
                    src={propertyImage}
                    alt={property.name}
                    className="property-card-image property-card-image-compact"
                  />
                  <div className="property-card-image-overlay" />
                  <span className="property-type-badge property-type-badge-overlay property-type-badge-compact">
                    {property.type}
                  </span>
                  <span className={`property-health-chip ${tone.className}`}>
                    {tone.label}
                  </span>
                </div>

                <div className="property-card-body property-card-body-compact">
                  <div className="property-card-header-grid">
                    <div className="property-card-meta-row property-card-meta-row-compact">
                      <h3>{property.name}</h3>
                      <p className="property-card-location">{property.location}</p>
                    </div>

                    <div className="property-occupancy-block">
                      <span>Occupancy</span>
                      <strong>{occupancyRate}%</strong>
                    </div>
                  </div>

                  <div className="property-card-ops-grid">
                    <div>
                      <span>Ready</span>
                      <strong>{metrics.readyRooms}</strong>
                    </div>
                    <div>
                      <span>Dirty</span>
                      <strong>{metrics.dirtyRooms}</strong>
                    </div>
                    <div>
                      <span>Arrivals Today</span>
                      <strong>{metrics.arrivalsToday}</strong>
                    </div>
                    <div>
                      <span>Departures Today</span>
                      <strong>{metrics.departuresToday}</strong>
                    </div>
                    <div>
                      <span>Outstanding</span>
                      <strong>{formatCurrency(metrics.outstandingAmount)}</strong>
                    </div>
                    <div>
                      <span>Overdue Invoices</span>
                      <strong>{metrics.overdueInvoices}</strong>
                    </div>
                  </div>

                  <div className="property-card-footer property-card-footer-dashboard">
                    <strong className="property-status-chip">{property.status || 'Active'}</strong>
                    <span className="property-next-arrival-text">
                      {metrics.nextArrivalDate
                        ? `Next arrival ${formatDisplayDate(metrics.nextArrivalDate)}`
                        : 'No upcoming arrivals'}
                    </span>
                  </div>
                </div>
              </article>
            );
        })}
      </div>
    </div>
  );
}