import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/useCart";
import { useProducts } from "../context/ProductContext";
import Toast from "./Toast";

const ProductDetails = ({ productId, theme }) => {
  const { products } = useProducts();
  const product = products.find((p) => p.id === productId);

  const [activeMedia, setActiveMedia] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "",
  );
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert("الرجاء اختيار المقاس");
      return;
    }
    addToCart({ ...product, selectedSize });
    setShowToast(true);
  };

  if (!product) return <div>Product not found</div>;

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-charcoal pt-24 pb-12">
      <Toast
        message="تمت إضافة المنتج إلى السلة بنجاح"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        theme={theme}
      />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Gallery Section */}
        <div className="flex flex-col gap-4 lg:order-2">
          {/* Main Display */}
          {/* Main Display */}
          <div
            className="relative aspect-[3/4] bg-brand-beige rounded-4xl overflow-hidden shadow-sm group"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              e.target.touchStartX = touch.clientX;
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              e.target.touchEndX = touch.clientX;
            }}
            onTouchEnd={(e) => {
              if (!e.target.touchStartX || !e.target.touchEndX) return;
              const distance = e.target.touchStartX - e.target.touchEndX;
              const isLeftSwipe = distance > 50;
              const isRightSwipe = distance < -50;

              if (isLeftSwipe) {
                setActiveMedia((prev) => (prev + 1) % product.media.length);
              } else if (isRightSwipe) {
                setActiveMedia((prev) =>
                  prev === 0 ? product.media.length - 1 : prev - 1,
                );
              }
              // Reset
              e.target.touchStartX = null;
              e.target.touchEndX = null;
            }}
          >
            {product.media[activeMedia].type === "video" ? (
              <video
                src={product.media[activeMedia].src}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={product.media[activeMedia].src}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x dir-rtl">
            {product.media.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveMedia(index)}
                className={`relative w-20 h-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeMedia === index ? "border-brand-rose" : "border-transparent"}`}
              >
                {item.type === "video" ? (
                  <div className="w-full h-full bg-black/10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-brand-charcoal border-b-4 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.src}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center lg:items-start text-right lg:order-1">
          <h1 className="text-4xl md:text-6xl font-serif font-black mb-4 text-brand-charcoal w-full">
            {product.name}
          </h1>
          <p className="text-xl font-light tracking-widest text-brand-charcoal/60 mb-8 font-sans w-full">
            {product.price}
          </p>

          <div className="w-20 h-[1px] bg-brand-charcoal/20 mb-8 ml-auto lg:ml-auto"></div>

          <p className="leading-loose text-brand-charcoal/80 mb-8 max-w-lg ml-auto lg:ml-auto text-lg">
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
              className="w-full py-5 bg-brand-charcoal text-white rounded-full uppercase tracking-widest text-sm hover:bg-brand-rose transition-colors shadow-lg"
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
      </div>
    </div>
  );
};

export default ProductDetails;
