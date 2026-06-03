import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';

const ownerNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'add', label: 'Add Property', icon: '➕' },
  { id: 'properties', label: 'My Properties', icon: '🏢' },
  { id: 'images', label: 'Upload Images', icon: '📷' },
  { id: 'documents', label: 'Upload Documents', icon: '📄' },
  { id: 'requests', label: 'Tenant Requests', icon: '📨' },
  { id: 'reports', label: 'Reports', icon: '📊' },
];

const initialForm = {
  title: '',
  propertyType: 'Apartment',
  address: '',
  location: '',
  city: '',
  rent: '',
  description: '',
};

const propertyTypes = ['Apartment', 'House', 'Condo', 'Office', 'Retail'];

function OwnerDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [form, setForm] = useState(initialForm);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({ images: [], taxReceipt: null, aadhaarPan: null, electricityBill: null });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/properties');
        const data = response.data;
        setProperties(data.properties || data || []);
      } catch (err) {
        setError('Unable to load owner properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const summary = useMemo(() => {
    const total = properties.length;
    const available = properties.filter((property) => (property.status || 'AVAILABLE').toLowerCase() === 'available').length;
    const occupied = properties.filter((property) => (property.status || '').toLowerCase() === 'leased').length;
    const pending = properties.filter((property) => (property.status || '').toLowerCase() === 'pending').length;
    const approved = properties.filter((property) => (property.status || '').toLowerCase() === 'active').length;
    const rejected = properties.filter((property) => (property.status || '').toLowerCase() === 'rejected').length;
    return { total, available, occupied, pending, approved, rejected };
  }, [properties]);

  const handleSelectSection = (section) => {
    setError('');
    setStatusMessage('');
    setActiveSection(section);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, files) => {
    setSelectedFiles((prev) => ({ ...prev, [field]: files }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedProperty(null);
    setSelectedFiles({ images: [], taxReceipt: null, aadhaarPan: null, electricityBill: null });
  };

  const loadEditProperty = (property) => {
    setSelectedProperty(property);
    setForm({
      title: property.title || property.name || '',
      propertyType: property.propertyType || property.type || 'Apartment',
      address: property.address || '',
      location: property.location || '',
      city: property.city || '',
      rent: property.rent || property.monthlyRent || '',
      description: property.description || '',
    });
    setActiveSection('add');
  };

  const handleSaveProperty = async (event) => {
    event.preventDefault();
    setError('');
    setStatusMessage('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      selectedFiles.images.forEach((file) => formData.append('images', file));
      if (selectedFiles.taxReceipt) formData.append('taxReceipt', selectedFiles.taxReceipt);
      if (selectedFiles.aadhaarPan) formData.append('aadhaarPan', selectedFiles.aadhaarPan);
      if (selectedFiles.electricityBill) formData.append('electricityBill', selectedFiles.electricityBill);
      const response = await api.post('/api/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const property = response.data.property || response.data;
      setProperties((prev) => [property, ...prev]);
      setStatusMessage('Property saved successfully.');
      resetForm();
      setActiveSection('properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save property.');
    }
  };

  const handleUpdateProperty = async () => {
    if (!selectedProperty) return;
    setError('');
    setStatusMessage('');
    try {
      const payload = {
        title: form.title,
        propertyType: form.propertyType,
        address: form.address,
        location: form.location,
        city: form.city,
        rent: form.rent,
        description: form.description,
      };
      const response = await api.put(`/api/properties/${selectedProperty._id || selectedProperty.id}`, payload);
      const updated = response.data.property || response.data;
      setProperties((prev) => prev.map((item) => (item._id === updated._id || item.id === updated.id ? updated : item)));
      setStatusMessage('Property updated successfully.');
      resetForm();
      setActiveSection('properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update property.');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    setError('');
    setStatusMessage('');
    try {
      await api.delete(`/api/properties/${propertyId}`);
      setProperties((prev) => prev.filter((item) => item._id !== propertyId && item.id !== propertyId));
      setStatusMessage('Property deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete property.');
    }
  };

  const requestSamples = [
    {
      id: 'REQ-001',
      tenant: 'Maya Johnson',
      property: properties[0]?.title || 'Riverside Apartment',
      date: '2026-06-01',
      status: 'Pending',
    },
    {
      id: 'REQ-002',
      tenant: 'Alex Cruz',
      property: properties[1]?.title || 'Harbor View Condo',
      date: '2026-05-26',
      status: 'Approved',
    },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar card-glass p-4">
        <div className="sidebar-brand mb-4">
          <div className="sidebar-logo">LeaseFlow</div>
          <p className="text-muted mb-0">Owner property management panel</p>
        </div>
        <nav className="dashboard-nav">
          {ownerNavigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dashboard-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleSelectSection(item.id)}
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
            <h1 className="page-title mb-2">Owner Control Panel</h1>
            <p className="page-subtitle">Manage property inventory, approvals, requests, and media uploads.</p>
          </div>
          <div className="text-end">
            <span className="badge bg-primary-soft text-primary py-2 px-3">{properties.length} Properties</span>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {statusMessage && <div className="alert alert-success">{statusMessage}</div>}

        {activeSection === 'dashboard' && (
          <>
            <div className="stat-grid mb-4">
              <div className="stat-card">
                <div className="stat-card__title">Total properties</div>
                <div className="stat-card__value">{summary.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Available properties</div>
                <div className="stat-card__value">{summary.available}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Occupied properties</div>
                <div className="stat-card__value">{summary.occupied}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Pending requests</div>
                <div className="stat-card__value">{summary.pending}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Approved requests</div>
                <div className="stat-card__value">{summary.approved}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Rejected requests</div>
                <div className="stat-card__value">{summary.rejected}</div>
              </div>
            </div>

            <div className="card card-glass p-4 mb-4">
              <div className="row gy-4">
                <div className="col-lg-4">
                  <div className="details-card">
                    <strong>Active listings</strong>
                    <p>{summary.total} properties are visible to tenants and admins.</p>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="details-card">
                    <strong>Media ready</strong>
                    <p>Upload images and documents to complete property profiles.</p>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="details-card">
                    <strong>Property health</strong>
                    <p>{summary.available} available and {summary.occupied} occupied units.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'add' && (
          <div className="card card-glass p-4">
            <div className="mb-4">
              <h2 className="mb-2">{selectedProperty ? 'Edit Property' : 'Add Property'}</h2>
              <p className="text-muted">Use this form to save or update property listings.</p>
            </div>
            <form onSubmit={selectedProperty ? (e) => { e.preventDefault(); handleUpdateProperty(); } : handleSaveProperty}>
              <div className="row gy-4">
                <div className="col-md-6">
                  <label className="form-label">Property Name</label>
                  <input className="form-control" value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Property Type</label>
                  <select className="form-select" value={form.propertyType} onChange={(e) => handleFormChange('propertyType', e.target.value)}>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Address</label>
                  <input className="form-control" value={form.address} onChange={(e) => handleFormChange('address', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input className="form-control" value={form.location} onChange={(e) => handleFormChange('location', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.city} onChange={(e) => handleFormChange('city', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Rent</label>
                  <input className="form-control" type="number" value={form.rent} onChange={(e) => handleFormChange('rent', e.target.value)} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="4" value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Upload Images</label>
                  <input type="file" className="form-control" multiple accept="image/*" onChange={(e) => handleFileChange('images', Array.from(e.target.files))} />
                  {selectedFiles.images.length > 0 && <p className="mt-2 text-muted">{selectedFiles.images.length} image(s) selected.</p>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Upload Documents</label>
                  <input type="file" className="form-control mb-2" accept="application/pdf,image/*" onChange={(e) => handleFileChange('taxReceipt', e.target.files[0] || null)} />
                  <input type="file" className="form-control mb-2" accept="application/pdf,image/*" onChange={(e) => handleFileChange('aadhaarPan', e.target.files[0] || null)} />
                  <input type="file" className="form-control" accept="application/pdf,image/*" onChange={(e) => handleFileChange('electricityBill', e.target.files[0] || null)} />
                </div>
                <div className="col-12 d-flex gap-3 flex-wrap">
                  <button type="submit" className="btn btn-gradient">{selectedProperty ? 'Update Property' : 'Save Property'}</button>
                  {selectedProperty && <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel Edit</button>}
                </div>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'properties' && (
          <>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h2 className="mb-2">My Properties</h2>
                <p className="text-muted">All listings you have uploaded to LeaseFlow.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => handleSelectSection('add')}>Add new property</button>
            </div>
            <div className="property-grid">
              {properties.length === 0 ? (
                <div className="alert alert-warning">No properties available. Add a new property to get started.</div>
              ) : (
                properties.map((property) => {
                  const title = property.title || property.name || 'Property';
                  const location = property.location || property.address || 'Location unavailable';
                  const rent = property.rent || property.monthlyRent || 'N/A';
                  const status = property.status || 'Available';

                  return (
                    <article key={property._id || property.id || title} className="property-card">
                      <div className="property-card__media">{status}</div>
                      <div className="property-card__body">
                        <h5>{title}</h5>
                        <p className="text-muted mb-2">{location}</p>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-semibold">{typeof rent === 'number' ? `$${rent}/mo` : rent}</span>
                          <span className={`status-pill status-pill--${status.toLowerCase()}`}>{status}</span>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => loadEditProperty(property)}>Edit</button>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProperty(property._id || property.id)}>Delete</button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeSection === 'images' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">Upload Images</h2>
            <p className="text-muted mb-4">Upload property photos for listings and review selected files here.</p>
            <div className="mb-3">
              <input type="file" className="form-control" accept="image/*" multiple onChange={(e) => handleFileChange('images', Array.from(e.target.files))} />
            </div>
            {selectedFiles.images.length > 0 ? (
              <ul className="list-group list-group-flush">
                {selectedFiles.images.map((file, index) => (
                  <li key={index} className="list-group-item py-2">{file.name}</li>
                ))}
              </ul>
            ) : (
              <div className="alert alert-light">No images selected yet.</div>
            )}
          </div>
        )}

        {activeSection === 'documents' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">Upload Documents</h2>
            <p className="text-muted mb-4">Attach property paperwork, ID, and utility documents.</p>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Tax Receipt</label>
                <input type="file" className="form-control" accept="application/pdf,image/*" onChange={(e) => handleFileChange('taxReceipt', e.target.files[0] || null)} />
                {selectedFiles.taxReceipt && <p className="text-muted mt-2">{selectedFiles.taxReceipt.name}</p>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Aadhaar / PAN</label>
                <input type="file" className="form-control" accept="application/pdf,image/*" onChange={(e) => handleFileChange('aadhaarPan', e.target.files[0] || null)} />
                {selectedFiles.aadhaarPan && <p className="text-muted mt-2">{selectedFiles.aadhaarPan.name}</p>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Electricity Bill</label>
                <input type="file" className="form-control" accept="application/pdf,image/*" onChange={(e) => handleFileChange('electricityBill', e.target.files[0] || null)} />
                {selectedFiles.electricityBill && <p className="text-muted mt-2">{selectedFiles.electricityBill.name}</p>}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'requests' && (
          <div className="card card-glass p-4">
            <div className="d-flex justify-content-between flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-4">
              <div>
                <h2 className="mb-2">Tenant Requests</h2>
                <p className="text-muted">Review the latest tenant inquiries and approve or reject them.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Tenant</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requestSamples.map((request) => (
                    <tr key={request.id}>
                      <td>{request.property}</td>
                      <td>{request.tenant}</td>
                      <td>{request.date}</td>
                      <td><span className={`status-pill status-pill--${request.status.toLowerCase()}`}>{request.status}</span></td>
                      <td className="text-end">
                        <button type="button" className="btn btn-sm btn-outline-primary me-2">View</button>
                        <button type="button" className="btn btn-sm btn-outline-success me-2">Approve</button>
                        <button type="button" className="btn btn-sm btn-outline-danger">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">Reports</h2>
            <p className="text-muted mb-4">Analyze property performance and request activity at a glance.</p>
            <div className="details-grid">
              <div className="details-card">
                <strong>Listing quality</strong>
                <p>{summary.total} properties with active media, pricing and status.</p>
              </div>
              <div className="details-card">
                <strong>Pending approvals</strong>
                <p>{summary.pending} items awaiting review.</p>
              </div>
              <div className="details-card">
                <strong>Recent uptake</strong>
                <p>{summary.occupied} occupied units across your portfolio.</p>
              </div>
              <div className="details-card">
                <strong>Review insights</strong>
                <p>Property cards and media uploads drive tenant interest.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OwnerDashboard;
