import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSelector, useDispatch } from "react-redux";
import { selectProducts } from "../../store/slices/productSlice";
import { setCurrentPage } from "../../store/slices/cartSlice";
import { selectTheme } from "../../store/slices/uiSlice";
import { ArrowRight } from "lucide-react";
import { useScrollContainer } from "../../hooks/useScrollContainer";
import { useLightbox } from "../../hooks/useLightbox";
import {
  getThemeValue,
  getCardClass,
  getTextClass,
} from "../../utils/themeUtils";
import NavigationArrows from "../common/NavigationArrows";
import Lightbox from "../common/Lightbox";

gsap.registerPlugin(ScrollTrigger);

const BestSellers = ({ onProductSelect }) => {
  const sectionRef = useRef(null);
  const products = useSelector(selectProducts);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const { containerRef, scrollLeft, scrollRight } = useScrollContainer(320);

  // Featured product for the banner - نواعم (classic category)
  const featuredProduct =
    products.find((p) => p.category === "classic") || products[0];

  // Carousel images: Get media from the featured product
  const carouselImages =
    featuredProduct?.media?.filter((m) => m.type === "image") ||
    (featuredProduct ? [{ src: featuredProduct.image, type: "image" }] : []);

  const lightbox = useLightbox(carouselImages);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!featuredProduct) return null;

  const sectionBgClass = getThemeValue(theme, "bg-white", "bg-brand-burgundy");
  const textColorClass = getTextClass(theme);

  return (
    <>
      <section
        ref={sectionRef}
        className={`py-12 md:py-24 px-6 md:px-12 transition-colors duration-500 overflow-hidden ${sectionBgClass}`}
      >
        <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-8 h-full">
          {/* RIGHT SIDE: Banner (RTL First) */}
          <div className="w-full lg:w-[40%] text-right relative h-[600px] lg:h-[700px] rounded-3xl overflow-hidden group shadow-2xl">
            {/* Banner Image */}
            <div className="absolute inset-0">
              <img
                src={carouselImages[0]?.src || featuredProduct.image}
                alt={featuredProduct.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>

            {/* Banner Content */}
            <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center text-center">
              <h2 className="text-4xl md:text-5xl font-sans text-white mb-2">
                الأكثر مبيعاً
              </h2>
              <p className="text-white/80 text-lg mb-8 font-light">
                تسوق افضل المنتجات المختارة لك خصيصا
              </p>

              <button
                onClick={() => dispatch(setCurrentPage("store"))}
                className="px-10 py-3 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300"
              >
                تسوق الآن
              </button>
            </div>
          </div>

          {/* LEFT SIDE: Carousel */}
          <div className="w-full lg:w-[60%] flex flex-col justify-center group/carousel">
            <div className="relative">
              {/* Mobile Navigation Arrows (Overlay) */}
              <div className="md:hidden">
                <NavigationArrows
                  onPrev={scrollLeft}
                  onNext={scrollRight}
                  theme={theme}
                  variant="overlay"
                />
              </div>

              {/* Scroll Container */}
              <div
                ref={containerRef}
                className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 snap-x scrollbar-hide scroll-smooth"
                style={{ direction: "rtl" }}
              >
                {carouselImages.map((mediaItem, index) => (
                  <div
                    key={index}
                    className="min-w-[280px] md:min-w-[320px] snap-start group relative"
                  >
                    {/* Card Container */}
                    <div
                      className={`rounded-[2rem] p-2 transition-all duration-300 hover:shadow-xl ${getCardClass(theme)}`}
                    >
                      {/* Image Area */}
                      <div
                        onClick={() => lightbox.open(index)}
                        className="aspect-[3/4] rounded-3xl overflow-hidden mb-4 relative cursor-pointer"
                      >
                        <img
                          src={mediaItem.src}
                          alt={`${featuredProduct.name} - View ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Add to Cart Button (Absolute) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProductSelect(featuredProduct.id);
                          }}
                          className="group/btn absolute bottom-4 left-4 h-10 bg-white text-black rounded-full flex items-center overflow-hidden transition-all duration-300 hover:w-32 w-10 shadow-lg z-10"
                          title="View Details"
                        >
                          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover/btn:text-brand-gold transition-colors">
                            <ArrowRight size={20} className="-rotate-45" />
                          </div>
                          <span className="whitespace-nowrap text-xs font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pr-2">
                            التفاصيل
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation & Info */}
            <div
              className={`flex justify-between items-center px-8 mt-6 gap-12 ${textColorClass}`}
            >
              <div className="w-full text-right">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-brand-gold text-3xl font-bold">
                    {featuredProduct.price}
                  </div>
                </div>
                <p
                  className={`${textColorClass} opacity-80 text-lg font-light leading-relaxed`}
                >
                  {featuredProduct.bestSellerDescription ||
                    featuredProduct.description}
                </p>
              </div>

              {/* Desktop Navigation Arrows */}
              <NavigationArrows
                onPrev={scrollLeft}
                onNext={scrollRight}
                theme={theme}
                variant="desktop"
                className="hidden md:flex"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightbox.isOpen}
        image={lightbox.currentImage?.src}
        onClose={lightbox.close}
        onPrev={lightbox.prev}
        onNext={lightbox.next}
        currentIndex={lightbox.currentIndex}
        totalImages={carouselImages.length}
        altText={`${featuredProduct.name} - ${lightbox.currentIndex + 1}`}
      />
    </>
  );
};

export default BestSellers;
