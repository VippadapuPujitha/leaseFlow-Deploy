import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from "react-router-dom";

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
  squareFeet: '',
  availableFrom: '',
};

function OwnerDashboard() {
  const { user } = useAuth();
  const location = useLocation();
const path = location.pathname;
console.log("CURRENT PATH:", path);
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  
  const [form, setForm] = useState(initialForm);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
const [dealMessage, setDealMessage] = useState('');
const [notification, setNotification] = useState("");
const [notificationType, setNotificationType] = useState("success");
const [deleteMessage, setDeleteMessage] = useState("");
const [isEditMode, setIsEditMode] = useState(false);
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
      const res = await api.get(
        `/api/properties/owner/${user.id}`
      );

      console.log("Owner Properties Response:", res.data);

      setProperties(res.data.properties || []);
    } catch (err) {
      console.log("Fetch Error:", err);
    }
  };

  fetchProperties();
}, [user]);

  // ---------------- FETCH REQUESTS ----------------
  useEffect(() => {
  if (path !== "/tenant-requests") return;

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/requests/owner");

      console.log("Owner Requests Response:", res.data);

      setRequests(res.data.requests || []);
    } catch (err) {
      console.log("Requests Fetch Error:", err);
    }
  };

  fetchRequests();
}, [path]);

const showNotification = (message, type = "success") => {
  setNotification(message);
  setNotificationType(type);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  setTimeout(() => {
    setNotification("");
  }, 3000);
};

  // ---------------- FORM HANDLERS ----------------
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFile = (key, value) => {
    setFiles(prev => ({ ...prev, [key]: value }));
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
  !form.bedrooms ||
  !form.bathrooms ||
  !form.latitude ||
  !form.longitude ||
  files.images.length === 0 
) {
  setErrorMessage("Please fill all fields and upload all required documents.");
  return;
}

setErrorMessage('');

    try {
      console.log("FORM DATA BEFORE SAVE:", form);
      const formData = new FormData();

      Object.keys(form).forEach(k => formData.append(k, form[k]));

      files.images.forEach(img => formData.append('images', img));

if (files.ownershipDoc)
  formData.append('electricityBill', files.ownershipDoc);

if (files.taxDoc)
  formData.append('taxReceipt', files.taxDoc);

if (files.idProof)
  formData.append('aadhaarPan', files.idProof);
console.log("FORM:", form);
      const res = await api.post('/api/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProperties(prev => [res.data.property, ...prev]);

      setForm(initialForm);
      setFiles({ images: [], ownershipDoc: null, taxDoc: null, idProof: null });
      showNotification("✅ Property added successfully!");
    } catch (err) {
  console.log("ERROR:", err);
  console.log("RESPONSE:", err.response?.data);
}
  };

  // ---------------- UPDATE PROPERTY ----------------
const handleUpdate = async () => {
  try {
    console.log("Updating property:", selectedProperty._id);
    console.log("Form Data:", form);

    const res = await api.put(
      `/api/properties/${selectedProperty._id}`,
      form
    );

    console.log(res.data);

    showNotification("✅ Property updated successfully!");
    setIsEditMode(false);

    fetchProperties(); // reload properties
  } catch (err) {
    console.log(
      "UPDATE ERROR:",
      err.response?.data || err.message
    );
  }
};

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
  try {
    await api.delete(`/api/properties/${id}`);

    setProperties(prev => prev.filter(p => p._id !== id));

    setDeleteMessage("Property deleted successfully");

    setTimeout(() => {
      setDeleteMessage("");
    }, 3000);

  } catch (err) {
    console.log("DELETE ERROR:", err.response?.data || err);
  }
};

  // ---------------- REQUEST ACTIONS ----------------
  const handleAccept = async (id) => {
  try {
    await api.patch(`/api/requests/accept/${id}`);

  setRequests(prev =>
  prev.map(r =>
    r._id === id
      ? {
          ...r,
          status: "pending",
          ownerAccepted: true,
          contactShared: true,
        }
      : r
  )
);

    showNotification("✅ Request accepted successfully!");

  } catch (err) {
    console.log(err);
  }
};

