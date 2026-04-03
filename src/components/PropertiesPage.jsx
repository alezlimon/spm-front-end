import { useNavigate } from 'react-router-dom';
import { PROPERTIES } from '../propertiesConfig';
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

export default function PropertiesPage() {
  const navigate = useNavigate();

  const handleOpenProperty = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  return (
    <div className="app">
      <header className="properties-page-header properties-page-header-minimal">
        <div className="properties-page-heading-block properties-page-heading-block-minimal">
          <h1>Properties</h1>
          <p className="properties-page-meta properties-page-meta-minimal">
            Portfolio · {PROPERTIES.length} properties
          </p>
        </div>
      </header>

      <div className="properties-grid properties-grid-compact">
        {PROPERTIES.map((property) => {
            const propertyImage = propertyImageMap[property.name] || property.image;

            return (
              <article
                key={property._id}
                className="property-card property-card-compact property-card-clickable"
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
                    <strong className="property-status-chip">{property.status}</strong>
                  </div>
                </div>
              </article>
            );
        })}
      </div>
    </div>
  );
}