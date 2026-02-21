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

  // 3. V19 Proxy Discovery (Prices + Sizes from Salla API)
  useEffect(() => {
    const sallaId = baseProduct?.sallaProductId || baseProduct?.id;
    if (!sallaId || sallaId < 100) return;

    let isMounted = true;
    let retryTimer = null;

    // Direct REST fetch for product options/sizes
    const fetchSizesDirectly = async (id) => {
      try {
        const headers = { Accept: "application/json" };
        const sm = window.salla;
        if (sm?.config?.store_id)
          headers["Store-Identifier"] = sm.config.store_id;

        const res = await fetch(`/api/v1/products/${id}`, { headers });
        if (!res.ok) return null;
        const json = await res.json();
        const raw = json.data || json.product || (json.id ? json : null);
        if (!raw) return null;

        // Extract options (sizes)
        const options = raw.options || raw.details?.options || [];
        const variants =
          raw.variants || raw.skus || raw.details?.variants || [];

        // Find size option
        const sizeOption =
          options.find((opt) => {
            const name = (opt.name || opt.label || "").toLowerCase();
            return (
              name.includes("مقاس") ||
              name.includes("قياس") ||
              name.includes("size")
            );
          }) || (options.length > 0 ? options[0] : null);

        let sizes = [];
        if (sizeOption) {
          const vals = sizeOption.values || sizeOption.data || [];
          sizes = vals
            .map((v) => String(v.name || v.label || v.value || "").trim())
            .filter(Boolean);
        } else if (variants.length > 0) {
          sizes = variants
            .map((v) => String(v.name || v.label || v.sku || "").trim())
            .filter(Boolean);
        }

        return sizes.length > 0 ? sizes : null;
      } catch {
        return null;
      }
    };

    const discover = async (attempt = 0) => {
      try {
        // Wait for Salla SDK to be ready before fetching
        await sallaService.waitForSalla(3000);
        if (!isMounted) return;

        const details = await sallaService
          .getProductDetails(sallaId)
          .catch(() => null);
        if (!isMounted) return;

        if (details) {
          // If service returned sizes, use them; otherwise try direct fetch
          let sizes =
            details.sizes && details.sizes.length > 0 ? details.sizes : null;
          if (!sizes) {
            sizes = await fetchSizesDirectly(sallaId);
          }

          setEnrichedData({
            regularPrice: details.regularPrice || details.rawRegularPrice,
            salePrice: details.salePrice || details.rawSalePrice,
            isOnSale: details.isOnSale,
            sizes: sizes || undefined,
            sizeVariants:
              details.sizeVariants && details.sizeVariants.length > 0
                ? details.sizeVariants
                : undefined,
          });
        } else {
          // Service returned null — try direct REST fetch for sizes
          const sizes = await fetchSizesDirectly(sallaId);
          if (isMounted && sizes) {
            setEnrichedData((prev) => ({ ...(prev || {}), sizes }));
          } else if (attempt < 3 && isMounted) {
            retryTimer = setTimeout(
              () => discover(attempt + 1),
              1500 * (attempt + 1),
            );
          }
        }
      } catch (err) {
        console.warn("[Storia] Discovery Error:", err);
        if (attempt < 3 && isMounted) {
          retryTimer = setTimeout(
            () => discover(attempt + 1),
            1500 * (attempt + 1),
          );
        }
      }
    };

    discover();
    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
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
      console.error("[Storia] Cart Error Trap!", event?.detail);
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

      // SUCCESS listeners (Sync only)
      document.addEventListener("salla-cart-updated", handleCartSync);
      document.addEventListener("cart::add-item", handleCartSync);
      document.addEventListener("cart::added", handleCartSync);

      // FAILURE listeners
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

  const handleAddToCart = useCallback(() => {
    if (!displayProduct) return;
    const sallaId = displayProduct.sallaProductId || displayProduct.id;

    // 1. Record click for fallbacks
    lastClickTimeRef.current = Date.now();

    // 2. ACTIVE SYNC: Start polling to force Redux update even if events fail
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    // Immediate first poll
    dispatch(fetchCartFromSalla());

    let pollCount = 0;
    pollingIntervalRef.current = setInterval(() => {
      pollCount++;
      console.log("[Storia] Active Sync Polling (Turbo Mode)...", pollCount);
      dispatch(fetchCartFromSalla());
      // Poll every 250ms for 5s (total 20 attempts)
      if (pollCount >= 20) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 250);

    console.log("[Storia] V23: Turbo Polling & Event Trap for ID:", sallaId);

    // Trigger the native Salla button.
    // This will open Salla's selection popup if sizes are needed,
    // or add directly if not. This is 100% reliable.
    const nativeBtn =
      document.querySelector(`[product-id="${sallaId}"] button`) ||
      document.querySelector(
        `salla-add-product-button[product-id="${sallaId}"]`,
      );

    if (nativeBtn) {
      nativeBtn.click();
      // Toast and refresh are now handled by the event listener above
      // to ensure they only happen on SUCCESSFUL addition.
    } else {
      console.error("[Storia] Native Salla button not found!");
      alert("عذراً، نظام السلة غير متوفر حالياً.");
    }
  }, [displayProduct, dispatch]);

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
