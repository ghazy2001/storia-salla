import React from "react";

/**
 * ShippingForm Component
 *
 * Handles the collection of user's shipping information.
 *
 * Props:
 * @param {Object} formData - The current state of shipping info (name, phone, address, etc.)
 * @param {Function} handleInputChange - Handler for input field changes
 * @param {Function} goToPayment - Handler to proceed to the payment step
 * @param {string} theme - Current application theme ('green' or 'burgundy')
 */
const ShippingForm = ({ formData, handleInputChange, goToPayment, theme }) => {
  return (
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
          className={`text-2xl font-sans mb-6 text-right ${
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
                  theme === "green" ? "text-brand-charcoal" : "text-white"
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
                  theme === "green" ? "text-brand-charcoal" : "text-white"
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
              العنوان بالتفصيل *
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
              rows="3"
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

      <button
        type="submit"
        className="w-full bg-brand-gold text-brand-charcoal py-5 uppercase tracking-widest font-bold hover:shadow-lg transition-all duration-300"
      >
        الانتقال للدفع
      </button>
    </form>
  );
};

export default ShippingForm;
