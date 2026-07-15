import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, useNavigate } from "react-router-dom";
import OwnerSidebar from '../components/OwnerSidebar';
import "./OwnerDashboard.css";
import Swal from "sweetalert2";
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
  const navigate = useNavigate();
const path = location.pathname;
console.log("CURRENT PATH:", path);
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
const [dealMessage, setDealMessage] = useState('');
const [updateMessage, setUpdateMessage] = useState("");
const [requestMessage, setRequestMessage] = useState("");
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
  const fetchProperties = async () => {
  try {
    const res = await api.get(`/api/properties/owner/${user.id}`);

    setProperties(res.data.properties || []);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  if (user) {
    fetchProperties();
  }
}, [user]);
useEffect(() => {
  const expired = requests.find(req => req.status === "expired");

  if (expired) {
    Swal.fire({
      icon: "info",
      title: "Request Expired",
      text: "A tenant's rental request expired after 48 hours.",
      timer: 2500,
      showConfirmButton: false
    });
  }
}, [requests]);

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

  // ---------------- FORM HANDLERS ----------------
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFile = (key, value) => {

  console.log("FILE KEY:", key);
  console.log("SELECTED FILES:", value);

  if(key === "images") {

    setFiles((prev)=>({
      ...prev,
      images:value
    }));

  } else {

    setFiles((prev)=>({
      ...prev,
      [key]:value
    }));

  }

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
      Swal.fire({
  icon: "success",
  title: "Added!",
  text: "Property added successfully.",
  timer: 2000,
  showConfirmButton: false
});
    } catch (err) {
  console.log("ERROR:", err);
  console.log("RESPONSE:", err.response?.data);
}
  };

  // ---------------- UPDATE PROPERTY ----------------
const handleUpdate = async () => {
  try {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("propertyType", form.propertyType);
    formData.append("address", form.address);
    formData.append("city", form.city);

    formData.append("rent", Number(form.rent));   
    console.log("Rent before sending:", form.rent);// important
    formData.append("description", form.description);

    formData.append("bedrooms", Number(form.bedrooms));
    formData.append("bathrooms", Number(form.bathrooms));

    formData.append("latitude", Number(form.latitude));
    formData.append("longitude", Number(form.longitude));

    formData.append("squareFeet", Number(form.squareFeet));
    formData.append("availableFrom", form.availableFrom);


    if (files.images?.length) {
  files.images.forEach((img) => {
    formData.append("images", img);
  });
}

if (files.ownershipDoc) {
  formData.append(
    "electricityBill",
    files.ownershipDoc
  );
}

if (files.taxDoc) {
  formData.append(
    "taxReceipt",
    files.taxDoc
  );
}

if (files.idProof) {
  formData.append(
    "aadhaarPan",
    files.idProof
  );
}


    const res = await api.put(
  `/api/properties/${selectedProperty._id}`,
  formData,
  {
    headers:{
      "Content-Type":"multipart/form-data"
    }
  }
);


    Swal.fire({
    icon: "success",
    title: "Updated!",
    text: "Property updated successfully",
    timer: 2000,
    showConfirmButton: false
});

    setIsEditMode(false);

    fetchProperties();

  } catch(error){
    console.log(error);
  }
};

  // ---------------- REQUEST ACTIONS ----------------
 const handleAccept = async (id) => {
  try {
    await api.patch(`/api/requests/accept/${id}`);

    const res = await api.get("/api/requests/owner");
    setRequests(res.data.requests);

    Swal.fire({
  icon: "success",
  title: "Request Sent!",
  text: "Verification request submitted successfully.",
  timer: 2000,
  showConfirmButton: false
});
    setTimeout(() => {
      setDeleteMessage("");
    }, 3000);
  } catch (err) {
    console.log(err);
  }
};
const handleHideProperty = async (id) => {
  try {
    console.log("HIDE ID:", id);

    const response = await api.patch(
      `/api/properties/hide/${id}`
    );
    Swal.fire({
    icon: "success",
    title: "Hidden!",
    text: "Property hidden successfully",
    timer: 2000,
    showConfirmButton: false
});
    console.log("HIDE RESPONSE:", response.data);

    setProperties((prev) =>
  prev.map((p) =>
    p._id === id
      ? { ...p, isHidden: true }
      : p
  )
);
  } catch (error) {
    console.log("HIDE ERROR:", error.response?.data);
    console.log("STATUS:", error.response?.status);

    alert(
      error.response?.data?.message ||
      "Failed to hide property"
    );
  }
};
const handleUnhideProperty = async (id) => {
  try {
    console.log("UNHIDE CLICKED:", id);

    const res = await api.patch(
      `/api/properties/unhide/${id}`
    );
    Swal.fire({
    icon: "success",
    title: "Restored!",
    text: "Property unhidden successfully",
    timer: 2000,
    showConfirmButton: false
});
    console.log("UNHIDE RESPONSE:", res.data);

    setProperties((prev) =>
      prev.map((p) =>
        p._id === id
          ? { ...p, isHidden: false }
          : p
      )
    );
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

    Swal.fire({
  icon: "success",
  title: "Rejected!",
  text: "Property rejected successfully.",
  timer: 2000,
  showConfirmButton: false
});

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
      Swal.fire({
  icon: "success",
  title: "Deal Completed!",
  text: "Property has been marked as occupied and hidden successfully.",
  timer: 2000,
  showConfirmButton: false
});
    } else {
      Swal.fire({
  icon: "info",
  title: "Cancelled",
  text: "Deal has been cancelled.",
  timer: 2000,
  showConfirmButton: false
});
    }

   setRequests(prev =>
  prev.map(r =>
    r._id === id
      ? {
          ...r,
          status:
            decision === "success"
              ? "occupied"
              : "cancelled",
          finalStatus: decision,
          showDealButton: false,
          property: {
            ...r.property,
            rentalStatus:
              decision === "success"
                ? "occupied"
                : "available",
          },
        }
      : r
  )
);

    const propRes = await api.get(
  `/api/properties/owner/${user.id}`
);
await request.save();

console.log("Saved request status:", request.status);
console.log("Saved request:", request);

console.log(propRes.data.properties);

setProperties(propRes.data.properties || []);

    const reqRes = await api.get("/api/requests/owner");

setRequests(reqRes.data.requests || []);

  } catch (err) {
  console.log("ERROR STATUS:", err.response?.status);
  console.log("ERROR DATA:", err.response?.data);
  console.log("ERROR URL:", err.config?.url);
}
};
const handleDelete = async (id) => {
  try {
    const result = await Swal.fire({
      title: "Delete Property?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    await api.delete(`/api/properties/${id}`);

    setProperties((prev) => prev.filter((p) => p._id !== id));

    setDeleteMessage("Property deleted successfully!");

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Property deleted successfully.",
      timer: 2000,
      showConfirmButton: false,
    });

    setTimeout(() => {
      setDeleteMessage("");
    }, 3000);

  } catch (err) {
    console.log(err);

    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text:
        err.response?.data?.message ||
        "Unable to delete property.",
    });
  }
};
  // ---------------- STATS ----------------
  const summary = useMemo(() => ({
  total: properties.length,

  available: properties.filter(
    p => p.rentalStatus === "available"
  ).length,

  occupied: properties.filter(
    p =>
      p.rentalStatus === "occupied"
  ).length,

  hidden: properties.filter(
    p => p.isHidden
  ).length,
}), [properties]);

