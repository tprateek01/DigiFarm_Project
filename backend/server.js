// Load environment variables immediately at the start with override
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

// Force IPv4 resolution to avoid ENETUNREACH on IPv6-only routes (common on Render)
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
} else {
  // Fallback for older Node.js versions
  const originalLookup = dns.lookup;
  dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = { family: 4 };
    } else if (typeof options === 'number') {
      options = { family: options };
    } else {
      options = options || {};
      options.family = 4;
    }
    return originalLookup(hostname, options, callback);
  };
}

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Debug logs to verify env variables are loaded
console.log("Checking Environment Variables...");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "Found" : "Missing");
console.log("- RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `Found (${process.env.RAZORPAY_KEY_ID})` : "Missing");
console.log("- RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "Found" : "Missing");
console.log("- SMTP_USER:", process.env.SMTP_USER ? "Found" : "Missing");
console.log("- SMTP_PASS:", process.env.SMTP_PASS ? "Found" : "Missing");
console.log("- GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Found" : "Missing");

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("Razorpay initialized");
} else {
  console.warn("Razorpay keys missing in .env. Payment features will be disabled.");
}

const http = require("http");
const { Server } = require("socket.io");

const { User, Product, ProductImage, Order, Admin, Complaint, Message, ChatMessage, LivePrice, OtpToken, Counter } = require("./models");

async function getNextId(modelName) {
  // First, check if there are any documents in the collection
  const model = mongoose.model(modelName);
  const count = await model.countDocuments();
  
  // If no documents exist, we want to reset or start from 1
  if (count === 0) {
    await Counter.findByIdAndUpdate(
      modelName,
      { $set: { seq: 0 } }, // Set to 0 so the first increment gives 1
      { upsert: true }
    );
  }

  const counter = await Counter.findByIdAndUpdate(
    modelName,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return counter.seq;
}

const app = express();
app.set("trust proxy", 1); // Trust Render's proxy for sessions/OAuth
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json({ limit: "100mb" }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'digifarm-secret-key-fallback',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Mongo Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digifarm';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB via server.js'))
  .catch(err => console.error('MongoDB connection error', err));

// Nodemailer Real Setup
let transporter;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Hardcode Gmail's primary IPv4 to bypass DNS/IPv6 issues on Render
  // Gmail SMTP IPv4: 142.250.114.108 or 142.251.10.108
  transporter = nodemailer.createTransport({
    host: '142.250.114.108', 
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s/g, "")
    },
    tls: {
      servername: 'smtp.gmail.com', // MUST match Gmail's cert
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    socketTimeout: 15000
  });

  // Verify connection on startup
  transporter.verify().then(() => {
    console.log("SMTP Server is ready to take messages (Hardcoded IPv4)");
  }).catch(err => {
    console.error("SMTP PRE-VERIFICATION FAILED (IPv4):", err.message);
    console.warn("If ETIMEDOUT persists, Render's firewall is blocking all SMTP traffic.");
  });

  console.log("Real SMTP Nodemailer configured with: " + process.env.SMTP_USER + " (Hardcoded IPv4)");
} else {
  console.log("SMTP_USER and SMTP_PASS not found in .env. Falling back to console logging.");
  transporter = null;
}

async function sendOtpEmail(email, otp, purpose) {
  // Always log the OTP to the console first as a fail-safe
  console.log(`\n-----------------------------------------`);
  console.log(`[FAIL-SAFE OTP LOG]`);
  console.log(`Email: ${email}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`-----------------------------------------\n`);

  if (!transporter) {
    console.warn("SMTP NOT CONFIGURED. Use the code from the console above.");
    return; // Don't throw, allow user to use console OTP
  }

  try {
    await transporter.sendMail({
      from: `"DigiFarm" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `DigiFarm ${purpose} OTP`,
      text: `Your OTP for ${purpose} is: ${otp}. It expires in 10 minutes.`,
    });
    console.log(`Sent Real Email OTP to ${email}`);
  } catch (err) {
    console.error("Failed sending email: ", err);
    // Even if it fails, the OTP was logged to the console at the top of this function.
    // We throw a clear error for the frontend to show to the user.
    throw new Error(`Email delivery failed. Please check server logs for your OTP code or verify your App Password.`);
  }
}

