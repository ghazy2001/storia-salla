import React, { useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import gsap from "gsap";
import { getImageSrc } from "../../utils/assetUtils";

const CarouselMedia = ({ product, currentIndex, setCurrentIndex }) => {
  const mediaRef = useRef(null);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const currentMedia = product.media[currentIndex];

  useEffect(() => {
    gsap.fromTo(
      mediaRef.current,
      { opacity: 0.5 },
      { opacity: 1, duration: 0.5 },
    );
  }, [currentIndex]);

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % product.media.length);
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? product.media.length - 1 : prev - 1,
    );
  };

  // Swipe Logic
  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;

    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();

    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div
      className="relative w-full lg:w-1/2 aspect-[3/4] max-h-[80vh] overflow-hidden rounded-sm group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={mediaRef} className="w-full h-full bg-brand-charcoal/5">
        {currentMedia.type === "video" ? (
          <video
            src={getImageSrc(currentMedia.src)}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={getImageSrc(currentMedia.src)}
            alt={`${product.name} view ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
        )}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-gold hover:scale-110 transition-all duration-300"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={prevSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-gold hover:scale-110 transition-all duration-300"
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
  );
};

export default CarouselMedia;
