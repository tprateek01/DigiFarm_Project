import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApiService } from '../api/userApi';
import '../styles/farmer.css'; // reuse same CSS for layout

const MerchantProfile = () => {
  const [merchant, setMerchant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));
    const savedProfile = JSON.parse(localStorage.getItem("merchantProfile"));

    if (!session || session.role !== "merchant") {
      alert("Unauthorized access. Please log in as a merchant.");
      navigate("/login"); // redirect if not merchant
      return;
    }

    // Fetch merchant profile from API
    userApiService.getMerchantProfile(session.id, (data) => {
      if (data) {
        const fullProfile = {
          id: data.id || session.id,
          name: data.name || session.name,
          email: data.email || session.email,
          role: data.role || session.role,
          company: savedProfile?.company || data.company || "",
          phone: savedProfile?.phone || data.phone || "",
          photo: savedProfile?.photo || data.photo || "https://via.placeholder.com/100?text=Merchant"
        };
        setMerchant(fullProfile);
      } else {
        // fallback to session + saved data
        setMerchant({
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
          company: savedProfile?.company || "",
          phone: savedProfile?.phone || "",
          photo: savedProfile?.photo || "https://via.placeholder.com/100?text=Merchant"
        });
      }
    });
  }, [navigate]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveProfile = (e) => {
    e.preventDefault();

    const updatedProfile = {
      id: merchant.id,
      name: e.target.inputName.value || merchant.name,
      email: merchant.email,
      role: merchant.role,
      company: e.target.inputCompany.value || merchant.company,
      phone: e.target.inputPhone.value || merchant.phone,
      photo: e.target.inputPhoto.value || merchant.photo
    };

    // Save locally
    localStorage.setItem("merchantProfile", JSON.stringify({
      company: updatedProfile.company,
      phone: updatedProfile.phone,
      photo: updatedProfile.photo
    }));

    setMerchant(updatedProfile);
    setIsEditing(false);
    alert("Profile updated!");
  };

  if (!merchant) return <p>Loading merchant profile...</p>;

  return (
    <div>
      <div className="top">
        <h1>Merchant Profile</h1>
        <div>
          <Link to="/merchant/dashboard" className="btn-back">Back to Dashboard</Link>
        </div>
      </div>

      <div className="profile">
        <img id="merchantPhoto" src={merchant.photo} alt="Merchant" />
        <div>
          <h2 id="mName">{merchant.name}</h2>
          <p id="mCompany">{merchant.company || "N/A"}</p>
          <p>ID: <span id="mId">{merchant.id}</span></p>
          <p>Email: <span id="mEmail">{merchant.email}</span></p>
          <p>Phone: <span id="mPhone">{merchant.phone || "N/A"}</span></p>
          <button onClick={toggleEdit}>Edit Profile</button>
        </div>
      </div>

      {isEditing && (
        <div className="section edit-section">
          <h3 className="heading">Edit Profile</h3>
          <form className="edit-form" onSubmit={saveProfile}>
            <label>Full Name</label>
            <input id="inputName" defaultValue={merchant.name} />
            <label>Company</label>
            <input id="inputCompany" defaultValue={merchant.company} />
            <label>Phone</label>
            <input id="inputPhone" defaultValue={merchant.phone} />
            <label>Photo URL</label>
            <input id="inputPhoto" defaultValue={merchant.photo} />
            <button type="submit" className="btn-back">Save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MerchantProfile;
