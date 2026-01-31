import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../context/useCart";
import { ArrowRight, ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import gsap from "gsap";

const Checkout = ({ theme }) => {
  const { cartItems, getCartTotal, setCurrentPage, clearCart } = useCart();
  const containerRef = useRef(null);
  const [step, setStep] = useState("shipping"); // "shipping" or "payment"
  const [paymentMethod, setPaymentMethod] = useState("mada");
  const [orderId] = useState(
    () => `ST-${Math.floor(Math.random() * 900000 + 100000)}`,
  );

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [step]);

  const subtotal = getCartTotal();
  const shipping = cartItems.length > 0 ? 30 : 0;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    // Basic formatting for card number and expiry
    let formattedValue = value;
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s?/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    } else if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .substr(0, 5);
    }
    setPaymentData({ ...paymentData, [name]: formattedValue });
  };

  const goToPayment = (e) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();

    const orderDetails = cartItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}\n   المقاس: ${item.selectedSize || "غير محدد"}\n   الكمية: ${item.quantity}\n   السعر: ${item.price}`,
      )
      .join("\n\n");

    const message = `
🛍️ *طلب جديد من متجر ستوريا*
رقم الطلب: ${orderId}

*بيانات العميل:*
الاسم: ${formData.fullName}
الهاتف: ${formData.phone}
البريد الإلكتروني: ${formData.email}
العنوان: ${formData.address}
المدينة: ${formData.city}

*طريقة الدفع:*
${
  paymentMethod === "mada"
    ? "مدى (Mada)"
    : paymentMethod === "applepay"
      ? "Apple Pay"
      : paymentMethod === "stcpay"
        ? "STC Pay"
        : "بطاقة ائتمانية"
}

*تفاصيل الطلب:*
${orderDetails}

*ملخص الفاتورة:*
المجموع الفرعي: ${subtotal.toFixed(2)} ر.س
الشحن: ${shipping.toFixed(2)} ر.س
الضريبة (15%): ${tax.toFixed(2)} ر.س
الإجمالي: ${total.toFixed(2)} ر.س

