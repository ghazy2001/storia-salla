require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for data cleanup...");

    const customerCount = await Customer.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log(`Found ${customerCount} customers and ${orderCount} orders.`);

    if (customerCount > 0) {
      await Customer.deleteMany({});
      console.log("Cleared all customers.");
    }

    if (orderCount > 0) {
      await Order.deleteMany({});
      console.log("Cleared all orders.");
    }

    console.log("Cleanup complete! The site is now ready for real data.");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error clearing data:", error);
    process.exit(1);
  }
}

clearData();
