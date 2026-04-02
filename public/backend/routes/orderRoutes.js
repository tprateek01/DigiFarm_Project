const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/db");

router.get("/", (req, res) => {
  res.json(readData().orders);
});

router.post("/", (req, res) => {
  const data = readData();
  const order = { id: Date.now(), ...req.body };

  data.orders.push(order);
  writeData(data);

  res.json(order);
});

module.exports = router;