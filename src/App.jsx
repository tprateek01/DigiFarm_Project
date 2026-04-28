import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import FarmerRegister from "./components/farmer/FarmerRegister";
import MerchantRegister from "./components/merchant/MerchantRegister";
import OrderForm from './components/farmer/OrderForm';
import MerchantProfile from './components/merchant/MerchantProfile';
import Dashboard from "./components/merchant/MerchantDashboard";
import "./components/css/App.css";
import "./components/css/ModernOverrides.css";
import FarmerDashboard from './components/farmer/FarmerDashboard';
import FarmerProfile from './components/farmer/FarmerProfile';
import FarmerOrders from "./components/farmer/FarmerOrders";
import FarmerAddProduct from "./components/farmer/FarmerAddProduct";
import FarmerProductList from "./components/farmer/FarmerProductList";
import FarmerEditProduct from "./components/farmer/FarmerEditProduct";
import Toaster from "./components/alert/Toaster";
import FarmerProductCard from "./components/farmer/FarmerProductCard";
import FarmerSettings from "./components/farmer/FarmerSettings";
import MerchantProducts from "./components/merchant/MerchantProducts";
import MerchantOrders from "./components/merchant/MerchantOrders";
import MerchantLayout from "./components/merchant/MerchantLayout";
import FarmerLayout from "./components/farmer/FarmerLayout";
import FarmerChats from "./components/farmer/FarmersChats";
import MerchantChats from "./components/merchant/MerchantChats";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";

/* ✅ ADMIN IMPORTS */
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import Farmers from "./components/admin/Farmers";
import Merchants from "./components/admin/Merchants";
import Products from "./components/admin/Products";
import Complaints from "./components/admin/Complaints";
import Reports from "./components/admin/Reports";
import AdminLogin from "./components/admin/AdminLogin";
import Orders from "./components/admin/Orders";
import AddAdmin from "./components/admin/AddAdmin";


import TitleUpdater from "./TitleUpdater";
import MerchantSettings from "./components/merchant/MerchantSettings";
import RequireAuth from "./helper/RequireAuth";
import RedirectIfAuthenticated from "./helper/RedirectIfAuthenticated";

function App() {
  return (
    <React.Fragment>
      <TitleUpdater />
      <Toaster />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated
              destinationByRole={{
                farmer: "/farmer/dashboard",
                merchant: "/merchant/dashboard",
                admin: "/admin/dashboard",
              }}
            >
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated
              destinationByRole={{
                farmer: "/farmer/dashboard",
                merchant: "/merchant/dashboard",
                admin: "/admin/dashboard",
              }}
            >
              <Register />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register/farmer"
          element={
            <RedirectIfAuthenticated
              destinationByRole={{
                farmer: "/farmer/dashboard",
                merchant: "/merchant/dashboard",
                admin: "/admin/dashboard",
              }}
            >
              <FarmerRegister />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register/merchant"
          element={
            <RedirectIfAuthenticated
              destinationByRole={{
                farmer: "/farmer/dashboard",
                merchant: "/merchant/dashboard",
                admin: "/admin/dashboard",
              }}
            >
              <MerchantRegister />
            </RedirectIfAuthenticated>
          }
        />
        <Route path="/order-merchant" element={<OrderForm />} />
        <Route path="/Product_cart" element={<FarmerProductCard />} />
        <Route path="/add-product" element={<FarmerAddProduct />} />
        <Route path="/edit-product/:id" element={<FarmerEditProduct />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= FARMER ROUTES ================= */}
        <Route
          path="/farmer"
          element={
            <RequireAuth
              loginPath="/login"
              allowedRoles={["farmer"]}
              message="session-expired"
            >
              <FarmerLayout />
            </RequireAuth>
          }
        >

          <Route
            path="dashboard"
            element={<FarmerDashboard />}
          />

          <Route path="profile" element={<FarmerProfile />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="products" element={<FarmerProductList />} />
          <Route path="chat" element={<FarmerChats />} />
          <Route path="settings" element={<FarmerSettings />} />
        </Route>

        {/* ================= MERCHANT ROUTES ================= */}
        <Route
          path="/merchant"
          element={
            <RequireAuth
              loginPath="/login"
              allowedRoles={["merchant"]}
              message="session-expired"
            >
              <MerchantLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<MerchantProfile />} />
          <Route path="orders" element={<MerchantOrders />} />
          <Route path="chat" element={<MerchantChats />} />
          <Route path="product" element={<MerchantProducts />} />
          <Route path="settings" element={<MerchantSettings />} />
          
        </Route>

        {/* ================= ADMIN ROUTES ================= */}

        {/* Admin Login (Public) */}
        <Route
          path="/admin/login"
          element={
            <RedirectIfAuthenticated
              destinationByRole={{
                farmer: "/farmer/dashboard",
                merchant: "/merchant/dashboard",
                admin: "/admin/dashboard",
              }}
            >
              <AdminLogin />
            </RedirectIfAuthenticated>
          }
        />

        {/* Admin Protected Area */}
        <Route
          path="/admin"
          element={
            <RequireAuth
              loginPath="/admin/login"
              allowedRoles={["admin"]}
              message="session-expired"
            >
              <AdminLayout />
            </RequireAuth>
          }
        >

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="farmers" element={<Farmers />} />
          <Route path="merchants" element={<Merchants />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="reports" element={<Reports />} />
          <Route path="add-admin" element={<AddAdmin />} />

        </Route>

      </Routes>
    </React.Fragment>
  );
}

export default App;
