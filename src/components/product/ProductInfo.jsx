import React from "react";

/**
 * ProductInfo Component - V19 Native Proxy Edition
 * Renders product title, price, descriptions and add to cart section.
 * Size selection is handled by Salla's native popup, so we remove custom buttons.
 */
const ProductInfo = ({ product, handleAddToCart, theme }) => {
  const isGoldTheme = theme === "gold" || !theme;

  // Ultra-safe parsing for discount calculation to avoid NaN
  const safeParse = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^\d.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  const regPrice = safeParse(product.regularPrice);
  const curPrice = safeParse(product.salePrice || product.price);
  const discount =
    regPrice > curPrice && regPrice > 0
      ? Math.round(((regPrice - curPrice) / regPrice) * 100)
      : 0;

  return (
    <div className="flex flex-col justify-center lg:items-start text-right lg:order-1">
      <h1 className="text-4xl md:text-5xl font-sans font-black mb-4 text-brand-charcoal w-full">
        {product.name}
      </h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span
            className={`text-3xl font-sans font-bold ${isGoldTheme ? "text-brand-gold" : "text-brand-charcoal"}`}
          >
            {product.salePrice || product.price} ر.س
          </span>
          {product.isOnSale && regPrice > curPrice && (
            <span className="text-xl text-brand-charcoal/40 line-through font-sans">
              {product.regularPrice} ر.س
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

      {/* Manual Size Selection is removed as Salla handles it via native picker popup */}

      <div className="flex flex-col gap-4 w-full max-w-md ml-auto lg:ml-auto">
        <button
          onClick={handleAddToCart}
          className="w-full py-5 rounded-[2rem] font-sans font-black text-lg transition-all shadow-lg bg-brand-charcoal text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
        >
          إضافة للسلة
        </button>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/50 p-4 rounded-2xl text-center border border-brand-charcoal/5">
            <p className="text-xs opacity-50 mb-1">التوصيل</p>
            <p className="text-sm font-bold">شحن مجاني للطلبات فوق ٥٠٠ ر.س</p>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl text-center border border-brand-charcoal/5">
            <p className="text-xs opacity-50 mb-1">الإرجاع</p>
            <p className="text-sm font-bold">إرجاع مجاني خلال ١٤ يوم</p>
          </div>
        </div>
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
