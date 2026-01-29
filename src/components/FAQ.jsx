import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, Minus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

import { useContent } from "../context/ContentContext";

const FAQ = ({ theme }) => {
  const { faqs } = useContent();
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

  return (
    <section
      ref={sectionRef}
      className={`py-24 px-6 md:px-12 transition-colors duration-500 ${
        theme === "green" ? "bg-brand-offwhite" : "bg-brand-burgundy"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 faq-header">
          <h2
            className={`text-3xl md:text-5xl font-serif mb-6 ${
              theme === "green" ? "text-brand-charcoal" : "text-white"
            }`}
          >
            الأسئلة الشائعة
          </h2>
          <p
            className={`text-lg tracking-wide opacity-80 font-light ${
              theme === "green" ? "text-brand-charcoal" : "text-white"
            }`}
          >
            كل ما تحتاجين معرفته عن عبايتك
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item border rounded-2xl overflow-hidden transition-all duration-500 group ${
                theme === "green"
                  ? "border-brand-charcoal/5 bg-white shadow-sm hover:shadow-md hover:border-brand-charcoal/20"
                  : "border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-8 text-right focus:outline-none"
              >
                <span
                  className={`font-serif text-xl ${
                    theme === "green" ? "text-brand-charcoal" : "text-white"
                  }`}
                >
                  {faq.question}
                </span>
                <span
                  className={`transition-transform duration-500 p-2 rounded-full ${
                    openIndex === index
                      ? "rotate-180 bg-brand-gold text-white"
                      : ""
                  } ${
                    theme === "green" && openIndex !== index
                      ? "text-brand-charcoal bg-gray-100"
                      : ""
                  } ${
                    theme !== "green" && openIndex !== index
                      ? "text-white bg-white/10"
                      : ""
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
                  className={`p-8 pt-0 text-base leading-relaxed pl-12 ${
                    theme === "green"
                      ? "text-brand-charcoal/70"
                      : "text-white/70"
                  }`}
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
