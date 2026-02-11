const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");

// GET /api/orders - Get all orders (Admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId", "name.ar")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id - Get single order
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const order = await Order.findById(req.params.id).populate(
      "items.productId",
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// DELETE /api/orders/:id - Delete order (Admin)
router.delete("/admin/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
