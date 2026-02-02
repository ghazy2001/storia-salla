import React from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Reusable lightbox/modal component for image galleries
 */
const Lightbox = ({
  isOpen,
  image,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalImages,
  altText,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[101] text-white hover:text-brand-gold transition-colors p-2 rounded-full bg-white/10 backdrop-blur-sm"
      >
        <X size={32} />
      </button>

      {/* Navigation Buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-6 z-[101] text-white hover:text-brand-gold transition-colors p-3 rounded-full bg-white/10 backdrop-blur-sm"
      >
        <ArrowLeft size={32} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-6 z-[101] text-white hover:text-brand-gold transition-colors p-3 rounded-full bg-white/10 backdrop-blur-sm"
      >
        <ArrowRight size={32} />
      </button>

      {/* Image */}
      <img
        src={image}
        alt={altText}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Image Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} / {totalImages}
      </div>
    </div>
  );
};

export default Lightbox;
