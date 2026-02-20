import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/order.css'; // Import order-specific CSS

const OrderForm = () => {
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [farmerName, setFarmerName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [farmerInfoVisible, setFarmerInfoVisible] = useState(false);
  const [farmerDetails, setFarmerDetails] = useState({
    img: "https://via.placeholder.com/80?text=Farmer",
    name: "Unknown Farmer",
    company: "",
    location: ""
  });

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = () => {
    const orderData = JSON.parse(localStorage.getItem("currentOrder"));
    if (orderData) {
      setCurrentOrder({ product: orderData, status: "Processing" });
      setFarmerName(orderData.farmer || '');
      setQuantity(orderData.qty || '');
      setAddress(''); // Clear address for new order
      setNotes(''); // Clear notes for new order

      setFarmerDetails({
        img: orderData.farmerImg || "https://via.placeholder.com/80?text=Farmer",
        name: orderData.farmer || "Unknown Farmer",
        company: orderData.company || "",
        location: orderData.location || ""
      });
      setFarmerInfoVisible(true);
    } else {
      // Fallback logic if "currentOrder" not found (e.g., direct access or old flow)
      const currentOrderId = localStorage.getItem("currentOrderId");
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      let order = null;
      if (currentOrderId) {
        order = orders.find(o => o.id === currentOrderId);
      }
      if (!order && orders.length) order = orders[orders.length - 1];

      if (order) {
        setCurrentOrder(order);
        setFarmerName(order.product.farmer || '');
        setQuantity(order.product.qty || '');
        setAddress(order.details?.address || '');
        setNotes(order.details?.notes || '');

        setFarmerDetails({
          img: order.product.farmerImg || "https://via.placeholder.com/80?text=Farmer",
          name: order.product.farmer || "Unknown Farmer",
          company: order.product.company || "",
          location: order.product.location || ""
        });
        setFarmerInfoVisible(true);
      } else {
        setCurrentOrder(null);
        setFarmerInfoVisible(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentOrder) {
      alert("No order to submit.");
      return;
    }

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let orderToSave = { ...currentOrder };

    // If it's a new order (from dashboard "Order" button)
    if (!orderToSave.id) {
      orderToSave.id = `ORD-${Date.now()}`; // Generate a unique ID
      orderToSave.createdAt = new Date().toISOString();
      orders.push(orderToSave);
    }

    const idx = orders.findIndex(o => o.id === orderToSave.id);
    if (idx === -1) {
      alert("Order not found in history. This should not happen for existing orders.");
      return;
    }

    // Update order with submitted details
    orders[idx].status = "Submitted";
    orders[idx].details = { address, notes, quantity, submittedAt: new Date().toISOString() };
    localStorage.setItem("orders", JSON.stringify(orders));

    localStorage.removeItem("currentOrderId");
    localStorage.removeItem("currentOrder");

    alert("Order submitted. Redirecting to merchant profile.");
    navigate("/merchant");
  };

  return (
    <div className="container">
      <button className="back" onClick={() => navigate('/merchant')}>Back to Profile</button>

      <h2>Order Form</h2>

      {farmerInfoVisible && (
        <div id="farmerInfo" className="farmer-info">
          <img src={farmerDetails.img} alt="Farmer Photo" id="farmerPhoto" />
          <div className="details">
            <span id="farmerName">{farmerDetails.name}</span>
            <span id="farmerCompany">{farmerDetails.company}</span>
            <span id="farmerLocation">{farmerDetails.location}</span>
          </div>
        </div>
      )}

      <div id="productInfo" className="info">
        {currentOrder ? (
          <>
            <strong>Product:</strong> {currentOrder.product.name} <br />
            <strong>Price:</strong> ₹{currentOrder.product.price} <br />
            <strong>Current status:</strong> {currentOrder.status}
          </>
        ) : (
          "No order selected."
        )}
      </div>

      {currentOrder && (
        <form id="orderForm" onSubmit={handleSubmit}>
          <label>Farmer</label>
          <input id="farmer" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} required />

          <label>Delivery Address</label>
          <textarea id="address" rows="3" value={address} onChange={(e) => setAddress(e.target.value)} required></textarea>

          <label>Quantity (e.g., 50kg)</label>
          <input id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />

          <label>Notes (optional)</label>
          <textarea id="notes" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>

          <button type="submit">Submit Order</button>
        </form>
      )}
    </div>
  );
};

export default OrderForm;
