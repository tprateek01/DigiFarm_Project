import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../api/userApi";
import "../styles/MerchantOrders.css";

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));

    if (!session || session.role !== "merchant") {
      alert("Unauthorized. Please login as merchant.");
      navigate("/login");
      return;
    }

    // Fetch merchant orders
    userApiService.getMerchantOrders(session.id, setOrders);
  }, [navigate]);

  // Filter orders based on search and status
  const filteredOrders = orders.filter((o) => {
    const crop = (o.product_name || "").toLowerCase();
    const farmer = (o.farmer_name || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchSearch = crop.includes(search) || farmer.includes(search);
    const matchStatus = statusFilter === "all" || (o.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  // Get unique order statuses
  const statuses = ["all", ...Array.from(new Set(orders.map(o => o.status).filter(Boolean)))];

  return (
    <div className="merchant-orders-page">
      <header className="orders-header">
        <h1>My Orders</h1>
        <Link to="/merchant/dashboard" className="btn-back">Back to Dashboard</Link>
      </header>

      <div className="orders-filters">
        <input
          type="text"
          placeholder="Search by crop or farmer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statuses.map((status, idx) => (
            <option key={idx} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="orders-table-wrapper">
        {filteredOrders.length === 0 ? (
          <p className="empty-msg">No orders found.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Farmer</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.product_name || "N/A"}</td>
                  <td>{order.farmer_name || "N/A"}</td>
                  <td>{order.quantity || 0} {order.unit || "unit"}</td>
                  <td>₹{order.totalPrice || 0}</td>
                  <td>
                    <span className={`status-badge ${order.status === "pending" ? "pending" : order.status === "completed" ? "completed" : "other"}`}>
                      {order.status || "N/A"}
                    </span>
                  </td>
                  <td>
                    {order.status === "pending" ? (
                      <button className="btn-primary" onClick={() => alert(`Order ${order.id} marked as received`)}>Mark Received</button>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
