/**
 * Salla Service - Interface to Salla Platform APIs
 *
 * This service provides methods to interact with Salla's backend
 * using the Salla Twilight SDK available on the Salla platform.
 */

import { config, log } from "../config/config.js";

class SallaService {
  constructor() {
    this.apiBaseUrl = `${config.apiUrl}/api`;
    this.isLocalForced = false; // Enabled real Salla fetching

    // Logging only - status might change dynamically
    if (config.isSallaEnv && this.salla) {
      log("Salla SDK detected on init");
    } else if (config.useSallaBackend) {
      console.warn(
        "[Storia] Salla backend requested but SDK not available yet",
      );
    }
  }

  /**
   * Dynamic getter to handle race conditions where Salla loads after React
   */
  get salla() {
    return typeof window !== "undefined" && window.salla ? window.salla : null;
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
   * Waits for Salla SDK to initialize
   * @param {number} timeout - Max wait time in ms
   */
  async waitForSalla(timeout = 5000) {
    if (
      this.salla &&
      (this.salla.cart || (this.salla.api && this.salla.api.cart))
    )
      return true;

    log(`Waiting for Salla SDK & Cart (timeout: ${timeout}ms)...`);
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (
        this.salla &&
        (this.salla.cart || (this.salla.api && this.salla.api.cart))
      ) {
        log("Salla SDK & Cart detected!");
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    log("Salla SDK wait timed out (Cart module missing).");
    return !!this.salla; // Return true if Salla exists even if cart doesn't, to attempt falbacks
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
    // 0. Wait for SDK to be ready
    await this.waitForSalla();

    // 1. Try Salla SDK first if available (for real IDs and sync)
    if (this.isAvailable()) {
      try {
        log("Attempting to fetch products from Salla API (SDK Detected)...");

        const productManager =
          this.salla.product ||
          (this.salla.api ? this.salla.api.product : null);

        if (!productManager || typeof productManager.fetch !== "function") {
          throw new Error("Salla Product fetch is not available");
        }

        let response = null;
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
            /* ignore */
          }
        }

        if (response && response.data) {
          log(`Success with variant: ${response.data.length} items found`);
          // Process and return mapped Salla products
          return await this._processSallaProducts(response.data);
        } else {
          // FALLBACK: Targeted Fetch for known IDs
          log(
            "Bulk fetch yielded no results. Attempting targeted fetch for linked IDs...",
          );
          const targetIds = [1314742571, 1252773325]; // Abaya-2, Abaya
          const targetedResults = [];

          for (const id of targetIds) {
            try {
              // Try different signatures for .get()
              let res = await productManager.get(id).catch(() => null);
              if (!res)
                res = await productManager.get({ id }).catch(() => null);

              if (res && res.data) {
                log(`Targeted fetch success for ${id}`);
                targetedResults.push(res.data);
              }
            } catch (err) {
              console.error(`Targeted fetch failed for ${id}`, err);
            }
          }

          if (targetedResults.length > 0) {
            return await this._processSallaProducts(targetedResults);
          }

          // FINAL FALLBACK: Direct Storefront API (REST)
          log("SDK fetches failed. Attempting Direct Storefront API (REST)...");
          try {
            // Fetch directly from the store's public API
            const restRes = await fetch("/api/v1/products?per_page=100");
            if (restRes.ok) {
              const restData = await restRes.json();
              if (restData && restData.data) {
                log(`Direct REST API success: ${restData.data.length} items`);
                return await this._processSallaProducts(restData.data);
              }
            } else {
              log(`Direct REST API failed: ${restRes.status}`);
            }
          } catch (err) {
            console.error("Direct REST API error:", err);
          }
        }
      } catch (error) {
        log("Salla SDK fetch failed or returned no data:", error);
      }
    }

    // 2. Fallback to custom backend (e.g. for development or standalone)
    log("Falling back to custom backend...");
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
    } catch (error) {
      log("Error fetching from custom backend:", error);
    }

