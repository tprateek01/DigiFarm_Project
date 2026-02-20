import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../api/userApi";
import "./css/App.css"; // Import your CSS

const Login1 = () => {
  const [role, setRole] = useState("farmer");
  const inputIdentifierRef = useRef(null);
  const inputPasswordRef = useRef(null);
  const errorIdentifierRef = useRef(null);
  const errorPasswordRef = useRef(null);
  const navigate = useNavigate();

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isValidPhone = (v) => /^[0-9]{10}$/.test(v);

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
    } else if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
      errorIdentifierRef.current.textContent = "Invalid email or mobile";
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
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      company:matchedUser.companyName,
    }));

    navigate(`/${role}/dashboard`);
    console.log("After Login => ",matchedUser);
  }

 
      
    );
  };

  return (
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
        {/* Email or Mobile */}
        <div className="form-group">
          <label>Email or Mobile:</label>
          <input type="text" ref={inputIdentifierRef} />
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
      </form>

      {/* Register link */}
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don't have an account?{" "}
        <Link className="link" to={`/register/${role}`}>
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login1;
