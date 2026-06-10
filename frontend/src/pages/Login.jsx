import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

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

    try {
      setLoading(true);

      const response = await api.post("/api/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user: userData } = response.data;

      login(userData, token);

      navigate(
        userData.role === "admin"
          ? "/admin-dashboard"
          : userData.role === "owner"
          ? "/owner-dashboard"
          : "/tenant-dashboard"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
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
                    Sign in to manage leases, properties, and rental requests.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
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
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password
                    </label>

                    <div className="input-group">
                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        className="form-control"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        required
                      />

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-gradient w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "Signing In..."
                      : "Sign In"}
                  </button>
                </form>

                <p className="mt-4 text-center text-muted">
                  New to LeaseFlow?{" "}
                  <Link to="/register">
                    Create an account
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

export default Login;