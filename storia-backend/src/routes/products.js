const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - Get all active products
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // Format for frontend
    const formattedProducts = products.map((p) => ({
      id: p._id.toString(),
      name: p.name.ar,
      price: `${p.price} ${p.currency === "SAR" ? "ر.س" : p.currency}`,
      category: p.category,
      sizes: p.sizes,
      description: p.description.ar,
      image: p.images[0]?.url || "/assets/logo.png",
      media: p.images.map((img) => ({
        type: "image",
        src: img.url,
      })),
      isNew: false,
      rating: 5.0,
      reviews: 0,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name.ar,
      price: `${product.price} ${product.currency === "SAR" ? "ر.س" : product.currency}`,
      category: product.category,
      sizes: product.sizes,
      description: product.description.ar,
      image: product.images[0]?.url || "/assets/logo.png",
      media: product.images.map((img) => ({
        type: "image",
        src: img.url,
      })),
      stock: product.stock,
      isNew: false,
      rating: 5.0,
      reviews: 0,
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// GET /api/products/category/:category - Filter by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true,
    }).sort({ createdAt: -1 });

    const formattedProducts = products.map((p) => ({
      id: p._id.toString(),
      name: p.name.ar,
      price: `${p.price} ${p.currency === "SAR" ? "ر.س" : p.currency}`,
      category: p.category,
      sizes: p.sizes,
      description: p.description.ar,
      image: p.images[0]?.url || "/assets/logo.png",
      media: p.images.map((img) => ({
        type: "image",
        src: img.url,
      })),
      isNew: false,
      rating: 5.0,
      reviews: 0,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
