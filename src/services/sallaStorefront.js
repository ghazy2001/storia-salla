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
  /**
   * Syncs the React cart with Salla via 'Payment Product' method
   * @param {Array} cartItems - Items from Redux cart
   * @param {Number} totalAmount - Total amount of the cart
   */
  async syncAndCheckout(cartItems, totalAmount) {
    log("Starting checkout via Payment Product...");

    try {
      // Calculate integer quantity (Ceiling to ensure full coverage)
      let finalAmount = totalAmount;
      if (!finalAmount) {
        finalAmount = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      }

      const quantity = Math.ceil(finalAmount);
      log(`Redirecting to Salla with ${quantity} units of Payment Product`);

      // Using direct cart add link with cache busting
      // This ensures Salla creates a fresh session for each unique request
      const checkOutUrl = `https://storiasa.com/payment/p432374980?quantity=${quantity}&t=${Date.now()}`;
      window.location.href = checkOutUrl;

      return { success: true };
    } catch (error) {
      console.error("[Storia] Checkout redirect failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new SallaStorefrontService();
