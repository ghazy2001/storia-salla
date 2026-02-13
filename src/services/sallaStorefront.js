import { config, log } from "../config/config";

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
  async syncAndCheckout(cartItems) {
    log("Starting cart sync with Salla...");

    try {
      // 1. If SDK is available, it's easier to use
      if (this.salla && this.salla.cart) {
        log("Using Salla SDK for cart sync");

        try {
          // Clear Salla cart first to avoid duplicates if possible
          // The SDK doesn't always have a clearCart, so we might need to loop or just add

          for (const item of cartItems) {
            await this.salla.cart.addItem({
              id: item.sallaProductId || item.id,
              quantity: item.quantity,
              // Add variant if available
              variant_id: item.variantId || null,
            });
          }

          log("Redirecting to Salla checkout via SDK");
          if (typeof this.salla.cart.submit === "function") {
            await this.salla.cart.submit();
            return { success: true };
          } else {
            // If submit is missing, we might still want to try the fallback below
            log("SDK submit missing, falling back to manual redirect");
          }
        } catch (sdkError) {
          log(
            `Salla SDK error (likely 410): ${sdkError.message}. Falling back to backend checkout.`,
          );
          // If SDK fails, we continue to the headless fallback instead of failing
        }
      }

      // 2. Headless Fallback: Use Salla API directly (needs CORS or Proxy)
      // Note: This part usually requires a Storefront token or being on the same apex domain.
      // If we are on storied-salla.vercel.app and store is storiasa.com, we need a redirect approach.

      log("Salla SDK not found, attempting direct checkout redirect");

      // If no SDK, the best way for "Checkout only" is actually to use a special Salla URL format if available
      // Or to use a backend proxy that holds the Salla Merchant Token.

      // Since we have a backend (storia-backend), we can use it to create a Salla cart and get a link.
      const response = await fetch(`${config.apiUrl}/api/salla/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return { success: true };
      }

      throw new Error(data.message || "Failed to get checkout URL");
    } catch (error) {
      console.error("[Storia] Sync and Checkout failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new SallaStorefrontService();
