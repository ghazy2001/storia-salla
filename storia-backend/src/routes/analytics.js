const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// GET /api/analytics - Get dashboard analytics
router.get("/", async (req, res) => {
  try {
    // 1. Total Sales (Paid Orders)
    const paidOrders = await Order.find({ paymentStatus: "completed" });
    const totalSales = paidOrders.reduce((sum, order) => sum + order.total, 0);

    // 2. Orders Count (All non-cancelled)
    const ordersCount = await Order.countDocuments({
      status: { $ne: "cancelled" },
    });

    // 3. Customers Count (Unique emails)
    const customers = await Order.distinct("customer.email");
    const customersCount = customers.length;

    // 4. Average Order Value
    const averageOrderValue =
      ordersCount > 0 ? Math.round(totalSales / ordersCount) : 0;

    // 5. Sales Chart Data (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 6. Top Products
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 4 },
    ]);

    // Populate top product details
    const populatedTopProducts = await Product.populate(topProducts, {
      path: "_id",
      select: "name.ar price",
    });

    res.json({
      kpis: {
        totalSales,
        ordersCount,
        customersCount,
        averageOrderValue,
      },
      dailySales,
      topProducts: populatedTopProducts.map((tp) => ({
        name: tp._id?.name?.ar || "Unknown Product",
        sales: tp.sales,
        price: `${tp._id?.price || 0} ر.س`,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
