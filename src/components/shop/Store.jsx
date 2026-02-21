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
  const [toastConfig, setToastConfig] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const { addToCart: addToCartWithSync } = useAddToCart();

  // --- TURBO WATCHER V24 (STORE SYNC + ERROR TRAPS) ---
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.count);
  const prevCountRef = useRef(cartCount);
  const lastClickTimeRef = useRef(0);
  const pollingIntervalRef = useRef(null);

  // 1. WATCHER: Count monitoring for confirmed success
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      const timeSinceClick = Date.now() - lastClickTimeRef.current;
      if (timeSinceClick < 15000) {
        setToastConfig({
          isVisible: true,
          message: "تمت إضافة المنتج إلى السلة بنجاح",
          type: "success",
        });
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  // 2. EVENT TRAPS: Catch Salla events (Success & Failure)
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    let isSallaEventAttached = false;

    const handleCartSync = (event) => {
      console.log("[Store] Salla Cart Sync Trap!", event?.detail);
      if (isMounted) {
        dispatch(fetchCartFromSalla());
        // Toast is handled by the cartCount watcher for true success validation
      }
    };

    const handleCartError = (event) => {
      console.error("[Store] Salla Cart Error Trap!", event?.detail);
      if (isMounted) {
        const errorMsg =
          event?.detail?.message || "عذراً، تعذر إضافة المنتج (قد يكون نفد)";
        setToastConfig({
          isVisible: true,
          message: errorMsg,
          type: "error",
        });
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    const attachListeners = () => {
      if (!isMounted) return false;

      // SUCCESS TRAPS (Sync only)
      document.addEventListener("salla-cart-updated", handleCartSync);
      document.addEventListener("cart::add-item", handleCartSync);
      document.addEventListener("cart::added", handleCartSync);

      // FAILURE TRAPS
      document.addEventListener("cart::add-item-failed", handleCartError);
      document.addEventListener("cart::not-available", handleCartError);

      if (window.salla && window.salla.event) {
        window.salla.event.on("cart::add-item", handleCartSync);
        window.salla.event.on("cart::added", handleCartSync);
        window.salla.event.on("cart::add-item-failed", handleCartError);
        window.salla.event.on("cart::not-available", handleCartError);
        isSallaEventAttached = true;
        return true;
      }
      return false;
    };

    const cleanup = () => {
      document.removeEventListener("salla-cart-updated", handleCartSync);
      document.removeEventListener("cart::add-item", handleCartSync);
      document.removeEventListener("cart::added", handleCartSync);
      document.removeEventListener("cart::add-item-failed", handleCartError);
      document.removeEventListener("cart::not-available", handleCartError);

      if (isSallaEventAttached && window.salla && window.salla.event) {
        try {
          window.salla.event.off("cart::add-item", handleCartSync);
          window.salla.event.off("cart::added", handleCartSync);
          window.salla.event.off("cart::add-item-failed", handleCartError);
          window.salla.event.off("cart::not-available", handleCartError);
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
      // Poll every 250ms for 2s (total 8 attempts) for near-instant feedback
      if (pollCount >= 8) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;

        // TIMEOUT FALLBACK
        setToastConfig({
          isVisible: true,
          message: "عذراً، هذا المنتج غير متوفر حالياً",
          type: "error",
        });
      }
    }, 250);

    // Only proceed to manual add if NOT just a click proxy
    if (!isClickOnly) {
      // Pre-emptive Out-of-Stock Check
      const isOut =
        product.isOutOfStock ||
        (product.quantity !== undefined && product.quantity === 0);
      if (isOut) {
        setToastConfig({
          isVisible: true,
          message: "عذراً، هذا المنتج غير متوفر حالياً",
          type: "error",
        });
        clearInterval(pollingIntervalRef.current);
        return;
      }

      await addToCartWithSync(product, quantity, size);
      // Waiter will handle toast
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

      <div ref={containerRef} className="flex flex-col gap-12">
        <Toast
          message={toastConfig.message}
          isVisible={toastConfig.isVisible}
          type={toastConfig.type}
          onClose={() =>
            setToastConfig((prev) => ({ ...prev, isVisible: false }))
          }
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
