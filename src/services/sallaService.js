/**
 * Salla Service - Interface to Salla Platform APIs
 *
 * This service provides methods to interact with Salla's backend
 * using the Salla Twilight SDK available on the Salla platform.
 */

import { config, log } from "../config/config.js";

class SallaService {
  constructor() {
    this.salla =
      typeof window !== "undefined" && window.salla ? window.salla : null;
    this.apiBaseUrl =
      import.meta.env.MODE === "development"
        ? "http://localhost:3000/api"
        : "https://storia-salla.fly.dev/api";

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
        } catch {
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
    return !!this.salla;
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
  async fetchProducts() {
    log("Attempting to fetch products from custom backend...");
    try {
      const response = await fetch(`${this.apiBaseUrl}/products`);
      if (response.ok) {
        const products = await response.json();
        if (products && products.length > 0) {
          log(
            `Successfully fetched ${products.length} products from custom backend`,
          );
          return products;
        }
      }
      log("Custom backend returned no products, falling back to Salla SDK...");
    } catch (error) {
      log(
        "Error fetching from custom backend, falling back to Salla SDK:",
        error,
      );
    }

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
        } catch {
          // Continue to next variant
        }
      }

      // Final SDK Fallback: Try just fetch() again in case of intermittent failure
      if (!response) {
        try {
          response = await productManager.fetch();
        } catch {
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
        } catch {
          log("Direct products axios call failed");
        }
      }

      if (response && response.data) {
        if (response.data.length > 0) {
          log(
            "First raw product sample:",
            JSON.stringify(response.data[0], null, 2),
          );
        }
        log("Fetched products successfully:", response.data);

        if (import.meta.env.DEV || config.enableLogging) {
          log("MAPPING_V6 - Starting detailed product processing");
        }

        // Map Salla product format to app format using async detail fetching
        const mappedResults = await Promise.all(
          response.data.map(async (p, index) => {
            // Helper to handle localized strings from Salla API
            const translate = (val) => {
              if (!val) return "";
              if (typeof val === "string") return val;
              if (typeof val === "object") {
                return (
                  val.ar || val.en || val.default || Object.values(val)[0] || ""
                );
              }
              return String(val);
            };

            // IF DESCRIPTION IS NULL, TRY TO FETCH FULL PRODUCT DETAILS
            let description = translate(
              p.description || p.short_description || p.subtitle,
            );
            let targetProduct = p;

            if (!description && p.id) {
              try {
                log(`Fetching full details for product ${p.id}...`);
                // Get the product manager from the SDK instance
                const productManager = this.salla.api.product;
                const detailedRes = await productManager.get({ id: p.id });
                if (detailedRes && detailedRes.data) {
                  targetProduct = detailedRes.data;
                  description = translate(
                    targetProduct.description ||
                      targetProduct.short_description ||
                      targetProduct.subtitle,
                  );
                }
              } catch {
                log(`Failed to fetch full details for ${p.id}`);
              }
            }

            // Improved price handling
            let priceStr = "0 ر.س";
            if (
              targetProduct.price !== undefined &&
              targetProduct.price !== null
            ) {
              const amount =
                targetProduct.price.amount !== undefined
                  ? targetProduct.price.amount
                  : targetProduct.price;
              let currency =
                targetProduct.currency || targetProduct.price.currency || "SAR";

              // Map SAR to Arabic currency symbol
              if (currency.toUpperCase().trim() === "SAR") currency = "ر.س";

              priceStr = `${amount} ${currency}`;
            }

            const mappedProduct = {
              id: targetProduct.id,
              name: translate(targetProduct.name),
              price: priceStr,
              category: targetProduct.category
                ? translate(targetProduct.category.name)
                : "general",
              sizes: targetProduct.options
                ? targetProduct.options
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
              description: description || "قريباً",
              image:
                targetProduct.main_image ||
                targetProduct.image?.url ||
                targetProduct.image?.src ||
                "/assets/logo.png",
              // IMPORTANT: Components expect objects with { type, src }
              media:
                targetProduct.images && targetProduct.images.length > 0
                  ? targetProduct.images.map((img) => ({
                      type: "image",
                      src: img.url || img.src || targetProduct.main_image,
                    }))
                  : [
                      {
                        type: "image",
                        src:
                          targetProduct.main_image ||
                          targetProduct.image?.url ||
                          targetProduct.image?.src ||
                          "/assets/logo.png",
                      },
                    ],
              isNew: false,
              rating: 5.0,
              reviews: 0,
            };

            if (index === 0) {
              log("Sample Mapped Product (V6):", mappedProduct);
              log("Product Image URL:", mappedProduct.image);
              log("Product Media Array:", mappedProduct.media);
              log(
                "First Media Item:",
                JSON.stringify(mappedProduct.media[0], null, 2),
              );
              log("Original Salla Product Image:", targetProduct.image);
            }
            return mappedProduct;
          }),
        );

        return mappedResults;
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
  async fetchSdkCategories() {
    if (!this.salla) return null;
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot fetch categories");
      return null;
    }

    try {
      log("Attempting to fetch categories/menu from Salla API...");

      // If navigation fetch is missing, try getMenus which usually contains departments
      const componentApi = this.salla?.api ? this.salla.api.component : null;
      let response = null;

      if (componentApi && typeof componentApi.getMenus === "function") {
        try {
          log("Trying component.getMenus('header')...");
          // Adding a race with a timeout since SDK calls might hang
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 3000),
          );
          response = await Promise.race([
            componentApi.getMenus({ headOrFoot: "header" }),
            timeout,
          ]);
        } catch (e) {
          log("component.getMenus failed or timed out:", e.message);
        }
      }

