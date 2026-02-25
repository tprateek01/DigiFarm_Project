import React, { useState, useEffect } from "react";
import { userApiService } from "../../api/userApi";

export default function MerchantProfile() {
  const [merchant, setMerchant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const loadProfile = () => {
      try {
        const session = JSON.parse(localStorage.getItem("session_data"));

        if (!session) {
          console.error("No session data found");
          return;
        }

        // 1. Initialize with session data immediately so the screen isn't blank
        let savedProfile = {};
        try {
          savedProfile = JSON.parse(localStorage.getItem("merchantProfile")) || {};
        } catch {
          savedProfile = {};
        }

        const initialProfile = {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
          company: savedProfile.company || session.companyName || "", // Matches your register field
          phone: savedProfile.phone || session.mobile || "", // Matches your register field
          photo: savedProfile.photo || "https://via.placeholder.com/100?text=Merchant"
        };

        setMerchant(initialProfile);

        // 2. Fetch updated data from API
        userApiService.getMerchantProfile(session.id, (data) => {
          if (data) {
            setMerchant(prev => ({
              ...prev,
              ...data,
              // Prioritize localStorage for locally updated fields like photo
              company: savedProfile.company || data.company || prev.company,
              phone: savedProfile.phone || data.phone || prev.phone,
              photo: savedProfile.photo || data.photo || prev.photo
            }));
          }
        });
      } catch (err) {
        console.error("Profile load failed:", err);
      }
    };

    loadProfile();
  }, []);

  const toggleEdit = () => {
    setEditData(merchant);
    setIsEditing(!isEditing);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = { ...merchant, ...editData };

    localStorage.setItem(
      "merchantProfile",
      JSON.stringify({
        company: updatedProfile.company,
        phone: updatedProfile.phone,
        photo: updatedProfile.photo
      })
    );

    setMerchant(updatedProfile);
    setIsEditing(false);
    alert("Profile updated!");
  };

  if (!merchant) return <p style={{padding: "20px"}}>Checking DigiFarm Session...</p>;

  return (
    <div className="profile-wrapper">
      <header className="main-header">
        <h1>Merchant Profile</h1>
      </header>

      <section className="content-section">
        <div className="profile-card">
          <div className="profile-image-container">
             <img src={merchant.photo} alt="Merchant" className="profile-avatar" />
          </div>

          <div className="profile-info">
            <h2>{merchant.name}</h2>
            <p className="company-text">🏢 {merchant.company || "No company added"}</p>
            
            <div className="details-grid">
              <p><strong>Merchant ID:</strong> {merchant.id}</p>
              <p><strong>Email:</strong> {merchant.email}</p>
              <p><strong>Phone:</strong> {merchant.phone || "N/A"}</p>
            </div>

            <button className="edit-toggle-btn" onClick={toggleEdit}>
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>
        </div>

        {isEditing && (
          <form className="edit-form-card" onSubmit={saveProfile}>
            <h3>Update Your Details</h3>

            <div className="input-group">
              <label>Full Name</label>
              <input
                value={editData.name || ""}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Company Name</label>
              <input
                value={editData.company || ""}
                onChange={e => setEditData({ ...editData, company: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                value={editData.phone || ""}
                onChange={e => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Avatar URL</label>
              <input
                value={editData.photo || ""}
                onChange={e => setEditData({ ...editData, photo: e.target.value })}
              />
            </div>

            <button type="submit" className="save-btn">
              Save Profile Changes
            </button>
          </form>
        )}
      </section>
    </div>
  );
}