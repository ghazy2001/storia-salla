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

    // If on Salla platform, sync with Salla backend
    if (config.useSallaBackend && sallaService.isAvailable()) {
      try {
        const result = await sallaService.addToCart(
          product.id,
          quantity,
          { variantId: size }, // Map size to variant if needed
        );

        if (!result.success) {
          console.warn(
            "[Storia] Failed to sync with Salla cart:",
            result.error,
          );
          // TODO: Handle failure (show error toast, rollback Redux state, etc.)
        }
      } catch (error) {
        console.error("[Storia] Error syncing with Salla cart:", error);
      }
    }
  };

  return { addToCart };
};
