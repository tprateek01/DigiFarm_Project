const express = require("express");
const cors = require("cors");
const { readData, writeData } = require("./utils/db");

const app = express();
app.use(cors());

// Payloads include base64 images; allow a larger body size.
app.use(express.json({ limit: "100mb" }));

const asArray = (v) => (Array.isArray(v) ? v : []);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (v) => String(v || "").trim().toLowerCase();
const isValidEmail = (v) => emailRegex.test(normalizeEmail(v));
const nowMs = () => Date.now();
const randomOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));
const randomToken = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
const makeThreadKey = (a, b) => [String(a), String(b)].sort().join("_");

function updateById(items, id, patch) {
  const idx = items.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  return items[idx];
}

// -------------------- Auth --------------------
// OTP for registration / password reset.
// NOTE: For real email delivery you’d integrate a provider (SendGrid/Mailgun/etc).
// In this project we log OTP to the server console.
app.post("/auth/request-otp", (req, res) => {
  const data = readData();
  const { email, purpose } = req.body || {};

  const normalized = normalizeEmail(email);
  const p = String(purpose || "").toLowerCase();
  if (!normalized || !isValidEmail(normalized)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  if (!["register", "reset_password"].includes(p)) {
    return res.status(400).json({ message: "Invalid purpose" });
  }

  // For register: block if already exists
  if (p === "register") {
    const exists = asArray(data.user).some(
      (u) => normalizeEmail(u.email) === normalized
    );
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }
  }

  const otp = randomOtp6();
  const expiresAt = nowMs() + 10 * 60 * 1000; // 10 minutes

  data.otp_requests = asArray(data.otp_requests).filter(
    (r) =>
      !(
        normalizeEmail(r.email) === normalized &&
        String(r.purpose || "").toLowerCase() === p
      )
  );
  data.otp_requests.push({
    id: Date.now().toString(),
    email: normalized,
    purpose: p,
    otp,
    expiresAt,
    createdAt: nowMs(),
  });
  writeData(data);

  console.log(`[OTP] purpose=${p} email=${normalized} otp=${otp}`);
  res.json({ message: "OTP sent" });
});

