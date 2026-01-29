import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Check, X } from "lucide-react";

const Toast = ({ message, isVisible, onClose }) => {
  const toastRef = useRef(null);

  const handleClose = () => {
    // Slide UP to exit since it's now at the top
    gsap.to(toastRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
      onComplete: onClose,
    });
  };

  useEffect(() => {
    if (isVisible) {
      // Slide DOWN from above
      gsap.fromTo(
        toastRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      );

      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={toastRef}
      // Fixed top-24, left-8 (on desktop)
      className="fixed top-24 left-1/2 -translate-x-1/2 md:left-8 md:right-auto md:translate-x-0 z-[60] flex items-center gap-4 px-6 py-4 rounded-lg shadow-xl backdrop-blur-xl border border-brand-gold/30 bg-[#1a1a1a]/95 text-white"
      role="alert"
    >
      <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center shrink-0 shadow-lg shadow-brand-gold/20">
        <Check size={18} className="text-[#1a1a1a]" />
      </div>

      <div className="flex-1 text-right">
        {/* Force text-white to ensure visibility in all themes */}
        <p className="font-sans font-medium text-sm md:text-base text-white">
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="p-1 rounded-full transition-colors hover:bg-white/10 text-white/50 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
