/**
 * Utility to format Mongoose product document for the frontend
 */
const formatProduct = (p) => {
  if (!p) return null;

  let price = p.price;
  if ((!price || price === 0) && p.sizeVariants && p.sizeVariants.length > 0) {
    price = Math.min(...p.sizeVariants.map((v) => v.price));
  }

  return {
    id: p._id.toString(),
    _id: p._id.toString(), // Keep for potential use
    name: p.name?.ar || p.name,
    price: price,
    formattedPrice: `${price} ${p.currency === "SAR" ? "ر.س" : p.currency}`,
    category: p.category,
    sizes: p.sizes,
    description: p.description?.ar || p.description,
    image:
      p.images?.find((img) => img.type === "image")?.url ||
      p.images?.[0]?.url ||
      "/assets/logo.png",
    media:
      p.images?.map((img) => ({
        type: img.type || "image",
        src: img.url,
      })) || [],
    stock: p.stock,
    isActive: p.isActive,
    sizeVariants: p.sizeVariants || [],
    isNew: false,
    rating: 5.0,
    reviews: 0,
  };
};

module.exports = { formatProduct };
