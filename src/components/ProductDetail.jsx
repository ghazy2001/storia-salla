import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart } from "lucide-react";
import { products } from "../data/products";

gsap.registerPlugin(ScrollTrigger);

const ProductDetail = ({ theme, goToProduct }) => {
  const containerRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [visibleProducts, setVisibleProducts] = useState(products);

  const categories = [
    { id: "all", label: "جميع العبايات" },
    { id: "official", label: "رسمية" },
    { id: "practical", label: "عملية" },
    { id: "luxury", label: "فاخرة" },
    { id: "cloche", label: "كلوش" },
    { id: "classic", label: "نواعم" },
  ];

  // Helper to translate category id to label for display on card
  const getCategoryLabel = (catId) => {
    return categories.find((c) => c.id === catId)?.label || "";
  };

  useEffect(() => {
    // Filter products with animation
    const filtered =
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter);

    // Animate out
    gsap.to(containerRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      stagger: 0.05,
      onComplete: () => {
        setVisibleProducts(filtered);
        // Animate in
        gsap.fromTo(
          containerRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.1,
            clearProps: "all",
          },
        );
      },
    });
  }, [filter]);

  return (
    // bg-brand-offwhite handled by CSS var(--bg-site) in body?
    // No, we should use explicit bg to ensure it covers.
    // But index.css sets body bg. So generic bg-transparent or bg-brand-offwhite is ok.
    // User requested "background use the light and dark mode".
    // In index.css, --bg-site changes.
    // So using `bg-brand-offwhite` (which is var(--bg-site)) is correct.
    <section className="bg-brand-offwhite min-h-screen pt-32 pb-20 px-6 md:px-12 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col items-end mb-16 text-right">
        <h1 className="text-5xl md:text-7xl font-sans text-brand-charcoal mb-4">
          مجموعة ستوريا
        </h1>
        <p className="text-brand-charcoal/70 font-light text-lg md:text-xl max-w-2xl leading-relaxed">
          اختاري من مجموعتنا الفاخرة من العبايات المصممة بعناية لتناسب أناقتك في
          كل المناسبات
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap flex-row-reverse gap-4 mb-12 justify-start">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-6 py-2 border transition-all duration-300 text-sm md:text-base font-medium ${
              filter === cat.id
                ? "bg-brand-gold text-white border-brand-gold shadow-md" // Active
                : theme === "green"
                  ? "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-gold hover:text-brand-gold" // Green Theme Inactive
                  : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-gold hover:text-brand-gold" // Burgundy Theme (handled via CSS vars usually, but hardcoded here for now. brand-charcoal changes with theme!)
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 rtl"
        dir="rtl"
      >
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => goToProduct(product)}
            className="group cursor-pointer flex flex-col gap-4"
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-white/5 shadow-sm border border-brand-charcoal/5">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/10 transition-all duration-300" />

              {/* Top Icons/Tags */}
              <button className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-gold hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                <Heart size={20} />
              </button>

              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-brand-charcoal/10 backdrop-blur-md text-brand-charcoal text-xs font-bold uppercase tracking-wider border border-brand-charcoal/20">
                  {getCategoryLabel(product.category)}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="text-right">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-sans text-lg text-brand-charcoal group-hover:text-brand-gold transition-colors duration-300 line-clamp-1">
                  {product.name}
                </h3>
              </div>
              <p className="text-brand-gold font-medium font-sans">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductDetail;
