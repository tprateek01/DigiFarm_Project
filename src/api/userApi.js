import config from "../config/config.json";
import { jsPDF } from "jspdf";

const defaultHeaders = {
  "Content-Type": "application/json;charset=utf-8",
};

const userApiService = {
  // ----------------- Registration -----------------
  RegisterFarmer: async function (farmerFormData) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/user`, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(farmerFormData),
        mode: "cors",
      });
      const data = await res.json();
      if (data?.id) window.alert("Farmer registered successfully");
      else window.alert("Registration failed");
    } catch (err) {
      console.error(err);
      window.alert("Oops! Error, try later");
    }
  },

  RegisterMerchant: async function (merchantFormData) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/user`, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(merchantFormData),
        mode: "cors",
      });
      const data = await res.json();
      if (data?.id) window.alert("Merchant registered successfully");
      else window.alert("Registration failed");
    } catch (err) {
      console.error(err);
      window.alert("Oops! Error, try later");
    }
  },

  // ----------------- Login -----------------
  login: async function (credentials, role, gotoDashboard) {
    try {
      const res = await fetch("/server/data.json");
      const jsonData = await res.json();
      const roleData = jsonData.user.filter(
        (u) => (u.role || u.role_name || "").toLowerCase() === role.toLowerCase()
      );
      const matchedUser = roleData.find(
        (u) =>
          (u.email === credentials.identifier || u.mobile === credentials.identifier) &&
          u.password === credentials.password
      );
      if (matchedUser) gotoDashboard(matchedUser);
      else window.alert("Invalid credentials for " + role);
    } catch (err) {
      console.error(err);
      window.alert("Error fetching credentials");
    }
  },

  // ----------------- Products -----------------
  AddProduct: async function (productData, callback) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/products`, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(productData),
        mode: "cors",
      });
      const data = await res.json();
      if (callback) callback(data);
    } catch (err) {
      console.error(err);
      window.alert("Oops! Error adding product. Try again later.");
    }
  },

  deleteProduct: async function (productId) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/products/${productId}`, {
        method: "DELETE",
        headers: defaultHeaders,
      });
      return await res.json();
    } catch (err) {
      throw err;
    }
  },

  uploadImage: async function (product_id, imagesArr, updateProductStatus) {
    const session = JSON.parse(localStorage.getItem("session_data"));
    for (let i = 0; i < imagesArr.length; i++) {
      const base64 = imagesArr[i];
      try {
        const res = await fetch(`${config.API_HOST_URL}/product_images`, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify({
            fk_product_id: product_id,
            image: base64,
            fk_user_id: session.id,
            fk_role: session.role,
          }),
        });
        const data = await res.json();
        if (updateProductStatus) updateProductStatus(data, i + 1);
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }
  },

  updateProductImageStatus: async function (product_id, callback) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/products/${product_id}`, {
        method: "PUT",
        headers: defaultHeaders,
        body: JSON.stringify({ is_image_uploaded: true }),
      });
      const data = await res.json();
      if (callback) callback(data);
    } catch (err) {
      console.error(err);
      window.alert("Oops! Error updating product status. Try later");
    }
  },

  getAllProducts: async function (callback) {
    try {
      const [resProducts, resImages] = await Promise.all([
        fetch(`${config.API_HOST_URL}/products`),
        fetch(`${config.API_HOST_URL}/product_images`),
      ]);
      const [products, productImages] = await Promise.all([resProducts.json(), resImages.json()]);
      const merged = products.map((product) => {
        const imgObj = productImages.find((img) => img.fk_product_id === product.id);
        return { ...product, image: imgObj?.image || null };
      });
      if (callback) callback(merged);
    } catch (err) {
      console.error(err);
      if (callback) callback([]);
    }
  },

  getAllFarmerProducts: async function (callback) {
    try {
      const [resProducts, resImages] = await Promise.all([
        fetch(`${config.API_HOST_URL}/products`),
        fetch(`${config.API_HOST_URL}/product_images`),
      ]);
      const [products, productImages] = await Promise.all([resProducts.json(), resImages.json()]);
      const merged = products.map((p) => {
        const imgs = productImages.filter((i) => i.fk_product_id === p.id);
        return { ...p, images: imgs.length ? imgs : [] };
      });
      callback(merged);
    } catch (err) {
      console.error(err);
      callback([]);
      window.alert("Failed to fetch farmer products");
    }
  },

  // ----------------- Orders -----------------
  createOrder: async function (orderData, callback) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/orders`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Order API failed:", res.status, err);
      window.alert(`Failed to place order: ${res.status}`);
      return;
    }

    const data = await res.json();
    if (callback) callback(data);
  } catch (error) {
    console.error("createOrder fetch error:", error);
    window.alert("Failed to place order. See console for details.");
  }
}
,
  updateOrderStatus: async function (orderId, status, callback) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: defaultHeaders,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (callback) callback(data);
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      window.alert("Failed to update order status");
    }
  },

  getMerchantOrders: async function (merchantId, callback) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/orders?merchant_id=${merchantId}`);
    const data = await res.json();

    // support old callback style
    if (typeof callback === "function") callback(data);

    // support new async style
    return data;
  } catch (err) {
    console.error(err);

    if (typeof callback === "function") callback([]);
    return [];
  }
},


  getFarmerOrders: async function (farmerId, callback) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/orders?farmer_id=${farmerId}`);
    const data = await res.json();

    if (typeof callback === "function") callback(data);

    return data;
  } catch (err) {
    console.error(err);

    if (typeof callback === "function") callback([]);
    return [];
  }
},


  // ----------------- Live Prices -----------------
  getLivePrices: async function () {
    try {
      const res = await fetch(`${config.API_HOST_URL}/live_prices`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // ----------------- Chat -----------------
  getMerchantMessages: async function (merchantId, callback) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/messages?merchant_id=${merchantId}`);
      const messages = await res.json();
      callback(messages);
    } catch (err) {
      console.error(err);
      callback([]);
    }
  },

  sendMerchantMessage: async function (message) {
    try {
      const session = JSON.parse(localStorage.getItem("session_data"));
      await fetch(`${config.API_HOST_URL}/messages`, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({
          merchant_id: session.id,
          text: message,
          self: true,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  },
    // ✅ Updated: Get Farmer Products + Images
    getFarmerProducts: async function (farmer_id, showProducts) {
      try {
        const res = await fetch(`${config.API_HOST_URL}/products?fk_farmer_id=${farmer_id}`, {
          headers: defaultHeaders,
        });
  
        if (!res.ok) throw new Error("Failed to fetch products");
  
        const products = await res.json();
  
        const enrichedProducts = await Promise.all(
          products.map(async (product) => {
            try {
              const imageRes = await fetch(`${config.API_HOST_URL}/product_images?fk_product_id=${product.id}`, {
                headers: defaultHeaders,
              });
  
              const images = imageRes.ok ? await imageRes.json() : [];
              return { ...product, images };
            } catch (imgErr) {
              console.warn("Failed to fetch images for product:", product.id);
              return { ...product, images: [] };
            }
          })
        );
  
        showProducts(enrichedProducts);
      } catch (error) {
        console.error("getFarmerProducts error:", error);
        window.alert("Oops! Error fetching products and images");
      }
    },
    // ---------------- UPDATE PAYMENT STATUS ----------------
updatePaymentStatus: async function (orderId, payment_status, callback) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/orders/${orderId}`, {
      method: "PATCH",
      headers: defaultHeaders,
      body: JSON.stringify({ payment_status }),
    });

    const data = await res.json();
    if (callback) callback(data);
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
  }
},
// ---------------- SEND INVOICE MESSAGE ----------------
sendInvoiceMessageToFarmer: async function (farmerId, orderId, amount) {
  try {
    const session = JSON.parse(localStorage.getItem("session_data"));
    const key = [session.id, farmerId].sort().join("_");

    const chats = JSON.parse(localStorage.getItem("digifarm_chats")) || {};

    if (!chats[key]) chats[key] = [];

    chats[key].push({
      id: Date.now(),
      sender: session.id,
      text: `📄 Invoice Generated\nOrder ID: ${orderId}\nAmount: ₹${amount}\nPayment Status: Paid ✅`,
      type: "invoice",
      seen: false,
      deleted: false,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    localStorage.setItem("digifarm_chats", JSON.stringify(chats));
  } catch (err) {
    console.error("Error sending invoice message:", err);
  }
},


 // ---------------- GENERATE PDF INVOICE ----------------
  generatePDFInvoice(order) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("DIGIFARM - Order Invoice", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 40);
    doc.text(`Product: ${order.product_name}`, 20, 50);
    doc.text(`Quantity: ${order.quantity || "-"}`, 20, 60);
    doc.text(`Total Price: ₹${order.totalPrice}`, 20, 70);
    doc.text(`Merchant: ${order.merchant_name}`, 20, 80);
    doc.text(`Farmer: ${order.farmer_name}`, 20, 90);
    doc.text(`Status: ${order.status}`, 20, 100);
    doc.text(`Payment: ${order.payment_status}`, 20, 110);

    doc.setFontSize(10);
    doc.text("Thank you for using DIGIFARM!", 105, 140, { align: "center" });

    doc.save(`Invoice_Order_${order.id}.pdf`);
  },

  // ================= ADMIN SECTION =================

// Get all users
getAllUsers: async function () {
  try {
    const res = await fetch(`${config.API_HOST_URL}/user`);
    return await res.json();
  } catch (err) {
    console.error("getAllUsers error:", err);
    return [];
  }
},

// Get users by role
getUsersByRole: async function (role) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/user`);
    const users = await res.json();
    return users.filter(
      (u) => (u.role || "").toLowerCase() === role.toLowerCase()
    );
  } catch (err) {
    console.error("getUsersByRole error:", err);
    return [];
  }
},

// Delete user
deleteUser: async function (userId) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/user/${userId}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });
    return await res.json();
  } catch (err) {
    console.error("deleteUser error:", err);
    return null;
  }
},

// Get all orders (admin)
getAllOrders: async function () {
  try {
    const res = await fetch(`${config.API_HOST_URL}/orders`);
    return await res.json();
  } catch (err) {
    console.error("getAllOrders error:", err);
    return [];
  }
},

// Get dashboard statistics
getAdminStats: async function () {
  try {
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      fetch(`${config.API_HOST_URL}/user`),
      fetch(`${config.API_HOST_URL}/products`),
      fetch(`${config.API_HOST_URL}/orders`)
    ]);

    const users = await usersRes.json();
    const products = await productsRes.json();
    const orders = await ordersRes.json();

    return {
      totalFarmers: users.filter(u => u.role === "Farmer").length,
      totalMerchants: users.filter(u => u.role === "Merchant").length,
      totalProducts: products.length,
      totalOrders: orders.length,
      openOrders: orders.filter(o => o.status !== "Delivered").length
    };
  } catch (err) {
    console.error("getAdminStats error:", err);
    return {};
  }
},
getAdminStats: async function () {
  try {
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      fetch(`${config.API_HOST_URL}/user`),
      fetch(`${config.API_HOST_URL}/products`),
      fetch(`${config.API_HOST_URL}/orders`)
    ]);

    const users = await usersRes.json();
    const products = await productsRes.json();
    const orders = await ordersRes.json();

    return {
      // Use .toLowerCase() to match your data.json values safely
      totalFarmers: users.filter(u => (u.role || "").toLowerCase() === "farmer").length,
      totalMerchants: users.filter(u => (u.role || "").toLowerCase() === "merchant").length,
      totalProducts: products.length,
      totalOrders: orders.length,
      openOrders: orders.filter(o => o.status !== "Delivered").length
    };
  } catch (err) {
    console.error("getAdminStats error:", err);
    return {
      totalFarmers: 0,
      totalMerchants: 0,
      totalProducts: 0,
      totalOrders: 0,
      openOrders: 0
    };
  }
},
// Inside userApiService in userApi.js

// Fetch all products for the admin
getAllProductsAdmin: async function () {
  try {
    const res = await fetch(`${config.API_HOST_URL}/products`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
},

// Update product status (Approve/Reject)
updateProductStatus: async function (productId, status) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/products/${productId}`, {
      method: "PATCH",
      headers: defaultHeaders,
      body: JSON.stringify({ status: status }),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating status:", err);
  }
},


