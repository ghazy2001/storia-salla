import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight, ChevronLeft } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

import { getImageSrc } from "../../utils/assetUtils";

import { useSelector } from "react-redux";
import { selectProducts } from "../../store/slices/productSlice";
import { selectTheme } from "../../store/slices/uiSlice";

const ProductListing = ({ goToStore, onProductSelect }) => {
  const theme = useSelector(selectTheme);
  const products = useSelector(selectProducts);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);

    // Entrance Animations
    const ctx = gsap.context(() => {
      // Reveal header
      gsap.fromTo(
        ".text-right",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );

      // Reveal view all button
      gsap.fromTo(
        "button.hidden",
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );

      // Staggered reveal for visible cards
      gsap.fromTo(
        ".product-card-reveal",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        },
      );
    }, sectionRef);

    return () => {
      window.removeEventListener("resize", updateItemsToShow);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    gsap.to(trackRef.current, {
      xPercent: currentIndex * (100 / itemsToShow),
      duration: 1,
      ease: "power3.inOut",
    });
  }, [currentIndex, itemsToShow]);

  const nextSlide = () => {
    if (currentIndex < products.length - itemsToShow) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(products.length - itemsToShow); // Loop to end
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`py-24 px-6 md:px-12 transition-colors duration-500 ${
        theme === "green" ? "bg-[#fdfcf8]" : "bg-brand-burgundy"
      }`}
    >
      <div className="flex justify-between items-end mb-16 px-4">
        <div className="text-right">
          <h3
            className={`text-4xl md:text-5xl font-sans uppercase tracking-tighter ${
              theme === "green" ? "text-brand-charcoal" : "text-white"
            }`}
          >
            مجموعة ستوريا المختارة
          </h3>
        </div>
        <button
          onClick={goToStore}
          className={`uppercase tracking-widest text-xs pb-1 border-b-2 font-semibold hover:scale-105 transition-all duration-300 hidden md:block cursor-pointer ${
            theme === "green"
              ? "border-brand-charcoal text-brand-charcoal hover:text-brand-gold hover:border-brand-gold"
              : "border-brand-light text-brand-light hover:text-brand-gold hover:border-brand-gold"
          }`}
        >
          مشاهدة جميع العبايات
        </button>
      </div>

      <div className="relative group/listing">
        <div className="overflow-hidden">
          <div ref={trackRef} className="flex" style={{ width: `100%` }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="px-4 product-card-reveal flex-shrink-0"
                style={{ width: `${100 / itemsToShow}%` }}
              >
                <div
                  onClick={() => onProductSelect(product.id)}
                  className="group cursor-pointer text-right"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-brand-beige mb-6 relative">
                    <img
                      src={getImageSrc(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-90 group-hover:contrast-110"
                    />
                    <div className="absolute inset-0 bg-brand-charcoal/0 group-hover:bg-brand-charcoal/10 transition-colors duration-700"></div>

                    {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductSelect(product.id);
                      }}
                      className={`absolute bottom-6 left-6 right-6 py-4 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 backdrop-blur-md shadow-2xl ${
                        theme === "green"
                          ? "bg-brand-charcoal text-white hover:bg-brand-gold"
                          : "bg-brand-gold text-brand-burgundy hover:bg-brand-burgundy hover:text-brand-gold"
                      }`}
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                  <div className="px-2 transition-transform duration-500 group-hover:translate-x-[-8px]">
                    <h4
                      className={`text-xl font-sans mb-1 group-hover:text-brand-gold transition-colors ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      {product.name}
                    </h4>
                    <p className="text-lg font-bold text-brand-gold mb-2">
                      {product.price} ر.س
                    </p>
                    <p
                      className={`text-sm font-light leading-relaxed line-clamp-2 pl-4 ${
                        theme === "green"
                          ? "text-brand-charcoal/60"
                          : "text-white/60"
                      }`}
                    >
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={nextSlide}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-brand-charcoal hover:bg-brand-gold hover:text-white transition-all duration-300 opacity-0 group-hover/listing:opacity-100 z-10"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={prevSlide}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-brand-charcoal hover:bg-brand-gold hover:text-white transition-all duration-300 opacity-0 group-hover/listing:opacity-100 z-10"
          aria-label="Next Slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Progress Dots - Editorial Styling */}
        <div className="flex justify-center mt-24">
          <div className="flex items-center gap-10">
            <span
              className={`text-[10px] font-bold tracking-[0.4em] opacity-30 font-sans transition-opacity group-hover/listing:opacity-100 ${
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }`}
            >
              0{currentIndex + 1}
            </span>

            <div
              className={`flex items-center gap-3 p-3 rounded-full border transition-all duration-700 shadow-sm ${
                theme === "green"
                  ? "bg-white/50 border-brand-charcoal/[0.03]"
                  : "bg-brand-charcoal/40 border-white/5"
              } backdrop-blur-md`}
            >
              {Array.from({ length: products.length - itemsToShow + 1 }).map(
                (_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full ${
                      currentIndex === i
                        ? "w-16 bg-brand-gold shadow-[0_4px_15px_rgba(191,155,48,0.4)]"
                        : "w-2 bg-brand-charcoal/20 hover:bg-brand-charcoal/40"
                    }`}
                  />
                ),
              )}
            </div>

            <span
              className={`text-[10px] font-bold tracking-[0.4em] opacity-30 font-sans transition-opacity group-hover/listing:opacity-100 ${
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }`}
            >
              0{products.length - itemsToShow + 1}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductListing;
