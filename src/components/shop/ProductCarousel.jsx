import React, { useState } from "react";
import CarouselMedia from "./CarouselMedia";
import CarouselInfo from "./CarouselInfo";

const ProductCarousel = ({ product, onSelect, onAddToCart, disabled }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstImageIndex = product.media.findIndex((m) => m.type === "image");
    return firstImageIndex >= 0 ? firstImageIndex : 0;
  });

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-16 items-center py-12 border-b border-brand-charcoal/10 last:border-0">
      <CarouselInfo
        product={product}
        onSelect={onSelect}
        onAddToCart={onAddToCart}
        disabled={disabled}
      />
      <CarouselMedia
        product={product}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
};

export default ProductCarousel;
