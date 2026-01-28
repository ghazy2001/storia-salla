import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Play, Minus, Plus } from "lucide-react";

const ProductDetail = () => {
  const contentRef = useRef(null);

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

  return (
    <section className="bg-brand-beige min-h-screen py-24 px-12 lg:flex gap-16 overflow-hidden text-right">
      <div className="flex-1 grid grid-cols-2 gap-4 h-fit">
        <div className="col-span-2 relative aspect-[4/5] bg-brand-offwhite border border-brand-charcoal/5">
          <img
            src="/assets/product1.png"
            alt="عباءة ستوريا"
            className="w-full h-full object-cover"
          />
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group hover:scale-110 transition-transform duration-300">
            <Play fill="white" className="text-white transform rotate-180" />
          </button>
        </div>
        <div className="aspect-[4/5] bg-brand-offwhite border border-brand-charcoal/5">
          <img
            src="/assets/detail.png"
            alt="تفاصيل العباءة"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="aspect-[4/5] bg-brand-offwhite border border-brand-charcoal/5">
          <img
            src="/assets/product1.png"
            alt="إطلالة جانبية"
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>
      </div>

      <div ref={contentRef} className="flex-1 mt-12 lg:mt-0 flex flex-col">
        <div className="mb-12">
          <span className="uppercase tracking-[0.3em] text-[10px] text-brand-gold mb-3 block">
            الأحدث إطلالة
          </span>
          <h2 className="text-5xl font-serif mb-4 italic leading-tight">
            عباءة سوداء بشت بتطريز ملكي
          </h2>
          <p className="text-2xl font-light">480.00 ر.س</p>
        </div>

        <div className="mb-12 border-t border-brand-charcoal/10 pt-8">
          <h3 className="uppercase tracking-widest text-[10px] mb-4 font-semibold">
            تفاصيل التصميم
          </h3>
          <p className="font-serif italic text-lg leading-relaxed text-brand-charcoal/80 mb-6">
            عباءة بشت فاخرة من ستوريا، صممت خصيصاً للمرأة التي تبحث عن الفخامة
            والراحة معاً. استخدمنا أفضل أنواع الكريب الكوري "صالونا" مع تطريز
            يدوي دقيق على الأكمام يمنحكِ حضوراً ملكياً في جميع مناسباتك. تتميز
            بقصة واسعة ومريحة تضمن لكِ حرية الحركة بأناقة لا تضاهى.
          </p>
          <button className="text-[10px] uppercase tracking-widest border-b border-brand-gold text-brand-gold pb-1">
            اقرئي المزيد عن جودة الأقمشة
          </button>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="uppercase tracking-widest text-[10px] font-semibold">
              اختاري المقاس
            </h3>
            <button className="text-[10px] uppercase tracking-widest underline decoration-brand-charcoal/30">
              دليل المقاسات
            </button>
          </div>
          <div className="flex gap-4">
            {["50", "52", "54", "56", "58", "60"].map((size) => (
              <button
                key={size}
                className="w-12 h-12 border border-brand-charcoal/20 flex items-center justify-center text-xs hover:border-brand-gold hover:text-brand-gold transition-colors font-sans"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h3 className="uppercase tracking-widest text-[10px] font-semibold mb-6">
            خدمات التعديل
          </h3>
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="w-5 h-5 border border-brand-charcoal/30 mt-1 flex-shrink-0 group-hover:border-brand-gold transition-colors"></div>
            <span className="text-sm font-light leading-snug">
              تقصير الطول (مجاني)
            </span>
          </label>
        </div>

        <div className="mt-auto pt-8 flex gap-4">
          <div className="flex border border-brand-charcoal/20 items-center">
            <button className="p-4 hover:bg-brand-charcoal hover:text-white transition-colors">
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-sans">1</span>
            <button className="p-4 hover:bg-brand-charcoal hover:text-white transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <button className="flex-1 bg-brand-charcoal text-white uppercase tracking-[0.3em] text-xs py-4 hover:bg-brand-gold transition-colors duration-500 font-semibold">
            أضيفي للحقيبة
          </button>
        </div>

        <div className="mt-16 bg-white/40 backdrop-blur-sm p-8 border border-white/50">
          <h3 className="uppercase tracking-widest text-[10px] font-semibold mb-6 text-center">
            تنسيقات ستوريا
          </h3>
          <div className="flex gap-6 items-center">
            <div className="w-20 aspect-square bg-white p-2 border border-brand-charcoal/5">
              <img
                src="/assets/detail.png"
                alt="طرحة"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-serif text-sm">
                طرحة ليزر سوداء بتطريز ناعم
              </h4>
              <p className="text-xs font-light text-brand-charcoal/60 mt-1">
                45.00 ر.س
              </p>
            </div>
            <button className="text-[10px] uppercase tracking-widest border-b border-brand-charcoal pb-1">
              أضف
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
