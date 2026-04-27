import { Link } from "react-router-dom";
import logo from "../images/car 24 logo (1).png";

const menuItems = [
  { id: "overview", label: "Dashboard Overview", icon: "📊" },
  { id: "users", label: "Users Management", icon: "👥" },
  { id: "cars", label: "Cars Management", icon: "🚗" },
  { id: "bookings", label: "Bookings Management", icon: "📅" },
  { id: "owners", label: "Owners Management", icon: "👤" },
  { id: "staff", label: "Staff Management", icon: "👨‍💼" },
  { id: "payments", label: "Payments / Earnings", icon: "💰" },
  { id: "receipts", label: "Receipts", icon: "📄" },
  { id: "analytics", label: "Reports / Analytics", icon: "📈" },
  { id: "settings", label: "Settings", icon: "⚙️" }
];

export default function Sidebar({ activeMenu, setActiveMenu, collapsed, setCollapsed }) {
  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-logo">
          <img src={logo} alt="Car24" />
          {!collapsed && <span>Car24 Admin</span>}
        </Link>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "→" : "←"}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={() => {}}>
          <span className="sidebar-icon">🚪</span>
          {!collapsed && <span className="sidebar-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}