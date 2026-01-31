import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductListing from "./components/ProductListing";
import ProductDetails from "./components/ProductDetails";
import Preloader from "./components/Preloader";
import CustomCursor from "./components/CustomCursor";
import Store from "./components/Store";
import ShoppingCart from "./components/ShoppingCart";
import Checkout from "./components/Checkout";
import { CartProvider } from "./context/CartContext";
import { useCart } from "./context/useCart";
import WhatsAppButton from "./components/WhatsAppButton";
import OurStory from "./components/OurStory";
import BestSellers from "./components/BestSellers";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import { AdminProvider } from "./context/AdminContext";
import { ProductProvider } from "./context/ProductContext";
import { ContentProvider } from "./context/ContentContext";
import LoginModal from "./components/admin/LoginModal";
import AdminDashboard from "./components/admin/AdminDashboard";

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
        <h4 className="uppercase tracking-[0.3em] text-xs mb-8 font-semibold">
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
        <h4 className="uppercase tracking-[0.3em] text-xs mb-8 font-semibold">
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
        <h4 className="uppercase tracking-[0.3em] text-xs mb-8 font-semibold">
          اشتراك النشرة البريدية
        </h4>
        <div className="flex border-b border-white/30 pb-2">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="bg-transparent text-xs tracking-widest focus:outline-none w-full placeholder:text-white/20"
          />
          <button className="uppercase tracking-widest text-xs text-brand-gold">
            اشتراك
          </button>
        </div>
      </div>
    </div>
    <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-xs font-light tracking-widest text-brand-light/30 uppercase gap-4">
      <span>&copy; 2026 STORIA DESIGN. All Rights Reserved.</span>
      <div className="flex gap-8">
        <span>الرقم الضريبي</span>
      </div>
    </div>
  </footer>
);

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState("green");
  const { currentPage, setCurrentPage } = useCart();
  const [selectedProductId, setSelectedProductId] = useState(null);

  // History Management Refs
  const isBackNav = useRef(false);
  const isFirstLoad = useRef(true);

  // Sync with Browser History
  useEffect(() => {
    const onPopState = (event) => {
      if (event.state) {
        isBackNav.current = true;
        if (event.state.page) setCurrentPage(event.state.page);
        if (event.state.productId) setSelectedProductId(event.state.productId);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setCurrentPage]);

  useEffect(() => {
    if (isBackNav.current) {
      isBackNav.current = false;
      return;
    }

    const state = { page: currentPage, productId: selectedProductId };
    if (isFirstLoad.current) {
      window.history.replaceState(state, "");
      isFirstLoad.current = false;
    } else {
      window.history.pushState(state, "");
    }
  }, [currentPage, selectedProductId]);

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

  const [selectedCategory, setSelectedCategory] = useState("all");

  const renderPage = () => {
    switch (currentPage) {
      case "store":
        return (
          <Store
            theme={theme}
            initialFilter={selectedCategory}
            onProductSelect={(id) => {
              setSelectedProductId(id);
              setCurrentPage("product-details");
            }}
          />
        );
      case "admin-dashboard":
        return <AdminDashboard theme={theme} />;
      case "cart":
        return (
          <ShoppingCart
            theme={theme}
            onContinueShopping={() => setCurrentPage("store")}
          />
        );
      case "checkout":
        return <Checkout theme={theme} />;
      case "product-details":
        return (
          <ProductDetails
            key={selectedProductId}
            theme={theme}
            productId={selectedProductId}
          />
        );
      default:
        return (
          <>
            <Hero
              goToStore={() => {
                setSelectedCategory("all");
                setCurrentPage("store");
              }}
            />
            <ProductListing
              theme={theme}
              goToStore={() => {
                setSelectedCategory("all");
                setCurrentPage("store");
              }}
              onProductSelect={(id) => {
                setSelectedProductId(id);
                setCurrentPage("product-details");
              }}
            />
            <OurStory theme={theme} />
            <BestSellers
              theme={theme}
              onProductSelect={(id) => {
                setSelectedProductId(id);
                setCurrentPage("product-details");
              }}
            />
            <Reviews theme={theme} />
            <FAQ theme={theme} />
          </>
        );
    }
  };

  return (
    <div className="bg-brand-offwhite text-brand-charcoal min-h-screen font-sans selection:bg-brand-gold selection:text-brand-charcoal">
      <CustomCursor />
      <Preloader isReady={isReady} />
      <WhatsAppButton />
      <LoginModal theme={theme} />

      <div
        className={`transition-opacity duration-1000 ease-in-out ${isReady ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!isReady}
      >
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          onNavigate={(category) => {
            setSelectedCategory(category);
            setCurrentPage("store");
          }}
          currentPage={currentPage}
          onBack={() => {
            if (currentPage === "product-details") {
              setCurrentPage("store");
            } else if (currentPage === "store") {
              setCurrentPage("home");
            } else {
              setCurrentPage("home");
            }
          }}
        />
        <main>{renderPage()}</main>
        <Footer theme={theme} />
      </div>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AdminProvider>
        <ProductProvider>
          <ContentProvider>
            <AppContent />
          </ContentProvider>
        </ProductProvider>
      </AdminProvider>
    </CartProvider>
  );
}

export default App;
