import React, { useState } from "react";

/**
 * ProductInfo Component - V20.3 with Salla Size Selector
 * Renders product title, price, size options (from Salla API), and add to cart section.
 */
const ProductInfo = ({ product, handleAddToCart }) => {
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

  // Use sizes from Salla API (enriched data) — these are the real sizes (e.g. 52, 54, 56...)
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];
  const hasSizes = sizes.length > 0;

  const onAddToCart = () => {
    handleAddToCart(selectedSize);
  };

  return (
    <div className="flex flex-col justify-center text-right lg:order-1">
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

      <p className="leading-loose text-brand-charcoal/80 mb-12 max-w-lg ml-auto lg:ml-auto text-base">
        {product.description}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md ml-auto lg:ml-auto">
        {/* Size Selector — uses real Salla sizes */}
        {hasSizes && (
          <div className="mb-2">
            <p className="text-sm font-bold text-brand-charcoal/70 mb-3 text-right">
              المقاس
              {selectedSize && (
                <span className="mr-2 text-brand-gold font-black">
                  : {selectedSize}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-3 justify-start flex-row-reverse">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    min-w-[3rem] h-12 px-4 rounded-xl border-2 font-sans font-bold text-sm
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

        <button
          onClick={onAddToCart}
          className="w-full py-5 rounded-[2rem] font-sans font-black text-lg transition-all shadow-lg 
                     bg-brand-gold text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
        >
          إضافة للسلة
        </button>
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
