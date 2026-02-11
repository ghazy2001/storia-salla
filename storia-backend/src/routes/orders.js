const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Coupon = require("../models/Coupon");

// POST /api/orders - Create new order
router.post("/", async (req, res) => {
  try {
    const { customer, items, total, discountAmount, couponUsed } = req.body;

    // 1. Fetch costs for items and calculate total items cost
    const itemsWithCosts = await Promise.all(
      items.map(async (item) => {
        const product = await mongoose
          .model("Product")
          .findById(item.productId);
        let itemCost = 0;
        if (product) {
          if (item.size && product.sizeVariants.length > 0) {
            const variant = product.sizeVariants.find(
              (v) => v.size === item.size,
            );
            itemCost = variant ? variant.cost : product.cost;
          } else {
            itemCost = product.cost;
          }
        }
        return { ...item, cost: itemCost };
      }),
    );

    // 2. Create Order
    const order = new Order({
      customer,
      items: itemsWithCosts,
      total,
      discountAmount,
      couponUsed,
      status: "pending",
      paymentStatus: "pending",
    });
    await order.save();

    // 2. Update/Create Customer
    let dbCustomer = await Customer.findOne({
      email: customer.email.toLowerCase(),
    });
    if (!dbCustomer) {
      dbCustomer = new Customer({
        name: customer.name,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
      });
      await dbCustomer.save();
    }

    // 3. Update Coupon Usage if applicable
    if (couponUsed) {
      await Coupon.findOneAndUpdate(
        { code: couponUsed.toUpperCase() },
        { $inc: { usedCount: 1 } },
      );
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ error: "Failed to create order" });
  }
});
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

// PUT /api/orders/admin/:id - Update order status/tracking (Admin)
router.put("/admin/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const { status, trackingNumber, paymentStatus } = req.body;
    const oldOrder = await Order.findById(req.params.id);
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, trackingNumber, paymentStatus },
      { new: true },
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    // If order is newly mark as paid/completed, update customer stats
    const isNowPaid =
      (status === "completed" || paymentStatus === "completed") &&
      oldOrder.status !== "completed" &&
      oldOrder.paymentStatus !== "completed";

    if (isNowPaid) {
      const customer = await Customer.findOne({
        email: order.customer.email.toLowerCase(),
      });
      if (customer) {
        customer.totalSpent += order.total;
        customer.orderCount += 1;
        customer.lastOrderDate = new Date();
        await customer.save();
      }
    }

    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;
