import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { userApiService } from "../../api/userApi";
import "../../styles/farmer/Forder.css";
import { toast } from "react-toastify";

export default function FarmerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [openMerchant, setOpenMerchant] = useState(null);
  const [editingPrice, setEditingPrice] = useState({}); // orderId -> price
  const [trackingOrder, setTrackingOrder] = useState(null); // id of the order being tracked
  const [products, setProducts] = useState([]); // Store products for price calculation

  const session = useMemo(
    () => JSON.parse(localStorage.getItem("session_data")),
    []
  );

  const loadOrders = useCallback((silent = false) => {
    if (!session || session.role !== "farmer") {
      alert("Unauthorized. Please login.");
      navigate("/login");
      return;
    }
    if (!silent) setOrders([]); // Optional: clear for non-silent
    
    Promise.all([
      userApiService.getFarmerOrders(session.id),
      userApiService.getAllFarmerProducts()
    ]).then(([ordersData, productsData]) => {
      setOrders(ordersData || []);
      setProducts(productsData || []);
    }).catch(err => {
      console.error(err);
    });
  }, [session, navigate]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(true), 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const updateStatus = async (id, status, extraData = {}) => {
    console.log(`Updating order ${id} to ${status}`);
    try {
      const res = await userApiService.updateOrderStatus(id, status, extraData);
      console.log("Order update response:", res);
      if (res) {
        toast.success(`Order ${status}!`);
        loadOrders();
      } else {
        toast.error("Failed to update status (no response)");
      }
    } catch (err) {
      console.error("updateStatus error:", err);
      toast.error("Failed to update status");
    }
  };

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
      <div className="tracking-container" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
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

                      <div className="price-edit" style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
                        {(() => {
                          const product = products.find(p => String(p.id) === String(o.product_id));
                          const unitPrice = product?.product_Unitprice || 0;
                          const estimatedTotal = (o.quantity || 0) * unitPrice;

                          return (
                            <>
                              <div style={{ marginBottom: '8px', fontSize: '13px', color: '#555' }}>
                                <strong>Merchant Requested:</strong> {o.quantity} {o.unit} <br/>
                                <strong>Your Unit Price:</strong> ₹{unitPrice} <br/>
                                <strong>Suggested Total:</strong> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>₹{estimatedTotal}</span>
                              </div>
                              
                              {(String(o.status).toLowerCase() === "requested" || String(o.status).toLowerCase() === "pending" || String(o.status).toLowerCase() === "pending_price") && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Set Final Price: ₹</label>
                                  <input
                                    type="number"
                                    placeholder={editingPrice[o.id] || estimatedTotal}
                                    value={editingPrice[o.id] || ""}
                                    onChange={(e) => setEditingPrice(prev => ({ ...prev, [o.id]: e.target.value }))}
                                    style={{ width: '100px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                  />
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

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

                      <div className="order-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        {o.sample_status === 'requested' && o.status === 'pending_sample' && (
                          <button
                            className="accept-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateStatus(o.id || o._id, "pending_sample", { sample_status: "provided" });
                            }}
                            style={{ backgroundColor: '#f59e0b' }}
                          >
                            Provide Sample
                          </button>
                        )}

                        {String(o.status).toLowerCase() === "pending_price" && (
                          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <button
                              className="accept-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const orderId = o.id || o._id;
                                const extraData = {};
                                if (editingPrice[orderId]) {
                                  extraData.totalPrice = Number(editingPrice[orderId]);
                                }
                                updateStatus(orderId, "accepted", extraData);
                              }}
                              style={{ backgroundColor: '#1976d2', flex: 1 }}
                            >
                              Set Final Price
                            </button>
                            <button
                              className="chat-btn"
                              onClick={() => navigate("/farmer/chat")}
                              style={{ backgroundColor: '#1b5e20', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', flex: 1 }}
                            >
                              Chat with Merchant
                            </button>
                          </div>
                        )}

                        {(String(o.status).toLowerCase() === "requested" || String(o.status).toLowerCase() === "pending") && (
                          <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                            <button
                              className="accept-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const orderId = o.id || o._id;
                                const extraData = {};
                                if (editingPrice[orderId]) {
                                  extraData.totalPrice = Number(editingPrice[orderId]);
                                }
                                updateStatus(orderId, "accepted", extraData);
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="reject-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const orderId = o.id || o._id;
                                updateStatus(orderId, "rejected");
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {(String(o.status).toLowerCase() === "accepted" || String(o.status).toLowerCase() === "requested" || String(o.status).toLowerCase() === "pending") && (
                          <button
                            className="chat-btn"
                            onClick={() => navigate("/farmer/chat")}
                            style={{ backgroundColor: '#1b5e20', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}
                          >
                            Chat
                          </button>
                        )}

                        <button
                          className="track-btn"
                          onClick={() => setTrackingOrder(trackingOrder === o.id ? null : o.id)}
                          style={{ backgroundColor: '#34495e', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                          {trackingOrder === o.id ? "Hide Track" : "Track Order"}
                        </button>
                      </div>

                      {trackingOrder === o.id && renderTracking(o)}
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