// ------ Google Auth ------
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });
        if(user) {
           user.googleId = profile.id;
           await user.save();
        } else {
           // Default to farmer on google sign up if we can't capture role immediately
           user = await User.create({
             id: await getNextId('User'),
             googleId: profile.id,
             full_name: profile.displayName,
             email: profile.emails[0].value,
             email_verified: true,
             role: 'farmer', 
             status: 'approved'
           });
        }
      }
      return cb(null, user);
    } catch(err) {
      return cb(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({ id });
  done(null, user);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Return a script to pass token to parent generic window
    res.send(`
      <script>
        window.opener.postMessage({
          source: 'GOOGLE_AUTH_SUCCESS',
          payload: ${JSON.stringify(req.user)}
        }, '${frontendUrl}');
        window.close();
      </script>
    `);
  }
);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (v) => String(v || "").trim().toLowerCase();
const isValidEmail = (v) => emailRegex.test(normalizeEmail(v));
const nowMs = () => Date.now();
const randomOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));
const randomToken = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

// -------------------- Auth --------------------
app.post("/auth/request-otp", async (req, res) => {
  const { email, purpose } = req.body || {};
  const normalized = normalizeEmail(email);
  const p = String(purpose || "").toLowerCase();

  if (!normalized || !isValidEmail(normalized)) return res.status(400).json({ message: "Invalid email" });
  if (!["register", "reset_password"].includes(p)) return res.status(400).json({ message: "Invalid purpose" });

  if (p === "register") {
    const exists = await User.findOne({ email: normalized });
    if (exists) return res.status(409).json({ message: "Email already registered" });
  }

  const otp = randomOtp6();
  const expiresAt = nowMs() + 10 * 60 * 1000;

  await OtpToken.deleteMany({ email: normalized, purpose: p, token: { $exists: false } });
  
  await OtpToken.create({
    id: await getNextId('OtpToken'),
    email: normalized,
    purpose: p,
    otp,
    expiresAt
  });

  console.log(`[OTP] purpose=${p} email=${normalized} otp=${otp}`);
  
  // Send email in background to speed up response
  sendOtpEmail(normalized, otp, p).catch(err => {
    console.error("OTP background delivery failed:", err);
  });

  res.json({ message: "OTP sent" });
});

app.post("/auth/verify-otp", async (req, res) => {
  const { email, purpose, otp } = req.body || {};
  const normalized = normalizeEmail(email);
  const p = String(purpose || "").toLowerCase();
  const code = String(otp || "").trim();

  if (!normalized || !isValidEmail(normalized)) return res.status(400).json({ message: "Invalid email" });
  
  const match = await OtpToken.findOne({ email: normalized, purpose: p, otp: code });
  if (!match) return res.status(401).json({ message: "Invalid OTP" });
  if (match.expiresAt < nowMs()) return res.status(410).json({ message: "OTP expired" });

  const token = randomToken();
  const tokenExpiresAt = nowMs() + 15 * 60 * 1000;

  await OtpToken.deleteMany({ email: normalized, purpose: p, token: { $exists: true } });
  
  await OtpToken.create({
    id: await getNextId('OtpToken'),
    email: normalized,
    purpose: p,
    token,
    expiresAt: tokenExpiresAt
  });

  await OtpToken.deleteOne({ _id: match._id }); // delete old

  res.json({ verified: true, otp_token: token, expiresAt: tokenExpiresAt });
});

app.post("/auth/reset-password", async (req, res) => {
  const { email, newPassword, otp_token } = req.body || {};
  const normalized = normalizeEmail(email);
  
  const token = String(otp_token || "").trim();
  const match = await OtpToken.findOne({ email: normalized, purpose: 'reset_password', token });
  
  if (!match) return res.status(401).json({ message: "Invalid otp_token" });
  if (match.expiresAt < nowMs()) return res.status(410).json({ message: "otp_token expired" });

  const user = await User.findOne({ email: normalized });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = String(newPassword);
  await user.save();
  await OtpToken.deleteOne({ _id: match._id });

  res.json({ message: "Password updated" });
});

