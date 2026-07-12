import { NavLink } from 'react-router-dom';
import './OwnerSidebar.css';
import { FiHome, FiList, FiCheckCircle, FiShield, FiClipboard } from 'react-icons/fi';

function AdminSidebar() {
  const sidebarItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/verification-requests', label: 'Verification Queue', icon: FiClipboard },
    { path: '/admin/all-properties', label: 'All Properties', icon: FiList },
    { path: '/admin/verified-properties', label: 'Verified Properties', icon: FiCheckCircle },
    { path: '/admin/rejected-properties', label: 'Rejected Properties', icon: FiShield },
  ];

  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <aside className="owner-sidebar">
      <div className="sidebar-header">
        <h3>ADMIN PANEL</h3>
        <p>Verification center</p>
      </div>
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
