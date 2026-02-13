import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsFromSalla,
  fetchCategoriesFromSalla,
} from "../store/slices/productSlice";
import { fetchReviews, fetchFAQs } from "../store/slices/contentSlice";
import { fetchCustomer } from "../store/slices/customerSlice";
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
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Handle initialization
  useEffect(() => {
    const init = async () => {
      // 1. Check for stored theme preference or system preference
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        dispatch(setTheme(storedTheme));
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        dispatch(setTheme("dark"));
      }

      // 3. Wait for everything to be ready
      try {
        await Promise.all([
          // Wait for critical data and images
          (async () => {
            // Start fetching data
            const productPromise = dispatch(fetchProductsFromSalla()).unwrap();
            const categoryPromise = dispatch(
              fetchCategoriesFromSalla(),
            ).unwrap();
            const customerPromise = dispatch(fetchCustomer()).unwrap();
            const faqPromise = dispatch(fetchFAQs()).unwrap();
            const reviewPromise = dispatch(fetchReviews()).unwrap();

            const [products] = await Promise.all([
              productPromise,
              categoryPromise,
              customerPromise,
              faqPromise,
              reviewPromise,
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
          })(),
          // Wait for minimum time
          new Promise((resolve) => setTimeout(resolve, 2500)),
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
  }, [dispatch]);

  return { isReady, theme };
};
