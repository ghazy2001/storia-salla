import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Package,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  Home,
} from "lucide-react";

const TrackOrder = ({ isOpen, onClose, theme }) => {
  const [step, setStep] = useState("form"); // "form" or "results"
  const [formData, setFormData] = useState({
    orderId: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [orderInfo, setOrderInfo] = useState(null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("form");
        setFormData({ orderId: "", email: "" });
        setErrors({});
        setOrderInfo(null);
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Relaxed validation for testing: allow any non-empty input
    if (formData.orderId.trim() && formData.email.trim()) {
      // Mock data for demonstration
      setOrderInfo({
        id: formData.orderId,
        date: "31 يناير 2026",
        status: "processing", // "confirmed", "processing", "shipped", "delivered"
        items: 2,
        estimatedDelivery: "2 - 4 فبراير 2026",
      });
      setStep("results");
    } else {
      // If empty, show a generic error but don't be too strict
      setErrors({
        orderId: !formData.orderId.trim() ? "يرجى إدخال أي رقم للطلب" : "",
        email: !formData.email.trim() ? "يرجى إدخال أي بريد إلكتروني" : "",
      });
    }
  };

  const statuses = [
    {
      key: "confirmed",
      label: "تم تأكيد الطلب",
      icon: CheckCircle2,
      date: "31 يناير, 10:00 ص",
    },
    {
      key: "processing",
      label: "جاري التجهيز",
      icon: Clock,
      date: "31 يناير, 01:30 م",
    },
    { key: "shipped", label: "تم الشحن", icon: Truck, date: "قريباً" },
    { key: "delivered", label: "تم التوصيل", icon: Home, date: "قريباً" },
  ];

  const getCurrentStatusIndex = () => {
    return statuses.findIndex((s) => s.key === orderInfo?.status);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className={`relative ${
          theme === "burgundy" ? "bg-brand-burgundy" : "bg-brand-primary"
        } rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/5 transition-all duration-500`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors z-20"
        >
          <X size={24} />
        </button>

        {step === "form" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className={`bg-gradient-to-br ${
                theme === "burgundy"
                  ? "from-brand-burgundy via-brand-burgundy to-brand-burgundy"
                  : "from-brand-primary via-brand-secondary to-brand-primary"
              } p-10 text-center border-b border-white/5`}
            >
              <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                <Package className="text-brand-gold" size={40} />
              </div>
              <h2 className="text-3xl font-serif text-white mb-3">تتبع طلبك</h2>
              <p className="text-white/60 text-sm">
                أدخلي تفاصيل طلبك لمعرفة حالته الحالية
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-right text-xs font-semibold text-brand-gold uppercase tracking-widest">
                  رقم الطلب *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 pr-12 text-right bg-white/5 text-white border ${errors.orderId ? "border-red-500/50" : "border-white/10"} rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all placeholder:text-white/20`}
                    placeholder="مثال: #123456"
                  />
                  <Package
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20"
                    size={20}
                  />
                </div>
                {errors.orderId && (
                  <p className="text-red-500 text-xs mt-1 text-right">
                    {errors.orderId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-right text-xs font-semibold text-brand-gold uppercase tracking-widest">
                  البريد الإلكتروني *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 pr-12 text-right bg-white/5 text-white border ${errors.email ? "border-red-500/50" : "border-white/10"} rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all placeholder:text-white/20`}
                    placeholder="example@email.com"
                  />
                  <Mail
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20"
                    size={20}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 text-right">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="group relative w-full bg-brand-gold text-brand-primary py-5 rounded-xl font-bold tracking-[0.2em] shadow-lg hover:shadow-brand-gold/20 transform hover:scale-[1.02] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <span className="relative flex items-center justify-center gap-3">
                  <Search size={20} />
                  بحث عن الطلب
                </span>
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 overflow-y-auto max-h-[85vh]">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-2 text-brand-gold hover:text-white transition-colors text-sm font-semibold"
              >
                <ArrowRight size={18} />
                رجوع للبحث
              </button>
              <div className="text-right">
                <p className="text-xs text-brand-gold uppercase tracking-widest font-bold">
                  طلب رقم {orderInfo.id}
                </p>
                <p className="text-[10px] text-white/40 mt-1">
                  {orderInfo.date}
                </p>
              </div>
            </div>

            <div className="p-10 space-y-10">
              {/* Timeline */}
              <div className="relative space-y-12">
                {/* Vertical Line */}
                <div className="absolute right-[19px] top-2 bottom-2 w-[2px] bg-white/10" />

                {statuses.map((s, index) => {
                  const isCompleted = index <= getCurrentStatusIndex();
                  const isCurrent = index === getCurrentStatusIndex();

                  return (
                    <div
                      key={s.key}
                      className="relative flex items-start gap-6 group"
                    >
                      {/* Icon Container */}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ring-4 ${
                          theme === "burgundy"
                            ? "ring-brand-burgundy"
                            : "ring-brand-primary"
                        } ${
                          isCompleted
                            ? "bg-brand-gold text-brand-primary shadow-[0_0_15px_rgba(185,156,107,0.3)]"
                            : "bg-white/5 text-white/20"
                        }`}
                      >
                        <s.icon
                          size={20}
                          className={isCurrent ? "animate-pulse" : ""}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-right pt-2">
                        <h4
                          className={`text-sm font-bold tracking-wide transition-colors duration-300 ${
                            isCompleted ? "text-white" : "text-white/20"
                          }`}
                        >
                          {s.label}
                        </h4>
                        <p
                          className={`text-[10px] mt-1 font-light tracking-widest transition-colors duration-300 ${
                            isCompleted ? "text-brand-gold" : "text-white/10"
                          }`}
                        >
                          {s.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Details Summary */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-semibold">
                    {orderInfo.items} قطع
                  </span>
                  <span className="text-white/40">عدد الأصناف</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-gold font-bold">
                    {orderInfo.estimatedDelivery}
                  </span>
                  <span className="text-white/40">موعد التوصيل المتوقع</span>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-[10px] text-white/30 leading-relaxed">
                  إذا واجهتك أي مشكلة في تتبع طلبك، يرجى التواصل مع فريق الدعم
                  الفني عبر الواتساب أو البريد الإلكتروني.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
