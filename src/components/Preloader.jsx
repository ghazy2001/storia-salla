import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Preloader = ({ isReady, onTransitionEnd }) => {
  const loaderRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Continuous breathing/pulse animation
    const pulse = gsap.to(logoRef.current, {
      scale: 1.05,
      opacity: 0.8,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    if (isReady) {
      // Stop pulse and exit
      pulse.kill();
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          if (onTransitionEnd) onTransitionEnd();
        },
      });
    }

    return () => pulse.kill();
  }, [isReady, onTransitionEnd]);

  return (
    <div
      ref={loaderRef}
      className={`fixed inset-0 z-[100] bg-brand-charcoal flex items-center justify-center ${isReady ? "pointer-events-none" : "pointer-events-auto"}`}
    >
      <div className="relative">
        <img
          ref={logoRef}
          src="/assets/logo.png"
          alt="Storia Logo"
          className="h-20 brightness-0 invert"
        />
      </div>
    </div>
  );
};

export default Preloader;
