import React from "react";
import Home from "./components/Home";
import Login from "./components/Login";
import {Routes,Route} from "react-router-dom";
import FarmerRegister from "./components/FarmerRegister";
import MerchantRegister from "./components/MerchantRegister";
import OrderForm from './components/OrderForm';
import MerchantProfile from './components/MerchantProfile';
import Dashboard from "./components/MerchantDashboard";
import "./components/css/App.css";
import FarmerDashboard from './components/FarmerDashboard';
import FarmerProfile from './components/FarmerProfile';
import FarmerOrders from './components/FarmerOrders';
import FarmerAddProduct from './components/FarmerAddProduct';
import FarmerProductList from './components/FarmerProductList';
import ProtectedRoute, { checkSession } from "./helper/ProtectedRoutes";
import Toaster from "./components/alert/Toaster";
import FarmerProductCard from "./components/FarmerProductCard";
import FarmerSettings from "./components/FarmerSettings";
import MerchantProducts from "./components/MerchantProducts";
import MerchantOrders from "./components/MerchantOrders";


function App(){
    return(<React.Fragment>
             <Toaster />
             <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/login"  element={<Login />} />
                <Route path="/merchant/dashboard"  element={<Dashboard />} />
                <Route path="/register/farmer"  element={<FarmerRegister />} />
                <Route path="/register/merchant"  element={<MerchantRegister />} />
                <Route path="/merchant/profile" element={<MerchantProfile />} />
                <Route path="/order-merchant" element={<OrderForm />} />
                <Route path="/farmer/dashboard" element={<ProtectedRoute endPoint={"/login"} message={"session-expired"}>
        <FarmerDashboard /> </ProtectedRoute>} /> {/* Default route for farmer dashboard */}
                <Route path="/profile" element={<FarmerProfile />} />
                <Route path="/order" element={<FarmerOrders />} />
                <Route path="/add-product" element={<FarmerAddProduct />} />
                <Route path="/product_list" element={<FarmerProductList />} />
                <Route path="/Product_cart" element={<FarmerProductCard/>}/>
                <Route path="/farmer/settings" element={<FarmerSettings/>}/>
                <Route path="/merchant/product" element={<MerchantProducts />} />
                <Route path="/merchant/orders" element={<MerchantOrders />} />
        {/* Add a route for editing products if needed, e.g., <Route path="/edit-product/:id" element={<FarmerEditProduct />} /> */}
               </Routes>        
               
    </React.Fragment>);
}

export default App;