import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';

const adminNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'properties', label: 'All Properties', icon: '🏠' },
  { id: 'pending', label: 'Pending Properties', icon: '⏳' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
];

const userSamples = {
  owners: [
    { id: 'OWNER-1', name: 'Sara Lee', email: 'sara@landowners.com' },
    { id: 'OWNER-2', name: 'David Kim', email: 'david@urbanestate.com' },
  ],
  tenants: [
    { id: 'TENANT-1', name: 'Maya Johnson', email: 'maya@gmail.com' },
    { id: 'TENANT-2', name: 'Alex Cruz', email: 'alex@tenantmail.com' },
  ],
};

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/properties');
        const data = response.data;
        setProperties(data.properties || data || []);
      } catch (err) {
        setError('Unable to load platform metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusCounts = useMemo(() => {
    return properties.reduce(
      (acc, property) => {
        const status = (property.status || 'available').toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { available: 0, leased: 0, pending: 0, rejected: 0, active: 0 },
    );
  }, [properties]);

  const dashboardStats = useMemo(() => ({
    totalProperties: properties.length,
    totalOwners: userSamples.owners.length,
    totalTenants: userSamples.tenants.length,
    totalRequests: 24,
    approvedRequests: 14,
    rejectedRequests: 4,
    pendingRequests: 6,
    availableProperties: statusCounts.available,
    occupiedProperties: statusCounts.leased + statusCounts.active,
  }), [properties.length, statusCounts.available, statusCounts.leased, statusCounts.active]);

  const pendingProperties = properties.filter((property) => (property.status || '').toLowerCase() === 'pending');

  const handleAdminAction = async (propertyId, action) => {
    setError('');
    setStatusMessage('');
    try {
      const route = action === 'approve' ? 'approve' : 'reject';
      const response = await api.put(`/api/properties/${route}/${propertyId}`);
      const updated = response.data.property || response.data;
      setProperties((prev) => prev.map((item) => (item._id === updated._id || item.id === updated.id ? updated : item)));
      setStatusMessage(`Property ${action}d successfully.`);
    } catch (err) {
      setError('Unable to update property status.');
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar card-glass p-4">
        <div className="sidebar-brand mb-4">
          <div className="sidebar-logo">LeaseFlow</div>
          <p className="text-muted mb-0">Admin control panel</p>
        </div>
        <nav className="dashboard-nav">
          {adminNavigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dashboard-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h1 className="page-title mb-2">Admin Control Panel</h1>
            <p className="page-subtitle">Monitor properties, pending approvals, users, and analytics.</p>
          </div>
          <div className="text-end">
            <span className="badge bg-primary-soft text-primary py-2 px-3">{properties.length} properties</span>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {statusMessage && <div className="alert alert-success">{statusMessage}</div>}

        {activeSection === 'dashboard' && (
          <>
            <div className="stat-grid mb-4">
              <div className="stat-card">
                <div className="stat-card__title">Total properties</div>
                <div className="stat-card__value">{dashboardStats.totalProperties}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Total owners</div>
                <div className="stat-card__value">{dashboardStats.totalOwners}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Total tenants</div>
                <div className="stat-card__value">{dashboardStats.totalTenants}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Total requests</div>
                <div className="stat-card__value">{dashboardStats.totalRequests}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Approved requests</div>
                <div className="stat-card__value">{dashboardStats.approvedRequests}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Rejected requests</div>
                <div className="stat-card__value">{dashboardStats.rejectedRequests}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Pending requests</div>
                <div className="stat-card__value">{dashboardStats.pendingRequests}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Available properties</div>
                <div className="stat-card__value">{dashboardStats.availableProperties}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Occupied properties</div>
                <div className="stat-card__value">{dashboardStats.occupiedProperties}</div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-6">
                <div className="card card-glass p-4">
                  <h4 className="mb-3">Property status overview</h4>
                  <div className="details-grid">
                    <div className="details-card">
                      <strong>Available</strong>
                      <p>{statusCounts.available} listings</p>
                    </div>
                    <div className="details-card">
                      <strong>Leased</strong>
                      <p>{statusCounts.leased} listings</p>
                    </div>
                    <div className="details-card">
                      <strong>Pending</strong>
                      <p>{statusCounts.pending} listings</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card card-glass p-4">
                  <h4 className="mb-3">User counts</h4>
                  <div className="details-grid">
                    <div className="details-card">
                      <strong>Owners</strong>
                      <p>{dashboardStats.totalOwners}</p>
                    </div>
                    <div className="details-card">
                      <strong>Tenants</strong>
                      <p>{dashboardStats.totalTenants}</p>
                    </div>
                    <div className="details-card">
                      <strong>Active requests</strong>
                      <p>{dashboardStats.pendingRequests}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'properties' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">All Properties</h2>
            <p className="text-muted">Review every listing in the LeaseFlow platform.</p>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Rent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.length ? (
                    properties.map((property) => {
                      const title = property.title || property.name || 'Property';
                      const status = property.status || 'Available';
                      const location = property.address || property.location || 'N/A';
                      const rent = property.rent || property.monthlyRent || 'N/A';
                      return (
                        <tr key={property._id || property.id || title}>
                          <td>{title}</td>
                          <td>{status}</td>
                          <td>{location}</td>
                          <td>{typeof rent === 'number' ? `$${rent}/mo` : rent}</td>
                          <td>
                            <button type="button" className="btn btn-sm btn-outline-primary me-2">View</button>
                            <button type="button" className="btn btn-sm btn-outline-secondary">Edit</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No properties available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'pending' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">Pending Properties</h2>
            <p className="text-muted">Approve or reject the most recent pending listings.</p>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProperties.length ? (
                    pendingProperties.map((property) => {
                      const title = property.title || property.name || 'Property';
                      const location = property.address || property.location || 'N/A';
                      return (
                        <tr key={property._id || property.id || title}>
                          <td>{title}</td>
                          <td>{location}</td>
                          <td>{property.status || 'Pending'}</td>
                          <td>
                            <button type="button" className="btn btn-sm btn-outline-primary me-2">View</button>
                            <button type="button" className="btn btn-sm btn-outline-success me-2" onClick={() => handleAdminAction(property._id || property.id, 'approve')}>Approve</button>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleAdminAction(property._id || property.id, 'reject')}>Reject</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No pending properties at the moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">User Management</h2>
            <div className="details-grid">
              <div className="details-card">
                <strong>All owners</strong>
                {userSamples.owners.map((owner) => (
                  <p key={owner.id} className="mb-1">{owner.name} · <span className="text-muted">{owner.email}</span></p>
                ))}
              </div>
              <div className="details-card">
                <strong>All tenants</strong>
                {userSamples.tenants.map((tenant) => (
                  <p key={tenant.id} className="mb-1">{tenant.name} · <span className="text-muted">{tenant.email}</span></p>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">Analytics</h2>
            <div className="details-grid">
              <div className="details-card">
                <strong>Properties by status</strong>
                <p>Available: {statusCounts.available}</p>
                <p>Leased: {statusCounts.leased}</p>
                <p>Pending: {statusCounts.pending}</p>
              </div>
              <div className="details-card">
                <strong>Requests by status</strong>
                <p>Approved: {dashboardStats.approvedRequests}</p>
                <p>Rejected: {dashboardStats.rejectedRequests}</p>
                <p>Pending: {dashboardStats.pendingRequests}</p>
              </div>
              <div className="details-card">
                <strong>Owner count</strong>
                <p>{dashboardStats.totalOwners}</p>
              </div>
              <div className="details-card">
                <strong>Tenant count</strong>
                <p>{dashboardStats.totalTenants}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
