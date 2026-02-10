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
          ["product", "navigation", "category", "component"].forEach((key) => {
            if (this.salla.api[key]) {
              console.log(
                `API ${key} Endpoints:`,
                this.salla.api[key].endpoints,
              );
              console.log(
                `API ${key} fetch function:`,
                typeof this.salla.api[key].fetch === "function",
              );
            }
          });
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

        if (this.salla.config && typeof this.salla.config.get === "function") {
          console.log(
            "SDK Global Config Categories:",
            this.salla.config.get("categories"),
          );
        }

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
   * Get the Salla Store Dashboard URL
   */
  getDashboardUrl() {
    return "https://s.salla.sa";
  }

  /**
   * Get the deep link to a specific product in Salla Dashboard
   * @param {string|number} productId
   */
  getProductDashboardUrl(productId) {
    if (!productId) return `${this.getDashboardUrl()}/products/index`;
    return `${this.getDashboardUrl()}/products/update/${productId}`;
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

      // Extensive variants to find the right 'Source'
      const variants = [
        { source: "latest" },
        { source: "all" },
        { source: "store" },
        { source: "web" },
        "web",
        "store",
      ];

      for (const variant of variants) {
        try {
          const label =
            typeof variant === "string" ? variant : JSON.stringify(variant);
          log(`Trying product.fetch(${label})...`);
          response = await productManager.fetch(variant);
          if (response && response.data) {
            log(`Success with variant: ${label}`);
            break;
          }
        } catch (e) {
          // Continue to next variant
        }
      }

      // Final SDK Fallback: Try just fetch() again in case of intermittent failure
      if (!response) {
        try {
          response = await productManager.fetch();
        } catch (e) {
          /* ignore */
        }
      }

      // Final fallthrough: Direct Axios call if we can't get it via SDK
      if (!response && this.salla.api && this.salla.api.axios) {
        try {
          log(
            "Fetching products via direct Axios call to /products/index.json...",
          );
          const axiosRes = await this.salla.api.axios.get(
            "/products/index.json",
          );
          if (axiosRes && axiosRes.data) {
            log("Success via direct Axios call");
            response = axiosRes.data;
          }
        } catch (e) {
          log("Direct products axios call failed");
        }
      }

      if (response && response.data) {
        log("Fetched products successfully:", response.data);

        // Map Salla product format to app format
        return response.data.map((p) => {
          // Helper to handle localized strings from Salla API
          const translate = (val) => {
            if (!val) return "";
            if (typeof val === "string") return val;
            if (typeof val === "object") {
              return val.ar || val.en || Object.values(val)[0] || "";
            }
            return String(val);
          };

          return {
            id: p.id,
            name: translate(p.name),
            price:
              p.price && p.price.amount
                ? `${p.price.amount} ${p.price.currency}`
                : "0 ر.س",
            category: p.category ? translate(p.category.name) : "general",
            sizes: p.options
              ? p.options
                  .filter(
                    (opt) =>
                      opt &&
                      opt.name &&
                      translate(opt.name).toLowerCase().includes("size"),
                  )
                  .flatMap((opt) =>
                    (opt.values || []).map((v) => translate(v.name)),
                  )
              : ["S", "M", "L", "XL"],
            description: translate(p.description || p.short_description),
            image: p.main_image || "/assets/logo.png",
            // IMPORTANT: Components expect objects with { type, src }
            media:
              p.images && p.images.length > 0
                ? p.images.map((img) => ({
                    type: "image",
                    src: img.url || img.src || p.main_image,
                  }))
                : [{ type: "image", src: p.main_image || "/assets/logo.png" }],
            isNew: false,
            rating: 5.0,
            reviews: 0,
          };
        });
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
      log("Attempting to fetch categories/menu from Salla API...");

      // If navigation fetch is missing, try getMenus which usually contains departments
      const componentApi = this.salla.api ? this.salla.api.component : null;
      let response = null;

      if (componentApi && typeof componentApi.getMenus === "function") {
        log("Trying component.getMenus('header')...");
        response = await componentApi.getMenus({ headOrFoot: "header" });
      }

      if (!response) {
        // Fallback: Direct Axios call for navigation/menus
        if (this.salla.api && this.salla.api.axios) {
          try {
            log("Fetching navigation via direct Axios call to /menu...");
            const axiosRes = await this.salla.api.axios.get("/menu");
            if (axiosRes && axiosRes.data) {
              response = axiosRes.data;
            }
          } catch (e) {
            log("Direct navigation/category axios call failed");
          }
        }
      }

      if (response && response.data) {
        log("Fetched categories/menu successfully:", response.data);

        // Helper to translate
        const translate = (val) => {
          if (!val) return "";
          if (typeof val === "string") return val;
          return val.ar || val.en || Object.values(val)[0] || "";
        };

        // Navigation API or getMenus usually returns an array of items
        // We look for items that look like categories or main departments
        return response.data.map((item) => ({
          id: item.id,
          label: translate(item.name || item.title),
          slug: item.slug || item.url || "#",
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
