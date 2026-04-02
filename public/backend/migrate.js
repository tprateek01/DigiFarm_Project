const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { User, Product, Order } = require('./models');

const migrate = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/digifarm');
    console.log("🚀 Connected to MongoDB");

    const dataPath = path.join(__dirname, '..', 'data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Clear old broken data
    await User.deleteMany({});
    await Product.deleteMany({});

    // 1. Migrate Users & Admins
    const allUsers = [
      ...data.admin.map(a => ({ email: a.username, password: a.password, role: 'admin', full_name: 'Admin' })),
      ...data.user.map(u => ({ email: u.email, password: u.password, role: u.role, full_name: u.name, mobile: u.mobile }))
    ];
    const createdUsers = await User.insertMany(allUsers);
    console.log("✅ Users Migrated");

    // 2. Migrate Products with FULL DATA
    const nikuFarmer = createdUsers.find(u => u.email === "niku@gmail.com");
    
    if (data.products && nikuFarmer) {
      const fullProducts = data.products.map(p => ({
        name: p.name || p.product_name,        // Ensures 'name' is saved
        category: p.category || p.product_category,
        price: p.price || p.product_price,
        description: p.description || p.product_description,
        image: p.image,
        status: "Pending",
        fk_farmer_id: nikuFarmer._id // Links to the real MongoDB ID
      }));

      await Product.insertMany(fullProducts);
      console.log(`✅ ${fullProducts.length} Products Migrated with full details!`);
    }

    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
};

migrate();