import { useRef } from "react";

/**
 * Custom hook for horizontal scroll container functionality
 * Provides ref and scroll methods for carousel-like components
 * @param {number} scrollAmount - Amount to scroll in pixels (default: 320)
 * @returns {Object} { containerRef, scrollLeft, scrollRight }
 */
export const useScrollContainer = (scrollAmount = 320) => {
  const containerRef = useRef(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return { containerRef, scrollLeft, scrollRight };
};
