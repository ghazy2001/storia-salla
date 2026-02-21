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
      console.error("[Store] Salla Cart Error Trap!", event);
      if (isMounted) {
        // Aggressive extraction from various Salla JS SDK formats
        const errorMsg =
          event?.detail?.message ||
          event?.detail?.error ||
          event?.message ||
          (event?.detail && typeof event.detail === "string"
            ? event.detail
            : null) ||
          (typeof event === "string" ? event : null) ||
          "عذراً، تعذر إضافة المنتج للسلة (قد يكون نفد)";

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

      // FAILURE TRAPS - THE "ULTIMATE" NET 🕸️
      const failureEvents = [
        "cart::add-item-failed",
        "cart::addItem-failed",
        "cart::add-item-error",
        "cart::addItem-error",
        "cart::not-available",
        "cart::error",
        "salla-cart-add-item-failed",
        "salla-cart-error",
        "addItem-failed",
        "addItem-error",
      ];

      failureEvents.forEach((evt) =>
        document.addEventListener(evt, handleCartError),
      );

      if (window.salla && window.salla.event) {
        window.salla.event.on("cart::add-item", handleCartSync);
        window.salla.event.on("cart::added", handleCartSync);

        // Match SDK specific listeners
        failureEvents.forEach((evt) => {
          try {
            window.salla.event.on(evt, handleCartError);
          } catch (e) {
            /* skip */
          }
        });

        isSallaEventAttached = true;
        return true;
      }
      return false;
    };

    const cleanup = () => {
      const allEvents = [
        "salla-cart-updated",
        "cart::add-item",
        "cart::added",
        "cart::add-item-failed",
        "cart::addItem-failed",
        "cart::add-item-error",
        "cart::addItem-error",
        "cart::not-available",
        "cart::error",
        "salla-cart-add-item-failed",
        "salla-cart-error",
        "addItem-failed",
        "addItem-error",
      ];

      allEvents.forEach((evt) =>
        document.removeEventListener(evt, handleCartError),
      );

      if (isSallaEventAttached && window.salla && window.salla.event) {
        try {
          allEvents.forEach((evt) => {
            try {
              window.salla.event.off(evt, handleCartError);
            } catch (e) {
              /* skip */
            }
          });
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

    // 0. Proactive Stock Check
    if (
      product.is_available === false ||
      (product.quantity !== undefined && product.quantity <= 0)
    ) {
      setToastConfig({
        isVisible: true,
        message: "عذراً، هذا المنتج غير متوفر حالياً (نفدت الكمية)",
        type: "error",
      });
      return;
    }

    // Record click for fallbacks
    lastClickTimeRef.current = Date.now();

    // Start Turbo Polling
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    dispatch(fetchCartFromSalla());
    let pollCount = 0;
    pollingIntervalRef.current = setInterval(() => {
      pollCount++;
      dispatch(fetchCartFromSalla());
      // Increase limit to 30 attempts (7.5s) to allow for Salla popups/delays
      if (pollCount >= 30) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 250);

    // Only proceed to manual add if NOT just a click proxy
    if (!isClickOnly) {
      const result = await addToCartWithSync(product, quantity, size);
      if (!result.success && result.error) {
        setToastConfig({
          isVisible: true,
          message: result.error,
          type: "error",
        });
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } else {
      // For click proxy, we should also check if the native button is disabled after a small delay
      // because CarouselMedia might have a disabled button
      setTimeout(() => {
        const sallaId = product.sallaProductId || product.id;
        const nativeBtn = document.querySelector(
          `salla-add-product-button[product-id="${sallaId}"]`,
        );
        const isBtnDisabled =
          nativeBtn?.hasAttribute("disabled") ||
          nativeBtn?.querySelector("button")?.disabled;

        if (isBtnDisabled) {
          setToastConfig({
            isVisible: true,
            message: "عذراً، هذا المنتج غير متوفر حالياً",
            type: "error",
          });
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }, 100);
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
