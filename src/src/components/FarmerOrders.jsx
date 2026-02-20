import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApiService } from "../api/userApi";
import "../styles/Forder.css";
import Dashboard from "./MerchantDashboard";

export default function FarmerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));
    if (!session || session.role !== "farmer") {
      alert("Unauthorized. Please login.");
      navigate("/login");
      return;
    }

    // Fetch orders from API (dummy data for now)
    setOrders([
      { id: 1, buyer: "Ramesh Traders", product: "Wheat", qty: "20kg", price: 500, status: "Pending" },
      { id: 2, buyer: "Fresh Market", product: "Rice", qty: "10kg", price: 320, status: "Accepted" }
    ]);
  }, [navigate]);

  const updateStatus = (id, newStatus) => {
    setOrders(prev =>
      prev.map(order => order.id === id ? { ...order, status: newStatus } : order)
    );
  };

  return (
    <div className="orders-wrapper">
      <header className="orders-header">
        <h1>📦 Farmer Orders</h1>
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
      </header>

      {orders.length === 0 ? (
        <p className="empty-msg">No orders yet.</p>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <h3>{order.product}</h3>
              <p><strong>Buyer:</strong> {order.buyer}</p>
              <p><strong>Qty:</strong> {order.qty}</p>
              <p><strong>Total:</strong> ₹{order.price}</p>

              <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>

              {order.status === "Pending" && (
                <div className="order-actions">
                  <button className="btn-accept" onClick={() => updateStatus(order.id, "Accepted")}>Accept</button>
                  <button className="btn-reject" onClick={() => updateStatus(order.id, "Rejected")}>Reject</button>
                </div>
              )}

              {order.status === "Accepted" && (
                <button className="btn-complete" onClick={() => updateStatus(order.id, "Completed")}>
                  Mark Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
