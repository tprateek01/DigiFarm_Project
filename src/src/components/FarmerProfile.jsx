import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/farmer.css';

const FarmerProfile = () => {
  const [farmer, setFarmer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));
    const savedProfile = JSON.parse(localStorage.getItem("farmerProfile"));

    if (!session || session.role !== "farmer") {
      alert("Unauthorized access. Please log in as a farmer.");
      navigate("/login"); // Redirect to login if no valid session
      return;
    }

    // Merge session data with any saved extended profile info
    const fullProfile = {
      id: session.id || "",
      name: session.name || "",
      email: session.email || "",
      role: session.role || "farmer",
      company: savedProfile?.company || "",
      phone: savedProfile?.phone || "",
      photo: savedProfile?.photo || "https://via.placeholder.com/100?text=Farmer"
    };

    setFarmer(fullProfile);
  }, [navigate]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = {
      id: farmer.id,
      name: e.target.inputName.value || farmer.name,
      email: farmer.email,
      role: farmer.role,
      company: e.target.inputCompany.value || "",
      phone: e.target.inputPhone.value || "",
      photo: e.target.inputPhoto.value || "https://via.placeholder.com/100?text=Farmer"
    };

    // Save editable fields separately
    localStorage.setItem("farmerProfile", JSON.stringify({
      company: updatedProfile.company,
      phone: updatedProfile.phone,
      photo: updatedProfile.photo
    }));

    setFarmer(updatedProfile);
    setIsEditing(false);
    alert("Profile updated!");
  };

  if (!farmer) return <p>Loading farmer profile...</p>;

  return (
    <div>
      <div className="top">
        <h1>Farmer Profile</h1>
        <div>
          <Link to="/farmer/dashboard" className="btn-back">Back to Dashboard</Link>
        </div>
      </div>

      <div className="profile">
        <img id="farmerPhoto" src={farmer.photo} alt="Farmer" />
        <div>
          <h2 id="fName">{farmer.name}</h2>
          <p id="fCompany">{farmer.company || "N/A"}</p>
          <p>ID: <span id="fId">{farmer.id}</span></p>
          <p>Email: <span id="fEmail">{farmer.email}</span></p>
          <p>Phone: <span id="fPhone">{farmer.phone || "N/A"}</span></p>
          <button onClick={toggleEdit}>Edit Profile</button>
        </div>
      </div>

      {isEditing && (
        <div className="section edit-section">
          <h3 className="heading">Edit Profile</h3>
          <form className="edit-form" onSubmit={saveProfile}>
            <label>Full name</label>
            <input id="inputName" defaultValue={farmer.name} />
            <label>Phone</label>
            <input id="inputPhone" defaultValue={farmer.phone} />
            <label>Photo URL</label>
            <input id="inputPhoto" defaultValue={farmer.photo} />
            <button type="submit" className="btn-back">Save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FarmerProfile;
