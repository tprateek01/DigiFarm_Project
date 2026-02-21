import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Products = () => {
  const [products, setProducts] = useState([]);

  // Load products on mount
  const loadProducts = () => {
    userApiService.getAllProductsAdmin().then((data) => {
      // Filter out invalid items (like your first empty object in the array)
      const validProducts = data.filter(p => p.product_name);
      setProducts(validProducts);
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    await userApiService.updateProductStatus(id, newStatus);
    // Refresh list after update
    loadProducts();
  };

  return (
    <div className="products-mgmt">
      <h1>Products Management</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Farmer</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.product_name}</td>
              <td>{product.farmerName || "N/A"}</td>
              <td>{product.product_Category}</td>
              <td>₹{product.product_Unitprice} / {product.product_Unit}</td>
              <td>
                <span className={`status-badge ${product.status || 'pending'}`}>
                  {product.status || "Pending"}
                </span>
              </td>
              <td>
                {product.status !== "Approved" && (
                  <button 
                    onClick={() => handleStatusUpdate(product.id, "Approved")}
                    style={{ color: 'lightgreen', marginRight: '10px' }}
                  >
                    Approve
                  </button>
                )}
                {product.status !== "Rejected" && (
                  <button 
                    onClick={() => handleStatusUpdate(product.id, "Rejected")}
                    style={{ color: 'maroon' }}
                  >
                    Reject
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;