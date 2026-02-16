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
  title,
  description,
  price,
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

        {/* Info Overlay at Bottom */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-auto min-w-[300px] max-w-2xl bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-right animate-in fade-in slide-in-from-bottom-4 duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-6">
              <span className="text-brand-gold text-2xl font-bold">
                {price} {price && !String(price).includes("ر.س") && " ر.س"}
              </span>
              <h3 className="text-white text-xl md:text-2xl font-sans font-bold">
                {title}
              </h3>
            </div>
            {description && (
              <p className="text-white/70 text-sm md:text-base font-light leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Counter */}
      <div className="mt-4 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} / {totalImages}
      </div>
    </div>
  );
};

export default Lightbox;
