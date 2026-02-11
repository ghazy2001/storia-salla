const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// GET /api/customers - Get all customers (Admin)
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ totalSpent: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete("/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
