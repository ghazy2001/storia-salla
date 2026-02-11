const mongoose = require("mongoose");

const bestSellersSchema = new mongoose.Schema(
  {
    // Custom display data
    title: {
      ar: { type: String, required: true },
      en: { type: String },
    },
    description: {
      ar: { type: String, required: true },
      en: { type: String },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "SAR",
    },
    category: {
      type: String,
      required: true,
    },

    // Media gallery for carousel
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
          default: "image",
        },
        src: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Banner settings
    bannerText: {
      ar: { type: String, default: "الأكثر مبيعاً" },
      en: { type: String, default: "Best Sellers" },
    },
    bannerSubtext: {
      ar: { type: String, default: "تسوق افضل المنتجات المختارة لك خصيصا" },
      en: { type: String },
    },
    ctaText: {
      ar: { type: String, default: "تسوق الآن" },
      en: { type: String, default: "Shop Now" },
    },

    // Optional reference to a product
    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    // Control
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Only one active BestSellers config at a time
bestSellersSchema.index({ isActive: 1 });

module.exports = mongoose.model("BestSellers", bestSellersSchema);
