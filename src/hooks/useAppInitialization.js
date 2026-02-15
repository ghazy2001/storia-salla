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
          // Timeout race: If fetching takes too long (e.g. 8s), give up and show app
          new Promise((resolve) =>
            setTimeout(() => {
              console.warn(
                "⚠️ Initialization timed out - forcing ready state.",
              );
              resolve();
            }, 8000),
          ),

          // Critical data fetching
          (async () => {
            try {
              // Start fetching data
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
              // Fetch Cart Source of Truth
              const cartPromise = dispatch(fetchCartFromSalla());

              const [products] = await Promise.all([
                productPromise,
                categoryPromise,
                customerPromise,
                faqPromise,
                reviewPromise,
                cartPromise,
              ]);

              const criticalImages = [resolveAsset("assets/logo.png")];
              if (products && products.length > 0) {
                const heroImages = products
                  .slice(0, 4)
                  .map((p) => p.image)
                  .filter(Boolean);
                criticalImages.push(...heroImages);
              }

              await preloadImages(criticalImages);
            } catch (err) {
              console.error("Data fetch failed in init", err);
            }
          })(),

          // Wait for minimum time
          new Promise((resolve) => setTimeout(resolve, 1000)),

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
      }
    };

    init();

    // 4. Re-fetch cart on window focus (to sync with Salla tab changes)
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchCartFromSalla());
      }
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [dispatch]);

  return { isReady, theme };
};
