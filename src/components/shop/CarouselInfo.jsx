import React from "react";

/**
 * CarouselInfo Component - V20.2 UI Refinement
 * Simplified UI for the store listing: removed sizes, fixed currency, and added regular price.
 */
const CarouselInfo = ({ product, onSelect, onAddToCart }) => {
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

    // Normalize by removing all currency symbols and adding it back once
    const numericPart = str.replace(/ر\.س/g, "").replace(/SAR/g, "").trim();
    if (!numericPart) return str;

    return `${numericPart} ر.س`;
  };

  const regPrice = safeParse(product.regularPrice);
  const curPrice = safeParse(product.salePrice || product.price);
  const sallaId = product.sallaProductId || product.id;

  // New Native Proxy handler for "Add to Cart" button in carousel
  const handleNativeAddToCart = () => {
    console.log(
      "[Storia] V20.2: Proxying Carousel Add to Cart for ID:",
      sallaId,
    );

    // Trigger the hidden native Salla button for this product
    const nativeBtn = document.querySelector(
      `salla-add-product-button[product-id="${sallaId}"]`,
    );
    if (nativeBtn) {
      // Look for the actual button inside the custom element shadow or directly
      const btn = nativeBtn.querySelector("button") || nativeBtn;
      btn.click();
    } else {
      // Fallback to manual hook if native button not found
      onAddToCart &&
        onAddToCart({
          product: product,
          quantity: 1,
        });
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

      <div className="flex items-center gap-4 mb-6">
        <span className="text-brand-gold text-2xl font-sans font-medium">
          {renderPrice(product.salePrice || product.price)}
        </span>
        {product.isOnSale && regPrice > curPrice && (
          <span className="text-lg text-brand-charcoal/40 line-through font-sans">
            {renderPrice(product.regularPrice)}
          </span>
        )}
      </div>

      <p className="text-brand-charcoal/70 text-lg leading-relaxed max-w-xl mb-8">
        {product.description}
      </p>

      {/* Manual Sizes selection removed as requested */}

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
