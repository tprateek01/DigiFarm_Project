import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";
import "./admin.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    userApiService.getAllOrdersAdmin().then((data) => {
      // Sorting by date so newest orders appear first
      const sorted = (data || []).sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
      setOrders(sorted);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this order record?")) {
      await userApiService.deleteOrderAdmin(id);
      fetchOrders();
    }
  };

  const handleStatusUpdate = async (id, status, extraData = {}) => {
    try {
      await userApiService.updateOrderStatus(id, status, extraData);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="orders-mgmt-container">
      <div className="header-flex">
        <h1>Order Management</h1>
        <button className="refresh-btn" onClick={fetchOrders}>Refresh Data</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Farmer</th>
            <th>Merchant</th>
            <th>Total Price</th>
            <th>Sample Status</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.product_name} <br/> <small>{order.quantity} {order.unit}</small></td>
              <td>{order.farmer_name}</td>
              <td>{order.merchant_name}</td>
              <td className="price-text">₹{order.totalPrice}</td>
              <td>
                <span className={`status-pill ${order.sample_status || 'none'}`}>
                  {order.sample_status === 'none' ? 'N/A' : order.sample_status}
                </span>
              </td>
              <td>
                <span className={`status-pill ${order.status}`}>
                  {order.status}
                </span>
              </td>
              <td>
                 <span className={`payment-pill ${order.payment_status || 'pending'}`}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {order.status === "accepted" && order.payment_status === "paid" && (
                    <button 
                      className="status-btn dispatch" 
                      onClick={() => handleStatusUpdate(order.id, "dispatched")}
                      style={{ backgroundColor: '#2e7d32', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Dispatch
                    </button>
                  )}
                  {order.status === "dispatched" && (
                    <button 
                      className="status-btn deliver" 
                      onClick={() => handleStatusUpdate(order.id, "delivered")}
                      style={{ backgroundColor: '#1b5e20', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Deliver
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => handleDelete(order.id)} style={{ color: 'maroon', backgroundColor: '#ffebee', padding: '5px 10px', border: '1px solid maroon', borderRadius: '4px' }}>
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;