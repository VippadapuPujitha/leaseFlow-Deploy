import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import SavedProperties from './SavedProperties';

const tenantNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'browse', label: 'Browse Properties', icon: '🔍' },
  { id: 'saved', label: 'Saved Properties', icon: '❤️' },
  { id: 'requests', label: 'My Requests', icon: '📨' },
  { id: 'rentals', label: 'My Rentals', icon: '🏡' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

const statusLabels = {
  pending: '🟡 Pending',
  accepted: '🟢 Approved',
  rejected: '🔴 Rejected',
};

function TenantDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [rentMin, setRentMin] = useState('');
  const [rentMax, setRentMax] = useState('');
  const [requests, setRequests] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savedProperties, setSavedProperties] = useState([]);
  const [profileForm, setProfileForm] =
   useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: null,
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [requestMessage, setRequestMessage] = useState("");
  const fetchSavedProperties = async () => {
    try {
      const response = await api.get(
        "/api/users/saved-properties"
      );

      setSavedProperties(
        response.data.map((property) => property._id)
      );
    } catch (error) {
      console.log(error);
    }
  };
  const fetchProfile = async () => {
  try {
    const response = await api.get("/api/users/profile");

    setProfileForm((prev) => ({
      ...prev,
      name: response.data.name || "",
      email: response.data.email || "",
      phone: response.data.phone || "",
    }));
  } catch (error) {
    console.log(error);
  }
};
const fetchMyRequests = async () => {
  try {
    const response = await api.get("/api/requests/my-requests");

    console.log("MY REQUESTS:", response.data);

    setRequests(response.data.requests || []);
    const acceptedRentals = (response.data.requests || [])
  .filter((request) => request.status === "accepted");

setRentals(acceptedRentals);
  } catch (error) {
    console.log(error);
  }
};

const handleWithdraw = async (requestId) => {
  try {
    await api.patch(`/api/requests/withdraw/${requestId}`);

    setRequests((prev) =>
      prev.filter((r) => r._id !== requestId)
    );
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
  const fetchProperties = async () => {
    setLoading(true);

    try {
      const response = await api.get('/api/properties');
      const data = response.data;
      console.log("API RESPONSE:", data.properties);
      setProperties(data.properties || data || []);
      console.log("PROPERTIES STATE:", data.properties || data || []);
    } catch (err) {
      setError('Unable to load properties at this time.');
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
  fetchSavedProperties();
  fetchProfile();
  fetchMyRequests();

}, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      console.log("PROPERTY:", property);
      const title = (property.title || property.name || '').toLowerCase();
      const address = (property.address || property.location || '').toLowerCase();

const city = (property.city || '').toLowerCase();

const matchesLocation =
  !location ||
  address.includes(location.toLowerCase()) ||
  city.includes(location.toLowerCase());
      const type = (property.propertyType || property.type || '').toLowerCase();
      const rent = Number(property.rent || property.monthlyRent || 0);
      const isLocked = property.status === "LOCKED";
      const searchText = search.toLowerCase();
      const matchesSearch = title.includes(searchText) || address.includes(searchText) || property._id?.includes(searchText) || property.id?.includes(searchText);
      
      const matchesType = !propertyType || type.includes(propertyType.toLowerCase());
      const matchesMin = !rentMin || rent >= Number(rentMin);
      const matchesMax = !rentMax || rent <= Number(rentMax);
      return !isLocked &&
       matchesSearch &&
       matchesLocation &&
       matchesType &&
       matchesMin &&
       matchesMax;
    });
  }, [properties, search, location, propertyType, rentMin, rentMax]);

