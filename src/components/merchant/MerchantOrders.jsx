import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../../api/userApi";
import PaymentButton from "./PaymentButton"; // Import PaymentButton
import "../../styles/merchant/MerchantOrders.css";
import { toast } from "react-toastify";

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFarmer, setOpenFarmer] = useState(null);
  const [search, setSearch] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null); // id of the order being tracked
  const [orderQuantities, setOrderQuantities] = useState({}); // orderId -> qty
  const [products, setProducts] = useState([]); // Store products for price calculation

  const navigate = useNavigate();
  const session = useMemo(
    () => JSON.parse(localStorage.getItem("session_data")),
    []
  );

  const loadOrders = useCallback((silent = false) => {
    if (!session || session.role !== "merchant") {
      navigate("/login");
      return;
    }

    if (!silent) setLoading(true);
    
    Promise.all([
      userApiService.getMerchantOrders(session.id),
      userApiService.getAllFarmerProducts()
    ]).then(([ordersData, productsData]) => {
      setOrders(ordersData || []);
      setProducts(productsData || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [session, navigate]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(true), 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

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
  const renderTracking = (order) => {
    const isSampleOrder = order.sample_status && order.sample_status !== "none" && order.status === "pending_sample";
    
    if (isSampleOrder) {
      const sampleSteps = ["requested", "provided", "verified"];
      const currentSampleStatus = String(order.sample_status).toLowerCase();
      const currentIdx = sampleSteps.indexOf(currentSampleStatus);

      return (
        <div className="tracking-container" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce3ff' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>🧪 Sample Verification Tracking</h5>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
            <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', backgroundColor: '#ddd', zIndex: '1' }}></div>
            <div style={{ position: 'absolute', top: '15px', left: '0', width: `${(currentIdx / (sampleSteps.length - 1)) * 100}%`, height: '2px', backgroundColor: '#0056b3', zIndex: '2', transition: 'width 0.3s ease' }}></div>
            
            {sampleSteps.map((step, index) => {
              const isActive = index <= currentIdx;
              const isRejected = order.sample_status === 'rejected' && index === currentIdx;
              return (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: '3', flex: '1' }}>
                  <div style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '50%', 
                    backgroundColor: isRejected ? '#d32f2f' : (isActive ? '#0056b3' : '#fff'), 
                    border: `2px solid ${isRejected ? '#d32f2f' : (isActive ? '#0056b3' : '#ddd')}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#fff' : '#999',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '5px'
                  }}>
                    {isRejected ? '✗' : (isActive ? '✓' : index + 1)}
                  </div>
                  <span style={{ fontSize: '10px', textTransform: 'capitalize', color: isRejected ? '#d32f2f' : (isActive ? '#0056b3' : '#999'), fontWeight: isActive ? 'bold' : 'normal' }}>
                    {isRejected ? 'Rejected' : step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const steps = ["requested", "pending_price", "accepted", "paid", "dispatched", "delivered"];
    const currentStatus = String(order.status).toLowerCase();
    const isPaid = order.payment_status === "paid";
    
    // Adjust steps logic to include "paid" check
    let currentIdx = steps.indexOf(currentStatus);
    if (currentStatus === "accepted" && isPaid) {
      currentIdx = 3; // "paid" step
    } else if (currentIdx >= 3) {
      // already dispatched or delivered, so paid must be true
    }

    return (
      <div className="tracking-container" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
          <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', backgroundColor: '#ddd', zIndex: '1' }}></div>
          <div style={{ position: 'absolute', top: '15px', left: '0', width: `${(currentIdx / (steps.length - 1)) * 100}%`, height: '2px', backgroundColor: '#2e7d32', zIndex: '2', transition: 'width 0.3s ease' }}></div>
          
          {steps.map((step, index) => {
            const isActive = index <= currentIdx;
            return (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: '3', flex: '1' }}>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  backgroundColor: isActive ? '#2e7d32' : '#fff', 
                  border: `2px solid ${isActive ? '#2e7d32' : '#ddd'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#fff' : '#999',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {isActive ? '✓' : index + 1}
                </div>
                <span style={{ fontSize: '10px', textTransform: 'capitalize', color: isActive ? '#2e7d32' : '#999', fontWeight: isActive ? 'bold' : 'normal' }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
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
  const handlePaid = async (orderId, farmerId, amount, updatedOrder) => {
    try {
      // Payment status is already updated in the backend by Razorpay verification
      // No need to call updatePaymentStatus manually anymore.
      
      // Update order in UI
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, payment_status: "paid" } : o
        )
      );

      // 1) Send chat invoice (stored in localStorage, used by chat UI)
      userApiService.sendInvoiceMessageToFarmer(farmerId, orderId, amount);

      // 2) Generate downloadable PDF invoice
      if (updatedOrder) {
        userApiService.generatePDFInvoice(updatedOrder);
      }
    } catch (err) {
      console.error("Error processing payment success:", err);
      toast.error("An error occurred while finalizing payment.");
    }
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
                      <p>
                        <strong>Payment:</strong>{" "}
                        {o.payment_status === "paid"
                          ? "💰 Paid"
                          : o.status === "accepted"
                          ? "unpaid"
                          : "N/A"}
                      </p>

                      <div className="order-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {o.sample_status === 'provided' && (
                          <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                            <button
                              onClick={() => userApiService.updateOrderStatus(o.id, "pending_sample", { sample_status: "verified" }, loadOrders)}
                              style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
                            >
                              Verify Sample
                            </button>
                            <button
                              onClick={() => userApiService.updateOrderStatus(o.id, "cancelled", { sample_status: "rejected" }, loadOrders)}
                              style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
                            >
                              Reject & Cancel
                            </button>
                          </div>
                        )}

                        {o.sample_status === 'verified' && o.status === 'pending_sample' && (
                          <div style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                            {(() => {
                              const product = products.find(p => String(p.id) === String(o.product_id));
                              const unitPrice = product?.product_Unitprice || 0;
                              const currentQty = orderQuantities[o.id] || 0;
                              const estimatedTotal = currentQty * unitPrice;

                              return (
                                <>
                                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Final Order Qty:</label>
                                    <input 
                                      type="number" 
                                      min="1"
                                      max={product?.product_Qty || 1000}
                                      placeholder={`Available: ${product?.product_Qty || 'N/A'}`}
                                      value={orderQuantities[o.id] || ""}
                                      onChange={(e) => setOrderQuantities(prev => ({ ...prev, [o.id]: e.target.value }))}
                                      style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    />
                                  </div>
                                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#475569' }}>
                                    <strong>Unit Price:</strong> ₹{unitPrice} <br/>
                                    <strong>Estimated Total:</strong> <span style={{ color: '#2c6e49', fontWeight: 'bold' }}>₹{estimatedTotal}</span>
                                  </p>
                                  <button
                                    onClick={() => {
                                      const qty = orderQuantities[o.id];
                                      if (!qty || isNaN(qty) || qty < 1) {
                                        toast.error("Please enter a valid quantity");
                                        return;
                                      }
                                      userApiService.updateOrderStatus(o.id, "pending_price", { 
                                        quantity: Number(qty),
                                        totalPrice: estimatedTotal // Set initial estimated total price
                                      }, loadOrders);
                                    }}
                                    style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginTop: '5px' }}
                                  >
                                    Proceed to Full Order
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {/* Chat */}
                        <Link to="/merchant/chat" className="chat-btn" style={{ textDecoration: 'none', backgroundColor: '#2c6e49', color: '#fff', padding: '5px 15px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                          Chat
                        </Link>

                        <button
                          className="track-btn"
                          onClick={() => setTrackingOrder(trackingOrder === o.id ? null : o.id)}
                          style={{ backgroundColor: '#34495e', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {trackingOrder === o.id ? "Hide Track" : "Track Order"}
                        </button>

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
                        {o.status === "accepted" && (
                          o.payment_status === "paid" ? (
                            <button className="pay-btn disabled" disabled style={{ 
                              padding: '12px', borderRadius: '8px', border: 'none', 
                              backgroundColor: '#e2e8f0', color: '#718096', fontWeight: 'bold', width: '100%' 
                            }}>
                              Paid ✅
                            </button>
                          ) : (
                            <PaymentButton
                              amount={o.totalPrice}
                              orderData={{
                                existing_order_id: o.id,
                                merchant_id: session.id,
                                merchant_name: session.name
                              }}
                              onSuccess={(updatedOrder) => {
                                handlePaid(o.id, o.farmer_id, o.totalPrice, updatedOrder);
                              }}
                            />
                          )
                        )}


                        {/* Invoice */}
                        {o.payment_status === "paid" && (
                          <button
                            className="invoice-btn"
                            onClick={() => generateInvoice(o)}
                          >
                            Invoice
                          </button>
                        )}
                      </div>

                      {trackingOrder === o.id && renderTracking(o)}
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
