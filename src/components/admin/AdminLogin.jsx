import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApiService } from "../../api/userApi.js"; // Import the API service
import "./admin.css"; 

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // Changed from email to username
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // We call the API service to check the data.json admin array
    try {
      await userApiService.adminLogin(
        { username, password }, 
        (adminUser) => {
          // This callback runs only if login is successful
          navigate("/admin/dashboard");
        }
      );
    } catch (error) {
      console.error("Login component error:", error);
      alert("An error occurred during login.");
    }
  };

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, margin: "15px", zIndex: 99999 }}>
        <Link to="/" className="link" style={{ background: "#fff", padding: "8px 12px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textDecoration: "none", fontSize: "1.1rem", fontWeight: "bold", color: "#2e7d32" }}>
          ← Home
        </Link>
      </div>
      <div className="login-page-wrapper">
        <div className="login-card-container">
        
        <h2 className="login-header">Admin Login</h2>

        <div className="login-form-box">
          <form onSubmit={handleLogin}>
            <div className="input-field-group">
              <label>Username:</label>
              <input
                type="text" // Changed to text for username
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-field-group">
              <label>Password:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-action-btn">Login</button>
          </form>
        </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;