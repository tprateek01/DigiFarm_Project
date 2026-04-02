const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/db");

router.get("/", (req, res) => {
  res.json(readData().complaints);
});

router.post("/", (req, res) => {
  const data = readData();
  const complaint = { id: Date.now(), ...req.body };

  data.complaints.push(complaint);
  writeData(data);

  res.json(complaint);
});

module.exports = router;