import { NavLink } from "react-router-dom";
import "./OwnerSidebar.css";
import {
  FiHome,
  FiPlus,
  FiList,
  FiBell,
  FiShield,
} from "react-icons/fi";

function OwnerSidebar() {

  const sidebarItems = [
    { path: "/owner-dashboard", label: "Dashboard", icon: FiHome },
    { path: "/add-property", label: "Add Property", icon: FiPlus },
    { path: "/my-properties", label: "My Properties", icon: FiList },
    { path: "/verification-status", label: "Verification Status", icon: FiShield },
    { path: "/tenant-requests", label: "Tenant Requests", icon: FiBell },
  ];

  const linkClass = ({ isActive }) =>
    isActive
      ? "sidebar-link active"
      : "sidebar-link";

  return (
  <aside className="owner-sidebar">

    <div className="sidebar-header">
      <h3>🏠 OWNER PANEL</h3>
      <p>Manage your properties</p>
    </div>

    <nav className="sidebar-nav">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
            >
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default OwnerSidebar;
