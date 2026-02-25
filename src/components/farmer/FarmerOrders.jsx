import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApiService } from "../../api/userApi";
import "../../styles/farmer/Forder.css";

export default function FarmerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [openMerchant, setOpenMerchant] = useState(null);
  const session = JSON.parse(localStorage.getItem("session_data"));

  const loadOrders = () => {
    if (!session || session.role !== "farmer") {
      alert("Unauthorized. Please login.");
      navigate("/login");
      return;
    }
    userApiService.getFarmerOrders(session.id, setOrders);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (id, status) => {
    userApiService.updateOrderStatus(id, status, loadOrders);
  };

  // Group orders by merchant
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.merchant_name]) {
      acc[order.merchant_name] = [];
    }
    acc[order.merchant_name].push(order);
    return acc;
  }, {});

  return (
    <div className="orders-wrapper">
      <header className="orders-header">
        <h1>📦 Farmer Orders</h1>
        <button onClick={() => navigate(-1)}>← Back</button>
      </header>

      {orders.length === 0 ? (
        <p className="empty-text">No orders yet.</p>
      ) : (
        <div className="merchant-sections">
          {Object.keys(groupedOrders).map((merchant) => {
            const merchantOrders = groupedOrders[merchant];
            const totalAmount = merchantOrders.reduce(
              (sum, o) => sum + Number(o.totalPrice),
              0
            );

            return (
              <div key={merchant} className="merchant-section">

                {/* Header */}
                <div
                  className="merchant-header"
                  onClick={() =>
                    setOpenMerchant(
                      openMerchant === merchant ? null : merchant
                    )
                  }
                >
                  <div className="merchant-info">
                    <h3>🛒 {merchant}</h3>

                    <div className="order-count">
                      {merchantOrders.length} Orders
                    </div>

                    <div className="total-amount">
                      Total: ₹{totalAmount}
                    </div>
                  </div>

                  <span
                    className={`arrow ${
                      openMerchant === merchant ? "rotate" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>

                {/* Dropdown */}
                <div
                  className={`merchant-orders-dropdown ${
                    openMerchant === merchant ? "open" : ""
                  }`}
                >
                  {merchantOrders.map((o) => (
                    <div key={o.id} className="order-item">
                      <h4>{o.product_name}</h4>
                      <p><strong>Total:</strong> ₹{o.totalPrice}</p>

                      <span className={`status ${o.status}`}>
                        {o.status}
                      </span>

                      <span
                        className={`status ${
                          o.payment_status === "paid"
                            ? "paid"
                            : "unpaid"
                        }`}
                      >
                        {o.payment_status === "paid"
                          ? "💰 Paid"
                          : "⏳ Unpaid"}
                      </span>

                      {o.status === "requested" && (
                        <div className="btn-group">
                          <button
                            className="accept-btn"
                            onClick={() =>
                              updateStatus(o.id, "accepted")
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() =>
                              updateStatus(o.id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {o.status === "accepted" && (
                        <button
                          className="primary-btn"
                          disabled={
                            o.payment_status !== "paid"
                          }
                          onClick={() =>
                            updateStatus(o.id, "dispatched")
                          }
                        >
                          Dispatch
                        </button>
                      )}

                      {o.status === "dispatched" && (
                        <button
                          className="primary-btn"
                          onClick={() =>
                            updateStatus(o.id, "delivered")
                          }
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
