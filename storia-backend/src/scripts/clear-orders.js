require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");

async function clearOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await Order.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} orders.`);

    console.log("Database cleared of order data.");
    process.exit(0);
  } catch (error) {
    console.error("Clearing failed:", error);
    process.exit(1);
  }
}

clearOrders();
