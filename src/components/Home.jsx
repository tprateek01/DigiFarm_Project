import React from "react";
import { Link } from "react-router-dom";
import "./css/App.css";

const Home1 = () => {
  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <div className="hero-section">
        <h1>AgriTrade</h1>
        <p>Sell your crops directly or buy fresh produce at fair prices.</p>

        <div className="hero-actions">
          <Link to="/register/farmer" className="action-btn primary">
            I am a Farmer
          </Link>
          <Link to="/register/merchant" className="action-btn secondary">
            I am a Merchant
          </Link>
        </div>
      </div>

      {/* TRUST SECTION */}
      <div className="trust-section">
        <div className="trust-card">✅ Trusted by 500+ Farmers</div>
        <div className="trust-card">✅ 1000+ Merchants Connected</div>
        <div className="trust-card">✅ Secure & Fair Transactions</div>
      </div>

      {/* FEATURES SECTION */}
      <div className="features-section">
        <h2>Why AgriTrade?</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Fair Prices</h3>
            <p>Farmers earn more, merchants pay less. Direct trade, no middlemen.</p>
          </div>
          <div className="feature-card">
            <h3>Fresh Produce</h3>
            <p>Quality-checked crops delivered quickly and safely.</p>
          </div>
          <div className="feature-card">
            <h3>Live Market Info</h3>
            <p>Track prices and demand to make smarter decisions.</p>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">1</div>
            <h3>Create Account</h3>
            <p>Register as Farmer or Merchant in seconds.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">2</div>
            <h3>List or Browse</h3>
            <p>Farmers list crops. Merchants browse available produce.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">3</div>
            <h3>Trade Securely</h3>
            <p>Negotiate, confirm orders, and transact safely.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">4</div>
            <h3>Track & Review</h3>
            <p>Track delivery and leave reviews for transparency.</p>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="cta-section">
        <h2>Ready to Start Trading?</h2>
        <p>Whether you are a Farmer or a Merchant, join AgriTrade today!</p>
        <div className="cta-actions">
          <Link to="/login" className="action-btn primary">Login</Link>
          <Link to="/register" className="action-btn secondary">Register</Link>
        </div>
      </div>

    </div>
  );
};

export default Home1;
