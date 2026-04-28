import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApiService } from "../../api/userApi.js"; // Import the API service
import "./admin.css"; 

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // Changed from email to username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", paddingRight: "40px" }}
                />
                <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                padding: "5px",
                margin: "0",
                cursor: "pointer",
                color: "#777",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                outline: "none",
                boxShadow: "none",
                minWidth: "auto",
                height: "auto",
                marginTop: "0"
              }}
            >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
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