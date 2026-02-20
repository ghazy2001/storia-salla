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
import { fetchCartFromSalla } from "../../store/slices/cartSlice";
import sallaService from "../../services/sallaService";
import { useCartSync } from "../../hooks/useCartSync";
import Toast from "../common/Toast";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);

  // 1. Find the base product from Redux
  const baseProduct = useMemo(() => {
    return products.find(
      (p) =>
        String(p.id) === String(productId) ||
        String(p.sallaProductId) === String(productId),
    );
  }, [products, productId]);

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

  // 1.5 Cart Count Watcher (Triple Redundancy) - Hardened V4
  const cartCount = useSelector((state) => state.cart.count);
  const prevCountRef = useRef(cartCount);
  const lastClickTimeRef = useRef(0);
  const pollingIntervalRef = useRef(null);

  // Watch for count increases as the PRIMARY reliable trigger
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      const timeSinceClick = Date.now() - lastClickTimeRef.current;
      // If count increased shortly after a click, show toast
      if (timeSinceClick < 15000) {
        console.log("[Storia] Cart count increased, showing toast.");
        // Stop polling once we find success
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  // 4. Cart Logic - THE PURE NATIVE PROXY (Hardening V4)
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    let isSallaEventAttached = false;

    const handleCartSuccess = (event) => {
      if (!isMounted) return;
      console.log("[Storia] Cart Event Triggered:", event?.type || event);
      // Trigger refresh directly from event
      dispatch(fetchCartFromSalla());
    };

    const attachListeners = () => {
      if (!isMounted) return false;

      // A. Document Level (Catch-all)
      document.addEventListener("salla-cart-updated", handleCartSuccess);
      document.addEventListener("cart::add-item", handleCartSuccess);
      document.addEventListener("cart::added", handleCartSuccess);

      // B. Salla SDK Level
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

    // Try immediately
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

  // 1.5 Global Cart Notifier integration
  const { triggerPoll } = useCartSync();

  const handleAddToCart = useCallback(() => {
    if (!displayProduct) return;
    const sallaId = displayProduct.sallaProductId || displayProduct.id;

    // Trigger the global polling engine
    triggerPoll();

    console.log(
      "[Storia] V22: Triggering Native Button & Universal Sync for ID:",
      sallaId,
    );

    // Trigger the hidden native Salla button
    const nativeBtn = document.querySelector(
      `salla-add-product-button[product-id="${sallaId}"]`,
    );
    if (nativeBtn) {
      const btn = nativeBtn.querySelector("button") || nativeBtn;
      btn.click();
    } else {
      console.error("[Storia] Native Salla button not found!");
      alert("عذراً، نظام السلة غير متوفر حالياً.");
    }
  }, [displayProduct, triggerPoll]);

  if (!baseProduct && products.length > 0) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-sans text-brand-charcoal mb-4">
            المنتج غير موجود
          </h2>
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-3 bg-brand-gold text-white rounded-full"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  if (!baseProduct) return null;

  return (
    <div className="bg-brand-offwhite min-h-screen pt-24 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <ProductGallery
            images={displayProduct.images || [displayProduct.image]}
          />
          <ProductInfo
            product={displayProduct}
            handleAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
