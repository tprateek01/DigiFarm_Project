import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/farmer/order.css';
import { userApiService } from '../../api/userApi';
import { toast } from "react-toastify";

const FarmerEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [products, setProducts] = useState({
    productName: { value: "", hasError: false, errorMessage: "", style: "" },
    productCategory: { value: "", hasError: false, errorMessage: "", style: "" },
    productQuantity: { value: "", hasError: false, errorMessage: "", style: "" },
    productUnit: { value: "", hasError: false, errorMessage: "", style: "" },
    unitPrice: { value: "", hasError: false, errorMessage: "", style: "" },
    isAvailable: { value: true, hasError: false, errorMessage: "", style: "" },
    productImage: { value: "", hasError: false, errorMessage: "", style: "" },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await userApiService.getProductById(id);
        if (productData) {
          const status = String(productData.status || "pending").toLowerCase();
          if (status !== 'approved') {
            toast.error("You cannot edit a product until it is approved by admin.");
            navigate("/farmer/products");
            return;
          }
          setProducts({
            productName: { value: productData.product_name || productData.name || "", hasError: false, errorMessage: "", style: "" },
            productCategory: { value: productData.product_Category || productData.category || "", hasError: false, errorMessage: "", style: "" },
            productQuantity: { value: productData.product_Qty || "", hasError: false, errorMessage: "", style: "" },
            productUnit: { value: productData.product_Unit || "", hasError: false, errorMessage: "", style: "" },
            unitPrice: { value: productData.product_Unitprice || productData.price || "", hasError: false, errorMessage: "", style: "" },
            isAvailable: { value: productData.isAvailable !== false, hasError: false, errorMessage: "", style: "" },
            productImage: { value: productData.image || "", hasError: false, errorMessage: "", style: "" },
          });
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        toast.error("Error loading product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const updated = { ...products };

    Object.keys(updated).forEach((key) => {
      if (key === "isAvailable" || key === "productImage") return;

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
      toast.error("Please fix errors before submitting");
      return;
    }

    const updateData = {
      product_name: products.productName.value,
      name: products.productName.value, // added for consistency
      product_Qty: products.productQuantity.value,
      product_Unit: products.productUnit.value,
      product_Unitprice: products.unitPrice.value,
      price: products.unitPrice.value, // added for consistency
      category: products.productCategory.value,
      product_Category: products.productCategory.value,
      isAvailable: products.isAvailable.value,
      image: products.productImage.value,
      updated_date: new Date().toString(),
    };

    try {
      await userApiService.patchProduct(id, updateData);
      toast.success("Product updated successfully");
      navigate("/farmer/products");
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("Error updating product");
    }
  };

  const updateField = (field, value) => {
    setProducts((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        hasError: false,
        errorMessage: "",
        style: "",
      },
    }));
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading product details...</p>;

  return (
    <div className="auth-container" style={{maxWidth: "600px", margin: "40px auto"}}>
      <button className="back" onClick={() => navigate('/farmer/products')} style={{marginBottom: '15px'}}>
        Back to Products
      </button>

      <h2>Edit Product</h2>

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
          {products.productImage.value && (
            <img src={products.productImage.value} alt="Preview" style={{width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px'}} />
          )}
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

        <button type="submit" style={{width: "100%"}}>Save Changes</button>

      </form>
    </div>
  );
};

export default FarmerEditProduct;
