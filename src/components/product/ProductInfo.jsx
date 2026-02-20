import React from "react";

/**
 * ProductInfo Component
 *
 * Displays product details (name, price, description) and handles size selection and add to cart.
 *
 * Props:
 * @param {Object} product - The product object
 * @param {string} selectedSize - Currently selected size
 * @param {Function} setSelectedSize - State setter for selected size
 * @param {Function} handleAddToCart - Function to handle adding item to cart
 * @param {string} theme - Current application theme
 */
const ProductInfo = ({
  product,
  selectedSize,
  setSelectedSize,
  handleAddToCart,
  theme,
}) => {
  return (
    <div className="flex flex-col justify-center lg:items-start text-right lg:order-1">
      <h1 className="text-4xl md:text-5xl font-sans font-black mb-4 text-brand-charcoal w-full">
        {product.name}
      </h1>
      <div className="mb-8 font-sans w-full">
        {(() => {
          let currentRegularPrice = product.regularPrice || product.price; // Default to normal price
          let currentSalePrice = product.salePrice;
          let isOnSale = product.isOnSale;

          if (selectedSize && product.sizeVariants?.length > 0) {
            const variant = product.sizeVariants.find(
              (v) => v.size === selectedSize,
            );
            if (variant) {
              // For variants, we mapped price as the "regular" price in sallaService if logic holds,
              // but let's double check sallaService variant mapping.
              // sallaService variant: price = vPrice (regular/base), salePrice = vSalePrice.
              currentRegularPrice = variant.price;
              currentSalePrice = variant.salePrice;
              isOnSale = variant.isOnSale;
            }
          }

          // Safe format
          const format = (p) => {
            if (p === null || p === undefined) return "";
            if (typeof p === "string") return p;
            return `${p} ر.س`;
          };

          if (isOnSale) {
            const discountPercent = Math.round(
              ((currentRegularPrice - currentSalePrice) / currentRegularPrice) *
                100,
            );

            return (
              <div className="flex flex-row items-center gap-3 w-full justify-end">
                <span className="text-xl text-gray-400 line-through decoration-gray-400/50 decoration-1">
                  {format(currentRegularPrice)}
                </span>
                <span className="text-3xl font-black tracking-widest text-brand-gold">
                  {format(currentSalePrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold">
                    وفر %{discountPercent}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div className="w-full text-right">
              <p className="text-3xl font-black tracking-widest text-brand-gold">
                {format(currentRegularPrice)}
              </p>
            </div>
          );
        })()}
      </div>

      <div className="w-20 h-[1px] bg-brand-charcoal/20 mb-8 ml-auto lg:ml-auto"></div>

      <p className="leading-loose text-brand-charcoal/80 mb-8 max-w-lg ml-auto lg:ml-auto text-base">
        {product.description}
      </p>

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-8 w-full max-w-md ml-auto lg:ml-auto">
          <label className="block text-sm font-medium text-brand-charcoal mb-3">
            اختر المقاس
          </label>
          <div className="flex gap-3 flex-wrap">
            {product.sizes.map((size) => {
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
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-md ml-auto lg:ml-auto">
        <button
          onClick={handleAddToCart}
          disabled={(() => {
            if (selectedSize) {
              const variant = product.sizeVariants?.find(
                (v) => v.size === selectedSize,
              );
              return variant?.isOutOfStock;
            }
            return product.isOutOfStock;
          })()}
          className={`w-full py-5 rounded-full uppercase tracking-widest text-xs font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${
            theme === "green"
              ? "bg-brand-charcoal text-white hover:bg-brand-gold disabled:bg-gray-400"
              : "bg-brand-gold text-brand-burgundy hover:bg-brand-burgundy hover:text-brand-gold disabled:bg-gray-400 disabled:text-gray-200"
          }`}
        >
          {(() => {
            if (selectedSize) {
              const variant = product.sizeVariants?.find(
                (v) => v.size === selectedSize,
              );
              if (variant?.isOutOfStock) return "نفذت الكمية";
            } else if (product.isOutOfStock) {
              return "نفذت الكمية";
            }
            return "إضافة للسلة";
          })()}
        </button>

        {/* 🌿 V14: The "Natural Way" Ghost Button Proxy */}
        <div style={{ display: "none" }}>
          <salla-add-product-button
            id={`native-cart-btn-${product.sallaProductId || product.id}`}
            product-id={product.sallaProductId || product.id}
            quantity="1"
          ></salla-add-product-button>
        </div>
      </div>

      {/* Extra details matches RTL layout */}
      <div className="mt-12 grid grid-cols-2 gap-8 text-xs tracking-wider text-brand-charcoal/50 w-full max-w-md ml-auto lg:ml-auto">
        <div>
          <h6 className="uppercase font-bold mb-2 text-brand-charcoal">
            التوصيل
          </h6>
          <p>شحن مجاني للطلبات فوق ٥٠٠ ر.س</p>
        </div>
        <div>
          <h6 className="uppercase font-bold mb-2 text-brand-charcoal">
            الإرجاع
          </h6>
          <p>إرجاع مجاني خلال ١٤ يوم</p>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
