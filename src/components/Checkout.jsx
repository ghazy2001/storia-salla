import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../context/useCart";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

const Checkout = ({ theme }) => {
  const { cartItems, getCartTotal, setCurrentPage, clearCart } = useCart();
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
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
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create WhatsApp message
    const orderDetails = cartItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}\n   المقاس: ${item.selectedSize || "غير محدد"}\n   الكمية: ${item.quantity}\n   السعر: ${item.price}`,
      )
      .join("\n\n");

    const message = `
🛍️ *طلب جديد من متجر ستوريا*

*بيانات العميل:*
الاسم: ${formData.fullName}
الهاتف: ${formData.phone}
البريد الإلكتروني: ${formData.email}
العنوان: ${formData.address}
المدينة: ${formData.city}

*تفاصيل الطلب:*
${orderDetails}

*ملخص الفاتورة:*
المجموع الفرعي: ${subtotal.toFixed(2)} ر.س
الشحن: ${shipping.toFixed(2)} ر.س
الضريبة (15%): ${tax.toFixed(2)} ر.س
الإجمالي: ${total.toFixed(2)} ر.س

${formData.notes ? `*ملاحظات:*\n${formData.notes}` : ""}
    `.trim();

    // Send to WhatsApp
    const phoneNumber = "966500000000"; // Replace with actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Clear cart after order
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
        <h1
          className={`text-4xl md:text-5xl font-serif italic mb-12 text-right ${
            theme === "green" ? "text-brand-charcoal" : "text-white"
          }`}
        >
          إتمام الطلب
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className={`border-2 p-8 ${
                  theme === "green"
                    ? "border-brand-charcoal/10 bg-white/50"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <h3
                  className={`text-2xl font-serif italic mb-6 text-right ${
                    theme === "green" ? "text-brand-charcoal" : "text-white"
                  }`}
                >
                  معلومات الشحن
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-right mb-2 ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-right border-2 transition-all ${
                        theme === "green"
                          ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                          : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-right mb-2 ${
                          theme === "green"
                            ? "text-brand-charcoal"
                            : "text-white"
                        }`}
                      >
                        رقم الهاتف *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-right border-2 transition-all ${
                          theme === "green"
                            ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                            : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-right mb-2 ${
                          theme === "green"
                            ? "text-brand-charcoal"
                            : "text-white"
                        }`}
                      >
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-right border-2 transition-all ${
                          theme === "green"
                            ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                            : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-right mb-2 ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      العنوان *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-right border-2 transition-all ${
                        theme === "green"
                          ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                          : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-right mb-2 ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      المدينة *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-right border-2 transition-all ${
                        theme === "green"
                          ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                          : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-right mb-2 ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      ملاحظات إضافية
                    </label>
                    <textarea
                      name="notes"
                      rows="4"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-right border-2 transition-all resize-none ${
                        theme === "green"
                          ? "border-brand-charcoal/20 bg-white text-brand-charcoal focus:border-brand-gold"
                          : "border-white/20 bg-white/10 text-white focus:border-brand-gold"
                      }`}
                      placeholder="أي ملاحظات خاصة بالطلب..."
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div
            className={`border-2 p-8 h-fit sticky top-24 ${
              theme === "green"
                ? "border-brand-charcoal/10 bg-white/50"
                : "border-white/10 bg-white/5"
            }`}
          >
            <h3
              className={`text-2xl font-serif italic mb-8 text-right ${
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
                    theme === "green"
                      ? "border-brand-charcoal/10"
                      : "border-white/10"
                  }`}
                >
                  <p
                    className={`font-serif text-right mb-1 ${
                      theme === "green" ? "text-brand-charcoal" : "text-white"
                    }`}
                  >
                    {item.name}
                  </p>
                  <p
                    className={`text-sm text-right ${
                      theme === "green"
                        ? "text-brand-charcoal/60"
                        : "text-white/60"
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

            <button
              onClick={handleSubmit}
              className="w-full bg-brand-gold text-brand-charcoal py-4 uppercase tracking-widest font-bold hover:shadow-lg transition-all duration-300 active:scale-95 mb-4"
            >
              إرسال الطلب عبر واتساب
            </button>

            <button
              onClick={() => setCurrentPage("cart")}
              className={`w-full flex items-center justify-center gap-2 py-3 border-2 transition-all duration-300 ${
                theme === "green"
                  ? "border-brand-charcoal/20 text-brand-charcoal hover:bg-brand-charcoal/5"
                  : "border-white/20 text-white hover:bg-white/5"
              }`}
            >
              العودة للسلة
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
