import API_URL from "../config/apiConfig";
import { jsPDF } from "jspdf";

const defaultHeaders = {
  "Content-Type": "application/json;charset=utf-8",
};

const userApiService = {
  getMerchantProfile: async function (id, callback) {
    try {
      const res = await fetch(`${API_URL}/user/${id}`);
      const data = await res.json();
      if (callback) callback(data);
      return data;
    } catch (err) {
      console.error(err);
    }
  },
  getFarmerProfile: async function (id, callback) {
    try {
      const res = await fetch(`${API_URL}/user/${id}`);
      const data = await res.json();
      if (callback) callback(data);
      return data;
    } catch (err) {
      console.error(err);
    }
  },
  patchUser: async function (id, data, callback) {
    try {
      const res = await fetch(`${API_URL}/user/${id}`, {
        method: "PATCH",
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      if (callback) callback(updated);
      return updated;
    } catch (err) {
      console.error(err);
    }
  },
  // ----------------- OTP + Password Reset -----------------
  requestOtp: async function (email, purpose) {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ email, purpose }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to request OTP");
    return data;
  },

  verifyOtp: async function (email, purpose, otp) {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ email, purpose, otp }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to verify OTP");
    return data;
  },

  resetPassword: async function ({ email, newPassword, otp_token }) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ email, newPassword, otp_token }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to reset password");
    return data;
  },

  // ----------------- Registration -----------------
  RegisterFarmer: async function (farmerFormData) {
    try {
      const res = await fetch(`${API_URL}/user`, {
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
      const res = await fetch(`${API_URL}/user`, {
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
login: async function ({ identifier, password }, role, callback) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST", // <--- THIS MUST BE POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password, role }), // Send data in body
    });

    const matchedUser = await res.json();

    if (res.ok) {
      callback(matchedUser); 
    } else {
      window.alert(matchedUser.message || "Invalid credentials");
    }
  } catch (err) {
    console.error("Login Error:", err);
    window.alert("Check if backend server.js is running!");
  }
},

  // ----------------- Products -----------------
  AddProduct: async function (productData, callback) {
    try {
      const res = await fetch(`${API_URL}/products`, {
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
      const res = await fetch(`${API_URL}/products/${productId}`, {
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
        const res = await fetch(`${API_URL}/product_images`, {
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
      const res = await fetch(`${API_URL}/products/${product_id}`, {
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
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/product_images`),
      ]);
      const [products, productImages] = await Promise.all([resProducts.json(), resImages.json()]);
      const merged = products.filter(p => String(p.status || "").toLowerCase() === 'approved').map((product) => {
        const imgObj = productImages.find((img) => img.fk_product_id === product.id);
        return { ...product, image: imgObj?.image || null };
      });
      if (callback) callback(merged);
    } catch (err) {
      console.error(err);
      if (callback) callback([]);
    }
  },

  getAllFarmerProducts: async function () {
    try {
      const [resUsers, resProducts, resImages] = await Promise.all([
        fetch(`${API_URL}/user`),
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/product_images`),
      ]);
      const [users, products, productImages] = await Promise.all([resUsers.json(), resProducts.json(), resImages.json()]);
      
      const merged = products
        .filter(p => p && String(p.status).toLowerCase() === 'approved')
        .map((p) => {
          const farmer = users.find(u => String(u.id) === String(p.fk_farmer_id));
          
          // Only show products from active farmers
          if (farmer && farmer.isActive !== false) {
            const imgs = productImages.filter((i) => String(i.fk_product_id) === String(p.id));
            return { 
              ...p, 
              images: imgs.length ? imgs : [],
              farmerName: p.farmerName || farmer?.full_name || farmer?.name || "N/A",
              farmerLocation: p.farmerLocation || farmer?.location || "N/A",
              farmerMobile: p.farmerMobile || farmer?.mobile || "N/A",
              farmerRating: farmer?.rating || 0
            };
          }
          return null;
        })
        .filter(p => p !== null);

      return merged;
    } catch (err) {
      console.error("getAllFarmerProducts error:", err);
      return [];
    }
  },

  // ----------------- Orders -----------------
  createOrder: async function (orderData, callback) {
    try {
      const res = await fetch(`${API_URL}/orders`, {
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
      return data;
    } catch (error) {
      console.error("createOrder fetch error:", error);
      window.alert("Failed to place order. See console for details.");
    }
  },

  
  updateOrderStatus: async function (orderId, status, extraData, callback) {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ status, ...extraData }),
      });
      const data = await res.json();
      if (callback) callback(data);
      return data;
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      window.alert("Failed to update order status");
    }
  },

  getMerchantOrders: async function (merchantId, callback) {
  try {
    const res = await fetch(`${API_URL}/orders?merchant_id=${merchantId}`);
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

  // ----------------- Payments -----------------
  createRazorpayOrder: async function (amount, currency = "INR") {
    const res = await fetch(`${API_URL}/payments/create-order`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ amount, currency }),
    });
    return await res.json();
  },

  verifyRazorpayPayment: async function (paymentData) {
    const res = await fetch(`${API_URL}/payments/verify-payment`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(paymentData),
    });
    return await res.json();
  },


  getFarmerOrders: async function (farmerId, callback) {
  try {
    const res = await fetch(`${API_URL}/orders?farmer_id=${farmerId}`);
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
      const res = await fetch(`${API_URL}/live_prices`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // ----------------- Chat -----------------
  getMerchantMessages: async function (merchantId, callback) {
    try {
      const res = await fetch(`${API_URL}/messages?merchant_id=${merchantId}`);
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
      await fetch(`${API_URL}/messages`, {
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
        const res = await fetch(`${API_URL}/products?fk_farmer_id=${farmer_id}`, {
          headers: defaultHeaders,
        });
  
        if (!res.ok) throw new Error("Failed to fetch products");
  
        const products = await res.json();
  
        const enrichedProducts = await Promise.all(
          products.map(async (product) => {
            try {
              const imageRes = await fetch(`${API_URL}/product_images?fk_product_id=${product.id}`, {
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
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "PATCH",
      headers: defaultHeaders,
      body: JSON.stringify({ payment_status }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Failed to update payment status");
    }
    if (callback) callback(data);
    return data;
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
    throw err;
  }
},
// ---------------- SEND INVOICE MESSAGE ----------------
sendInvoiceMessageToFarmer: async function (farmerId, orderId, amount) {
  try {
    const session = JSON.parse(localStorage.getItem("session_data"));
    await fetch(`${API_URL}/chat/messages`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        sender_id: session.id,
        receiver_id: farmerId,
        type: "text",
        text: `📄 Invoice Generated\nOrder ID: ${orderId}\nAmount: ₹${amount}\nPayment Status: Paid ✅`,
      }),
    });
  } catch (err) {
    console.error("Error sending invoice message:", err);
  }
},

  // ----------------- New Chat API (backend-persisted) -----------------
  getChatContacts: async function (userId) {
    const res = await fetch(
      `${API_URL}/chat/contacts?user_id=${encodeURIComponent(userId)}`
    );
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new Error(data?.message || "Failed to load contacts");
    return data;
  },

  getChatMessages: async function (threadKey) {
    const res = await fetch(
      `${API_URL}/chat/messages?thread_key=${encodeURIComponent(
        threadKey
      )}`
    );
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new Error(data?.message || "Failed to load messages");
    return data;
  },

  sendChatMessage: async function ({ sender_id, receiver_id, type, text, image }) {
    const res = await fetch(`${API_URL}/chat/messages`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ sender_id, receiver_id, type, text, image }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to send message");
    return data;
  },

  markChatSeen: async function ({ thread_key, user_id }) {
    const res = await fetch(`${API_URL}/chat/messages/seen`, {
      method: "PATCH",
      headers: defaultHeaders,
      body: JSON.stringify({ thread_key, user_id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to mark seen");
    return data;
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
    const res = await fetch(`${API_URL}/user`);
    return await res.json();
  } catch (err) {
    console.error("getAllUsers error:", err);
    return [];
  }
},

// Get users by role
getUsersByRole: async function (role) {
  try {
    const res = await fetch(`${API_URL}/user`);
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
    const res = await fetch(`${API_URL}/user/${userId}`, {
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
    const res = await fetch(`${API_URL}/orders`);
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
      fetch(`${API_URL}/user`),
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/orders`)
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
    const [resProducts, resUsers] = await Promise.all([
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/user`)
    ]);
    const products = await resProducts.json();
    const users = await resUsers.json();

    return products.map(p => {
      const farmer = users.find(u => String(u.id) === String(p.fk_farmer_id));
      return {
        ...p,
        farmerName: p.farmerName || farmer?.full_name || farmer?.name || "N/A",
        farmerLocation: p.farmerLocation || farmer?.location || "N/A",
        farmerMobile: p.farmerMobile || farmer?.mobile || "N/A"
      };
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
},

// Update product status (Approve/Reject)
updateProductStatus: async function (productId, status) {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`, {
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
    const res = await fetch(`${API_URL}/complaints`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return [];
  }
},

// 2. Update complaint status (e.g., from 'Open' to 'Resolved')
updateComplaintStatus: async function (complaintId, status) {
  try {
    const res = await fetch(`${API_URL}/complaints/${complaintId}`, {
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
    const res = await fetch(`${API_URL}/orders`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching all orders:", err);
    return [];
  }
},

deleteOrderAdmin: async function (orderId) {
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
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
    const res = await fetch(`${API_URL}/login`);
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
    const res = await fetch(`${API_URL}/admin`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ ...adminData, role: "admin" }),
    });
    const data = await res.json();
    if (data.id) window.alert("New Admin added successfully!");
  } catch (err) {
    console.error("Error adding admin:", err);
  }
},

getProductById: async function (id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  return await res.json();
},

patchProduct: async function (id, data) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify(data),
  });
  return await res.json();
}

};

export { userApiService };
