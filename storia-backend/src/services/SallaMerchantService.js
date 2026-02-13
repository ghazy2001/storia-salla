const axios = require("axios");
const SallaAuthService = require("./SallaAuthService");
const Product = require("../models/Product");

class SallaMerchantService {
  constructor() {
    this.baseUrl = "https://api.salla.dev/admin/v2"; // Salla Admin API V2
    this.axios = axios.create({
      baseURL: this.baseUrl,
    });

    // Request Interceptor to add Token
    this.axios.interceptors.request.use(
      async (config) => {
        const token = await SallaAuthService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers["Content-Type"] = "application/json";
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  /**
   * Sync a local product to Salla
   * @param {Object} product - Local Mongoose Product Document
   */
  async syncProduct(product) {
    try {
      console.log(
        `[SallaSync] Syncing product: ${product.name.ar} (${product._id})`,
      );

      const payload = this.prepareProductPayload(product);

      let response;
      if (product.sallaProductId) {
        // Update existing
        console.log(
          `[SallaSync] Updating Salla product ID: ${product.sallaProductId}`,
        );
        try {
          response = await this.axios.put(
            `/products/${product.sallaProductId}`,
            payload,
          );
        } catch (updateError) {
          if (updateError.response && updateError.response.status === 404) {
            console.warn(
              `[SallaSync] Product ${product.sallaProductId} not found in Salla. Re-creating...`,
            );
            product.sallaProductId = null; // Reset to force create
            response = await this.axios.post("/products", payload);
          } else {
            throw updateError;
          }
        }
      } else {
        // Create new
        console.log(`[SallaSync] Creating new Salla product`);
        response = await this.axios.post("/products", payload);
      }

      const sallaData = response.data.data;

      // Save Salla ID to local product if not exists
      if (!product.sallaProductId || product.sallaProductId !== sallaData.id) {
        product.sallaProductId = sallaData.id;
        await product.save();
        console.log(
          `[SallaSync] Linked local product to Salla ID: ${sallaData.id}`,
        );
      }

      return { success: true, sallaId: sallaData.id };
    } catch (error) {
      //   console.error(
      //     "[SallaSync] Error syncing product:",
      //     error.response?.data || error.message
      //   );
      // Return details for the UI
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data?.error?.fields,
      };
    }
  }

  /**
   * Prepare payload for Salla API
   */
  prepareProductPayload(product) {
    // Basic fields
    const payload = {
      name: product.name.ar, // Salla uses 'name' as main name (usually AR)
      price: product.price,
      product_type: "product",
      quantity: 100, // Default stock for "Payment Only" logic
      description: product.description.ar,
      // hidden_quantity: true, // Hide quantity from store if possible
    };

    // Images (Send URLs)
    // Images (Send URLs)
    // Ensure images are absolute URLs for Salla to fetch
    const baseUrl = "https://storia-salla.vercel.app";

    if (product.images && product.images.length > 0) {
      payload.images = product.images.map((img) => {
        let url = img.url;
        if (url && !url.startsWith("http")) {
          // Remove leading slash if exists to avoid double slashes
          const cleanPath = url.startsWith("/") ? url.substring(1) : url;
          url = `${baseUrl}/${cleanPath}`;
        }
        return {
          original: url,
          default: img.order === 0,
        };
      });
    }

    // Sizes (Options)
    // Salla format for options is trickier. For 'Payment Only', we might skip options
    // IF the user selects the size in our app, we might need to create a specific product
    // or passed as a note.
    // BUT, proper way is creating options.
    // For MVP transparency, let's stick to simple product first to avoid "invalid_payload" errors
    // with complex options.
    // User goal: "Payment Only".
    // If we send a product with price X, user pays X. Good enough.

    return payload;
  }

  /**
   * Sync All Products
   */
  async syncAllProducts() {
    const products = await Product.find({ isActive: true });
    const results = {
      total: products.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const product of products) {
      const res = await this.syncProduct(product);
      if (res.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({
          id: product._id,
          name: product.name.ar,
          error: res.error,
        });
      }
    }
    return results;
  }
}

module.exports = new SallaMerchantService();
