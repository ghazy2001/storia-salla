import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsFromSalla,
  fetchCategoriesFromSalla,
} from "../store/slices/productSlice";
import { fetchReviews, fetchFAQs } from "../store/slices/contentSlice";
import { fetchCustomerFromSalla } from "../store/slices/userSlice";
import { fetchCartFromSalla } from "../store/slices/cartSlice";
import { setTheme, selectTheme } from "../store/slices/uiSlice";
import { resolveAsset } from "../utils/assetUtils";

// Helper to preload images
const preloadImages = (srcArray) => {
  return Promise.all(
    srcArray.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Continue even if one image fails
      });
    }),
  );
};

/**
 * Hook to handle application initialization logic
 * - Syncs browser history with Redux state
 * - Syncs theme with DOM
 * - Manages preloader ready state
 */
export const useAppInitialization = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const [isReady, setIsReady] = useState(false);

  // Sync theme with DOM
  useEffect(() => {
    // We use data-theme attribute as defined in index.css
    document.documentElement.setAttribute("data-theme", theme);
    // Also keep the class for any tailwind-specific dark: selectors if needed
    document.documentElement.classList.remove("green", "burgundy");
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Handle initialization
  useEffect(() => {
    const init = async () => {
      // 1. Check for stored theme preference (using consistent key)
      const storedTheme = localStorage.getItem("storia_theme");
      if (storedTheme) {
        dispatch(setTheme(storedTheme));
      } else {
        // Default to green always on first load
        dispatch(setTheme("green"));
      }

      // 3. Wait for everything to be ready
      try {
        await Promise.all([
          // Timeout race: If fetching takes too long (e.g. 5s), give up and show app
          new Promise(
            (resolve) =>
              setTimeout(() => {
                console.warn(
                  "⚠️ Initialization timed out - forcing ready state.",
                );
                resolve();
              }, 5000), // Reduced from 8s to 5s
          ),

          // Critical data fetching
          (async () => {
            try {
              // Start fetching data (Concurrent)
              const productPromise = dispatch(
                fetchProductsFromSalla(),
              ).unwrap();
              const categoryPromise = dispatch(
                fetchCategoriesFromSalla(),
              ).unwrap();
              const customerPromise = dispatch(
                fetchCustomerFromSalla(),
              ).unwrap();
              const faqPromise = dispatch(fetchFAQs()).unwrap();
              const reviewPromise = dispatch(fetchReviews()).unwrap();
              const cartPromise = dispatch(fetchCartFromSalla());

              await Promise.all([
                productPromise,
                categoryPromise,
                customerPromise,
                faqPromise,
                reviewPromise,
                cartPromise,
              ]);

              // MINIMAL image preloading: Just the Logo
              await preloadImages([resolveAsset("assets/logo.png")]);
            } catch (err) {
              console.error("Data fetch failed in init", err);
            }
          })(),

          // Wait for window load
          new Promise((resolve) => {
            if (document.readyState === "complete") {
              resolve();
            } else {
              window.addEventListener("load", resolve, { once: true });
            }
          }),
        ]);
      } catch (error) {
        console.error("[Storia] Initialization error:", error);
      } finally {
        setIsReady(true);
        // SIGNAL READY TO NATIVE LOADER
        document.documentElement.classList.add("storia-ready");
      }
    };

    init();

    // 4. Re-fetch cart on window focus (to sync with Salla tab changes)
    // 4. Re-fetch cart on window focus (to sync with Salla tab changes)
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchCartFromSalla());
      }
    };

    // 5. Safety Polling: Try to fetch cart a few times after load to ensure Salla SDK is caught
    const safetyCheck1 = setTimeout(() => dispatch(fetchCartFromSalla()), 2000);
    const safetyCheck2 = setTimeout(() => dispatch(fetchCartFromSalla()), 5000);
    const safetyCheck3 = setTimeout(
      () => dispatch(fetchCartFromSalla()),
      10000,
    );

    // 6. Listen for Salla Events (if available via global salla object)
    const handleSallaCartUpdate = (e) => {
      console.log("Salla 'cart::updated' event detected!", e);
      dispatch(fetchCartFromSalla());
    };

    if (window.salla && window.salla.event) {
      // Attempt to subscribe to Salla events
      try {
        window.salla.event.on("cart::updated", handleSallaCartUpdate);
        window.salla.event.on("cart::added", handleSallaCartUpdate);
        window.salla.event.on("cart::deleted", handleSallaCartUpdate);
      } catch (e) {
        console.warn("Could not subscribe to Salla events", e);
      }
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);
    document.addEventListener("salla-cart-updated", handleFocus); // Custom event if needed

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
      document.removeEventListener("salla-cart-updated", handleFocus);
      clearTimeout(safetyCheck1);
      clearTimeout(safetyCheck2);
      clearTimeout(safetyCheck3);

      if (window.salla && window.salla.event) {
        try {
          window.salla.event.off("cart::updated", handleSallaCartUpdate);
          window.salla.event.off("cart::added", handleSallaCartUpdate);
          window.salla.event.off("cart::deleted", handleSallaCartUpdate);
        } catch {
          /* ignore */
        }
      }
    };
  }, [dispatch]);

  return { isReady, theme };
};
