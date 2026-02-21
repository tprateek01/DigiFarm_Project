import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { userApiService } from "../../api/userApi.js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalMerchants: 0,
    totalProducts: 0,
    openOrders: 0
  });

  useEffect(() => {
    // Fetch statistics from the updated userApi service
    userApiService.getAdminStats().then((data) => {
      if (data) setStats(data);
    });
  }, []);

  // Absolute path helper for nested admin routes
  const goTo = (path) => navigate(`/admin/${path}`);

  return (
    <div className="admin-wrapper" style={{ padding: '20px' }}>
      <div className="dashboard-header" style={{ marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>
        Admin Overview Dashboard
      </div>

      <div className="stats-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Statistics Cards */}
        <div className="stat-card" onClick={() => goTo("farmers")} style={cardStyle}>
          <div style={iconStyle}>👨‍🌾</div>
          <h3>Total Farmers</h3>
          <p style={numberStyle}>{stats.totalFarmers}</p>
        </div>

        <div className="stat-card" onClick={() => goTo("merchants")} style={cardStyle}>
          <div style={iconStyle}>🏪</div>
          <h3>Total Merchants</h3>
          <p style={numberStyle}>{stats.totalMerchants}</p>
        </div>

        <div className="stat-card" onClick={() => goTo("products")} style={cardStyle}>
          <div style={iconStyle}>📦</div>
          <h3>Total Products</h3>
          <p style={numberStyle}>{stats.totalProducts}</p>
        </div>

        <div className="stat-card" onClick={() => goTo("orders")} style={cardStyle}>
          <div style={iconStyle}>📑</div>
          <h3>Open Orders</h3>
          <p style={numberStyle}>{stats.openOrders}</p>
        </div>

        {/* Action Cards (Styled differently to stand out) */}
        <div 
          className="stat-card action-card" 
          onClick={() => goTo("add-admin")} 
          style={{ ...cardStyle, border: '2px dashed #2c3e50', background: '#f8f9fa' }}
        >
          <div style={iconStyle}>➕</div>
          <h3 style={{ color: '#2c3e50' }}>Add Admin</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Create New Credentials</p>
        </div>

      </div>
    </div>
  );
};

// --- Styles ---

const cardStyle = {
  cursor: 'pointer',
  padding: '25px',
  backgroundColor: '#fff',
  border: '1px solid #eee',
  borderRadius: '12px',
  minWidth: '220px',
  flex: '1',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  textAlign: 'center',
};

const iconStyle = {
  fontSize: '30px',
  marginBottom: '10px'
};

const numberStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '10px 0',
  color: '#2ecc71' // Green color for growth/stats
};

export default AdminDashboard;