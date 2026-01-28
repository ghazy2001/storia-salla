import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useCart } from "../context/useCart";
import { Heart, ShoppingBag } from "lucide-react";

const Store = ({ theme }) => {
  const { addToCart } = useCart();
  const containerRef = useRef(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [wishlist, setWishlist] = useState([]);

  const allProducts = [
    {
      id: 1,
      name: "عباية سوداء رسمية - كريب ملكي",
      category: "formal",
      price: "390 ر.س",
      image: "/assets/product1.png",
      description: "عباية فاخرة من كريب ملكي مع تفاصيل دقيقة",
      rating: 4.8,
      reviews: 24,
    },
    {
      id: 2,
      name: "عباية كلوش - قماش إنترنت ناعم",
      category: "casual",
      price: "350 ر.س",
      image: "/assets/product2.png",
      description: "عباية كلوش عملية وأنيقة للاستخدام اليومي",
      rating: 4.6,
      reviews: 18,
    },
    {
      id: 3,
      name: "عباية بشت مطرزة - شك يدوي",
      category: "premium",
      price: "480 ر.س",
      image: "/assets/product3.png",
      description: "عباية بشت بتطريز يدوي فاخر للمناسبات الخاصة",
      rating: 4.9,
      reviews: 32,
    },
    {
      id: 4,
      name: "عباية نواعم - تصميم كلاسيكي",
      category: "formal",
      price: "320 ر.س",
      image: "/assets/product1.png",
      description: "عباية كلاسيكية أنيقة من أفضل الأقمشة",
      rating: 4.5,
      reviews: 15,
    },
    {
      id: 5,
      name: "عباية رسمية بتطريز هادئ",
      category: "formal",
      price: "420 ر.س",
      image: "/assets/product2.png",
      description: "عباية رسمية بتطريز هادئ لجميع المناسبات",
      rating: 4.7,
      reviews: 21,
    },
    {
      id: 6,
      name: "عباية عملية يومية بجيوب",
      category: "casual",
      price: "290 ر.س",
      image: "/assets/product3.png",
      description: "عباية عملية بجيوب واسعة للاستخدام اليومي",
      rating: 4.4,
      reviews: 12,
    },
    {
      id: 7,
      name: "عباية حرير طبيعي سوداء",
      category: "premium",
      price: "550 ر.س",
      image: "/assets/product1.png",
      description: "عباية من حرير طبيعي خالص للأناقة القصوى",
      rating: 4.9,
      reviews: 28,
    },
    {
      id: 8,
      name: "عباية بتطريز ذهبي",
      category: "premium",
      price: "500 ر.س",
      image: "/assets/product2.png",
      description: "عباية فاخرة بتطريز ذهبي بارز",
      rating: 4.8,
      reviews: 25,
    },
  ];

  const categories = [
    { value: "all", label: "جميع العبايات" },
    { value: "casual", label: "عملية" },
    { value: "formal", label: "رسمية" },
    { value: "premium", label: "فاخرة" },
  ];

  const filteredProducts = allProducts.filter(
    (product) =>
      filterCategory === "all" || product.category === filterCategory,
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^\d.-]/g, ""));
    const priceB = parseFloat(b.price.replace(/[^\d.-]/g, ""));

    switch (sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".store-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [sortedProducts]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  return (
    <section
      ref={containerRef}
      className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-500 ${
        theme === "green" ? "bg-brand-offwhite" : "bg-brand-charcoal"
      }`}
    >
      {/* Header */}
      <div
        className={`mb-16 text-right ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
      >
        <h1 className="text-5xl md:text-6xl font-serif italic mb-4">
          مجموعة ستوريا
        </h1>
        <p
          className={`text-lg mb-12 ${theme === "green" ? "text-brand-charcoal/70" : "text-white/70"}`}
        >
          اختاري من مجموعتنا الفاخرة من العبايات المصممة بعناية
        </p>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row gap-6 justify-end mb-12">
          {/* Category Filter */}
          <div className="flex gap-3 flex-wrap justify-end">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-6 py-2 border-2 uppercase text-sm tracking-widest transition-all duration-300 ${
                  filterCategory === cat.value
                    ? theme === "green"
                      ? "bg-brand-gold text-brand-charcoal border-brand-gold"
                      : "bg-brand-gold text-brand-charcoal border-brand-gold"
                    : theme === "green"
                      ? "border-brand-charcoal/30 text-brand-charcoal hover:border-brand-gold"
                      : "border-white/30 text-white hover:border-brand-gold"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-6 py-2 border-2 uppercase text-sm tracking-widest font-medium transition-all duration-300 ${
              theme === "green"
                ? "bg-white border-brand-charcoal/30 text-brand-charcoal"
                : "bg-brand-charcoal border-white/30 text-white"
            }`}
          >
            <option value="newest">الأحدث</option>
            <option value="price-low">السعر: الأقل أولاً</option>
            <option value="price-high">السعر: الأعلى أولاً</option>
            <option value="rating">التقييم الأعلى</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {sortedProducts.map((product) => (
          <div key={product.id} className="store-card group">
            <div
              className={`relative overflow-hidden aspect-[3/4] mb-6 border ${
                theme === "green"
                  ? "border-brand-charcoal/10 hover:border-brand-gold"
                  : "border-white/10 hover:border-brand-gold"
              } transition-all duration-300`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart(product, 1, "54")}
                className="absolute bottom-4 right-4 left-4 bg-brand-gold text-brand-charcoal py-3 uppercase text-sm font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 hover:shadow-lg active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingBag size={18} />
                  أضيفي للحقيبة
                </div>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  wishlist.includes(product.id)
                    ? "bg-brand-gold text-brand-charcoal"
                    : theme === "green"
                      ? "bg-white/20 text-white hover:bg-brand-gold hover:text-brand-charcoal"
                      : "bg-white/20 text-white hover:bg-brand-gold hover:text-brand-charcoal"
                }`}
              >
                <Heart
                  size={18}
                  fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                />
              </button>

              {/* Category Badge */}
              <div className="absolute top-4 right-4 bg-brand-gold/90 text-brand-charcoal px-3 py-1 text-xs uppercase tracking-widest font-bold rounded-full">
                {categories.find((c) => c.value === product.category)?.label}
              </div>
            </div>

            {/* Product Info */}
            <div
              className={
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }
            >
              <h3 className="font-serif italic text-lg mb-2 line-clamp-2 hover:text-brand-gold transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center justify-between mb-3">
                <span className="text-brand-gold font-bold text-lg">
                  {product.price}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={
                      theme === "green"
                        ? "text-brand-charcoal/60"
                        : "text-white/60"
                    }
                  >
                    ({product.reviews})
                  </span>
                  <span className="text-brand-gold">★ {product.rating}</span>
                </div>
              </div>

              <p
                className={`text-sm line-clamp-2 ${
                  theme === "green" ? "text-brand-charcoal/60" : "text-white/60"
                }`}
              >
                {product.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-24">
          <p
            className={`text-xl ${
              theme === "green" ? "text-brand-charcoal/60" : "text-white/60"
            }`}
          >
            لم نجد منتجات تطابق معاييرك
          </p>
        </div>
      )}
    </section>
  );
};

export default Store;
