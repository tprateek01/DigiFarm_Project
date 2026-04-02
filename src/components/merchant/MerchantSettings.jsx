import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/merchant/merchantsettings.css";

const MerchantSettings = () => {
  const [userData, setUserData] = useState({
    fname: '',
    lname: '',
    cname: '',
    email: '',
    mobile: '',
    companyType: '',
    reg_no: ''
  });

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  // Input Refs for validation styling
  const inputFirstNameRef = useRef(null);
  const inputLastNameRef = useRef(null);
  const inputCompanyNameRef = useRef(null);
  const inputMobileRef = useRef(null);

  // Error Message Refs
  const errorFnameRef = useRef(null);
  const errorLnameRef = useRef(null);
  const errorCnameRef = useRef(null);
  const errorMobileRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));
    if (!session || session.role !== "merchant") {
      alert("Unauthorized access. Please login.");
      navigate("/login");
      return;
    }

    const nameParts = (session.name || "").split(" ");
    
    setUserData({
      fname: nameParts[0] || "",
      lname: nameParts.slice(1).join(" ") || "",
      cname: session.companyName || "",
      email: session.email || "",
      mobile: session.mobile || "",
      companyType: session.companyType || "",
      reg_no: session.registrationNo || ""
    });
  }, [navigate]);

  const setError = (ref, message, inputRef) => {
    ref.current.textContent = message;
    ref.current.style.color = "red";
    inputRef.current.style.border = "2px solid red";
  };

  const clearError = (ref, inputRef) => {
    ref.current.textContent = "";
    inputRef.current.style.border = "";
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveProfile = (e) => {
    e.preventDefault();
    let isValid = true;

    if (userData.fname.trim() === "") {
      setError(errorFnameRef, "First name required", inputFirstNameRef);
      isValid = false;
    } else clearError(errorFnameRef, inputFirstNameRef);

    if (userData.cname.trim() === "") {
      setError(errorCnameRef, "Company name required", inputCompanyNameRef);
      isValid = false;
    } else clearError(errorCnameRef, inputCompanyNameRef);

    if (isValid) {
      alert("Business profile updated successfully!");
    }
  };

  return (
    <div className="mset-container">
      <header className="mset-header-banner">
        <h2>Merchant Account Controls</h2>
      </header>

      <div className="mset-content-box">
        {/* Profile Details */}
        <section className="mset-section-card">
          <h3 className="mset-section-title">Business Identity</h3>
          <div className="mset-grid-layout">
            <div className="mset-input-control">
              <label>First Name</label>
              <input name="fname" value={userData.fname} onChange={handleChange} ref={inputFirstNameRef} />
              <span className="mset-error-text" ref={errorFnameRef}></span>
            </div>
            <div className="mset-input-control">
              <label>Last Name</label>
              <input name="lname" value={userData.lname} onChange={handleChange} ref={inputLastNameRef} />
              <span className="mset-error-text" ref={errorLnameRef}></span>
            </div>
            <div className="mset-input-control">
              <label>Company/Business Name</label>
              <input name="cname" value={userData.cname} onChange={handleChange} ref={inputCompanyNameRef} />
              <span className="mset-error-text" ref={errorCnameRef}></span>
            </div>
            <div className="mset-input-control">
              <label>Contact Mobile</label>
              <input name="mobile" type="number" value={userData.mobile} onChange={handleChange} ref={inputMobileRef} />
              <span className="mset-error-text" ref={errorMobileRef}></span>
            </div>
          </div>
          <button className="mset-update-button" onClick={saveProfile}>Save Business Info</button>
        </section>

        {/* Security / Password */}
        <section className="mset-section-card">
          <h3 className="mset-section-title">Security Credentials</h3>
          <div className="mset-input-control">
            <input type="password" name="current" placeholder="Enter Current Password" onChange={handlePasswordChange} />
          </div>
          <div className="mset-input-control">
            <input type="password" name="new" placeholder="Create New Password" onChange={handlePasswordChange} />
          </div>
          <button className="mset-update-button" onClick={() => alert("Password sequence initiated")}>
            Update Credentials
          </button>
        </section>

        {/* Danger Zone */}
        <section className="mset-section-card mset-danger-area">
          <h3 className="mset-danger-title">Sensitive Operations</h3>
          <p>Permanently remove your merchant business from DigiFarm.</p>
          <button className="mset-delete-action" onClick={() => {
            if (window.confirm("This action is irreversible. Delete account?")) {
              console.log("Merchant Account Deleting...");
            }
          }}>
            Terminate Account
          </button>
        </section>
      </div>
    </div>
  );
};

export default MerchantSettings;