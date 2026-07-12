import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import OwnerSidebar from '../components/OwnerSidebar';
import AdminVerificationBadge from '../components/AdminVerificationBadge';

function OwnerVerificationStatus() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/properties/owner/${user.id}`);
        setProperties(response.data.properties || []);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load verification status.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <OwnerSidebar />
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p className="admin-eyebrow mb-2">Owner Module</p>
          <h1 className="page-title mb-2">Verification Status</h1>
          <p className="page-subtitle mb-0">See current admin review status for your listed properties.</p>
        </div>

        {loading ? (
          <div className="alert alert-info">Loading verification status...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="card card-glass p-4">
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="h4 mb-2">Your Properties</h2>
                <p className="text-muted mb-0">Verification status is read from the backend and updated by admin approval.</p>
              </div>
            </div>

            {properties.length === 0 ? (
              <p className="text-muted">No properties found. Add properties to request verification.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>City</th>
                      <th>Rent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property._id}>
                        <td>{property.title || 'Untitled'}</td>
                        <td>{property.city || '—'}</td>
                        <td>{property.rent ? `Rs. ${property.rent}` : '—'}</td>
                        <td>
                          <AdminVerificationBadge verificationStatus={property.verificationStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default OwnerVerificationStatus;
