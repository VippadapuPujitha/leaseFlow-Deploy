import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProperties } from '../services/adminService';

const normalizeVerificationStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  if (value === 'approved') return 'verified';
  if (value === 'not_requested') return 'pending';
  return value;
};

function VerifiedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAdminProperties();
        const filteredProperties = (response.data.properties || []).filter(
          (property) => normalizeVerificationStatus(property.verificationStatus) === 'verified'
        );

        setProperties(filteredProperties);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load verified properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="admin-shell">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <p className="admin-eyebrow mb-2">Admin Module</p>
          <h1 className="page-title mb-2">Verified Properties</h1>
          <p className="page-subtitle mb-0">View all approved and verified properties.</p>
        </div>
        <Link to="/admin-dashboard" className="btn btn-secondary-soft">
          Back to dashboard
        </Link>
      </div>

      {loading && <div className="alert alert-info">Loading verified properties...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card card-glass p-4">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Property Title</th>
                <th>Property Type</th>
                <th>Owner Details</th>
                <th>Verification Status</th>
                <th>Property Images</th>
              </tr>
            </thead>
            <tbody>
              {!loading && properties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No verified properties available.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property._id}>
                    <td>{property.title}</td>
                    <td>{property.propertyType || 'N/A'}</td>
                    <td>{property.ownerId?.name || property.ownerDetails?.name || 'Owner unavailable'}</td>
                    <td>
                      <span className="status-pill status-pill--verified">Verified</span>
                    </td>
                    <td>
                      {property.imageUrls?.length ? (
                        <div className="d-flex flex-wrap gap-2">
                          {property.imageUrls.slice(0, 3).map((imageUrl) => (
                            <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer">
                              View image
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No images available.</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VerifiedProperties;