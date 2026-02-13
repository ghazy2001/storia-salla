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
      return new Promise((resolve, reject) => {
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

      // 2. Start all data fetching
      const productPromise = dispatch(fetchProductsFromSalla()).unwrap();
      const categoryPromise = dispatch(fetchCategoriesFromSalla()).unwrap();
      const customerPromise = dispatch(fetchCustomer()).unwrap();
      const faqPromise = dispatch(fetchFAQs()).unwrap();
      const reviewPromise = dispatch(fetchReviews()).unwrap(); // Add reviews fetch

      try {
        // Wait for products because we need the hero image from there
        const products = await productPromise;

        // Fix: Use resolveAsset to get absolute URLs for Salla
        const criticalImages = [resolveAsset("assets/logo.png")];

        // Add top 4 product images for Hero section (if available)
        if (products && products.length > 0) {
          const heroImages = products
            .slice(0, 4)
            .map((p) => p.image)
            .filter(Boolean);
          criticalImages.push(...heroImages);
        }

        await preloadImages(criticalImages);
      } catch (error) {
        console.error("[Storia] Initialization error:", error);
      }

      // 3. Minimum loading time for smooth transition
      const minLoadingTime = 1200;
      const startTime = Date.now();

      const finishLoading = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        setTimeout(() => setIsReady(true), remainingTime);
      };

      if (document.readyState === "complete") {
        finishLoading();
      } else {
        window.addEventListener("load", finishLoading, { once: true });
      }
    };

    init();
  }, [dispatch]);

  return { isReady, theme };
};
