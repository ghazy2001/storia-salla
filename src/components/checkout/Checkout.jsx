import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotal,
  setCurrentPage,
  clearCart,
} from "../../store/slices/cartSlice";
import gsap from "gsap";

// Sub-components
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import OrderSummary from "./OrderSummary";

/**
 * Checkout Component
 *
 * Main container for the checkout process. Manages the state between
 * shipping, payment, and final submission.
 */
const Checkout = ({ theme }) => {
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  const [step, setStep] = useState("shipping"); // "shipping" or "payment"
  const [paymentMethod, setPaymentMethod] = useState("mada");

  // Generate random order ID for demo purposes
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

  // Animation effect on step change
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

  // Calculations
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
          `${index + 1}. ${item.name}\n   المقاس: ${
            item.selectedSize || "غير محدد"
          }\n   الكمية: ${item.quantity}\n   السعر: ${item.price}`,
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
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, "_blank");

    dispatch(clearCart());
    dispatch(setCurrentPage("home"));
  };

  return (
    <section
      ref={containerRef}
      className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-500 ${
        theme === "green" ? "bg-brand-offwhite" : "bg-brand-burgundy"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps Header */}
        <div className="flex justify-between items-end mb-12">
          <div className="flex gap-4 items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                step === "shipping"
                  ? "bg-brand-gold border-brand-gold text-brand-charcoal"
                  : "border-brand-gold text-brand-gold"
              }`}
            >
              1
            </div>
            <div
              className={`h-[2px] w-12 ${
                step === "payment" ? "bg-brand-gold" : "bg-brand-gold/20"
              }`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                step === "payment"
                  ? "bg-brand-gold border-brand-gold text-brand-charcoal"
                  : "border-brand-gold/20 text-brand-gold/20"
              }`}
            >
              2
            </div>
          </div>
          <h1
            className={`text-4xl md:text-5xl font-sans text-right ${
              theme === "green" ? "text-brand-charcoal" : "text-white"
            }`}
          >
            {step === "shipping" ? "إتمام الطلب" : "تفاصيل الدفع"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area (Form) */}
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <ShippingForm
                formData={formData}
                handleInputChange={handleInputChange}
                goToPayment={goToPayment}
                theme={theme}
              />
            ) : (
              <PaymentForm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                paymentData={paymentData}
                handlePaymentInputChange={handlePaymentInputChange}
                handleFinalSubmit={handleFinalSubmit}
                onBack={() => setStep("shipping")}
                total={total}
                theme={theme}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            orderId={orderId}
            step={step}
            onBackToCart={() => dispatch(setCurrentPage("cart"))}
            theme={theme}
          />
        </div>
      </div>
    </section>
  );
};

export default Checkout;
