/**
 * Custom hook for adding items to cart with Salla backend sync
 */

import { useDispatch } from "react-redux";
import { addToCart as addToCartAction } from "../store/slices/cartSlice";
import sallaService from "../services/sallaService";
import { config } from "../config/config";

export const useAddToCart = () => {
  const dispatch = useDispatch();

  const addToCart = async (product, quantity = 1, size = null) => {
    // Update local Redux state first (optimistic update)
    dispatch(addToCartAction({ product, quantity, size }));

    // If on Salla platform, try to sync with Salla backend
    // Note: This will fail silently if product IDs don't match Salla's products
    if (config.useSallaBackend && sallaService.isAvailable()) {
      try {
        const result = await sallaService.addToCart(
          product.id,
          quantity,
          {
            variantId: size,
            sallaProductId: product.sallaProductId,
          }, // Pass Salla Product ID for real cart sync
        );

        // Silently handle errors - local cart still works
        if (!result.success && import.meta.env.DEV) {
          console.warn(
            "[Storia] Cart sync unavailable (expected with mock products):",
            result.error,
          );
        }
      } catch {
        // Silently fail - don't spam console in production
        if (import.meta.env.DEV) {
          console.warn(
            "[Storia] Cart sync failed (expected with mock products)",
          );
        }
      }
    }
  };

  return { addToCart };
};
