import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import TenantDashboard from './pages/TenantDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VerificationRequests from './pages/VerificationRequests';
import AllProperties from './pages/AllProperties';
import VerificationDetails from './pages/VerificationDetails';
import VerifiedProperties from './pages/VerifiedProperties';
import RejectedProperties from './pages/RejectedProperties';

import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import Profile from './pages/Profile';

import SavedProperties from "./pages/SavedProperties";
import { useAuth } from './hooks/useAuth';
import Properties from "./pages/Properties";
function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container py-5">
        <Routes>

          {/* Default Route */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === 'admin'
                      ? '/admin-dashboard'
                      : user.role === 'owner'
                      ? '/owner-dashboard'
                      : '/tenant-dashboard'
                  }
                  replace
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['tenant', 'owner', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Tenant Dashboard */}
          <Route
            path="/tenant-dashboard"
            element={
              <ProtectedRoute roles={['tenant']}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Owner Dashboard */}
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute roles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/verification-requests"
            element={
              <ProtectedRoute roles={['admin']}>
                <VerificationRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/all-properties"
            element={
              <ProtectedRoute roles={['admin']}>
                <AllProperties />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/verified-properties"
            element={
              <ProtectedRoute roles={['admin']}>
                <VerifiedProperties />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rejected-properties"
            element={
              <ProtectedRoute roles={['admin']}>
                <RejectedProperties />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/verification/:id"
            element={
              <ProtectedRoute roles={['admin']}>
                <VerificationDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={<Navigate to="/admin-dashboard" replace />}
          />

          {/* Property List */}
          <Route
            path="/properties"
            element={
              <ProtectedRoute roles={['tenant', 'owner', 'admin']}>
                <PropertyList />
              </ProtectedRoute>
            }
          />

          {/* Property Details */}
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute roles={['tenant', 'owner', 'admin']}>
                <PropertyDetail />
              </ProtectedRoute>
            }
          />

          {/* Requests */}
          <Route
            path="/requests"
            element={
              <ProtectedRoute roles={['tenant', 'owner']}>
                <Navigate
                  to={
                    user?.role === 'owner'
                      ? '/owner-dashboard'
                      : '/tenant-dashboard'
                  }
                  replace
                />
              </ProtectedRoute>
            }
          />

          {/* Users */}
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <Navigate to="/admin-dashboard" replace />
              </ProtectedRoute>
            }
          />

          {/*SavedProperties */}
          <Route
            path="/saved-properties"
            element={
              <ProtectedRoute
                roles={["tenant", "owner", "admin"]}
              >
                <SavedProperties />
              </ProtectedRoute>
            }
          />


          {/* Invalid Route */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />


          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/properties" element={<Properties />} />

        </Routes>
      </main>
    </div>
  );
}

export default App;