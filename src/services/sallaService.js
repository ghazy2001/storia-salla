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
      // Debug SDK structure
      if (import.meta.env.DEV || config.enableLogging) {
        console.group("[Storia] Salla SDK Inspection");
        console.log("SDK Keys:", Object.keys(this.salla));
        // Safer check for versions
        try {
          if (typeof this.salla.versions === "function") {
            console.log("SDK Version:", this.salla.versions());
          } else {
            console.log("SDK Versions property:", this.salla.versions);
          }
        } catch (e) {
          console.log("Could not retrieve SDK version");
        }

        if (this.salla.api) {
          console.log("API Keys:", Object.keys(this.salla.api));
          if (this.salla.api.product) {
            console.log(
              "API Product Keys:",
              Object.keys(this.salla.api.product),
            );
            console.log(
              "API Product fetch exists:",
              typeof this.salla.api.product.fetch === "function",
            );
          }
          if (this.salla.api.navigation) {
            console.log(
              "API Navigation Keys:",
              Object.keys(this.salla.api.navigation),
            );
            console.log(
              "API Navigation fetch exists:",
              typeof this.salla.api.navigation.fetch === "function",
            );
          }
        }

        // Debug higher-level SDK objects
        ["product", "navigation", "profile", "cart"].forEach((key) => {
          if (this.salla[key]) {
            console.log(
              `SDK ${key} exists. Keys:`,
              Object.keys(this.salla[key]),
            );
            if (this.salla[key].fetch) console.log(`SDK ${key}.fetch exists`);
          }
        });

        console.groupEnd();
      }
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
      log("Attempting to fetch products from Salla API...");

      // The "Source value cannot be empty" error is very specific.
      // We will try several variants in order.
      // 1. Try passing 'web' as a string (common in some Salla SDK versions)
      // 2. Try passing { source: 'store' } (another common variant)
      // 3. Try passing { source: 'web' } again but with more defensive checks

      const productManager =
        this.salla.product || (this.salla.api ? this.salla.api.product : null);

      if (!productManager || typeof productManager.fetch !== "function") {
        log("Salla Product fetch is not available");
        return null;
      }

      let response = null;
      let lastError = null;

      // Variant 1: String argument
      try {
        log("Product Fetch V1: product.fetch('web')");
        response = await productManager.fetch("web");
      } catch (e) {
        lastError = e;
        // Variant 2: Object with source: 'store'
        try {
          log("Product Fetch V2: product.fetch({ source: 'store' })");
          response = await productManager.fetch({ source: "store" });
        } catch (e2) {
          // Variant 3: Just fetch()
          try {
            log("Product Fetch V3: product.fetch()");
            response = await productManager.fetch();
          } catch (e3) {
            log("All product fetch variants failed. Last error:", lastError);
            return null;
          }
        }
      }

      if (response && response.data) {
        log("Fetched products successfully:", response.data);

        // Map Salla product format to app format
        return response.data.map((p) => ({
          id: p.id,
          name: p.name,
          price:
            p.price && p.price.amount
              ? `${p.price.amount} ${p.price.currency}`
              : "0 ر.س",
          category: p.category ? p.category.name : "general",
          sizes: p.options
            ? p.options
                .filter(
                  (opt) =>
                    opt && opt.name && opt.name.toLowerCase().includes("size"),
                )
                .flatMap((opt) => (opt.values || []).map((v) => v.name))
            : ["S", "M", "L", "XL"],
          description: p.description || "",
          image: p.main_image || "/assets/logo.png",
          media: p.images
            ? p.images.map((img) => img.url || img.src)
            : [p.main_image],
          isNew: false,
          rating: 5.0,
          reviews: 0,
        }));
      }

      log("Product fetch returned no data, falling back to mock");
      return null;
    } catch (error) {
      // Silence internal SDK crashes in production unless logging is enabled
      if (import.meta.env.DEV || config.enableLogging) {
        console.error(
          "[Storia] Salla SDK product.fetch internal error:",
          error,
        );
      }
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
  async goToCheckout() {
    if (!this.isAvailable()) {
      console.warn(
        "[Storia] Salla SDK not available, cannot navigate to checkout",
      );
      return;
    }

    try {
      log("Initiating checkout redirect...");

      // Check if cart is empty in Salla
      const cart = await this.getCart();
      if (!cart || !cart.data || cart.data.items_count === 0) {
        log("Salla cart is empty, sync might have failed");
        // Optional: show a message or redirect to cart instead
        window.location.href = "/cart";
        return;
      }

      // Try to use Salla's native checkout if possible
      // Some versions of Twilight SDK use different methods
      if (this.salla.cart && typeof this.salla.cart.submit === "function") {
        await this.salla.cart.submit();
      } else {
        // Fallback to direct redirect
        window.location.href = "/checkout";
      }
    } catch (error) {
      console.error("[Storia] Error navigating to checkout:", error);
      // Last resort fallback
      window.location.href = "/checkout";
    }
  }

  /**
   * Fetch categories/departments from Salla store
   */
  async fetchCategories() {
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot fetch categories");
      return null;
    }

    try {
      log("Attempting to fetch categories from Salla Navigation API...");

      const nav =
        this.salla.navigation ||
        (this.salla.api ? this.salla.api.navigation : null);

      if (!nav) {
        log("Salla Navigation object not found");
        return null;
      }

      let response = null;

      // Try multiple possible methods for categories
      if (typeof nav.fetch === "function") {
        try {
          log("Navigation Fetch V1: nav.fetch('web')");
          response = await nav.fetch("web");
        } catch (e) {
          log("Navigation Fetch V2: nav.fetch({ source: 'store' })");
          response = await nav.fetch({ source: "store" });
        }
      } else if (typeof nav.get === "function") {
        log("Using nav.get()...");
        response = await nav.get();
      } else {
        log(
          "No fetch/get method found on Navigation object. Available keys:",
          Object.keys(nav),
        );
        return null;
      }

      if (response && response.data) {
        log("Fetched categories successfully:", response.data);
        // Salla Navigation API usually returns an array of menu items or categories
        return response.data.map((cat) => ({
          id: cat.id,
          label: cat.name || cat.title,
          slug: cat.slug || cat.url,
        }));
      }
      return null;
    } catch (error) {
      if (import.meta.env.DEV || config.enableLogging) {
        console.error(
          "[Storia] Salla SDK category.fetch internal error:",
          error,
        );
      }
      return null;
    }
  }

  /**
   * Fetch current customer profile from Salla
   */
  async fetchCustomer() {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      log("Attempting to fetch customer profile...");

      // Defensive check for the API path
      if (
        !this.salla.api ||
        !this.salla.api.customer ||
        typeof this.salla.api.customer.fetch !== "function"
      ) {
        return null;
      }

      const response = await this.salla.api.customer.fetch({});

      if (response && response.data) {
        log("Fetched customer profile:", response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      // 401/403 is common for guest users, don't log as error in prod
      if (import.meta.env.DEV) {
        console.warn(
          "[Storia] Salla SDK customer.fetch internal error:",
          error,
        );
      }
      return null;
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
