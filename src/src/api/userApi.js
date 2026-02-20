import config from "../config/config.json";

const defaultHeaders = {
  "Content-Type": "application/json;charset=utf-8",
};

const userApiService = {
  // ----------------- Registration -----------------
  RegisterFarmer: function (farmerFormData) {
    fetch(config.API_HOST_URL + "/user", {
      headers: defaultHeaders,
      body: JSON.stringify(farmerFormData),
      mode: "cors",
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          window.alert("Farmer registered successfully");
        } else {
          window.alert("Registration failed");
        }
      })
      .catch((error) => {
        console.error(error);
        window.alert("Oops! Error, try later");
      });
  },

  RegisterMerchant: function (merchantFormData) {
    fetch(config.API_HOST_URL + "/user", {
      headers: defaultHeaders,
      body: JSON.stringify(merchantFormData),
      mode: "cors",
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          window.alert("Merchant registered successfully");
        } else {
          window.alert("Registration failed");
        }
      })
      .catch((error) => {
        console.error(error);
        window.alert("Oops! Error, try later");
      });
  },

  // ----------------- Login -----------------
  login: async function (credentials, role, gotoDashboard) {
    try {
      const res = await fetch("/server/data.json");
      if (!res.ok) throw new Error("Failed to load server/data.json");

      const jsonData = await res.json();
      if (!Array.isArray(jsonData.user)) {
        window.alert("Invalid data format in JSON");
        return;
      }

      const roleData = jsonData.user.filter((u) => {
        const userRole = (u.role || u.role_name || "").toLowerCase();
        return userRole === role.toLowerCase();
      });

      if (roleData.length === 0) {
        window.alert(`No users found for role: ${role}`);
        return;
      }

      const matchedUser = roleData.find(
        (user) =>
          (user.email === credentials.identifier ||
            user.mobile === credentials.identifier) &&
          user.password === credentials.password
      );

      if (matchedUser) {
        console.log(role + " login successful:", matchedUser);
        gotoDashboard(matchedUser);
      } else {
        window.alert("Invalid credentials for " + role);
      }
    } catch (error) {
      console.error("Login error:", error);
      window.alert("Error fetching credentials");
    }
  },

  // ----------------- Products -----------------
  AddProduct: async function (productData, productListing = () => {}) {
    try {
      const response = await fetch(config.API_HOST_URL + "/products", {
        method: "POST",
        mode: "cors",
        headers: defaultHeaders,
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      const data = await response.json();
      if (data?.id) {
        productListing(data);
      } else {
        window.alert("Product could not be added");
      }
    } catch (error) {
      console.error("AddProduct error:", error);
      window.alert("Oops! Error adding product. Try again later.");
    }
  },

  deleteProduct: async function (productId) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/products/${productId}`, {
        method: "DELETE",
        headers: defaultHeaders,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }

      return await res.json();
    } catch (error) {
      throw error;
    }
  },

  uploadImage: async function (product_id, imagesArr, updateProductStatus) {
    const session_data = JSON.parse(localStorage.getItem("session_data"));

    for (let index = 0; index < imagesArr.length; index++) {
      const base64 = imagesArr[index];
      try {
        const response = await fetch(`${config.API_HOST_URL}/product_images`, {
          method: "POST",
          mode: "cors",
          headers: defaultHeaders,
          body: JSON.stringify({
            fk_product_id: product_id,
            image: base64,
            fk_user_id: session_data.id,
            fk_role: session_data.role,
          }),
        });

        const res = await response.json();
        updateProductStatus(res, index + 1);
      } catch (error) {
        console.error("Error during uploading images:", error);
      }
    }
  },

  updateProductImageStatus: function (product_id, callback) {
    fetch(`${config.API_HOST_URL}/products/${product_id}`, {
      method: "PUT",
      mode: "cors",
      headers: defaultHeaders,
      body: JSON.stringify({ is_image_uploaded: true }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to set image flag");
        return res.json();
      })
      .then((data) => callback(data))
      .catch((error) => {
        console.error(error);
        window.alert("Oops! Error updating product status. Try later");
      });
  },

  getAllProducts: async function (productListing) {
    try {
      const [resProducts, resImages] = await Promise.all([
        fetch(config.API_HOST_URL + "/products"),
        fetch(config.API_HOST_URL + "/product_images"),
      ]);

      if (!resProducts.ok || !resImages.ok) throw new Error("Failed to fetch product data");

      const [products, productImages] = await Promise.all([
        resProducts.json(),
        resImages.json(),
      ]);

      const merged = products.map((product) => {
        const imgObject = productImages.find((img) => img.fk_product_id === product.id);
        return { ...product, image: imgObject?.image || null };
      });

      productListing(merged);
    } catch (error) {
      console.error("getAllProducts error:", error);
      productListing([]);
      window.alert("Failed to load products. Please try again later.");
    }
  },

  // ----------------- Fetch all farmer products (used by merchants) -----------------
  getAllFarmerProducts: async function (callback) {
    try {
      const [resProducts, resImages] = await Promise.all([
        fetch(`${config.API_HOST_URL}/products`),
        fetch(`${config.API_HOST_URL}/product_images`),
      ]);

      if (!resProducts.ok || !resImages.ok) throw new Error("Failed to fetch products");

      const [products, productImages] = await Promise.all([resProducts.json(), resImages.json()]);

      const merged = products.map((p) => {
        const img = productImages.filter((i) => i.fk_product_id === p.id);
        return { ...p, images: img.length ? img : [] };
      });

      callback(merged);
    } catch (error) {
      console.error("getAllFarmerProducts error:", error);
      callback([]);
      window.alert("Failed to fetch farmer products");
    }
  },

  // ----------------- Merchant Orders -----------------
  getMerchantOrders: async function (merchantId, callback) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/orders?merchant_id=${merchantId}`);
      if (!res.ok) throw new Error("Failed to fetch orders");

      const orders = await res.json();
      callback(orders);
    } catch (error) {
      console.error("getMerchantOrders error:", error);
      callback([]);
      window.alert("Failed to fetch merchant orders");
    }
  },

  // ----------------- Live Prices -----------------
  getLivePrices: async function () {
    try {
      const res = await fetch(`${config.API_HOST_URL}/live_prices`);
      if (!res.ok) throw new Error("Failed to fetch live prices");
      return await res.json();
    } catch (error) {
      console.error("getLivePrices error:", error);
      window.alert("Failed to fetch live prices");
      return [];
    }
  },

  // ----------------- Merchant Chat -----------------
  getMerchantMessages: async function (merchantId, callback) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/messages?merchant_id=${merchantId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");

      const messages = await res.json();
      callback(messages);
    } catch (error) {
      console.error("getMerchantMessages error:", error);
      callback([]);
      window.alert("Failed to fetch merchant messages");
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
    } catch (error) {
      console.error("sendMerchantMessage error:", error);
    }
  },

  // ----------------- Merchant Profile -----------------
  getMerchantProfile: async function (merchantId, callback) {
    try {
      const res = await fetch(`${config.API_HOST_URL}/user/${merchantId}`, {
        headers: defaultHeaders,
      });
      if (!res.ok) throw new Error("Failed to fetch merchant data");

      const data = await res.json();
      callback(data);
    } catch (error) {
      console.error("getMerchantProfile error:", error);
      callback(null);
      window.alert("Error fetching merchant data");
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
};

export { userApiService };