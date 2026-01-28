import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    id: 1,
    name: "عباية سوداء رسمية - كريب ملكي",
    price: "390 ر.س",
    image: "/assets/product1.png",
  },
  {
    id: 2,
    name: "عباية كلوش - قماش إنترنت ناعم",
    price: "350 ر.س",
    image: "/assets/product2.png",
  },
  {
    id: 3,
    name: "عباية بشت مطرزة - شك يدوي",
    price: "480 ر.س",
    image: "/assets/product3.png",
  },
  {
    id: 4,
    name: "عباية نواعم - تصميم كلاسيكي",
    price: "320 ر.س",
    image: "/assets/product1.png",
  },
  {
    id: 5,
    name: "عباية رسمية بتطريز هادئ",
    price: "420 ر.س",
    image: "/assets/product2.png",
  },
  {
    id: 6,
    name: "عباية عملية يومية بجيوب",
    price: "290 ر.س",
    image: "/assets/product3.png",
  },
];

const ProductListing = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = gridRef.current.children;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      },
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-12 bg-brand-offwhite">
      <div className="flex justify-between items-end mb-16 px-4">
        <div>
          <span className="uppercase tracking-widest text-xs mb-2 block opacity-60">
            الأكثر مبيعاً
          </span>
          <h3 className="text-4xl font-serif">مجموعة ستوريا المختارة</h3>
        </div>
        <button className="uppercase tracking-widest text-[10px] pb-1 border-b border-brand-charcoal hover:text-brand-gold hover:border-brand-gold transition-colors">
          مشاهدة جميع العبايات
        </button>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12"
      >
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer text-right">
            <div className="aspect-[3/4] overflow-hidden bg-brand-beige mb-6 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-charcoal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <button className="absolute bottom-0 left-0 w-full py-4 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                إضافة للحقيبة
              </button>
            </div>
            <div className="px-2">
              <h4 className="text-lg font-serif mb-1 group-hover:text-brand-gold transition-colors">
                {product.name}
              </h4>
              <p className="text-sm font-light text-brand-charcoal/70 uppercase tracking-widest">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductListing;
