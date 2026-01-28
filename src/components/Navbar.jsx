import React, { useEffect, useRef, useState } from "react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import gsap from "gsap";

const Navbar = () => {
  const navRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initial entry animation - more graceful
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "expo.out", delay: 0.2 },
    );

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = ["عبايات سوداء", "رسمية", "عملية", "كلوش", "بشت"];

  // Dynamic class for text and icons based on scroll state
  const colorClass = isScrolled ? "text-brand-charcoal" : "text-white";
  const logoFilter = isScrolled ? "brightness-0" : "brightness-0 invert";

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center transition-all duration-700 ease-in-out px-12 ${
          isScrolled
            ? "py-3 bg-white/80 backdrop-blur-md shadow-sm border-b border-brand-charcoal/5"
            : "py-8 bg-transparent"
        } ${colorClass}`}
      >
        <div className="flex items-center gap-10">
          <Menu
            size={24}
            className={`cursor-pointer hover:text-brand-gold transition-colors duration-300 lg:hidden ${colorClass}`}
            onClick={() => setIsMobileMenuOpen(true)}
          />
          <div className="hidden lg:flex items-center gap-10 overflow-hidden">
            {navLinks.map((cat) => (
              <span
                key={cat}
                className={`uppercase tracking-[0.1em] text-[13px] font-bold cursor-pointer hover:text-brand-gold transition-all duration-300 relative group ${colorClass}`}
              >
                {cat}
                <span className="absolute bottom-[-4px] right-0 w-0 h-[1.5px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
              </span>
            ))}
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out">
          <img
            src="/assets/logo.png"
            alt="Storia Logo"
            className={`transition-all duration-700 ease-in-out object-contain w-auto ${isScrolled ? "h-10" : "h-20"} ${logoFilter}`}
          />
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <span
              className={`uppercase tracking-[0.1em] text-[13px] font-bold cursor-pointer hover:text-brand-gold transition-colors duration-300 ${colorClass}`}
            >
              قصتنا
            </span>
            <Search
              size={22}
              className={`cursor-pointer hover:text-brand-gold transition-colors duration-300 ${colorClass}`}
            />
          </div>
          <div className="relative group cursor-pointer flex items-center justify-center">
            <ShoppingBag
              size={22}
              className={`group-hover:text-brand-gold transition-colors duration-300 ${colorClass}`}
            />
            <span
              className={`absolute -top-1 -right-1 bg-brand-gold text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold ring-2 ring-transparent transition-all duration-500 ${isScrolled ? "scale-90" : "scale-100"}`}
            >
              0
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-brand-charcoal transition-all duration-500 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="flex flex-col h-full text-brand-offwhite p-12">
          <div className="flex justify-between items-center mb-20">
            <img
              src="/assets/logo.png"
              alt="Storia Logo"
              className="h-10 brightness-0 invert"
            />
            <X
              size={32}
              className="cursor-pointer hover:text-brand-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
          <div className="flex flex-col gap-8">
            {navLinks.concat(["قصتنا"]).map((cat) => (
              <span
                key={cat}
                className="text-3xl font-serif hover:text-brand-gold transition-all duration-300 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-4 text-sm font-light tracking-widest opacity-60">
            <span>اتصل بنا</span>
            <span>الأسئلة الشائعة</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
