import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../api/userApi";
import "../styles/MerchantProducts.css";

export default function MerchantProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));

    if (!session || session.role !== "merchant") {
      alert("Unauthorized. Please login as merchant.");
      navigate("/login");
      return;
    }

    // Fetch all farmer products
    userApiService.getAllFarmerProducts(setProducts);
  }, [navigate]);

  // Safely filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const name = (p.product_name || "").toLowerCase();
    const category = (p.product_Category || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchSearch = name.includes(search) || category.includes(search);
    const matchCategory = categoryFilter === "all" || category === categoryFilter.toLowerCase();
    return matchSearch && matchCategory;
  });

  // Get unique categories for filter dropdown
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.product_Category).filter(Boolean)))
  ];

  return (
    <div className="merchant-products-page">
      <header className="products-header">
        <h1>Available Crops</h1>
        <Link to="/merchant/dashboard" className="btn-back">Back to Dashboard</Link>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="empty-msg">No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.images?.[0]?.image || "https://via.placeholder.com/320"}
                alt={product.product_name || "Product"}
              />
              <div className="product-details">
                <h3>{product.product_name || "Unnamed Product"}</h3>
                <p><strong>Qty:</strong> {product.product_Qty || 0} {product.product_Unit || "unit"}</p>
                <p><strong>Price:</strong> ₹{product.product_Unitprice || 0}</p>
                <p><strong>Category:</strong> {product.product_Category || "N/A"}</p>
                <span className={`status-badge ${product.isAvailable ? "active" : "inactive"}`}>
                  {product.isAvailable ? "Available" : "Unavailable"}
                </span>
                <button className="btn-primary" style={{ marginTop: "10px" }}>Place Order</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
