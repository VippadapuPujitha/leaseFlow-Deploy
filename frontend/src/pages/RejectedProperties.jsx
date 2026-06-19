import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProperties } from '../services/adminService';

const normalizeVerificationStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  return value === 'approved' ? 'verified' : value;
};

function RejectedProperties() {
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
          (property) => normalizeVerificationStatus(property.verificationStatus) === 'rejected'
        );

        setProperties(filteredProperties);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load rejected properties.');
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
          <h1 className="page-title mb-2">Rejected Properties</h1>
          <p className="page-subtitle mb-0">View all rejected properties and rejection reasons.</p>
        </div>
        <Link to="/admin-dashboard" className="btn btn-secondary-soft">
          Back to dashboard
        </Link>
      </div>

      {loading && <div className="alert alert-info">Loading rejected properties...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card card-glass p-4">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Property Title</th>
                <th>Property Type</th>
                <th>Owner Details</th>
                <th>Rejected Status</th>
                <th>Rejection Reason</th>
              </tr>
            </thead>
            <tbody>
              {!loading && properties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No rejected properties available.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property._id}>
                    <td>{property.title}</td>
                    <td>{property.propertyType || 'N/A'}</td>
                    <td>{property.ownerId?.name || property.ownerDetails?.name || 'Owner unavailable'}</td>
                    <td>
                      <span className="status-pill status-pill--rejected">Rejected</span>
                    </td>
                    <td>{property.rejectionReason || 'No rejection reason provided.'}</td>
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

export default RejectedProperties;