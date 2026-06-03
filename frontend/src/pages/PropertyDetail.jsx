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
        setProperty(response.data);
      } catch (err) {
        setError('Unable to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return <div>Loading property details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!property) return <div>No property found.</div>;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2>{property.title || property.name}</h2>
        <p className="text-muted">{property.location || property.address}</p>
        <p>{property.description || 'No description available.'}</p>
        <div className="row">
          <div className="col-md-4">
            <div className="mb-3">
              <strong>Price</strong>
              <p>{property.price ? `$${property.price}` : 'N/A'}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <strong>Status</strong>
              <p>{property.status || 'Available'}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <strong>Bedrooms</strong>
              <p>{property.bedrooms ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