app.post("/auth/verify-otp", (req, res) => {
  const data = readData();
  const { email, purpose, otp } = req.body || {};

  const normalized = normalizeEmail(email);
  const p = String(purpose || "").toLowerCase();
  const code = String(otp || "").trim();

  if (!normalized || !isValidEmail(normalized)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  if (!["register", "reset_password"].includes(p)) {
    return res.status(400).json({ message: "Invalid purpose" });
  }
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const reqs = asArray(data.otp_requests);
  const match = reqs.find(
    (r) =>
      normalizeEmail(r.email) === normalized &&
      String(r.purpose || "").toLowerCase() === p &&
      String(r.otp) === code
  );
  if (!match) return res.status(401).json({ message: "Invalid OTP" });
  if (Number(match.expiresAt || 0) < nowMs()) {
    return res.status(410).json({ message: "OTP expired" });
  }

  // Consume request and mint a short-lived token for next step.
  data.otp_requests = reqs.filter((r) => r.id !== match.id);
  const token = randomToken();
  const tokenExpiresAt = nowMs() + 15 * 60 * 1000; // 15 minutes

  data.otp_tokens = asArray(data.otp_tokens).filter(
    (t) =>
      !(
        normalizeEmail(t.email) === normalized &&
        String(t.purpose || "").toLowerCase() === p
      )
  );
  data.otp_tokens.push({
    id: Date.now().toString(),
    email: normalized,
    purpose: p,
    token,
    expiresAt: tokenExpiresAt,
    createdAt: nowMs(),
  });

  writeData(data);
  res.json({ verified: true, otp_token: token, expiresAt: tokenExpiresAt });
});

app.post("/auth/reset-password", (req, res) => {
  const data = readData();
  const { email, newPassword, otp_token } = req.body || {};

  const normalized = normalizeEmail(email);
  if (!normalized || !isValidEmail(normalized)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  if (!String(newPassword || "").trim()) {
    return res.status(400).json({ message: "Missing new password" });
  }
  const token = String(otp_token || "").trim();
  if (!token) return res.status(400).json({ message: "Missing otp_token" });

  const tokens = asArray(data.otp_tokens);
  const match = tokens.find(
    (t) =>
      normalizeEmail(t.email) === normalized &&
      String(t.purpose || "").toLowerCase() === "reset_password" &&
      String(t.token) === token
  );
  if (!match) return res.status(401).json({ message: "Invalid otp_token" });
  if (Number(match.expiresAt || 0) < nowMs()) {
    return res.status(410).json({ message: "otp_token expired" });
  }

  data.user = asArray(data.user);
  const user = data.user.find((u) => normalizeEmail(u.email) === normalized);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = String(newPassword);
  writeData({
    ...data,
    otp_tokens: tokens.filter((t) => t.id !== match.id),
  });

  res.json({ message: "Password updated" });
});

// Admin login (frontend calls GET /login and filters locally)
app.get("/login", (req, res) => {
  const data = readData();
  res.json(asArray(data.admin));
});

// Farmer/Merchant login (frontend calls POST /login)
app.post("/login", (req, res) => {
  const data = readData();
  const { identifier, password, role } = req.body || {};

  if (!identifier || !password || !role) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const roleLower = String(role).toLowerCase();
  const users = asArray(data.user);

  // Require valid email identifier for login (security + OTP reset flow).
  const normalizedIdentifier = normalizeEmail(identifier);
  if (!isValidEmail(normalizedIdentifier)) {
    return res.status(400).json({ message: "Please use a valid email to login" });
  }

  const matched = users.find((u) => {
    const idMatches = normalizeEmail(u.email) === normalizedIdentifier;
    const pwMatches = String(u.password || "") === String(password);
    const roleMatches = String(u.role || "").toLowerCase() === roleLower;
    return idMatches && pwMatches && roleMatches;
  });

  if (!matched) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json(matched);
});

// Register new users (frontend calls POST /user)
app.get("/user", (req, res) => {
  const data = readData();
  res.json(asArray(data.user));
});

app.post("/user", (req, res) => {
  const data = readData();
  const body = req.body || {};

  const roleLower = String(body.role || "").toLowerCase();
  if (!roleLower) return res.status(400).json({ message: "Missing role" });

  // Require OTP verification for farmer/merchant registration.
  if (["farmer", "merchant"].includes(roleLower)) {
    const email = normalizeEmail(body.email);
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const exists = asArray(data.user).some((u) => normalizeEmail(u.email) === email);
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const otpToken = String(body.otp_token || "").trim();
    if (!otpToken) {
      return res.status(400).json({ message: "Email OTP verification required" });
    }

    const tokens = asArray(data.otp_tokens);
    const match = tokens.find(
      (t) =>
        normalizeEmail(t.email) === email &&
        String(t.purpose || "").toLowerCase() === "register" &&
        String(t.token) === otpToken
    );
    if (!match) return res.status(401).json({ message: "Invalid otp_token" });
    if (Number(match.expiresAt || 0) < nowMs()) {
      return res.status(410).json({ message: "otp_token expired" });
    }

    data.otp_tokens = tokens.filter((t) => t.id !== match.id);
  }

  const user = {
    id: body.id || Date.now().toString(),
    ...body,
    role: roleLower,
    email: body.email ? normalizeEmail(body.email) : body.email,
    email_verified: ["farmer", "merchant"].includes(roleLower) ? true : body.email_verified,
  };

  data.user = asArray(data.user);
  data.user.push(user);
  writeData(data);
  res.status(201).json(user);
});

app.delete("/user/:id", (req, res) => {
  const data = readData();
  data.user = asArray(data.user).filter((u) => String(u.id) !== String(req.params.id));
  writeData(data);
  res.json({ message: "Deleted" });
});

// -------------------- Products --------------------
app.get("/products", (req, res) => {
  const data = readData();
  const { fk_farmer_id } = req.query;

  let products = asArray(data.products);
  if (fk_farmer_id) {
    products = products.filter((p) => String(p.fk_farmer_id) === String(fk_farmer_id));
  }

  res.json(products);
});

app.post("/products", (req, res) => {
  const data = readData();
  const body = req.body || {};

  const product = {
    id: body.id || Date.now().toString(),
    status: body.status, // may be undefined; admin will set later
    ...body,
  };

  data.products = asArray(data.products);
  data.products.push(product);
  writeData(data);

  res.status(201).json(product);
});

app.delete("/products/:id", (req, res) => {
  const data = readData();
  data.products = asArray(data.products).filter(
    (p) => String(p.id) !== String(req.params.id)
  );
  writeData(data);
  res.json({ message: "Product deleted successfully" });
});

// Update product status (admin approve/reject)
app.patch("/products/:id", (req, res) => {
  const data = readData();
  data.products = asArray(data.products);

  const updated = updateById(data.products, req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ message: "Product not found" });

  writeData(data);
  res.json(updated);
});

// Used by frontend to mark images uploaded
app.put("/products/:id", (req, res) => {
  const data = readData();
  data.products = asArray(data.products);

  const updated = updateById(data.products, req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ message: "Product not found" });

  writeData(data);
  res.json(updated);
});

