import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Preloader = ({ onComplete }) => {
  const loaderRef = useRef(null);
  const logoRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
    )
      .fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.5, ease: "power2.inOut" },
        "-=0.5",
      )
      .to(loaderRef.current, {
        yPercent: -100,
        duration: 1,
        delay: 0.5,
        ease: "expo.inOut",
      });
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[100] bg-brand-charcoal flex flex-col items-center justify-center pointer-events-none"
    >
      <div className="relative flex flex-col items-center">
        <img
          ref={logoRef}
          src="/assets/logo.png"
          alt="Storia Logo"
          className="h-20 mb-8 brightness-0 invert"
        />
        <div className="w-48 h-[1px] bg-brand-gold/30">
          <div
            ref={lineRef}
            className="w-full h-full bg-brand-gold origin-left"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
