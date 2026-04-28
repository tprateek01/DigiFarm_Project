import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/farmer/FarmerSettings.css"; // Create this for styles

import API_URL from "../../config/apiConfig";

export default function FarmerSettings() {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    productAlerts: true,
    promotions: false
  });

  const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Ranchi", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", "Gwalior", "Jabalpur",
    "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad"
  ];

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));
    if (!session || session.role !== "farmer") {
      alert("Unauthorized access. Please login.");
      navigate("/login");
      return;
    }

    // Populate with session data
    setFarmer({
      name: session.name || "",
      email: session.email || "",
      phone: session.mobile || session.phone || "",
      location: session.location || ""
    });
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFarmer({ ...farmer, [name]: value });

    if (name === "location") {
      if (value.trim().length > 0) {
        const filtered = indianCities.filter(city => 
          city.toLowerCase().startsWith(value.toLowerCase())
        );
        setCitySuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const selectCity = (city) => {
    setFarmer({ ...farmer, location: city });
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const saveProfile = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("session_data"));
      const res = await fetch(`${API_URL}/user/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: farmer.name,
          mobile: farmer.phone,
          location: farmer.location
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        // Update local session data
        const newSession = {
          ...session,
          name: updatedUser.full_name,
          mobile: updatedUser.mobile,
          location: updatedUser.location
        };
        localStorage.setItem("session_data", JSON.stringify(newSession));
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const changePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert("New password and confirm password must match");
      return;
    }
    console.log("Password change requested", passwords);
    alert("Password changed successfully!");
    // Call API to update password
  };

  const handleNotificationsChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  return (
    <div className="settings-wrapper">
      <h1>⚙️ Farmer Settings</h1>

      {/* Profile Section */}
      <section className="settings-section">
        <h3>Profile Information</h3>
        <div className="form-group-settings">
          <label>Full Name</label>
          <input type="text" name="name" value={farmer.name} onChange={handleProfileChange} placeholder="Full Name" />
        </div>
        <div className="form-group-settings">
          <label>Email</label>
          <input type="email" name="email" value={farmer.email} onChange={handleProfileChange} placeholder="Email" disabled />
        </div>
        <div className="form-group-settings">
          <label>Phone Number</label>
          <input type="text" name="phone" value={farmer.phone} onChange={handleProfileChange} placeholder="Phone Number" />
        </div>
        <div className="form-group-settings" style={{position: 'relative'}}>
          <label>Location</label>
          <input type="text" name="location" value={farmer.location} onChange={handleProfileChange} placeholder="Search City..." autoComplete="off" />
          {showSuggestions && citySuggestions.length > 0 && (
            <ul className="city-suggestions">
              {citySuggestions.map((city, idx) => (
                <li key={idx} onClick={() => selectCity(city)}>{city}</li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={saveProfile} className="btn-primary">Save Profile</button>
      </section>

      {/* Password Section */}
      <section className="settings-section">
        <h3>Change Password</h3>
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <input 
            type={showCurrentPassword ? "text" : "password"} 
            name="current" 
            value={passwords.current} 
            onChange={handlePasswordChange} 
            placeholder="Current Password" 
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <button
             type="button"
             onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
               height: "auto"
             }}
           >
            {showCurrentPassword ? (
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
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <input 
            type={showNewPassword ? "text" : "password"} 
            name="new" 
            value={passwords.new} 
            onChange={handlePasswordChange} 
            placeholder="New Password" 
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <button
             type="button"
             onClick={() => setShowNewPassword(!showNewPassword)}
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
               height: "auto"
             }}
           >
            {showNewPassword ? (
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
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            name="confirm" 
            value={passwords.confirm} 
            onChange={handlePasswordChange} 
            placeholder="Confirm Password" 
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <button
             type="button"
             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
               height: "auto"
             }}
           >
            {showConfirmPassword ? (
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
        <button onClick={changePassword} className="btn-primary">Update Password</button>
      </section>

      {/* Notifications Section */}
      <section className="settings-section">
        <h3>Notifications</h3>
        <label>
          <input type="checkbox" name="orderUpdates" checked={notifications.orderUpdates} onChange={handleNotificationsChange} />
          Order Updates
        </label>
        <label>
          <input type="checkbox" name="productAlerts" checked={notifications.productAlerts} onChange={handleNotificationsChange} />
          Product Alerts
        </label>
        <label>
          <input type="checkbox" name="promotions" checked={notifications.promotions} onChange={handleNotificationsChange} />
          Promotions / Announcements
        </label>
      </section>

      {/* Delete Account */}
      <section className="settings-section">
        <h3>Delete Account</h3>
        <button className="btn-danger" onClick={() => alert("Account deletion flow")}>
          Delete My Account
        </button>
      </section>
    </div>
  );
}
