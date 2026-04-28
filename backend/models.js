const mongoose = require('mongoose');

const autoId = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
};

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  full_name: String,
  email: { type: String, unique: true },
  password: { type: String }, // optional for google auth
  role: String,
  mobile: String,
  aadhar_no: String,
  id_proof: String, // base64
  company_type: String,
  companyName: String,
  reg_no: String,
  status: { type: String, default: 'approved' }, // merchants get 'pending', others 'approved'
  googleId: String,
  email_verified: { type: Boolean, default: false },
  profileImage: String, // base64
  isActive: { type: Boolean, default: true },
  earnings: { type: Number, default: 0 },
  location: String,
  land_area: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  total_ratings: { type: Number, default: 0 }
}, autoId);

const ProductSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  category: String,
  price: Number,
  description: String,
  image: String, 
  status: { type: String, default: 'pending' }, // lowercase for consistency
  product_name: String, // to map with existing frontend
  product_Qty: Number,
  product_Unit: String,
  product_Unitprice: Number,
  isAvailable: { type: Boolean, default: true },
  fk_farmer_id: String,
  farmerName: String,
  product_Category: String
}, autoId);

const ProductImageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  fk_product_id: String,
  image: String,
  fk_user_id: String,
  fk_role: String
}, autoId);

const OrderSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  merchant_id: String,
  merchant_name: String,
  farmer_id: String,
  farmer_name: String,
  product_id: String,
  product_name: String,
  quantity: Number,
  unit: String,
  totalPrice: Number,
  status: { type: String, default: 'pending' },
  sample_status: { type: String, default: 'none' }, // none, requested, provided, verified, rejected
  sample_details: String,
  sample_verification_details: String,
  payment_status: { type: String, default: 'unpaid' },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
}, autoId);

const AdminSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, autoId);

const ComplaintSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  description: String,
  status: { type: String, default: 'Open' },
  user_id: String
}, autoId);

const MessageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  merchant_id: String,
  text: String,
  self: Boolean
}, autoId);

const ChatMessageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  thread_key: String,
  sender_id: String,
  receiver_id: String,
  type: { type: String, default: 'text' },
  text: String,
  image: String,
  seen: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now }
}, autoId);

const LivePriceSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  commodity: String,
  price: Number,
  unit: String,
  date: String
}, autoId);

const OtpTokenSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  email: String,
  purpose: String,
  otp: String,
  token: String,
  expiresAt: Number,
  createdAt: { type: Number, default: Date.now }
}, autoId);

// Add virtual 'id' mapping correctly to all schema
const models = [UserSchema, ProductSchema, ProductImageSchema, OrderSchema, AdminSchema, ComplaintSchema, MessageSchema, ChatMessageSchema, LivePriceSchema, OtpTokenSchema];
models.forEach(schema => {
  schema.set('toJSON', { virtuals: false }); // Disable virtual 'id' to avoid conflict with numeric 'id'
  schema.set('toObject', { virtuals: false });
});

module.exports = {
  Counter: mongoose.model('Counter', CounterSchema),
  User: mongoose.model('User', UserSchema),
  Product: mongoose.model('Product', ProductSchema),
  ProductImage: mongoose.model('ProductImage', ProductImageSchema),
  Order: mongoose.model('Order', OrderSchema),
  Admin: mongoose.model('Admin', AdminSchema),
  Complaint: mongoose.model('Complaint', ComplaintSchema),
  Message: mongoose.model('Message', MessageSchema),
  ChatMessage: mongoose.model('ChatMessage', ChatMessageSchema),
  LivePrice: mongoose.model('LivePrice', LivePriceSchema),
  OtpToken: mongoose.model('OtpToken', OtpTokenSchema)
};