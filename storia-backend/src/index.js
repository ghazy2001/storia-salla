require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Import routes
const productsRoutes = require("./routes/products");
const adminRoutes = require("./routes/admin");
const faqsRoutes = require("./routes/faqs");
const reviewsRoutes = require("./routes/reviews");
const ordersRoutes = require("./routes/orders");
const analyticsRoutes = require("./routes/analytics");
const bestSellersRoutes = require("./routes/bestsellers");
const customersRoutes = require("./routes/customers");
const couponsRoutes = require("./routes/coupons");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(morgan("dev"));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"];

// Always allow localhost in development
if (
  process.env.NODE_ENV === "development" &&
  !allowedOrigins.includes("http://localhost:5173")
) {
  allowedOrigins.push("http://localhost:5173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Check if it's in the explicitly allowed list
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Dynamically allow all Salla related domains (subdomains and primary)
      const sallaRegex =
        /^https?:\/\/([a-z0-9-]+\.)*(salla\.(sa|network)|storiasa\.com)$/i;
      if (sallaRegex.test(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Storia Backend API",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      admin: "/api/admin",
      health: "/health",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/products", productsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faqs", faqsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bestsellers", bestSellersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/coupons", couponsRoutes);

// Error handling middleware (MUST have 4 arguments for Express to recognize as error handler)
app.use((err, req, res, next) => {
  console.error("[Backend Error]", err.stack || err.message || err);

  // Special handling for CORS errors to return a specific message instead of 500
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS Error",
      message: "This origin is not allowed to access this resource",
    });
  }

  res.status(500).json({
    error: "خطأ في النظام!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌍 CORS enabled for: ${allowedOrigins.join(", ")}`);
});
