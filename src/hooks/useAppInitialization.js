import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentPage, setCurrentPage } from "../store/slices/cartSlice";
import { selectTheme, setSelectedProductId } from "../store/slices/uiSlice";
import {
  fetchProductsFromSalla,
  fetchCategoriesFromSalla,
} from "../store/slices/productSlice";
import { fetchCustomerFromSalla } from "../store/slices/userSlice";
import { fetchFAQs, fetchReviews } from "../store/slices/contentSlice";

/**
 * Hook to handle application initialization logic
 * - Syncs browser history with Redux state
 * - Syncs theme with DOM
 * - Manages preloader ready state
 */
export const useAppInitialization = () => {
  const [isReady, setIsReady] = useState(false);
  const theme = useSelector(selectTheme);
  const currentPage = useSelector(selectCurrentPage);
  const dispatch = useDispatch();

  // History Management Refs
  const isBackNav = useRef(false);
  const isFirstLoad = useRef(true);

  // Sync with Browser History
  useEffect(() => {
    const onPopState = (event) => {
      if (event.state) {
        isBackNav.current = true;
        if (event.state.page) dispatch(setCurrentPage(event.state.page));
        if (event.state.productId)
          dispatch(setSelectedProductId(event.state.productId));
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [dispatch]);

  // Update History on Page Change
  useEffect(() => {
    if (isBackNav.current) {
      isBackNav.current = false;
      return;
    }

    const state = { page: currentPage };
    const url = currentPage === "home" ? "/" : `/${currentPage}`;
    if (isFirstLoad.current) {
      window.history.replaceState(state, "", url);
      isFirstLoad.current = false;
    } else {
      window.history.pushState(state, "", url);
    }
  }, [currentPage]);

  // Sync Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Handle Window Load / Preloader
  useEffect(() => {
    const init = async () => {
      // 1. Start all data fetching
      const productPromise = dispatch(fetchProductsFromSalla()).unwrap();
      dispatch(fetchCategoriesFromSalla());
      dispatch(fetchCustomerFromSalla());
      dispatch(fetchFAQs());
      dispatch(fetchReviews());

      // 2. Critical Image Preloading (Logo and Hero)
      const preloadImages = (urls) => {
        return Promise.all(
          urls.map((url) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve; // Continue even if image fails
              img.src = url;
            });
          }),
        );
      };

      try {
        // Wait for products because we need the hero image from there
        const products = await productPromise;
        const criticalImages = ["assets/logo.png"];

        // Add first product/hero image if available
        if (products && products.length > 0 && products[0].image) {
          criticalImages.push(products[0].image);
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