// -------------------- Product Images --------------------
app.get("/product_images", (req, res) => {
  const data = readData();
  const { fk_product_id } = req.query;

  let images = asArray(data.product_images);
  if (fk_product_id) {
    images = images.filter((img) => String(img.fk_product_id) === String(fk_product_id));
  }

  res.json(images);
});

app.post("/product_images", (req, res) => {
  const data = readData();
  const body = req.body || {};

  const image = {
    id: body.id || Date.now().toString(),
    ...body,
  };

  data.product_images = asArray(data.product_images);
  data.product_images.push(image);
  writeData(data);

  res.status(201).json(image);
});

// -------------------- Orders --------------------
app.get("/orders", (req, res) => {
  const data = readData();
  const { merchant_id, farmer_id } = req.query;

  let orders = asArray(data.orders);
  if (merchant_id) {
    orders = orders.filter((o) => String(o.merchant_id) === String(merchant_id));
  }
  if (farmer_id) {
    orders = orders.filter((o) => String(o.farmer_id) === String(farmer_id));
  }

  res.json(orders);
});

app.post("/orders", (req, res) => {
  const data = readData();
  const body = req.body || {};

  const order = {
    id: body.id || Date.now().toString(),
    payment_status: body.payment_status || "unpaid",
    ...body,
  };

  data.orders = asArray(data.orders);
  data.orders.push(order);
  writeData(data);

  res.status(201).json(order);
});

app.patch("/orders/:id", (req, res) => {
  const data = readData();
  data.orders = asArray(data.orders);

  const updated = updateById(data.orders, req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ message: "Order not found" });

  writeData(data);
  res.json(updated);
});

app.delete("/orders/:id", (req, res) => {
  const data = readData();
  data.orders = asArray(data.orders).filter((o) => String(o.id) !== String(req.params.id));
  writeData(data);
  res.json({ message: "Order deleted" });
});

// -------------------- Complaints --------------------
app.get("/complaints", (req, res) => {
  const data = readData();
  res.json(asArray(data.complaints));
});

app.post("/complaints", (req, res) => {
  const data = readData();
  const body = req.body || {};

  const complaint = {
    id: body.id || Date.now().toString(),
    status: body.status || "Open",
    ...body,
  };

  data.complaints = asArray(data.complaints);
  data.complaints.push(complaint);
  writeData(data);
  res.status(201).json(complaint);
});

app.patch("/complaints/:complaintId", (req, res) => {
  const data = readData();
  data.complaints = asArray(data.complaints);

  const updated = updateById(data.complaints, req.params.complaintId, {
    ...(req.body || {}),
  });

  if (!updated) return res.status(404).json({ message: "Complaint not found" });

  writeData(data);
  res.json(updated);
});

