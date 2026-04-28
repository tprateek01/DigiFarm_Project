import React, { useState, useEffect } from "react";
import { userApiService } from "../../api/userApi";
import "../../styles/merchant/merchant.css"; // Use the shared merchant styles

export default function MerchantProfile() {
  const [merchant, setMerchant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [editPhoto, setEditPhoto] = useState(null);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const session = JSON.parse(localStorage.getItem("session_data"));

        if (!session) {
          console.error("No session data found");
          return;
        }

        const initialProfile = {
          id: session.id,
          name: session.full_name || session.name,
          email: session.email,
          role: session.role,
          company_type: session.company_type || "",
          companyName: session.companyName || "",
          phone: session.mobile || session.phone || "",
          photo: session.profileImage || "https://via.placeholder.com/100?text=Merchant",
          aadhar_no: session.aadhar_no || "",
          reg_no: session.reg_no || ""
        };

        setMerchant(initialProfile);

        userApiService.getMerchantProfile(session.id, (data) => {
          if (data) {
            setMerchant({
              ...initialProfile,
              ...data,
              name: data.full_name || data.name || initialProfile.name,
              company_type: data.company_type || initialProfile.company_type || "N/A",
              companyName: data.companyName || initialProfile.companyName || "N/A",
              phone: data.mobile || data.phone || initialProfile.phone || "N/A",
              photo: data.profileImage || initialProfile.photo,
              aadhar_no: data.aadhar_no || initialProfile.aadhar_no || "N/A",
              reg_no: data.reg_no || initialProfile.reg_no || "N/A"
            });
          }
        });
      } catch (err) {
        console.error("Profile load failed:", err);
      }
    };

    loadProfile();
  }, []);

  const toggleEdit = () => {
    setEditData({
      name: merchant.name,
      company_type: merchant.company_type,
      companyName: merchant.companyName,
      phone: merchant.phone,
      aadhar_no: merchant.aadhar_no,
      reg_no: merchant.reg_no
    });
    setEditPhoto(merchant.photo);
    setIsEditing(!isEditing);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userApiService.patchUser(merchant.id, {
        full_name: editData.name,
        company_type: editData.company_type,
        companyName: editData.companyName,
        mobile: editData.phone,
        profileImage: editPhoto,
        aadhar_no: editData.aadhar_no,
        reg_no: editData.reg_no
      });

      const session = JSON.parse(localStorage.getItem("session_data"));
      const newSession = {
        ...session,
        name: res.full_name,
        company_type: res.company_type,
        companyName: res.companyName,
        mobile: res.mobile,
        profileImage: res.profileImage,
        aadhar_no: res.aadhar_no,
        reg_no: res.reg_no
      };
      localStorage.setItem("session_data", JSON.stringify(newSession));

      setMerchant({
        ...merchant,
        name: res.full_name,
        company_type: res.company_type,
        companyName: res.companyName,
        phone: res.mobile,
        photo: res.profileImage,
        aadhar_no: res.aadhar_no,
        reg_no: res.reg_no
      });
      setIsEditing(false);
      alert("Profile updated!");
    } catch(err) {
      alert("Failed to update profile via API");
    }
  };

  if (!merchant) return <p style={{padding: "20px"}}>Checking DigiFarm Session...</p>;

  return (
    <div className="profile-wrapper">
      <header className="main-header">
        <h1>Merchant Profile</h1>
      </header>

      <section className="content-section">
        <div className="profile">
          <img src={merchant.photo} alt="Merchant" />
          <div className="profile-info">
            <h2>{merchant.name}</h2>
            <p className="company-text">🏢 {merchant.companyName || "No company added"}</p>
            <p className="company-type-text">Type: {merchant.company_type || "N/A"}</p>
            
            <div className="details-grid">
              <p><strong>Merchant ID:</strong> {merchant.id}</p>
              <p><strong>Email:</strong> {merchant.email}</p>
              <p><strong>Phone:</strong> {merchant.phone || "N/A"}</p>
              <p><strong>Aadhar:</strong> {merchant.aadhar_no || "N/A"}</p>
              <p><strong>Reg No:</strong> {merchant.reg_no || "N/A"}</p>
            </div>

            <button className="btn-back" onClick={toggleEdit}>
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="section edit-section">
            <h3 className="heading">Update Your Details</h3>
            <form className="edit-form" onSubmit={saveProfile}>
              <label>Full Name</label>
              <input
                value={editData.name || ""}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
              />

              <label>Company Name</label>
              <input
                value={editData.companyName || ""}
                onChange={e => setEditData({ ...editData, companyName: e.target.value })}
              />

              <label>Company Type</label>
              <select
                value={editData.company_type || ""}
                onChange={e => setEditData({ ...editData, company_type: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select Company Type</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="LLP">LLP</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Public">Public</option>
              </select>

              <label>Phone Number</label>
              <input
                value={editData.phone || ""}
                onChange={e => setEditData({ ...editData, phone: e.target.value })}
              />

              <label>Aadhar Number</label>
              <input
                value={editData.aadhar_no || ""}
                onChange={e => setEditData({ ...editData, aadhar_no: e.target.value })}
              />

              <label>Registration Number</label>
              <input
                value={editData.reg_no || ""}
                onChange={e => setEditData({ ...editData, reg_no: e.target.value })}
              />

              <label>Profile Image</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              {editPhoto && <img src={editPhoto} alt="Preview" style={{width: '50px', height: '50px', borderRadius: '50%', marginTop: '10px'}} />}

              <button type="submit" className="btn-back" style={{display: 'block', marginTop: '15px'}}>
                Save Profile Changes
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}