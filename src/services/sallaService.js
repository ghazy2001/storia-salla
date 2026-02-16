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
          const targetIds = [1252773325]; // Abaya 2 (New) / Abaya 1 (Working)
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

        // 🔍 DEEP SCAN: Find where images are hiding!
        const deepScanForImages = (obj, path = "product") => {
          if (!obj || typeof obj !== "object") return;

          // Check if this is an array of potential images
          if (Array.isArray(obj) && obj.length > 0) {
            // Check first item to see if it looks like an image
            const first = obj[0];
            const isImage =
              (typeof first === "string" &&
                (first.includes("http") || first.includes("cdn"))) ||
              (typeof first === "object" &&
                (first.url || first.src || first.image));

            if (isImage) {
              console.log(
                `📸 FOUND IMAGES at [${path}]: found ${obj.length} items`,
              );
              console.log("   Sample:", first);
            }
          }

          // Recursively scan keys
          Object.keys(obj).forEach((key) => {
            // Avoid circular or huge objects to prevent crash
            if (key === "parent" || key === "context" || path.length > 100)
              return;
            deepScanForImages(obj[key], `${path}.${key}`);
          });
        };

        // LOG: Full Raw Product Object to inspect hidden image fields
        if (p.id == 1252773325) {
          // Log only for the specific product to reduce noise
          console.log(
            `🔥 [Storia] Starting Deep Scan for images in product ${p.id}...`,
          );
          deepScanForImages(p);
          console.log(`🔥 [Storia] Deep Scan Complete.`);
          console.log(`🔥 [Storia] RAW SALLA PRODUCT (${p.id}):`, p);
        }

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

        // 2. Resilient Detail Fetch (Enrichment)
        if (p.id) {
          try {
            const sm = window.salla || this.salla;
            // Use parseInt to handle IDs like "123456/1"
            const pid = parseInt(String(p.id).split("/")[0]) || p.id;

            const isEnriched = (val) => {
              if (!val) return false;
              if (Array.isArray(val)) return val.length > 0;
              return Object.keys(val).length > 0;
            };

            let b = null;

            // METHOD 1: Storefront Public AJAX API (Most Reliable for Images)
            try {
              const ajaxUrl = `${window.location.origin}/api/v1/products/${pid}`;
              const res = await fetch(ajaxUrl, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
              });
              if (res.ok) {
                const json = await res.json();
                b = json.data || json;
                if (config.enableLogging)
                  log(`AJAX enrichment success for ${pid}`, b);
              }
            } catch (err) {
              console.warn(`AJAX enrichment failed for ${pid}`, err);
            }

            // METHOD 2: Robust SDK Call (Wrapped in onReady)
            if (!b && typeof window !== "undefined" && window.salla) {
              try {
                b = await new Promise((resolve) => {
                  const pidStr = String(pid);
                  // Check if Salla is already ready
                  if (
                    window.salla &&
                    window.salla.api &&
                    window.salla.api.product
                  ) {
                    window.salla.api.product
                      .getDetails(pidStr)
                      .then((res) => resolve(res.data || res))
                      .catch((err) => {
                        console.warn("SDK getDetails failed:", err);
                        resolve(null);
                      });
                  } else {
                    // Wait for ready event
                    try {
                      const sallaObj = window.salla || {};
                      if (sallaObj.onReady) {
                        sallaObj.onReady(() => {
                          if (
                            window.salla &&
                            window.salla.api &&
                            window.salla.api.product
                          ) {
                            window.salla.api.product
                              .getDetails(pidStr)
                              .then((res) => resolve(res.data || res))
                              .catch((err) => {
                                console.warn(
                                  "SDK getDetails failed in onReady:",
                                  err,
                                );
                                resolve(null);
                              });
                          } else {
                            resolve(null);
                          }
                        });
                      } else {
                        // Last resort: simple timeout check
                        setTimeout(() => {
                          if (
                            window.salla &&
                            window.salla.api &&
                            window.salla.api.product
                          ) {
                            window.salla.api.product
                              .getDetails(pidStr)
                              .then((res) => resolve(res.data || res))
                              .catch(() => resolve(null));
                          } else {
                            resolve(null);
                          }
                        }, 1000);
                      }
                    } catch (e) {
                      resolve(null);
                    }
                  }
                  // Timeout after 3 seconds
                  setTimeout(() => resolve(null), 3500);
                });
              } catch (e) {
                console.warn("SDK Promise Wrapper failed", e);
              }
            }

            // METHOD 3: Live DOM Scraping (The Intelligent Fix) 🧠
            // The user is on the product page, so the images are PROBABLY loaded in the DOM (even if hidden).
            // We scan the document for common Salla slider structures.
            if (
              !b &&
              typeof document !== "undefined" &&
              window.location.pathname.includes(pid)
            ) {
              try {
                if (config.enableLogging)
                  log(`Attempting Live DOM Scraping for ${pid}...`);

                const domImages = [];

                // Strategy A: Look for Salla's global product object in scripts
                const scripts = document.querySelectorAll("script");
                scripts.forEach((s) => {
                  if (
                    s.textContent.includes("product_id") &&
                    s.textContent.includes("images") &&
                    s.textContent.includes(pid)
                  ) {
                    try {
                      const matches = s.textContent.match(
                        /"images":\s*\[(.*?)\]/s,
                      );
                      if (matches && matches[1]) {
                        const urls = matches[1].match(
                          /https:\/\/cdn\.salla\.sa\/[^"']+/g,
                        );
                        if (urls) domImages.push(...urls);
                      }
                    } catch (e) {}
                  }
                });

                // Strategy B: Scrape <img> tags from common Salla sliders
                const potentialSelectors = [
                  ".product-detials__slider img",
                  ".product-slider img",
                  ".swiper-slide img",
                  ".salla-product-card img",
                  '[data-fancybox="product-images"] img',
                  'img[src*="cdn.salla.sa"]', // Catch-all
                ];

                potentialSelectors.forEach((sel) => {
                  document.querySelectorAll(sel).forEach((img) => {
                    if (
                      img.src &&
                      img.src.includes("cdn.salla.sa") &&
                      !img.src.includes("avatar") &&
                      !img.src.includes("logo")
                    ) {
                      // Filter out small thumbnails if possible (naturalWidth check)
                      if (img.naturalWidth > 100 || !img.naturalWidth) {
                        domImages.push(img.src);
                      }
                    }
                  });
                });

                if (domImages.length > 0) {
                  const uniqueDomImages = [...new Set(domImages)].map(
                    (url) => ({ type: "image", src: url }),
                  );
                  // Only use if we found valid images
                  if (uniqueDomImages.length > 0) {
                    log(
                      `DOM Scraping success: found ${uniqueDomImages.length} images`,
                    );
                    b = {
                      id: pid,
                      images: uniqueDomImages,
                      media: uniqueDomImages,
                      name: document.title, // Best effort name
                    };
                  }
                }
              } catch (err) {
                console.warn(`DOM Scraping failed`, err);
              }
            }

            if (b) {
              if (config.enableLogging) log(`SDK enrichment for ${pid}`, b);
              if (isEnriched(b.options)) targetProduct.options = b.options;
              if (isEnriched(b.variants)) targetProduct.variants = b.variants;
              if (isEnriched(b.skus)) targetProduct.skus = b.skus;
              if (isEnriched(b.images)) targetProduct.images = b.images;
              if (isEnriched(b.media)) targetProduct.media = b.media; // Capture media as well
              if (isEnriched(b.urls)) targetProduct.urls = b.urls; // Capture URLs just in case
              if (getDesc(b)) description = getDesc(b);
            }

            // Secondary Enrichment via REST (Fallback)
            if (
              !isEnriched(targetProduct.options) ||
              !description ||
              description.length < 5
            ) {
              const paths = [
                `/api/v1/products/${pid}`,
                `/products/${pid}.json`,
                p.url ? `${p.url}?format=json` : null,
              ].filter(Boolean);

              for (const u of paths) {
                const r = await fetch(u).catch(() => null);
                if (r && r.ok) {
                  const d = await r.json();
                  const rb = d?.data || d?.product || d;
                  if (rb) {
                    if (isEnriched(rb.options))
                      targetProduct.options = rb.options;
                    if (isEnriched(rb.variants))
                      targetProduct.variants = rb.variants;
                    if (!description) description = getDesc(rb);
                    if (isEnriched(targetProduct.options)) break;
                  }
                }
              }
            }
          } catch (err) {
            console.warn("[Storia] Detail fetch error:", p.id, err.message);
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

        // 4. Map Images (Enhanced with Multiple Fallbacks)
        console.log(
          `[Storia] Mapping images for product ${targetProduct.id}:`,
          {
            hasImages: !!targetProduct.images,
            imagesLength: targetProduct.images?.length || 0,
            hasImage: !!targetProduct.image,
            hasThumbnail: !!targetProduct.thumbnail,
            hasMainImage: !!targetProduct.main_image,
          },
        );

        // Try to get all images from multiple sources
        // Try to get all images from multiple sources
        // MERGE all sources to capture every possible image
        const allSources = [
          ...(targetProduct.images || []),
          ...(targetProduct.media || []),
          ...(targetProduct.image ? [targetProduct.image] : []),
        ];

        // LOG: Show raw images from Salla
        console.log(
          `[Storia] Raw images from Salla for product ${targetProduct.id}:`,
          {
            "targetProduct.images": targetProduct.images,
            "targetProduct.media": targetProduct.media,
            "targetProduct.image": targetProduct.image,
            mergedSources: allSources.length,
          },
        );

        const seenUrls = new Set();
        const media = allSources
          .map((img) => {
            // Handle different image formats
            const imgUrl =
              img?.url ||
              img?.src ||
              img?.path ||
              img?.original ||
              (typeof img === "string" ? img : null);

            if (!imgUrl) return null;

            // Deduplicate
            if (seenUrls.has(imgUrl)) return null;
            seenUrls.add(imgUrl);

            return {
              type: "image",
              src: imgUrl,
              alt: img.alt || targetProduct.name,
            };
          })
          .filter(Boolean); // Remove null entries

        // Ensure main image is present (check multiple fields)
        const mainImage =
          targetProduct.image?.url ||
          targetProduct.image?.src ||
          targetProduct.thumbnail?.url ||
          targetProduct.thumbnail?.src ||
          targetProduct.main_image ||
          targetProduct.featured_image;

        if (mainImage && !media.find((m) => m.src === mainImage)) {
          media.unshift({
            type: "image",
            src: mainImage,
            alt: targetProduct.name,
          });
        }

        console.log(
          `[Storia] Extracted ${media.length} images for product ${targetProduct.id}`,
        );

        // If no images, use logo
        if (media.length === 0) {
          console.warn(
            `[Storia] No images found for product ${targetProduct.id}, using logo fallback`,
          );
          media.push({ type: "image", src: "/assets/logo.png" });
        }

        // 5. Map Options (Sizes)
        let sizes = [];
        let sizeVariants = [];

        // Handle if options/variants are objects or arrays, even if nested in .details
        const findRawItems = (product, keys) => {
          for (const key of keys) {
            // Check top level, .details, AND .data (sometimes Salla wraps)
            const candidates = [
              product[key],
              product.details ? product.details[key] : null,
              product.data ? product.data[key] : null,
            ];

            for (let items of candidates) {
              if (
                items &&
                (Array.isArray(items)
                  ? items.length > 0
                  : Object.keys(items).length > 0)
              ) {
                return typeof items === "object" && !Array.isArray(items)
                  ? Object.values(items)
                  : items;
              }
            }
          }
          return [];
        };

        const rawOptions = findRawItems(targetProduct, ["options"]);
        const rawVariants = findRawItems(targetProduct, ["variants", "skus"]);

        // Try to find ANY option that looks like a size
        let sizeOption = rawOptions.find((opt) => {
          const name = translate(opt.name || opt.label || "").toLowerCase();
          return (
            name.includes("size") ||
            name.includes("مقاس") ||
            name.includes("قياس") ||
            name.includes("اللون")
          );
        });

        // Fallback: Use the first option that has values
        if (!sizeOption && rawOptions.length > 0) {
          sizeOption = rawOptions.find((opt) => {
            const vals =
              opt.values ||
              (opt.data && Array.isArray(opt.data) ? opt.data : null);
            return vals && vals.length > 0;
          });
        }

        if (sizeOption) {
          const vals =
            sizeOption.values ||
            (sizeOption.data && Array.isArray(sizeOption.data)
              ? sizeOption.data
              : []);
          sizes = vals.map((v) => translate(v.name || v.label).trim());
          sizeVariants = vals.map((v) => ({
            size: translate(v.name || v.label).trim(),
            price: v.price ? v.price.amount : amount,
            stock: v.quantity !== undefined ? v.quantity : 10,
            optionId: sizeOption.id,
            valueId: v.id,
            sallaVariantId: v.id,
          }));
        } else if (rawVariants && rawVariants.length > 0) {
          // Fallback to SKU variants
          sizeVariants = rawVariants.map((v) => ({
            size: translate(v.name || v.label || v.sku || "").trim(),
            price: v.price
              ? typeof v.price === "object"
                ? v.price.amount
                : v.price
              : amount,
            stock: v.quantity !== undefined ? v.quantity : 10,
            variantId: v.id,
            sallaVariantId: v.id,
          }));
          sizes = sizeVariants.map((v) => v.size).filter((s) => s);
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
          sizes: sizes, // CRITICAL: NO DEFAULT DUMMY SIZES
          sizeVariants: sizeVariants,
          description: description || "No description available",
          stock: targetProduct.quantity || 10,
          isNew: targetProduct.is_new || false,
          isPromoted: !!targetProduct.promotion,
          promotionTitle: targetProduct.promotion?.title,
          rating: 5.0,
          reviews: 0,
          rawSallaData: p,
        };

        // GLOBAL DEBUG: Attach to window for easy inspection
        if (typeof window !== "undefined") {
          if (!window.__STORIA_PRODUCTS__) window.__STORIA_PRODUCTS__ = {};
          window.__STORIA_PRODUCTS__[mappedProduct.id] = {
            mapped: mappedProduct,
            raw: targetProduct,
          };
        }

        if (
          mappedProduct.id == 1314742571 ||
          String(mappedProduct.id) === "1314742571"
        ) {
          console.log("[Storia DEBUG] Mapping Abaya 2 Final Check:", {
            rawOptions,
            rawVariants,
            sizeOption,
            sizeVariants,
            targetProduct,
          });
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

    const idToUse = options.sallaProductId || productId;
    const payload = {
      id: Number(idToUse),
      quantity: Number(quantity),
    };

    // Handle Variants vs Custom Options
    if (options.variantId) {
      payload.variant_id = options.variantId;
    }
    if (options.options) {
      payload.options = options.options;
    }

    // AUTO-FALLBACK: If product has required options but none provided, pick first available
    if (
      !payload.variant_id &&
      (!payload.options || Object.keys(payload.options).length === 0)
    ) {
      let prod =
        window.__STORIA_PRODUCTS__ && window.__STORIA_PRODUCTS__[productId];

      // JIT FETCH: If we still don't have variants, try a last-second detail fetch
      if (
        !prod ||
        !prod.mapped ||
        !prod.mapped.sizeVariants ||
        prod.mapped.sizeVariants.length === 0
      ) {
        console.warn(
          "[Storia] No variants found in registry. Attempting JIT fetch for product:",
          productId,
        );
        try {
          const sm = window.salla || this.salla;
          const pid = parseInt(String(productId).split("/")[0]) || productId;
          let rb = null;

          // SDK JIT
          if (sm && sm.api?.fetch) {
            const res = await sm.api
              .fetch("product.details", { id: pid })
              .catch(() => null);
            rb = res?.data || res?.product || (res?.id ? res : null);
          }

          // REST JIT
          if (!rb) {
            const paths = [
              `/api/v1/products/${pid}`,
              `/products/${pid}.json`,
            ].filter(Boolean);
            for (const u of paths) {
              const r = await fetch(u).catch(() => null);
              if (r && r.ok) {
                const d = await r.json();
                rb = d?.data || d?.product || d;
                if (rb) break;
              }
            }
          }

          if (rb) {
            // Temporary mapping for failsafe
            const rawOptions =
              (rb.options &&
                (Array.isArray(rb.options)
                  ? rb.options
                  : Object.values(rb.options))) ||
              [];

            // 1. Try Size Option
            let sizeOpt = rawOptions.find((o) => {
              const n = String(o.name || o.label || "").toLowerCase();
              return (
                n.includes("مقاس") || n.includes("size") || n.includes("قياس")
              );
            });

            // 2. Fallback to FIRST available option if ANY exist
            if (!sizeOpt && rawOptions.length > 0) {
              sizeOpt = rawOptions.find(
                (o) =>
                  o.values?.length > 0 || (o.data && Array.isArray(o.data)),
              );
            }

            if (sizeOpt) {
              const vals =
                sizeOpt.values ||
                (Array.isArray(sizeOpt.data) ? sizeOpt.data : []);
              if (vals.length > 0) {
                const first = vals[0];
                payload.options = { [sizeOpt.id]: first.id };
                console.log(
                  "[Storia] JIT Failsafe Success (Options):",
                  payload.options,
                );
              }
            } else if (rb.variants && rb.variants.length > 0) {
              payload.variant_id = rb.variants[0].id;
              console.log(
                "[Storia] JIT Failsafe Success (Variant):",
                payload.variant_id,
              );
            }
          }
        } catch (e) {
          console.error("[Storia] JIT Fetch failed", e);
        }
      }

      // Standard failsafe if JIT didn't set payload yet
      if (
        !payload.variant_id &&
        (!payload.options || Object.keys(payload.options).length === 0) &&
        prod?.mapped?.sizeVariants?.length > 0
      ) {
        const def = prod.mapped.sizeVariants[0];
        console.warn(
          "[Storia] Failsafe activated: No selection provided, using:",
          def,
        );
        if (def.variantId) {
          payload.variant_id = def.variantId;
        } else if (def.optionId && def.valueId) {
          payload.options = { [def.optionId]: def.valueId };
        }
      }
    }

    console.log(
      "[Storia] cart.addItem payload:",
      JSON.stringify(payload, null, 2),
    );

    let lastAttemptedPayload = payload;
    let diagnosis = "No repair attempted";
    const attemptAdd = async (currentPayload, isRetry = false) => {
      lastAttemptedPayload = currentPayload;
      try {
        console.log(
          `[Storia] Cart attempt (Retry: ${isRetry}):`,
          currentPayload,
        );
        const response = await this.salla.cart.addItem(currentPayload);
        return { success: true, data: response };
      } catch (error) {
        const statusCode = error.response?.status || error.status;
        const errorData = error.response?.data;
        const isValidation =
          statusCode == 422 ||
          statusCode == 400 ||
          JSON.stringify(errorData || {}).includes("invalid_fields");

        const isAbaya2 = Number(idToUse) === 1252773325;
        diagnosis = `Detected: status=${statusCode}, validation=${isValidation}, abaya2=${isAbaya2}, retry=${isRetry}`;

        if ((isValidation || isAbaya2) && !isRetry) {
          console.warn(
            `[Storia] ${statusCode} Trigger detected. Attempting Reconstruction (V38)...`,
          );

          try {
            const pid = Number(idToUse);
            const sm = window.salla || this.salla;
            let rb = null;
            let log = [];

            // 1. SDK Attempt
            log.push("SDK:Attempting...");
            if (sm.api?.fetch) {
              const res = await sm.api
                .fetch("product.details", { id: pid })
                .catch((e) => {
                  log.push(`SDK:Err=${e.message}`);
                  return null;
                });
              rb = res?.data || res?.product || (res?.id ? res : null);
              if (rb) log.push("SDK:Found!");
            }

            // 2. REST Attempt (Local Proxy)
            if (!rb) {
              log.push("REST:Attempting...");
              const r = await fetch(`/api/v1/products/${pid}`).catch((e) => {
                log.push(`REST:Err=${e.message}`);
                return null;
              });
              if (r && r.ok) {
                const d = await r.json();
                rb = d?.data || d?.product || d;
                log.push("REST:Found!");
              }
            }

            // 3. Direct Salla Attempt (V39 Addition)
            if (!rb) {
              log.push("Direct:Attempting...");
              // Public storefront endpoint
              const r = await fetch(
                `https://api.salla.dev/store/v1/products/${pid}`,
              ).catch((e) => {
                log.push(`Direct:Err=${e.message}`);
                return null;
              });
              if (r && r.ok) {
                const d = await r.json();
                rb = d?.data || d?.product || d;
                log.push("Direct:Found!");
              }
            }

            diagnosis = `Trigger: ${diagnosis}. Logic: ${log.join(" | ")}`;

            if (rb) {
              const pickedOptions = {};
              const ros =
                (rb.options &&
                  (Array.isArray(rb.options)
                    ? rb.options
                    : Object.values(rb.options))) ||
                [];
              const vs = rb.variants || [];
              diagnosis += ` | Found ${ros.length} opts, ${vs.length} vars.`;

              ros.forEach((opt) => {
                const vals =
                  opt.values || (Array.isArray(opt.data) ? opt.data : []);
                if (vals.length > 0) {
                  pickedOptions[Number(opt.id)] = Number(vals[0].id);
                } else if (opt.required) {
                  pickedOptions[Number(opt.id)] = "Auto-Filled";
                }
              });

              if (Object.keys(pickedOptions).length > 0) {
                const repairedPayload = {
                  id: pid,
                  quantity: Number(currentPayload.quantity),
                  options: pickedOptions,
                };
                diagnosis += " | Retrying with Options.";
                return await attemptAdd(repairedPayload, true);
              } else if (vs.length > 0) {
                const repairedPayload = {
                  id: pid,
                  quantity: Number(currentPayload.quantity),
                  variant_id: Number(vs[0].id),
                };
                diagnosis += " | Retrying with Variant.";
                return await attemptAdd(repairedPayload, true);
              } else {
                diagnosis += " | No actionable options found.";
              }
            } else {
              diagnosis += " | All fetches failed.";
            }
          } catch (repairErr) {
            diagnosis += ` | Fatal Error: ${repairErr.message}`;
            console.error("[Storia] Nuclear reconstruction failed:", repairErr);
          }
        }
        throw error; // Rethrow to main catch
      }
    };

    try {
      return await attemptAdd(payload);
    } catch (error) {
      console.error("[Storia] Error adding to Salla cart:", error);

      let errorMsg = error.message || "Failed to add to cart";

      try {
        const res = error.response;
        if (res && res.data) {
          const d = res.data;
          console.log("[Storia] Raw Salla error data:", d);

          const extract = (obj) => {
            if (!obj) return null;
            if (typeof obj === "string") return obj;
            if (Array.isArray(obj))
              return obj.map(extract).filter(Boolean).join(", ");
            if (typeof obj === "object") {
              if (obj.ar || obj.en) return obj.ar || obj.en;
              const fs = ["message", "error", "msg", "title"];
              for (const f of fs) {
                if (obj[f]) return extract(obj[f]);
              }
              if (obj.errors)
                return Object.values(obj.errors)
                  .flat()
                  .map(extract)
                  .filter(Boolean)
                  .join(", ");
              return JSON.stringify(obj);
            }
            return String(obj);
          };

          const sallaMsg = extract(d);
          if (sallaMsg) errorMsg = sallaMsg;
        }
      } catch (e) {
        console.warn("[Storia] Error parsing Salla error:", e);
      }

      return {
        success: false,
        error: errorMsg,
        debugPayload: lastAttemptedPayload,
        isRetry: lastAttemptedPayload !== payload,
        diagnosis: diagnosis,
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