console.log(
  requests.map((r) => ({
    property: r.property?.title,
    status: r.status,
  }))
);

  const summary = useMemo(() => ({
  totalProperties: properties.length,
  appliedRequests: requests.length,
  approvedRequests: requests.filter(
    (item) => item.status === "accepted"
  ).length,
  rejectedRequests: requests.filter(
    (item) => item.status === "rejected"
  ).length,
  activeRentals: rentals.length,
}), [properties.length, requests, rentals.length]);

    const handleSaveProperty = async (propertyId) => {
  try {
    await api.post(`/api/users/save/${propertyId}`);

    await fetchSavedProperties();
  } catch (error) {
    console.log(error.response?.data?.message);
  }
};

  const handleSendRequest = async (property) => {
  try {
    const payload = {
      propertyId: property._id || property.id,
    };

    const response = await api.post("/api/requests/send", payload);

    const request = response.data.request || response.data;

    console.log("NEW REQUEST:", request);

    setRequests((prev) => [...prev, request]);

    // Show success message
    setRequestMessage("✅ Property request sent successfully.");

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Hide message after 3 seconds
    setTimeout(() => {
      setRequestMessage("");
    }, 3000);

  } catch (err) {
    console.log(err.response?.data);

    setRequestMessage(
      err.response?.data?.message || "Unable to submit request."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });


  }
};

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileUpload = (file) => {
    setProfileForm((prev) => ({ ...prev, profilePicture: file }));
  };

  const handleSaveProfile = async (event) => {
  event.preventDefault();

  if (!profileForm.name || !profileForm.email) {
    setProfileError("Name and email are required.");
    return;
  }

  if (!/^\d{10}$/.test(profileForm.phone)) {
    setProfileError(
      "Phone number must be exactly 10 digits."
    );
    return;
  }

  try {
    await api.put("/api/users/profile", {
      name: profileForm.name,
      phone: profileForm.phone,
    });

    setProfileError("");
    setProfileMessage(
      "Profile updated successfully."
    );
    setEditingProfile(false);
  } catch (error) {
    setProfileError(
      error.response?.data?.message ||
      "Failed to update profile"
    );
  }
};

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar card-glass p-4">
        <div className="sidebar-brand mb-4">
          <div className="sidebar-logo">LeaseFlow</div>
          <p className="text-muted mb-0">Tenant rental marketplace</p>
        </div>
        <nav className="dashboard-nav">
          {tenantNavigation.map((item) => (
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
        

        {error && <div className="alert alert-danger">{error}</div>}

        {activeSection === 'dashboard' && (
          <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h1 className="page-title display-5 fw-bold mb-2">Tenant Marketplace</h1>
            <p className="page-subtitle fs-5">Browse rentals, manage your requests, and track active leases.</p>
          </div>
          <div className="text-end">
            <span className="badge bg-primary-soft text-primary py-2 px-3">{summary.totalProperties} listings</span>
          </div>
        </div>
            <div className="stat-grid mb-4">
              <div className="stat-card">
                <div className="stat-card__title">Total properties</div>
                <div className="stat-card__value">{summary.totalProperties}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Applied requests</div>
                <div className="stat-card__value">{summary.appliedRequests}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Approved requests</div>
                <div className="stat-card__value">{summary.approvedRequests}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Rejected requests</div>
                <div className="stat-card__value">{summary.rejectedRequests}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__title">Active rentals</div>
                <div className="stat-card__value">{summary.activeRentals}</div>
              </div>
            </div>

            <div className="card card-glass p-4">
              <h4 className="mb-3">Looking for a new rental?</h4>
              <p className="text-muted">Use Browse Properties to filter by location, type, rent range, and property name.</p>
            </div>
          </>
        )}

        {activeSection === 'browse' && (
  <>
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h2 className="mb-2">Browse Properties</h2>
        <p className="text-muted">
          Modern rental listings with filters and quick request actions.
        </p>
      </div>
    </div>

    {requestMessage && (
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#4CAF50",
          color: "white",
          padding: "12px 25px",
          borderRadius: "8px",
          fontWeight: "600",
          zIndex: 9999,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        {requestMessage}
      </div>
    )}

    <div className="card card-glass mb-4 p-4">
      <div className="row gy-3">
        <div className="col-md-4">
          <label className="form-label">Location</label>
          <input
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or neighborhood"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Property Type</label>
          <select
            className="form-select"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Office">Office</option>
            <option value="Shop">Shop</option>
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Rent min</label>
          <input
            className="form-control"
            type="number"
            value={rentMin}
            onChange={(e) => setRentMin(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">Rent max</label>
          <input
            className="form-control"
            type="number"
            value={rentMax}
            onChange={(e) => setRentMax(e.target.value)}
            placeholder="Any"
          />
        </div>

        <div className="col-12">
          <label className="form-label">Search</label>
          <input
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Property Name"
          />
        </div>
      </div>
    </div>

    {loading ? (
      <div className="alert alert-info">Loading marketplace...</div>
    ) : (
      <div className="property-grid">
        {filteredProperties.length ? (
          filteredProperties.map((property) => {
            const title = property.title || property.name || "Property";

            const address =
              `${property.address || property.location || ""}${
                property.city ? `, ${property.city}` : ""
              }` || "Location not available";

            const rent = property.rent || property.monthlyRent || "N/A";

            const description =
              property.description ||
              "A modern rental with great amenities.";

            const status = property.status || "Available";

const image =
  property.images?.[0] || property.image || "";

return (
  <article
    key={property._id || property.id || title}
    className="property-card"
  >
                <div className="property-card__media">
  {image ? (
    <img
      src={image}
      alt={title}
      className="img-fluid"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  ) : (
    <div>
      {title.split(" ").slice(0, 2).join(" ")}
    </div>
  )}
</div>

                <div className="property-card__body">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <h5 className="mb-2">{title}</h5>

                      <p className="text-muted mb-2 property-address">
                        {address}
                      </p>
                    </div>

                    <span className="property-badge">{status}</span>
                  </div>

                  <p className="text-muted mb-3 property-description">
                    {description.slice(0, 110)}
                  </p>

                  <div className="mt-auto">
                    <div className="property-card__meta">
                      <span>{property.bedrooms ?? "-"} Beds</span>
                      <span>{property.bathrooms ?? "-"} Baths</span>
                      <span>
  {property.squareFeet
    ? `${property.squareFeet} sqft`
    : "— sqft"}
</span>
                    </div>
                  </div>
                </div>

                <div className="property-card__footer">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong>
                      {typeof rent === "number"
                        ? `₹${rent}/mo`
                        : rent}
                    </strong>
                  </div>

                  <div className="d-flex gap-2">
                    <Link
  className="btn btn-outline-primary btn-sm flex-fill"
  to={`/properties/${property._id || property.id}`}
  state={{ from: "/browse-properties" }}
>
  View
</Link>

                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm flex-fill"
                      disabled={savedProperties.some(
                        (id) =>
                          String(id) ===
                          String(property._id || property.id)
                      )}
                      onClick={() =>
                        handleSaveProperty(property._id || property.id)
                      }
                    >
                      {savedProperties.some(
                        (id) =>
                          String(id) ===
                          String(property._id || property.id)
                      )
                        ? "Saved ✓"
                        : "Save"}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-gradient w-100 mt-3"
                    onClick={() => handleSendRequest(property)}
                  >
                    Request Property
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="alert alert-light">
            No matching properties found. Try broadening your filters.
          </div>
        )}
      </div>
    )}
  </>
)}

        {activeSection === 'saved' && (
          <SavedProperties />
        )}
        {activeSection === 'requests' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">My Requests</h2>
            <p className="text-muted">Track request status and request details in one place.</p>
            <div className="table-responsive">
  <table
    className="table align-middle"
    style={{ width: "100%", tableLayout: "fixed" }}
  >
    <thead>
      <tr>
        <th style={{ width: "30%" }} className="text-start">
          Property Name
        </th>

        <th style={{ width: "15%" }} className="text-center">
          Owner Name
        </th>

        <th style={{ width: "18%" }} className="text-center">
          Contact
        </th>

        <th style={{ width: "17%" }} className="text-center">
          Request Date
        </th>

        <th style={{ width: "20%" }} className="text-center">
          Status
        </th>
      </tr>
    </thead>

    <tbody>
      {requests.length ? (
        requests.map((request) => (
          <tr key={request._id}>
            <td className="text-start">
              {request.property?.title || (
                <span className="text-danger">
                  Property Deleted
                </span>
              )}
            </td>

            <td className="text-center">
              {request.owner?.name}
            </td>

            <td
  className="text-center"
  style={{ whiteSpace: "nowrap" }}
>
  {request.status === "accepted" ? (
    request.owner?.phone || (
      <span className="text-muted">
        Not Available
      </span>
    )
  ) : (
    <span className="text-muted">
      Not Available
    </span>
  )}
</td>

            <td className="text-center">
              {new Date(
                request.createdAt
              ).toLocaleDateString()}
            </td>

            <td className="text-center">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>
                  {statusLabels[request.status] ||
                    request.status}
                </span>

                {request.status === "pending" && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      handleWithdraw(request._id)
                    }
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="5"
            className="text-center text-muted"
          >
            No requests yet. Browse properties to submit your
            first request.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
          </div>
        )}

        {activeSection === 'rentals' && (
          <div className="card card-glass p-4">
            <h2 className="mb-3">My Rentals</h2>
            <p className="text-muted">Approved rentals and current lease details.</p>
            <div className="row g-4">
              {rentals.length ? (
                rentals.map((rental) => (
                  <div className="col-md-6" key={rental._id}>
                    <div className="details-card h-100">
                      <h5>{rental.property?.title}</h5>

<p className="text-muted mb-2">
  {rental.property?.address}
</p>

<p className="mb-2">
  <strong>Monthly Rent:</strong> ₹{rental.property?.rent}
</p>

<p className="mb-2">
  <strong>Owner:</strong> {rental.owner?.name}
</p>

<div className="d-flex align-items-center justify-content-between mt-3">
  <div className="d-flex align-items-center">
    <strong className="me-2">Status:</strong>

    <span className="status-pill status-pill--success">
      Active
    </span>
  </div>

  <Link
    to={`/properties/${rental.property?._id}`}
    state={{ from: "/my-rentals" }}
    className="btn btn-outline-primary btn-sm"
  >
    View
  </Link>
</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-light">No active rentals yet. Approved requests become active rentals.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="card card-glass p-4">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-column flex-md-row">
              <div>
                <h2 className="mb-2">Profile</h2>
                <p className="text-muted mb-0">Review your tenant profile and update contact information.</p>
              </div>
              <button type="button" className="btn btn-outline-primary" onClick={() => { setEditingProfile((prev) => !prev); setProfileMessage(''); setProfileError(''); }}>
                {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            {profileMessage && <div className="alert alert-success">{profileMessage}</div>}
            {profileError && <div className="alert alert-danger">{profileError}</div>}

            {editingProfile ? (
              <form onSubmit={handleSaveProfile}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={profileForm.name} onChange={(e) => handleProfileChange('name', e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={profileForm.email} onChange={(e) => handleProfileChange('email', e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone number</label>
                  </div>
                  <input
                    className="form-control"
                    value={profileForm.phone}
                    maxLength="10"
                    onChange={(e) =>
                      handleProfileChange(
                        "phone",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="Enter 10-digit phone number"
                  />
                  <div className="col-12 d-flex gap-2 flex-wrap">
                    <button type="submit" className="btn btn-primary">Save Profile</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="details-grid">
                <div className="details-card">
                  <strong>Name</strong>
                  <p>{profileForm.name || 'Tenant user'}</p>
                </div>
                <div className="details-card">
                  <strong>Email</strong>
                  <p>{profileForm.email || 'user@example.com'}</p>
                </div>
                <div className="details-card">
                  <strong>Role</strong>
                  <p>Tenant</p>
                </div>
                <div className="details-card">
                  <strong>Phone Number</strong>
                  <p>{profileForm.phone || "Not Added"}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default TenantDashboard;