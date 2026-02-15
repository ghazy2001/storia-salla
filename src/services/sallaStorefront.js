import { log } from "../config/config";

/**
 * Salla Storefront Service
 * Handles public-facing Salla API operations for Headless Checkout
 */
class SallaStorefrontService {
  constructor() {
    this.baseUrl = "https://api.salla.dev/store/v1";
    // We don't need a merchant token for public storefront API if we use CORS/Proxy or if user is on Salla domain.
    // However, if we are headless, we might need a Storefront Token.
    // For now, we will attempt to use the Salla SDK if available, or direct API calls.
    this.salla =
      typeof window !== "undefined" && window.salla ? window.salla : null;
  }

  /**
   * Syncs the React cart with Salla and redirects to checkout
   * @param {Array} cartItems - Items from Redux cart
   */
  async syncAndCheckout(cartItems, totalAmount) {
    log("Starting natural Salla checkout sync...");

    try {
      // 1. Check if we have Salla Product IDs for all items
      const hasSallaIds = cartItems.every(
        (item) =>
          item.sallaProductId ||
          (typeof item.id === "number" && item.id > 1000),
      );

      if (hasSallaIds) {
        log("Using Natural Sync: Building deep link for all items");
        const params = new URLSearchParams();
        cartItems.forEach((item) => {
          const id = item.sallaProductId || item.id;
          params.append("id[]", id);
          params.append("quantity[]", item.quantity);
        });

        // Redirect to Salla Cart with all items
        const checkOutUrl = `https://storiasa.com/cart/add?${params.toString()}&checkout=1&t=${Date.now()}`;
        window.location.href = checkOutUrl;
      } else {
        log(
          "Fallback Mode: Using Payment Product (Some items missing Salla IDs)",
        );
        const quantity = Math.ceil(totalAmount);
        const checkOutUrl = `https://storiasa.com/payment/p432374980?quantity=${quantity}&t=${Date.now()}`;
        window.location.href = checkOutUrl;
      }

      return { success: true };
    } catch (error) {
      console.error("[Storia] Checkout redirect failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new SallaStorefrontService();
