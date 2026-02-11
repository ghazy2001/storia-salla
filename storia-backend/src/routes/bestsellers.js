const express = require("express");
const router = express.Router();
const BestSellers = require("../models/BestSellers");

// GET /api/bestsellers - Get active BestSellers configuration
router.get("/", async (req, res) => {
  try {
    const config = await BestSellers.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    if (!config) {
      return res.status(404).json({
        error: "No active BestSellers configuration found",
      });
    }

    // Format for frontend consumption
    const formatted = {
      id: config.productRef || config._id,
      name: config.title.ar || config.title.en,
      price: config.price,
      formattedPrice: `${config.price} ${config.currency === "SAR" ? "ر.س" : config.currency}`,
      category: config.category,
      description: config.description.ar || config.description.en,
      bestSellerDescription: config.description.ar || config.description.en,
      image: config.media[0]?.src || "/assets/logo.png",
      media: config.media.sort((a, b) => a.order - b.order),
      bannerText: config.bannerText,
      bannerSubtext: config.bannerSubtext,
      ctaText: config.ctaText,
    };

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching BestSellers:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch BestSellers configuration" });
  }
});

module.exports = router;
