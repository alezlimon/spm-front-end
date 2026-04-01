import { useEffect, useState } from 'react';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_URL}/properties`);

        if (!res.ok) {
          throw new Error('Error fetching properties');
        }

        const data = await res.json();
        setProperties(data);
      } catch (err) {
        setError('Could not load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleOpenProperty = (property) => {
    console.log('Open property:', property.name);
  };

  return (
    <div className="app">
      <header className="properties-page-header properties-page-header-minimal">
        <div className="properties-page-heading-block properties-page-heading-block-minimal">
          <h1>Properties</h1>
          <p className="properties-page-meta properties-page-meta-minimal">
            Aureline Collection · {properties.length} properties
          </p>
        </div>
      </header>

      {loading && <p className="page-feedback">Loading properties...</p>}
      {error && <p className="page-feedback page-feedback-error">{error}</p>}

      {!loading && !error && (
        <div className="properties-grid properties-grid-compact">
          {properties.map((property) => (
            <article
              key={property._id}
              className="property-card property-card-compact property-card-clickable"
              onClick={() => handleOpenProperty(property)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenProperty(property);
                }
              }}
            >
              <div className="property-card-image-wrap property-card-image-wrap-compact">
                <img
                  src={property.image}
                  alt={property.name}
                  className="property-card-image property-card-image-compact"
                />
                <span className="property-type-badge property-type-badge-overlay property-type-badge-compact">
                  {property.type}
                </span>
              </div>

              <div className="property-card-body property-card-body-compact">
                <div className="property-card-meta-row property-card-meta-row-compact">
                  <div>
                    <h3>{property.name}</h3>
                    <p className="property-card-location">{property.location}</p>
                  </div>
                </div>

                <div className="property-card-footer property-card-footer-compact property-card-footer-no-button">
                  <div className="property-status-wrap">
                    <span className="property-status-label">Status</span>
                    <strong className="property-status-value">{property.status}</strong>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}