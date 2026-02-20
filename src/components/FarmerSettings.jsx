import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FarmerSettings.css"; // Create this for styles

export default function FarmerSettings() {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState({
    name: "",
    email: "",
    phone: "",
    farmName: "",
    location: ""
  });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    productAlerts: true,
    promotions: false
  });

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));
    if (!session || session.role !== "farmer") {
      alert("Unauthorized access. Please login.");
      navigate("/login");
      return;
    }

    // Populate with session data or fetch from API
    setFarmer({
      name: session.name,
      email: session.email,
      phone: session.phone || "",
      farmName: session.farmName || "",
      location: session.location || ""
    });
  }, [navigate]);

  const handleProfileChange = (e) => {
    setFarmer({ ...farmer, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleNotificationsChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const saveProfile = () => {
    console.log("Profile saved", farmer);
    alert("Profile updated successfully!");
    // Call API to save profile
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

  return (
    <div className="settings-wrapper">
      <h1>⚙️ Farmer Settings</h1>

      {/* Profile Section */}
      <section className="settings-section">
        <h3>Profile Information</h3>
        <input type="text" name="name" value={farmer.name} onChange={handleProfileChange} placeholder="Full Name" />
        <input type="email" name="email" value={farmer.email} onChange={handleProfileChange} placeholder="Email" />
        <input type="text" name="phone" value={farmer.phone} onChange={handleProfileChange} placeholder="Phone Number" />
        <input type="text" name="farmName" value={farmer.farmName} onChange={handleProfileChange} placeholder="Farm / Business Name" />
        <input type="text" name="location" value={farmer.location} onChange={handleProfileChange} placeholder="Location" />
        <button onClick={saveProfile} className="btn-primary">Save Profile</button>
      </section>

      {/* Password Section */}
      <section className="settings-section">
        <h3>Change Password</h3>
        <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} placeholder="Current Password" />
        <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} placeholder="New Password" />
        <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} placeholder="Confirm Password" />
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