// -------------------- Messages --------------------
app.get("/messages", (req, res) => {
  const data = readData();
  const { merchant_id } = req.query;

  let messages = asArray(data.messages);
  if (merchant_id) {
    messages = messages.filter((m) => String(m.merchant_id) === String(merchant_id));
  }

  res.json(messages);
});

app.post("/messages", (req, res) => {
  const data = readData();
  const body = req.body || {};

  const message = {
    id: body.id || Date.now().toString(),
    text: body.text,
    merchant_id: body.merchant_id,
    self: Boolean(body.self),
  };

  if (!message.text || !message.merchant_id) {
    return res.status(400).json({ message: "Missing message fields" });
  }

  data.messages = asArray(data.messages);
  data.messages.push(message);
  writeData(data);

  res.status(201).json(message);
});

// -------------------- Chat (Farmer <-> Merchant) --------------------
app.get("/chat/contacts", (req, res) => {
  const data = readData();
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ message: "Missing user_id" });

  const users = asArray(data.user);
  const me = users.find((u) => String(u.id) === String(user_id));
  if (!me) return res.status(404).json({ message: "User not found" });

  const myRole = String(me.role || "").toLowerCase();
  const otherRole = myRole === "farmer" ? "merchant" : myRole === "merchant" ? "farmer" : null;
  if (!otherRole) return res.json([]);

  res.json(users.filter((u) => String(u.role || "").toLowerCase() === otherRole));
});

app.get("/chat/messages", (req, res) => {
  const data = readData();
  const { thread_key } = req.query;
  if (!thread_key) return res.status(400).json({ message: "Missing thread_key" });

  const msgs = asArray(data.chat_messages)
    .filter((m) => String(m.thread_key) === String(thread_key))
    .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
  res.json(msgs);
});

app.post("/chat/messages", (req, res) => {
  const data = readData();
  const { sender_id, receiver_id, text, type, image } = req.body || {};
  if (!sender_id || !receiver_id) {
    return res.status(400).json({ message: "Missing participants" });
  }
  const t = String(type || "text").toLowerCase();
  if (t === "text" && !String(text || "").trim()) {
    return res.status(400).json({ message: "Missing text" });
  }
  if (t === "image" && !String(image || "").trim()) {
    return res.status(400).json({ message: "Missing image" });
  }

  const thread_key = makeThreadKey(sender_id, receiver_id);
  const msg = {
    id: Date.now().toString(),
    thread_key,
    sender_id: String(sender_id),
    receiver_id: String(receiver_id),
    type: t,
    text: t === "text" ? String(text) : "",
    image: t === "image" ? String(image) : null,
    seen: false,
    createdAt: nowMs(),
  };

  data.chat_messages = asArray(data.chat_messages);
  data.chat_messages.push(msg);
  writeData(data);
  res.status(201).json(msg);
});

app.patch("/chat/messages/seen", (req, res) => {
  const data = readData();
  const { thread_key, user_id } = req.body || {};
  if (!thread_key || !user_id) {
    return res.status(400).json({ message: "Missing thread_key/user_id" });
  }

  data.chat_messages = asArray(data.chat_messages).map((m) => {
    if (
      String(m.thread_key) === String(thread_key) &&
      String(m.receiver_id) === String(user_id)
    ) {
      return { ...m, seen: true };
    }
    return m;
  });
  writeData(data);
  res.json({ message: "ok" });
});

// -------------------- Live Prices --------------------
app.get("/live_prices", (req, res) => {
  const data = readData();
  res.json(asArray(data.live_prices));
});

// -------------------- Admin Registration --------------------
// Frontend calls POST /admin with { username, password, ... , role:'admin' }
app.post("/admin", (req, res) => {
  const data = readData();
  const body = req.body || {};

  const admin = {
    id: body.id || Date.now().toString(),
    role: "admin",
    username: body.username,
    password: body.password,
    ...body,
  };

  data.admin = asArray(data.admin);
  data.admin.push(admin);
  writeData(data);

  res.status(201).json(admin);
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));