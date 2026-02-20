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
import MerchantLayout from "./components/MerchantLayout";
import FarmerLayout from "./components/FarmerLayout";
import FarmerChats from "./components/FarmersChats";
import MerchantChats from "./components/MerchantChats";


function App(){
    return(<React.Fragment>
             <Toaster />
             <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/login"  element={<Login />} />
                
                <Route path="/register/farmer"  element={<FarmerRegister />} />
                <Route path="/register/merchant"  element={<MerchantRegister />} />
               
                <Route path="/order-merchant" element={<OrderForm />} />
         <Route path="/Product_cart" element={<FarmerProductCard/>}/>
         <Route path="/add-product" element={<FarmerAddProduct />} />
               
                

                <Route path="/farmer" element={<FarmerLayout />}>
  <Route path="/farmer/dashboard" element={<ProtectedRoute endPoint={"/login"} message={"session-expired"}>
        <FarmerDashboard /> </ProtectedRoute>} /> {/* Default route for farmer dashboard */}
                <Route path="profile" element={<FarmerProfile />} />
                <Route path="orders" element={<FarmerOrders />} />
                
                <Route path="products" element={<FarmerProductList />} />
                <Route path="/farmer/chat" element={<FarmerChats />} />
              
                <Route path="settings" element={<FarmerSettings/>}/>
</Route>
                
                

                
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<MerchantProfile />} />
          <Route path="/merchant/orders" element={<MerchantOrders />} />
          <Route path="/merchant/chat" element={<MerchantChats />} />
          <Route path="/merchant/product" element={<MerchantProducts />} />
        </Route>
      
                
        {/* Add a route for editing products if needed, e.g., <Route path="/edit-product/:id" element={<FarmerEditProduct />} /> */}
               </Routes>        
               
    </React.Fragment>);
}

export default App;