    return null;
  }

  /**
   * Internal helper to process and map Salla products
   * @private
   */
  async _processSallaProducts(productsData) {
    if (config.enableLogging) {
      log("MAPPING_V6 - Starting detailed product processing");
    }

    const mappedResults = await Promise.all(
      productsData.map(async (p) => {
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

        // 1. Get fundamental details
        // 1. Description Extractor
        // 1. Description Extractor
        const getDesc = (obj) => {
          if (!obj) return "";
          const scan = (t, d = 0) => {
            if (!t || d > 3) return "";
            if (typeof t === "string" && (t.includes("<") || t.length > 5))
              return t;
            if (typeof t === "object") {
              const keys = [
                "description",
                "short_description",
                "content",
                "summary",
                "ar",
                "en",
                "value",
                "text",
              ];
              for (const k of keys) {
                const f = scan(t[k], d + 1);
                if (f) return f;
              }
              for (const k in t) {
                if (keys.includes(k)) continue;
                const f = scan(t[k], d + 1);
                if (f) return f;
              }
            }
            return "";
          };
          const raw =
            scan(obj.translation) ||
            scan(obj.translations) ||
            scan(obj.features) ||
            scan(obj);
          if (!raw) return "";
          const clean = translate(raw)
            .replace(/<[^>]*>?/gm, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          return clean.length > 2 ? clean : "";
        };

        let description = getDesc(p);
        let targetProduct = p;

        // 2. Resilient Detail Fetch
        if ((!description || description.length < 5) && p.id) {
          try {
            const sm = window.salla || this.salla;
            const sdk = [
              (sm.product || sm.api?.product)?.getDetails,
              (sm.product || sm.api?.product)?.get,
              sm.api?.fetch,
            ];
            for (const f of sdk.filter((x) => typeof x === "function")) {
              const res = await (
                f.name === "fetch"
                  ? f("product.details", { id: p.id })
                  : f(p.id)
              ).catch(() => null);
              const b = res?.data || res?.product || (res?.id ? res : null);
              if (getDesc(b)) {
                description = getDesc(b);
                targetProduct = b;
                break;
              }
            }
            if (!description) {
              const paths = [
                p.url ? `${p.url}?format=json` : null,
                `/api/v1/products/${p.id}`,
                `/products/${p.id}.json`,
              ].filter(Boolean);
              for (const u of paths) {
                const r = await fetch(u).catch(() => null);
                if (r && r.ok) {
                  const d = await r.json();
                  const b = d?.data || d?.product || d;
                  if (getDesc(b)) {
                    description = getDesc(b);
                    targetProduct = b;
                    break;
                  }
                }
              }
            }
          } catch (e) {
            /* ignore */
          }
        }

        // 3. Map Price
        let amount = 0;
        let currency = "SAR";

        if (targetProduct.price) {
          if (typeof targetProduct.price === "object") {
            amount = targetProduct.price.amount || 0;
            currency = targetProduct.price.currency || "SAR";
          } else {
            amount = targetProduct.price;
          }
        }

        // Format price string
        let priceStr = `${amount} ${currency}`;
        if (currency === "SAR" || currency === "RS" || currency === "ر.س") {
          priceStr = `${amount} ر.س`;
        }

        // 4. Map Images
        // Try to get all images from 'images' array, fallback to 'image' object
        const rawImages = targetProduct.images || [];
        const media = rawImages.map((img) => ({
          type: "image",
          src: img.url || img.src,
          alt: img.alt || targetProduct.name,
        }));

        // Ensure main image is present
        const mainImage =
          targetProduct.image?.url ||
          targetProduct.image?.src ||
          targetProduct.main_image;
        if (mainImage && !media.find((m) => m.src === mainImage)) {
          media.unshift({ type: "image", src: mainImage });
        }

        // If no images, use logo
        if (media.length === 0) {
          media.push({ type: "image", src: "/assets/logo.png" });
        }

        // 5. Map Options (Sizes)
        // Look for options that seem to be "Size" or "المقاس"
        let sizes = ["S", "M", "L", "XL"]; // Default fallback
        let sizeVariants = [];

        const options = targetProduct.options || [];
        const sizeOption = options.find((opt) => {
          const name = translate(opt.name).toLowerCase();
          return (
            name.includes("size") ||
            name.includes("مقاس") ||
            name.includes("قياس")
          );
        });

        if (sizeOption && sizeOption.values) {
          sizes = sizeOption.values.map((v) => translate(v.name || v.label));
          // Map values to sizeVariants structure
          sizeVariants = sizeOption.values.map((v) => ({
            size: translate(v.name || v.label),
            price: v.price ? v.price.amount : amount,
            stock: 10,
            optionId: sizeOption.id,
            valueId: v.id,
            sallaVariantId: v.id, // Keep for backward compatibility
          }));
        }

        // 6. Map Category
        const categoryName =
          targetProduct.categories && targetProduct.categories.length > 0
            ? translate(targetProduct.categories[0].name)
            : targetProduct.category
              ? translate(targetProduct.category.name)
              : "General";

        const mappedProduct = {
          id: targetProduct.id,
          sallaProductId: targetProduct.id,
          name: translate(targetProduct.name),
          image: mainImage || "/assets/logo.png",
          media: media,
          price: amount,
          priceStr: priceStr,
          regularPrice: targetProduct.regular_price?.amount || 0,
          currency: currency,
          category: categoryName,
          sizes: sizes,
          sizeVariants: sizeVariants,
          description: description || "No description available",
          stock: targetProduct.quantity || 10,
          isNew: targetProduct.is_new || false,
          isPromoted: !!targetProduct.promotion,
          promotionTitle: targetProduct.promotion?.title,
          rating: 5.0,
          reviews: 0,
          rawSallaData: p, // Keep for debugging if needed
        };

        if (mappedProduct.name.includes("عباية 2") || true) {
          console.log(`[Storia DEBUG] Mapping Product: ${mappedProduct.name}`);
          console.log(
            "[Storia DEBUG] Options:",
            JSON.stringify(targetProduct.options || [], null, 2),
          );
          console.log(
            "[Storia DEBUG] Variants:",
            JSON.stringify(targetProduct.variants || [], null, 2),
          );
          console.log(
            "[Storia DEBUG] Mapped sizeVariants:",
            JSON.stringify(sizeVariants, null, 2),
          );
        }

        return mappedProduct;
      }),
    );

    return mappedResults;
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
        id: options.sallaProductId || productId,
        quantity: quantity,
      };

      // Handle Variants vs Custom Options
      // Salla uses 'variant_id' for SKU-managed variants
      // and 'options' object for custom options: { [option_id]: value_id }
      if (options.variantId) {
        payload.variant_id = options.variantId;
      }

      if (options.options) {
        payload.options = options.options;
      }

      console.log(
        "[Storia] cart.addItem payload:",
        JSON.stringify(payload, null, 2),
      );
      log("Adding to Salla cart (Full Payload):", payload);

      // Use Salla's cart.addItem method
      const response = await this.salla.cart.addItem(payload);

      log("Added to Salla cart successfully:", response);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      // Don't log expected errors (like 410 for mock products) in production
      console.error("[Storia] Error adding to Salla cart:", error);
      return {
        success: false,
        error: error.message || "Failed to add to cart",
      };
    }
  }

  /**
   * Get current cart from Salla
   */
  /**
   * Get current cart from Salla
   */
  async getCart() {
    if (!this.isAvailable()) {
      log("Salla SDK not available, cannot get cart");
      return null;
    }

    try {
      let response = null;
      const cartApi =
        this.salla.cart || (this.salla.api ? this.salla.api.cart : null);

      if (cartApi && typeof cartApi.fetch === "function") {
        // Standard method
        response = await cartApi.fetch();
      } else if (cartApi && typeof cartApi.details === "function") {
        // Alternative method
        response = await cartApi.details();
      } else if (this.salla.api && this.salla.api.axios) {
        // Direct Axios fallback
        const res = await this.salla.api.axios.get("/cart");
        if (res && res.data) response = res.data;
      }

      if (response) {
        log("Fetched Salla cart:", response);
        return response;
      }

      return null;
    } catch (error) {
      console.error("[Storia] Error fetching Salla cart:", error);
      return null;
    }
  }

  /**
   * Sync local cart with Salla cart (Clear & Re-add)
   * @param {Array} cartItems
   */
  async syncCart(cartItems) {
    if (!this.isAvailable()) {
      return { success: false, error: "SDK not ready" };
    }

    try {
      log("Syncing cart with Salla...");

      // 1. Clear Cart
      try {
        await this.salla.cart.clear();
      } catch {
        // Ignore clear error (cart might be empty)
      }

      // 2. Add Items Sequentially
      for (const item of cartItems) {
        await this.addToCart(item.sallaProductId || item.id, item.quantity, {
          variantId:
            item.size && item.sizeVariants
              ? item.sizeVariants.find((v) => v.size === item.selectedSize)
                  ?.sallaVariantId
              : null,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Sync failed:", error);
      return { success: false, error: error.message };
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
        // Fallback to direct redirect to Storefront
        window.location.href = "https://storiasa.com/checkout";
      }
    } catch (error) {
      console.error("[Storia] Error navigating to checkout:", error);
      // Last resort fallback
      window.location.href = "https://storiasa.com/checkout";
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
    if (this.isLocalForced) {
      console.log("[Storia Service] Mock Create Product:", productData);
      return { ...productData, id: Date.now() };
    }
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
    if (this.isLocalForced) {
      console.log("[Storia Service] Mock Update Product:", id, productData);
      return { ...productData, id };
    }
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
    if (this.isLocalForced) {
      console.log("[Storia Service] Mock Delete Product:", id);
      return { id, deleted: true };
    }
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
