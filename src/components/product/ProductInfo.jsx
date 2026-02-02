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
      <p className="text-2xl font-bold tracking-widest text-brand-gold mb-8 font-sans w-full">
        {product.price}
      </p>

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
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                  selectedSize === size
                    ? "border-brand-gold bg-brand-gold text-white"
                    : "border-brand-charcoal/20 text-brand-charcoal hover:border-brand-gold"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-md ml-auto lg:ml-auto">
        <button
          onClick={handleAddToCart}
          className={`w-full py-5 rounded-full uppercase tracking-widest text-xs font-bold transition-all duration-300 shadow-lg ${
            theme === "green"
              ? "bg-brand-charcoal text-white hover:bg-brand-gold"
              : "bg-brand-gold text-brand-burgundy hover:bg-brand-burgundy hover:text-brand-gold"
          }`}
        >
          إضافة للسلة
        </button>
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
