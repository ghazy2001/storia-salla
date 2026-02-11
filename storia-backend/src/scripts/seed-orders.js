require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function seedOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find();
    if (products.length === 0) {
      console.log(
        "No products found to seed orders. Run seed-products.js first.",
      );
      process.exit(1);
    }

    const sampleOrders = [
      {
        customer: {
          name: "سارة أحمد",
          email: "sara@example.com",
          phone: "0501112223",
        },
        items: [
          {
            productId: products[0]._id,
            quantity: 1,
            price: products[0].price,
            size: "54",
          },
          {
            productId: products[1]._id,
            quantity: 1,
            price: products[1].price,
            size: "56",
          },
        ],
        total: products[0].price + products[1].price,
        status: "completed",
        paymentStatus: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      },
      {
        customer: {
          name: "نورة المالكي",
          email: "noura@example.com",
          phone: "0502223334",
        },
        items: [
          {
            productId: products[2]._id,
            quantity: 1,
            price: products[2].price,
            size: "52",
          },
        ],
        total: products[2].price,
        status: "completed",
        paymentStatus: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        customer: {
          name: "عبدالله محمد",
          email: "abdullah@example.com",
          phone: "0503334445",
        },
        items: [
          {
            productId: products[3]._id,
            quantity: 2,
            price: products[3].price,
            size: "58",
          },
        ],
        total: products[3].price * 2,
        status: "processing",
        paymentStatus: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      },
      {
        customer: {
          name: "ريم القحطاني",
          email: "reem@example.com",
          phone: "0504445556",
        },
        items: [
          {
            productId: products[4]._id,
            quantity: 1,
            price: products[4].price,
            size: "54",
          },
        ],
        total: products[4].price,
        status: "cancelled",
        paymentStatus: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      },
      {
        customer: {
          name: "هدى العتيبي",
          email: "huda@example.com",
          phone: "0505556667",
        },
        items: [
          {
            productId: products[5]._id,
            quantity: 1,
            price: products[5].price,
            size: "56",
          },
        ],
        total: products[5].price,
        status: "completed",
        paymentStatus: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      },
    ];

    // Clear existing mock-like orders if any (optional, but keep it clean)
    // await Order.deleteMany({});

    for (const o of sampleOrders) {
      await new Order(o).save();
      console.log(`Seeded Order for: ${o.customer.name}`);
    }

    console.log("Order seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedOrders();
