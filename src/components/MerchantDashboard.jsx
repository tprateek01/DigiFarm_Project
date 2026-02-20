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

export default function MerchantDashboard() {
  const [products, setProducts] = useState([]);
  const [merchantName, setMerchantName] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("session_data"));

        if (!session) return;

        setMerchantName(session.name);

        await userApiService.getAllFarmerProducts(setProducts);
        await userApiService.getMerchantOrders(session.id, setOrders);
        const live = await userApiService.getLivePrices();
        setPrices(live || []);
        await userApiService.getMerchantMessages(session.id, setMessages);

      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { text: msg, self: true }]);
    userApiService.sendMerchantMessage(msg);
    setMsg("");
  };

  if (loading) return <p>Loading dashboard...</p>;

  const totalSpending = orders.reduce(
    (acc, o) => acc + Number(o.totalPrice || 0),
    0
  );

  const pendingOrders = orders.filter(
    o => (o.status || "").toLowerCase() === "pending"
  );

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
    <>
      <header className="main-header">
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
            <p>{pendingOrders.length}</p>
          </div>

          <div className="stat-card">
            <h4>Total Spending</h4>
            <p>₹{totalSpending}</p>
          </div>

          <div className="stat-card">
            <h4>Messages</h4>
            <p>{messages.length}</p>
          </div>
        </div>

        {/* Chat */}
        <div className="dashboard-box">
          <h3>Live Chat with Farmers</h3>

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
            <button onClick={sendMessage} disabled={!msg.trim()}>
              Send
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="dashboard-box">
          <h3>Available Crops</h3>

          <div className="products-grid">
            {products.length === 0 ? (
              <p className="empty-msg">No products available.</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="product-card">
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
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </span>

                    <button
                      className="btn-primary"
                      style={{ marginTop: "10px" }}
                    >
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
          <h3>Live Market Prices</h3>

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
          <h3>Spending Analytics</h3>
          <Bar data={chartData} />
        </div>

        {/* Orders */}
        <div className="dashboard-box">
          <h3>Recent Orders</h3>

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
                    <td>
                      {o.quantity} {o.unit}
                    </td>
                    <td>₹{o.totalPrice}</td>
                    <td>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </section>
    </>
  );
}
