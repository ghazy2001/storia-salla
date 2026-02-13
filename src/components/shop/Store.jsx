import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectProducts } from "../../store/slices/productSlice";
import ProductCarousel from "./ProductCarousel";
import { useAddToCart } from "../../hooks/useCart";
import Toast from "../common/Toast";
import { selectCategories } from "../../store/slices/productSlice";

gsap.registerPlugin(ScrollTrigger);

const Store = ({ initialFilter = "all", onProductSelect }) => {
  const containerRef = useRef(null);
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const [filter, setFilter] = useState(initialFilter);
  const [visibleProducts, setVisibleProducts] = useState([]); // Initialize with empty array
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { addToCart: addToCartWithSync } = useAddToCart();

  // Sync internal filter state when initialFilter prop changes (e.g. from Navbar)
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const handleAddToCart = async (payload) => {
    // payload is already { product, quantity, size } from CarouselInfo
    const { product, quantity, size } = payload;
    await addToCartWithSync(product, quantity, size);
    setShowToast(true);
  };

  useEffect(() => {
    // Filter products with animation
    const filtered =
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter);

    // Animate out
    if (containerRef.current) {
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
    } else {
      // Initial load or quick switch if ref is not ready
      setVisibleProducts(filtered);
    }
  }, [filter, products]);

  return (
    <section className="bg-brand-offwhite min-h-screen pt-32 pb-20 px-6 md:px-12 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col items-start mb-16 text-right">
        <h1 className="text-5xl md:text-7xl font-sans text-brand-charcoal mb-4">
          مجموعة ستوريا
        </h1>
        <p className="text-brand-charcoal/70 font-light text-lg md:text-xl max-w-2xl leading-relaxed">
          اختاري من مجموعتنا الفاخرة من العبايات المصممة بعناية لتناسب أناقتك في
          كل المناسبات
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-16 justify-start">
        {[{ id: "all", label: "جميع العبايات" }, ...categories].map((cat) => (
          <button
            key={cat.id || cat._id}
            onClick={() => setFilter(cat.id || cat.slug)}
            className={`px-6 py-2 border transition-all duration-300 text-sm md:text-base font-medium ${
              filter === (cat.id || cat.slug)
                ? "bg-brand-gold text-white border-brand-gold shadow-md"
                : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-gold hover:text-brand-gold"
            }`}
          >
            {typeof cat.name === "object" ? cat.name.ar : cat.label || cat.name}
          </button>
        ))}
      </div>

      {/* Product Carousels List */}
      <div ref={containerRef} className="flex flex-col gap-12">
        <Toast
          message="تمت إضافة المنتج إلى السلة بنجاح"
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          action={{
            label: "عرض السلة >>",
            onClick: () => navigate("/cart"),
          }}
        />
        {visibleProducts.map((product) => (
          <ProductCarousel
            key={product.id}
            product={product}
            onSelect={onProductSelect}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default Store;
