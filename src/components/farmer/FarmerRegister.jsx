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
  });

  const inputFirstNameRef = useRef(null);
  const inputLastNameRef = useRef(null);
  const inputEmailRef = useRef(null);
  const inputMobileRef = useRef(null);
  const inputPasswordRef = useRef(null);
  const inputConfirmPasswordRef = useRef(null);
  const checkBoxTermsRef = useRef(null);
  const btnSubmitRef = useRef(null);

  const errorFnameRef = useRef(null);
  const errorLnameRef = useRef(null);
  const errorEmailRef = useRef(null);
  const errorMobileRef = useRef(null);
  const errorPasswordRef = useRef(null);
  const errorConfirmPasswordRef = useRef(null);

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
      name:
        inputFirstNameRef.current.value.trim() +
        " " +
        inputLastNameRef.current.value.trim(),
      email: inputEmailRef.current.value.trim(),
      mobile: inputMobileRef.current.value.trim(),
      password: inputPasswordRef.current.value.trim(),
      role: "farmer",
      otp_token: otpToken,
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
      alert("OTP sent to your email (check backend console in this project).");
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
            />
            <button
              type="button"
              onClick={requestOtp}
              disabled={otpLoading}
              style={{ whiteSpace: "nowrap" }}
            >
              {otpRequested ? "Resend OTP" : "Send OTP"}
            </button>
          </div>
          <span ref={errorEmailRef}></span>
          {otpRequested && (
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="button" onClick={verifyOtp} disabled={otpLoading}>
                Verify
              </button>
              {otpVerified && (
                <span style={{ color: "green", alignSelf: "center" }}>
                  Verified
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
        Already have an account? <a href="/farmer-login">Login</a>
      </p>
    </div>
  );
};

export default FarmerRegister;