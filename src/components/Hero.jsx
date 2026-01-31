import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Hero = ({ goToStore }) => {
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

    // Ultra-Performant Scroll Animation: Border Radius is much smoother than Clip-Path
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      borderBottomLeftRadius: "50% 150px",
      borderBottomRightRadius: "50% 150px",
      ease: "none",
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full bg-brand-offwhite flex items-center justify-center overflow-hidden"
    >
      <div ref={imageRef} className="absolute inset-0 w-full h-full">
        <img
          src="/assets/hero.png"
          alt="STORIA DESIGN"
          className="w-full h-full object-cover grayscale-[10%] brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-brand-offwhite/40"></div>
      </div>

      <div
        ref={textRef}
        className="relative z-10 text-center text-white px-4 pt-32 md:pt-40"
      >
        <h2 className="text-6xl md:text-8xl font-serif italic mb-10 drop-shadow-2xl leading-tight uppercase font-medium tracking-tight">
          STORIA <br />{" "}
          <span className="not-italic text-3xl md:text-4xl block mt-4 font-light opacity-95 tracking-[0.4em]">
            DESIGN
          </span>
        </h2>
        <p className="text-white/80 text-base md:text-lg max-w-lg mx-auto mb-10 tracking-widest font-light leading-relaxed">
          مستوحاة من الأناقة والذوق السعودي الأصيل. أنثوية راقية وقيم موضة
          سعودية حديثة.
        </p>
        <button
          className="group relative px-12 py-5 overflow-hidden border border-brand-gold/50 bg-brand-charcoal/40 backdrop-blur-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={goToStore}
        >
          <span className="relative z-10 uppercase tracking-widest text-xs font-semibold transition-colors duration-300">
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
