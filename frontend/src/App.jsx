import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/TenantDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container py-5">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tenant-dashboard"
            element={<ProtectedRoute roles={["tenant"]}><TenantDashboard /></ProtectedRoute>}
          />
          <Route
            path="/owner-dashboard"
            element={<ProtectedRoute roles={["owner"]}><OwnerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin-dashboard"
            element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/properties"
            element={<ProtectedRoute roles={["tenant","owner","admin"]}><PropertyList /></ProtectedRoute>}
          />
          <Route
            path="/properties/:id"
            element={<ProtectedRoute roles={["tenant","owner","admin"]}><PropertyDetail /></ProtectedRoute>}
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute roles={["tenant","owner"]}>
                <Navigate to={user?.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Navigate to="/admin-dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Navigate to="/admin-dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
