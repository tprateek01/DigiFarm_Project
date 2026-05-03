// src/components/Auth/Register.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApiService } from "../../api/userApi";

const FarmerRegister = () => {
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [userData, setUserData] = useState({
    fname: "",
    lname: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    checkbox: false,
    profileImage: "",
    aadhar_no: "",
    id_proof: "",
    land_area: "",
    location: "",
  });

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({ ...prev, [name || "profileImage"]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const inputFirstNameRef = useRef(null);
  const inputLastNameRef = useRef(null);
  const inputEmailRef = useRef(null);
  const inputMobileRef = useRef(null);
  const inputPasswordRef = useRef(null);
  const inputConfirmPasswordRef = useRef(null);
  const inputAadharRef = useRef(null);
  const inputLandAreaRef = useRef(null);
  const inputLocationRef = useRef(null);
  const checkBoxTermsRef = useRef(null);
  const btnSubmitRef = useRef(null);

  const errorFnameRef = useRef(null);
  const errorLnameRef = useRef(null);
  const errorEmailRef = useRef(null);
  const errorMobileRef = useRef(null);
  const errorPasswordRef = useRef(null);
  const errorConfirmPasswordRef = useRef(null);
  const errorAadharRef = useRef(null);
  const errorLandAreaRef = useRef(null);
  const errorLocationRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkBoxTermsRef.current.checked = false;
    btnSubmitRef.current.disabled = false;
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let isValid = true;

    // First Name
    if (inputFirstNameRef.current.value.trim() === "") {
      errorFnameRef.current.textContent = "First name is required";
      errorFnameRef.current.style.color = "red";
      inputFirstNameRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorFnameRef.current.textContent = "";
      inputFirstNameRef.current.style.border = "";
    }

    // Last Name
    if (inputLastNameRef.current.value.trim() === "") {
      errorLnameRef.current.textContent = "Last name is required";
      errorLnameRef.current.style.color = "red";
      inputLastNameRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorLnameRef.current.textContent = "";
      inputLastNameRef.current.style.border = "";
    }

    // Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (inputEmailRef.current.value.trim() === "") {
      errorEmailRef.current.textContent = "Email is required";
      errorEmailRef.current.style.color = "red";
      inputEmailRef.current.style.border = "2px solid red";
      isValid = false;
    } else if (!emailRegex.test(inputEmailRef.current.value.trim())) {
      errorEmailRef.current.textContent = "Enter a valid email";
      errorEmailRef.current.style.color = "red";
      inputEmailRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorEmailRef.current.textContent = "";
      inputEmailRef.current.style.border = "";
    }

    // Mobile
    const mobileRegex = /^[6-9]\d{9}$/;
    if (inputMobileRef.current.value.trim() === "") {
      errorMobileRef.current.textContent = "Mobile number is required";
      errorMobileRef.current.style.color = "red";
      inputMobileRef.current.style.border = "2px solid red";
      isValid = false;
    } else if (!mobileRegex.test(inputMobileRef.current.value.trim())) {
      errorMobileRef.current.textContent = "Invalid mobile number";
      errorMobileRef.current.style.color = "red";
      inputMobileRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorMobileRef.current.textContent = "";
      inputMobileRef.current.style.border = "";
    }

    // Password
    if (inputPasswordRef.current.value.trim() === "") {
      errorPasswordRef.current.textContent = "Password is required";
      errorPasswordRef.current.style.color = "red";
      inputPasswordRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorPasswordRef.current.textContent = "";
      inputPasswordRef.current.style.border = "";
    }

    // Aadhar validation
    const aadharRegex = /^\d{12}$/;
    if (inputAadharRef.current.value.trim() === "") {
      errorAadharRef.current.textContent = "Aadhar is required";
      errorAadharRef.current.style.color = "red";
      inputAadharRef.current.style.border = "2px solid red";
      isValid = false;
    } else if (!aadharRegex.test(inputAadharRef.current.value.trim())) {
      errorAadharRef.current.textContent = "Invalid 12-digit Aadhar";
      errorAadharRef.current.style.color = "red";
      inputAadharRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorAadharRef.current.textContent = "";
      inputAadharRef.current.style.border = "";
    }

    // Confirm Password
    if (
      inputConfirmPasswordRef.current.value.trim() !==
      inputPasswordRef.current.value.trim()
    ) {
      errorConfirmPasswordRef.current.textContent = "Passwords do not match";
      errorConfirmPasswordRef.current.style.color = "red";
      inputConfirmPasswordRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorConfirmPasswordRef.current.textContent = "";
      inputConfirmPasswordRef.current.style.border = "";
    }

    // Land Area Validation
    const landVal = parseFloat(inputLandAreaRef.current.value);
    if (isNaN(landVal)) {
      errorLandAreaRef.current.textContent = "Land area is required";
      errorLandAreaRef.current.style.color = "red";
      inputLandAreaRef.current.style.border = "2px solid red";
      isValid = false;
    } else if (landVal < 2) {
      errorLandAreaRef.current.textContent = "Minimum 2 acres required to register";
      errorLandAreaRef.current.style.color = "red";
      inputLandAreaRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorLandAreaRef.current.textContent = "";
      inputLandAreaRef.current.style.border = "";
    }

    // Location Validation
    if (inputLocationRef.current.value.trim() === "") {
      errorLocationRef.current.textContent = "Location is required";
      errorLocationRef.current.style.color = "red";
      inputLocationRef.current.style.border = "2px solid red";
      isValid = false;
    } else {
      errorLocationRef.current.textContent = "";
      inputLocationRef.current.style.border = "";
    }

    // Terms Checkbox
    if (!checkBoxTermsRef.current.checked) {
      alert("Please accept the terms and conditions.");
      isValid = false;
    }

    if (!isValid) return;

    if (!otpVerified || !otpToken) {
      alert("Please verify your email with OTP before registering.");
      return;
    }

    const farmerRegisterData = {
      full_name:
        inputFirstNameRef.current.value.trim() +
        " " +
        inputLastNameRef.current.value.trim(),
      email: inputEmailRef.current.value.trim(),
      mobile: inputMobileRef.current.value.trim(),
      aadhar_no: inputAadharRef.current.value.trim(),
      id_proof: userData.id_proof,
      password: inputPasswordRef.current.value.trim(),
      role: "farmer",
      otp_token: otpToken,
      profileImage: userData.profileImage,
      land_area: parseFloat(inputLandAreaRef.current.value),
      earnings: 0,
    };

    userApiService.RegisterFarmer(farmerRegisterData);
    navigate("/login");
  };

  const requestOtp = async () => {
    const email = (userData.email || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Enter a valid email first.");
      return;
    }
    setOtpLoading(true);
    try {
      await userApiService.requestOtp(email, "register");
      setOtpRequested(true);
      setOtpVerified(false);
      setOtpToken("");
      alert("OTP sent successfully. Please check your email.");
    } catch (e) {
      alert(e?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const email = (userData.email || "").trim();
    if (!otp || otp.trim().length !== 6) {
      alert("Enter the 6-digit OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await userApiService.verifyOtp(email, "register", otp.trim());
      setOtpVerified(true);
      setOtpToken(res.otp_token);
      alert("Email verified successfully.");
    } catch (e) {
      alert(e?.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ position: "absolute", top: 16, left: 16 }}>
        <Link to="/" className="link" style={{ textDecoration: "none" }}>
          Home
        </Link>
      </div>
      <h2>Farmer Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="fname"
            value={userData.fname}
            onChange={handleChange}
            ref={inputFirstNameRef}
          />
          <span ref={errorFnameRef}></span>
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lname"
            value={userData.lname}
            onChange={handleChange}
            ref={inputLastNameRef}
          />
          <span ref={errorLnameRef}></span>
        </div>
        <div className="form-group">
          <label>Email:</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={(e) => {
                setOtpRequested(false);
                setOtpVerified(false);
                setOtpToken("");
                setOtp("");
                handleChange(e);
              }}
              ref={inputEmailRef}
              style={{ flex: 1 }}
              disabled={otpVerified}
            />
            {!otpVerified && (
              <button
                type="button"
                onClick={requestOtp}
                disabled={otpLoading}
                style={{ whiteSpace: "nowrap", marginTop: 0 }}
              >
                {otpRequested ? "Resend OTP" : "Send OTP"}
              </button>
            )}
          </div>
          <span ref={errorEmailRef}></span>
          {otpRequested && (
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {!otpVerified ? (
                <>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button type="button" onClick={verifyOtp} disabled={otpLoading} style={{ marginTop: 0 }}>
                    Verify
                  </button>
                </>
              ) : (
                <span style={{ color: "green", alignSelf: "center", fontWeight: "bold" }}>
                  Verified ✓
                </span>
              )}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Mobile No. </label>
          <input
            type="text"
            name="mobile"
            value={userData.mobile}
            onChange={handleChange}
            ref={inputMobileRef}
          />
          <span ref={errorMobileRef}></span>
        </div>
        <div className="form-group">
          <label>Land Area (Acres):</label>
          <input
            type="number"
            step="0.1"
            name="land_area"
            value={userData.land_area}
            onChange={handleChange}
            ref={inputLandAreaRef}
            placeholder="Minimum 2 acres"
          />
          <span ref={errorLandAreaRef}></span>
        </div>
        <div className="form-group">
          <label>Aadhar Number:</label>
          <input
            type="text"
            name="aadhar_no"
            value={userData.aadhar_no}
            onChange={handleChange}
            ref={inputAadharRef}
          />
          <span ref={errorAadharRef}></span>
        </div>
        <div className="form-group">
          <label>Location (City):</label>
          <input
            type="text"
            name="location"
            value={userData.location}
            onChange={handleChange}
            ref={inputLocationRef}
            placeholder="e.g. Mumbai, Delhi..."
          />
          <span ref={errorLocationRef}></span>
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            ref={inputPasswordRef}
          />
          <span ref={errorPasswordRef}></span>
        </div>
        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            ref={inputConfirmPasswordRef}
          />
          <span ref={errorConfirmPasswordRef}></span>
        </div>

        <div className="form-group">
          <label>Profile Image:</label>
          <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="form-group">
          <label>ID Proof Document:</label>
          <input type="file" name="id_proof" accept="image/*,.pdf" onChange={handleFileChange} />
        </div>

       <div className="form-group">
         <table><tr><th> <input
            type="checkbox"
            name="checkbox"
            checked={userData.checkbox}
            onChange={handleChange}
            ref={checkBoxTermsRef}
          /></th>
          <th><label>I accept the terms and conditions</label></th></tr></table>
        </div>

        <button type="submit" ref={btnSubmitRef}>
          Register
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default FarmerRegister;