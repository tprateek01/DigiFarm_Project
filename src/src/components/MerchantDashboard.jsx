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
import "../styles/MerchantDashboard.css";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function MerchantDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [merchantName, setMerchantName] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));

    if (!session || session.role !== "merchant") {
      alert("Unauthorized. Please login as merchant.");
      navigate("/login");
      return;
    }

    setMerchantName(session.name);

    // Fetch available products from farmers
    userApiService.getAllFarmerProducts(setProducts);
   ;

    // Fetch merchant orders
    userApiService.getMerchantOrders(session.id, setOrders);

    // Fetch live market prices
    userApiService.getLivePrices().then(setPrices);

    // Fetch chat messages
    userApiService.getMerchantMessages(session.id, setMessages);
  }, [navigate]);

  const sendMessage = () => {
    if (!msg.trim()) return;

    // Save locally
    setMessages(prev => [...prev, { text: msg, self: true }]);

    // Call API to send message
    userApiService.sendMerchantMessage(msg);

    setMsg("");
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Spending",
        data: [15000, 12000, 18000, 9000],
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
          <Link to="/merchant/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/merchant/profile" className="nav-link">Profile</Link>
          <Link to="/merchant/product" className="nav-link">Browse Crops</Link>
          <Link to="/merchant/orders" className="nav-link">My Orders</Link>
          <Link to="/merchant/settings" className="nav-link">Settings</Link>
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
          <h1>Welcome, {merchantName}</h1>
        </header>

        <section className="content-section">

          {/* Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4>Total Orders</h4>
              <p>{orders.length}</p>
            </div>
            <div className="stat-card">
              <h4>Pending Orders</h4>
              <p>{orders.filter(o => o.status === "pending").length}</p>
            </div>
            <div className="stat-card">
              <h4>Total Spending</h4>
              <p>₹{orders.reduce((acc, o) => acc + o.totalPrice, 0)}</p>
            </div>
            <div className="stat-card">
              <h4>Messages</h4>
              <p>{messages.length}</p>
            </div>
          </div>

          {/* Chat */}
          <div className="dashboard-box">
            <h3>💬 Live Chat with Farmers</h3>
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
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>

          {/* Browse Crops */}
          <div className="dashboard-box">
            <h3>🌾 Available Crops</h3>
            <div className="products-grid">
              {products.length === 0 ? (
                <p className="empty-msg">No products available.</p>
              ) : (
                products.map(product => (
                  <div key={product.id} className="product-card">
                    <img
                      src={product.images?.[0]?.image || "https://via.placeholder.com/320"}
                      alt={product.product_name}
                    />
                    <div className="product-details">
                      <h3>{product.product_name}</h3>
                      <p><strong>Qty:</strong> {product.product_Qty} {product.product_Unit}</p>
                      <p><strong>Price:</strong> ₹{product.product_Unitprice}</p>
                      <p><strong>Category:</strong> {product.product_Category}</p>
                      <span className={`status-badge ${product.isAvailable ? "active" : "inactive"}`}>
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </span>
                      <button className="btn-primary" style={{marginTop:"10px"}}>
                        Place Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Prices */}
          <div className="dashboard-box">
            <h3>📈 Live Market Prices</h3>
            <div className="price-grid">
              {prices.map((p, i) => (
                <div key={i} className="price-card">
                  <h4>{p.crop}</h4>
                  <p>₹{p.price}/kg</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Analytics */}
          <div className="dashboard-box">
            <h3>📊 Spending Analytics</h3>
            <Bar data={chartData} />
          </div>

          {/* Recent Orders */}
          <div className="dashboard-box">
            <h3>🧾 Recent Orders</h3>
            {orders.length === 0 ? (
              <p className="empty-msg">No orders yet.</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Farmer</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>{o.product_name}</td>
                      <td>{o.farmer_name}</td>
                      <td>{o.quantity} {o.unit}</td>
                      <td>₹{o.totalPrice}</td>
                      <td>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
