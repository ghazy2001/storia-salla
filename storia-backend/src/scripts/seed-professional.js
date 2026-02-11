const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Coupon = require("../models/Coupon");
require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/storia";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing
    await Customer.deleteMany({});
    await Coupon.deleteMany({});

    // Seed Customers
    const customers = [
      {
        name: "أحمد محمد",
        email: "ahmed@example.com",
        phone: "0501234567",
        totalSpent: 1250,
        orderCount: 3,
        lastOrderDate: new Date(),
      },
      {
        name: "سارة خالد",
        email: "sara@example.com",
        phone: "0559876543",
        totalSpent: 850,
        orderCount: 2,
        lastOrderDate: new Date(Date.now() - 86400000),
      },
      {
        name: "ياسر فهد",
        email: "yasser@example.com",
        phone: "0561112223",
        totalSpent: 2100,
        orderCount: 5,
        lastOrderDate: new Date(Date.now() - 172800000),
      },
      {
        name: "نورة علي",
        email: "noura@example.com",
        phone: "0543334445",
        totalSpent: 450,
        orderCount: 1,
        lastOrderDate: new Date(Date.now() - 604800000),
      },
    ];
    await Customer.insertMany(customers);
    console.log("Seeded Customers ✅");

    // Seed Coupons
    const coupons = [
      {
        code: "STORIA10",
        discountType: "percentage",
        value: 10,
        minOrderAmount: 100,
        expiryDate: new Date("2026-12-31"),
        usageLimit: 100,
        usedCount: 12,
      },
      {
        code: "WELCOME",
        discountType: "fixed",
        value: 50,
        minOrderAmount: 300,
        expiryDate: new Date("2026-06-30"),
        usageLimit: null,
        usedCount: 45,
      },
      {
        code: "OFF20",
        discountType: "percentage",
        value: 20,
        minOrderAmount: 500,
        expiryDate: new Date("2025-01-01"),
        usageLimit: 50,
        usedCount: 50,
      }, // Expired
    ];
    await Coupon.insertMany(coupons);
    console.log("Seeded Coupons ✅");

    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
