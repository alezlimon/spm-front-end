import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../App.css';

import alpineHouseImage from '../assets/properties/Property Images/Alpine House.png';
import duneHouseImage from '../assets/properties/Property Images/Dune House.png';
import harborClubImage from '../assets/properties/Property Images/Harbor Club.png';
import riadNoirImage from '../assets/properties/Property Images/Riad Noir.png';
import villaAzureImage from '../assets/properties/Property Images/Villa Azure.png';
import villaMiradorImage from '../assets/properties/Property Images/Villa Mirador.png';
import villaSoleneImage from '../assets/properties/Property Images/Villa Solene.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

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
        const [propertyRes, propertiesRes] = await Promise.all([
          fetch(`${API_URL}/properties/${propertyId}`),
          fetch(`${API_URL}/properties`)
        ]);

        if (!propertyRes.ok || !propertiesRes.ok) {
          throw new Error('Error fetching property details');
        }

        const propertyData = await propertyRes.json();
        const propertiesData = await propertiesRes.json();

        setProperty(propertyData.property);
        setRooms(propertyData.rooms || []);
        setAllProperties(propertiesData || []);
      } catch (err) {
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
  const propertyImage = property ? propertyImageMap[property.name] || property.image : '';

  if (loading) {
    return (
      <div className="app">
        <p className="page-feedback">Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="app">
        <p className="page-feedback page-feedback-error">
          {error || 'Property not found'}
        </p>
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

      <section className="property-detail-summary-grid">
        <article className="property-detail-summary-card">
          <span>{isHotel ? 'Total Rooms' : 'Rooms Configured'}</span>
          <strong>{roomStats.total}</strong>
        </article>

        <article className="property-detail-summary-card">
          <span>{isHotel ? 'Available' : 'Ready'}</span>
          <strong>{roomStats.available}</strong>
        </article>

        <article className="property-detail-summary-card">
          <span>{isHotel ? 'Dirty' : 'Prep Needed'}</span>
          <strong>{roomStats.dirty}</strong>
        </article>

        <article className="property-detail-summary-card">
          <span>{isHotel ? 'Maintenance' : 'Blocked'}</span>
          <strong>{roomStats.maintenance}</strong>
        </article>
      </section>

      <section className="property-detail-section">
        <div className="property-detail-section-header">
          <h2>{isHotel ? 'Rooms' : 'Accommodation Setup'}</h2>
          <p>
            {isHotel
              ? 'Operational room overview for this property.'
              : 'Operational accommodation overview for this villa.'}
          </p>
        </div>

        <div className="property-detail-rooms-grid">
          {rooms.length === 0 ? (
            <p className="page-feedback">
              {property.type === 'Villa'
                ? 'No accommodation units are configured for this villa yet.'
                : 'No rooms found for this property.'}
            </p>
          ) : (
            rooms.map((room) => (
              <article key={room._id} className="property-detail-room-card">
                <div className="property-detail-room-top">
                  <div>
                    <h3>{isHotel ? `Room ${room.roomNumber}` : `Suite ${room.roomNumber}`}</h3>
                    <p>{room.type}</p>
                  </div>

                  <span className={`status-badge status-${room.status.toLowerCase()}`}>
                    {room.status}
                  </span>
                </div>

                <div className="property-detail-room-meta">
                  <div>
                    <span>{isHotel ? 'Rate' : 'Nightly Rate'}</span>
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
    </div>
  );
}