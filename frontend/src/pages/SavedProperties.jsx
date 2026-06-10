import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";

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
        <div className="alert alert-warning">
          No saved properties found.
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
                  <h5 className="card-title">
                    {property.title}
                  </h5>

                  <p className="text-muted">
                    {property.address}
                  </p>

                  <p>
                    <strong>Rent:</strong>{" "}
                    ₹{property.rent}
                  </p>

                  <p>
                    <strong>Type:</strong>{" "}
                    {property.propertyType}
                  </p>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/properties/${property._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View
                    </Link>

                    <button
                      className="btn btn-danger btn-sm"
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