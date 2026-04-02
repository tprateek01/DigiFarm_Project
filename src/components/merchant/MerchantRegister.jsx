import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApiService } from '../../api/userApi';

const MerchantRegister = () => {
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [userData, setUserData] = useState({
    fname: '',
    lname: '',
    cname: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    companyType: '',
    reg_no: '',
    checkbox: ''
  });

  const inputFirstNameRef = useRef(null);
  const inputLastNameRef = useRef(null);
  const inputCompanyNameRef = useRef(null);
  const inputEmailRef = useRef(null);
  const inputPasswordRef = useRef(null);
  const inputConfirmPasswordRef = useRef(null);
  const inputMobileRef = useRef(null);
  const inputRegNoRef = useRef(null);
  const checkBoxTermsRef = useRef(null);
  const btnSubmitRef = useRef(null);

  // Error Refs
  const errorFnameRef = useRef(null);
  const errorLnameRef = useRef(null);
  const errorCnameRef = useRef(null);
  const errorEmailRef = useRef(null);
  const errorMobileRef = useRef(null);
  const errorPasswordRef = useRef(null);
  const errorConfirmPasswordRef = useRef(null);
  const errorRegNoRef = useRef(null);
  const errorCompanyTypeRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkBoxTermsRef.current.checked = false;
    btnSubmitRef.current.disabled = false;
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });

    // Optional: Clear error as user types
    const fieldMap = {
      fname: [errorFnameRef, inputFirstNameRef],
      lname: [errorLnameRef, inputLastNameRef],
      cname: [errorCnameRef, inputCompanyNameRef],
      email: [errorEmailRef, inputEmailRef],
      mobile: [errorMobileRef, inputMobileRef],
      password: [errorPasswordRef, inputPasswordRef],
      confirmPassword: [errorConfirmPasswordRef, inputConfirmPasswordRef],
      reg_no: [errorRegNoRef, inputRegNoRef]
    };

    if (fieldMap[e.target.name]) {
      fieldMap[e.target.name][0].current.textContent = '';
      fieldMap[e.target.name][1].current.style.border = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const setError = (ref, message, inputRef) => {
      ref.current.textContent = message;
      ref.current.style.color = "red";
      inputRef.current.style.border = "2px solid red";
    };

    const clearError = (ref, inputRef) => {
      ref.current.textContent = "";
      inputRef.current.style.border = "";
    };

    let isValid = true;

    // Validations
    if (inputFirstNameRef.current.value.trim() === "") {
      setError(errorFnameRef, "First name is required", inputFirstNameRef);
      isValid = false;
    } else clearError(errorFnameRef, inputFirstNameRef);

    if (inputLastNameRef.current.value.trim() === "") {
      setError(errorLnameRef, "Last name is required", inputLastNameRef);
      isValid = false;
    } else clearError(errorLnameRef, inputLastNameRef);

    if (inputCompanyNameRef.current.value.trim() === "") {
      setError(errorCnameRef, "Company name is required", inputCompanyNameRef);
      isValid = false;
    } else clearError(errorCnameRef, inputCompanyNameRef);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (inputEmailRef.current.value.trim() === "") {
      setError(errorEmailRef, "Email is required", inputEmailRef);
      isValid = false;
    } else if (!emailRegex.test(inputEmailRef.current.value.trim())) {
      setError(errorEmailRef, "Enter a valid email", inputEmailRef);
      isValid = false;
    } else clearError(errorEmailRef, inputEmailRef);

    const mobileRegex = /^[6-9]\d{9}$/;
    if (inputMobileRef.current.value.trim() === "") {
      setError(errorMobileRef, "Mobile number is required", inputMobileRef);
      isValid = false;
    } else if (!mobileRegex.test(inputMobileRef.current.value.trim())) {
      setError(errorMobileRef, "Invalid mobile number", inputMobileRef);
      isValid = false;
    } else clearError(errorMobileRef, inputMobileRef);

    if (inputPasswordRef.current.value.trim() === "") {
      setError(errorPasswordRef, "Password is required", inputPasswordRef);
      isValid = false;
    } else clearError(errorPasswordRef, inputPasswordRef);

    if (inputConfirmPasswordRef.current.value.trim() === "") {
      setError(errorConfirmPasswordRef, "Confirm password is required", inputConfirmPasswordRef);
      isValid = false;
    } else if (inputConfirmPasswordRef.current.value !== inputPasswordRef.current.value) {
      setError(errorConfirmPasswordRef, "Passwords do not match", inputConfirmPasswordRef);
      isValid = false;
    } else clearError(errorConfirmPasswordRef, inputConfirmPasswordRef);

    if (!userData.companyType) {
      errorCompanyTypeRef.current.textContent = "Please select a company type";
      errorCompanyTypeRef.current.style.color = "red";
      isValid = false;
    } else {
      errorCompanyTypeRef.current.textContent = "";
    }

    if (inputRegNoRef.current.value.trim() === "") {
      setError(errorRegNoRef, "Registration number is required", inputRegNoRef);
      isValid = false;
    } else clearError(errorRegNoRef, inputRegNoRef);

    if (!checkBoxTermsRef.current.checked) {
      alert("Please accept the terms and conditions");
      isValid = false;
    }

    if (!isValid) return;

    if (!otpVerified || !otpToken) {
      alert("Please verify your email with OTP before registering.");
      return;
    }

    const merchantData = {
      name: inputFirstNameRef.current.value.trim() + " " + inputLastNameRef.current.value.trim(),
      companyName: inputCompanyNameRef.current.value.trim(),
      email: inputEmailRef.current.value.trim(),
      mobile: inputMobileRef.current.value.trim(),
      password: inputPasswordRef.current.value.trim(),
      companyType: userData.companyType,
      registrationNo: inputRegNoRef.current.value.trim(),
      role: "merchant",
      otp_token: otpToken
    };

    userApiService.RegisterMerchant(merchantData);
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
      <h2>Merchant Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input name="fname" value={userData.fname} onChange={handleChange} ref={inputFirstNameRef} />
          <span ref={errorFnameRef}></span>
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input name="lname" value={userData.lname} onChange={handleChange} ref={inputLastNameRef} />
          <span ref={errorLnameRef}></span>
        </div>

        <div className="form-group">
          <label>Company Name:</label>
          <input name="cname" value={userData.cname} onChange={handleChange} ref={inputCompanyNameRef} />
          <span ref={errorCnameRef}></span>
        </div>

        <div className="form-group">
          <label>Email:</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              name="email"
              type="email"
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
          <label>Mobile No.:</label>
          <input name="mobile" type="number" value={userData.mobile} onChange={handleChange} ref={inputMobileRef} />
          <span ref={errorMobileRef}></span>
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input name="password" type="password" value={userData.password} onChange={handleChange} ref={inputPasswordRef} />
          <span ref={errorPasswordRef}></span>
        </div>

        <div className="form-group">
          <label>Confirm Password:</label>
          <input name="confirmPassword" type="password" value={userData.confirmPassword} onChange={handleChange} ref={inputConfirmPasswordRef} />
          <span ref={errorConfirmPasswordRef}></span>
        </div>

        <label>Type of Company:</label>
        <div className="form-group">
          <input type="radio" name="companyType" value="Proprietorship" onChange={handleChange} /> Proprietorship
        </div>
        <div className="form-group">
          <input type="radio" name="companyType" value="LLP" onChange={handleChange} /> LLP
        </div>
        <div className="form-group">
          <input type="radio" name="companyType" value="Private Limited" onChange={handleChange} /> Private Limited
        </div>
        <div className="form-group">
          <input type="radio" name="companyType" value="Public" onChange={handleChange} /> Public
        </div>
        <span ref={errorCompanyTypeRef}></span>

        <div className="form-group">
          <label>Company Registration No:</label>
          <input name="reg_no" value={userData.reg_no} onChange={handleChange} ref={inputRegNoRef} />
          <span ref={errorRegNoRef}></span>
        </div>

        <div className="form-group">
           <table><tr><th><input type="checkbox" name="checkbox" onChange={handleChange} ref={checkBoxTermsRef} /></th>
          <th><label>I accept the terms and conditions</label></th></tr></table>
        </div>

        <button type="submit" ref={btnSubmitRef}>Register</button>
      </form>
      <p>Already have an account? <a href="/merchant-login">Login</a></p>
    </div>
  );
};

export default MerchantRegister;