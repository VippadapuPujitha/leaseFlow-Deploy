import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, logout } = useAuth();

  const dashboardLink = user
    ? user.role === "admin"
      ? "/admin-dashboard"
      : user.role === "owner"
      ? "/owner-dashboard"
      : "/tenant-dashboard"
    : "/login";

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active fw-bold text-primary" : "nav-link";

  const renderTenantLinks = () => (
    <>
      <li className="nav-item">
        <NavLink className={linkClass} to="/tenant-dashboard">
          Dashboard
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className={linkClass} to="/properties">
          Properties
        </NavLink>
      </li>
    </>
  );

  const renderOwnerLinks = () => (
    <>
      <li className="nav-item">
        <NavLink className={linkClass} to="/owner-dashboard">
          Dashboard
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className={linkClass} to="/add-property">
          Add Property
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className={linkClass} to="/my-properties">
          My Properties
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className={linkClass} to="/hidden-properties">
          Hidden Properties
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className={linkClass} to="/tenant-requests">
          Tenant Requests
        </NavLink>
      </li>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <li className="nav-item">
        <NavLink className={linkClass} to="/admin-dashboard">
          Dashboard
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className={linkClass} to="/admin/verification-requests">
          Verification Queue
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className={linkClass} to="/admin/all-properties">
          All Properties
        </NavLink>
      </li>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-light shadow-sm bg-white">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={dashboardLink}>
          LeaseFlow
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user &&
              (user.role === "tenant"
                ? renderTenantLinks()
                : user.role === "owner"
                ? renderOwnerLinks()
                : renderAdminLinks())}
          </ul>

          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                <li className="nav-item me-3">
                  <span className="nav-link text-dark fw-semibold">
                    Hello, {user.name}
                  </span>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;