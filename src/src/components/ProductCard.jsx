import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/index.css'; // Custom styles
import { userApiService } from '../api/userApi';

export default function Home_M() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    userApiService.getAllProducts(setProducts);
  }, []);

  const handleAddToCart = (product) => {
    console.log("Requesting quote for:", product);
    // Add to cart logic here
  };

  const handleOrderProduct = (product) => {
    localStorage.setItem("currentOrder", JSON.stringify(product));
    navigate("/order");
  };
  


  return (
    <div className="product-list">
      {products.length === 0 ? (
        <p>Loading products...</p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onOrder={handleOrderProduct}
          />
        ))
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart, onOrder }) {
  return (
    <div className="product-card">
      <img
        src={product.image || "https://via.placeholder.com/150"}
        alt={product.product_name}
        className="product-image"
      />
      <NavLink to={`/products/more-info/${product.id}`}>
      <h3>{product.product_name}</h3>
      </NavLink>
      <p><strong>Farmer:</strong> {product.farmerName}</p>
      <p><strong>Price:</strong> ₹{product.product_Unitprice}</p>
      <p><strong>Quantity:</strong> {product.product_Qty}</p>
      <div className="actions">
        <button className="btn btn-add" onClick={() => onAddToCart(product)}>
          Get Quote
        </button>
        <button className="btn btn-order" onClick={() => onOrder(product)}>
          Farmer Details
        </button>
      </div>
    </div>
  );
}
