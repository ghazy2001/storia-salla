require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const mongoose = require("mongoose");

async function testConnection() {
  console.log(
    "Testing connection to:",
    process.env.MONGODB_URI.replace(/:([^@]+)@/, ":****@"),
  );
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log("✅ Connection successful!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
}

testConnection();
