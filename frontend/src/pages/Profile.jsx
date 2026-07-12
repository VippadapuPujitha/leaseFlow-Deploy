import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("leaseflow_token");

      const response = await api.get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("PROFILE DATA:", response.data);
      setUser(response.data);
      setName(response.data.name || "");
      setPhone(response.data.phone || "");
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (phone && !/^\d{10}$/.test(phone)) {
      return setError("Phone number must be 10 digits");
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("leaseflow_token");

      const response = await api.put(
        "/api/users/profile",
        {
          name,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);

      setMessage("Profile updated successfully");
    } catch (error) {
  console.log("TenantDashboard Error:", error);
  console.log("Response:", error.response);
  console.log("Data:", error.response?.data);

  setProfileError(
    error.response?.data?.message ||
    error.message ||
    "Failed to update profile"
  );
} finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <h4>Loading profile...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="profile-card">
        <div className="card-body">
          <div className="profile-header">

    <div className="profile-avatar">
        {user?.name?.charAt(0).toUpperCase()}
    </div>

    <div>

        <h2>My Profile</h2>

        <p>
            Manage your account information.
        </p>

    </div>

</div>

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

         <form onSubmit={handleUpdate}>
  <div className="mb-3">
    <label className="form-label">Name</label>
    <input
      type="text"
      className="profile-input"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Phone Number</label>
    <input
      type="tel"
      className="profile-input"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Role</label>
    <input
      type="text"
      className="profile-input"
      value={
        user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : ""
      }
      disabled
    />
  </div>

  <button
    type="submit"
    className="save-btn"
    disabled={saving}
  >
    {saving ? "Updating..." : "Update Profile"}
  </button>
</form>
        </div>
      </div>
    </div>
  );
}

export default Profile;