// 1. Fetch all complaints
getAllComplaints: async function () {
  try {
    const res = await fetch(`${config.API_HOST_URL}/complaints`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return [];
  }
},

// 2. Update complaint status (e.g., from 'Open' to 'Resolved')
updateComplaintStatus: async function (complaintId, status) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/complaints/${complaintId}`, {
      method: "PATCH",
      headers: defaultHeaders,
      body: JSON.stringify({ status: status }),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating complaint:", err);
  }
},

// Admin Orders

getAllOrdersAdmin: async function () {
  try {
    const res = await fetch(`${config.API_HOST_URL}/orders`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching all orders:", err);
    return [];
  }
},

deleteOrderAdmin: async function (orderId) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/orders/${orderId}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting order:", err);
  }
},


// 1. Admin Login Logic
adminLogin: async function (credentials, onSuccess) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/admin`);
    const admins = await res.json();

    // Check if any admin in the array matches both username and password
    const matchedAdmin = admins.find(
      (a) => a.username === credentials.username && a.password === credentials.password
    );

    if (matchedAdmin) {
      // Store session data so the app knows we are logged in
      localStorage.setItem("session_data", JSON.stringify({ 
        id: matchedAdmin.id, 
        username: matchedAdmin.username, 
        role: "admin" 
      }));
      onSuccess(matchedAdmin);
    } else {
      window.alert("Invalid Admin Username or Password");
    }
  } catch (err) {
    console.error("Admin Login Fetch Error:", err);
    window.alert("Connection error. Is your JSON server running?");
  }
},

// 2. Register a new Admin (Only accessible by existing Admin)
registerNewAdmin: async function (adminData) {
  try {
    const res = await fetch(`${config.API_HOST_URL}/admin`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ ...adminData, role: "admin" }),
    });
    const data = await res.json();
    if (data.id) window.alert("New Admin added successfully!");
  } catch (err) {
    console.error("Error adding admin:", err);
  }
}

};

export { userApiService };
