const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/db");

router.get("/", (req, res) => {
  res.json(readData().products);
});

router.post("/", (req, res) => {
  const data = readData();
  const product = { id: Date.now(), ...req.body };

  data.products.push(product);
  writeData(data);

  res.json(product);
});

module.exports = router;