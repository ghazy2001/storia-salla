import React from "react";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";

/**
 * PaymentForm Component
 *
 * Handles payment method selection and credit card data entry.
 *
 * Props:
 * @param {string} paymentMethod - Currently selected payment method ID ('mada', 'card', etc.)
 * @param {Function} setPaymentMethod - Function to update selected payment method
 * @param {Object} paymentData - State object for card details (number, expiry, etc.)
 * @param {Function} handlePaymentInputChange - Handler for formatting and updating card inputs
 * @param {Function} handleFinalSubmit - Handler to submit the final order
 * @param {Function} onBack - Handler to go back to shipping step
 * @param {number} total - Final total amount to display on button
 * @param {string} theme - Current application theme
 */
const PaymentForm = ({
  paymentMethod,
  setPaymentMethod,
  paymentData,
  handlePaymentInputChange,
  handleFinalSubmit,
  onBack,
  total,
  theme,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 mb-4 hover:gap-4 transition-all duration-300 ${
          theme === "green" ? "text-brand-charcoal" : "text-white"
        }`}
      >
        <ArrowLeft size={20} />
        العودة لمعلومات الشحن
      </button>

      {/* Payment Method Selection */}
      <div
        className={`border-2 p-8 ${
          theme === "green"
            ? "border-brand-charcoal/10 bg-white/50"
            : "border-white/10 bg-white/5"
        }`}
      >
        <h3
          className={`text-2xl font-sans mb-6 text-right ${
            theme === "green" ? "text-brand-charcoal" : "text-white"
          }`}
        >
          طريقة الدفع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "mada", label: "مدى", sub: "Mada" },
            { id: "applepay", label: "Apple Pay", sub: "آبل باي" },
            { id: "stcpay", label: "STC Pay", sub: "إس تي سي باي" },
            { id: "card", label: "بطاقة", sub: "Visa / Master" },
          ].map((method) => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`p-4 border-2 cursor-pointer transition-all text-center rounded-lg flex flex-col items-center justify-center gap-1 ${
                paymentMethod === method.id
                  ? "border-brand-gold bg-brand-gold/10"
                  : theme === "green"
                    ? "border-brand-charcoal/10 hover:border-brand-gold/50"
                    : "border-white/10 hover:border-brand-gold/50"
              }`}
            >
              <p
                className={`font-bold text-sm ${
                  theme === "green" ? "text-brand-charcoal" : "text-white"
                }`}
              >
                {method.label}
              </p>
              <p
                className={`text-[10px] ${
                  theme === "green" ? "text-brand-charcoal/40" : "text-white/40"
                }`}
              >
                {method.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details Input */}
      <div
        className={`border-2 p-8 ${
          theme === "green"
            ? "border-brand-charcoal/10 bg-white/50"
            : "border-white/10 bg-white/5"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3">
            <ShieldCheck className="text-brand-gold" size={24} />
            <span
              className={`text-sm ${
                theme === "green" ? "text-brand-charcoal/60" : "text-white/60"
              }`}
            >
              دفع آمن ومشفر
            </span>
          </div>
          <h3
            className={`text-2xl font-sans text-right ${
              theme === "green" ? "text-brand-charcoal" : "text-white"
            }`}
          >
            بيانات الدفع
          </h3>
        </div>

        {paymentMethod === "mada" || paymentMethod === "card" ? (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                className={`block text-right text-sm ${
                  theme === "green" ? "text-brand-charcoal/80" : "text-white/80"
                }`}
              >
                اسم حامل البطاقة
              </label>
              <input
                type="text"
                name="cardHolder"
                value={paymentData.cardHolder}
                onChange={handlePaymentInputChange}
                required
                className={`w-full px-4 py-3 text-right border-2 transition-all ${
                  theme === "green"
                    ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                    : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                }`}
                placeholder="اسمك كما يظهر على البطاقة"
              />
            </div>

            <div className="space-y-2">
              <label
                className={`block text-right text-sm ${
                  theme === "green" ? "text-brand-charcoal/80" : "text-white/80"
                }`}
              >
                رقم البطاقة
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentInputChange}
                  required
                  maxLength="19"
                  className={`w-full px-4 py-3 text-right border-2 transition-all pr-12 ${
                    theme === "green"
                      ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                      : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                  }`}
                  placeholder="0000 0000 0000 0000"
                />
                <CreditCard
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className={`block text-right text-sm ${
                    theme === "green"
                      ? "text-brand-charcoal/80"
                      : "text-white/80"
                  }`}
                >
                  الرمز السري (CVV)
                </label>
                <input
                  type="password"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handlePaymentInputChange}
                  required
                  maxLength="3"
                  className={`w-full px-4 py-3 text-right border-2 transition-all ${
                    theme === "green"
                      ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                      : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                  }`}
                  placeholder="123"
                />
              </div>
              <div className="space-y-2">
                <label
                  className={`block text-right text-sm ${
                    theme === "green"
                      ? "text-brand-charcoal/80"
                      : "text-white/80"
                  }`}
                >
                  تاريخ الانتهاء
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handlePaymentInputChange}
                  required
                  placeholder="MM/YY"
                  className={`w-full px-4 py-3 text-right border-2 transition-all ${
                    theme === "green"
                      ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                      : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-gold text-brand-charcoal py-5 uppercase tracking-widest font-bold hover:shadow-lg transition-all duration-300 mt-8"
            >
              تأكيد الدفع {total.toFixed(2)} ر.س
            </button>
          </form>
        ) : (
          <div className="text-center py-12 space-y-6">
            <div className="mx-auto w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center">
              <CreditCard className="text-brand-gold" size={40} />
            </div>
            <div>
              <h4
                className={`text-xl font-bold mb-2 ${
                  theme === "green" ? "text-brand-charcoal" : "text-white"
                }`}
              >
                الدفع عبر{" "}
                {paymentMethod === "applepay" ? "Apple Pay" : "STC Pay"}
              </h4>
              <p
                className={`text-sm ${
                  theme === "green" ? "text-brand-charcoal/60" : "text-white/60"
                }`}
              >
                سيتم تحويلك إلى نافذة الدفع الآمنة لإتمام العملية
              </p>
            </div>
            <button
              onClick={handleFinalSubmit}
              className={`w-full py-5 font-bold uppercase tracking-widest transition-all duration-300 ${
                paymentMethod === "applepay"
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-[#4f2d7f] text-white hover:bg-[#3d2363]"
              }`}
            >
              ادفع الآن {total.toFixed(2)} ر.س
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
