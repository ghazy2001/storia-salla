/**
 * Custom hook for adding items to cart with Salla backend sync
 */

import { useDispatch } from "react-redux";
import { fetchCartFromSalla } from "../store/slices/cartSlice";
import sallaService from "../services/sallaService";
import { config } from "../config/config";

export const useAddToCart = () => {
  const dispatch = useDispatch();

  const addToCart = async (product, quantity = 1, size = null) => {
    // If on Salla platform, try to sync with Salla backend
    if (config.useSallaBackend && sallaService.isAvailable()) {
      try {
        const variantId =
          size && typeof size === "object"
            ? size.variantId
            : typeof size === "string" || typeof size === "number"
              ? size
              : null;
        const cartOptions =
          size && typeof size === "object" ? size.options : null;

        console.log(`[Storia] Adding to Salla: ${product.name}`, {
          productId: product.id,
          variantId,
          options: cartOptions,
        });

        const result = await sallaService.addToCart(product.id, quantity, {
          variantId,
          options: cartOptions,
          sallaProductId: product.sallaProductId,
        });

        if (!result.success) {
          console.error("[Storia] Cart sync failed:", result.error);
          alert(
            `فشل إضافة المنتج (${product.name}) لسلة سلة.\n` +
              (result.error || ""),
          );
        } else {
          console.log("[Storia] Successfully added to Salla cart");
          // Success! Refresh cart from Salla to get accurate count/total
          dispatch(fetchCartFromSalla());
        }
      } catch (err) {
        console.error("[Storia] Cart sync error:", err);
        alert("حدث خطأ أثناء الاتصال بسلة.");
      }
    } else {
      console.warn("Salla Backend not enabled or SDK not ready.");
    }
  };

  return { addToCart };
};
