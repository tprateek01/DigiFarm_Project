// FileName: MultipleFiles/FarmerProductCard.jsx
import React from 'react';
import '../styles/Findex.css'; // Re-use general styles

const FarmerProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="product-card">
      <img src={product.img} alt={product.name} />
      <h3>{product.name}</h3>
      <p>Price: ₹{product.price}</p>
      <p>Quantity: {product.qty}</p>
      <p>Status: {product.status}</p>
      <div className="actions">
        <button className="btn btn-add" onClick={() => onEdit(product.id)}>Edit</button>
        <button className="btn btn-order" onClick={() => onDelete(product.id)}>Delete</button>
      </div>
    </div>
  );
};

export default FarmerProductCard;

