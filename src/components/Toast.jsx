import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { Check, X } from "lucide-react";

const Toast = ({ message, isVisible, onClose }) => {
  const toastRef = useRef(null);

  const handleClose = useCallback(() => {
    // All devices: Slide UP to exit
    gsap.to(toastRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
      onComplete: onClose,
    });
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      // All devices: Slide DOWN from above
      gsap.fromTo(
        toastRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      );

      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, handleClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={toastRef}
      // Fixed top-20 on mobile (just below header usually), top-24 on desktop
      className="fixed top-20 left-1/2 -translate-x-1/2 md:top-24 md:left-8 md:right-auto md:translate-x-0 z-[60] flex items-center gap-4 px-6 py-4 rounded-lg shadow-xl backdrop-blur-xl border border-brand-gold/30 bg-[#1a1a1a]/95 text-white w-[90vw] max-w-sm md:w-auto"
      role="alert"
    >
      <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center shrink-0 shadow-lg shadow-brand-gold/20">
        <Check size={18} className="text-[#1a1a1a]" />
      </div>

      <div className="flex-1 text-right min-w-0">
        {/* Whitespace-nowrap to prevent aggressive wrapping if space allows, or allow wrapping but clearer */}
        <p className="font-sans font-medium text-sm md:text-base text-white whitespace-nowrap">
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="p-1 rounded-full transition-colors hover:bg-white/10 text-white/50 hover:text-white shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
