import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProperty, listProperties, listPropertyRooms } from '../api/propertiesApi';
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

export default function PropertyDetailPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const [propertyData, roomsData, propertiesData] = await Promise.all([
          getProperty(propertyId),
          listPropertyRooms(propertyId),
          listProperties()
        ]);

        setProperty(propertyData);
        setRooms(roomsData || []);
        setAllProperties(propertiesData || []);
      } catch {
        setError('Could not load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [propertyId]);

  const roomStats = useMemo(() => {
    return {
      total: rooms.length,
      available: rooms.filter((room) => room.status === 'Available').length,
      occupied: rooms.filter((room) => room.status === 'Occupied').length,
      dirty: rooms.filter((room) => room.status === 'Dirty').length,
      maintenance: rooms.filter((room) => room.status === 'Maintenance').length
    };
  }, [rooms]);

  const currentIndex = allProperties.findIndex((item) => item._id === propertyId);
  const previousProperty = currentIndex > 0 ? allProperties[currentIndex - 1] : null;
  const nextProperty =
    currentIndex >= 0 && currentIndex < allProperties.length - 1
      ? allProperties[currentIndex + 1]
      : null;

  useEffect(() => {
    const handleKeyNavigation = (event) => {
      if (event.key === 'ArrowLeft' && previousProperty) {
        navigate(`/properties/${previousProperty._id}`);
      }

      if (event.key === 'ArrowRight' && nextProperty) {
        navigate(`/properties/${nextProperty._id}`);
      }
    };

    window.addEventListener('keydown', handleKeyNavigation);

    return () => {
      window.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [navigate, previousProperty, nextProperty]);

  const isHotel = property?.type === 'Hotel';
  const isVilla = property?.type === 'Villa';
  const propertyImage = property ? propertyImageMap[property.name] || property.image : '';

  const hotelOccupancyRate =
    roomStats.total > 0 ? Math.round((roomStats.occupied / roomStats.total) * 100) : 0;

  const villaReadiness = roomStats.dirty + roomStats.maintenance === 0 ? 'Ready' : 'Attention Needed';
  const villaPrepStatus = roomStats.dirty > 0 ? 'Prep in progress' : roomStats.maintenance > 0 ? 'Blocked areas present' : 'Fully staged';

  const recentGuestNames = rooms
    .filter((room) => room.status === 'Occupied')
    .slice(0, 3)
    .map((room) => `${isVilla ? 'Suite' : 'Room'} ${room.roomNumber}`);

  if (loading) {
    return (
      <div className="app">
        <LoadingState message="Loading property..." />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="app">
        <ErrorState message={error || 'Property not found'} />
        <Link to="/properties" className="secondary-button">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="property-detail-topbar">
        <Link to="/properties" className="property-detail-back-link">
          <span className="property-detail-back-arrow">←</span>
          <span>Back to Properties</span>
        </Link>

        <div className="property-detail-switcher">
          {previousProperty ? (
            <Link
              to={`/properties/${previousProperty._id}`}
              className="property-detail-switcher-link"
            >
              <span className="property-detail-switcher-direction">Previous</span>
              <strong>{previousProperty.name}</strong>
            </Link>
          ) : (
            <span className="property-detail-switcher-link property-detail-switcher-link-disabled">
              <span className="property-detail-switcher-direction">Previous</span>
            </span>
          )}

          {nextProperty ? (
            <Link
              to={`/properties/${nextProperty._id}`}
              className="property-detail-switcher-link property-detail-switcher-link-next"
            >
              <span className="property-detail-switcher-direction">Next</span>
              <strong>{nextProperty.name}</strong>
            </Link>
          ) : (
            <span className="property-detail-switcher-link property-detail-switcher-link-disabled">
              <span className="property-detail-switcher-direction">Next</span>
            </span>
          )}
        </div>
      </div>

      <section className="property-detail-hero">
        <div className="property-detail-hero-image-wrap">
          <img
            src={propertyImage}
            alt={property.name}
            className="property-detail-hero-image"
          />
        </div>

        <div className="property-detail-hero-content">
          <div className="property-detail-kicker-row">
            <span className="property-detail-type">{property.type}</span>
            <span className="property-detail-status">{property.status}</span>
          </div>

          <div className="property-detail-title-block">
            <h1>{property.name}</h1>
            <p className="property-detail-location">{property.location}</p>
          </div>

          {property.description && (
            <p className="property-detail-description">{property.description}</p>
          )}
        </div>
      </section>

      {isHotel && (
        <>
          <section className="property-detail-summary-grid">
            <article className="property-detail-summary-card">
              <span>Occupancy</span>
              <strong>{hotelOccupancyRate}%</strong>
            </article>

            <article className="property-detail-summary-card">
              <span>Available Rooms</span>
              <strong>{roomStats.available}</strong>
            </article>

            <article className="property-detail-summary-card">
              <span>Dirty Rooms</span>
              <strong>{roomStats.dirty}</strong>
            </article>

            <article className="property-detail-summary-card">
              <span>Maintenance</span>
              <strong>{roomStats.maintenance}</strong>
            </article>
          </section>

          <section className="property-detail-section property-detail-ops-section">
            <div className="property-detail-section-header">
              <h2>Operations Snapshot</h2>
              <p>Hotel-specific operational view for arrivals, departures, and room flow.</p>
            </div>

            <div className="property-detail-ops-grid">
              <article className="property-detail-ops-card">
                <span>Occupied Rooms</span>
                <strong>{roomStats.occupied}</strong>
                <p>Currently checked in or in active guest use.</p>
              </article>

              <article className="property-detail-ops-card">
                <span>Expected Arrivals</span>
                <strong>{Math.max(1, Math.ceil(roomStats.available / 3))}</strong>
                <p>Forecasted based on current availability pattern.</p>
              </article>

              <article className="property-detail-ops-card">
                <span>Expected Departures</span>
                <strong>{Math.max(1, Math.ceil(roomStats.occupied / 2))}</strong>
                <p>Likely turnover pressure for the next housekeeping cycle.</p>
              </article>

              <article className="property-detail-ops-card">
                <span>Operational Alerts</span>
                <strong>{roomStats.dirty + roomStats.maintenance}</strong>
                <p>Dirty and maintenance rooms requiring attention.</p>
              </article>
            </div>
          </section>

          <section className="property-detail-section">
            <div className="property-detail-section-header">
              <h2>Rooms</h2>
              <p>Operational room overview for this property.</p>
            </div>

            <div className="property-detail-rooms-grid">
              {rooms.length === 0 ? (
                <EmptyState message="No rooms found for this property." />
              ) : (
                rooms.map((room) => (
                  <article key={room._id} className="property-detail-room-card">
                    <div className="property-detail-room-top">
                      <div>
                        <h3>Room {room.roomNumber}</h3>
                        <p>{room.type}</p>
                      </div>

                      <span className={`status-badge status-${room.status.toLowerCase()}`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="property-detail-room-meta">
                      <div>
                        <span>Rate</span>
                        <strong>${room.pricePerNight}</strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong>{room.status}</strong>
                      </div>
                    </div>

                    {room.description && (
                      <p className="property-detail-room-description">{room.description}</p>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {isVilla && (
        <>
          <section className="property-detail-summary-grid">
            <article className="property-detail-summary-card">
              <span>Booking Status</span>
              <strong>{property.status}</strong>
            </article>

            <article className="property-detail-summary-card">
              <span>Readiness</span>
              <strong>{villaReadiness}</strong>
            </article>

            <article className="property-detail-summary-card">
              <span>Prep Status</span>
              <strong>{villaPrepStatus}</strong>
            </article>

            <article className="property-detail-summary-card">
              <span>Configured Suites</span>
              <strong>{roomStats.total}</strong>
            </article>
          </section>

          <section className="property-detail-section property-detail-ops-section">
            <div className="property-detail-section-header">
              <h2>Villa Operations</h2>
              <p>Villa-specific readiness, guest flow, and house prep overview.</p>
            </div>

            <div className="property-detail-ops-grid">
              <article className="property-detail-ops-card">
                <span>Guest Presence</span>
                <strong>{roomStats.occupied > 0 ? 'In House' : 'No Current Stay'}</strong>
                <p>
                  {roomStats.occupied > 0
                    ? `Active occupancy across ${roomStats.occupied} suite${roomStats.occupied > 1 ? 's' : ''}.`
                    : 'No active in-house guest occupancy right now.'}
                </p>
              </article>

              <article className="property-detail-ops-card">
                <span>Housekeeping</span>
                <strong>{roomStats.dirty > 0 ? `${roomStats.dirty} Open` : 'Clear'}</strong>
                <p>Prep and turnover workload across the estate.</p>
              </article>

              <article className="property-detail-ops-card">
                <span>Concierge Notes</span>
                <strong>{property.status === 'Booked' ? 'Arrival Active' : 'Standby'}</strong>
                <p>
                  {property.status === 'Booked'
                    ? 'Guest-facing support and pre-arrival coordination should stay active.'
                    : 'No major guest-facing concierge escalation visible.'}
                </p>
              </article>

              <article className="property-detail-ops-card">
                <span>Active Zones</span>
                <strong>{roomStats.total - roomStats.maintenance}</strong>
                <p>Suites or operational areas currently not blocked by maintenance.</p>
              </article>
            </div>
          </section>

          <section className="property-detail-section">
            <div className="property-detail-section-header">
              <h2>Accommodation Setup</h2>
              <p>Operational accommodation overview for this villa.</p>
            </div>

            <div className="property-detail-rooms-grid">
              {rooms.length === 0 ? (
                <p className="page-feedback">
                  No accommodation units are configured for this villa yet.
                </p>
              ) : (
                rooms.map((room) => (
                  <article key={room._id} className="property-detail-room-card">
                    <div className="property-detail-room-top">
                      <div>
                        <h3>Suite {room.roomNumber}</h3>
                        <p>{room.type}</p>
                      </div>

                      <span className={`status-badge status-${room.status.toLowerCase()}`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="property-detail-room-meta">
                      <div>
                        <span>Nightly Rate</span>
                        <strong>${room.pricePerNight}</strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong>{room.status}</strong>
                      </div>
                    </div>

                    {room.description && (
                      <p className="property-detail-room-description">{room.description}</p>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="property-detail-section">
            <div className="property-detail-section-header">
              <h2>Stay Notes</h2>
              <p>High-level guest and readiness notes for villa management.</p>
            </div>

            <div className="property-detail-notes-list">
              <article className="property-detail-note-card">
                <span>Guest Info</span>
                <p>
                  {recentGuestNames.length > 0
                    ? `Current stay activity is centered around ${recentGuestNames.join(', ')}.`
                    : 'No in-house guest activity detected from the current room set.'}
                </p>
              </article>

              <article className="property-detail-note-card">
                <span>Housekeeping</span>
                <p>
                  {roomStats.dirty > 0
                    ? `${roomStats.dirty} suite${roomStats.dirty > 1 ? 's are' : ' is'} still in prep and should be reviewed before next arrival.`
                    : 'Housekeeping load appears clear across the configured suites.'}
                </p>
              </article>

              <article className="property-detail-note-card">
                <span>Estate Readiness</span>
                <p>
                  {roomStats.maintenance > 0
                    ? `${roomStats.maintenance} blocked area${roomStats.maintenance > 1 ? 's are' : ' is'} affecting full-estate readiness.`
                    : 'No blocked operational areas are visible right now.'}
                </p>
              </article>
            </div>
          </section>
        </>
      )}
    </div>
  );
}