const handleHideProperty = async (id) => {
  try {
    await api.patch(`/api/properties/hide/${id}`);

    setProperties((prev) =>
      prev.map((p) =>
        p._id === id
          ? { ...p, isHidden: true }
          : p
      )
    );
  } catch (err) {
    console.log(err);
  }
};
const handleUnhideProperty = async (id) => {
  try {
    console.log("UNHIDE CLICKED:", id);

    const res = await api.patch(
      `/api/properties/unhide/${id}`
    );

    console.log("UNHIDE RESPONSE:", res.data);

    setProperties((prev) =>
      prev.map((p) =>
        p._id === id
          ? { ...p, isHidden: false }
          : p
      )
    );
    showNotification("✅ Unhide Successfully!");
  } catch (err) {
    console.log("UNHIDE ERROR:", err);
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
  }
};

  const handleReject = async (id) => {
  try {
    await api.patch(`/api/requests/reject/${id}`);

    setRequests(prev =>
  prev.map(r =>
    r._id === id
      ? {
          ...r,
          status: "rejected"
        }
      : r
  )
);

    setRequestMessage("❌ Request rejected successfully");

    setTimeout(() => {
      setRequestMessage("");
    }, 3000);

  } catch (err) {
    console.log(err);
  }
};

  const handleFinalize = async (id, decision) => {
  try {
    const res = await api.patch(
  `/api/requests/finalize/${id}`,
  { decision }
);

console.log("FINALIZE RESPONSE:", res.data);

    if (decision === "success") {
      showNotification("🎉 Deal completed successfully!");
    } else {
      showNotification("Deal cancelled!");
    }
   setRequests(prev =>
    prev.map(r =>
        r._id === id
            ? {
                  ...r,
                  status: decision === "success" ? "accepted" : "cancelled",
                  ownerAccepted: false,
              }
            : r
    )
);

    const propRes = await api.get(
      `/api/properties/owner/${user.id}`
    );

    setProperties(propRes.data.properties || []);
    const reqRes = await api.get("/api/requests/owner");

setRequests(reqRes.data.requests || []);

  } catch (err) {
  console.log("ERROR STATUS:", err.response?.status);
  console.log("ERROR DATA:", err.response?.data);
  console.log("ERROR URL:", err.config?.url);
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

const hiddenProperties = properties.filter(
  p => p.isHidden
);

  return (
    <div style={styles.container}>

      {/* MAIN */}
      <main style={styles.main}>
        {notification && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor:
        notificationType === "success" ? "#22c55e" : "#ef4444",
      color: "#fff",
      padding: "12px 24px",
      borderRadius: "8px",
      fontWeight: "600",
      zIndex: 9999,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    }}
  >
    {notification}
  </div>
)}

        {path === '/owner-dashboard' && (
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
  Hidden Properties
</h4>
        <h2>{summary.hidden}</h2>
      </div>
    </div>
  </>
)}

        {/* ADD PROPERTY */}
{path === '/add-property' && (
  <div style={styles.card}>
    <h2>{selectedProperty ? "Edit Property" : "Add Property"}</h2>

    {successMessage && (
      <div
        style={{
          background: "#d1fae5",
          color: "#065f46",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "15px"
        }}
      >
        {successMessage}
      </div>
    )}

    <form
      onSubmit={
        selectedProperty
          ? (e) => {
              e.preventDefault();
              handleUpdate();
            }
          : handleSave
      }
      style={styles.form}
    >
      <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Title <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      placeholder="Title"
      value={form.title}
      onChange={(e) => handleChange("title", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Property Type <span style={{ color: "red" }}>*</span>
    </label>
    <select
      style={styles.input}
      value={form.propertyType}
      onChange={(e) => handleChange("propertyType", e.target.value)}
    >
      {propertyTypes.map((t) => (
        <option key={t}>{t}</option>
      ))}
    </select>
  </div>
</div>

      <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Address <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      placeholder="Address"
      value={form.address}
      onChange={(e) => handleChange("address", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      City <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      placeholder="City"
      value={form.city}
      onChange={(e) => handleChange("city", e.target.value)}
    />
  </div>
</div>

      <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Rent <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      type="number"
      placeholder="Rent"
      value={form.rent}
      onChange={(e) => handleChange("rent", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Description <span style={{ color: "red" }}>*</span>
    </label>
    <textarea
      style={styles.input}
      placeholder="Description"
      value={form.description}
      onChange={(e) => handleChange("description", e.target.value)}
    />
  </div>
</div>

      <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Bedrooms <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      type="number"
      placeholder="Bedrooms"
      value={form.bedrooms}
      onChange={(e) => handleChange("bedrooms", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Bathrooms <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      type="number"
      placeholder="Bathrooms"
      value={form.bathrooms}
      onChange={(e) => handleChange("bathrooms", e.target.value)}
    />
  </div>
</div>

      <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Latitude <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      type="number"
      placeholder="Latitude"
      value={form.latitude}
      onChange={(e) => handleChange("latitude", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Longitude <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      type="number"
      placeholder="Longitude"
      value={form.longitude}
      onChange={(e) => handleChange("longitude", e.target.value)}
    />
  </div>
</div>
      <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Square Feet <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      type="number"
      placeholder="Square Feet"
      value={form.squareFeet}
      onChange={(e) => handleChange("squareFeet", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Available From <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      type="date"
      value={form.availableFrom}
      onChange={(e) => handleChange("availableFrom", e.target.value)}
    />
  </div>
</div>
      <div style={styles.row}>
  <div style={styles.fileBox}>
    <label>
      Images <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="file"
      multiple
      onChange={(e) => handleFile("images", [...e.target.files])}
    />
  </div>

  <div style={styles.fileBox}>
    <label>Ownership Document</label>
    <input
      type="file"
      onChange={(e) => handleFile("ownershipDoc", e.target.files[0])}
    />
  </div>
</div>

      <div style={styles.row}>
  <div style={styles.fileBox}>
    <label>Tax Document</label>
    <input
      type="file"
      onChange={(e) => handleFile("taxDoc", e.target.files[0])}
    />
  </div>

  <div style={styles.fileBox}>
    <label>ID Proof</label>
    <input
      type="file"
      onChange={(e) => handleFile("idProof", e.target.files[0])}
    />
  </div>
</div>

      <button style={styles.btn}>
        {selectedProperty ? "Update" : "Save"}
      </button>
    </form>
  </div>
)}

{/* PROPERTIES */}
{path === "/my-properties" && (
  <>

    {isEditMode && selectedProperty && (
      <div style={styles.card}>
        <h2>Edit Property</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
          style={styles.form}
        >

          <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Title <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      value={form.title}
      onChange={(e) => handleChange("title", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Property Type <span style={{ color: "red" }}>*</span>
    </label>
    <select
      style={styles.input}
      value={form.propertyType}
      onChange={(e) => handleChange("propertyType", e.target.value)}
    >
      {propertyTypes.map((t) => (
        <option key={t}>{t}</option>
      ))}
    </select>
  </div>
</div>

          <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Address <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      value={form.address}
      onChange={(e) => handleChange("address", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      City <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={styles.input}
      value={form.city}
      onChange={(e) => handleChange("city", e.target.value)}
    />
  </div>
</div>
          <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Rent <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="number"
      style={styles.input}
      value={form.rent}
      onChange={(e) => handleChange("rent", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Description <span style={{ color: "red" }}>*</span>
    </label>
    <textarea
      style={styles.input}
      value={form.description}
      onChange={(e) => handleChange("description", e.target.value)}
    />
  </div>
</div>
          <div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Bedrooms <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="number"
      style={styles.input}
      value={form.bedrooms}
      onChange={(e) => handleChange("bedrooms", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Bathrooms <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="number"
      style={styles.input}
      value={form.bathrooms}
      onChange={(e) => handleChange("bathrooms", e.target.value)}
    />
  </div>
</div>
<div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Latitude <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="number"
      style={styles.input}
      value={form.latitude}
      onChange={(e) => handleChange("latitude", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Longitude <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="number"
      style={styles.input}
      value={form.longitude}
      onChange={(e) => handleChange("longitude", e.target.value)}
    />
  </div>
</div>
<div style={styles.row}>
  <div style={styles.fieldGroup}>
    <label>
      Square Feet <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="number"
      style={styles.input}
      value={form.squareFeet}
      onChange={(e) => handleChange("squareFeet", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Available From <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="date"
      style={styles.input}
      value={form.availableFrom}
      onChange={(e) => handleChange("availableFrom", e.target.value)}
    />
  </div>
</div>
          <div style={styles.row}>
  <div style={styles.fileBox}>
    <label>
      Images <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="file"
      multiple
      onChange={(e) =>
        handleFile("images", [...e.target.files])
      }
    />
  </div>

  <div style={styles.fileBox}>
    <label>Ownership Document</label>
    <input
      type="file"
      onChange={(e) =>
        handleFile("ownershipDocument", e.target.files[0])
      }
    />
  </div>
</div>

<div style={styles.row}>
  <div style={styles.fileBox}>
    <label>Tax Document</label>
    <input
      type="file"
      onChange={(e) =>
        handleFile("taxDocument", e.target.files[0])
      }
    />
  </div>

  <div style={styles.fileBox}>
    <label>ID Proof</label>
    <input
      type="file"
      onChange={(e) =>
        handleFile("idProof", e.target.files[0])
      }
    />
  </div>
</div>

          <button style={styles.btn}>Update Property</button>
        </form>
      </div>
    )}

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
    }}>
      {properties
        .filter(p => !p.isHidden)
        .map((p) => (
          <div key={p._id} style={styles.card}>
            <h3>{p.title}</h3>

            <p><b>City:</b> {p.city}</p>
            <p><b>Rent:</b> ₹{p.rent}</p>
            <p><b>Status:</b> {p.rentalStatus}</p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  setSelectedProperty(p);
                  setIsEditMode(true);
                  setForm({
  title: p.title || "",
  propertyType: p.propertyType || "Apartment",
  address: p.address || "",
  city: p.city || "",
  rent: p.rent || "",
  description: p.description || "",
  latitude: p.latitude || "",
  longitude: p.longitude || "",
  bedrooms: p.bedrooms || "",
  bathrooms: p.bathrooms || "",
  squareFeet: p.squareFeet || "",
  availableFrom: p.availableFrom
    ? p.availableFrom.split("T")[0]
    : "",
});
                }}
              >
                Edit
              </button>

              <button onClick={() => handleDelete(p._id)}>
                Delete
              </button>
            </div>
          </div>
      ))}
    </div>
  </>
)}
{path === "/hidden-properties" && (
  <div>
    <h2>Hidden Properties</h2>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      marginTop: "20px"
    }}>
      {properties.filter(p => p.isHidden).length > 0 ? (
        properties
          .filter(p => p.isHidden)
          .map((p) => (
            <div key={p._id} style={styles.card}>
              <h3>{p.title}</h3>

              <p><b>City:</b> {p.city}</p>
              <p><b>Rent:</b> ₹{p.rent}</p>
              <p><b>Status:</b> {p.rentalStatus}</p>

              <button onClick={() => handleUnhideProperty(p._id)}>
                Unhide Property
              </button>
            </div>
          ))
      ) : (
        <p style={{ textAlign: "center", width: "100%" }}>
          No hidden properties
        </p>
      )}
    </div>
  </div>
)}
{path === "/tenant-requests" && (
  <div>
    

    <h2>Tenant Requests</h2>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px"
    }}>
      {requests.map((r) => (
        <div key={r._id} style={styles.card}>
          <p><b>Tenant:</b> {r.tenant?.name}</p>
          <p><b>Property:</b> {r.property?.title}</p>
          <p><b>Status:</b> {r.status}</p>

          {r.status === "pending" && !r.ownerAccepted && (
  <>
    <button onClick={() => handleAccept(r._id)}>
      Accept
    </button>

    <button onClick={() => handleReject(r._id)}>
      Reject
    </button>
  </>
)}

          {r.ownerAccepted && (
  <div>
    <button
      style={styles.btn}
      onClick={() => handleFinalize(r._id, "success")}
    >
      Deal Successful
    </button>

    <button
      style={styles.deleteBtn}
      onClick={() => handleFinalize(r._id, "fail")}
    >
      Deal Cancelled
    </button>
  </div>
)}
        
        </div>
      ))}
    </div>
  </div>
)}
</main>
</div>
  );
}
const styles = {
  container: { minHeight: '100vh' },
  navBtn: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    color: 'white',
    border: 'none',
    textAlign: 'left'
  },
  main: { flex: 1, padding: '20px' },
  card: { background: '#f3f4f6', padding: '15px', marginBottom: '10px', borderRadius: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { display: 'flex', gap: '10px' },

  fieldGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },

  input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' },
  fileBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  btn: { background: '#4f46e5', color: 'white', padding: '10px', border: 'none' }
};

export default OwnerDashboard;