${formData.notes ? `*ملاحظات:*\n${formData.notes}` : ""}
    `.trim();

    const phoneNumber = "966500000000"; // Replace with actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    clearCart();
    setCurrentPage("home");
  };

  return (
    <section
      ref={containerRef}
      className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-500 ${
        theme === "green" ? "bg-brand-offwhite" : "bg-brand-burgundy"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div className="flex gap-4 items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step === "shipping" ? "bg-brand-gold border-brand-gold text-brand-charcoal" : "border-brand-gold text-brand-gold"}`}
            >
              1
            </div>
            <div
              className={`h-[2px] w-12 ${step === "payment" ? "bg-brand-gold" : "bg-brand-gold/20"}`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step === "payment" ? "bg-brand-gold border-brand-gold text-brand-charcoal" : "border-brand-gold/20 text-brand-gold/20"}`}
            >
              2
            </div>
          </div>
          <h1
            className={`text-4xl md:text-5xl font-sans italic text-right ${
              theme === "green" ? "text-brand-charcoal" : "text-white"
            }`}
          >
            {step === "shipping" ? "إتمام الطلب" : "تفاصيل الدفع"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <form
                onSubmit={goToPayment}
                className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <div
                  className={`border-2 p-8 ${
                    theme === "green"
                      ? "border-brand-charcoal/10 bg-white/50"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <h3
                    className={`text-2xl font-sans italic mb-6 text-right ${
                      theme === "green" ? "text-brand-charcoal" : "text-white"
                    }`}
                  >
                    معلومات الشحن
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-right mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                      >
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-right mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                        >
                          رقم الهاتف *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-right mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                        >
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-right mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                      >
                        العنوان بالتفصيل *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-right mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                      >
                        المدينة *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-right mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                      >
                        ملاحظات إضافية
                      </label>
                      <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-right border-2 transition-all resize-none ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                        placeholder="أي ملاحظات خاصة بالطلب..."
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 p-8 ${theme === "green" ? "border-brand-charcoal/10 bg-white/50" : "border-white/10 bg-white/5"}`}
                >
                  <h3
                    className={`text-2xl font-sans italic mb-6 text-right ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
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
                          className={`font-bold text-sm ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                        >
                          {method.label}
                        </p>
                        <p
                          className={`text-[10px] ${theme === "green" ? "text-brand-charcoal/40" : "text-white/40"}`}
                        >
                          {method.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gold text-brand-charcoal py-5 uppercase tracking-widest font-bold hover:shadow-lg transition-all duration-300"
                >
                  الانتقال للدفع
                </button>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <button
                  onClick={() => setStep("shipping")}
                  className={`flex items-center gap-2 mb-4 hover:gap-4 transition-all duration-300 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                >
                  <ArrowLeft size={20} />
                  العودة لمعلومات الشحن
                </button>

                <div
                  className={`border-2 p-8 ${theme === "green" ? "border-brand-charcoal/10 bg-white/50" : "border-white/10 bg-white/5"}`}
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-3">
                      <ShieldCheck className="text-brand-gold" size={24} />
                      <span
                        className={`text-sm ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                      >
                        دفع آمن ومشفر
                      </span>
                    </div>
                    <h3
                      className={`text-2xl font-sans italic text-right ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                    >
                      بيانات الدفع
                    </h3>
                  </div>

                  {paymentMethod === "mada" || paymentMethod === "card" ? (
                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label
                          className={`block text-right text-sm ${theme === "green" ? "text-brand-charcoal/80" : "text-white/80"}`}
                        >
                          اسم حامل البطاقة
                        </label>
                        <input
                          type="text"
                          name="cardHolder"
                          value={paymentData.cardHolder}
                          onChange={handlePaymentInputChange}
                          required
                          className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                          placeholder="اسمك كما يظهر على البطاقة"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          className={`block text-right text-sm ${theme === "green" ? "text-brand-charcoal/80" : "text-white/80"}`}
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
                            className={`w-full px-4 py-3 text-right border-2 transition-all pr-12 ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
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
                            className={`block text-right text-sm ${theme === "green" ? "text-brand-charcoal/80" : "text-white/80"}`}
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
                            className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
                            placeholder="123"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            className={`block text-right text-sm ${theme === "green" ? "text-brand-charcoal/80" : "text-white/80"}`}
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
                            className={`w-full px-4 py-3 text-right border-2 transition-all ${theme === "green" ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold" : "border-white/20 bg-white/10 text-white focus:border-brand-gold"}`}
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
                          className={`text-xl font-bold mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                        >
                          الدفع عبر{" "}
                          {paymentMethod === "applepay"
                            ? "Apple Pay"
                            : "STC Pay"}
                        </h4>
                        <p
                          className={`text-sm ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
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
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div
            className={`border-2 p-8 h-fit sticky top-24 ${theme === "green" ? "border-brand-charcoal/10 bg-white/50" : "border-white/10 bg-white/5"}`}
          >
            <div className="mb-6 text-right">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-gold">
                رقم الطلب
              </p>
              <p
                className={`text-xl font-sans ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
              >
                {orderId}
              </p>
            </div>

            <h3
              className={`text-2xl font-sans italic mb-8 text-right ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
            >
              ملخص الطلب
            </h3>

            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className={`pb-4 border-b ${theme === "green" ? "border-brand-charcoal/10" : "border-white/10"}`}
                >
                  <p
                    className={`font-sans text-right mb-1 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
                  >
                    {item.name}
                  </p>
                  <p
                    className={`text-sm text-right ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                  >
                    المقاس: {item.selectedSize} | الكمية: {item.quantity}
                  </p>
                </div>
              ))}

              <div
                className={`flex justify-between text-right pb-4 border-b ${theme === "green" ? "border-brand-charcoal/10 text-brand-charcoal" : "border-white/10 text-white"}`}
              >
                <span>المجموع الفرعي</span>
                <span className="font-semibold">{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div
                className={`flex justify-between text-right pb-4 border-b ${theme === "green" ? "border-brand-charcoal/10 text-brand-charcoal" : "border-white/10 text-white"}`}
              >
                <span>الشحن</span>
                <span className="font-semibold">{shipping.toFixed(2)} ر.س</span>
              </div>
              <div
                className={`flex justify-between text-right pb-4 border-b ${theme === "green" ? "border-brand-charcoal/10 text-brand-charcoal" : "border-white/10 text-white"}`}
              >
                <span>الضريبة (15%)</span>
                <span className="font-semibold">{tax.toFixed(2)} ر.س</span>
              </div>
              <div
                className={`flex justify-between text-right text-xl font-bold pt-4 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
              >
                <span>الإجمالي</span>
                <span className="text-brand-gold">{total.toFixed(2)} ر.س</span>
              </div>
            </div>

            {step === "shipping" && (
              <button
                onClick={() => setCurrentPage("cart")}
                className={`w-full flex items-center justify-center gap-2 py-3 border-2 transition-all duration-300 ${theme === "green" ? "border-brand-charcoal/20 text-brand-charcoal hover:bg-brand-charcoal/5" : "border-white/20 text-white hover:bg-white/5"}`}
              >
                العودة للسلة
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
