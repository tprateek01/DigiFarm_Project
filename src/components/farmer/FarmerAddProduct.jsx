import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/farmer/order.css';
import { userApiService } from '../../api/userApi';
import { toast } from "react-toastify";

const FarmerAddProduct = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState({
    productName: { value: "", hasError: false, errorMessage: "", style: "" },
    productCategory: { value: "", hasError: false, errorMessage: "", style: "" },
    productQuantity: { value: "", hasError: false, errorMessage: "", style: "" },
    productUnit: { value: "", hasError: false, errorMessage: "", style: "" },
    unitPrice: { value: "", hasError: false, errorMessage: "", style: "" },

    // ✅ default TRUE (available)
    isAvailable: { value: true, hasError: false, errorMessage: "", style: "" },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const updated = { ...products };

    Object.keys(updated).forEach((key) => {
      if (key === "isAvailable") return; // checkbox should not block submit

      const field = updated[key];
      if (field.value.toString().trim() === "") {
        updated[key] = {
          ...field,
          hasError: true,
          errorMessage: `${key} is required`,
          style: "2px solid red",
        };
        hasError = true;
      } else {
        updated[key] = { ...field, hasError: false, errorMessage: "", style: "" };
      }
    });

    setProducts(updated);

    if (hasError) {
      alert("Please fix errors before submitting");
      return;
    }

    const session = JSON.parse(localStorage.getItem("session_data"));

    userApiService.AddProduct({
      product_name: products.productName.value,
      product_desc: "",
      product_Qty: products.productQuantity.value,
      product_Unit: products.productUnit.value,
      product_Unitprice: products.unitPrice.value,
      product_Category: products.productCategory.value,
      fk_farmer_id: session.id,
      farmerName: session.name,
      created_date: new Date().toString(),
      updated_date: null,
      is_image_uploaded: false,

      // ✅ THIS FIXES YOUR BUG
      isAvailable: products.isAvailable.value,
    });

    toast.success("Product added successfully");

    setTimeout(() => {
      navigate("/product_list");
    }, 2000);
  };

  const updateField = (field, value) => {
    setProducts((prev) => ({
      ...prev,
      [field]: {
        value,
        hasError: value.toString().trim() === "",
        errorMessage: `${field} is required`,
        style: "2px solid red",
      },
    }));
  };

  return (
    <div className="container">
      <button className="back" onClick={() => navigate('/farmer/dashboard')}>
        Back to Dashboard
      </button>

      <h2>List New Product</h2>

      <form onSubmit={handleSubmit}>

        <label>Product Name</label>
        <input
          type="text"
          value={products.productName.value}
          style={{ border: products.productName.hasError ? products.productName.style : "" }}
          onChange={(e) => updateField("productName", e.target.value)}
        />
        <span style={{ color: "red" }}>{products.productName.errorMessage}</span>

        <label>Category</label>
        <select
          value={products.productCategory.value}
          style={{ border: products.productCategory.hasError ? products.productCategory.style : "" }}
          onChange={(e) => updateField("productCategory", e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Grains">Grains</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Dairy">Dairy</option>
          <option value="Pulses">Pulses</option>
        </select>

        <label>Quantity</label>
        <input
          type="number"
          value={products.productQuantity.value}
          style={{ border: products.productQuantity.hasError ? products.productQuantity.style : "" }}
          onChange={(e) => updateField("productQuantity", e.target.value)}
        />

        <label>Quantity Unit</label>
        <select
          value={products.productUnit.value}
          style={{ border: products.productUnit.hasError ? products.productUnit.style : "" }}
          onChange={(e) => updateField("productUnit", e.target.value)}
        >
          <option value="">Select Unit</option>
          <option value="Tonnes">Tonnes</option>
          <option value="kg">Kilograms</option>
          <option value="quintals">Quintals</option>
        </select>

        <label>Unit Price</label>
        <input
          type="number"
          value={products.unitPrice.value}
          style={{ border: products.unitPrice.hasError ? products.unitPrice.style : "" }}
          onChange={(e) => updateField("unitPrice", e.target.value)}
        />

        <label>Product Image</label>
        <input type="file" accept="image/*" />

        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={products.isAvailable.value}
            onChange={(e) =>
              setProducts((prev) => ({
                ...prev,
                isAvailable: { value: e.target.checked, hasError: false, errorMessage: "", style: "" }
              }))
            }
          />
          <label>Available for Sale</label>
        </div>

        <button type="submit">Add Product</button>

      </form>
    </div>
  );
};

export default FarmerAddProduct;