const hiddenProperties = properties.filter(
  p => p.isHidden
);

const filteredRequests = requests.filter((r) => {
  switch (requestFilter) {
    case "pending":
      return r.status === "pending";

    case "accepted":
      return r.status === "accepted";

    case "rejected":
      return r.status === "rejected";

    case "cancelled":
      return r.status === "cancelled";

    default:
      return true; // All
  }
});

  return (
    <div style={styles.pageWrapper}>
      {/* Sidebar and Main Content in Flex Layout */}
      <div style={styles.layoutContainer}>
        <OwnerSidebar />

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
      onChange={(e) => {
        console.log("Typing:", e.target.value);
  handleChange("rent", e.target.value);
}}
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

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginTop: "8px",
    }}
  >
    <label className="choose-file-btn">
      Choose Files
      <input
        type="file"
        multiple
        hidden
        onChange={(e) => handleFile("images", [...e.target.files])}
      />
    </label>

    <span style={{ color: "black", fontSize: "14px" }}>
      {files.images.length === 0
        ? "No files chosen"
        : files.images.map((file) => file.name).join(", ")}
    </span>
  </div>
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
    {updateMessage && (
      <div style={{
        background: "#d1fae5",
        color: "#065f46",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "15px",
      }}>
        {updateMessage}
      </div>
    )}

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
        handleFile("ownershipDoc", e.target.files[0])
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
        handleFile("taxDoc", e.target.files[0])
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
  {(() => {
    const filteredProperties = properties.filter((p) => {
      if (filter === "available")
  return p.rentalStatus === "available" && !p.isHidden;

      if (filter === "occupied")
        return (
          p.rentalStatus === "occupied"
        );

      if (filter === "hidden")
        return p.isHidden;

      return true;
    });

    if (filteredProperties.length === 0) {
      let message = "No properties found.";

      if (filter === "available")
        message = "There are no available properties.";

      else if (filter === "occupied")
        message = "There are no occupied properties.";

      else if (filter === "hidden")
        message = "There are no hidden properties.";

      else if (filter === "all")
        message = "There are no properties.";

      return (
        <div
          style={{
            width: "100%",
            textAlign: "center",
            padding: "50px",
            fontSize: "22px",
            fontWeight: "600",
            color: "#666",
          }}
        >
          {message}
        </div>
      );
    }


return filteredProperties.map((p) => {
  const image = p.images?.[0] || p.image || "";

  return (
    <div key={p._id} className="property-card">

      {image && (
        <div className="property-card__media">
          <img
            src={image}
            alt={p.title}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
            }}
          />
        </div>
      )}

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
          onClick={() => navigate(`/owner-property/${p._id}`)}
          className="view-btn"
        >
          View
        </button>

        <button
          onClick={() => {
            setSelectedProperty(p);
            setIsEditMode(true);

            setFiles({
              images: [],
              ownershipDoc: null,
              taxDoc: null,
              idProof: null,
            });

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

        {p.isHidden ? (
          <button
            onClick={() => handleUnhideProperty(p._id)}
            className="unhide-btn"
          >
            Unhide
          </button>
        ) : (
          <button
            onClick={() => handleHideProperty(p._id)}
            className="hide-btn"
          >
            Hide
          </button>
        )}

        <button
          onClick={() => handleDelete(p._id)}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

})()}
</div>
</>
)}

{path === "/tenant-requests" && (
  <div>
    {dealMessage && (
      <div style={{
        background: "#dcfce7",
        color: "#166534",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "15px"
      }}>
        {dealMessage}
      </div>
    )}
    {requestMessage && (
  <div
    style={{
      background: "#dcfce7",
      color: "#166534",
      padding: "10px",
      borderRadius: "6px",
      marginBottom: "15px"
    }}
  >
    {requestMessage}
  </div>
)}

    <h2>Tenant Requests</h2>
  <div className="filter-bar">
  <button
    className={`filter-btn ${requestFilter === "all" ? "active" : ""}`}
    onClick={() => setRequestFilter("all")}
  >
    All
  </button>

  <button
    className={`filter-btn ${requestFilter === "pending" ? "active" : ""}`}
    onClick={() => setRequestFilter("pending")}
  >
    Pending
  </button>

  <button
    className={`filter-btn ${requestFilter === "accepted" ? "active" : ""}`}
    onClick={() => setRequestFilter("accepted")}
  >
    Accepted
  </button>

  <button
    className={`filter-btn ${requestFilter === "rejected" ? "active" : ""}`}
    onClick={() => setRequestFilter("rejected")}
  >
    Rejected
  </button>

  <button
    className={`filter-btn ${requestFilter === "cancelled" ? "active" : ""}`}
    onClick={() => setRequestFilter("cancelled")}
  >
    Cancelled
  </button>
  <button
  className={`filter-btn ${requestFilter === "expired" ? "active" : ""}`}
  onClick={() => setRequestFilter("expired")}
>
  Expired
</button>
</div>
    <div className="request-grid">
      {filteredRequests.length > 0 ? (
  filteredRequests.map((r) => (
        <div key={r._id} className="request-card">
          <div className="request-header">

<div>

<h3>{r.property?.title}</h3>

<div className="request-user">
  <p>
    👤 {r.tenant?.name}
    {(r.ownerAccepted || r.status === "accepted") && (
  <span style={{ marginLeft: "15px" }}>
    📞 {r.tenant?.phone}
  </span>
)}
  </p>
</div>

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

          {r.status === "pending" && r.ownerAccepted && (
  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
    <button
      className="deal-btn"
      onClick={() => handleFinalize(r._id, "success")}
    >
      Deal Completed
    </button>

    <button
      className="cancel-btn"
      onClick={() => handleFinalize(r._id, "fail")}
    >
      Deal Cancelled
    </button>
  </div>
)}      {/* closes accepted condition*/}

</div>   // closes request-card

))
) : (
  <div
    style={{
      width: "100%",
      textAlign: "center",
      padding: "50px",
      fontSize: "20px",
      fontWeight: "600",
      color: "#64748b",
    }}
  >
    {requestFilter === "all" &&
      "No requests found."}

    {requestFilter === "pending" &&
      "No pending requests."}

    {requestFilter === "accepted" &&
      "No accepted requests."}

    {requestFilter === "rejected" &&
      "No rejected requests."}

    {requestFilter === "cancelled" &&
      "No cancelled requests."}
      {requestFilter === "expired" &&
      "No expired requests."}
  </div>
)}      {/* closes requests.map*/}

</div>  { /* closes request-grid*/}

</div>   // closes tenant wrapper

)}       {/* closes path condition*/}

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