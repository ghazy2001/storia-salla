const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        cost: {
          type: Number,
          default: 0,
        },
        size: String,
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    sallaOrderId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    trackingNumber: String,
    shippingMethod: String,
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponUsed: String,
  },
  {
    timestamps: true,
  },
);

// Auto-generate order number
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `STORIA-${String(count + 1).padStart(6, "0")}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
