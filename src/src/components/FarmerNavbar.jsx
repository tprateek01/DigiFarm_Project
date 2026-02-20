// FileName: MultipleFiles/FarmerNavbar.jsx
import React,{useState,useEffect} from 'react';
import { Link } from 'react-router-dom';
import '../styles/Findex.css'; // Re-use general styles
import { useNavigate } from 'react-router-dom';
const FarmerNavbar = () => {

  const [sessionData,setSessionData]=useState({});
    const navigate=useNavigate();

useEffect(function(){
        
        if(window.localStorage.getItem('session_data')){
            const session_data=JSON.parse(
                window.localStorage.getItem("session_data")
            );
            setSessionData(session_data);
        }

    },[]);


  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1>Farmer Dashboard</h1>
      </div>
      <div className="nav-right">
        <Link className="profile-link" to="/profile">
          <img src="https://via.placeholder.com/40?text=Farmer" alt="Farmer" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold' }}><b>{sessionData?sessionData.name:""}</b></span>
          </div>
        </Link>
        <Link className="btn btn-add" to="/orders" style={{ marginLeft: '15px' }}>My Orders</Link>
        <Link className="btn btn-order" to="/add-product" style={{ marginLeft: '10px' }}>Add Product</Link>
      </div>
    </nav>
  );
};

export default FarmerNavbar;

