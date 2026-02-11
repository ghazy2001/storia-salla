const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FAQ = require("../models/FAQ");

// GET /api/faqs - Get all active FAQs
router.get("/", async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 });
    res.json(faqs);
  } catch {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// POST /api/admin/faqs - Create new FAQ (Admin)
router.post("/admin", async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch {
    res.status(400).json({ error: "Failed to create FAQ" });
  }
});

// PUT /api/admin/faqs/:id - Update FAQ (Admin)
router.put("/admin/:id", async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    res.json(faq);
  } catch {
    res.status(400).json({ error: "Failed to update FAQ" });
  }
});

// DELETE /api/admin/faqs/:id - Delete FAQ (Admin)
router.delete("/admin/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    res.json({ message: "FAQ deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

module.exports = router;
