import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectProducts } from "../../store/slices/productSlice";
import { selectTheme } from "../../store/slices/uiSlice";
import { fetchCartFromSalla } from "../../store/slices/cartSlice";
import { useAddToCart } from "../../hooks/useCart";
import sallaService from "../../services/sallaService";
import Toast from "../common/Toast";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const theme = useSelector(selectTheme);

  // 1. Find the base product from Redux
  const baseProduct = useMemo(() => {
    return products.find((p) => String(p._id || p.id) === String(productId));
  }, [products, productId]);

  const [activeMedia, setActiveMedia] = useState(0);
  const [enrichedData, setEnrichedData] = useState(null);

  // 2. Final Product Data (Base + Enriched)
  const displayProduct = useMemo(() => {
    if (!baseProduct) return null;
    if (!enrichedData) return baseProduct;
    return { ...baseProduct, ...enrichedData };
  }, [baseProduct, enrichedData]);

  // 3. V19 Proxy Discovery (Focused on Prices only)
  useEffect(() => {
    const sallaId = baseProduct?.sallaProductId || baseProduct?.id;
    if (!sallaId || sallaId < 100) return;

    let isMounted = true;

    const discover = async () => {
      try {
        const details = await sallaService
          .getProductDetails(sallaId)
          .catch(() => null);
        if (!isMounted) return;

        if (details) {
          setEnrichedData({
            regularPrice: details.regularPrice || details.rawRegularPrice,
            salePrice: details.salePrice || details.rawSalePrice,
            isOnSale: details.isOnSale,
          });
        }
      } catch (err) {
        console.warn("[Storia] Discovery Error:", err);
      } finally {
        if (isMounted) {
          /* done */
        }
      }
    };

    discover();
    return () => {
      isMounted = false;
    };
  }, [baseProduct?.id, baseProduct?.sallaProductId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);
  const [toastConfig, setToastConfig] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // 1.5 Cart Count Watcher (Triple Redundancy) - Hardened V5
  const cartCount = useSelector((state) => state.cart.count);
  const prevCountRef = useRef(cartCount);
  const lastClickTimeRef = useRef(0);
  const pollingIntervalRef = useRef(null);

  // Watch for count increases as THE primary reliable success trigger
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

  // 4. Cart Logic - THE PURE NATIVE PROXY (Hardening V5)
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    let isSallaEventAttached = false;

    const handleCartSync = (event) => {
      if (!isMounted) return;
      console.log("[Storia] Cart Event Success Sync:", event?.type || event);
      dispatch(fetchCartFromSalla());
      // SUCCESS Toast is handled by the count watcher above
    };

    const handleCartError = (event) => {
      console.error("[Storia] Cart Error Trap!", event);
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

      // SUCCESS listeners (Sync only)
      document.addEventListener("salla-cart-updated", handleCartSync);
      document.addEventListener("cart::add-item", handleCartSync);
      document.addEventListener("cart::added", handleCartSync);

      // FAILURE listeners - THE "ULTIMATE" NET 🕸️
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
          } catch {
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
            } catch {
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
  const { addToCart } = useAddToCart();

  const handleAddToCart = useCallback(async () => {
    if (!displayProduct) return;
    const sallaId = displayProduct.sallaProductId || displayProduct.id;

    // 1. Initial Polling & UI Setup
    lastClickTimeRef.current = Date.now();
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    // Initial sync jumpstart
    dispatch(fetchCartFromSalla());

    // Turbo Polling (Sync only)
    let pollCount = 0;
    pollingIntervalRef.current = setInterval(() => {
      pollCount++;
      dispatch(fetchCartFromSalla());
      if (pollCount >= 30) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 250);

    // 2. Trigger the native Salla button.
    // This handles size selection popups natively.
    const nativeBtn =
      document.querySelector(`[product-id="${sallaId}"] button`) ||
      document.querySelector(
        `salla-add-product-button[product-id="${sallaId}"]`,
      );

    if (nativeBtn) {
      // Check if native button is disabled (Out of stock)
      const isBtnDisabled =
        nativeBtn.hasAttribute("disabled") ||
        nativeBtn.querySelector("button")?.disabled;

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
        return;
      }

      nativeBtn.click();
      // Success/Failure is handled by the event listeners in useEffect
    } else {
      console.warn(
        "[Storia] Native Salla button not found, trying manual add...",
      );
      const result = await addToCart(displayProduct, 1);
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
    }
  }, [displayProduct, dispatch, addToCart]);

  if (!baseProduct && products.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <button
            onClick={() => navigate("/store")}
            className="px-8 py-3 bg-brand-gold text-white rounded-full"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  if (!displayProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 animate-pulse">
        <p className="text-lg opacity-60">جارٍ تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-charcoal pt-24 pb-12">
      <Toast
        message={toastConfig.message}
        isVisible={toastConfig.isVisible}
        type={toastConfig.type}
        onClose={() =>
          setToastConfig((prev) => ({ ...prev, isVisible: false }))
        }
        theme={theme}
        action={{
          label: "عرض السلة >>",
          onClick: () => (window.location.href = "/cart"),
        }}
      />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <ProductGallery
          product={displayProduct}
          activeMedia={activeMedia}
          setActiveMedia={setActiveMedia}
        />

        <ProductInfo
          product={displayProduct}
          handleAddToCart={handleAddToCart}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
