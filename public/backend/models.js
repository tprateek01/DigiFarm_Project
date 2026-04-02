const mongoose = require('mongoose');

// This helper ensures React still sees "id" while Mongo uses "_id"
const autoId = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
};

const UserSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: String,
  mobile: String
}, autoId);

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  description: String,
  image: String,
  status: { type: String, default: 'Pending' },
  fk_farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Also keep the virtual ID fix from earlier
ProductSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const OrderSchema = new mongoose.Schema({
  merchant_id: String,
  farmer_id: String,
  product_name: String,
  totalPrice: Number,
  status: { type: String, default: 'Pending' },
  payment_status: { type: String, default: 'Unpaid' }
}, autoId);

// Mapping _id to id for React compatibility
UserSchema.virtual('id').get(function() { return this._id.toHexString(); });
ProductSchema.virtual('id').get(function() { return this._id.toHexString(); });
OrderSchema.virtual('id').get(function() { return this._id.toHexString(); });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Product: mongoose.model('Product', ProductSchema),
  Order: mongoose.model('Order', OrderSchema)
};