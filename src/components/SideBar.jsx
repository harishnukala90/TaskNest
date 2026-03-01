import { useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar({ isOpen, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items list
  const menuItems = [
    { name: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { 
      name: "Find Jobs", 
      icon: "search", 
      path: "/findjob", 
      role: "worker" // Only for workers
    },
    { 
      name: "Post Job", 
      icon: "add_circle_outline", 
      path: "/postjob", 
      role: "provider" // Only for providers
    },
    { name: "Activity History", icon: "history", path: "/activity" },
    { name: "About", icon: "info", path: "/about" },
  ];

  // Filter items based on user role
  const filteredItems = menuItems.filter(item => {
    if (!item.role) return true; // Show items with no role restriction
    return item.role === user?.role; // Show if it matches user role
  });

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : "collapsed"}`}>
      {/* 1. Spacer: Replaces the old header to push items below the Navbar */}
      <div className="sidebar-spacer"></div>

      {/* 2. Filtered Navigation Items */}
      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <div 
            key={item.path} 
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`} 
            onClick={() => navigate(item.path)}
            title={!isOpen ? item.name : ""}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="nav-label">{item.name}</span>
          </div>
        ))}
      </nav>

      {/* 3. Footer: Settings pinned to bottom */}
      <div className="sidebar-footer">
        <div 
          className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
          onClick={() => navigate("/settings")}
          title={!isOpen ? "Settings" : ""}
        >
          <span className="material-icons">settings</span>
          <span className="nav-label">Settings</span>
        </div>
      </div>
    </aside>
  );
}