const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      ar: { type: String },
      en: { type: String },
    },
    order: {
      type: Number,
      default: 0,
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
categorySchema.index({ slug: 1, isActive: 1 });

module.exports = mongoose.model("Category", categorySchema);
