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
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4"
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
        className="absolute left-6 z-[101] text-white hover:text-brand-gold transition-colors p-3 rounded-full bg-white/10 backdrop-blur-sm hidden md:block"
      >
        <ArrowLeft size={32} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-6 z-[101] text-white hover:text-brand-gold transition-colors p-3 rounded-full bg-white/10 backdrop-blur-sm hidden md:block"
      >
        <ArrowRight size={32} />
      </button>

      {/* Image Container */}
      <div className="relative flex-grow flex items-center justify-center w-full max-h-[80vh]">
        <img
          src={image}
          alt={altText}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Image Counter */}
      <div className="mt-4 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} / {totalImages}
      </div>
    </div>
  );
};

export default Lightbox;
