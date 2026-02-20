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
          const debugInfo = result.debugPayload
            ? `\nPayload: ${JSON.stringify(result.debugPayload)}`
            : "";
          const diagnosisInfo = result.diagnosis
            ? `\nDiagnosis: ${result.diagnosis}`
            : "";
          alert(
            `فشل إضافة المنتج (${product.name}) لسلة سلة.\n\n` +
              `السبب: ${result.error || "عطأ غير معروف"}${debugInfo}${diagnosisInfo}`,
          );
          return { success: false };
        } else {
          // Success! Refresh cart from Salla to get accurate count/total
          dispatch(fetchCartFromSalla());
          return { success: true, data: result.data };
        }
      } catch (e) {
        alert("حدث خطأ أثناء الاتصال بسلة.");
        return { success: false, error: e.message };
      }
    }
    return { success: false, error: "Salla not available" };
  };

  return { addToCart };
};