      if (!response && this.salla.api && this.salla.api.axios) {
        try {
          log("Fetching navigation via direct Axios call to /menu...");
          const axiosRes = await this.salla.api.axios.get("/menu");
          if (axiosRes && axiosRes.data) {
            response = axiosRes.data;
          }
        } catch {
          log("Direct navigation/category axios call failed");
        }
      }

      // Secondary fallback: Try to get categories from the products themselves if menu fails
      if (!response) {
        try {
          log(
            "Falling back: Generating categories from Global Config or Products...",
          );
          const sConfig =
            typeof window !== "undefined" ? window.salla_config : null;
          if (sConfig && sConfig.categories) {
            response = { data: sConfig.categories };
          }
        } catch {
          /* ignore */
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
    if (!this.salla) return null;
    if (!this.isAvailable()) {
      return null;
    }

    try {
      log("Attempting to fetch customer profile...");

      // Defensive check for the API path
      if (
        !this.salla?.api ||
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
   * Create a new product in custom backend
   */
  async createProduct(productData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to create product");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error creating product:", error);
      throw error;
    }
  }

  /**
   * Update an existing product in custom backend
   */
  async updateProduct(id, productData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to update product");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete a product from custom backend
   */
  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error deleting product:", error);
      throw error;
    }
  }

  /**
   * FAQ Operations
   */
  async fetchFAQs() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/faqs`);
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error fetching FAQs:", error);
      return null;
    }
  }

  async createFAQ(faqData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/faqs/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqData),
      });
      if (!response.ok) throw new Error("Failed to create FAQ");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error creating FAQ:", error);
      throw error;
    }
  }

  async updateFAQ(id, faqData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/faqs/admin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqData),
      });
      if (!response.ok) throw new Error("Failed to update FAQ");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error updating FAQ:", error);
      throw error;
    }
  }

  async deleteFAQ(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/faqs/admin/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete FAQ");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error deleting FAQ:", error);
      throw error;
    }
  }

  /**
   * Review Operations
   */
  async fetchReviews() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error fetching reviews:", error);
      return null;
    }
  }

  async createReview(reviewData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/reviews/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error("Failed to create review");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error creating review:", error);
      throw error;
    }
  }

  async deleteReview(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/reviews/admin/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete review");
      return true;
    } catch (error) {
      console.error("[Storia] Error deleting review:", error);
      throw error;
    }
  }

  // Orders
  async fetchOrders() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error fetching orders:", error);
      return null;
    }
  }

  async deleteOrder(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/orders/admin/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete order");
      return true;
    } catch (error) {
      console.error("[Storia] Error deleting order:", error);
      throw error;
    }
  }

  // Analytics
  async fetchAnalytics() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analytics`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error fetching analytics:", error);
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

  async fetchBestSellers() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/bestsellers`);
      if (!response.ok) throw new Error("Failed to fetch BestSellers");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error fetching BestSellers:", error);
      return null;
    }
  }

  async fetchAdminBestSellers() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/bestsellers`);
      if (!response.ok) throw new Error("Failed to fetch admin BestSellers");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error fetching admin BestSellers:", error);
      return null;
    }
  }

  async createBestSellers(data) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/bestsellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create BestSellers");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error creating BestSellers:", error);
      throw error;
    }
  }

  async updateBestSellers(id, data) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/admin/bestsellers/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) throw new Error("Failed to update BestSellers");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error updating BestSellers:", error);
      throw error;
    }
  }

  async deleteBestSellers(id) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/admin/bestsellers/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete BestSellers");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error deleting BestSellers:", error);
      throw error;
    }
  }

  // Categories
  async fetchCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error fetching categories:", error);
      return [];
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Failed to create category");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/admin/categories/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        },
      );
      if (!response.ok) throw new Error("Failed to update category");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/admin/categories/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete category");
      return await response.json();
    } catch (error) {
      console.error("[Storia] Error deleting category:", error);
      throw error;
    }
  }
}

// Export singleton instance
export default new SallaService();
