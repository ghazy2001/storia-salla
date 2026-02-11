require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const originalProducts = [
  {
    name: "عباية سوداء رسمية - كريب ملكي",
    price: "390 ر.س",
    category: "official",
    sizes: ["S", "M", "L", "XL"],
    description:
      "عباية سوداء رسمية مصنوعة من الكريب الملكي الفاخر. تتميز بتصميم كلاسيكي يجمع بين الفخامة والعملية، مع قصّة منسدلة تمنحك إطلالة راقية في المناسبات الرسمية والعمل.",
    image: "/assets/products/p01/p01_1.jpg",
  },
  {
    name: "عباية كلوش - قماش إنترنت ناعم",
    price: "350 ر.س",
    category: "cloche",
    sizes: ["S", "M", "L", "XL"],
    description:
      "عباية بقصة كلوش واسعة تمنحك حرية الحركة وأناقة استثنائية. مصممة من قماش الإنترنت الناعم الذي يتميز ببرودة ونعومة فائقة، مثالية للاستخدام اليومي.",
    image: "/assets/products/p02/p02_1.jpg",
  },
  {
    name: "عباية بشت مطرزة - شك يدوي",
    price: "480 ر.س",
    category: "bisht",
    sizes: ["S", "M", "L", "XL"],
    description:
      "تحفة فنية بتصميم البشت التقليدي مع لمسات عصرية، مزينة بشك يدوي دقيق يضيف بريقاً هادئاً وفخامة لا تضاهى. الخيار الأمثل للمناسبات الخاصة.",
    image: "/assets/products/p03/p03_1.jpg",
  },
  {
    name: "عباية نواعم - تصميم كلاسيكي",
    price: "320 ر.س",
    category: "classic",
    sizes: ["S", "M", "L", "XL"],
    description:
      "البساطة هي عنوان الأناقة.، تصميم نواعم الكلاسيكي يبرز جمالك الطبيعي بتفاصيل هادئة وخامة عملية مريحة تدوم طويلاً.",
    image: "/assets/products/p04/p04_1.jpg",
  },
  {
    name: "عباية رسمية بتطريز هادئ",
    price: "420 ر.س",
    category: "official",
    sizes: ["S", "M", "L", "XL"],
    description:
      "توازن مثالي بين الرسمية والأنوثة. تتميز بتطريزات ناعمة على الأكمام والياقة، تضفي لمسة جمالية دون مبالغة.",
    image: "/assets/products/p05/p05_1.jpg",
  },
  {
    name: "عباية عملية يومية بجيوب",
    price: "290 ر.س",
    category: "practical",
    sizes: ["S", "M", "L", "XL"],
    description:
      "الرفيق المثالي لروتينك اليومي. مصممة لتكون عملية ومريحة، مع جيوب مخفية وقماش يتحمل الاستخدام المتكرر دون فقدان رونقه.",
    image: "/assets/products/p06/p06_1.jpg",
  },
  {
    name: "عباية حرير طبيعي - فاخرة",
    price: "550 ر.س",
    category: "luxury",
    sizes: ["S", "M", "L", "XL"],
    description:
      "قمة الفخامة والنعومة. عباية منسوجة من مزيج الحرير الطبيعي، تمنحك ملمساً لا يضاهى ومظهراً يفيض بالرقي والجاذبية.",
    image: "/assets/products/p07/p07_1.jpg",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const p of originalProducts) {
      // Clean price string
      const priceNum = parseFloat(p.price.replace(/[^\d.]/g, ""));

      const productData = {
        name: { ar: p.name, en: p.name },
        description: { ar: p.description, en: p.description },
        price: priceNum,
        category: p.category,
        sizes: p.sizes,
        images: [{ url: p.image, alt: p.name }],
        isActive: true,
        stock: 10,
      };

      // Check if product exists to avoid duplicates
      const exists = await Product.findOne({ "name.ar": p.name });
      if (!exists) {
        await new Product(productData).save();
        console.log(`Seeded: ${p.name}`);
      } else {
        console.log(`Skipped (already exists): ${p.name}`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
