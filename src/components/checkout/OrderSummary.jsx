import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * OrderSummary Component
 *
 * Displays the summary of purchased items, pricing breakdown, and order details.
 *
 * Props:
 * @param {Array} cartItems - List of items in the cart
 * @param {number} subtotal - Subtotal amount
 * @param {number} shipping - Shipping cost
 * @param {number} tax - Calculated tax
 * @param {number} total - Final total amount
 * @param {string} orderId - Unique order identifier
 * @param {string} step - Current checkout step ('shipping' or 'payment')
 * @param {Function} onBackToCart - Handler to navigate back to cart
 * @param {string} theme - Current application theme
 */
const OrderSummary = ({
  cartItems,
  subtotal,
  shipping,
  tax,
  total,
  orderId,
  step,
  onBackToCart,
  theme,
}) => {
  return (
    <div
      className={`border-2 p-8 h-fit sticky top-24 ${
        theme === "green"
          ? "border-brand-charcoal/10 bg-white/50"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="mb-6 text-right">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-gold">
          رقم الطلب
        </p>
        <p
          className={`text-xl font-sans ${
            theme === "green" ? "text-brand-charcoal" : "text-white"
          }`}
        >
          {orderId}
        </p>
      </div>

      <h3
        className={`text-2xl font-sans mb-8 text-right ${
          theme === "green" ? "text-brand-charcoal" : "text-white"
        }`}
      >
        ملخص الطلب
      </h3>

      <div className="space-y-4 mb-8">
        {cartItems.map((item) => (
          <div
            key={`${item.id}-${item.selectedSize}`}
            className={`pb-4 border-b ${
              theme === "green" ? "border-brand-charcoal/10" : "border-white/10"
            }`}
          >
            <p
              className={`font-sans text-right mb-1 ${
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }`}
            >
              {item.name}
            </p>
            <p
              className={`text-sm text-right ${
                theme === "green" ? "text-brand-charcoal/60" : "text-white/60"
              }`}
            >
              المقاس: {item.selectedSize} | الكمية: {item.quantity}
            </p>
          </div>
        ))}

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

      {step === "shipping" && (
        <button
          onClick={onBackToCart}
          className={`w-full flex items-center justify-center gap-2 py-3 border-2 transition-all duration-300 ${
            theme === "green"
              ? "border-brand-charcoal/20 text-brand-charcoal hover:bg-brand-charcoal/5"
              : "border-white/20 text-white hover:bg-white/5"
          }`}
        >
          العودة للسلة
          <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
};

export default OrderSummary;
