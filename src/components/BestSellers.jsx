import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/useCart";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const BestSellers = ({ theme, onProductSelect }) => {
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const { products } = useProducts();
  const { addToCart, setCurrentPage } = useCart();

  // Featured product for the banner (using the first one as an example)
  const featuredProduct = products[0];

  // Carousel images: Get media from the featured product
  // Fallback to just the main image if no media array
  const carouselImages =
    featuredProduct?.media?.filter((m) => m.type === "image") ||
    (featuredProduct ? [{ src: featuredProduct.image, type: "image" }] : []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple fade in for the whole section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!featuredProduct) return null;

  return (
    <section
      ref={sectionRef}
      className={`py-12 md:py-24 px-6 md:px-12 transition-colors duration-500 overflow-hidden ${
        theme === "green" ? "bg-white" : "bg-brand-burgundy"
      }`}
    >
      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-8 h-full">
        {/* RIGHT SIDE: Banner (RTL First) */}
        <div className="w-full lg:w-[40%] text-right relative h-[600px] lg:h-[700px] rounded-3xl overflow-hidden group shadow-2xl">
          {/* Banner Image */}
          <div className="absolute inset-0">
            <img
              src={carouselImages[0]?.src || featuredProduct.image}
              alt={featuredProduct.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

          {/* Banner Content */}
          <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-2">
              الأكثر مبيعاً
            </h2>
            <p className="text-white/80 text-lg mb-8 font-light">
              تسوق افضل المنتجات المختارة لك خصيصا
            </p>

            <button
              onClick={() => setCurrentPage("store")}
              className="px-10 py-3 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300"
            >
              تسوق الآن
            </button>
          </div>
        </div>

        {/* LEFT SIDE: Carousel */}
        <div className="w-full lg:w-[60%] flex flex-col justify-center">
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 snap-x scrollbar-hide scroll-smooth"
            style={{ direction: "rtl" }}
          >
            {carouselImages.map((mediaItem, index) => (
              <div
                key={index}
                className="min-w-[280px] md:min-w-[320px] snap-start group relative"
              >
                {/* Card Container */}
                <div
                  className={`rounded-[2rem] p-2 transition-all duration-300 hover:shadow-xl ${theme === "green" ? "bg-[#F9F9F9]" : "bg-white/5 border border-white/10"}`}
                >
                  {/* Image Area */}
                  <div
                    onClick={() => onProductSelect(featuredProduct.id)}
                    className="aspect-[3/4] rounded-3xl overflow-hidden mb-4 relative cursor-pointer"
                  >
                    <img
                      src={mediaItem.src}
                      alt={`${featuredProduct.name} - View ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Add to Cart Button (Absolute) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(featuredProduct);
                      }}
                      className="group/btn absolute bottom-4 left-4 h-10 bg-white text-black rounded-full flex items-center overflow-hidden transition-all duration-300 hover:w-32 w-10 shadow-lg z-10"
                      title="Add to Cart"
                    >
                      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover/btn:text-brand-gold transition-colors">
                        <Plus size={20} />
                      </div>
                      <span className="whitespace-nowrap text-xs font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pr-2">
                        أضف للسلة
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation & Info */}
          <div
            className={`flex justify-between items-center px-8 mt-6 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
          >
            <p className="max-w-md text-right opacity-80 text-lg font-light leading-relaxed hidden md:block">
              تصفحي تشكيلة مميزة من العبايات المصممة بأعلى معايير الجودة
              والأناقة لتناسب جميع مناسباتك.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => scroll("right")}
                className="hover:scale-110 transition-transform p-2 border border-current rounded-full"
              >
                <ArrowLeft size={24} />
              </button>
              <button
                onClick={() => scroll("left")}
                className="hover:scale-110 transition-transform p-2 border border-current rounded-full"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
