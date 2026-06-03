import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar({ user }) {
  const { logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">LeaseFlow</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/properties">Properties</NavLink>
                </li>
                {user.role === 'tenant' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/tenant-dashboard">Tenant Dashboard</NavLink>
                  </li>
                )}
                {user.role === 'owner' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/owner-dashboard">Owner Dashboard</NavLink>
                  </li>
                )}
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin-dashboard">Admin Dashboard</NavLink>
                  </li>
                )}
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item nav-link text-white">Hello, {user.name || user.email}</li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">Register</NavLink>
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
