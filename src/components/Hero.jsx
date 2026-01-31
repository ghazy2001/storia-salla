import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { products } from "../data/products";

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ goToStore }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const stripsRef = useRef([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Neutral "Normal" Overlay Colors - Lightened
  const overlayOpacity = "bg-black/35";
  const gradientFrom = "from-black/25";
  const gradientTo = "to-black/45";
  const baseColor = "#0a0a0a";

  useEffect(() => {
    const tl = gsap.timeline();

    // Text Entrance
    tl.fromTo(
      textRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power2.out" },
      0.8,
    );

    // Strips Entrance
    stripsRef.current.forEach((strip, index) => {
      gsap.fromTo(
        strip,
        { scaleY: 0, opacity: 0 },
        {
          scaleY: 1,
          opacity: 1,
          duration: 1.8,
          delay: index * 0.08,
          ease: "expo.out",
        },
      );
    });

    // Scroll Animation
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      borderBottomLeftRadius: "50% 120px",
      borderBottomRightRadius: "50% 120px",
      ease: "none",
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Create a specific order for the Hero strips
  const heroProducts = [...products];
  if (heroProducts.length >= 6) {
    const temp = heroProducts[1];
    heroProducts[1] = heroProducts[5];
    heroProducts[5] = temp;
  }

  // Arabic labels mapping
  const categoryLabels = {
    official: "رسمية",
    practical: "عملية",
    luxury: "فاخرة",
    cloche: "كلوش",
    bisht: "بشت",
    classic: "نواعم",
  };

  return (
    <section
      ref={containerRef}
      style={{ backgroundColor: baseColor }}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-1000"
    >
      {/* Interactive Background Strips - No limiting z-index on container */}
      <div
        className={`absolute inset-0 flex w-full h-full opacity-90 transition-all duration-700 ${isScrolled ? "pointer-events-none" : ""}`}
      >
        {heroProducts.map((product, index) => (
          <div
            key={product.id}
            ref={(el) => (stripsRef.current[index] = el)}
            className={`group relative flex-1 h-full overflow-hidden transition-[flex,z-index] duration-500 md:duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:flex-[2.2] md:hover:flex-[3] border-r border-white/5 last:border-0 hover:z-20 z-10 cursor-pointer ${
              index > 3 ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="absolute inset-0 grayscale-[20%] group-hover:grayscale-0 brightness-[0.9] group-hover:brightness-[1.1] transition-all duration-1000 scale-[1.6] group-hover:scale-[1.5]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-[center_45%]"
              />

              {/* Individual Professional Overlay - Clears on Hover */}
              <div
                className={`absolute inset-0 ${overlayOpacity} group-hover:bg-transparent transition-colors duration-1000 z-10`}
              ></div>

              {/* Professional Cinematic Lighting - Only on Hover - TONED DOWN */}
              {/* Soft Rim Light */}
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-20"></div>

              {/* Radial Highlight (Light Glow) */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-20"></div>
            </div>

            {/* Subtle Label on Hover - More Professional Styling */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 whitespace-nowrap translate-y-6 group-hover:translate-y-0 z-30">
              <span className="text-[10px] md:text-[14px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white font-medium border-b border-white/40 pb-1 drop-shadow-lg">
                {categoryLabels[product.category] || product.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Overlay - Positioned BELOW hovered but ABOVE static strips */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${gradientFrom} via-transparent ${gradientTo} pointer-events-none z-15 transition-colors duration-1000`}
      ></div>

      <div
        ref={textRef}
        className="relative z-30 text-center text-white px-4 pt-32 md:pt-40 pointer-events-none select-none"
      >
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-sans mb-6 drop-shadow-2xl leading-tight uppercase font-medium tracking-tight">
          STORIA <br />{" "}
          <span className="not-italic text-xl sm:text-2xl md:text-4xl block mt-2 font-light opacity-95 tracking-[0.4em]">
            DESIGN
          </span>
        </h2>
        <p className="text-white/90 text-[11px] md:text-sm max-w-[280px] md:max-w-md mx-auto mb-10 tracking-[0.1em] md:tracking-[0.2em] font-light leading-relaxed backdrop-blur-md px-6 md:px-8 py-3 rounded-full border border-white/5 bg-white/5">
          مستوحاة من الأناقة والذوق السعودي الأصيل. أنثوية راقية وقيم موضة
          سعودية حديثة.
        </p>
        <button
          className="group relative px-10 md:px-12 py-4 md:py-5 overflow-hidden border border-brand-gold/30 bg-black/20 backdrop-blur-xl cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 pointer-events-auto"
          onClick={goToStore}
        >
          <span className="relative z-10 uppercase tracking-[0.3em] text-[10px] md:text-[11px] font-semibold transition-colors duration-300">
            تسوقي الآن
          </span>
          <div className="absolute inset-0 bg-brand-gold/80 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
        </button>
      </div>

      {/* Scroll Indicator - Refined */}
      <div className="absolute bottom-12 left-12 flex flex-col items-center gap-6 opacity-40 z-30">
        <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent"></div>
        <span className="uppercase tracking-[0.4em] text-[9px] -rotate-90 origin-left text-white font-light">
          اسحبي للأسفل
        </span>
      </div>
    </section>
  );
};

export default Hero;
