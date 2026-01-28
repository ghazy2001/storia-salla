import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Play, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const ProductDetail = ({ theme }) => {
  const contentRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState("54");
  const [quantity, setQuantity] = useState(1);
  const [alterationChecked, setAlterationChecked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    { src: "/assets/product1.png", alt: "عباءة ستوريا" },
    { src: "/assets/detail.png", alt: "تفاصيل العباءة" },
    { src: "/assets/product1.png", alt: "إطلالة جانبية", mirrored: true },
  ];

  useEffect(() => {
    gsap.fromTo(
      contentRef.current.children,
      { opacity: 0, x: 30 },
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 70%",
        },
      },
    );
  }, []);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="bg-brand-offwhite min-h-screen py-24 px-12 lg:flex gap-16 overflow-hidden text-right transition-colors duration-500">
      <div className="flex-1 h-fit">
        {/* Main Carousel */}
        <div className="relative aspect-[4/5] bg-brand-offwhite border border-brand-charcoal/5 overflow-hidden group mb-4">
          <img
            src={images[currentImageIndex].src}
            alt={images[currentImageIndex].alt}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              images[currentImageIndex].mirrored
                ? "scale-x-[-1] group-hover:scale-x-[-1.05]"
                : ""
            }`}
          />
          {currentImageIndex === 0 && (
            <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group/btn hover:scale-110 hover:bg-white/40 transition-all duration-300 shadow-lg">
              <Play fill="white" className="text-white transform rotate-180" />
            </button>
          )}

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="text-white" size={24} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`aspect-[4/5] bg-brand-offwhite border-2 overflow-hidden transition-all duration-300 ${
                currentImageIndex === index
                  ? "border-brand-gold scale-105 shadow-lg"
                  : "border-brand-charcoal/5 hover:border-brand-gold/50"
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full h-full object-cover ${
                  image.mirrored ? "scale-x-[-1]" : ""
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="flex-1 mt-12 lg:mt-0 flex flex-col">
        <div className="mb-16">
          <span className="uppercase tracking-[0.3em] text-sm text-brand-gold mb-4 block font-medium">
            الأحدث إطلالة
          </span>
          <h2 className="text-5xl font-serif mb-6 italic leading-tight">
            عباءة سوداء بشت بتطريز ملكي
          </h2>
          <p className="text-3xl font-light text-brand-charcoal">480.00 ر.س</p>
        </div>

        <div className="mb-16 border-t border-brand-charcoal/10 pt-10">
          <h3 className="uppercase tracking-widest text-base mb-6 font-semibold">
            تفاصيل التصميم
          </h3>
          <p className="font-serif italic text-xl leading-relaxed text-brand-charcoal/80 mb-8 font-light">
            عباءة بشت فاخرة من ستوريا، صممت خصيصاً للمرأة التي تبحث عن الفخامة
            والراحة معاً. استخدمنا أفضل أنواع الكريب الكوري "صالونا" مع تطريز
            يدوي دقيق على الأكمام يمنحكِ حضوراً ملكياً في جميع مناسباتك. تتميز
            بقصة واسعة ومريحة تضمن لكِ حرية الحركة بأناقة لا تضاهى.
          </p>
          <button
            className={`text-sm uppercase tracking-widest border-b-2 pb-2 font-semibold hover:scale-105 transition-all duration-300 inline-block ${
              theme === "green"
                ? "border-brand-gold text-brand-gold hover:text-brand-charcoal hover:border-brand-charcoal"
                : "border-brand-gold text-brand-gold hover:text-brand-light hover:border-brand-light"
            }`}
          >
            اقرئي المزيد عن جودة الأقمشة
          </button>
        </div>

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h3 className="uppercase tracking-widest text-base font-semibold">
              اختاري المقاس
            </h3>
            <button className="text-xs uppercase tracking-widest underline decoration-brand-gold/50 font-medium hover:decoration-brand-gold transition-colors">
              دليل المقاسات
            </button>
          </div>
          <div className="flex gap-4">
            {["50", "52", "54", "56", "58", "60"].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-14 h-14 border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                  selectedSize === size
                    ? "border-brand-gold bg-brand-gold text-white shadow-lg scale-105"
                    : "border-brand-charcoal/20 hover:border-brand-gold hover:shadow-md"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h3 className="uppercase tracking-widest text-base font-semibold mb-8">
            خدمات التعديل
          </h3>
          <label className="flex items-start gap-4 cursor-pointer group">
            <div
              onClick={() => setAlterationChecked(!alterationChecked)}
              className={`w-6 h-6 border-2 mt-1 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                alterationChecked
                  ? "border-brand-gold bg-brand-gold"
                  : "border-brand-charcoal/30 group-hover:border-brand-gold"
              }`}
            >
              {alterationChecked && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <span className="text-sm font-light leading-snug">
              تقصير الطول (مجاني)
            </span>
          </label>
        </div>

        <div className="mt-auto pt-10 flex gap-6">
          <div
            className={`flex border-2 items-center h-16 shadow-sm transition-colors duration-300 ${
              theme === "green"
                ? "border-brand-charcoal/20 hover:border-brand-gold/50"
                : "border-brand-light/30 hover:border-brand-gold"
            }`}
          >
            <button
              onClick={() => handleQuantityChange(-1)}
              className={`p-5 transition-all duration-300 active:scale-95 ${
                theme === "green"
                  ? "hover:bg-brand-charcoal hover:text-white"
                  : "hover:bg-brand-light hover:text-brand-charcoal"
              }`}
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center text-base font-medium font-sans">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className={`p-5 transition-all duration-300 active:scale-95 ${
                theme === "green"
                  ? "hover:bg-brand-charcoal hover:text-white"
                  : "hover:bg-brand-light hover:text-brand-charcoal"
              }`}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            className={`flex-1 border-2 uppercase tracking-[0.3em] text-sm py-5 hover:scale-[1.02] hover:shadow-xl transition-all duration-500 font-bold active:scale-100 ${
              theme === "green"
                ? "bg-brand-charcoal text-brand-light border-brand-gold/30 hover:bg-brand-gold hover:border-brand-gold hover:text-brand-charcoal"
                : "bg-brand-gold text-brand-charcoal border-brand-gold hover:bg-brand-charcoal hover:border-brand-charcoal hover:text-brand-gold"
            }`}
          >
            أضيفي للحقيبة
          </button>
        </div>

        <div className="mt-20 bg-brand-charcoal/[0.02] backdrop-blur-sm p-10 border border-brand-charcoal/10 hover:border-brand-gold/30 transition-all duration-500">
          <h3 className="uppercase tracking-widest text-[10px] font-semibold mb-8 text-center text-brand-charcoal/60">
            تنسيقات ستوريا
          </h3>
          <div className="flex gap-6 items-center">
            <div className="w-24 aspect-square bg-brand-beige p-2 border border-brand-charcoal/5 overflow-hidden group">
              <img
                src="/assets/detail.png"
                alt="طرحة"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-serif text-base mb-2">
                طرحة ليزر سوداء بتطريز ناعم
              </h4>
              <p className="text-sm font-light text-brand-charcoal/60">
                45.00 ر.س
              </p>
            </div>
            <button className="text-xs uppercase tracking-widest border-b-2 border-brand-gold text-brand-gold pb-1 hover:border-brand-charcoal hover:text-brand-charcoal transition-all duration-300 font-semibold">
              أضف
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
