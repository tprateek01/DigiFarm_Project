const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/db");

router.get("/", (req, res) => {
  const data = readData();
  res.json(data.farmers);
});

router.post("/", (req, res) => {
  const data = readData();
  const newFarmer = { id: Date.now(), ...req.body };

  data.farmers.push(newFarmer);
  writeData(data);

  res.json(newFarmer);
});

router.delete("/:id", (req, res) => {
  const data = readData();

  data.farmers = data.farmers.filter(
    (f) => f.id != req.params.id
  );

  writeData(data);
  res.json({ message: "Deleted" });
});

module.exports = router;