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
        const data = response.data;
        setProperties(data.properties || data || []);
      } catch (err) {
        setError('Unable to load properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSaveProperty = async (propertyId) => {
    try {
      await api.post(`/api/users/save/${propertyId}`);

      alert("Property saved successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to save property"
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        Loading properties...
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <p className="text-uppercase text-primary small mb-2">
            Property marketplace
          </p>

          <h1 className="page-title mb-0">
            Browse available listings
          </h1>
        </div>

        <div>
          <button className="btn btn-secondary-soft">
            Filter properties
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="property-grid">
        {properties.length === 0 ? (
          <div className="alert alert-warning">
            No properties found.
          </div>
        ) : (
          properties.map((property) => {
            const id = property._id || property.id;

            const title =
              property.title ||
              property.name ||
              "Modern Property";

            const subtitle =
              property.location ||
              property.address ||
              "Unknown Location";

            const price = property.price
              ? `$${property.price}`
              : property.rent
              ? `$${property.rent}/mo`
              : "Contact";

            const badge =
              property.status || "Available";

            return (
              <div
                className="property-card"
                key={id}
              >
                <div className="property-card__media">
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={title}
                      className="img-fluid"
                    />
                  ) : (
                    <div>
                      {title
                        .split(" ")
                        .slice(0, 2)
                        .join(" ")}
                    </div>
                  )}
                </div>

                <div className="property-card__body">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <h3 className="h5 mb-2">
                        {title}
                      </h3>

                      <p className="text-muted mb-2">
                        {subtitle}
                      </p>
                    </div>

                    <span className="property-badge">
                      {badge}
                    </span>
                  </div>

                  <p className="text-muted mb-3">
                    {property.description?.slice(
                      0,
                      120
                    ) ||
                      "No description available."}
                  </p>

                  <div className="property-card__meta">
                    <span>
                      {property.bedrooms ?? "-"} beds
                    </span>

                    <span>
                      {property.bathrooms ?? "-"} baths
                    </span>

                    <span>
                      {property.area
                        ? `${property.area} sqft`
                        : "— sqft"}
                    </span>
                  </div>
                </div>

                <div className="property-card__footer d-flex justify-content-between align-items-center">
                  <strong>{price}</strong>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        handleSaveProperty(id)
                      }
                    >
                      Save
                    </button>

                    <Link
                      className="btn btn-gradient btn-sm px-4"
                      to={`/properties/${id}`}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PropertyList;