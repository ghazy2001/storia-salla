const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { formatProduct } = require("../utils/productUtils");

// POST /api/admin/products - Create new product
router.post("/products", async (req, res) => {
  try {
    const data = req.body;
    const sizeVariants = data.sizeVariants || [];
    let calculatedPrice = parseFloat(data.price) || 0;
    if (sizeVariants.length > 0) {
      calculatedPrice = Math.min(...sizeVariants.map((v) => v.price));
    }

    // Map frontend structure to backend schema
    const productData = {
      name: { ar: data.name, en: data.name },
      description: { ar: data.description, en: data.description },
      price: calculatedPrice,
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
      sizeVariants: data.sizeVariants || [],
      sallaProductId: data.sallaProductId,
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
    const sizeVariants = data.sizeVariants || [];
    let calculatedPrice = parseFloat(data.price) || 0;
    if (sizeVariants.length > 0) {
      calculatedPrice = Math.min(...sizeVariants.map((v) => v.price));
    }

    const updateData = {
      name: { ar: data.name, en: data.name },
      description: { ar: data.description, en: data.description },
      price: calculatedPrice,
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
      sizeVariants: data.sizeVariants || [],
      sallaProductId: data.sallaProductId,
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
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

// ====== BESTSELLERS MANAGEMENT ======

const BestSellers = require("../models/BestSellers");

// GET /api/admin/bestsellers - Get all BestSellers configs
router.get("/bestsellers", async (req, res) => {
  try {
    const configs = await BestSellers.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    console.error("Error fetching BestSellers:", error);
    res.status(500).json({ error: "Failed to fetch BestSellers" });
  }
});

// POST /api/admin/bestsellers - Create BestSellers config
router.post("/bestsellers", async (req, res) => {
  try {
    const config = new BestSellers(req.body);

    // If setting as active, deactivate others
    if (config.isActive) {
      await BestSellers.updateMany({}, { isActive: false });
    }

    await config.save();
    res.status(201).json(config);
  } catch (error) {
    console.error("Error creating BestSellers:", error);
    res.status(500).json({ error: "Failed to create BestSellers" });
  }
});

// PUT /api/admin/bestsellers/:id - Update BestSellers config
router.put("/bestsellers/:id", async (req, res) => {
  try {
    // If setting as active, deactivate others first
    if (req.body.isActive) {
      await BestSellers.updateMany(
        { _id: { $ne: req.params.id } },
        { isActive: false },
      );
    }

    const config = await BestSellers.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!config) {
      return res.status(404).json({ error: "BestSellers config not found" });
    }

    res.json(config);
  } catch (error) {
    console.error("Error updating BestSellers:", error);
    res.status(500).json({ error: "Failed to update BestSellers" });
  }
});

// DELETE /api/admin/bestsellers/:id - Delete BestSellers config
router.delete("/bestsellers/:id", async (req, res) => {
  try {
    const config = await BestSellers.findByIdAndDelete(req.params.id);
    if (!config) {
      return res.status(404).json({ error: "BestSellers config not found" });
    }
    res.json({ message: "BestSellers config deleted successfully" });
  } catch (error) {
    console.error("Error deleting BestSellers:", error);
    res.status(500).json({ error: "Failed to delete BestSellers" });
  }
});

// ====== CATEGORY MANAGEMENT ======

const Category = require("../models/Category");

// GET /api/admin/categories - Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /api/admin/categories - Create category
router.post("/categories", async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

module.exports = router;
