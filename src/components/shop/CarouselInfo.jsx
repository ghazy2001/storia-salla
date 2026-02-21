import React, { useState } from "react";

/**
 * CarouselInfo Component - V20.3 with Size Selector
 * Store listing card: title, price, sizes, and add to cart.
 */
const CarouselInfo = ({ product, onSelect, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  // Ultra-safe parsing for numeric calculation to avoid NaN
  const safeParse = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^\d.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Helper to render price correctly without repeats
  const renderPrice = (priceVal) => {
    if (!priceVal) return "";
    let str = String(priceVal).trim();
    const numericPart = str.replace(/ر\.س/g, "").replace(/SAR/g, "").trim();
    if (!numericPart) return str;
    return `${numericPart} ر.س`;
  };

  const regPrice = safeParse(product.regularPrice);
  const curPrice = safeParse(product.salePrice || product.price);
  const sallaId = product.sallaProductId || product.id;

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];
  const hasSizes = sizes.length > 0;

  // Native Proxy handler for "Add to Cart" button in carousel
  const handleNativeAddToCart = () => {
    // Signal parent that a click happened (to start polling)
    if (onAddToCart) {
      onAddToCart({
        product,
        quantity: 1,
        size: selectedSize,
        isClickOnly: true,
      });
    }

    // Trigger the hidden native Salla button for this product
    const nativeBtn = document.querySelector(
      `salla-add-product-button[product-id="${sallaId}"]`,
    );
    if (nativeBtn) {
      const btn = nativeBtn.querySelector("button") || nativeBtn;
      btn.click();
    } else {
      onAddToCart && onAddToCart({ product, quantity: 1, size: selectedSize });
    }
  };

  return (
    <div
      className="w-full lg:w-1/2 text-right flex flex-col items-start"
      dir="rtl"
    >
      <h2 className="text-3xl lg:text-5xl font-sans text-brand-charcoal mb-4">
        {product.name}
      </h2>

      <div className="flex items-center gap-4 mb-10">
        <div className="flex items-center gap-4">
          <span className="text-brand-gold text-2xl font-sans font-bold">
            {renderPrice(product.salePrice || product.price)}
          </span>
          {product.isOnSale && regPrice > curPrice && (
            <span className="text-lg text-brand-charcoal/40 line-through font-sans">
              {renderPrice(product.regularPrice)}
            </span>
          )}
        </div>
        {product.isOnSale && regPrice > curPrice && (
          <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-full font-bold">
            وفر {Math.round(((regPrice - curPrice) / regPrice) * 100)}%
          </span>
        )}
      </div>

      <p className="text-brand-charcoal/70 text-lg leading-relaxed max-w-xl mb-8">
        {product.description}
      </p>

      {/* Size Selector */}
      {hasSizes && (
        <div className="w-full mb-8">
          <p className="text-sm font-bold text-brand-charcoal/70 mb-3 text-right">
            المقاس
            {selectedSize && (
              <span className="mr-2 text-brand-gold font-black">
                : {selectedSize}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-end flex-row-reverse">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  min-w-[3rem] h-11 px-4 rounded-xl border-2 font-sans font-bold text-sm
                  transition-all duration-200
                  ${
                    selectedSize === size
                      ? "border-brand-gold bg-brand-gold text-white shadow-md scale-105"
                      : "border-brand-charcoal/20 bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold"
                  }
                `}
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
          onClick={handleNativeAddToCart}
          className="px-8 py-3 border border-brand-charcoal text-brand-charcoal hover:bg-brand-gold hover:border-brand-gold hover:text-white transition-all duration-300 text-lg font-medium rounded-sm"
        >
          إضافة للسلة
        </button>
      </div>

      {/* Salla Native Button Proxy - THE ENGINE for this listing item */}
      <div className="opacity-0 pointer-events-none absolute left-0 top-0 overflow-hidden w-px h-px">
        <salla-add-product-button
          product-id={sallaId}
        ></salla-add-product-button>
      </div>
    </div>
  );
};

export default CarouselInfo;
