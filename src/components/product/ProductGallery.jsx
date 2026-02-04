import React from "react";
import { resolveAsset } from "../../utils/assetUtils";

/**
 * ProductGallery Component
 *
 * Displays the product's image/video gallery with swipe support.
 *
 * Props:
 * @param {Object} product - The product object containing media array
 * @param {number} activeMedia - Currently active media index
 * @param {Function} setActiveMedia - State setter for active media index
 */
const ProductGallery = ({ product, activeMedia, setActiveMedia }) => {
  return (
    <div className="flex flex-col gap-4 lg:order-2">
      <div
        className="relative aspect-[3/4] bg-brand-beige rounded-4xl overflow-hidden shadow-sm group"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          e.currentTarget.touchStartX = touch.clientX;
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          e.currentTarget.touchEndX = touch.clientX;
        }}
        onTouchEnd={(e) => {
          const target = e.currentTarget;
          if (!target.touchStartX || !target.touchEndX) return;
          const distance = target.touchStartX - target.touchEndX;
          const isLeftSwipe = distance > 50;
          const isRightSwipe = distance < -50;

          if (isLeftSwipe) {
            setActiveMedia((prev) => (prev + 1) % product.media.length);
          } else if (isRightSwipe) {
            setActiveMedia((prev) =>
              prev === 0 ? product.media.length - 1 : prev - 1,
            );
          }
          target.touchStartX = null;
          target.touchEndX = null;
        }}
      >
        {product.media[activeMedia].type === "video" ? (
          <video
            src={resolveAsset(product.media[activeMedia].src)}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={resolveAsset(product.media[activeMedia].src)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x dir-rtl">
        {product.media.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveMedia(index)}
            className={`relative w-20 h-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
              activeMedia === index ? "border-brand-rose" : "border-transparent"
            }`}
          >
            {item.type === "video" ? (
              <div className="w-full h-full bg-black/10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-brand-charcoal border-b-4 border-b-transparent ml-1"></div>
                </div>
              </div>
            ) : (
              <img
                src={resolveAsset(item.src)}
                className="w-full h-full object-cover"
                alt=""
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
