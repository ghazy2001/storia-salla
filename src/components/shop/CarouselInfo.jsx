import React, { useState } from "react";

const CarouselInfo = ({ product, onSelect, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(() => {
    return product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
  });

  return (
    <div
      className="w-full lg:w-1/2 text-right flex flex-col items-start"
      dir="rtl"
    >
      <h2 className="text-3xl lg:text-5xl font-sans text-brand-charcoal mb-4">
        {product.name}
      </h2>
      <p className="text-brand-gold text-2xl font-sans mb-6 font-medium">
        {(() => {
          if (selectedSize && product.sizeVariants?.length > 0) {
            const variant = product.sizeVariants.find(
              (v) => v.size === selectedSize,
            );
            if (variant) return variant.price;
          }
          return product.price;
        })()}{" "}
        ر.س
      </p>
      <p className="text-brand-charcoal/70 text-lg leading-relaxed max-w-xl mb-8">
        {product.description}
      </p>

      {/* Available Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-brand-charcoal/60 mb-3">
            المقاسات المتاحة:
          </p>
          <div className="flex gap-3 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-6 py-2 border rounded-sm transition-all duration-300 ${
                  selectedSize === size
                    ? "bg-brand-gold text-white border-brand-gold"
                    : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-gold hover:text-brand-gold"
                }`}
              >
                {size}
              </button>
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
            // Get price and variantId for selected size if available
            let price = product.price;
            let variantId = null;
            if (selectedSize && product.sizeVariants?.length > 0) {
              const variant = product.sizeVariants.find(
                (v) => v.size === selectedSize,
              );
              if (variant) {
                price = variant.price;
                variantId = variant.sallaVariantId;
              }
            }

            onAddToCart &&
              onAddToCart({
                product: { ...product, price },
                quantity: 1,
                size: variantId || selectedSize,
              });
          }}
          className="px-8 py-3 border border-brand-charcoal text-brand-charcoal hover:bg-brand-gold hover:border-brand-gold hover:text-white transition-all duration-300 text-lg font-medium rounded-sm"
        >
          إضافة للسلة
        </button>
      </div>
    </div>
  );
};

export default CarouselInfo;
