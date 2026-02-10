/**
 * Salla Service - Interface to Salla Platform APIs
 *
 * This service provides methods to interact with Salla's backend
 * using the Salla Twilight SDK available on the Salla platform.
 */

import { config, log } from "../config/config.js";

class SallaService {
  constructor() {
    this.salla = typeof window !== "undefined" ? window.salla : null;

    if (config.isSallaEnv && this.salla) {
      log("Salla SDK initialized successfully");
    } else if (config.useSallaBackend) {
      console.warn("[Storia] Salla backend requested but SDK not available");
    }
  }

  /**
   * Check if Salla SDK is available
   */
  isAvailable() {
    return this.salla !== null;
  }

  /**
   * Fetch products from Salla store
   *
   * Note: Salla doesn't provide a direct "get all products" API in Twilight SDK.
   * Products are typically rendered server-side in Twig templates.
   * For now, we'll return null and fallback to mock data.
   *
   * Alternative: Use Salla REST API with merchant token (backend integration)
   */
  /**
   * Fetch products from Salla store
   */
  async fetchProducts() {
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot fetch products");
      return null;
    }

    try {
      // In Salla themes, salla.api.product.fetch is often available
      // or we can use the search API with empty query to get products
      log("Attempting to fetch products from Salla API...");

      const response = await this.salla.api.product.fetch();

      if (response && response.data) {
        log("Fetched products successfully:", response.data);

        // Map Salla product format to app format
        return response.data.map((p) => ({
          id: p.id,
          name: p.name,
          price: `${p.price.amount} ${p.price.currency}`,
          category: p.category ? p.category.name : "general",
          sizes: p.options
            ? p.options
                .filter((opt) => opt.name.toLowerCase().includes("size"))
                .flatMap((opt) => opt.values.map((v) => v.name))
            : ["S", "M", "L", "XL"],
          description: p.description || "",
          image: p.main_image || "/assets/logo.png",
          media: p.images ? p.images.map((img) => img.url) : [p.main_image],
          isNew: false,
          rating: 5.0,
          reviews: 0,
        }));
      }

      log("Product fetch returned no data, falling back to mock");
      return null;
    } catch (error) {
      console.error("[Storia] Error fetching products from Salla:", error);
      return null;
    }
  }

  /**
   * Add item to Salla cart
   *
   * @param {number} productId - Salla product ID
   * @param {number} quantity - Quantity to add
   * @param {object} options - Additional options (size, variant, etc.)
   */
  async addToCart(productId, quantity = 1, options = {}) {
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot add to cart");
      return { success: false, error: "Salla SDK not available" };
    }

    try {
      const payload = {
        id: productId,
        quantity: quantity,
      };

      // Add options if provided
      if (options.variantId) {
        payload.variant_id = options.variantId;
      }

      log("Adding to Salla cart:", payload);

      // Use Salla's cart.addItem method
      const response = await this.salla.cart.addItem(payload);

      log("Added to Salla cart successfully:", response);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      // Don't log expected errors (like 410 for mock products) in production
      if (import.meta.env.DEV) {
        console.error("[Storia] Error adding to Salla cart:", error);
      }
      return {
        success: false,
        error: error.message || "Failed to add to cart",
      };
    }
  }

  /**
   * Get current cart from Salla
   */
  async getCart() {
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot get cart");
      return null;
    }

    try {
      // Salla cart is managed on the page, we can get the current state
      const response = await this.salla.cart.fetch();

      log("Fetched Salla cart:", response);

      return response;
    } catch (error) {
      console.error("[Storia] Error fetching Salla cart:", error);
      return null;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId, quantity) {
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot update cart");
      return { success: false };
    }

    try {
      const response = await this.salla.cart.updateItem(itemId, { quantity });

      log("Updated cart item:", response);

      return { success: true, data: response };
    } catch (error) {
      console.error("[Storia] Error updating cart item:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId) {
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot remove from cart");
      return { success: false };
    }

    try {
      const response = await this.salla.cart.deleteItem(itemId);

      log("Removed from cart:", response);

      return { success: true, data: response };
    } catch (error) {
      console.error("[Storia] Error removing from cart:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Navigate to checkout
   */
  goToCheckout() {
    if (!this.isAvailable()) {
      console.warn(
        "[Storia] Salla SDK not available, cannot navigate to checkout",
      );
      return;
    }

    try {
      // Redirect to Salla checkout page
      window.location.href = "/checkout";
    } catch (error) {
      console.error("[Storia] Error navigating to checkout:", error);
    }
  }

  /**
   * Listen to cart events
   */
  onCartUpdate(callback) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      // Listen to cart update events from Salla
      this.salla.event.cart.onUpdated(callback);
      log("Registered cart update listener");
    } catch (error) {
      console.error("[Storia] Error registering cart listener:", error);
    }
  }
}

// Export singleton instance
export default new SallaService();
