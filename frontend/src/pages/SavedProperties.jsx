import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import "./SavedProperties.css";

function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      const response = await api.get(
        "/api/users/saved-properties"
      );

      setProperties(response.data || []);
    } catch (err) {
      setError("Failed to load saved properties");
    } finally {
      setLoading(false);
    }
  };

const removeProperty = async (propertyId) => {
  try {
    await api.delete(`/api/users/save/${propertyId}`);

    setProperties((prev) =>
      prev.filter(
        (property) =>
          property._id !== propertyId
      )
    );

    window.location.reload();

  } catch (err) {
    console.log(
      err.response?.data?.message ||
      "Failed to remove property"
    );
  }
};

  if (loading) {
    return (
      <div className="text-center py-5">
        Loading saved properties...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-4">
        <h1>Saved Properties</h1>
        <p className="text-muted">
          View and manage your saved listings.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="empty-state">
    <div className="empty-icon">❤️</div>

    <h2>No Saved Properties</h2>

    <p>
        Save your favourite properties and they'll appear here for quick access.
    </p>

    <Link
        to="/properties"
        className="browse-btn"
    >
        Browse Properties
    </Link>
</div>
      ) : (
        <div className="row">
          {properties.map((property) => (
            <div
              className="col-md-6 col-lg-4 mb-4"
              key={property._id}
            >
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h4 className="property-title">
    {property.title}
</h4>

<p className="property-location">
    📍 {property.address}
</p>

<div className="property-details">

    <div>
        <small>Monthly Rent</small>
        <h3>₹{property.rent}</h3>
    </div>

    <div>
        <small>Type</small>
        <h5>{property.propertyType}</h5>
    </div>

</div>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/properties/${property._id}`}
                      className="view-btn"
                    >
                      View
                    </Link>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeProperty(
                          property._id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedProperties;