import React from "react";

/**
 * ProductInfo Component
 * Renders product title, price, descriptions and add to cart section.
 * Props:
 * @param {Object} product - The product object
 * @param {string} selectedSize - Currently selected size
 * @param {Function} setSelectedSize - State setter for selected size
 * @param {Function} handleAddToCart - Function to handle adding item to cart
 * @param {string} theme - Current application theme
 * @param {boolean} isDiscovering - Discovery status
 */
const ProductInfo = ({
  product,
  selectedSize,
  setSelectedSize,
  handleAddToCart,
  theme,
  isDiscovering,
}) => {
  return (
    <div className="flex flex-col justify-center lg:items-start text-right lg:order-1">
      <h1 className="text-4xl md:text-5xl font-sans font-black mb-4 text-brand-charcoal w-full">
        {product.name}
      </h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-sans font-bold text-brand-gold">
            {product.salePrice || product.price} ر.س
          </span>
          {product.isOnSale &&
            product.regularPrice > (product.salePrice || product.price) && (
              <span className="text-xl text-brand-charcoal/40 line-through font-sans">
                {product.regularPrice} ر.س
              </span>
            )}
        </div>
        {product.isOnSale && (
          <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-full font-bold">
            وفر{" "}
            {Math.round(
              ((product.regularPrice - (product.salePrice || product.price)) /
                product.regularPrice) *
                100,
            )}
            %
          </span>
        )}
      </div>

      <p className="leading-loose text-brand-charcoal/80 mb-8 max-w-lg ml-auto lg:ml-auto text-base">
        {product.description}
      </p>

      {/* Size Selection */}
      {(product.sizes && product.sizes.length > 0) || isDiscovering ? (
        <div className="mb-8 w-full max-w-md ml-auto lg:ml-auto">
          <label className="block text-sm font-medium text-brand-charcoal mb-3">
            {isDiscovering && (!product.sizes || product.sizes.length === 0)
              ? "جارٍ تحميل المقاسات..."
              : "المقاس"}
          </label>
          <div className="flex gap-3 flex-wrap">
            {product.sizes && product.sizes.length > 0
              ? product.sizes.map((size) => {
                  const variant = product.sizeVariants?.find(
                    (v) => v.size === size,
                  );
                  const isOutOfStock = variant?.isOutOfStock;

                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`px-6 py-3 border-2 rounded-lg font-medium transition-all relative ${
                        isOutOfStock
                          ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                          : selectedSize === size
                            ? "border-brand-gold bg-brand-gold text-white"
                            : "border-brand-charcoal/20 text-brand-charcoal hover:border-brand-gold"
                      }`}
                    >
                      {size}
                      {isOutOfStock && (
                        <span className="absolute -top-2 -left-2 bg-gray-100 text-gray-400 text-[10px] px-1 rounded border border-gray-200">
                          نفذت
                        </span>
                      )}
                    </button>
                  );
                })
              : isDiscovering
                ? // Loading skeletons for buttons
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-16 h-12 bg-gray-100 animate-pulse rounded-lg border-2 border-gray-50"
                    ></div>
                  ))
                : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 w-full max-w-md ml-auto lg:ml-auto">
        <button
          onClick={handleAddToCart}
          disabled={(() => {
            if (product.sizes && product.sizes.length > 0) {
              const variant = product.sizeVariants?.find(
                (v) => v.size === selectedSize,
              );
              return !selectedSize || (variant && variant.isOutOfStock);
            }
            return false;
          })()}
          className={`w-full py-5 rounded-[2rem] font-sans font-black text-lg transition-all shadow-lg ${
            (() => {
              if (product.sizes && product.sizes.length > 0) {
                const variant = product.sizeVariants?.find(
                  (v) => v.size === selectedSize,
                );
                return !selectedSize || (variant && variant.isOutOfStock);
              }
              return false;
            })()
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-brand-charcoal text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {(() => {
            if (product.sizes && product.sizes.length > 0) {
              const variant = product.sizeVariants?.find(
                (v) => v.size === selectedSize,
              );
              if (!selectedSize) return "اختر المقاس أولاً";
              if (variant && variant.isOutOfStock) return "نفذت الكمية";
              return "إضافة للسلة";
            }
            return "إضافة للسلة";
          })()}
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

      {/* Salla Native Button Proxy - Essential for the automatic fallback */}
      <div
        id={`native-cart-btn-${product.sallaProductId || product.id}`}
        className="hidden"
      >
        <salla-add-product-button
          product-id={product.sallaProductId || product.id}
        ></salla-add-product-button>
      </div>
    </div>
  );
};

export default ProductInfo;
