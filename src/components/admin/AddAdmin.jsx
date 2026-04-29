import React, { useState } from "react";
import { userApiService } from "../../api/userApi.js";

const AddAdmin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });

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
        <input 
          type="password" 
          placeholder="New Password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#2c3e50', color: 'white' }}>
          Create Admin Account
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;