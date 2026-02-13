import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCartItems,
  selectCartTotal,
  setCurrentPage,
  clearCart,
  selectAppliedCoupon,
  selectCartDiscount,
  removeCoupon,
} from "../../store/slices/cartSlice";
import gsap from "gsap";
import axios from "axios";

// Sub-components
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import OrderSummary from "./OrderSummary";

// Salla Integration
import sallaService from "../../services/sallaService";
import { config } from "../../config/config";

const Checkout = ({ theme }) => {
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const discountAmount = useSelector(selectCartDiscount);
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const [step, setStep] = useState("shipping");
  const [paymentMethod, setPaymentMethod] = useState("mada");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Calculations
  const shipping = cartItems.length > 0 ? config.shippingFee : 0;
  const tax = (subtotal - discountAmount) * 0.15;
  const total = subtotal - discountAmount + shipping + tax;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // If on Salla platform, redirect to Salla checkout
      if (config.useSallaBackend && sallaService.isAvailable()) {
        return await sallaService.goToCheckout();
      }
      // 1. Create real order in backend
      const orderPayload = {
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        items: cartItems.map((item) => ({
          productId: item._id || item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.selectedSize,
        })),
        total,
        discountAmount,
        couponUsed: appliedCoupon?.code,
      };

      const response = await axios.post(
        `${config.apiUrl}/api/orders`,
        orderPayload,
      );
      const dbOrder = response.data;

      // 2. Fallback to WhatsApp with the real order ID
      const orderDetails = cartItems
        .map(
          (item, index) =>
            `${index + 1}. ${item.name}\n   المقاس: ${item.selectedSize || "غير محدد"}\n   الكمية: ${item.quantity}\n   السعر: ${item.price}`,
        )
        .join("\n\n");

      const message = `
🛍️ *طلب جديد من متجر ستوريا*
رقم الطلب: ${dbOrder.orderNumber}

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
${discountAmount > 0 ? `الخصم: -${discountAmount.toFixed(2)} ر.س\n` : ""}الشحن: ${shipping.toFixed(2)} ر.س
الضريبة (15%): ${tax.toFixed(2)} ر.س
الإجمالي: ${total.toFixed(2)} ر.س
      `.trim();

      const phoneNumber = config.whatsappNumber;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      // Set order data for summary if needed (though we clear cart immediately)
      // For now, clear cart as it was.
      dispatch(clearCart());
      dispatch(removeCoupon());
      navigate("/");
    } catch (error) {
      alert("حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            className={`text-4xl md:text-5xl font-sans text-right ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
          >
            {step === "shipping" ? "إتمام الطلب" : "تفاصيل الدفع"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
            {isSubmitting && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-gray-900">جاري معالجة طلبك...</p>
                </div>
              </div>
            )}
          </div>

          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            orderId={"—"} // Order ID will be generated by backend
            step={step}
            onBackToCart={() => navigate("/cart")}
            theme={theme}
          />
        </div>
      </div>
    </section>
  );
};

export default Checkout;
