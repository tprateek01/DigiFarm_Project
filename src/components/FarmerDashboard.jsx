import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";
import { userApiService } from "../api/userApi";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [farmerName, setFarmerName] = useState("");
  const [messages, setMessages] = useState([
    { text: "Merchant: Hello, available wheat?", self: false }
  ]);
  const [msg, setMsg] = useState("");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("session_data"));
        if (!session) return;

        setFarmerName(session.name);

        await userApiService.getFarmerProducts(session.id, setProducts);

        // demo live prices
        setPrices([
          { crop: "Wheat", price: 24 },
          { crop: "Rice", price: 32 },
          { crop: "Mango", price: 65 }
        ]);
      } catch (err) {
        console.error("Farmer dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  if (loading) return <p>Loading dashboard...</p>;

  const activeProducts = products.filter(p => p?.isAvailable);

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
    <>
      <header className="main-header">
        <h1>Welcome, {farmerName}</h1>
      </header>

      <section className="content-section">

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h4>Active Listings</h4>
            <p>{activeProducts.length}</p>
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
          <h3>Live Chat</h3>

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
            <button onClick={send} disabled={!msg.trim()}>
              Send
            </button>
          </div>
        </div>

        {/* Prices */}
        <div className="dashboard-box">
          <h3>Live Prices</h3>

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
          <h3>Earnings Analytics</h3>
          <Bar data={chartData} />
        </div>

        {/* Products */}
        <div className="dashboard-box">
          <h3>My Listed Products</h3>

          {products.length === 0 ? (
            <p className="empty-msg">No products listed yet.</p>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <article key={product.id} className="product-card">
                  <img
                    src={
                      product?.images && product.images.length > 0
                        ? product.images[0].image
                        : "https://via.placeholder.com/320"
                    }
                    alt={product.product_name}
                  />

                  <div className="product-details">
                    <h3>{product.product_name}</h3>
                    <p>
                      <strong>Qty:</strong>{" "}
                      {product.product_Qty} {product.product_Unit}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹{product.product_Unitprice}
                    </p>

                    <span
                      className={`status-badge ${
                        product.isAvailable ? "active" : "inactive"
                      }`}
                    >
                      {product.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </section>
    </>
  );
}
