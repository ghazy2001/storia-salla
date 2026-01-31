import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/useCart";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const BestSellers = ({ theme, onProductSelect }) => {
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const { products } = useProducts();
  const { setCurrentPage } = useCart();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Featured product for the banner - نواعم (classic category)
  const featuredProduct =
    products.find((p) => p.category === "classic") || products[0];

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

  // Handle body scroll lock when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [lightboxOpen]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateLightbox = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + carouselImages.length) % carouselImages.length,
      );
    }
  };

  if (!featuredProduct) return null;

  return (
    <>
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
              <h2 className="text-4xl md:text-5xl font-sans text-white mb-2">
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
          <div className="w-full lg:w-[60%] flex flex-col justify-center group/carousel">
            <div className="relative">
              {/* New Side Navigation Arrows (Mobile/Tablet Visible) */}
              <button
                onClick={() => scroll("left")}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 disabled:opacity-0 md:hidden backdrop-blur-md border ${
                  theme === "green"
                    ? "bg-white/70 border-brand-charcoal/10 text-brand-charcoal hover:bg-white"
                    : "bg-black/30 border-white/10 text-white hover:bg-black/50"
                }`}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 disabled:opacity-0 md:hidden backdrop-blur-md border ${
                  theme === "green"
                    ? "bg-white/70 border-brand-charcoal/10 text-brand-charcoal hover:bg-white"
                    : "bg-black/30 border-white/10 text-white hover:bg-black/50"
                }`}
              >
                <ArrowRight size={20} />
              </button>

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
                        onClick={() => openLightbox(index)}
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
                            onProductSelect(featuredProduct.id);
                          }}
                          className="group/btn absolute bottom-4 left-4 h-10 bg-white text-black rounded-full flex items-center overflow-hidden transition-all duration-300 hover:w-32 w-10 shadow-lg z-10"
                          title="View Details"
                        >
                          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover/btn:text-brand-gold transition-colors">
                            <ArrowRight size={20} className="-rotate-45" />
                          </div>
                          <span className="whitespace-nowrap text-xs font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pr-2">
                            التفاصيل
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation & Info */}
            <div
              className={`flex justify-between items-center px-8 mt-6 gap-12 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
            >
              <div className="w-full text-right">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-brand-gold text-3xl font-bold">
                    {featuredProduct.price}
                  </div>
                </div>
                <p
                  className={`${theme === "green" ? "text-brand-charcoal" : "text-white"} opacity-80 text-lg font-light leading-relaxed`}
                >
                  {featuredProduct.bestSellerDescription ||
                    featuredProduct.description}
                </p>
              </div>

              <div className="gap-4 hidden md:flex">
                {/* Hidden on mobile, flex on md */}
                <button
                  onClick={() => scroll("left")}
                  className={`group/arrow transition-all duration-300 p-3 border rounded-full ${
                    theme === "green"
                      ? "border-brand-charcoal/20 hover:bg-brand-charcoal hover:text-white"
                      : "border-white/20 hover:bg-white hover:text-custom-burgundy"
                  }`}
                >
                  <ArrowLeft size={24} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className={`group/arrow transition-all duration-300 p-3 border rounded-full ${
                    theme === "green"
                      ? "border-brand-charcoal/20 hover:bg-brand-charcoal hover:text-white"
                      : "border-white/20 hover:bg-white hover:text-custom-burgundy"
                  }`}
                >
                  <ArrowRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-[101] text-white hover:text-brand-gold transition-colors p-2 rounded-full bg-white/10 backdrop-blur-sm"
          >
            <X size={32} />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("prev");
            }}
            className="absolute left-6 z-[101] text-white hover:text-brand-gold transition-colors p-3 rounded-full bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("next");
            }}
            className="absolute right-6 z-[101] text-white hover:text-brand-gold transition-colors p-3 rounded-full bg-white/10 backdrop-blur-sm"
          >
            <ArrowRight size={32} />
          </button>

          {/* Image */}
          <img
            src={carouselImages[currentImageIndex]?.src}
            alt={`${featuredProduct.name} - ${currentImageIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {carouselImages.length}
          </div>
        </div>
      )}
    </>
  );
};

export default BestSellers;
