const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { formatProduct } = require("../utils/productUtils");

// POST /api/admin/products - Create new product
router.post("/products", async (req, res) => {
  try {
    const data = req.body;

    // Map frontend structure to backend schema
    const productData = {
      name: { ar: data.name, en: data.name },
      description: { ar: data.description, en: data.description },
      price: parseFloat(data.price) || 0,
      category: data.category || "official",
      sizes: data.sizes || ["S", "M", "L", "XL"],
      images: [
        {
          url: data.image || "/assets/logo.png",
          alt: data.name,
        },
      ],
      isActive: true,
      stock: parseInt(data.stock) || 0,
    };

    const product = new Product(productData);
    await product.save();
    res.status(201).json(formatProduct(product));
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/admin/products/:id - Update product
router.put("/products/:id", async (req, res) => {
  try {
    const data = req.body;
    const updateData = {
      name: { ar: data.name, en: data.name },
      description: { ar: data.description, en: data.description },
      price: parseFloat(data.price) || 0,
      category: data.category,
      sizes: data.sizes,
      images: [
        {
          url: data.image,
          alt: data.name,
        },
      ],
      isActive: data.isActive ?? true,
      stock: parseInt(data.stock) || 0,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(formatProduct(product));
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET /api/admin/products - Get all products (including inactive)
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
