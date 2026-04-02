const express = require("express");
const router = express.Router();
const { readData } = require("../utils/db");

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const data = readData();

  const admin = data.admins.find(
    (a) => a.email === email && a.password === password
  );

  if (admin) {
    res.json({ success: true, admin });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

module.exports = router;