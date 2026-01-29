import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const OurStory = ({ theme }) => {
  const sectionRef = useRef(null);

  const isLightTheme = theme === "green";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Define colors
      // Light Mode: Transition from Offwhite (#FDFCF8) to Burgundy (#4D1330)
      // Dark Mode: Transition from Burgundy (#4D1330) to Green (#0e352f)

      const startColor = isLightTheme ? "#FDFCF8" : "#4D1330";
      const endColor = isLightTheme ? "#4D1330" : "#0e352f";

      // Background Color Scrub Animation
      gsap.fromTo(
        sectionRef.current,
        { backgroundColor: startColor },
        {
          backgroundColor: endColor,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%", // Start fading when top of section hits 80% viewport
            end: "top 50%", // Finish fading faster (shorter distance)
            scrub: 1, // Smooth interaction
          },
        },
      );

      // Image Reveal
      gsap.fromTo(
        ".story-image",
        { scale: 1.1, opacity: 0, y: 50 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        },
      );

      // Text Stagger
      gsap.fromTo(
        ".story-text",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        },
      );

      // Line animation
      gsap.fromTo(
        ".story-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [theme, isLightTheme]); // Re-run if theme changes

  // Border logic
  const borderColorClass = isLightTheme
    ? "border-brand-gold/30"
    : "border-white/10";

  return (
    <section
      ref={sectionRef}
      className={`relative py-32 md:py-48 overflow-hidden`}
      style={{ backgroundColor: isLightTheme ? "#FDFCF8" : "#4D1330" }}
    >
      <div className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 xl:gap-32 items-center">
          {/* Image Side - Order 3 (Left in RTL) */}
          <div className="lg:col-span-5 order-2 lg:order-3 relative">
            <div
              className={`relative aspect-[3/4] overflow-hidden rounded-sm story-image shadow-2xl border ${borderColorClass}`}
            >
              <img
                src="/assets/storia_about.png"
                alt="Storia Details"
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all duration-1000 hover:scale-105"
              />
              {/* Decorative Frame */}
              <div className="absolute inset-4 border border-brand-gold/20 pointer-events-none"></div>
            </div>
            {/* Floating Badge - Left Side */}
            <div className="absolute -bottom-6 -left-6 lg:-left-12 bg-brand-gold text-brand-charcoal w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full p-4 text-center font-bold text-xs md:text-sm leading-tight shadow-xl story-text origin-center animate-spin-slow">
              هوية
              <br />
              عصرية
              <br />
              أصيلة
            </div>
          </div>

          <div className="lg:col-span-1 border-hidden lg:block hidden"></div>

          {/* Text Side - Order 1 (Right in RTL) */}
          <div className="lg:col-span-6 order-1 lg:order-1 text-right">
            <div className="flex flex-col items-start">
              <span
                className={`uppercase tracking-[0.5em] text-base md:text-lg font-semibold mb-8 block story-text text-brand-gold`}
              >
                قصة ستوريا
              </span>

              <h2
                className={`text-6xl md:text-4xl lg:text-6xl font-serif mb-12 leading-[1.1] story-text text-white`}
              >
                رؤية تُلهم.. <br />
                <div className="mt-[20px]">
                  <span className="text-brand-gold italic">
                    وشغفٌ يصنع الأناقة
                  </span>
                </div>
              </h2>

              <div className="w-40 h-1 bg-gradient-to-l from-brand-gold via-brand-gold/60 to-transparent mb-14 story-line origin-right"></div>

              <div
                className={`space-y-8 leading-[1.9] text-lg md:text-xl lg:text-2xl tracking-wide max-w-3xl story-text text-white/95`}
              >
                <p className="font-light">
                  بدأت الحكاية حين التقى شغف التصميم برؤية ريادة الأعمال.
                  "ستوريا" هي ثمرة تعاون ملهم بين موهبة فنية طموحة وخبرة إدارية
                  عريقة، اجتمعا ليجسدا حلماً مشتركاً في عالم الأزياء والموضة.
                </p>
                <p className="font-light">
                  نحن هنا لنقدم للمرأة العصرية ما تستحقه: تصاميم فريدة بجودة
                  استثنائية، تمزج بين الفخامة والعملية. كل قطعة لدينا تُحاك
                  لتروي قصة، وتعكس هوية بصرية فاخرة تليق بذائقتك الرفيعة.
                </p>
                <div
                  className={`relative mt-16 pt-10 border-t-2 border-brand-gold/40`}
                >
                  <div className="absolute -top-4 right-0 w-14 h-14 bg-brand-gold/15 rounded-full flex items-center justify-center">
                    <span className="text-brand-gold text-3xl font-serif">
                      "
                    </span>
                  </div>
                  <p
                    className={`font-normal text-xl md:text-2xl story-text text-white italic pr-20 leading-[1.6]`}
                  >
                    نطمح لنكون الخيار الأول لكل سيدة تبحث عن التميز، ونشارككِ
                    لحظات التألق في كل مناسبة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
