import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, Minus } from "lucide-react";
import { useSelector } from "react-redux";
import { selectFAQs } from "../../store/slices/contentSlice";
import {
  getBackgroundClass,
  getTextClass,
  getThemeValue,
} from "../../utils/themeUtils";

gsap.registerPlugin(ScrollTrigger);

const FAQ = ({ theme }) => {
  const faqs = useSelector(selectFAQs);
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faq-header",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );

      gsap.fromTo(
        ".faq-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const bgClass = getBackgroundClass(theme);
  const textClass = getTextClass(theme);
  const cardBgClass = getThemeValue(
    theme,
    "border-brand-charcoal/5 bg-white shadow-sm hover:shadow-md hover:border-brand-charcoal/20",
    "border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20",
  );

  return (
    <section
      id="faq"
      ref={sectionRef}
      className={`py-24 px-6 md:px-12 transition-colors duration-500 ${bgClass}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 faq-header">
          <h2 className={`text-2xl md:text-5xl font-sans mb-6 ${textClass}`}>
            الأسئلة الشائعة
          </h2>
          <p
            className={`text-base md:text-lg tracking-wide opacity-80 font-light ${textClass}`}
          >
            كل ما تحتاجين معرفته عن عبايتك
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item border rounded-2xl overflow-hidden transition-all duration-500 group ${cardBgClass}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-right focus:outline-none"
              >
                <span className={`font-sans text-lg md:text-xl ${textClass}`}>
                  {faq.question}
                </span>
                <span
                  className={`transition-transform duration-500 p-2 rounded-full ${
                    openIndex === index
                      ? "rotate-180 bg-brand-gold text-white"
                      : getThemeValue(
                          theme,
                          "text-brand-charcoal bg-gray-100",
                          "text-white bg-white/10",
                        )
                  }`}
                >
                  {openIndex === index ? (
                    <Minus size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </span>
              </button>

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  openIndex === index
                    ? "max-h-48 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div
                  className={`p-8 pt-0 text-base leading-relaxed pl-12 ${getThemeValue(theme, "text-brand-charcoal/70", "text-white/70")}`}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
