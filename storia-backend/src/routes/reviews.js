const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../models/Review");

// GET /api/reviews - Get all active reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/admin/reviews - Create new review (Admin/System)
router.post("/admin", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch {
    res.status(400).json({ error: "Failed to create review" });
  }
});

// DELETE /api/admin/reviews/:id - Delete review (Admin)
router.delete("/admin/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
