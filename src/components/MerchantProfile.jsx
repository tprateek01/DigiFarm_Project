import React, { useState, useEffect } from "react";
import { userApiService } from "../api/userApi";

export default function MerchantProfile() {
  const [merchant, setMerchant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("session_data"));

        if (!session) return;

        let savedProfile = {};
        try {
          savedProfile =
            JSON.parse(localStorage.getItem("merchantProfile")) || {};
        } catch {
          savedProfile = {};
        }

        userApiService.getMerchantProfile(session.id, data => {
          const profile = {
            id: data?.id || session.id,
            name: data?.name || session.name,
            email: data?.email || session.email,
            role: data?.role || session.role,
            company: savedProfile.company || data?.company || "",
            phone: savedProfile.phone || data?.phone || "",
            photo:
              savedProfile.photo ||
              data?.photo ||
              "https://via.placeholder.com/100?text=Merchant"
          };

          setMerchant(profile);
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

  const saveProfile = e => {
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

  if (!merchant) return <p>Loading profile...</p>;

  return (
    <>
      <header className="main-header">
        <h1>Merchant Profile</h1>
      </header>

      <section className="content-section">

        {/* Profile View */}
        <div className="profile">
          <img src={merchant.photo} alt="Merchant" width="120" />

          <div>
            <h2>{merchant.name}</h2>
            <p>{merchant.company || "No company added"}</p>
            <p>ID: {merchant.id}</p>
            <p>Email: {merchant.email}</p>
            <p>Phone: {merchant.phone || "N/A"}</p>

            <button onClick={toggleEdit}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form className="edit-form" onSubmit={saveProfile}>
            <h3>Edit Profile</h3>

            <label>Full Name</label>
            <input
              value={editData.name || ""}
              onChange={e =>
                setEditData({ ...editData, name: e.target.value })
              }
            />

            <label>Company</label>
            <input
              value={editData.company || ""}
              onChange={e =>
                setEditData({ ...editData, company: e.target.value })
              }
            />

            <label>Phone</label>
            <input
              value={editData.phone || ""}
              onChange={e =>
                setEditData({ ...editData, phone: e.target.value })
              }
            />

            <label>Photo URL</label>
            <input
              value={editData.photo || ""}
              onChange={e =>
                setEditData({ ...editData, photo: e.target.value })
              }
            />

            {/* Live preview */}
            <img
              src={editData.photo || merchant.photo}
              alt="Preview"
              width="80"
              style={{ marginTop: "10px" }}
            />

            <button type="submit" className="btn-back">
              Save Changes
            </button>
          </form>
        )}

      </section>
    </>
  );
}
