import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/api/properties/${id}`);
        const data = response.data;
        setProperty(data.property || data || null);
      } catch (err) {
        setError('Unable to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return <div className="text-center py-5">Loading property details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!property) return <div className="alert alert-warning">No property found.</div>;

  const title = property.title || property.name || 'Property details';
  const subtitle = property.location || property.address || 'Location unavailable';

  return (
    <div className="mb-4">
      <div className="page-title mb-1">{title}</div>
      <p className="page-subtitle mb-4">{subtitle}</p>

      <div className="card-glass p-4 mb-4">
        <div className="row gy-4">
          <div className="col-lg-7">
            <div className="property-card__media mb-4">
              {property.image ? (
                <img src={property.image} alt={title} className="img-fluid rounded-4" />
              ) : (
                <div className="display-6 fw-bold">{title.split(' ').slice(0, 3).join(' ')}</div>
              )}
            </div>
            <h3 className="h5 mb-3">Property Description</h3>
            <p className="text-muted">{property.description || 'No description available.'}</p>
          </div>

          <div className="col-lg-5">
            <div className="details-card mb-3">
              <strong>Price</strong>
              <p>{property.price || property.rent ? `$${property.price || property.rent}` : 'N/A'}</p>
            </div>
            <div className="details-card mb-3">
              <strong>Status</strong>
              <p>{property.status || 'Available'}</p>
            </div>
            <div className="details-card mb-3">
              <strong>Bedrooms</strong>
              <p>{property.bedrooms ?? '—'}</p>
            </div>
            <div className="details-card">
              <strong>Bathrooms</strong>
              <p>{property.bathrooms ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <strong>Property Type</strong>
          <p>{property.propertyType || property.type || 'Residential'}</p>
        </div>
        <div className="details-card">
          <strong>Area</strong>
          <p>{property.area ? `${property.area} sqft` : 'N/A'}</p>
        </div>
        <div className="details-card">
          <strong>Available from</strong>
          <p>{property.availableDate || 'Immediate'}</p>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
