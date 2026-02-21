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
                <button className="delete-btn" onClick={() => handleDelete(order.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;