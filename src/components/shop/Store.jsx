import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSelector, useDispatch } from "react-redux";
import {
  selectProducts,
  selectCategories,
} from "../../store/slices/productSlice";
import { fetchCartFromSalla } from "../../store/slices/cartSlice";
import ProductCarousel from "./ProductCarousel";
import { useAddToCart } from "../../hooks/useCart";
import Toast from "../common/Toast";

gsap.registerPlugin(ScrollTrigger);

const Store = ({ initialFilter = "all", onProductSelect }) => {
  const containerRef = useRef(null);
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const [filter, setFilter] = useState(initialFilter);
  const [visibleProducts, setVisibleProducts] = useState([]); // Initialize with empty array
  const [showToast, setShowToast] = useState(false);
  const { addToCart: addToCartWithSync } = useAddToCart();

  // --- TURBO WATCHER V23 (STORE SYNC) ---
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.count);
  const prevCountRef = useRef(cartCount);
  const lastClickTimeRef = useRef(0);
  const pollingIntervalRef = useRef(null);

  // 1. WATCHER: Count monitoring as baseline
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      const timeSinceClick = Date.now() - lastClickTimeRef.current;
      if (timeSinceClick < 15000) {
        console.log("[Store] Cart count increased, showing toast.");
        setShowToast(true);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  // 2. EVENT TRAPS: Catch Salla events
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    let isSallaEventAttached = false;

    const handleCartSuccess = (event) => {
      console.log("[Store] Salla Cart Success Trap!", event?.detail);
      if (isMounted) {
        setShowToast(true);
        dispatch(fetchCartFromSalla());
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    const attachListeners = () => {
      if (!isMounted) return false;
      document.addEventListener("salla-cart-updated", handleCartSuccess);
      document.addEventListener("cart::add-item", handleCartSuccess);
      document.addEventListener("cart::added", handleCartSuccess);
      document.addEventListener("cart::updated", handleCartSuccess);

      if (window.salla && window.salla.event) {
        window.salla.event.on("cart::add-item", handleCartSuccess);
        window.salla.event.on("cart::added", handleCartSuccess);
        window.salla.event.on("cart::updated", handleCartSuccess);
        isSallaEventAttached = true;
        return true;
      }
      return false;
    };

    const cleanup = () => {
      document.removeEventListener("salla-cart-updated", handleCartSuccess);
      document.removeEventListener("cart::add-item", handleCartSuccess);
      document.removeEventListener("cart::added", handleCartSuccess);
      document.removeEventListener("cart::updated", handleCartSuccess);

      if (isSallaEventAttached && window.salla && window.salla.event) {
        try {
          window.salla.event.off("cart::add-item", handleCartSuccess);
          window.salla.event.off("cart::added", handleCartSuccess);
          window.salla.event.off("cart::updated", handleCartSuccess);
        } catch {
          /* ignore */
        }
      }
    };

    if (!attachListeners()) {
      const interval = setInterval(() => {
        retryCount++;
        if (attachListeners() || retryCount > 20) clearInterval(interval);
      }, 500);
      return () => {
        clearInterval(interval);
        isMounted = false;
        cleanup();
      };
    }

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [dispatch]);

  // Sync internal filter state when initialFilter prop changes (e.g. from Navbar)
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const handleAddToCart = async (payload) => {
    const { product, quantity, size, isClickOnly } = payload;

    // Record click for fallbacks
    lastClickTimeRef.current = Date.now();

    // Start Turbo Polling
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    dispatch(fetchCartFromSalla());
    let pollCount = 0;
    pollingIntervalRef.current = setInterval(() => {
      pollCount++;
      dispatch(fetchCartFromSalla());
      if (pollCount >= 20) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 250);

    // Only proceed to manual add if NOT just a click proxy
    if (!isClickOnly) {
      await addToCartWithSync(product, quantity, size);
      setShowToast(true);
    }
  };
  // --- END TURBO WATCHER ---

  useEffect(() => {
    // Filter products with animation
    const filtered =
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter);

    // Animate out
    if (containerRef.current) {
      gsap.to(containerRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        stagger: 0.05,
        onComplete: () => {
          setVisibleProducts(filtered);
          // Animate in
          gsap.fromTo(
            containerRef.current.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1,
              delay: 0.1,
              clearProps: "all",
            },
          );
        },
      });
    } else {
      // Initial load or quick switch if ref is not ready
      setVisibleProducts(filtered);
    }
  }, [filter, products]);

  return (
    <section className="bg-brand-offwhite min-h-screen pt-32 pb-20 px-6 md:px-12 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col items-start mb-16 text-right">
        <h1 className="text-5xl md:text-7xl font-sans text-brand-charcoal mb-4">
          مجموعة ستوريا
        </h1>
        <p className="text-brand-charcoal/70 font-light text-lg md:text-xl max-w-2xl leading-relaxed">
          اختاري من مجموعتنا الفاخرة من العبايات المصممة بعناية لتناسب أناقتك في
          كل المناسبات
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-16 justify-start">
        {[{ id: "all", label: "جميع العبايات" }, ...categories].map((cat) => (
          <button
            key={cat.id || cat._id}
            onClick={() => setFilter(cat.id || cat.slug)}
            className={`px-6 py-2 border transition-all duration-300 text-sm md:text-base font-medium ${
              filter === (cat.id || cat.slug)
                ? "bg-brand-gold text-white border-brand-gold shadow-md"
                : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-gold hover:text-brand-gold"
            }`}
          >
            {typeof cat.name === "object" ? cat.name.ar : cat.label || cat.name}
          </button>
        ))}
      </div>

      {/* Product Carousels List */}
      <div ref={containerRef} className="flex flex-col gap-12">
        <Toast
          message="تمت إضافة المنتج إلى السلة بنجاح"
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          action={{
            label: "عرض السلة >>",
            onClick: () => (window.location.href = "/cart"),
          }}
        />
        {visibleProducts.map((product) => (
          <ProductCarousel
            key={product.id}
            product={product}
            onSelect={onProductSelect}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default Store;
