import { resolveAsset } from "../utils/assetUtils";

// ... existing imports

/**
 * Hook to handle application initialization logic
 * - Syncs browser history with Redux state
 * - Syncs theme with DOM
 * - Manages preloader ready state
 */
export const useAppInitialization = () => {
  // ... existing code ...

      try {
        // Wait for products because we need the hero image from there
        const products = await productPromise;
        
        // Fix: Use resolveAsset to get absolute URLs for Salla
        const criticalImages = [resolveAsset("assets/logo.png")];

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
