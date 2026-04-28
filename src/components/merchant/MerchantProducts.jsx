import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../../api/userApi";
import "../../styles/merchant/MerchantProducts.css";
import { toast } from "react-toastify";

export default function MerchantProducts() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderQuantities, setOrderQuantities] = useState({});

  const navigate = useNavigate();
  const session = useMemo(
    () => JSON.parse(localStorage.getItem("session_data")),
    []
  );

  const loadData = useCallback(async () => {
    if (!session || session.role !== "merchant") {
      navigate("/login");
      return;
    }

    setLoading(true);

    const productsData = await userApiService.getAllFarmerProducts();
    setProducts(productsData || []);

    const ordersData = await userApiService.getMerchantOrders(session.id);
    setOrders(ordersData || []);
    setLoading(false);
  }, [session, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOrderRequested = (productId) => {
    return orders.some(
      (o) =>
        o.product_id === productId &&
        o.merchant_id === session.id &&
        (o.status === "requested" || o.status === "pending" || o.status === "accepted" || o.status === "dispatched" || o.status === "delivered" || o.status === "pending_price")
    );
  };

  const getSampleOrder = (productId) => {
    return orders.find(
      (o) =>
        o.product_id === productId &&
        o.merchant_id === session.id &&
        o.sample_status !== "none"
    );
  };

  const handleRequestSample = (product) => {
    const existingSample = getSampleOrder(product.id);
    if (existingSample) {
      toast.info("Sample already requested");
      return;
    }

    const order = {
      product_id: product.id,
      product_name: product.product_name || product.name,
      farmer_id: product.fk_farmer_id,
      farmer_name: product.farmerName || "Farmer",
      merchant_id: session.id,
      merchant_name: session.name,
      quantity: 1, // Default small quantity for sample
      unit: product.product_Unit,
      totalPrice: 0, // Sample might be free or handled separately
      status: "pending_sample",
      sample_status: "requested",
      payment_status: "unpaid",
      created_date: new Date().toISOString(),
    };

    userApiService.createOrder(order, (newOrder) => {
      toast.success("Sample request sent to farmer!");
      setOrders((prev) => [...prev, newOrder]);
      loadData();
    });
  };

  const handleQtyChange = (productId, qty, maxQty) => {
    if (qty === "") {
      setOrderQuantities(prev => ({ ...prev, [productId]: "" }));
      return;
    }

    const val = parseInt(qty);
    if (isNaN(val)) {
      setOrderQuantities(prev => ({ ...prev, [productId]: "" }));
    } else if (val < 1) {
      setOrderQuantities(prev => ({ ...prev, [productId]: 1 }));
    } else if (val > maxQty) {
      setOrderQuantities(prev => ({ ...prev, [productId]: maxQty }));
      toast.warning(`Maximum available quantity is ${maxQty}`);
    } else {
      setOrderQuantities(prev => ({ ...prev, [productId]: val }));
    }
  };

  const handlePlaceOrder = (product) => {
    toast.info("Please go to 'My Orders' to proceed with the full order after sample verification.");
    navigate("/merchant/orders");
  };

  return (
    <div className="merchant-products-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Available Products</h1>
        <Link to="/merchant/dashboard" className="btn-back" style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#2c6e49', color: '#fff' }}>Back</Link>
      </header>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
      ) : (
        <div className="products-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '1.5rem',
          width: '100%'
        }}>
          {products.map((p) => {
            const requested = isOrderRequested(p.id);
            const sampleOrder = getSampleOrder(p.id);
            const isSampleVerified = sampleOrder && sampleOrder.sample_status === 'verified';
            
            const displayImage = p.images && p.images.length > 0 ? p.images[0].image : p.image;
            const currentQtyStr = orderQuantities[p.id];
            const currentQty = (currentQtyStr === "" || currentQtyStr === undefined) ? 1 : parseInt(currentQtyStr);
            const totalPrice = currentQty * p.product_Unitprice;

            return (
              <div key={p.id} className="product-card">
                <img 
                  src={displayImage || "https://via.placeholder.com/320"} 
                  alt={p.product_name || p.name} 
                />
                <div className="product-info">
                  <h3>{p.product_name || p.name}</h3>

                  <p><strong>Available Quantity:</strong> {p.product_Qty} {p.product_Unit}</p>
                  <p><strong>Price:</strong> ₹{p.product_Unitprice} / {p.product_Unit}</p>
                  <p><strong>Farmer:</strong> {p.farmerName || "Farmer"} {p.farmerRating ? `(⭐${p.farmerRating.toFixed(1)})` : ""}</p>
                  <p><strong>Location:</strong> {p.farmerLocation || "N/A"}</p>
                  <p><strong>Mobile:</strong> {p.farmerMobile || "N/A"}</p>

                  {isSampleVerified && (
                    <div className="qty-selector">
                      <label>Order Qty:</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={p.product_Qty}
                        value={orderQuantities[p.id] !== undefined ? orderQuantities[p.id] : 1}
                        onChange={(e) => handleQtyChange(p.id, e.target.value, p.product_Qty)}
                        disabled={requested || p.isAvailable === false}
                      />
                      <p className="total-price">Estimated Total: ₹{totalPrice}</p>
                    </div>
                  )}

                  <span className={`status-badge ${p.isAvailable !== false ? "active" : "inactive"}`}>
                    {p.isAvailable !== false ? "Available" : "Unavailable"}
                  </span>

                  {p.isAvailable === false ? (
                    <button className="btn-unavailable" disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0', color: '#718096', fontWeight: '700' }}>Unavailable</button>
                  ) : requested ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-requested" disabled style={{ flex: 1 }}>Order Active</button>
                      <Link to="/merchant/orders" className="btn-chat" style={{ textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#2c6e49', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center' }}>Orders</Link>
                    </div>
                  ) : !sampleOrder ? (
                    <button 
                      className="btn-sample" 
                      onClick={() => handleRequestSample(p)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Request Sample
                    </button>
                  ) : sampleOrder.sample_status === 'requested' ? (
                    <button className="btn-sample-pending" disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#94a3b8', color: '#fff', fontWeight: '700' }}>Sample Requested</button>
                  ) : sampleOrder.sample_status === 'provided' ? (
                    <button className="btn-sample-pending" disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', fontWeight: '700' }}>Sample Provided (Pending Verification)</button>
                  ) : sampleOrder.sample_status === 'verified' ? (
                    <button 
                      className="btn-quote" 
                      onClick={() => handlePlaceOrder(p)}
                    >
                      Get Quote
                    </button>
                  ) : sampleOrder.sample_status === 'rejected' ? (
                    <button 
                      className="btn-sample" 
                      onClick={() => handleRequestSample(p)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Sample Rejected (Request Again)
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
