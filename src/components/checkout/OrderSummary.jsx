import React, { useState } from "react";
import { ArrowRight, Tag, X, Check } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { config } from "../../config/config";
import {
  applyCoupon,
  removeCoupon,
  selectAppliedCoupon,
  selectCartDiscount,
} from "../../store/slices/cartSlice";

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
  const dispatch = useDispatch();
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const discountAmount = useSelector(selectCartDiscount);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/coupons/validate`,
        {
          code: couponCode,
          cartAmount: subtotal,
        },
      );
      dispatch(applyCoupon(response.data));
      setCouponCode("");
    } catch (err) {
      setError(err.response?.data?.error || "خطأ في تفعيل الكود");
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = total - discountAmount;

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

        {/* Pricing Breakdown */}
        <div
          className={`space-y-3 pt-4 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
        >
          <div className="flex justify-between text-right">
            <span>المجموع الفرعي</span>
            <span className="font-semibold">{subtotal.toFixed(2)} ر.س</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-right text-green-500 font-bold">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch(removeCoupon())}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
                <span>الخصم ({appliedCoupon.code})</span>
              </div>
              <span>-{discountAmount.toFixed(2)} ر.س</span>
            </div>
          )}

          <div className="flex justify-between text-right">
            <span>الشحن</span>
            <span className="font-semibold">{shipping.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between text-right">
            <span>الضريبة (15%)</span>
            <span className="font-semibold">{tax.toFixed(2)} ر.س</span>
          </div>

          <div className="flex justify-between text-right text-xl font-bold pt-4 border-t border-white/10">
            <span>الإجمالي</span>
            <span className="text-brand-gold">{finalTotal.toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>

      {/* Coupon Input */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="كود الخصم"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className={`flex-1 px-4 py-2 border-2 text-right outline-none transition-all ${
              theme === "green"
                ? "bg-white border-brand-charcoal/10 focus:border-brand-gold text-brand-charcoal"
                : "bg-white/5 border-white/10 focus:border-brand-gold text-white"
            }`}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={loading || !couponCode}
            className="bg-brand-gold text-brand-burgundy px-4 py-2 font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {loading ? "..." : <Tag size={18} />}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-2 text-right">{error}</p>
        )}
        {appliedCoupon && !error && (
          <p className="text-green-500 text-xs mt-2 text-right flex items-center justify-end gap-1">
            تم تفعيل كود الخصم بنجاح <Check size={12} />
          </p>
        )}
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
