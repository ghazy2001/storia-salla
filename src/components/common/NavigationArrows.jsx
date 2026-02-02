import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getBorderClass,
  getHoverBgClass,
  getHoverTextClass,
} from "../../utils/themeUtils";

/**
 * Reusable navigation arrows component for carousels
 * @param {Function} onPrev - Previous navigation handler
 * @param {Function} onNext - Next navigation handler
 * @param {string} theme - Current theme
 * @param {string} variant - "desktop" or "mobile" or "overlay"
 * @param {string} className - Additional classes
 */
const NavigationArrows = ({
  onPrev,
  onNext,
  theme,
  variant = "desktop",
  className = "",
}) => {
  // Mobile overlay arrows (appear on hover over carousel)
  if (variant === "overlay") {
    const overlayBaseClass =
      theme === "green"
        ? "bg-white/70 border-brand-charcoal/10 text-brand-charcoal hover:bg-white"
        : "bg-black/30 border-white/10 text-white hover:bg-black/50";

    return (
      <>
        <button
          onClick={onPrev}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 backdrop-blur-md border ${overlayBaseClass} ${className}`}
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={onNext}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 backdrop-blur-md border ${overlayBaseClass} ${className}`}
        >
          <ArrowRight size={20} />
        </button>
      </>
    );
  }

  // Desktop navigation arrows (below carousel)
  const baseClass = `group/arrow transition-all duration-300 p-3 border rounded-full ${getBorderClass(theme)} ${getHoverBgClass(theme)} ${getHoverTextClass(theme)}`;

  return (
    <div className={`gap-4 flex ${className}`}>
      <button onClick={onPrev} className={baseClass}>
        <ArrowLeft size={24} />
      </button>
      <button onClick={onNext} className={baseClass}>
        <ArrowRight size={24} />
      </button>
    </div>
  );
};

export default NavigationArrows;
