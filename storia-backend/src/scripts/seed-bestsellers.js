require("dotenv").config();
const mongoose = require("mongoose");
const BestSellers = require("../models/BestSellers");
const Category = require("../models/Category");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/storia";

// Default categories
const categories = [
  { name: { ar: "رسمية", en: "Official" }, slug: "official", order: 1 },
  { name: { ar: "كلوش", en: "Cloche" }, slug: "cloche", order: 2 },
  { name: { ar: "بشت", en: "Bisht" }, slug: "bisht", order: 3 },
  { name: { ar: "كلاسيك", en: "Classic" }, slug: "classic", order: 4 },
  { name: { ar: "عملية", en: "Practical" }, slug: "practical", order: 5 },
  { name: { ar: "فاخرة", en: "Luxury" }, slug: "luxury", order: 6 },
];

// Default BestSellers configuration
const bestSellersConfig = {
  title: {
    ar: "نواعم",
    en: "Nawaem",
  },
  description: {
    ar: "تصميم الأناقة مع عبايا نواعم المتميزة بتصميم عصري يجمع بين الأناقة والعصرية. تتميز بقماشها الفاخر والراحة المطلقة، مما يجعلها الخيار المثالي لإطلالة أنيقة في جميع المناسبات",
    en: "Elegant design with Nawaem abaya featuring modern styling that combines elegance and contemporary fashion.",
  },
  price: 320,
  currency: "SAR",
  category: "classic",
  media: [
    {
      type: "image",
      src: "/assets/products/classic/nawaem-1.jpg",
      order: 1,
    },
    {
      type: "image",
      src: "/assets/products/classic/nawaem-2.jpg",
      order: 2,
    },
    {
      type: "image",
      src: "/assets/products/classic/nawaem-3.jpg",
      order: 3,
    },
    {
      type: "image",
      src: "/assets/products/classic/nawaem-4.jpg",
      order: 4,
    },
  ],
  bannerText: {
    ar: "الأكثر مبيعاً",
    en: "Best Sellers",
  },
  bannerSubtext: {
    ar: "تسوق افضل المنتجات المختارة لك خصيصا",
    en: "Shop the best products specially selected for you",
  },
  ctaText: {
    ar: "تسوق الآن",
    en: "Shop Now",
  },
  isActive: true,
};

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Seed categories
    console.log("\n📁 Seeding categories...");
    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Seed BestSellers
    console.log("\n🌟 Seeding BestSellers configuration...");
    await BestSellers.deleteMany({});
    const config = await BestSellers.create(bestSellersConfig);
    console.log("✅ Created BestSellers configuration:", config.title.ar);

    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seed();
