import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Hero = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      imageRef.current,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2, ease: "slow(0.7, 0.7, false)" },
    ).fromTo(
      textRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, stagger: 0.3, ease: "power3.out" },
      "-=1",
    );
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-brand-offwhite flex items-center justify-center"
    >
      <div ref={imageRef} className="absolute inset-0 w-full h-full">
        <img
          src="/assets/hero.png"
          alt="ستوريا للعبايات"
          className="w-full h-full object-cover grayscale-[10%] brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-brand-offwhite/40"></div>
      </div>

      <div
        ref={textRef}
        className="relative z-10 text-center text-white px-4 pt-32 md:pt-40"
      >
        <h2 className="text-5xl md:text-7xl font-serif italic mb-10 drop-shadow-lg leading-tight uppercase font-medium">
          ستوريا للعبايات <br />{" "}
          <span className="not-italic text-lg md:text-2xl block mt-4 font-light opacity-90 tracking-[0.2em]">
            الأناقة السعودية بأفضل الأقمشة
          </span>
        </h2>
        <button className="group relative px-12 py-5 overflow-hidden border border-brand-gold/50 bg-brand-charcoal/40 backdrop-blur-md">
          <span className="relative z-10 uppercase tracking-widest text-sm font-semibold group-hover:text-brand-charcoal transition-colors duration-300">
            تسوقي الآن
          </span>
          <div className="absolute inset-0 bg-brand-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
        </button>
      </div>

      <div className="absolute bottom-12 left-12 flex flex-col items-center gap-4 opacity-50">
        <div className="w-[1px] h-20 bg-brand-charcoal/30 animate-pulse"></div>
        <span className="uppercase tracking-widest text-[10px] -rotate-90 origin-left">
          اسحبي للأسفل
        </span>
      </div>
    </section>
  );
};

export default Hero;
