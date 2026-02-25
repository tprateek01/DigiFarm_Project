import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApiService } from "../../api/userApi";
import "../../styles/merchant/MerchantProducts.css";
import { toast } from "react-toastify";

export default function MerchantProducts() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session_data"));

  // ---------------- LOAD DATA ----------------
  const loadData = async () => {
    if (!session || session.role !== "merchant") {
      navigate("/login");
      return;
    }

    setLoading(true);

    userApiService.getAllFarmerProducts((productsData) => {
      setProducts(productsData || []);

      userApiService.getMerchantOrders(session.id, (ordersData) => {
        setOrders(ordersData || []);
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- CHECK IF ORDER ALREADY REQUESTED ----------------
  const isOrderRequested = (productId) => {
    return orders.some(
      (o) =>
        o.product_id === productId &&
        o.merchant_id === session.id &&
        (o.status === "requested" || o.status === "pending")
    );
  };

  // ---------------- PLACE ORDER ----------------
  const handlePlaceOrder = (product) => {
    if (isOrderRequested(product.id)) {
      toast.info("Already requested");
      return;
    }

    const order = {
      product_id: product.id,
      product_name: product.product_name,
      farmer_id: product.fk_farmer_id,
      farmer_name: product.farmerName,
      merchant_id: session.id,
      merchant_name: session.name,
      quantity: product.product_Qty,
      unit: product.product_Unit,
      totalPrice: product.product_Unitprice,
      status: "requested",
      created_date: new Date().toISOString(),
    };

    userApiService.createOrder(order, (newOrder) => {
      toast.success("Order requested!");

      // instantly update UI without waiting reload
      setOrders((prev) => [...prev, newOrder]);

      // optional: reload from server
      loadData();
    });
  };

  // ---------------- UI ----------------
  return (
    <div className="merchant-products-page">
      <header>
        <h1>Available Products</h1>
        <Link to="/merchant/dashboard">Back</Link>
      </header>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
      ) : (
        <div className="products-grid">
          {products.map((p) => {
            const requested = isOrderRequested(p.id);

            return (
              <div key={p.id} className="product-card">
                <h3>{p.product_name}</h3>

                <p>
                  <strong>Qty:</strong> {p.product_Qty} {p.product_Unit}
                </p>

                <p>
                  <strong>Price:</strong> ₹{p.product_Unitprice}
                </p>

                <span className={p.isAvailable ? "active" : "inactive"}>
                  {p.isAvailable ? "Available" : "Unavailable"}
                </span>

                <button
  className={
    !p.isAvailable
      ? "btn-unavailable"
      : requested
      ? "btn-requested"
      : "btn-place"
  }
  onClick={() => {
    if (!p.isAvailable) {
      toast.error("Product unavailable");
      return;
    }

    if (requested) {
      toast.info("Can't request new order until accepted");
      return;
    }

    handlePlaceOrder(p);
  }}
>
  {!p.isAvailable ? "Unavailable" : requested ? "Requested" : "Place Order"}
</button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
