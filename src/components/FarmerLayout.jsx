import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/FarmerDashboard.css";

export default function FarmerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className={`dashboard-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AgriTrade</h2>
          <button
            className="btn-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "«" : "»"}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/farmer/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/farmer/profile" className="nav-link">
            Profile
          </Link>
          <Link to="/farmer/products" className="nav-link">
            My Products
          </Link>
          <Link to="/farmer/orders" className="nav-link">
            Orders
          </Link>
          <Link to="/farmer/chat" className="nav-link">Chat</Link>
          <Link to="/farmer/settings" className="nav-link">
            Settings
          </Link>

        </nav>

        <button
          className="btn-logout"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
