import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../api/userApi";
import "./css/App.css"; // Import your CSS

import API_URL from "../config/apiConfig";

const Login1 = () => {
  const [role, setRole] = useState("farmer");
  const inputIdentifierRef = useRef(null);
  const inputPasswordRef = useRef(null);
  const errorIdentifierRef = useRef(null);
  const errorPasswordRef = useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleMessage = (event) => {
      // Must match backend origin
      if (event.origin !== API_URL) return;
      if (event.data?.source === 'GOOGLE_AUTH_SUCCESS') {
        const matchedUser = event.data.payload;
        if (matchedUser.role === 'merchant' && matchedUser.status !== 'approved') {
          window.alert("Account is waiting for admin approval or rejected.");
          return;
        }
        localStorage.setItem("session_data", JSON.stringify({
          id: matchedUser.id,
          name: matchedUser.full_name || matchedUser.name || "",
          email: matchedUser.email,
          role: matchedUser.role,
          companyName: matchedUser.companyName || matchedUser.company_type || "",
          company_type: matchedUser.company_type || "",
          mobile: matchedUser.mobile || "",
          profileImage: matchedUser.profileImage || "",
          location: matchedUser.location || "",
          land_area: matchedUser.land_area || 0,
          aadhar_no: matchedUser.aadhar_no || "",
          reg_no: matchedUser.reg_no || ""
        }));
        navigate(`/${matchedUser.role}/dashboard`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleGoogleLogin = () => {
    window.open(`${API_URL}/auth/google`, 'Google Auth', 'width=500,height=600');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    errorIdentifierRef.current.textContent = "";
    errorPasswordRef.current.textContent = "";

    const identifier = inputIdentifierRef.current.value.trim();
    const password = inputPasswordRef.current.value.trim();
    let isValid = true;

    if (!identifier) {
      errorIdentifierRef.current.textContent = "Required";
      isValid = false;
    } else if (!isValidEmail(identifier)) {
      errorIdentifierRef.current.textContent = "Invalid email";
      isValid = false;
    }

    if (!password) {
      errorPasswordRef.current.textContent = "Required";
      isValid = false;
    }

    if (!isValid) return;

    // Call API and handle login
    userApiService.login(
      { identifier, password },
      role,
      (matchedUser) => {
        // This is where you receive the user data!
        localStorage.setItem("session_data", JSON.stringify({
          id: matchedUser.id,
          name: matchedUser.full_name || matchedUser.name || "",
          email: matchedUser.email,
          role: matchedUser.role,
          companyName: matchedUser.companyName || matchedUser.company_type || "",
          company_type: matchedUser.company_type || "",
          mobile: matchedUser.mobile || "",
          profileImage: matchedUser.profileImage || "",
          location: matchedUser.location || "",
          land_area: matchedUser.land_area || 0,
          aadhar_no: matchedUser.aadhar_no || "",
          reg_no: matchedUser.reg_no || ""
        }));

        navigate(`/${role}/dashboard`);
        console.log("After Login => ", matchedUser);
      }



    );
  };

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, margin: "15px", zIndex: 9999 }}>
        <Link to="/" className="link" style={{ background: "#fff", padding: "8px 12px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textDecoration: "none", fontSize: "1.1rem", fontWeight: "bold", color: "#2e7d32" }}>
          ← Home
        </Link>
      </div>
      <div className="auth-container">
      {/* Role toggle */}
      <div className="radiop togglebutton">
        <button
          type="button"
          className={`role-btn ${role === "farmer" ? "active" : ""}`}
          onClick={() => setRole("farmer")}
        >
          Farmer
        </button>
        <button
          type="button"
          className={`role-btn ${role === "merchant" ? "active" : ""}`}
          onClick={() => setRole("merchant")}
        >
          Merchant
        </button>
      </div>

      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label>Email:</label>
          <input type="email" ref={inputIdentifierRef} />
          <span ref={errorIdentifierRef} style={{ color: "red" }}></span>
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password:</label>
          <input type="password" ref={inputPasswordRef} />
          <span ref={errorPasswordRef} style={{ color: "red" }}></span>
          <div className="linkContainer">
            <Link className="link" to="/forgot-password">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button type="submit">Login</button>
        <hr style={{ margin: "15px 0" }} />
        <button type="button" onClick={handleGoogleLogin} style={{ backgroundColor: "#db4437", width: "100%" }}>
          Login with Google
        </button>
      </form>

      {/* Register link */}
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don't have an account?{" "}
        <Link className="link" to={`/register/${role}`}>
          Register
        </Link>
      </p>
    </div>
    </>
  );
};

export default Login1;
