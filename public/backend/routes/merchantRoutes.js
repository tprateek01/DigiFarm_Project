const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/db");

router.get("/", (req, res) => {
  res.json(readData().merchants);
});

router.post("/", (req, res) => {
  const data = readData();
  const newItem = { id: Date.now(), ...req.body };

  data.merchants.push(newItem);
  writeData(data);

  res.json(newItem);
});

module.exports = router;