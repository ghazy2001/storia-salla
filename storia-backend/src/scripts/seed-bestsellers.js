const mongoose = require("mongoose");
require("dotenv").config();
const BestSellers = require("../models/BestSellers");
const Category = require("../models/Category");
const Product = require("../models/Product");

const seedBestSellers = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing
    console.log("🗑️ Clearing existing categories and bestsellers...");
    await Category.deleteMany({});
    await BestSellers.deleteMany({});

    // Seed Categories
    console.log("📁 Seeding categories...");
    const categoriesList = [
      { slug: "classic", name: { ar: "كلاسيك", en: "Classic" } },
      { slug: "official", name: { ar: "رسمي", en: "Official" } },
      { slug: "cloche", name: { ar: "كلوش", en: "Cloche" } },
      { slug: "bisht", name: { ar: "بشت", en: "Bisht" } },
      { slug: "practical", name: { ar: "عملي", en: "Practical" } },
      { slug: "luxury", name: { ar: "فاخر", en: "Luxury" } },
    ];
    await Category.insertMany(categoriesList);
    console.log(`✅ Created ${categoriesList.length} categories\n`);

    // Helper to generate media array
    const generateMedia = (prefix, count) => {
      const media = [];
      for (let i = 1; i <= count; i++) {
        media.push({
          type: "image",
          src: `/assets/products/${prefix}/${prefix}_${i}.jpg`,
          order: i,
        });
      }
      return media;
    };

    // Helper to find product ID by name
    const findProductId = async (arName) => {
      const p = await Product.findOne({ "name.ar": arName });
      return p ? p._id.toString() : null;
    };

    console.log("🔍 Looking up real product IDs...");

    // Seed BestSellers Configurations
    console.log("🌟 Seeding BestSellers configurations...");

    const configurations = [
      {
        title: { ar: "نواعم القصيم", en: "Nawaem Al Qassim" },
        description: {
          ar: "عباية كلاسيكية ناعمة بتصميم أنيق يناسب جميع الأوقات",
          en: "Elegant classic abaya for all occasions",
        },
        price: "320",
        currency: "SAR",
        category: "classic",
        media: generateMedia("p03", 9),
        bannerText: { ar: "الأكثر مبيعاً", en: "Best Sellers" },
        bannerSubtext: {
          ar: "تسوق افضل المنتجات المختارة لك خصيصا",
          en: "Shop our specially selected best sellers",
        },
        ctaText: { ar: "تسوق الآن", en: "Shop Now" },
        isActive: true,
        productRef: await findProductId("عباية بشت مطرزة - شك يدوي"), // Matches the images being used
      },
      {
        title: { ar: "بشت ملكي", en: "Royal Bisht" },
        description: {
          ar: "عباية بشت ملكي بتطريز فاخر وقماش عالي الجودة",
          en: "Royal bisht abaya with luxury embroidery",
        },
        price: "450",
        currency: "SAR",
        category: "bisht",
        media: generateMedia("p01", 7),
        bannerText: { ar: "كولكشن جديد", en: "New Collection" },
        bannerSubtext: {
          ar: "اكتشفي الفخامة في كل تفصيلة",
          en: "Discover luxury in every detail",
        },
        ctaText: { ar: "اكتشف الآن", en: "Discover Now" },
        isActive: false,
        productRef: await findProductId("عباية سوداء رسمية - كريب ملكي"),
      },
      {
        title: { ar: "كلوش فرنسي", en: "French Cloche" },
        description: {
          ar: "تصميم كلوش عصري يجمع بين الراحة والأناقة",
          en: "Modern cloche design combining comfort and style",
        },
        price: "380",
        currency: "SAR",
        category: "cloche",
        media: generateMedia("p02", 6),
        bannerText: { ar: "الأكثر طلباً", en: "Most Wanted" },
        bannerSubtext: {
          ar: "القطع المفضلة لدى عميلاتنا",
          en: "Our customers' favorite pieces",
        },
        ctaText: { ar: "اطلب الآن", en: "Order Now" },
        isActive: false,
        productRef: await findProductId("عباية كلوش - قماش إنترنت ناعم"),
      },
      {
        title: { ar: "رسمية نجد", en: "Najd Official" },
        description: {
          ar: "عباية رسمية مثالية للعمل والمناسبات الخاصة",
          en: "Official abaya perfect for work and special events",
        },
        price: "340",
        currency: "SAR",
        category: "official",
        media: generateMedia("p04", 8),
        bannerText: { ar: "عروض خاصة", en: "Special Offers" },
        bannerSubtext: {
          ar: "أفضل الأسعار لأجمل التصاميم",
          en: "Best prices for the most beautiful designs",
        },
        ctaText: { ar: "تسوقي العروض", en: "Shop Offers" },
        isActive: false,
        productRef: await findProductId("عباية نواعم - تصميم كلاسيكي"),
      },
      {
        title: { ar: "عملية يومية", en: "Daily Practical" },
        description: {
          ar: "عباية عملية مريحة للاستخدام يومي المستمر",
          en: "Comfortable practical abaya for daily use",
        },
        price: "290",
        currency: "SAR",
        category: "practical",
        media: generateMedia("p05", 6),
        bannerText: { ar: "وصلنا حديثاً", en: "Just Arrived" },
        bannerSubtext: {
          ar: "أحدث صيحات العبايات الخليجية",
          en: "The latest trends in Gulf abayas",
        },
        ctaText: { ar: "مشاهدة الكل", en: "View All" },
        isActive: false,
        productRef: await findProductId("عباية رسمية بتطريز هادئ"),
      },
      {
        title: { ar: "فخامة ستوريا", en: "Storia Luxury" },
        description: {
          ar: "تصميم فاخر من ستوريا يعكس الذوق الرفيع",
          en: "Luxury design from Storia reflecting fine taste",
        },
        price: "550",
        currency: "SAR",
        category: "luxury",
        media: generateMedia("p06", 5),
        bannerText: { ar: "إصدار محدود", en: "Limited Edition" },
        bannerSubtext: {
          ar: "قطع حصرية للمتميزات فقط",
          en: "Exclusive pieces for distinguished ladies only",
        },
        ctaText: { ar: "اشتري الآن", en: "Buy Now" },
        isActive: false,
        productRef: await findProductId("عباية عملية يومية بجيوب"),
      },
      {
        title: { ar: "كلاسيك مودرن", en: "Modern Classic" },
        description: {
          ar: "لمسة عصرية على العباية الكلاسيكية السوداء",
          en: "A modern touch on the classic black abaya",
        },
        price: "310",
        currency: "SAR",
        category: "classic",
        media: generateMedia("p07", 4),
        bannerText: { ar: "تصاميم مختارة", en: "Selected Designs" },
        bannerSubtext: {
          ar: "تشكيلة واسعة تناسب جميع الأذواق",
          en: "A wide variety for all tastes",
        },
        ctaText: { ar: "تصفحي الآن", en: "Browse Now" },
        isActive: false,
        productRef: await findProductId("عباية حرير طبيعي - فاخرة"),
      },
    ];

    await BestSellers.insertMany(configurations);
    console.log(
      `✅ Created ${configurations.length} BestSellers configurations\n`,
    );

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedBestSellers();
