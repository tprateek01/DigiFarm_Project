import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApiService } from "../api/userApi";
import "./css/App.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const isValidEmail = useMemo(
    () => (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim()),
    []
  );

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    const e = email.trim();
    if (!isValidEmail(e)) {
      alert("Enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await userApiService.requestOtp(e, "reset_password");
      setOtpRequested(true);
      setOtpToken("");
      alert("OTP sent successfully. Please check your email.");
    } catch (err) {
      alert(err?.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const e = email.trim();
    if (!isValidEmail(e)) {
      alert("Enter a valid email.");
      return;
    }
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      alert("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await userApiService.verifyOtp(e, "reset_password", code);
      setOtpToken(res.otp_token);
      alert("OTP verified. You can set a new password now.");
    } catch (err) {
      alert(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    const mail = email.trim();
    if (!isValidEmail(mail)) {
      alert("Enter a valid email.");
      return;
    }
    if (!otpToken) {
      alert("Please verify OTP first.");
      return;
    }
    if (!newPassword.trim()) {
      alert("Enter a new password.");
      return;
    }
    if (newPassword !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await userApiService.resetPassword({
        email: mail,
        newPassword,
        otp_token: otpToken,
      });
      alert("Password updated. Please login.");
      navigate("/login", { replace: true });
    } catch (err) {
      alert(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, margin: "15px", zIndex: 99999 }}>
        <Link to="/" className="link" style={{ background: "#fff", padding: "8px 12px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textDecoration: "none", fontSize: "1.1rem", fontWeight: "bold", color: "#2e7d32" }}>
          ← Home
        </Link>
      </div>
    <div className="auth-container">

      <h2>Forgot Password</h2>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setOtpRequested(false);
            setOtpToken("");
            setOtp("");
          }}
        />
      </div>

      <button type="button" onClick={requestOtp} disabled={loading} style={{ width: "100%", marginBottom: "15px" }}>
        {otpRequested ? "Resend OTP" : "Send OTP"}
      </button>

      {otpRequested && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button type="button" onClick={verifyOtp} disabled={loading}>
            Verify
          </button>
          {otpToken && (
            <span style={{ color: "green", alignSelf: "center" }}>Verified</span>
          )}
        </div>
      )}

      <form onSubmit={resetPassword}>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={!otpToken}
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={!otpToken}
          />
        </div>

        <button type="submit" disabled={loading || !otpToken}>
          Update Password
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 12 }}>
        Back to <Link className="link" to="/login">Login</Link>
      </p>
    </div>
    </>
  );
}

