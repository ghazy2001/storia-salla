import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSelector } from "react-redux";
import { selectProducts } from "../../store/slices/productSlice";
import { useNavigate } from "react-router-dom";
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
import { resolveAsset } from "../../utils/assetUtils";
import { config } from "../../config/config";

gsap.registerPlugin(ScrollTrigger);

const BestSellers = () => {
  const sectionRef = useRef(null);
  const products = useSelector(selectProducts);
  const theme = useSelector(selectTheme);

  const { containerRef, scrollLeft, scrollRight } = useScrollContainer(320);
  const navigate = useNavigate();

  // State for BestSellers configuration from database
  const [featuredConfig, setFeaturedConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch BestSellers configuration from backend
  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/bestsellers`);

        if (response.ok) {
          const config = await response.json();
          setFeaturedConfig(config);
        } else {
          console.warn("[BestSellers] API failed, using fallback product");
          // Fallback to first classic product if API fails
          const fallback =
            products.find((p) => p.category === "classic") || products[0];
          setFeaturedConfig(fallback);
        }
      } catch (error) {
        console.error("[BestSellers] Error fetching config:", error);
        // Fallback to first classic product
        const fallback =
          products.find((p) => p.category === "classic") || products[0];
        setFeaturedConfig(fallback);
      } finally {
        setLoading(false);
      }
    };

    loadBestSellers();
  }, [products]);

  // Carousel images from configuration
  const carouselImages = featuredConfig?.media || [];
  const bannerImage =
    carouselImages.find((m) => m.type === "image")?.src ||
    featuredConfig?.image;

  const lightbox = useLightbox(carouselImages);

  useEffect(() => {
    if (loading || !featuredConfig) return;

    const ctx = gsap.context(() => {
      if (sectionRef.current) {
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
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, featuredConfig]);

  if (loading || !featuredConfig) return null;

  // Resolve local product ID — API may return MongoDB _id as id
  const matchedProduct =
    products.find((p) => String(p.id) === String(featuredConfig.id)) ||
    products.find((p) => p.category === featuredConfig.category) ||
    products[0];
  const localProductId = matchedProduct?.id || featuredConfig.id;

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
                src={resolveAsset(bannerImage)}
                alt={featuredConfig.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>

            {/* Banner Content */}
            <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center text-center">
              <h2 className="text-4xl md:text-5xl font-sans text-white mb-2">
                {featuredConfig.bannerText?.ar || "الأكثر مبيعاً"}
              </h2>
              <p className="text-white/80 text-lg mb-8 font-light">
                {featuredConfig.bannerSubtext?.ar ||
                  "تسوق افضل المنتجات المختارة لك خصيصا"}
              </p>

              <button
                onClick={() => navigate("/store")}
                className="px-10 py-3 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300"
              >
                {featuredConfig.ctaText?.ar || "تسوق الآن"}
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
                    className="min-w-[280px] md:min-w-[320px] snap-start group/card relative"
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
                          src={resolveAsset(mediaItem.src)}
                          alt={`${featuredConfig.name} - View ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                        />
                      </div>
                    </div>

                    {/* Arrow pill button - outside overflow-hidden so it can expand */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${localProductId}`);
                      }}
                      className="btn-pill-expand absolute bottom-6 left-6 h-10 bg-white text-black rounded-full flex items-center shadow-lg z-10 cursor-pointer"
                    >
                      <div className="btn-pill-icon w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                        <ArrowRight size={18} className="-rotate-45" />
                      </div>
                      <span className="btn-pill-label whitespace-nowrap text-xs font-semibold pr-4">
                        التفاصيل
                      </span>
                    </button>
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
                    {/* Use Synced Price from Redux if available, otherwise fallback to config */}
                    {(() => {
                      const syncedProduct = products.find(
                        (p) => String(p.id) === String(featuredConfig.id),
                      );
                      return syncedProduct
                        ? syncedProduct.price
                        : featuredConfig.price;
                    })()}
                    {/* The price string presumably includes currency or we append it if it's just a number */}
                    {!String(
                      products.find(
                        (p) => String(p.id) === String(featuredConfig.id),
                      )?.price || featuredConfig.price,
                    ).includes("ر.س") && " ر.س"}
                  </div>
                </div>
                <p
                  className={`${textColorClass} opacity-80 text-lg font-light leading-relaxed`}
                >
                  {featuredConfig.bestSellerDescription ||
                    featuredConfig.description}
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
        image={resolveAsset(lightbox.currentImage?.src)}
        onClose={lightbox.close}
        onPrev={lightbox.prev}
        onNext={lightbox.next}
        currentIndex={lightbox.currentIndex}
        totalImages={carouselImages.length}
        altText={`${featuredConfig.name} - ${lightbox.currentIndex + 1}`}
        title={featuredConfig.name}
        description={
          featuredConfig.bestSellerDescription || featuredConfig.description
        }
        price={(() => {
          const syncedProduct = products.find(
            (p) => String(p.id) === String(featuredConfig.id),
          );
          return syncedProduct ? syncedProduct.price : featuredConfig.price;
        })()}
      />
    </>
  );
};

export default BestSellers;
