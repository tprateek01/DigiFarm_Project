import React, { useState } from "react";
import { userApiService } from "../../api/userApi.js";

const AddAdmin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return alert("Fill all fields");
    
    await userApiService.registerNewAdmin(formData);
    setFormData({ username: "", password: "" }); // Reset form
  };

  return (
    <div className="admin-form-container" style={{ maxWidth: '400px', margin: '20px' }}>
      <h2>Add New Admin</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="New Username" 
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          style={{ padding: '10px' }}
        />
        <div style={{ position: "relative" }}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="New Password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{ padding: '10px', width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
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
        <button type="submit" style={{ padding: '10px', background: '#2c3e50', color: 'white' }}>
          Create Admin Account
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;