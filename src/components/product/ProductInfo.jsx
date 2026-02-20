import React from "react";

/**
 * ProductInfo Component - V20 Visual Polish
 * Renders product title, price, and add to cart section.
 * Streamlined to remove redundant currency labels and info boxes.
 */
const ProductInfo = ({ product, handleAddToCart, theme }) => {
  const isGoldTheme = theme === "gold" || !theme;

  // Ultra-safe parsing for numeric calculation to avoid NaN
  const safeParse = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^\d.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Helper to render price correctly without repeats
  const renderPrice = (priceVal) => {
    if (!priceVal) return "";
    const str = String(priceVal);
    // If it already has "ر.س", just return it. Otherwise add it.
    if (str.includes("ر.س") || str.includes("SAR")) return str;
    return `${str} ر.س`;
  };

  const regPrice = safeParse(product.regularPrice);
  const curPrice = safeParse(product.salePrice || product.price);
  const discount =
    regPrice > curPrice && regPrice > 0
      ? Math.round(((regPrice - curPrice) / regPrice) * 100)
      : 0;

  return (
    <div className="flex flex-col justify-center lg:items-start text-right lg:order-1">
      <h1 className="text-4xl md:text-5xl font-sans font-black mb-4 text-brand-charcoal dark:text-white w-full">
        {product.name}
      </h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span
            className={`text-3xl font-sans font-bold ${isGoldTheme ? "text-brand-gold" : "text-brand-charcoal dark:text-white"}`}
          >
            {renderPrice(product.salePrice || product.price)}
          </span>
          {product.isOnSale && regPrice > curPrice && (
            <span className="text-xl text-brand-charcoal/40 dark:text-white/40 line-through font-sans">
              {renderPrice(product.regularPrice)}
            </span>
          )}
        </div>
        {product.isOnSale && discount > 0 && (
          <span className="bg-red-50 dark:bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded-full font-bold">
            وفر {discount}%
          </span>
        )}
      </div>

      <p className="leading-loose text-brand-charcoal/80 dark:text-white/70 mb-8 max-w-lg ml-auto lg:ml-auto text-base">
        {product.description}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md ml-auto lg:ml-auto">
        <button
          onClick={handleAddToCart}
          className="w-full py-5 rounded-[2rem] font-sans font-black text-lg transition-all shadow-lg 
                     bg-brand-charcoal text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98]
                     dark:bg-white dark:text-brand-charcoal dark:hover:bg-gray-100"
        >
          إضافة للسلة
        </button>

        {/* Support/Shipping Grid removed as per user request */}
      </div>

      {/* Salla Native Button Proxy - THE ENGINE */}
      <div className="opacity-0 pointer-events-none absolute left-0 top-0 overflow-hidden w-px h-px">
        <salla-add-product-button
          product-id={product.sallaProductId || product.id}
        ></salla-add-product-button>
      </div>
    </div>
  );
};

export default ProductInfo;
