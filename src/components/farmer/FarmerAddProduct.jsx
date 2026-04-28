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
    productImage: { value: "", hasError: false, errorMessage: "", style: "" },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProducts(prev => ({
          ...prev, productImage: { value: reader.result, hasError: false, errorMessage: "", style: "" }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const updated = { ...products };

    Object.keys(updated).forEach((key) => {
      if (key === "isAvailable" || key === "productImage") return; // checkbox/image should not block submit

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
      category: products.productCategory.value,
      product_Category: products.productCategory.value,
      fk_farmer_id: session.id,
      farmerName: session.full_name || session.name,
      farmerLocation: session.location || "N/A",
      farmerMobile: session.mobile || session.phone || "N/A",
      status: "pending",
      created_date: new Date().toString(),
      updated_date: null,
      is_image_uploaded: false,
      isAvailable: products.isAvailable.value,
      image: products.productImage.value,
    }, () => {
      toast.success("Product added successfully");
      navigate("/farmer/products");
    });
  };

  const updateField = (field, value) => {
    setProducts((prev) => {
      const newState = {
        ...prev,
        [field]: {
          ...prev[field],
          value,
          hasError: false,
          errorMessage: "",
          style: "",
        },
      };
      return newState;
    });
  };

  return (
    <div className="auth-container" style={{maxWidth: "600px", margin: "40px auto"}}>
      <button className="back" onClick={() => navigate('/farmer/dashboard')} style={{marginBottom: '15px'}}>
        Back to Dashboard
      </button>

      <h2>List New Product</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={products.productName.value}
            style={{ border: products.productName.hasError ? products.productName.style : "" }}
            onChange={(e) => updateField("productName", e.target.value)}
          />
          <span style={{ color: "red", fontSize: '0.85em' }}>{products.productName.errorMessage}</span>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={products.productCategory.value}
            style={{ border: products.productCategory.hasError ? products.productCategory.style : "", width: "100%", padding: "10px", borderRadius: "5px" }}
            onChange={(e) => updateField("productCategory", e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Grains">Grains</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Dairy">Dairy</option>
            <option value="Pulses">Pulses</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            value={products.productQuantity.value}
            style={{ border: products.productQuantity.hasError ? products.productQuantity.style : "" }}
            onChange={(e) => updateField("productQuantity", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Quantity Unit</label>
          <select
            value={products.productUnit.value}
            style={{ border: products.productUnit.hasError ? products.productUnit.style : "", width: "100%", padding: "10px", borderRadius: "5px" }}
            onChange={(e) => updateField("productUnit", e.target.value)}
          >
            <option value="">Select Unit</option>
            <option value="Tonnes">Tonnes</option>
            <option value="kg">Kilograms</option>
            <option value="quintals">Quintals</option>
          </select>
        </div>

        <div className="form-group">
          <label>Unit Price (₹)</label>
          <input
            type="number"
            value={products.unitPrice.value}
            style={{ border: products.unitPrice.hasError ? products.unitPrice.style : "" }}
            onChange={(e) => updateField("unitPrice", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px', clear: 'both'}}>
          <input
            type="checkbox"
            style={{ width: "auto", margin: 0, padding: 0, display: 'inline-block', float: 'none' }}
            checked={products.isAvailable.value}
            onChange={(e) =>
              setProducts((prev) => ({
                ...prev,
                isAvailable: { value: e.target.checked, hasError: false, errorMessage: "", style: "" }
              }))
            }
          />
          <label style={{margin: 0, display: 'inline-block'}}>Available for Sale</label>
        </div>

        <button type="submit" style={{width: "100%"}}>Add Product</button>

      </form>
    </div>
  );
};

export default FarmerAddProduct;
