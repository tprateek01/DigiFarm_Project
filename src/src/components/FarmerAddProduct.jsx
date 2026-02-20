import React, { useState,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/order.css';
import { userApiService } from '../api/userApi';

import {toast} from "react-toastify";
import Toaster from './alert/Toaster';

const FarmerAddProduct = () => {
  const navigate = useNavigate();

  const [products,setProducts]=useState({
    productName:{
      value:"",
      hasError:false,
      errorMessage:"",
      style:"",
    },
    productCategory:{
      value:"",
      hasError:false,
      errorMessage:"",
      style:"",
    },
    productQuantity:{
      value:"",
      hasError:false,
      errorMessage:"",
      style:"",
    },
    productUnit:{
      value:"",
      hasError:false,
      errorMessage:"",
      style:"",
    },
    unitPrice:{
      value:"",
      hasError:false,
      errorMessage:"",
      style:"",
    },
    isAvailable:{
      value:"",
      hasError:false,
      errorMessage:"",
      style:"",
    },
  })


   


  

  // Assuming farmer ID comes from login/localStorage
  

  

  

  const handleSubmit =(e) => {
  e.preventDefault(); // Prevent default form submission

  // Validate all fields before submitting
  let hasError = false;
  const updatedProducts = { ...products };

  Object.keys(updatedProducts).forEach((key) => {
    const field = updatedProducts[key];
    if (
      (typeof field.value === 'string' && field.value.trim() === '') ||
      (typeof field.value === 'number' && isNaN(field.value)) ||
      (key === 'isAvailable' && !field.value)
    ) {
      updatedProducts[key] = {
        ...field,
        hasError: true,
        errorMessage: `${key} is required`,
        style: '2px solid red',
      };
      hasError = true;
    } else {
      updatedProducts[key] = {
        ...field,
        hasError: false,
        errorMessage: '',
        style: '',
      };
    }
  });

  setProducts(updatedProducts);

  if (hasError) {
    alert('Please fix errors before submitting');
    return;
  }

  // Proceed if no errors
   userApiService.AddProduct({
    product_name: products.productName.value,
    product_desc: '', // This field isn't defined in your state; fix if needed
    product_Qty: products.productQuantity.value,
    product_Unit: products.productUnit.value,
    product_Unitprice: products.unitPrice.value,
    product_Category: products.productCategory.value,
    fk_farmer_id:JSON.parse(window.localStorage.getItem("session_data"))["id"],
    farmerName:JSON.parse(window.localStorage.getItem("session_data"))["name"],
    created_date:new Date().toString(),
    updated_date:null,
    is_image_uploaded:false,

    
  });

  toast.success('Product added successfully');
  setTimeout(()=>{
  navigate("/product_list");},3000);

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
          style={{border:products.productName.hasError?products.productName.style:""}}
          value={products.productName.value}
          onChange={
            (e)=>{
              setProducts((prevState)=>{
              return{
                ...prevState,
                productName:{
          
                  value:e.target.value,
                  hasError:e.target.value.trim()==="",
                  errorMessage:"Name is required",
                  style:"2px solid red",
                  
                }
              }
              })
            }
          }

          required
          
        />
        <span style={{color:"red"}}>{products.productName.hasError?products.productName.errorMessage:""}</span>

        <label>Category</label>
        <select
        style={{border:products.productCategory.hasError?products.productCategory.style:""}}
         value={products.productCategory.value}
         onChange={(e)=>{
          setProducts((prevState)=>{
            return{
              ...prevState,
              productCategory:{
          
                  value:e.target.value,
                  hasError:e.target.value.trim()==="",
                  errorMessage:"Category is required",
                  style:"2px solid red",
                  
                }
            }
          })

         }}
          
          required
        >
          <option value="">Select Category</option>
          <option value="Grains">Grains</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Dairy">Dairy</option>
          <option value="Pulses">Pulses</option>
        </select>
         <span style={{color:"red"}}>{products.productCategory.hasError?products.productCategory.errorMessage:""}</span>

        <label>Quantity</label>
        <input
          type="number"
          style={{border:products.productQuantity.hasError?products.productQuantity.style:""}}
          value={products.productQuantity.value}
          onChange={
            (e)=>{
              setProducts((prevState)=>{
              return{
                ...prevState,
                productQuantity:{
          
                  value:e.target.value,
                  hasError:e.target.value.trim()==="",
                  errorMessage:"Quantity is required",
                  style:"2px solid red",
                  
                }
              }
              })
            }
          }
         
          required
        />
         <span style={{color:"red"}}>{products.productQuantity.hasError?products.productQuantity.errorMessage:""}</span>

        <label>Quantity Unit</label>
        <select
        style={{border:products.productUnit.hasError?products.productUnit.style:""}}
         value={products.productUnit.value}
         onChange={(e)=>{
          setProducts((prevState)=>{
            return{
              ...prevState,
              productUnit:{
          
                  value:e.target.value,
                  hasError:e.target.value.trim()==="",
                  errorMessage:"Unit is required",
                  style:"2px solid red",
                  
                }
            }
          })

         }}
          
          required
          
         
        >
          <option value="">Select Unit</option>
          <option value="Tonnes">Tonnes</option>
          <option value="kg">Kilograms</option>
          <option value="quintals">Quintals</option>
        </select>

        <span style={{color:"red"}}>{products.productUnit.hasError?products.productUnit.errorMessage:""}</span>

        <label>Unit Price (₹ per ton/kg/quintal)</label>
        <input
          type="number"
          style={{border:products.unitPrice.hasError?products.unitPrice.style:""}}
          value={products.unitPrice.value}
          onChange={
            (e)=>{
              setProducts((prevState)=>{
              return{
                ...prevState,
                unitPrice:{
          
                  value:e.target.value,
                  hasError:e.target.value.trim()==="",
                  errorMessage:"Unit Prize is required",
                  style:"2px solid red",
                  
                }
              }
              })
            }
          }
         
          required
        />
         <span style={{color:"red"}}>{products.unitPrice.hasError?products.unitPrice.errorMessage:""}</span>

        <label>Product Image</label>
        <input
          type="file"
          accept="image/*"
          
        />
        <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="isAvailableSwitch"
              checked={products.isAvailable.value}
              onChange={
            (e)=>{
              setProducts((prevState)=>{
              return{
                ...prevState,
                isAvailable:{
          
                  value:e.target.checked,
                  hasError:e.target.checked===false,
                  errorMessage:"Unit Prize is required",
                  style:"2px solid red",
                  
                }
              }
              })
            }
          }
         
           />
              <label className="form-check-label" htmlFor="isAvailableSwitch">
                Available for Sale
              </label>
            </div>

        <button type="submit">Add Product</button>
      </form>
    </div>
    
  );
};

export default FarmerAddProduct;