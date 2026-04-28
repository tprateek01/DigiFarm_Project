import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApiService } from "../../api/userApi";
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      companyType: session.company_type || session.companyType || "",
      reg_no: session.reg_no || session.registrationNo || ""
    });
  }, [navigate]);

  const setError = (ref, message, inputRef) => {
    if (ref.current) {
      ref.current.textContent = message;
      ref.current.style.color = "red";
    }
    if (inputRef.current) {
      inputRef.current.style.border = "2px solid red";
    }
  };

  const clearError = (ref, inputRef) => {
    if (ref.current) ref.current.textContent = "";
    if (inputRef.current) inputRef.current.style.border = "";
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
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
      try {
        const session = JSON.parse(localStorage.getItem("session_data"));
        const updatedData = {
          full_name: userData.fname + " " + userData.lname,
          companyName: userData.cname,
          company_type: userData.companyType,
          mobile: userData.mobile,
          reg_no: userData.reg_no
        };

        const res = await userApiService.patchUser(session.id, updatedData);
        
        const newSession = {
          ...session,
          name: res.full_name,
          companyName: res.companyName,
          company_type: res.company_type,
          mobile: res.mobile,
          reg_no: res.reg_no
        };
        localStorage.setItem("session_data", JSON.stringify(newSession));
        alert("Business profile updated successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to update profile.");
      }
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
              <label>Company Type</label>
              <select name="companyType" value={userData.companyType} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Select Company Type</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="LLP">LLP</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Public">Public</option>
              </select>
            </div>
            <div className="mset-input-control">
              <label>Contact Mobile</label>
              <input name="mobile" type="number" value={userData.mobile} onChange={handleChange} ref={inputMobileRef} />
              <span className="mset-error-text" ref={errorMobileRef}></span>
            </div>
            <div className="mset-input-control">
              <label>Registration No.</label>
              <input name="reg_no" value={userData.reg_no} onChange={handleChange} />
            </div>
          </div>
          <button className="mset-update-button" onClick={saveProfile}>Save Business Info</button>
        </section>

        {/* Security / Password */}
        <section className="mset-section-card">
          <h3 className="mset-section-title">Security Credentials</h3>
          <div className="mset-input-control" style={{ position: "relative" }}>
            <input 
              type={showCurrentPassword ? "text" : "password"} 
              name="current" 
              placeholder="Enter Current Password" 
              onChange={handlePasswordChange} 
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
                 height: "auto",
                 marginTop: "0"
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
          <div className="mset-input-control" style={{ position: "relative" }}>
            <input 
              type={showNewPassword ? "text" : "password"} 
              name="new" 
              placeholder="Create New Password" 
              onChange={handlePasswordChange} 
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
                 height: "auto",
                 marginTop: "0"
               }}
             >
              {showNewPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-11a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
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