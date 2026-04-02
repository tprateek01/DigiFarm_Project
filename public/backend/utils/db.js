const fs = require("fs");
const path = require("path");

// `public/backend/utils/db.js` -> `public/data.json`
const filePath = path.join(__dirname, "..", "..", "data.json");

const defaultData = () => ({
  admin: [],
  user: [],
  products: [],
  product_images: [],
  orders: [],
  complaints: [],
  messages: [],
  live_prices: [],
  otp_requests: [],
  otp_tokens: [],
  chat_messages: [],
});

const ensureDefaults = (data) => {
  const base = defaultData();
  if (!data || typeof data !== "object") return base;

  return {
    ...base,
    ...data,
    admin: Array.isArray(data.admin) ? data.admin : base.admin,
    user: Array.isArray(data.user) ? data.user : base.user,
    products: Array.isArray(data.products) ? data.products : base.products,
    product_images: Array.isArray(data.product_images)
      ? data.product_images
      : base.product_images,
    orders: Array.isArray(data.orders) ? data.orders : base.orders,
    complaints: Array.isArray(data.complaints)
      ? data.complaints
      : base.complaints,
    messages: Array.isArray(data.messages) ? data.messages : base.messages,
    live_prices: Array.isArray(data.live_prices)
      ? data.live_prices
      : base.live_prices,
    otp_requests: Array.isArray(data.otp_requests)
      ? data.otp_requests
      : base.otp_requests,
    otp_tokens: Array.isArray(data.otp_tokens) ? data.otp_tokens : base.otp_tokens,
    chat_messages: Array.isArray(data.chat_messages)
      ? data.chat_messages
      : base.chat_messages,
  };
};

const readData = () => {
  if (!fs.existsSync(filePath)) return defaultData();
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw || "{}");
  return ensureDefaults(parsed);
};

const writeData = (data) => {
  const normalized = ensureDefaults(data);
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), "utf-8");
};

module.exports = { readData, writeData };