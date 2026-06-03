import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/api/properties');
        setProperties(response.data);
      } catch (err) {
        setError('Unable to load properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <div>Loading properties...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Property Listings</h2>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row gy-4">
        {properties.length === 0 ? (
          <div className="col-12">No properties found.</div>
        ) : (
          properties.map((property) => (
            <div className="col-md-6" key={property._id || property.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{property.title || property.name}</h5>
                  <p className="card-text text-muted">{property.location || property.address}</p>
                  <p className="card-text">{property.description?.slice(0, 120) || 'No description available.'}</p>
                  <Link className="btn btn-outline-primary" to={`/properties/${property._id || property.id}`}>
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PropertyList;