app.get("/login", async (req, res) => {
  const admins = await Admin.find({});
  res.json(admins);
});

app.post("/login", async (req, res) => {
  const { identifier, password, role } = req.body || {};
  if (!identifier || !password || !role) return res.status(400).json({ message: "Missing credentials" });

  const roleLower = String(role).toLowerCase();
  const normalizedIdentifier = normalizeEmail(identifier);
  
  const matched = await User.findOne({ 
    email: normalizedIdentifier, 
    password: password, 
    role: roleLower 
  });

  if (!matched) return res.status(401).json({ message: "Invalid credentials" });
  
  if (roleLower === 'merchant' || roleLower === 'farmer') {
     if (matched.status === 'pending') {
         return res.status(403).json({ message: "Account waiting for admin approval" });
     }
     if (matched.status === 'rejected') {
         return res.status(403).json({ message: "Account rejected by admin" });
     }
  }

  res.json(matched);
});

app.get("/user", async (req, res) => {
  const { role, id } = req.query;
  let q = {};
  if (role) q.role = String(role).toLowerCase();
  if (id) q.id = parseInt(id);
  
  if (id && !isNaN(q.id)) {
    const user = await User.findOne({ id: q.id });
    return res.json(user);
  }
  
  res.json(await User.find(q));
});

app.get("/user/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/user", async (req, res) => {
  const body = req.body || {};
  const roleLower = String(body.role || "").toLowerCase();

  if (["farmer", "merchant"].includes(roleLower)) {
    const email = normalizeEmail(body.email);
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const otpToken = String(body.otp_token || "").trim();
    const match = await OtpToken.findOne({ email, purpose: 'register', token: otpToken });
    
    if (!match) return res.status(401).json({ message: "Invalid otp_token" });
    if (match.expiresAt < nowMs()) return res.status(410).json({ message: "otp_token expired" });
    await OtpToken.deleteOne({ _id: match._id });
  }

  const userRoleState = 'pending';
  
  const newUser = await User.create({
    id: await getNextId('User'),
    ...body,
    role: roleLower,
    status: userRoleState,
    email: normalizeEmail(body.email),
    full_name: body.name || body.full_name || (body.fname && body.lname ? body.fname + " " + body.lname : ""), // map name if sent from frontend
    company_type: body.companyType || body.company_type,
    reg_no: body.registrationNo || body.reg_no,
    profileImage: body.profileImage || body.photo || body.profile_image
  });

  res.status(201).json(newUser);
});

