import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";
import { userApiService } from "../../api/userApi";

import API_URL from "../../config/apiConfig";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [farmerName, setFarmerName] = useState("");
  const [prices, setPrices] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [landArea, setLandArea] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState([0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("session_data"));
        if (!session) return;

        setFarmerName(session.name);

        const allUsers = await userApiService.getAllUsers();
        const me = allUsers.find(u => u.id === session.id);
        setIsActive(me ? me.isActive !== false : true);
        setEarnings(me?.earnings || 0);
        setLandArea(me?.land_area || 0);

        await userApiService.getFarmerProducts(session.id, (data) => {
          setProducts(data || []);
        });

        const live = await userApiService.getLivePrices();
        setPrices(live || []);

        const orders = await userApiService.getFarmerOrders(session.id);
        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        
        // Simple monthly aggregation for the chart
        const monthly = [0, 0, 0, 0]; // Jan, Feb, Mar, Apr (example)
        deliveredOrders.forEach(o => {
          const date = new Date(o.created_date);
          const month = date.getMonth();
          if (month < 4) monthly[month] += o.totalPrice || 0;
        });
        setMonthlyEarnings(monthly);

      } catch (err) {
        console.error("Farmer dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  const activeProducts = products.filter(p => p?.isAvailable);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Earnings",
        data: monthlyEarnings,
        backgroundColor: "#4a7a2f"
      }
    ]
  };

  return (
    <>
      <header className="main-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Welcome, {farmerName}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "bold", color: isActive ? "#2e7d32" : "#d32f2f" }}>
            {isActive ? "Profile: Public" : "Profile: Hidden"}
          </span>
          <button 
            onClick={async () => {
              const session = JSON.parse(localStorage.getItem("session_data"));
              try {
                await fetch(`${API_URL}/user/${session.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: !isActive })
                });
                setIsActive(!isActive);
                alert(`Your profile is now ${!isActive ? "public" : "hidden"}`);
              } catch (err) {
                console.error("Toggle error", err);
              }
            }}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", backgroundColor: isActive ? "#ffb74d" : "#81c784", color: "#fff" }}
          >
            {isActive ? "Go Offline/Hide" : "Go Online/Show"}
          </button>
        </div>
      </header>

      <section className="content-section">

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h4>Active Listings</h4>
            <p>{activeProducts.length}</p>
          </div>

          <div className="stat-card">
            <h4>Total Products</h4>
            <p>{products.length}</p>
          </div>

          <div className="stat-card">
            <h4>Earnings</h4>
            <p>₹{earnings}</p>
          </div>

          <div className="stat-card">
            <h4>Land Area</h4>
            <p>{landArea} Acres</p>
          </div>

          <div className="stat-card">
            <h4>Chat</h4>
            <p>Open Chats</p>
          </div>
        </div>

        {/* Prices */}
        <div className="dashboard-box">
          <h3>Live Prices</h3>

          <div className="price-grid">
            {prices.length === 0 ? (
              <p className="empty-msg">No live prices available.</p>
            ) : (
              prices.map((p, i) => (
              <div key={i} className="price-card">
                <h4>{p.crop}</h4>
                <p>₹{p.price}/kg</p>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics */}
        <div className="dashboard-box">
          <h3>Earnings Analytics</h3>
          <Bar data={chartData} />
        </div>

        {/* Products */}
        <div className="dashboard-box">
          <h3>My Listed Products</h3>

          {products.length === 0 ? (
            <p className="empty-msg">No products listed yet.</p>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <article key={product.id} className="product-card">
                  <div style={{ position: 'relative' }}>
                    <img
                      src={
                        product?.images && product.images.length > 0
                          ? product.images[0].image
                          : product.image || "https://via.placeholder.com/320"
                      }
                      alt={product.product_name}
                    />
                    <span style={{ 
                      position: 'absolute', top: '10px', right: '10px',
                      fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: String(product.status || "").toLowerCase() === 'approved' ? '#e8f5e9' : String(product.status || "").toLowerCase() === 'rejected' ? '#ffebee' : '#fff3e0',
                      color: String(product.status || "").toLowerCase() === 'approved' ? '#2e7d32' : String(product.status || "").toLowerCase() === 'rejected' ? '#c62828' : '#ef6c00',
                      fontWeight: 'bold', border: '1px solid currentColor'
                    }}>
                      {product.status || 'Pending'}
                    </span>
                  </div>

                  <div className="product-details">
                    <h3>{product.product_name}</h3>
                    <p>
                      <strong>Qty:</strong>{" "}
                      {product.product_Qty} {product.product_Unit}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹{product.product_Unitprice}
                    </p>

                    <span
                      className={`status-badge ${
                        product.isAvailable ? "active" : "inactive"
                      }`}
                    >
                      {product.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </section>
    </>
  );
}
