import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../api/userApi";
import PaymentButton from "./PaymentButton"; // Import PaymentButton
import "../styles/MerchantOrders.css";
import { toast } from "react-toastify";

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFarmer, setOpenFarmer] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session_data"));

  const loadOrders = () => {
    if (!session || session.role !== "merchant") {
      navigate("/login");
      return;
    }

    setLoading(true);
    userApiService.getMerchantOrders(session.id, (data) => {
      setOrders(data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ---------- CANCEL ORDERS ----------
  const cancelOrder = (order) => {
    if (order.status === "dispatched" || order.status === "delivered") {
      toast.error("Order already dispatched. Cannot cancel.");
      return;
    }

    if (order.status === "accepted") {
      const confirmPenalty = window.confirm(
        "Farmer accepted order. ₹50 penalty required. Continue?"
      );
      if (!confirmPenalty) return;

      const paid = window.confirm("Simulate penalty payment success?");
      if (!paid) {
        toast.error("Payment failed.");
        return;
      }
    }

    userApiService.updateOrderStatus(order.id, "cancelled", () => {
      toast.success("Order cancelled");
      loadOrders();
    });
  };

  // ---------- INVOICE ----------
  const generateInvoice = (order) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { text-align:center; }
          table { width:100%; border-collapse: collapse; margin-top:20px; }
          td, th { border:1px solid #333; padding:8px; }
        </style>
      </head>
      <body>
        <h2>Order Invoice</h2>
        <p><b>Order ID:</b> ${order.id}</p>
        <p><b>Product:</b> ${order.product_name}</p>
        <p><b>Farmer:</b> ${order.farmer_name}</p>
        <p><b>Status:</b> ${order.status}</p>
        <p><b>Payment:</b> ${order.payment_status || "unpaid"}</p>

        <table>
          <tr>
            <th>Qty</th>
            <th>Total</th>
          </tr>
          <tr>
            <td>${order.quantity || "-"}</td>
            <td>₹${order.totalPrice}</td>
          </tr>
        </table>
        <p style="margin-top:20px;">Thank you!</p>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // ---------- TRACKING ----------
  const renderTracking = (status) => {
    const steps = ["requested", "accepted", "dispatched", "delivered"];
    return (
      <div className="tracking-bar">
        {steps.map((s, i) => (
          <span
            key={i}
            className={`track-step ${steps.indexOf(status) >= i ? "done" : ""}`}
          >
            {s}
          </span>
        ))}
      </div>
    );
  };

  // ---------- GROUP ----------
  const grouped = orders.reduce((acc, o) => {
    const id = o.farmer_id;
    if (!acc[id])
      acc[id] = { farmerName: o.farmer_name, orders: [], total: 0 };
    acc[id].orders.push(o);
    acc[id].total += Number(o.totalPrice || 0);
    return acc;
  }, {});

  const farmers = Object.entries(grouped).filter(([_, d]) =>
    d.farmerName.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- PAYMENT STATUS UPDATE ----------


const handlePaid = (orderId, farmerId, amount, order) => {
  userApiService.updatePaymentStatus(orderId, "paid", (data) => {
    toast.success("Payment received!");

    // Update order in UI
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: "paid" } : o))
    );

    // 1️⃣ Send chat invoice
    userApiService.sendInvoiceMessageToFarmer(farmerId, orderId, amount);

    // 2️⃣ Generate downloadable PDF invoice
    // Correct call via userApiService
userApiService.generatePDFInvoice(order);

  });
};





  return (
    <div className="merchant-orders-page">
      <header>
        <h1>My Orders 🔔</h1>

        <div className="header-actions">
          <input
            className="search-input"
            placeholder="Search farmer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="refresh-btn" onClick={loadOrders}>
            Refresh
          </button>

          <Link className="back-btn" to="/merchant/dashboard">
            Back
          </Link>
        </div>
      </header>

      {loading ? (
        <p className="center">Loading...</p>
      ) : farmers.length === 0 ? (
        <p className="center empty">No orders found</p>
      ) : (
        <div className="farmer-grid">
          {farmers.map(([farmerId, data]) => (
            <div key={farmerId} className="farmer-card">
              <div className="farmer-card-header">
                <div className="farmer-info">
                  <h3>{data.farmerName}</h3>
                  <p>Total: ₹{data.total}</p>
                </div>

                <span
                  className="expand-icon"
                  onClick={() =>
                    setOpenFarmer(openFarmer === farmerId ? null : farmerId)
                  }
                >
                  {openFarmer === farmerId ? "▲" : "▼"}
                </span>
              </div>

              {openFarmer === farmerId && (
                <div className="farmer-dropdown">
                  {data.orders.map((o) => (
                    <div key={o.id} className="order-item">
                      <p className="product">{o.product_name}</p>
                      <p>Status: {o.status}</p>
                      <p>Payment: {o.payment_status || "unpaid"}</p>

                      {renderTracking(o.status)}

                      <div className="order-buttons">
                        {/* Cancel */}
                        {o.status !== "cancelled" &&
                          o.status !== "dispatched" &&
                          o.status !== "delivered" && (
                            <button
                              className="cancel-btn"
                              onClick={() => cancelOrder(o)}
                            >
                              Cancel
                            </button>
                          )}

                        {/* Payment button */}
                        { o.status === "accepted" && o.payment_status !== "paid" && (
  <PaymentButton
  amount={o.totalPrice}
  orderId={o.id}
  onPaid={() => handlePaid(o.id, o.farmer_id, o.totalPrice, o)}
/>

)}


                        {/* Invoice */}
                        <button
                          className="invoice-btn"
                          onClick={() => generateInvoice(o)}
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