app.delete("/user/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const result = await User.findOneAndDelete({ id });
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/user/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const mapped = { ...req.body };
    delete mapped._id;
    delete mapped.id;

    const updated = await User.findOneAndUpdate({ id }, mapped, {returnDocument: 'after'});
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// -------------------- Products --------------------
app.get("/products", async (req, res) => {
  const { fk_farmer_id } = req.query;
  const filter = fk_farmer_id ? { fk_farmer_id } : {};
  res.json(await Product.find(filter));
});

app.post("/products", async (req, res) => {
  const product = await Product.create({
    id: await getNextId('Product'),
    ...req.body
  });
  res.status(201).json(product);
});

app.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const result = await Product.findOneAndDelete({ id });
    if (!result) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const product = await Product.findOne({ id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const updated = await Product.findOneAndUpdate({ id }, req.body, {returnDocument: 'after'});
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const updated = await Product.findOneAndUpdate({ id }, req.body, {returnDocument: 'after'});
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------- Product Images --------------------
app.get("/product_images", async (req, res) => {
  const { fk_product_id } = req.query;
  const filter = fk_product_id ? { fk_product_id } : {};
  res.json(await ProductImage.find(filter));
});

app.post("/product_images", async (req, res) => {
  const image = await ProductImage.create({
    id: await getNextId('ProductImage'),
    ...req.body
  });
  res.status(201).json(image);
});

// -------------------- Orders --------------------
app.get("/orders", async (req, res) => {
  const { merchant_id, farmer_id, status } = req.query;
  let q = {};
  if (merchant_id) q.merchant_id = merchant_id;
  if (farmer_id) q.farmer_id = farmer_id;
  if (status) q.status = status;
  res.json(await Order.find(q).sort({ created_date: -1 }));
});

// Create new order request (merchant creates, pending farmer approval)
app.post("/orders", async (req, res) => {
  try {
    const orderData = {
      id: await getNextId('Order'),
      status: 'requested',
      payment_status: 'unpaid',
      status_history: [{
        status: 'requested',
        updated_by: req.body.merchant_id,
        updated_by_role: 'merchant',
        notes: 'Order request created'
      }],
      ...req.body
    };
    
    const order = await Order.create(orderData);
    
    // Notify farmer via socket
    io.emit('new_order_request', {
      order_id: order.id,
      farmer_id: order.farmer_id,
      message: `New order request from ${order.merchant_name}`
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/orders/:id", async (req, res) => {
  try {
    const { id: paramId } = req.params;
    let query = {};
    
    if (/^\d+$/.test(paramId)) {
      query = { id: parseInt(paramId) };
    } else if (mongoose.Types.ObjectId.isValid(paramId)) {
      query = { _id: paramId };
    } else {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    // Backend rule: If updating payment_status to 'paid', ensure order is 'accepted'
    if (req.body.payment_status === 'paid') {
      const order = await Order.findOne(query);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.status !== 'accepted') {
        return res.status(400).json({ message: "Cannot pay for an order that is not yet ready for payment." });
      }
    }

    const updated = await Order.findOneAndUpdate(query, req.body, { returnDocument: 'after' });
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Logic: If sample status is updated to 'verified' or 'rejected', update farmer rating
    if (req.body.sample_status === 'verified' || req.body.sample_status === 'rejected') {
      try {
        const farmer = await User.findOne({ id: String(updated.farmer_id) });
        if (farmer) {
          const isVerified = req.body.sample_status === 'verified';
          const newScore = isVerified ? 5 : 1;
          const currentTotal = farmer.total_ratings || 0;
          const currentRating = farmer.rating || 0;
          
          const newRating = ((currentRating * currentTotal) + newScore) / (currentTotal + 1);
          
          await User.findOneAndUpdate(
            { id: String(updated.farmer_id) },
            { 
              $set: { rating: newRating },
              $inc: { total_ratings: 1 }
            }
          );
          console.log(`[RATING] Farmer ${farmer.id} rating updated to ${newRating}`);
        }
      } catch (errR) {
        console.error("Failed to update farmer rating:", errR);
      }
    }

    // Logic: If order is delivered, update farmer earnings
    if (req.body.status === 'delivered') {
      try {
        const farmer = await User.findOneAndUpdate(
          { id: String(updated.farmer_id) },
          { $inc: { earnings: updated.totalPrice } },
          { returnDocument: 'after' }
        );
        if (farmer) {
          console.log(`[EARNINGS] Farmer ${farmer.id} earnings updated. New total: ${farmer.earnings}`);
        }
      } catch (errE) {
        console.error("Failed to increment farmer earnings:", errE);
      }
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete order (admin only)
app.delete("/orders/:id", async (req, res) => {
  try {
    const { id: paramId } = req.params;
    let query = {};
    
    if (/^\d+$/.test(paramId)) {
      query = { id: parseInt(paramId) };
    } else if (mongoose.Types.ObjectId.isValid(paramId)) {
      query = { _id: paramId };
    } else {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const result = await Order.findOneAndDelete(query);
    if (!result) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: err.message });
  }
});

// -------------------- Complaints --------------------
app.get("/complaints", async (req, res) => {
  res.json(await Complaint.find({}));
});

app.post("/complaints", async (req, res) => {
  const complaint = await Complaint.create({
    id: await getNextId('Complaint'),
    ...req.body
  });
  res.status(201).json(complaint);
});

app.patch("/complaints/:complaintId", async (req, res) => {
  try {
    const id = parseInt(req.params.complaintId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const updated = await Complaint.findOneAndUpdate({ id }, req.body, {returnDocument: 'after'});
    if (!updated) return res.status(404).json({ message: "Complaint not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------- Messages --------------------
app.get("/messages", async (req, res) => {
  const { merchant_id } = req.query;
  const q = merchant_id ? { merchant_id } : {};
  res.json(await Message.find(q));
});

app.post("/messages", async (req, res) => {
  const msg = await Message.create({
    id: await getNextId('Message'),
    ...req.body
  });
  res.status(201).json(msg);
});

// -------------------- Chat --------------------
app.get("/chat/contacts", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ message: "Missing user_id" });

  const me = await User.findOne({ id: user_id });
  if (!me) return res.status(404).json({ message: "User not found" });

  const myRole = String(me.role || "").toLowerCase();
  const otherRole = myRole === "farmer" ? "merchant" : myRole === "merchant" ? "farmer" : null;
  if (!otherRole) return res.json([]);

  res.json(await User.find({ role: otherRole }));
});

app.get("/chat/messages", async (req, res) => {
  const { thread_key } = req.query;
  const msgs = await ChatMessage.find({ thread_key }).sort({ createdAt: 1 });
  res.json(msgs);
});

app.post("/chat/messages", async (req, res) => {
  const { sender_id, receiver_id, text, type, image } = req.body || {};
  const t = String(type || "text").toLowerCase();
  
  const thread_key = [String(sender_id), String(receiver_id)].sort().join("_");
  const msg = await ChatMessage.create({
    id: await getNextId('ChatMessage'),
    thread_key, sender_id, receiver_id, type: t,
    text: t === "text" ? text : "",
    image: t === "image" ? image : null,
    createdAt: Date.now()
  });

  // Emit to socket room if active
  const threadMsg = { ...msg.toObject() };
  io.to(String(sender_id)).emit("receive_message", threadMsg);
  io.to(String(receiver_id)).emit("receive_message", threadMsg);

  res.status(201).json(msg);
});

app.patch("/chat/messages/seen", async (req, res) => {
  const { thread_key, user_id } = req.body || {};
  await ChatMessage.updateMany(
    { thread_key, receiver_id: user_id },
    { $set: { seen: true } }
  );
  res.json({ message: "ok" });
});

// Setup Socket.io Connections
io.on("connection", (socket) => {
  console.log("Socket connect:", socket.id);
  socket.on("join", (userId) => {
    if (userId) socket.join(String(userId));
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnect:", socket.id);
  });
});

// -------------------- Live Prices --------------------
app.get("/live_prices", async (req, res) => {
  res.json(await LivePrice.find({}));
});

app.post("/live_prices", async (req, res) => {
  const lp = await LivePrice.create({
    id: await getNextId('LivePrice'),
    ...req.body
  });
  res.status(201).json(lp);
});

// -------------------- Admin --------------------
app.post("/admin", async (req, res) => {
  const admin = await Admin.create({
    id: await getNextId('Admin'),
    ...req.body,
    role: 'admin'
  });
  res.status(201).json(admin);
});

// -------------------- Razorpay Payments --------------------
app.post("/payments/create-order", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: "Payment service not configured" });
    }
    const { amount, currency } = req.body;
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

app.post("/payments/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_data, // The actual order data to be saved on success
    } = req.body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest === razorpay_signature) {
      // Payment is legitimate, now create or update the actual application order
      let finalOrder;
      if (order_data && order_data.existing_order_id) {
        // Update existing order
        finalOrder = await Order.findOneAndUpdate(
          { id: parseInt(order_data.existing_order_id) },
          { 
            $set: { 
              payment_status: "paid",
              razorpay_payment_id,
              razorpay_order_id,
              updated_date: new Date().toISOString()
            } 
          },
          { returnDocument: 'after' }
        );
      } else {
        // Create new order
        finalOrder = await Order.create({
          id: await getNextId("Order"),
          ...order_data,
          status: "pending", // initial status
          payment_status: "paid", // mark as paid
          razorpay_payment_id,
          razorpay_order_id,
          created_date: new Date().toISOString(),
        });
      }
      res.json({ success: true, order: finalOrder });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal server error during verification" });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));