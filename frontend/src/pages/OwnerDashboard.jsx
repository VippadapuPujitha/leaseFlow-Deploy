import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from "react-router-dom";
import OwnerSidebar from '../components/OwnerSidebar';
import "./OwnerDashboard.css";

import {
  FiHome,
  FiCheckCircle,
  FiLock,
  FiEyeOff
} from "react-icons/fi";

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
const [filter, setFilter] = useState("all");
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
      setDealMessage(
  "Deal completed successfully. Property has been marked as hidden."
);
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
    <div style={styles.pageWrapper}>
      {/* Sidebar and Main Content in Flex Layout */}
      <div style={styles.layoutContainer}>
        <OwnerSidebar />


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
        {/* MAIN */}
        <main style={styles.mainContent}>

        {path === "/owner-dashboard" && (
          <>
            <div className="dashboard-page">

              <div className="dashboard-hero">
                <div>
                  <h1>Welcome Back, {user?.name || "Jyo"} </h1>
                  <p>
                    Manage your rental properties efficiently and track everything from
                    one place.
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => (window.location.href = "/add-property")}
                >
                  + Add Property
                </button>
              </div>

              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon blue">
    <FiHome />
</div>
                  <div>
                    <p>Total Properties</p>
                    <h2>{summary.total}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
    <FiCheckCircle />
</div>
                  <div>
                    <p>Available</p>
                    <h2>{summary.available}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
    <FiLock />
</div>
                  <div>
                    <p>Occupied</p>
                    <h2>{summary.occupied}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon red">
    <FiEyeOff />
</div>
                  <div>
                    <p>Hidden</p>
                    <h2>{summary.hidden}</h2>
                  </div>
                </div>

              </div>

              <div className="dashboard-bottom">

              </div>

            </div>
        
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3>Recent Properties</h3>

                <button
                  className="action-btn"
                  style={{
                    width: "auto",
                    padding: "8px 18px",
                  }}
                  onClick={() => (window.location.href = "/my-properties")}
                >
                  View All
                </button>
              </div>

              {properties && properties.length > 0 ? (
                properties.slice(0, 3).map((property) => (
                  <div
                    key={property._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px 0",
                      borderBottom: "1px solid #eef2ff",
                    }}
                  >
                    <div>
                      <strong>{property.title}</strong>

                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {property.city}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <strong>₹{property.rent}</strong>

                      <div
                        style={{
                          color:
                            property.rentalStatus === "Available"
                              ? "#16a34a"
                              : "#f59e0b",
                          fontSize: "13px",
                        }}
                      >
                        {property.rentalStatus}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No properties found.</p>
              )}
            </div>
          </>
        )}
        

        {/* ADD PROPERTY */}
{path === '/add-property' && (
  <div style={styles.card}>
    <>
  <h2 style={{fontSize:"34px",marginBottom:"8px"}}>
    {selectedProperty ? "Edit Property" : "Add Property"}
  </h2>

  <p style={{color:"#64748b",marginBottom:"30px"}}>
    Fill in the property details below to list your rental property.
  </p>
</>

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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
      value={form.title}
      onChange={(e) => handleChange("title", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Property Type <span style={{ color: "red" }}>*</span>
    </label>
    <select
      style={{
   ...styles.input,
   boxSizing:"border-box"
}}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
      value={form.address}
      onChange={(e) => handleChange("address", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      City <span style={{ color: "red" }}>*</span>
    </label>
    <input
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
      value={form.rent}
      onChange={(e) => handleChange("rent", e.target.value)}
    />
  </div>

  <div style={styles.fieldGroup}>
    <label>
      Description <span style={{ color: "red" }}>*</span>
    </label>
    <textarea
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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
      style={{
        ...styles.input,
        boxSizing: "border-box"
      }}
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

    <div className="filter-bar">

  <button
    className={filter === "all" ? "filter-btn active" : "filter-btn"}
    onClick={() => setFilter("all")}
  >
    All
  </button>

  <button
    className={filter === "available" ? "filter-btn active" : "filter-btn"}
    onClick={() => setFilter("available")}
  >
    Available
  </button>

  <button
    className={filter === "occupied" ? "filter-btn active" : "filter-btn"}
    onClick={() => setFilter("occupied")}
  >
    Occupied
  </button>

  <button
    className={filter === "hidden" ? "filter-btn active" : "filter-btn"}
    onClick={() => setFilter("hidden")}
  >
    Hidden
  </button>

</div>

    <div className="property-grid">
      {properties
  .filter((p) => {
    if (filter === "available")
      return p.rentalStatus === "available";

    if (filter === "occupied")
      return p.rentalStatus === "occupied" || p.rentalStatus === "rented";

    if (filter === "hidden")
      return p.isHidden;

    return true;
  })
        .map((p) => (
          <div key={p._id} className="property-card">
            <div className="property-header">
              <div>
                <h3>{p.title}</h3>
                <p className="property-city">📍 {p.city}</p>
              </div>

              <span className={`status ${p.rentalStatus}`}>
                {p.rentalStatus}
              </span>
            </div>

            <div className="property-info">
              <div>
                <small>Monthly Rent</small>
                <h2>₹{p.rent}</h2>
              </div>

              <div>
                <small>Bedrooms</small>
                <h4>{p.bedrooms}</h4>
              </div>

              <div>
                <small>Bathrooms</small>
                <h4>{p.bathrooms}</h4>
              </div>
            </div>

            <div className="property-actions">
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
                className="edit-btn"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(p._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
      ))}
    </div>
  </>
)}

{path === "/tenant-requests" && (
  <div>
    

    <h2>Tenant Requests</h2>

    <div className="request-grid">
      {requests.map((r) => (
        <div key={r._id} className="request-card">
          <div className="request-header">

<div>

<h3>{r.property?.title}</h3>

<p className="request-user">
👤 {r.tenant?.name}
</p>

</div>

<span className={`status ${r.status}`}>
{r.status}
</span>

</div>

          {r.status === "pending" && !r.ownerAccepted && (
  <div className="request-actions">
    <button
      className="accept-btn"
      onClick={() => handleAccept(r._id)}
    >
      Accept
    </button>

    <button
      className="reject-btn"
      onClick={() => handleReject(r._id)}
    >
      Reject
    </button>
  </div>
)}

{r.ownerAccepted && (
  <div className="request-actions">
    <button
      className="deal-btn"
      onClick={() => handleFinalize(r._id, "success")}
    >
      Deal Successful
    </button>

    <button
      className="cancel-btn"
      onClick={() => handleFinalize(r._id, "fail")}
    >
      Deal Cancelled
    </button>
  </div>
)}

        </div> {/* request-card */}
      ))}
    </div> {/* request-grid */}
  </div>
)}

      </main>
    </div>
  </div>
);
}
const styles = {
  pageWrapper: { 
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  layoutContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  mainContent: {
  flex: 1,
  overflowY: "auto",
  minHeight: "100vh",
  width: "100%",
  padding: "30px",
  background: "#f8fafc"
},
  navBtn: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    color: 'white',
    border: 'none',
    textAlign: 'left'
  },
  main: { flex: 1, padding: '20px' },
 card: {
  background: "#fff",
  borderRadius: "20px",
  padding: "35px",
  boxShadow: "0 12px 35px rgba(37,99,235,.10)",
  maxWidth: "1100px",
  margin: "30px auto",
  border: "1px solid #eef2ff"
},
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
row: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
  marginBottom: "22px",
},

  fieldGroup: {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
},

input: {
  padding: "14px 16px",
  border: "1px solid #dbe4ff",
  borderRadius: "12px",
  outline: "none",
  fontSize: "15px",
  transition: "0.3s",
  background: "#fafcff"
},
  fileBox: {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "18px",
  border: "2px dashed #bfdbfe",
  borderRadius: "14px",
  background: "#f8fbff"
},
  btn: {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#2563eb,#3b82f6)",
  color: "#fff",
  fontSize: "17px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "20px",
  boxShadow: "0 10px 25px rgba(37,99,235,.25)"
},
};

export default OwnerDashboard;