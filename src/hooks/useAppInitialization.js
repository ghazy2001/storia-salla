import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentPage, setCurrentPage } from "../store/slices/cartSlice";
import { selectTheme, setSelectedProductId } from "../store/slices/uiSlice";
import {
  fetchProductsFromSalla,
  fetchCategoriesFromSalla,
} from "../store/slices/productSlice";
import { fetchCustomerFromSalla } from "../store/slices/userSlice";

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
    // Fetch real products and categories from Salla on app mount
    dispatch(fetchProductsFromSalla());
    dispatch(fetchCategoriesFromSalla());
    dispatch(fetchCustomerFromSalla());

    const handleLoad = () => {
      setTimeout(() => setIsReady(true), 100);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, [dispatch]);

  return { isReady, theme };
};
