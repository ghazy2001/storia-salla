import React, { useState, useEffect } from "react";
import { X, Send, User, Mail, MessageSquare } from "lucide-react";

import { useDispatch } from "react-redux";
import { showToast } from "../../store/slices/uiSlice";
import { CONTACT_INFO } from "../../utils/constants";
import { config } from "../../config/config";

const ContactForm = ({ isOpen, onClose, theme }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  // ... (keep useEffect and validateForm same)

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.message.trim()) {
      newErrors.message = "الرسالة مطلوبة";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "الرسالة يجب أن تكون 10 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Form is valid, send to backend/email service
      dispatch(showToast("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً"));

      // Reset form and close modal
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative ${
          theme === "burgundy" ? "bg-brand-burgundy" : "bg-brand-primary"
        } rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/5 transition-colors duration-500`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div
          className={`bg-gradient-to-br ${
            theme === "burgundy"
              ? "from-brand-burgundy via-brand-burgundy to-brand-burgundy"
              : "from-brand-primary via-brand-secondary to-brand-primary"
          } p-8 text-center border-b border-white/5 transition-all duration-500`}
        >
          <h2 className="text-3xl md:text-4xl font-sans text-white mb-2">
            تواصلي معنا
          </h2>
          <p className="text-white/70 text-sm tracking-wide">
            نحن هنا للإجابة على استفساراتك
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-right text-sm font-medium text-white/80 mb-2"
            >
              الاسم الكامل *
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 text-right bg-white/5 text-white border ${
                  errors.name ? "border-red-500/50" : "border-white/10"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all placeholder:text-white/20`}
                placeholder="اكتبي اسمك الكامل"
              />
              <User
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20"
                size={18}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 text-right">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-right text-sm font-medium text-white/80 mb-2"
            >
              البريد الإلكتروني *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 text-right bg-white/5 text-white border ${
                  errors.email ? "border-red-500/50" : "border-white/10"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all placeholder:text-white/20`}
                placeholder="example@email.com"
              />
              <Mail
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20"
                size={18}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 text-right">
                {errors.email}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-right text-sm font-medium text-white/80 mb-2"
            >
              الرسالة *
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className={`w-full px-4 py-3 pr-12 text-right bg-white/5 text-white border ${
                  errors.message ? "border-red-500/50" : "border-white/10"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all resize-none placeholder:text-white/20`}
                placeholder="اكتبي رسالتك أو استفسارك هنا..."
              />
              <MessageSquare
                className="absolute right-4 top-4 text-white/20"
                size={18}
              />
            </div>
            {errors.message && (
              <p className="text-red-500 text-xs mt-1 text-right">
                {errors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="group relative w-full bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold bg-[length:200%_100%] text-brand-primary py-4 rounded-lg font-bold tracking-wide shadow-lg hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-500 overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Button Content */}
            <span className="relative flex items-center justify-center gap-2">
              <Send
                size={18}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              إرسال الرسالة
            </span>

            {/* Border Glow on Hover */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(185,156,107,0.5)]" />
          </button>

          {/* Alternative Contact */}
          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-sm text-white/40 mb-3">
              أو تواصلي معنا مباشرة عبر
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`mailto:${CONTACT_INFO.EMAIL}`}
                className="text-brand-gold hover:text-white transition-colors text-sm font-medium"
              >
                {CONTACT_INFO.EMAIL}
              </a>
              <span className="hidden sm:block text-white/10">|</span>
              <a
                href={`https://wa.me/${config.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:text-white transition-colors text-sm font-medium"
              >
                واتساب
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
