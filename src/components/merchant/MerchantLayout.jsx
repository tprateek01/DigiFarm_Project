import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../../styles/merchant/MerchantDashboard.css";

export default function MerchantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className={`dashboard-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>DigiFarm</h2>
          <button
            className="btn-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "«" : "»"}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/merchant/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/merchant/profile" className="nav-link">Profile</Link>
          <Link to="/merchant/product" className="nav-link">Browse Crops</Link>
          <Link to="/merchant/orders" className="nav-link">My Orders</Link>
          <Link to="/merchant/chat" className="nav-link">Chat</Link>
          <Link to="/merchant/settings" className="nav-link">Settings</Link>
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

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
