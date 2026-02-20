import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";
import { userApiService } from "../api/userApi";
import "../styles/FarmerDashboard.css";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function FarmerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [farmerName, setFarmerName] = useState("");
  const navigate = useNavigate();

  // chat state
  const [messages, setMessages] = useState([
    { text: "Merchant: Hello, available wheat?", self: false }
  ]);
  const [msg, setMsg] = useState("");

  // prices
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));

    if (!session || session.role !== "farmer") {
      alert("Unauthorized. Please login as farmer.");
      navigate("/login");
      return;
    }

    setFarmerName(session.name);

    // ✅ fetch real farmer products
    userApiService.getFarmerProducts(session.id, setProducts);

    // fake live prices
    setTimeout(() => {
      setPrices([
        { crop: "Wheat", price: 24 },
        { crop: "Rice", price: 32 },
        { crop: "Mango", price: 65 }
      ]);
    }, 800);

  }, [navigate]);

  const send = () => {
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { text: msg, self: true }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: "Merchant: Offer ₹25/kg", self: false }
      ]);
    }, 1000);

    setMsg("");
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Earnings",
        data: [12000, 15000, 9000, 18000],
        backgroundColor: "#4a7a2f"
      }
    ]
  };

  return (
    <div className={`dashboard-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AgriTrade</h2>
          <button className="btn-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "«" : "»"}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/farmer/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/product_list" className="nav-link">My Products</Link>
          <Link to="/order" className="nav-link">Orders</Link>
          <Link to="/farmer/settings" className="nav-link">Settings</Link>
        </nav>

        <button className="btn-logout" onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}>Logout</button>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="main-header">
          <button className="btn-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h1>Welcome, {farmerName}</h1>
        </header>

        <section className="content-section">

          {/* Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4>Active Listings</h4>
              <p>{products.filter(p => p.isAvailable).length}</p>
            </div>
            <div className="stat-card">
              <h4>Total Products</h4>
              <p>{products.length}</p>
            </div>
            <div className="stat-card">
              <h4>Earnings</h4>
              <p>₹18,500</p>
            </div>
            <div className="stat-card">
              <h4>Messages</h4>
              <p>{messages.length}</p>
            </div>
          </div>

          {/* Chat */}
          <div className="dashboard-box">
            <h3>💬 Live Chat</h3>

            <div className="chat-box">
              {messages.map((m, i) => (
                <div key={i} className={m.self ? "msg self" : "msg"}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Type message..."
              />
              <button onClick={send}>Send</button>
            </div>
          </div>

          {/* Prices */}
          <div className="dashboard-box">
            <h3>📈 Live Prices</h3>

            <div className="price-grid">
              {prices.map((p, i) => (
                <div key={i} className="price-card">
                  <h4>{p.crop}</h4>
                  <p>₹{p.price}/kg</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics */}
          <div className="dashboard-box">
            <h3>📊 Earnings Analytics</h3>
            <Bar data={chartData} />
          </div>

          {/* Reputation */}
          <div className="dashboard-box">
            <h3>⭐ Reputation</h3>
            <p>Rating: 4.4 / 5</p>
            <p>Completed trades: 21</p>
            <p>Trusted seller ✔</p>
          </div>

          {/* Product Section */}
          <div className="content-header">
            <h2>My Listed Products</h2>
            <Link to="/add-product" className="btn-primary">
              + Add New Product
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="empty-msg">No products listed yet.</p>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <article key={product.id} className="product-card">
                  <img
                    src={product.images?.[0]?.image || "https://via.placeholder.com/320"}
                    alt={product.product_name}
                  />

                  <div className="product-details">
                    <h3>{product.product_name}</h3>
                    <p>
                      <strong>Qty:</strong> {product.product_Qty} {product.product_Unit}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹{product.product_Unitprice}
                    </p>
                    <p>
                      <strong>Category:</strong> {product.product_Category}
                    </p>

                    <span className={`status-badge ${product.isAvailable ? "active" : "inactive"}`}>
                      {product.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
