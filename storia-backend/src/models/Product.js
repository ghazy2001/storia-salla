const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
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
      enum: ["official", "cloche", "bisht", "classic", "practical", "luxury"],
    },
    sizes: [
      {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL"],
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        order: { type: Number, default: 0 },
      },
    ],
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sallaProductId: {
      type: String,
      unique: true,
      sparse: true, // For payment integration
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ "name.ar": "text", "description.ar": "text" });

module.exports = mongoose.model("Product", productSchema);
