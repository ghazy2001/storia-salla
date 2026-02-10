import React, { useEffect, useRef, useState } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  Sun,
  Moon,
  User,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartCount,
  setCurrentPage,
  selectCurrentPage,
} from "../../store/slices/cartSlice";
import { selectIsAdmin, toggleLoginModal } from "../../store/slices/adminSlice";
import { selectCustomer } from "../../store/slices/userSlice";
import {
  setSelectedCategory,
  setContactFormOpen,
} from "../../store/slices/uiSlice";
import { selectCategories } from "../../store/slices/productSlice";
import { getButtonTheme, getThemeValue } from "../../utils/themeUtils";
import { resolveAsset } from "../../utils/assetUtils";

const Navbar = ({ theme, toggleTheme }) => {
  const navRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useSelector(selectCartCount);
  const currentPage = useSelector(selectCurrentPage);
  const navLinks = useSelector(selectCategories);
  const customer = useSelector(selectCustomer);
  const dispatch = useDispatch();
  const isAdmin = useSelector(selectIsAdmin);
  const isHomePage = currentPage === "home";
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleNavigate = (category) => {
    dispatch(setSelectedCategory(category));
    dispatch(setCurrentPage("store"));
  };

  const handleBack = () => {
    if (currentPage === "product-details") {
      dispatch(setCurrentPage("store"));
    } else if (currentPage === "store") {
      dispatch(setCurrentPage("home"));
    } else {
      dispatch(setCurrentPage("home"));
    }
  };

  const handleContactClick = () => {
    dispatch(setContactFormOpen(true));
  };

  const handleFAQClick = () => {
    dispatch(setCurrentPage("home"));
    setTimeout(() => {
      const faqSection = document.getElementById("faq");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // ... (keep useEffects and constants same, I will use replace_file_content for specific blocks if possible, but the prompt implies complete file replacement or specific chunks. I'll target the PROPS line first, then the MENU items.)

  useEffect(() => {
    // Initial entry animation - more graceful
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "expo.out", delay: 0.2 },
    );

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Mobile visibility logic
      if (window.innerWidth < 1024) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsVisible(false); // Scrolling down
        } else if (currentScrollY < lastScrollY.current) {
          setIsVisible(true); // Scrolling up
        }
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic appearance logic
  const isTransparent = isHomePage && !isScrolled;

  const effectiveTextColor = isTransparent
    ? "text-white"
    : getThemeValue(theme, "text-brand-charcoal", "text-brand-light");

  const logoFilter = isTransparent
    ? "brightness-0 invert"
    : getThemeValue(theme, "", "brightness-0 invert");

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center transition-all duration-500 ease-in-out px-6 md:px-12 ${
          !isVisible
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        } ${
          !isTransparent
            ? "py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-brand-charcoal/5"
            : "py-4 md:py-8 bg-transparent"
        } ${effectiveTextColor}`}
        style={{
          backgroundColor: !isTransparent ? "var(--nav-bg)" : "transparent",
        }}
      >
        <div className="flex items-center gap-4 md:gap-10">
          {!isHomePage && (
            <button
              onClick={handleBack}
              className={`p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors ${effectiveTextColor}`}
              title="العودة"
            >
              <ArrowRight size={24} className="rotate-180" />
            </button>
          )}
          <Menu
            size={24}
            className={`cursor-pointer hover:text-brand-gold transition-colors duration-300 lg:hidden ${effectiveTextColor}`}
            onClick={() => setIsMobileMenuOpen(true)}
          />
          <User
            size={20}
            className={`cursor-pointer hover:text-brand-gold transition-colors duration-300 lg:hidden ${effectiveTextColor}`}
            onClick={toggleLoginModal}
          />
          <div className="hidden lg:flex items-center gap-10 overflow-hidden">
            {navLinks.map((cat) => (
              <span
                key={cat.id}
                onClick={() => handleNavigate(cat.id)}
                className={`uppercase tracking-[0.1em] text-xs font-bold cursor-pointer hover:text-brand-gold transition-all duration-300 relative group ${effectiveTextColor}`}
              >
                {cat.label}
                <span className="absolute bottom-[-4px] right-0 w-0 h-[1.5px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
              </span>
            ))}
            <button
              onClick={() => handleNavigate("all")}
              className={`uppercase tracking-[0.1em] text-xs font-bold hover:text-brand-gold transition-all duration-300 relative group ${effectiveTextColor}`}
            >
              المتجر
              <span className="absolute bottom-[-4px] right-0 w-0 h-[1.5px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out cursor-pointer hover:opacity-80"
          onClick={() => {
            if (isHomePage) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              dispatch(setCurrentPage("home"));
            }
          }}
        >
          <img
            src={resolveAsset(
              getThemeValue(theme, "assets/logo2.png", "assets/logo.png"),
            )}
            alt="Storia Logo"
            className={`transition-all duration-700 ease-in-out object-contain w-auto ${!isTransparent ? "h-7 md:h-14" : "h-12 md:h-24"} ${logoFilter}`}
          />
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${getButtonTheme(theme)}`}
            title={getThemeValue(
              theme,
              "Switch to Dark Mode",
              "Switch to Light Mode",
            )}
          >
            {getThemeValue(theme, <Moon size={20} />, <Sun size={20} />)}
          </button>
          <button
            className="relative group cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-black/5 transition-all duration-300"
            onClick={() => dispatch(setCurrentPage("cart"))}
            aria-label="عرض حقيبة التسوق"
          >
            <ShoppingBag
              size={22}
              className={`group-hover:text-brand-gold transition-colors duration-300 ${effectiveTextColor}`}
            />
            <span
              className={`absolute top-0 right-0 bg-brand-gold text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold ring-2 ring-transparent transition-all duration-500 ${!isTransparent ? "scale-90" : "scale-100"}`}
            >
              {cartCount}
            </span>
          </button>

          <button
            onClick={() => {
              if (isAdmin) {
                dispatch(setCurrentPage("admin-dashboard"));
              } else if (customer) {
                // If Salla SDK provides a profile page, we could redirect there
                // For now, toggle login modal as a profile view or stay as is
                dispatch(toggleLoginModal());
              } else {
                dispatch(toggleLoginModal());
              }
            }}
            className={`hidden lg:flex px-4 h-10 rounded-full items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 gap-2 ${getButtonTheme(theme)}`}
            title={
              isAdmin ? "لوحة التحكم" : customer ? customer.name : "تسجيل دخول"
            }
          >
            {isAdmin ? (
              <User
                size={20}
                className={getThemeValue(
                  theme,
                  "text-brand-burgundy",
                  "text-brand-gold",
                )}
                fill="currentColor"
              />
            ) : customer ? (
              <span className="text-xs font-bold whitespace-nowrap">
                {customer.first_name || customer.name.split(" ")[0]}
              </span>
            ) : (
              <User size={20} />
            )}

            {isAdmin && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </button>
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
              src={resolveAsset("assets/logo.png")}
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
            {navLinks.map((cat) => (
              <span
                key={cat.id}
                className="text-3xl font-sans hover:text-brand-gold transition-all duration-300 cursor-pointer"
                onClick={() => {
                  handleNavigate(cat.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                {cat.label}
              </span>
            ))}
            <span
              className="text-3xl font-sans hover:text-brand-gold transition-all duration-300 cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              قصتنا
            </span>

            <button
              onClick={() => {
                handleNavigate("all");
                setIsMobileMenuOpen(false);
              }}
              className="text-3xl font-sans hover:text-brand-gold transition-all duration-300 cursor-pointer text-right"
            >
              المتجر
            </button>
          </div>
          <div className="mt-auto flex flex-col gap-4 text-sm font-light tracking-widest opacity-60">
            <span
              onClick={() => {
                handleContactClick();
                setIsMobileMenuOpen(false);
              }}
              className="cursor-pointer hover:text-brand-gold transition-colors"
            >
              اتصل بنا
            </span>
            <span
              onClick={() => {
                handleFAQClick();
                setIsMobileMenuOpen(false);
              }}
              className="cursor-pointer hover:text-brand-gold transition-colors"
            >
              الأسئلة الشائعة
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
