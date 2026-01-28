import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductListing from "./components/ProductListing";
import ProductDetail from "./components/ProductDetail";
import Preloader from "./components/Preloader";

const Footer = ({ theme }) => (
  <footer className="bg-brand-footer text-brand-light py-20 px-12 text-right transition-colors duration-500">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-20">
      <div className="col-span-1 md:col-span-1">
        <img
          src={theme === "green" ? "/assets/logo2.png" : "/assets/logo.png"}
          alt="STORIA DESIGN"
          className={`h-16 mb-6 ml-auto ${theme === "green" ? "brightness-0 invert" : ""}`}
        />
        <p className="text-sm font-light text-brand-light/50 leading-relaxed uppercase tracking-widest">
          STORIA علامة تجارية فاخرة للعبايات، تستمد إلهامها من الأناقة والذوق
          السعودي الأصيل. يجسد اللون البترولى الفخامة والهوية العميقة، بينما
          يعكس الشعار الأنوثة الراقية وقيم الموضة السعودية الحديثة. يوازن
          تصميمها بين التراث الكلاسيكي والجماليات البسيطة المعاصرة، لتمثل الثقة
          والتميز في كل تفصيل. هوية بصرية فاخرة صممت خصيصاً للمرأة التي تقدر
          التفرد.
        </p>
      </div>
      <div>
        <h4 className="uppercase tracking-[0.3em] text-[10px] mb-8 font-semibold">
          تصنيفات المتجر
        </h4>
        <ul className="flex flex-col gap-4 text-sm font-light tracking-widest text-brand-light/70">
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            عبايات سوداء
          </li>
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            عبايات رسمية
          </li>
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            عبايات كلوش
          </li>
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            عبايات بشت
          </li>
        </ul>
      </div>
      <div>
        <h4 className="uppercase tracking-[0.3em] text-[10px] mb-8 font-semibold">
          روابط مہمة
        </h4>
        <ul className="flex flex-col gap-4 text-sm font-light tracking-widest text-brand-light/70">
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            سياسة الاستبدال والاسترجاع
          </li>
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            دليل المقاسات
          </li>
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            تتبع الطلب
          </li>
          <li className="hover:text-brand-gold transition-colors cursor-pointer">
            تواصلي معنا
          </li>
        </ul>
      </div>
      <div>
        <h4 className="uppercase tracking-[0.3em] text-[10px] mb-8 font-semibold">
          اشتراك النشرة البريدية
        </h4>
        <div className="flex border-b border-white/30 pb-2">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="bg-transparent text-xs tracking-widest focus:outline-none w-full placeholder:text-white/20"
          />
          <button className="uppercase tracking-widest text-[10px] text-brand-gold">
            اشتراك
          </button>
        </div>
      </div>
    </div>
    <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-light tracking-widest text-brand-light/30 uppercase gap-4">
      <span>&copy; 2026 STORIA DESIGN. All Rights Reserved.</span>
      <div className="flex gap-8">
        <span>منصة سلة</span>
        <span>الرقم الضريبي</span>
      </div>
    </div>
  </footer>
);

function App() {
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState("green");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "green" ? "burgundy" : "green"));
  };

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setIsReady(true), 100);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return (
    <div className="bg-brand-offwhite text-brand-charcoal min-h-screen font-sans selection:bg-brand-gold selection:text-brand-charcoal">
      <Preloader isReady={isReady} />

      <div
        className={`transition-opacity duration-1000 ease-in-out ${isReady ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!isReady}
      >
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <main>
          <Hero />
          <ProductListing theme={theme} />
          <ProductDetail theme={theme} />
        </main>
        <Footer theme={theme} />
      </div>
    </div>
  );
}

export default App;
