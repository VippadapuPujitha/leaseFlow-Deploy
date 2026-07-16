import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("tenant");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
const [otp, setOtp] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(
        user.role === "admin"
          ? "/admin-dashboard"
          : user.role === "owner"
          ? "/owner-dashboard"
          : "/tenant-dashboard",
        { replace: true }
      );
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!/^\d{10}$/.test(phone)) {
      return setError("Phone number must be exactly 10 digits");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      if (!showOtp) {

  await api.post("/api/auth/send-otp", {
    name,
    email,
    phone,
    password,
    role,
  });

  setMessage("OTP sent to your email.");

  setShowOtp(true);

} else {

  await api.post("/api/auth/verify-otp", {
    email,
    otp,
  });

  setMessage("Registration successful. Redirecting to login...");

  setTimeout(() => {
    navigate("/login");
  }, 1500);

}
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-6">
            <div className="card auth-card">
              <div className="card-body">
                <div className="mb-4">
                  <h3 className="mb-1">LeaseFlow</h3>
                  <p className="text-muted mb-0">
                    Create your account and start managing rentals.
                  </p>
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

                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="mb-3">
                    <label className="form-label">
                      Full Name
                    </label>
                    <input
  type="text"
  className="form-control"
  value={name}
  onChange={(e) => setName(e.target.value)}
  disabled={showOtp}
  required
/>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      disabled={showOtp}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      disabled={showOtp}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      disabled={showOtp}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Role
                    </label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value)
                      }
                      disabled={showOtp}
                    >
                      <option value="tenant">
                        Tenant
                      </option>
                      <option value="owner">
                        Owner
                      </option>
                    </select>
                  </div>

                  {showOtp && (
  <div className="mb-3">
    <label className="form-label">
      Enter OTP
    </label>

    <input
      type="text"
      className="form-control"
      value={otp}
      maxLength={6}
      onChange={(e) => setOtp(e.target.value)}
      placeholder="Enter the OTP sent to your email"
    />
  </div>
)}

{showOtp && (
  <div className="text-center mb-3">
    <button
      type="button"
      className="btn btn-link p-0"
      onClick={async () => {
        try {
          setError("");
setMessage("");

await api.post("/api/auth/resend-otp", {
  email,
});

setOtp("");
setMessage("New OTP sent.");
        } catch (err) {
          setError(
            err.response?.data?.message || "Failed to resend OTP."
          );
        }
      }}
    >
      Resend OTP
    </button>
  </div>
)}

                  <button
  type="submit"
  className="btn btn-gradient w-100"
  disabled={loading}
>
  {loading
    ? "Please Wait..."
    : showOtp
    ? "Verify OTP"
    : "Create Account"}
</button>
                </form>

                <p className="mt-4 text-center text-muted">
                  Already registered?{" "}
                  <Link to="/login">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;