import React from 'react'
import { Link } from 'react-router-dom';
import '../styles/register.css';

const Register = () => {
  return (
    <React.Fragment>
    <div className="hero">
        <div className="hero1">
            <Link to="/register/farmer" className="actionbtn primary">
                Register as a Farmer
            </Link>
            <Link to="/register/merchant" className="actionbtn secondary">
                Register as a Merchant
            </Link>
        </div>
    </div>
    </React.Fragment>
  )
}

export default Register;