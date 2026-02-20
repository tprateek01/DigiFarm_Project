import React,{useEffect,useState} from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.css'; // Import the main CSS for navbar styles
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

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
        <h1>Merchant Dashboard</h1>
      </div>
      <Link className="profile-link" to="/merchant">
        <img src="https://via.placeholder.com/40" alt="Merchant" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{sessionData?sessionData.name:""}</span>
          <span style={{ fontSize: '12px', opacity: 0.95 }}>{sessionData?sessionData.company:""}</span>
        </div>
      </Link>
    </nav>
  );
};

export default Navbar;
