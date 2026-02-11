const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");
const BestSellers = require("./models/BestSellers");
const Category = require("./models/Category");

const seedAll = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear everything
    console.log("🗑️ Clearing existing data...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await BestSellers.deleteMany({});
    console.log("✅ Database cleared\n");

    // 1. Seed Categories
    console.log("📁 Seeding categories...");
    const categoriesData = [
      { slug: "classic", name: { ar: "كلاسيك", en: "Classic" } },
      { slug: "official", name: { ar: "رسمي", en: "Official" } },
      { slug: "cloche", name: { ar: "كلوش", en: "Cloche" } },
      { slug: "bisht", name: { ar: "بشت", en: "Bisht" } },
      { slug: "practical", name: { ar: "عملي", en: "Practical" } },
      { slug: "luxury", name: { ar: "فاخر", en: "Luxury" } },
    ];
    await Category.insertMany(categoriesData);
    console.log(`✅ Created ${categoriesData.length} categories\n`);

    // 2. Seed Products
    console.log("📦 Seeding products...");
    const productsData = [
      {
        name: "عباية سوداء رسمية - كريب ملكي",
        price: 390,
        category: "official",
        sizes: ["S", "M", "L", "XL"],
        description:
          "عباية سوداء رسمية مصنوعة من الكريب الملكي الفاخر. تتميز بتصميم كلاسيكي يجمع بين الفخامة والعملية، مع قصّة منسدلة تمنحك إطلالة راقية في المناسبات الرسمية والعمل.",
        imagePrefix: "p01",
        imageCount: 7,
      },
      {
        name: "عباية كلوش - قماش إنترنت ناعم",
        price: 350,
        category: "cloche",
        sizes: ["S", "M", "L", "XL"],
        description:
          "عباية بقصة كلوش واسعة تمنحك حرية الحركة وأناقة استثنائية. مصممة من قماش الإنترنت الناعم الذي يتميز ببرودة ونعومة فائقة، مثالية للاستخدام اليومي.",
        imagePrefix: "p02",
        imageCount: 6,
      },
      {
        name: "عباية بشت مطرزة - شك يدوي",
        price: 480,
        category: "bisht",
        sizes: ["S", "M", "L", "XL"],
        description:
          "تحفة فنية بتصميم البشت التقليدي مع لمسات عصرية، مزينة بشك يدوي دقيق يضيف بريقاً هادئاً وفخامة لا تضاهى. الخيار الأمثل للمناسبات الخاصة.",
        imagePrefix: "p03",
        imageCount: 9,
      },
      {
        name: "عباية نواعم - تصميم كلاسيكي",
        price: 320,
        category: "classic",
        sizes: ["S", "M", "L", "XL"],
        description:
          "البساطة هي عنوان الأناقة.، تصميم نواعم الكلاسيكي يبرز جمالك الطبيعي بتفاصيل هادئة وخامة عملية مريحة تدوم طويلاً.",
        imagePrefix: "p04",
        imageCount: 8,
      },
      {
        name: "عباية رسمية بتطريز هادئ",
        price: 420,
        category: "official",
        sizes: ["S", "M", "L", "XL"],
        description:
          "توازن مثالي بين الرسمية والأنوثة. تتميز بتطريزات ناعمة على الأكمام والياقة، تضفي لمسة جمالية دون مبالغة.",
        imagePrefix: "p05",
        imageCount: 6,
      },
      {
        name: "عباية عملية يومية بجيوب",
        price: 290,
        category: "practical",
        sizes: ["S", "M", "L", "XL"],
        description:
          "الرفيق المثالي لروتينك اليومي. مصممة لتكون عملية ومريحة، مع جيوب مخفية وقماش يتحمل الاستخدام المتكرر دون فقدان رونقه.",
        imagePrefix: "p06",
        imageCount: 6,
      },
      {
        name: "عباية حرير طبيعي - فاخرة",
        price: 550,
        category: "luxury",
        sizes: ["S", "M", "L", "XL"],
        description:
          "قمة الفخامة والنعومة. عباية منسوجة من مزيج الحرير الطبيعي، تمنحك ملمساً لا يضاهى ومظهراً يفيض بالرقي والجاذبية.",
        imagePrefix: "p07",
        imageCount: 6,
      },
    ];

    const seededProducts = [];
    for (const p of productsData) {
      const media = [];
      for (let i = 1; i <= p.imageCount; i++) {
        media.push({
          url: `/assets/products/${p.imagePrefix}/${p.imagePrefix}_${i}.jpg`,
          alt: p.name,
          type: "image",
          order: i,
        });
      }

      const product = await new Product({
        name: { ar: p.name, en: p.name },
        description: { ar: p.description, en: p.description },
        price: p.price,
        category: p.category,
        sizes: p.sizes,
        images: media,
        isActive: true,
        stock: 10,
      }).save();

      seededProducts.push(product);
      console.log(`✅ Seeded product: ${p.name}`);
    }
    console.log(`\n✅ Created ${seededProducts.length} products\n`);

    // 3. Seed BestSellers
    console.log("🌟 Seeding BestSellers...");

    // Helper to generate media for BestSellers (same as product gallery)
    const getProductMedia = (product) => {
      return product.images.map((img) => ({
        type: img.type,
        src: img.url,
        order: img.order,
      }));
    };

    const bestSellersData = [
      {
        product: seededProducts.find(
          (p) => p.name.ar === "عباية بشت مطرزة - شك يدوي",
        ),
        title: { ar: "نواعم القصيم", en: "Nawaem Al Qassim" },
        description: {
          ar: "عباية كلاسيكية ناعمة بتصميم أنيق يناسب جميع الأوقات",
          en: "Elegant classic abaya for all occasions",
        },
        bannerText: { ar: "الأكثر مبيعاً", en: "Best Sellers" },
        bannerSubtext: {
          ar: "تسوق افضل المنتجات المختارة لك خصيصا",
          en: "Shop our specially selected best sellers",
        },
        isActive: true,
      },
      {
        product: seededProducts.find(
          (p) => p.name.ar === "عباية سوداء رسمية - كريب ملكي",
        ),
        title: { ar: "بشت ملكي", en: "Royal Bisht" },
        description: {
          ar: "عباية بشت ملكي بتطريز فاخر وقماش عالي الجودة",
          en: "Royal bisht abaya with luxury embroidery",
        },
        bannerText: { ar: "كولكشن جديد", en: "New Collection" },
        bannerSubtext: {
          ar: "اكتشفي الفخامة في كل تفصيلة",
          en: "Discover luxury in every detail",
        },
        isActive: false,
      },
      {
        product: seededProducts.find(
          (p) => p.name.ar === "عباية كلوش - قماش إنترنت ناعم",
        ),
        title: { ar: "كلوش فرنسي", en: "French Cloche" },
        description: {
          ar: "تصميم كلوش عصري يجمع بين الراحة والأناقة",
          en: "Modern cloche design combining comfort and style",
        },
        bannerText: { ar: "الأكثر طلباً", en: "Most Wanted" },
        bannerSubtext: {
          ar: "القطع المفضلة لدى عميلاتنا",
          en: "Our customers' favorite pieces",
        },
        isActive: false,
      },
      {
        product: seededProducts.find(
          (p) => p.name.ar === "عباية نواعم - تصميم كلاسيكي",
        ),
        title: { ar: "رسمية نجد", en: "Najd Official" },
        description: {
          ar: "عباية رسمية مثالية للعمل والمناسبات الخاصة",
          en: "Official abaya perfect for work and special events",
        },
        bannerText: { ar: "عروض خاصة", en: "Special Offers" },
        bannerSubtext: {
          ar: "أفضل الأسعار لأجمل التصاميم",
          en: "Best prices for the most beautiful designs",
        },
        isActive: false,
      },
      {
        product: seededProducts.find(
          (p) => p.name.ar === "عباية رسمية بتطريز هادئ",
        ),
        title: { ar: "عملية يومية", en: "Daily Practical" },
        description: {
          ar: "عباية عملية مريحة للاستخدام يومي المستمر",
          en: "Comfortable practical abaya for daily use",
        },
        bannerText: { ar: "وصلنا حديثاً", en: "Just Arrived" },
        bannerSubtext: {
          ar: "أحدث صيحات العبايات الخليجية",
          en: "The latest trends in Gulf abayas",
        },
        isActive: false,
      },
      {
        product: seededProducts.find(
          (p) => p.name.ar === "عباية عملية يومية بجيوب",
        ),
        title: { ar: "فخامة ستوريا", en: "Storia Luxury" },
        description: {
          ar: "تصميم فاخر من ستوريا يعكس الذوق الرفيع",
          en: "Luxury design from Storia reflecting fine taste",
        },
        bannerText: { ar: "إصدار محدود", en: "Limited Edition" },
        bannerSubtext: {
          ar: "قطع حصرية للمتميزات فقط",
          en: "Exclusive pieces for distinguished ladies only",
        },
        isActive: false,
      },
      {
        product: seededProducts.find(
          (p) => p.name.ar === "عباية حرير طبيعي - فاخرة",
        ),
        title: { ar: "كلاسيك مودرن", en: "Modern Classic" },
        description: {
          ar: "لمسة عصرية على العباية الكلاسيكية السوداء",
          en: "A modern touch on the classic black abaya",
        },
        bannerText: { ar: "تصاميم مختارة", en: "Selected Designs" },
        bannerSubtext: {
          ar: "تشكيلة واسعة تناسب جميع الأذواق",
          en: "A wide variety for all tastes",
        },
        isActive: false,
      },
    ];

    for (const bs of bestSellersData) {
      if (!bs.product) continue;

      await new BestSellers({
        title: bs.title,
        description: bs.description,
        price: bs.product.price,
        currency: "SAR",
        category: bs.product.category,
        media: getProductMedia(bs.product),
        bannerText: bs.bannerText,
        bannerSubtext: bs.bannerSubtext,
        ctaText: { ar: "تسوق الآن", en: "Shop Now" },
        isActive: bs.isActive,
        productRef: bs.product._id.toString(),
      }).save();
      console.log(`✅ Seeded BestSeller: ${bs.title.ar}`);
    }

    console.log("\n🎉 ALL SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedAll();
