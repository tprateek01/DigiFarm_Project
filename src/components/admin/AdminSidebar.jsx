import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const getLinkClass = ({ isActive }) =>
    isActive ? "sidebar-link active-link" : "sidebar-link";

  return (
    <div className="admin-sidebar">
      <h2 className="admin-title">DigiFarm Admin</h2>

      <ul className="sidebar-menu">
        <li>
          <NavLink to="/admin/dashboard" className={getLinkClass}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/farmers" className={getLinkClass}>
            Farmers
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/merchants" className={getLinkClass}>
            Merchants
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/products" className={getLinkClass}>
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders" className={getLinkClass}>
            Orders
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/complaints" className={getLinkClass}>
            Complaints
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/reports" className={getLinkClass}>
            Reports
          </NavLink>
        </li>
      </ul>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
