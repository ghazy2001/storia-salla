import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../store/slices/uiSlice";
import { fetchCartFromSalla } from "../store/slices/cartSlice";

/**
 * useCartSync Hook - Universal Cart Watcher & Notifier
 * Detects Salla cart additions via events, state monitoring, and active polling.
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.count);
  const prevCountRef = useRef(cartCount);
  const lastClickTimeRef = useRef(0);
  const pollingIntervalRef = useRef(null);

  // Monitor cart count increases globally
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      const timeSinceClick = Date.now() - lastClickTimeRef.current;
      // If count increased shortly after a manual click or event
      if (timeSinceClick < 15000) {
        console.log("[Storia Universal] Cart count increased, showing toast.");
        dispatch(showToast("تم إضافة المنتج للسلة بنجاح"));

        // Stop polling once we find success
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
    prevCountRef.current = cartCount;
  }, [cartCount, dispatch]);

  const handleCartEvent = useCallback(
    (event) => {
      console.log(
        "[Storia Universal] Cart Event Detect:",
        event?.type || event,
      );
      dispatch(showToast("تم إضافة المنتج للسلة بنجاح"));
      dispatch(fetchCartFromSalla());
    },
    [dispatch],
  );

  // Setup Global Listeners
  useEffect(() => {
    const attach = () => {
      // 1. Document Traps
      document.addEventListener("salla-cart-updated", handleCartEvent);
      document.addEventListener("cart::add-item", handleCartEvent);
      document.addEventListener("cart::added", handleCartEvent);

      // 2. SDK Listeners
      if (window.salla && window.salla.event) {
        window.salla.event.on("cart::add-item", handleCartEvent);
        window.salla.event.on("cart::added", handleCartEvent);
        window.salla.event.on("cart::updated", handleCartEvent);
        return true;
      }
      return false;
    };

    const cleanup = () => {
      document.removeEventListener("salla-cart-updated", handleCartEvent);
      document.removeEventListener("cart::add-item", handleCartEvent);
      document.removeEventListener("cart::added", handleCartEvent);

      if (window.salla && window.salla.event) {
        try {
          window.salla.event.off("cart::add-item", handleCartEvent);
          window.salla.event.off("cart::added", handleCartEvent);
          window.salla.event.off("cart::updated", handleCartEvent);
        } catch {
          /* ignore */
        }
      }
    };

    if (!attach()) {
      const interval = setInterval(() => {
        if (attach()) clearInterval(interval);
      }, 1000);
      return () => {
        clearInterval(interval);
        cleanup();
      };
    }

    return cleanup;
  }, [handleCartEvent]);

  /**
   * triggerPoll: Called by buttons to start aggressive polling
   */
  const triggerPoll = useCallback(() => {
    lastClickTimeRef.current = Date.now();

    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    // Immediate sync
    dispatch(fetchCartFromSalla());

    let pollCount = 0;
    pollingIntervalRef.current = setInterval(() => {
      pollCount++;
      console.log("[Storia Universal] Active Polling...", pollCount);
      dispatch(fetchCartFromSalla());
      if (pollCount >= 20) {
        // Every 500ms for 10s
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 500);
  }, [dispatch]);

  return { triggerPoll };
};
