import { useState, useEffect } from "react";

/**
 * Custom hook for lightbox/modal image gallery functionality
 * @param {Array} images - Array of image objects
 * @returns {Object} Lightbox state and control methods
 */
export const useLightbox = (images = []) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const open = (index = 0) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return {
    isOpen,
    currentIndex,
    currentImage: images[currentIndex],
    open,
    close,
    next,
    prev,
  };
};
