import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Swal from "sweetalert2";

function OwnerProfile() {
  const [user, setUser] = useState(null);

  const [editingProfile, setEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/users/profile");

      setUser(res.data);

      setProfileForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.name) {
      setProfileError("Name is required.");
      return;
    }

    if (
      profileForm.phone &&
      !/^\d{10}$/.test(profileForm.phone)
    ) {
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

      await fetchProfile();

      setProfileError("");

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setEditingProfile(false);
    } catch (error) {
      setProfileError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  return (
    <div className="card card-glass p-4">

      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-column flex-md-row">
        <div>
          <h2 className="mb-2">Profile</h2>

          <p className="text-muted mb-0">
            Review your owner profile and update contact information.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setEditingProfile(!editingProfile);
            setProfileMessage("");
            setProfileError("");
          }}
        >
          {editingProfile
            ? "Cancel Edit"
            : "Edit Profile"}
        </button>
      </div>

      {profileMessage && (
        <div className="alert alert-success">
          {profileMessage}
        </div>
      )}

      {profileError && (
        <div className="alert alert-danger">
          {profileError}
        </div>
      )}

      {editingProfile ? (
        <form onSubmit={handleSaveProfile}>
          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">
                Name
              </label>

              <input
                className="form-control"
                value={profileForm.name}
                onChange={(e) =>
                  handleProfileChange(
                    "name",
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Phone Number
              </label>

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
              />
            </div>

            <div className="col-12 d-flex gap-2">

              <button
                className="btn btn-primary"
                type="submit"
              >
                Save Profile
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setEditingProfile(false)
                }
              >
                Cancel
              </button>

            </div>

          </div>
        </form>
      ) : (
        <div className="row g-3">

          <div className="col-md-3">
            <div className="card p-3 h-100">
              <strong>Name</strong>
              <p>{profileForm.name}</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 h-100">
              <strong>Email</strong>
              <p>{profileForm.email}</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 h-100">
              <strong>Role</strong>
              <p>Owner</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 h-100">
              <strong>Phone Number</strong>
              <p>{profileForm.phone}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default OwnerProfile;