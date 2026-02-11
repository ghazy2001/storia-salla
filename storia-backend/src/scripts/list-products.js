require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

async function listProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    products.forEach((p) => {
      console.log(
        `- ${p.name.ar} (ID: ${p._id}, Category: ${p.category}, Price: ${p.price})`,
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

listProducts();
