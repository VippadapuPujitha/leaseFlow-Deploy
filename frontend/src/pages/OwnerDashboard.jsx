import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext.jsx';

const ownerNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'add', label: 'Add Property', icon: '➕' },
  { id: 'properties', label: 'My Properties', icon: '🏢' },
  { id: 'requests', label: 'Tenant Requests', icon: '📨' },
];

const propertyTypes = ['Apartment', 'House', 'Villa', 'Office', 'Shop'];

const initialForm = {
  title: '',
  propertyType: 'Apartment',
  address: '',
  city: '',
  rent: '',
  description: '',
  latitude: '',
  longitude: '',
  bedrooms: '',
  bathrooms: '',
};

function OwnerDashboard() {
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
  const [files, setFiles] = useState({
    images: [],
    ownershipDoc: null,
    taxDoc: null,
    idProof: null,
  });

  // ---------------- FETCH PROPERTIES ----------------
  useEffect(() => {
    console.log("USER:", user);
  if (!user?.id) return;

  const fetchProperties = async () => {
    try {
      const res = await api.get(`/api/properties/owner/${user.id}`);

      console.log("Owner Properties Response:", res.data);

      setProperties(res.data.properties || []);
      console.log("Properties:", res.data.properties);
    } catch (err) {
      console.log("Fetch Error:", err);
    }
  };

  fetchProperties();
}, [user]);

  // ---------------- FETCH REQUESTS ----------------
  useEffect(() => {
    if (activeSection === 'requests') {
      api.get('/api/requests/owner')
        .then(res => setRequests(res.data.requests || []))
        .catch(console.log);
    }
  }, [activeSection]);

  // ---------------- FORM HANDLERS ----------------
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFile = (key, value) => {
    setFiles(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectSection = (sec) => {
    setActiveSection(sec);
  };

  // ---------------- SAVE PROPERTY ----------------
  const handleSave = async (e) => {
    e.preventDefault();
    if (
  !form.title ||
  !form.propertyType ||
  !form.address ||
  !form.city ||
  !form.rent ||
  !form.description ||
  !form.latitude ||
  !form.longitude ||
  files.images.length === 0 ||
  !files.ownershipDoc ||
  !files.taxDoc ||
  !files.idProof
) {
  setErrorMessage("Please fill all fields and upload all required documents.");
  return;
}

setErrorMessage('');

    try {
      const formData = new FormData();

      Object.keys(form).forEach(k => formData.append(k, form[k]));

      files.images.forEach(img => formData.append('images', img));

if (files.ownershipDoc)
  formData.append('electricityBill', files.ownershipDoc);

if (files.taxDoc)
  formData.append('taxReceipt', files.taxDoc);

if (files.idProof)
  formData.append('aadhaarPan', files.idProof);

      const res = await api.post('/api/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProperties(prev => [res.data.property, ...prev]);

      setForm(initialForm);
      setFiles({ images: [], ownershipDoc: null, taxDoc: null, idProof: null });
      setSuccessMessage('Property added successfully!');
    } catch (err) {
  console.log("ERROR:", err);
  console.log("RESPONSE:", err.response?.data);
}
  };

  // ---------------- UPDATE PROPERTY ----------------
  const handleUpdate = async () => {
    try {
      const res = await api.put(
        `/api/properties/${selectedProperty._id}`,
        form
      );

      setProperties(prev =>
        prev.map(p =>
          p._id === selectedProperty._id ? res.data.property : p
        )
      );

      setSelectedProperty(null);
      setForm(initialForm);
      setActiveSection('properties');

    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/properties/${id}`);
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- REQUEST ACTIONS ----------------
  const handleAccept = async (id) => {
    try {
      await api.patch(`/api/requests/accept/${id}`);
      setRequests(prev =>
        prev.map(r => r._id === id ? { ...r, status: 'accepted' } : r)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/api/requests/reject/${id}`);
      setRequests(prev =>
        prev.map(r => r._id === id ? { ...r, status: 'rejected' } : r)
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- STATS ----------------
  const summary = useMemo(() => ({
  total: properties.length,
  available: properties.filter(
    p => p.rentalStatus === "available"
  ).length,
  occupied: properties.filter(
    p => p.rentalStatus === "rented"
  ).length,
  hidden: properties.filter(
    p => p.isHidden
  ).length,
}), [properties]);

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={{ color: 'black' }}>LeaseFlow</h2>

        {ownerNavigation.map(item => (
          <button
            key={item.id}
            onClick={() => handleSelectSection(item.id)}
            style={{
              ...styles.navBtn,
              background: activeSection === item.id ? '#4f46e5' : 'transparent',
               color: activeSection === item.id ? 'white' : 'black'
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main style={styles.main}>

        {activeSection === 'dashboard' && (
  <>
    <h2 style={{ marginBottom: "20px" }}>Owner Dashboard</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "25px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h4 style={{ color:'#1f2937', fontWeight: 'normal' }}>
  Total Properties
</h4>
        <h2 style={{ color: '#1f2937' }}>
  {summary.total}
</h2>
      </div>

      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h4 style={{ color:'#1f2937', fontWeight: 'normal' }}>
  Available Properties
</h4>
        <h2>{summary.available}</h2>
      </div>

      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h4 style={{ color:'#1f2937', fontWeight: 'normal' }}>
  Occupied Properties
</h4>
        <h2>{summary.occupied}</h2>
      </div>

      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h4 style={{ color: '#1f2937', fontWeight: 'normal' }}>
  Available Properties
</h4>
        <h2>{summary.hidden}</h2>
      </div>
    </div>
  </>
)}

        {/* ADD PROPERTY */}
        {activeSection === 'add' && (
          <div style={styles.card}>
            <h2>{selectedProperty ? "Edit Property" : "Add Property"}</h2>
            {successMessage && (
  <div
    style={{
      background: "#d1fae5",
      color: "#065f46",
      padding: "10px",
      borderRadius: "6px",
      marginBottom: "10px"
    }}
  >
    {successMessage}
  </div>
)}
            <form onSubmit={selectedProperty ? (e) => { e.preventDefault(); handleUpdate(); } : handleSave} style={styles.form}>

              <div style={styles.row}>
                <input style={styles.input} placeholder="Title" required
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)} />

                <select style={styles.input}
                  value={form.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}>
                  {propertyTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div style={styles.row}>
                <input style={styles.input} placeholder="Address" required
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)} />

                <input style={styles.input} placeholder="City"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)} />
              </div>

              <div style={styles.row}>
                <input style={styles.input} type="number" placeholder="Rent" required
                  value={form.rent}
                  onChange={(e) => handleChange("rent", e.target.value)} />

                <textarea style={styles.input} placeholder="Description" required
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)} />
              </div>

              <div style={styles.row}>
                <input style={styles.input} type="number" placeholder="Latitude" required
                  value={form.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)} />

                <input style={styles.input} type="number" placeholder="Longitude" required
                  value={form.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)} />
              </div>

              <div style={styles.row}>
  <input
    style={styles.input}
    type="number"
    placeholder="Bedrooms"
    value={form.bedrooms || ""}
    onChange={(e) => handleChange("bedrooms", e.target.value)}
  />

  <input
    style={styles.input}
    type="number"
    placeholder="Bathrooms"
    value={form.bathrooms || ""}
    onChange={(e) => handleChange("bathrooms", e.target.value)}
  />
</div>

              {/* FILES */}
              <div style={styles.row}>
                <div style={styles.fileBox}>
                  <label>Images</label>
                  <input type="file" multiple required
                    onChange={(e) => handleFile("images", [...e.target.files])} />
                </div>

                <div style={styles.fileBox}>
                  <label>Ownership Doc</label>
                  <input type="file" required
                    onChange={(e) => handleFile("ownershipDoc", e.target.files[0])} />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fileBox}>
                  <label>Tax Doc</label>
                  <input type="file" required
                    onChange={(e) => handleFile("taxDoc", e.target.files[0])} />
                </div>

                <div style={styles.fileBox}>
                  <label>ID Proof</label>
                  <input type="file" required
                    onChange={(e) => handleFile("idProof", e.target.files[0])} />
                </div>
              </div>

              <button style={styles.btn}>
                {selectedProperty ? "Update" : "Save"}
              </button>

            </form>
          </div>
        )}

        {/* PROPERTIES */}
        {activeSection === 'properties' && (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
    }}
  >
    {Array.isArray(properties) &&
      properties.map((p, index) => (
        <div key={p?._id || index} style={styles.card}>
          <h3>{p?.title}</h3>
          <p>{p?.propertyType}</p>
          <p>₹{p?.rent}</p>

          {p?.isHidden && (
            <p style={{ color: 'red' }}>Hidden</p>
          )}

          <button
            onClick={() => {
              setSelectedProperty(p);

              setForm({
                title: p.title || "",
                propertyType: p.propertyType || "Apartment",
                address: p.address || "",
                city: p.city || "",
                rent: p.rent || "",
                description: p.description || "",
                latitude: p.latitude || "",
                longitude: p.longitude || ""
              });

              setActiveSection("add");
            }}
          >
            Edit
          </button>

          <button onClick={() => handleDelete(p._id)}>
            Delete
          </button>
        </div>
      ))}
  </div>
)}

        {/* REQUESTS */}
        {activeSection === 'requests' && (
  <div>
    <h2>Requests</h2>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px',
      }}
    >
      {requests.map(r => (
        <div key={r._id} style={styles.card}>
          <p><strong>Tenant:</strong> {r.tenant?.name}</p>
          <p><strong>Property:</strong> {r.property?.title}</p>
          <p><strong>Status:</strong> {r.status}</p>

          <button onClick={() => handleAccept(r._id)}>
            Accept
          </button>

          <button
            onClick={() => handleReject(r._id)}
            style={{ marginLeft: '10px' }}
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  </div>
)}

      </main>
    </div>
  );
}

export default OwnerDashboard;

/* ---------------- STYLES ---------------- */
const styles = {
  container: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: '220px', padding: '20px', color: '#1f2937' },
  navBtn: { width: '100%', padding: '10px', marginTop: '10px', color: 'white', border: 'none', textAlign: 'left' },
  main: { flex: 1, padding: '20px' },
  card: { background: '#f3f4f6', padding: '15px', marginBottom: '10px', borderRadius: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' },
  fileBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  btn: { background: '#4f46e5', color: 'white', padding: '10px', border: 'none' }
};