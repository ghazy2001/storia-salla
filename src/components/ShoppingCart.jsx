import React, { useRef, useEffect } from "react";
import { useCart } from "../context/useCart";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import gsap from "gsap";

const ShoppingCart = ({ theme, onContinueShopping }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
    setCurrentPage,
  } = useCart();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const subtotal = getCartTotal();
  const shipping = cartItems.length > 0 ? 30 : 0;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <section
        ref={containerRef}
        className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-500 ${
          theme === "green" ? "bg-brand-offwhite" : "bg-brand-burgundy"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h1
            className={`text-4xl md:text-5xl font-sans italic mb-12 text-right ${
              theme === "green" ? "text-brand-charcoal" : "text-white"
            }`}
          >
            حقيبتك
          </h1>

          <div
            className={`border-2 rounded-lg p-12 text-center ${
              theme === "green"
                ? "border-brand-charcoal/10 bg-white/50"
                : "border-white/10 bg-white/5"
            }`}
          >
            <h2
              className={`text-2xl font-sans italic mb-4 ${
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }`}
            >
              حقيبتك فارغة
            </h2>
            <p
              className={`text-lg mb-8 ${
                theme === "green" ? "text-brand-charcoal/60" : "text-white/60"
              }`}
            >
              ابدئي التسوق واختاري من مجموعتنا الفاخرة
            </p>
            <button
              onClick={onContinueShopping}
              className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal px-8 py-4 uppercase tracking-widest font-bold hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              العودة للتسوق
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-500 ${
        theme === "green" ? "bg-brand-offwhite" : "bg-brand-burgundy"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h1
          className={`text-4xl md:text-5xl font-sans italic mb-12 text-right ${
            theme === "green" ? "text-brand-charcoal" : "text-white"
          }`}
        >
          حقيبتك
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className={`flex gap-4 md:gap-6 p-4 md:p-6 border-2 transition-all duration-300 hover:border-brand-gold ${
                  theme === "green"
                    ? "border-brand-charcoal/10 bg-white/50"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {/* Product Image */}
                <div className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 text-right">
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className={`font-sans italic text-base md:text-lg ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      {item.name}{" "}
                      {item.selectedSize && `(${item.selectedSize})`}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className={`p-1 transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                        theme === "green"
                          ? "text-red-500 hover:bg-red-50"
                          : "text-red-400 hover:bg-red-900/20"
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 mt-4">
                    <div
                      className={`flex items-center self-end md:self-auto border-2 ${
                        theme === "green"
                          ? "border-brand-charcoal/20"
                          : "border-white/20"
                      }`}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1, item.size)
                        }
                        className={`p-1 md:p-2 transition-all ${
                          theme === "green"
                            ? "hover:bg-brand-charcoal/10"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className={`w-8 md:w-12 text-center font-semibold text-sm md:text-base ${
                          theme === "green"
                            ? "text-brand-charcoal"
                            : "text-white"
                        }`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1, item.size)
                        }
                        className={`p-1 md:p-2 transition-all ${
                          theme === "green"
                            ? "hover:bg-brand-charcoal/10"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p
                      className={`text-base md:text-lg font-bold ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      {(
                        parseFloat(item.price.replace(/[^\d.-]/g, "")) *
                        item.quantity
                      ).toFixed(2)}{" "}
                      ر.س
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div
            className={`border-2 p-8 h-fit sticky top-24 ${
              theme === "green"
                ? "border-brand-charcoal/10 bg-white/50"
                : "border-white/10 bg-white/5"
            }`}
          >
            <h3
              className={`text-2xl font-sans italic mb-8 text-right ${
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }`}
            >
              ملخص الطلب
            </h3>

            <div className="space-y-4 mb-8">
              <div
                className={`flex justify-between text-right pb-4 border-b ${
                  theme === "green"
                    ? "border-brand-charcoal/10 text-brand-charcoal"
                    : "border-white/10 text-white"
                }`}
              >
                <span>المجموع الفرعي</span>
                <span className="font-semibold">{subtotal.toFixed(2)} ر.س</span>
              </div>

              <div
                className={`flex justify-between text-right pb-4 border-b ${
                  theme === "green"
                    ? "border-brand-charcoal/10 text-brand-charcoal"
                    : "border-white/10 text-white"
                }`}
              >
                <span>الشحن</span>
                <span className="font-semibold">{shipping.toFixed(2)} ر.س</span>
              </div>

              <div
                className={`flex justify-between text-right pb-4 border-b ${
                  theme === "green"
                    ? "border-brand-charcoal/10 text-brand-charcoal"
                    : "border-white/10 text-white"
                }`}
              >
                <span>الضريبة (15%)</span>
                <span className="font-semibold">{tax.toFixed(2)} ر.س</span>
              </div>

              <div
                className={`flex justify-between text-right text-xl font-bold pt-4 ${
                  theme === "green" ? "text-brand-charcoal" : "text-white"
                }`}
              >
                <span>الإجمالي</span>
                <span className="text-brand-gold">{total.toFixed(2)} ر.س</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage("checkout")}
              className="w-full bg-brand-gold text-brand-charcoal py-4 uppercase tracking-widest font-bold hover:shadow-lg transition-all duration-300 active:scale-95 mb-4"
            >
              متابعة الشراء
            </button>

            <button
              onClick={onContinueShopping}
              className={`w-full py-4 uppercase tracking-widest font-bold border-2 transition-all duration-300 hover:scale-105 ${
                theme === "green"
                  ? "border-brand-charcoal/30 text-brand-charcoal hover:border-brand-charcoal"
                  : "border-white/30 text-white hover:border-white"
              }`}
            >
              العودة للتسوق
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-4 py-3 uppercase tracking-widest font-medium text-red-500 text-sm hover:text-red-600 transition-colors"
            >
              حذف الكل
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShoppingCart;
