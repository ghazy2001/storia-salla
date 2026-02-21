import React from "react";

/**
 * ProductInfo Component - V20.1 Visual Refinement
 * Renders product title, price, and add to cart section.
 * Streamlined to remove redundant currency labels and info boxes.
 */
const ProductInfo = ({ product, handleAddToCart }) => {
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

    // Remove duplicate "ر.س" if it exists at the end
    // First, normalize by removing all occurrences and adding it back once
    const numericPart = str.replace(/ر\.س/g, "").trim();
    if (!numericPart) return str;

    return `${numericPart} ر.س`;
  };

  const regPrice = safeParse(product.regularPrice);
  const curPrice = safeParse(product.salePrice || product.price);
  const discount =
    regPrice > curPrice && regPrice > 0
      ? Math.round(((regPrice - curPrice) / regPrice) * 100)
      : 0;

  return (
    <div className="flex flex-col justify-center lg:items-start text-right lg:order-1">
      <h1 className="text-4xl md:text-5xl font-sans font-black mb-8 text-brand-charcoal w-full">
        {product.name}
      </h1>

      <div className="flex items-center gap-4 mb-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-sans font-bold text-brand-gold">
            {renderPrice(product.salePrice || product.price)}
          </span>
          {product.isOnSale && regPrice > curPrice && (
            <span className="text-xl text-brand-charcoal/40 line-through font-sans">
              {renderPrice(product.regularPrice)}
            </span>
          )}
        </div>
        {product.isOnSale && discount > 0 && (
          <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-full font-bold">
            وفر {discount}%
          </span>
        )}
      </div>

      <p className="leading-loose text-brand-charcoal/80 mb-8 max-w-lg ml-auto lg:ml-auto text-base">
        {product.description}
      </p>

      {/* Available Sizes - Read Only Display as per User Request */}
      {product.sizeVariants && product.sizeVariants.length > 0 && (
        <div className="mb-10 w-full">
          <h3 className="text-sm font-bold text-brand-charcoal/60 mb-4 font-sans">
            المقاسات المتوفرة:
          </h3>
          <div className="flex flex-wrap gap-2 justify-start flex-row-reverse">
            {product.sizeVariants.map((variant, idx) => {
              const isOut = variant.isOutOfStock || variant.stock === 0;
              return (
                <div
                  key={idx}
                  className={`px-4 py-2 rounded-xl border text-sm font-sans font-bold transition-all
                    ${isOut ? "border-gray-200 text-gray-300 line-through bg-gray-50/50" : "border-brand-gold/20 text-brand-charcoal bg-white shadow-sm"}`}
                >
                  {variant.size}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Total Out of Stock Banner - Removed as per user screenshot feedback for cleaner UI */}

      <div className="flex flex-col gap-4 w-full max-w-md ml-auto lg:ml-auto">
        {product.isOutOfStock || product.quantity === 0 ? (
          <button
            disabled
            className="w-full py-5 rounded-[2rem] font-sans font-black text-lg bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          >
            الصنف منتهى
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full py-5 rounded-[2rem] font-sans font-black text-lg transition-all shadow-lg 
                       bg-brand-gold text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          >
            إضافة للسلة
          </button>
        )}
        {/* Info boxes removed as per user request */}
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
