import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProperties, getVerificationQueue } from '../services/adminService';

const normalizeVerificationStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  return value === 'approved' ? 'verified' : value;
};

function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError('');

      try {
        const [propertiesResponse, queueResponse] = await Promise.all([
          getAdminProperties(),
          getVerificationQueue(),
        ]);

        setProperties(propertiesResponse.data.properties || []);
        setVerificationQueue(queueResponse.data.properties || []);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const summary = useMemo(() => {
    const counts = properties.reduce(
      (accumulator, property) => {
        const status = normalizeVerificationStatus(property.verificationStatus);

        if (status === 'pending') accumulator.pending += 1;
        if (status === 'verified') accumulator.verified += 1;
        if (status === 'rejected') accumulator.rejected += 1;

        return accumulator;
      },
      { pending: 0, verified: 0, rejected: 0 }
    );

    return {
      total: properties.length,
      pending: counts.pending,
      verified: counts.verified,
      rejected: counts.rejected,
    };
  }, [properties]);

  return (
    <div className="admin-shell">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <p className="admin-eyebrow mb-2">Admin Module</p>
          <h1 className="page-title mb-2">Verification Control Center</h1>
          <p className="page-subtitle mb-0">
            Manage property verification, approvals, and removals from one place.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/verification-requests" className="btn btn-gradient">
            Review Queue
          </Link>
          <Link to="/admin/all-properties" className="btn btn-secondary-soft">
            View All Properties
          </Link>
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading admin dashboard...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stat-grid mb-4">
        <div className="stat-card">
          <div className="stat-card__title">Total Properties</div>
          <div className="stat-card__value">{summary.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__title">Pending Verifications</div>
          <div className="stat-card__value">{summary.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__title">Verified Properties</div>
          <div className="stat-card__value">{summary.verified}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__title">Rejected Properties</div>
          <div className="stat-card__value">{summary.rejected}</div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card card-glass h-100 p-4 admin-action-card">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h3 className="h5 mb-2">Verification Queue</h3>
                <p className="text-muted mb-0">
                  Review new submissions and process pending verification requests.
                </p>
              </div>
              <span className="badge bg-primary-soft text-primary">{verificationQueue.length} pending</span>
            </div>
            <Link to="/admin/verification-requests" className="btn btn-outline-primary mt-auto align-self-start">
              Open queue
            </Link>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card card-glass h-100 p-4 admin-action-card">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h3 className="h5 mb-2">All Properties</h3>
                <p className="text-muted mb-0">
                  Browse the full catalog, status history, and owner details.
                </p>
              </div>
              <span className="badge bg-primary-soft text-primary">{summary.total} total</span>
            </div>
            <Link to="/admin/all-properties" className="btn btn-outline-primary mt-auto align-self-start">
              Open list
            </Link>
          </div>
        </div>
      </div>

      <div className="card card-glass p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h2 className="h4 mb-1">Recent Pending Verifications</h2>
            <p className="text-muted mb-0">Most recent submissions awaiting admin review.</p>
          </div>
          <Link to="/admin/verification-requests" className="btn btn-sm btn-outline-primary">
            View queue
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Property</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verificationQueue.length ? (
                verificationQueue.slice(0, 5).map((property) => (
                  <tr key={property._id}>
                    <td>{property.title}</td>
                    <td>{property.ownerId?.name || property.ownerDetails?.name || 'Owner unavailable'}</td>
                    <td>
                      <span className="status-pill status-pill--pending">Pending</span>
                    </td>
                    <td>
                      <Link to={`/admin/verification/${property._id}`} className="btn btn-sm btn-outline-primary">
                        View details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No pending verification requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
