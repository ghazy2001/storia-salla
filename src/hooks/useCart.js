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

        const result = await sallaService.addToCart(
          product.sallaProductId || product.id,
          quantity,
          {
            variantId,
            options: cartOptions,
            sallaProductId: product.sallaProductId || product.id,
          },
        );

        if (!result.success) {
          const errorMsg = result.error || "عذراً، تعذر إضافة المنتج للسلة";
          console.warn(`[Storia] Add to Cart Failed: ${errorMsg}`, {
            debug: result.debugPayload,
            diagnosis: result.diagnosis,
          });
          return { success: false, error: errorMsg };
        } else {
          dispatch(fetchCartFromSalla());
          return { success: true, data: result.data };
        }
      } catch (e) {
        console.error("[Storia] Cart Connection Error:", e);
        return { success: false, error: "حدث خطأ أثناء الاتصال بسلة" };
      }
    }
    return { success: false, error: "Salla not available" };
  };

  return { addToCart };
};
