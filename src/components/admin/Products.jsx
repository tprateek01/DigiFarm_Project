import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Products = () => {
  const [products, setProducts] = useState([]);

  // Load products on mount
  const loadProducts = () => {
    userApiService.getAllProductsAdmin().then((data) => {
      // Filter out invalid items (like your first empty object in the array)
      const validProducts = data.filter(p => p.product_name || p.name);
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

  const handleRemoveProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently remove this product?")) return;
    try {
      await userApiService.deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product");
    }
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
              <td>{product.product_name || product.name}</td>
              <td>{product.farmerName || product.farmer_name || "N/A"}</td>
              <td>{product.product_Category || product.category || "N/A"}</td>
              <td>₹{product.product_Unitprice || product.price} / {product.product_Unit || "kg"}</td>
              <td>
                <span className={`status-badge ${(product.status || 'pending').toLowerCase()}`}>
                  {product.status || "Pending"}
                </span>
              </td>
              <td>
                {(product.status || "").toLowerCase() !== "approved" && (
                  <button 
                    onClick={() => handleStatusUpdate(product.id, "approved")}
                    style={{ color: 'lightgreen', marginRight: '10px' }}
                  >
                    Approve
                  </button>
                )}
                <button 
                  onClick={() => handleRemoveProduct(product.id)}
                  style={{ color: 'maroon', backgroundColor: '#ffebee', padding: '5px 10px', border: '1px solid maroon', borderRadius: '4px' }}
                >
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

export default Products;