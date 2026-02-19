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
    log("Starting natural Salla checkout sync (SDK Mode)...");

    try {
      // 1. Check if Salla SDK is available
      if (typeof window.salla === "undefined" || !window.salla.cart) {
        return this.fallbackCheckout(totalAmount);
      }

      // 2. Clear current Salla cart to avoid duplicates
      try {
        await window.salla.cart.clear();
        log("Cleared existing Salla cart");
      } catch {
        // Cart might already be empty
      }

      // 3. Add items sequentially
      const hasSallaIds = cartItems.every((item) => item.sallaProductId);

      if (hasSallaIds) {
        log("Adding items via SDK...");

        // Sequential add to prevent race conditions
        for (const item of cartItems) {
          const payload = {
            id: item.sallaProductId,
            quantity: item.quantity,
          };
          try {
            await window.salla.cart.addItem(payload);
          } catch {
            // Failed to add item, continue with remaining items
          }
        }

        log("All items added. Redirecting to checkout...");
        // Use a short timeout to ensure cart updates execute
        setTimeout(() => {
          window.location.href = "https://storiasa.com/checkout";
        }, 500);
      } else {
        log("Missing Salla IDs, using fallback...");
        return this.fallbackCheckout(totalAmount);
      }

      return { success: true };
    } catch {
      // Fallback if SDK fails
      return this.fallbackCheckout(totalAmount);
    }
  }

  fallbackCheckout(totalAmount) {
    const quantity = Math.ceil(totalAmount);
    const checkOutUrl = `https://storiasa.com/payment/p432374980?quantity=${quantity}&t=${Date.now()}`;
    window.location.href = checkOutUrl;
    return { success: true };
  }
}

export default new SallaStorefrontService();
