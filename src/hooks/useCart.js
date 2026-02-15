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
        const result = await sallaService.addToCart(product.id, quantity, {
          variantId: size,
          sallaProductId: product.sallaProductId,
        });

        if (!result.success) {
          console.error("[Storia] Cart sync failed:", result.error);
          alert(
            "فشل إضافة المنتج لسلة سلة. تأكد من أن المنتج موجود في سلة.\n" +
              (result.error || ""),
          );
        }
      } catch (err) {
        console.error("[Storia] Cart sync error:", err);
        alert("حدث خطأ أثناء الاتصال بسلة.");
      }
    }
  };

  return { addToCart };
};
