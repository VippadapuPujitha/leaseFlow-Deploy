import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminVerificationBadge from '../components/AdminVerificationBadge';
import {
  ADMIN_DATA_UPDATED_EVENT,
  deleteProperty,
  getAdminProperties,
  notifyAdminDataChanged,
} from '../services/adminService';

const normalizeStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  return value === 'approved' ? 'verified' : value;
};

function AllProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAdminProperties();
        setProperties(response.data.properties || []);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();

    const handleAdminRefresh = () => {
      fetchProperties();
    };

    window.addEventListener(ADMIN_DATA_UPDATED_EVENT, handleAdminRefresh);

    return () => {
      window.removeEventListener(ADMIN_DATA_UPDATED_EVENT, handleAdminRefresh);
    };
  }, []);

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm('Delete this property permanently?');

    if (!confirmed) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await deleteProperty(propertyId);
      setProperties((current) => current.filter((property) => property._id !== propertyId));
      setMessage('Property deleted successfully.');
      notifyAdminDataChanged();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete property.');
    }
  };

  const getVerificationLabel = (property) => {
    const status = normalizeStatus(property.verificationStatus);

    if (status === 'verified') {
      return 'Verified';
    }

    if (status === 'rejected') {
      return 'Rejected';
    }

    if (status === 'pending') {
      return 'Pending';
    }

    return status;
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <p className="admin-eyebrow mb-2">Admin Module</p>
          <h1 className="page-title mb-2">All Properties</h1>
          <p className="page-subtitle mb-0">
            Review every property listing and delete records when necessary.
          </p>
        </div>
        <Link to="/admin-dashboard" className="btn btn-secondary-soft">
          Back to dashboard
        </Link>
      </div>

      {loading && <div className="alert alert-info">Loading properties...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card card-glass p-4">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Property</th>
                <th>Owner</th>
                <th>Verification Status</th>
                <th>Rent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && properties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No properties available.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property._id}>
                    <td>{property.title}</td>
                    <td>{property.ownerId?.name || property.ownerDetails?.name || 'Owner unavailable'}</td>
                    <td>
                      <AdminVerificationBadge verificationStatus={property.verificationStatus} />
                      {normalizeStatus(property.verificationStatus) === 'verified' && (
                        <div className="text-muted small mt-1">Verified status</div>
                      )}
                      {normalizeStatus(property.verificationStatus) === 'rejected' && (
                        <div className="text-muted small mt-1">
                          {property.rejectionReason || 'No rejection reason provided.'}
                        </div>
                      )}
                    </td>
                    <td>{property.rent ? `Rs. ${property.rent}` : 'N/A'}</td>
                    <td className="d-flex flex-wrap gap-2">
                      <Link to={`/admin/verification/${property._id}`} className="btn btn-sm btn-outline-primary">
                        View
                      </Link>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(property._id)}>
                        Delete
                      </button>
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

export default AllProperties;
