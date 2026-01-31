import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import gsap from "gsap";

const ProductCarousel = ({ product, onSelect, onAddToCart }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstImageIndex = product.media.findIndex((m) => m.type === "image");
    return firstImageIndex >= 0 ? firstImageIndex : 0;
  });
  const mediaRef = useRef(null);
  const infoRef = useRef(null);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % product.media.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? product.media.length - 1 : prev - 1,
    );
  };

  const currentMedia = product.media[currentIndex];

  useEffect(() => {
    // Simple fade animation when index changes
    gsap.fromTo(
      mediaRef.current,
      { opacity: 0.5 },
      { opacity: 1, duration: 0.5 },
    );
  }, [currentIndex]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-16 items-center py-12 border-b border-brand-charcoal/10 last:border-0">
      {/* Info Section - Now First (Right in RTL) */}
      <div
        ref={infoRef}
        className="w-full lg:w-1/2 text-right flex flex-col items-start"
        dir="rtl"
      >
        <h2 className="text-3xl lg:text-5xl font-sans text-brand-charcoal mb-4">
          {product.name}
        </h2>
        <p className="text-brand-gold text-2xl font-sans mb-6 font-medium">
          {product.price}
        </p>
        <p className="text-brand-charcoal/70 text-lg leading-relaxed max-w-xl mb-8">
          {product.description}
        </p>

        {/* Available Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-brand-charcoal/60 mb-2">
              المقاسات المتاحة:
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="px-3 py-1 border border-brand-charcoal/20 text-brand-charcoal text-sm rounded"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => onSelect && onSelect(product.id)}
            className="px-8 py-3 bg-brand-charcoal text-brand-offwhite hover:bg-brand-gold transition-colors duration-300 text-lg font-medium rounded-sm"
          >
            عرض التفاصيل
          </button>

          <button
            onClick={() => {
              if (product.sizes && product.sizes.length > 0) {
                onAddToCart &&
                  onAddToCart({ ...product, selectedSize: product.sizes[0] });
              } else {
                onAddToCart && onAddToCart(product);
              }
            }}
            className="px-8 py-3 border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-offwhite transition-all duration-300 text-lg font-medium rounded-sm"
          >
            إضافة للسلة
          </button>
        </div>
      </div>

      {/* Carousel Section - Now Second (Left in RTL) */}
      <div
        className="relative w-full lg:w-1/2 aspect-[3/4] max-h-[80vh] overflow-hidden rounded-sm group"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          mediaRef.current.touchStartX = touch.clientX;
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          mediaRef.current.touchEndX = touch.clientX;
        }}
        onTouchEnd={() => {
          if (!mediaRef.current.touchStartX || !mediaRef.current.touchEndX)
            return;
          const distance =
            mediaRef.current.touchStartX - mediaRef.current.touchEndX;
          const isLeftSwipe = distance > 50;
          const isRightSwipe = distance < -50;

          if (isLeftSwipe) {
            // Next Slide logic
            setCurrentIndex((prev) => (prev + 1) % product.media.length);
          } else if (isRightSwipe) {
            // Prev Slide logic
            setCurrentIndex((prev) =>
              prev === 0 ? product.media.length - 1 : prev - 1,
            );
          }
          // Reset
          mediaRef.current.touchStartX = null;
          mediaRef.current.touchEndX = null;
        }}
      >
        <div ref={mediaRef} className="w-full h-full bg-brand-charcoal/5">
          {currentMedia.type === "video" ? (
            <video
              src={currentMedia.src}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={currentMedia.src}
              alt={`${product.name} view ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
          )}
        </div>

        {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-gold hover:scale-110 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-gold hover:scale-110 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {product.media.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
