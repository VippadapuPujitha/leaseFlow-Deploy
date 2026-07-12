import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminVerificationBadge from '../components/AdminVerificationBadge';
import {
  ADMIN_DATA_UPDATED_EVENT,
  getVerificationQueue,
} from '../services/adminService';

const normalizeStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  if (value === 'approved') return 'verified';
  if (value === 'not_requested') return 'pending';
  return value;
};

function VerificationRequests() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getVerificationQueue();
        setProperties(
          (response.data.properties || []).filter(
            (property) => normalizeStatus(property.verificationStatus) === 'pending'
          )
        );
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load verification queue.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();

    const handleAdminRefresh = () => {
      fetchQueue();
    };

    window.addEventListener(ADMIN_DATA_UPDATED_EVENT, handleAdminRefresh);

    return () => {
      window.removeEventListener(ADMIN_DATA_UPDATED_EVENT, handleAdminRefresh);
    };
  }, []);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <p className="admin-eyebrow mb-2">Admin Module</p>
          <h1 className="page-title mb-2">Verification Requests</h1>
          <p className="page-subtitle mb-0">
            Review all pending property verification submissions.
          </p>
        </div>
        <Link to="/admin-dashboard" className="btn btn-secondary-soft">
          Back to dashboard
        </Link>
      </div>

      {loading && <div className="alert alert-info">Loading verification requests...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card card-glass p-4">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Property Title</th>
                <th>Owner Name</th>
                <th>Verification Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && properties.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No pending verification requests.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property._id}>
                    <td>{property.title}</td>
                    <td>{property.ownerId?.name || property.ownerDetails?.name || 'Owner unavailable'}</td>
                    <td>
                      <AdminVerificationBadge verificationStatus={property.verificationStatus} />
                    </td>
                    <td>
                      <Link to={`/admin/verification/${property._id}`} className="btn btn-sm btn-outline-primary">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </main>
    </div>
  );
}

export default VerificationRequests;
