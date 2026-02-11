const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");

// GET /api/coupons - Get all coupons
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// POST /api/coupons - Create new coupon
router.post("/", async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/coupons/:id - Update coupon
router.put("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/coupons/:id - Delete coupon
router.delete("/:id", async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

// POST /api/coupons/validate - Validate coupon code
router.post("/validate", async (req, res) => {
  try {
    const { code, cartAmount } = req.body;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() },
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ error: "كود الخصم غير صالح أو منتهي الصلاحية" });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res
        .status(400)
        .json({ error: "تم استهلاك الحد الأقصى لاستخدام هذا الكود" });
    }

    if (cartAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `هذا الكود يتطلب حد أدنى للشراء قيمته ${coupon.minOrderAmount} ر.س`,
      });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: "خطأ في التحقق من الكود" });
  }
});

module.exports = router;
