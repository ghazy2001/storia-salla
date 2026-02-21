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
      log("[Storia] Salla backend requested but SDK not available yet");
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
          const targetIds = []; // Removed invalid IDs
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
            const sm = window.salla || this.salla;
            const storeId = sm?.config?.store_id || "";
            const headers = { Accept: "application/json" };
            if (storeId) headers["Store-Identifier"] = storeId;

            const restRes = await fetch("/api/v1/products?per_page=100", {
              headers,
            });
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

    const getVal = (val) => {
      if (!val && val !== 0) return 0;
      if (typeof val === "number") return val;
      if (typeof val === "object" && val.amount !== undefined)
        return Number(val.amount);
      if (typeof val === "string") {
        // Strip currency symbols and commas, handle negative signs if any
        const num = parseFloat(val.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
      }
      return Number(val) || 0;
    };

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
              log(`📸 FOUND IMAGES at [${path}]: found ${obj.length} items`);
              log("   Sample:", first);
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
          log(
            `🔥 [Storia] Starting Deep Scan for images in product ${p.id}...`,
          );
          deepScanForImages(p);
          log(`🔥 [Storia] Deep Scan Complete.`);
          log(`🔥 [Storia] RAW SALLA PRODUCT (${p.id}):`, p);
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
            // Use parseInt to handle IDs like "123456/1"
            const pid = parseInt(String(p.id).split("/")[0]) || p.id;

            const isEnriched = (val) => {
              if (!val) return false;
              if (Array.isArray(val)) return val.length > 0;
              return Object.keys(val).length > 0;
            };

            let b = null;

            // METHOD 1: Robust SDK Call (Silent & Native)
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
                        log("SDK getDetails failed:", err);
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
                                log("SDK getDetails failed in onReady:", err);
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
                    } catch {
                      resolve(null);
                    }
                  }
                  // Timeout after 3 seconds
                  setTimeout(() => resolve(null), 3500);
                });
              } catch (e) {
                log("SDK Promise Wrapper failed", e);
              }
            }

            // METHOD 2: Live DOM Scraping (The Intelligent Fix) 🧠
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
                  // Sub-Strategy A1: Schema.org JSON-LD (The Gold Standard) 🏆
                  if (s.type === "application/ld+json") {
                    try {
                      const json = JSON.parse(s.textContent);
                      const productSchema = Array.isArray(json)
                        ? json.find((i) => i["@type"] === "Product")
                        : json["@type"] === "Product"
                          ? json
                          : null;

                      if (productSchema && productSchema.image) {
                        const images = Array.isArray(productSchema.image)
                          ? productSchema.image
                          : [productSchema.image];
                        if (images.length > 0) {
                          if (config.enableLogging)
                            log(`LD+JSON Schema found ${images.length} images`);
                          domImages.push(...images);
                        }
                      }
                    } catch {
                      /* ignore script read error */
                    }
                  }

                  // Sub-Strategy A2: Legacy unique string match
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
                    } catch {
                      // Silent ignore
                    }
                  }

                  // Sub-Strategy A3: Deep Regex Scan on ALL scripts (The "Magnet" Approach) 🧲
                  // Sometimes data is in a variable we don't know the name of.
                  // We just look for ANY array of images in any script.
                  try {
                    const content = s.textContent;
                    if (content.includes("cdn.salla.sa")) {
                      // Look for ANY string looking like a Salla Image URL
                      const urls = content.match(
                        /https:\/\/cdn\.salla\.sa\/[^\s"']+/g,
                      );
                      if (urls) domImages.push(...urls);
                    }
                  } catch {
                    /* ignore */
                  }
                });

                try {
                  const checkGlobals = () => {
                    const found = [];
                    // Check window.salla.config
                    if (window.salla?.config?.product?.images) {
                      found.push(
                        ...window.salla.config.product.images.map(
                          (i) => i.url || i,
                        ),
                      );
                    }
                    // Check global products array (common in themes)
                    if (window.products && Array.isArray(window.products)) {
                      const p = window.products.find((p) => p.id == pid);
                      if (p && p.images)
                        found.push(...p.images.map((i) => i.url || i));
                    }
                    return found;
                  };
                  domImages.push(...checkGlobals());
                } catch {
                  /* ignore */
                }

                // Strategy B: Scrape <img> tags & Meta Tags
                const scrapeDOM = () => {
                  const found = [];
                  // 1. Sliders & Images
                  const potentialSelectors = [
                    ".product-detials__slider img",
                    ".product-slider img",
                    ".swiper-slide img",
                    ".salla-product-card img",
                    '[data-fancybox="product-images"] img',
                    'img[src*="cdn.salla.sa"]',
                  ];
                  potentialSelectors.forEach((sel) => {
                    document.querySelectorAll(sel).forEach((img) => {
                      if (
                        img.src &&
                        img.src.includes("cdn.salla.sa") &&
                        !img.src.includes("avatar") &&
                        !img.src.includes("logo")
                      ) {
                        if (img.naturalWidth > 50 || !img.naturalWidth)
                          found.push(img.src);
                      }
                    });
                  });
                  // 2. Meta Tags
                  const metaSelectors = [
                    'meta[property="og:image"]',
                    'meta[name="twitter:image"]',
                    'link[rel="image_src"]',
                    'meta[itemprop="image"]',
                  ];
                  metaSelectors.forEach((sel) => {
                    document.querySelectorAll(sel).forEach((el) => {
                      const url = el.content || el.href;
                      if (url && url.includes("cdn.salla.sa")) found.push(url);
                    });
                  });
                  return found;
                };

                // Initial scrape
                domImages.push(...scrapeDOM());

                // Optional: Short delay retry if we found nothing (Lazy Load wait)
                if (domImages.length < 2) {
                  await new Promise((r) => setTimeout(r, 1500));
                  domImages.push(...scrapeDOM());
                  // Also re-run regex on any NEWLY loaded scripts
                  document.querySelectorAll("script").forEach((s) => {
                    const content = s.textContent;
                    if (content.includes("cdn.salla.sa")) {
                      const urls = content.match(
                        /https:\/\/cdn\.salla\.sa\/[^\s"']+/g,
                      );
                      if (urls) domImages.push(...urls);
                    }
                  });
                }

                if (domImages.length > 0) {
                  const uniqueDomImages = [...new Set(domImages)].map(
                    (url) => ({ type: "image", src: url }),
                  );
                  // Only use if we found valid images
                  if (uniqueDomImages.length > 0) {
                    if (config.enableLogging)
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
              } catch {
                log(`DOM Scraping failed`);
              }
            }

            // METHOD 3: Storefront Public AJAX API (Most Reliable for Images but causes 400s)
            // Moved to LAST resort to avoid 400 errors for invalid IDs
            if (!b) {
              try {
                if (config.enableLogging)
                  log(`Attempting Method 3 (Storefront API) for ${pid}...`);
                // PROD FIX: Use the full Salla Storefront URL, not local proxy
                const r = await fetch(
                  `https://api.salla.dev/store/v1/products/${pid}`,
                ).catch(() => null);
                if (r && r.ok) {
                  const d = await r.json();
                  b = d.data || d.product || d;
                  if (config.enableLogging) log(`Method 3 Success!`, b);
                } else {
                  log(`Method 3 Fetch Stats:`, r ? r.status : "Network Error");
                }
              } catch (e) {
                log(`Method 3 failed: ${e.message}`);
              }
            }

            if (b) {
              if (config.enableLogging) log(`SDK enrichment for ${pid}`, b);

              // CRITICAL FIX: Unwrap 'data' if Salla returns { status: 200, data: { ... } }
              const richData = b.data || b;

              // Update name from enriched data (bulk fetch often returns stale names)
              const enrichedName = translate(richData.name);
              if (enrichedName && enrichedName.length > 0) {
                targetProduct.name = enrichedName;
              }
              if (isEnriched(richData.options))
                targetProduct.options = richData.options;
              if (isEnriched(richData.variants))
                targetProduct.variants = richData.variants;
              if (isEnriched(richData.skus)) targetProduct.skus = richData.skus;
              if (isEnriched(richData.images))
                targetProduct.images = richData.images;
              if (isEnriched(richData.media))
                targetProduct.media = richData.media; // Capture media as well
              if (isEnriched(richData.urls)) targetProduct.urls = richData.urls; // Capture URLs just in case
              if (getDesc(richData)) description = getDesc(richData);

              // CRITICAL FIX: Copy Price Fields from Enriched Data
              // The listing product often lacks 'regular_price', but the detailed API has it.
              if (richData.regular_price !== undefined)
                targetProduct.regular_price = richData.regular_price;
              if (richData.sale_price !== undefined)
                targetProduct.sale_price = richData.sale_price;
              if (richData.price !== undefined)
                targetProduct.price = richData.price;
              if (richData.promotion !== undefined)
                targetProduct.promotion = richData.promotion;
              if (richData.is_on_sale !== undefined)
                targetProduct.is_on_sale = richData.is_on_sale;
            }
          } catch (err) {
            log("[Storia] Detail fetch error:", p.id, err.message);
          }
        }

        // 3. Map Price & Sale Info
        let amount = 0;
        let currency = "SAR";
        let regularPrice = 0;
        let salePrice = null;
        let isOnSale = false;
        let priceStr = "";

        amount = getVal(targetProduct.price);
        regularPrice = amount; // Default assumption

        // Case A: Salla returns `regular_price` separately (Common in some endpoints)
        if (targetProduct.regular_price) {
          const rawRegular = getVal(targetProduct.regular_price);
          if (rawRegular > amount) {
            regularPrice = rawRegular;
            salePrice = amount;
            isOnSale = true;
          }
        }

        // Case B: `sale_price` field is explicit (Overrides if present and valid)
        if (!isOnSale && targetProduct.sale_price) {
          const rawSale = getVal(targetProduct.sale_price);
          if (rawSale > 0 && rawSale < regularPrice) {
            salePrice = rawSale;
            isOnSale = true;
          }
        }

        // Case C: Promotion object
        if (!isOnSale && targetProduct.promotion) {
          // Check for explicit promotion price
          if (targetProduct.promotion.price) {
            const rawPromo = getVal(targetProduct.promotion.price);
            if (rawPromo > 0 && rawPromo < regularPrice) {
              salePrice = rawPromo;
              isOnSale = true;
            }
          }

          // Fallback: If we still don't have a regular price but we have a "saving amount"
          // Salla sometimes sends { amount: 175, ... } as the DISCOUNT AMOUNT in the promotion object
          if (!isOnSale && targetProduct.promotion.amount) {
            const savingAmount = getVal(targetProduct.promotion.amount);
            if (savingAmount > 0) {
              // If we have a saving, then Regular = Current + Saving
              // But wait, 'amount' (current price) is the Sale Price in this context?
              // Usually 'price' is the final price.
              salePrice = amount;
              regularPrice = amount + savingAmount;
              isOnSale = true;
              console.log(
                "[Storia] Derived regular price from promotion saving:",
                regularPrice,
              );
            }
          }
        }

        // Case D: Ensure currency is set correctly from any available source
        if (
          typeof targetProduct.price === "object" &&
          targetProduct.price.currency
        ) {
          currency = targetProduct.price.currency;
        } else if (targetProduct.currency) {
          currency = targetProduct.currency;
        }

        // Format helper
        const formatPrice = (p) => {
          if (!p) return "";
          return currency === "SAR" || currency === "RS" || currency === "ر.س"
            ? `${p} ر.س`
            : `${p} ${currency}`;
        };

        priceStr = formatPrice(isOnSale ? salePrice : regularPrice);
        const regularPriceStr = formatPrice(regularPrice);

        // 4. Map Images (Enhanced with Multiple Fallbacks)
        log(`[Storia] Mapping images for product ${targetProduct.id}:`, {
          hasImages: !!targetProduct.images,
          imagesLength: targetProduct.images?.length || 0,
          hasImage: !!targetProduct.image,
          hasThumbnail: !!targetProduct.thumbnail,
          hasMainImage: !!targetProduct.main_image,
        });

        // Try to get all images from multiple sources
        // Try to get all images from multiple sources
        // MERGE all sources to capture every possible image
        const allSources = [
          ...(targetProduct.images || []),
          ...(targetProduct.media || []),
          ...(targetProduct.image ? [targetProduct.image] : []),
        ];

        // LOG: Show raw images from Salla
        log(`[Storia] Raw images from Salla for product ${targetProduct.id}:`, {
          "targetProduct.images": targetProduct.images,
          "targetProduct.media": targetProduct.media,
          "targetProduct.image": targetProduct.image,
          mergedSources: allSources.length,
        });

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

        log(
          `[Storia] Extracted ${media.length} images for product ${targetProduct.id}`,
        );

        // If no images, use logo
        if (media.length === 0) {
          log(
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
        // 🔍 V18 Ultra Mapping: Find size option with fallback
        let sizeOption = rawOptions.find((opt) => {
          const name = translate(opt.name || opt.label || "").toLowerCase();
          return (
            name.includes("size") ||
            name.includes("مقاس") ||
            name.includes("قياس") ||
            name.includes("القياس") ||
            name.includes("اللون")
          );
        });

        // 🛡️ Fallback: If no standard name found, take the first option that has values
        if (!sizeOption && rawOptions.length > 0) {
          sizeOption = rawOptions.find(
            (opt) =>
              (opt.values && opt.values.length > 0) ||
              (opt.data && opt.data.length > 0),
          );
          if (sizeOption)
            log(
              `[Storia] No standard size name found, falling back to option: ${translate(sizeOption.name || sizeOption.label)}`,
            );
        }

        // Fallback: Use the first option that has values
        if (!sizeOption && rawOptions.length > 0) {
          sizeOption = rawOptions.find((opt) => {
            const vals =
              opt.values ||
              (opt.data && Array.isArray(opt.data) ? opt.data : null);
            return vals && vals.length > 0;
          });
        }

        // Helper to map variant price logic
        const mapVariant = (v) => {
          const vPrice = getVal(v.price) || amount;
          let vRegularPrice = vPrice;
          let vSalePrice = null;
          let vIsOnSale = false;

          // Check regular price
          if (v.regular_price) {
            const rawReg = getVal(v.regular_price);
            if (rawReg > vPrice) {
              vRegularPrice = rawReg;
              vSalePrice = vPrice;
              vIsOnSale = true;
            }
          }

          // Check sale price
          if (!vIsOnSale && v.sale_price) {
            const rawSale = getVal(v.sale_price);
            if (rawSale > 0 && rawSale < vRegularPrice) {
              vSalePrice = rawSale;
              vIsOnSale = true;
            }
          }

          // Check promotion
          if (!vIsOnSale && v.promotion && v.promotion.price) {
            const rawPromo = getVal(v.promotion.price);
            if (rawPromo > 0 && rawPromo < vRegularPrice) {
              vSalePrice = rawPromo;
              vIsOnSale = true;
            }
          }

          // INHERITANCE FIX: If main product is on sale and this variant
          // matches the effective sale price, but hasn't explicitly set isOnSale
          if (!vIsOnSale && isOnSale && Math.abs(vPrice - salePrice) < 0.1) {
            vRegularPrice = regularPrice;
            vSalePrice = vPrice;
            vIsOnSale = true;
          }

          return {
            size: translate(v.name || v.label || v.sku || "").trim(),
            price: vPrice, // This is the "effective" price
            regularPrice: vRegularPrice,
            salePrice: vSalePrice,
            isOnSale: vIsOnSale,
            stock: v.quantity !== undefined ? Number(v.quantity) : -1,
            isOutOfStock:
              v.is_out_of_stock ??
              (v.quantity !== undefined && Number(v.quantity) === 0),
            optionId: sizeOption ? sizeOption.id : null,
            valueId: v.id,
            variantId: v.id,
            sallaVariantId: v.id,
          };
        };

        if (sizeOption) {
          const vals =
            sizeOption.values ||
            (sizeOption.data && Array.isArray(sizeOption.data)
              ? sizeOption.data
              : []);
          sizes = vals.map((v) => translate(v.name || v.label).trim());
          sizeVariants = vals.map(mapVariant);
        } else if (rawVariants && rawVariants.length > 0) {
          sizeVariants = rawVariants.map(mapVariant);
          sizes = sizeVariants.map((v) => v.size).filter((s) => s);
        }

        // CRITICAL FIX: If main product didn't have sale info, but variants DO, lift it up.
        // Salla API often gives "price": 405 (sale price) on main object but hides "regular_price" in variants.
        if (!isOnSale && sizeVariants.length > 0) {
          // Try to find a variant that matches the main current price
          const matchingVariant =
            sizeVariants.find((v) => Math.abs(v.price - amount) < 0.1) ||
            sizeVariants[0];

          if (matchingVariant && matchingVariant.isOnSale) {
            log(
              `[Storia] Found sale info in variant, updating main product:`,
              matchingVariant,
            );
            regularPrice = matchingVariant.regularPrice;
            salePrice = matchingVariant.salePrice;
            isOnSale = true;

            // Update format strings
            priceStr = formatPrice(salePrice);
          }
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
          slug: targetProduct.slug || "",
          url: targetProduct.urls?.customer || targetProduct.url || "",
          image: mainImage || "/assets/logo.png",
          media: media,
          price: priceStr,
          regularPrice: regularPriceStr,
          salePrice: isOnSale ? formatPrice(salePrice) : null,
          rawPrice: amount,
          rawRegularPrice: regularPrice,
          rawSalePrice: salePrice,
          isOnSale: isOnSale,
          currency: currency,
          category: categoryName,
          sizes: sizes, // CRITICAL: NO DEFAULT DUMMY SIZES
          sizeVariants: sizeVariants,
          description: description || "No description available",
          sku: targetProduct.sku,
          quantity:
            targetProduct.quantity !== undefined
              ? Number(targetProduct.quantity)
              : 10,
          isOutOfStock:
            targetProduct.is_out_of_stock ??
            (targetProduct.quantity !== undefined &&
              Number(targetProduct.quantity) === 0),
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
          log("[Storia DEBUG] Mapping Abaya 2 Final Check:", {
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
   * Fetch detailed product data (with sizes/options) for a single product
   * Uses multiple strategies and maps through _processSallaProducts
   * @param {number|string} sallaProductId - Salla product ID
   * @returns {object|null} Fully mapped product with sizes, variants, prices
   */
  async getProductDetails(sallaProductId) {
    log(`[Storia] getProductDetails(${sallaProductId}) starting...`);
    let rawProduct = null;

    // STRATEGY 1: Direct REST API (most reliable for full product data with options)
    try {
      const sm = window.salla || this.salla;
      const storeId = sm?.config?.store_id || "";
      const headers = { Accept: "application/json" };
      if (storeId) headers["Store-Identifier"] = storeId;

      const restUrls = [
        `/api/v1/products/${sallaProductId}`,
        `/products/${sallaProductId}.json`,
      ];

      for (const url of restUrls) {
        try {
          log(`[Storia] V18 Fidelity: Trying REST: ${url}`);
          const res = await fetch(url, { headers });
          if (res.ok) {
            const json = await res.json();
            rawProduct = json.data || json.product || (json.id ? json : null);
            if (rawProduct) {
              log(`[Storia] V18 Success from ${url}:`, {
                hasOptions: !!rawProduct.options?.length,
                hasVariants: !!(
                  rawProduct.variants?.length || rawProduct.skus?.length
                ),
              });
              break;
            }
          }
        } catch (e) {
          log(`[Storia] REST ${url} failed:`, e.message);
        }
      }
    } catch (e) {
      log("[Storia] REST strategy failed:", e);
    }

    // STRATEGY 2: SDK product.get() (may not have options but worth trying)
    if (!rawProduct && this.isAvailable()) {
      try {
        const productManager =
          this.salla.product ||
          (this.salla.api ? this.salla.api.product : null);

        if (productManager) {
          if (typeof productManager.get === "function") {
            try {
              const res = await productManager.get(sallaProductId);
              rawProduct = res?.data || (res?.id ? res : null);
              if (rawProduct) log("[Storia] SDK product.get() success");
            } catch (e) {
              log("[Storia] SDK product.get() failed:", e.message);
            }
          }

          if (!rawProduct && typeof productManager.fetch === "function") {
            try {
              const res = await productManager.fetch({ id: sallaProductId });
              if (res?.data) {
                rawProduct = Array.isArray(res.data) ? res.data[0] : res.data;
                if (rawProduct) log("[Storia] SDK product.fetch({id}) success");
              }
            } catch (e) {
              log("[Storia] SDK product.fetch({id}) failed:", e.message);
            }
          }
        }
      } catch (e) {
        log("[Storia] SDK strategy failed:", e);
      }
    }

    // STRATEGY 3: Check __STORIA_PRODUCTS__ cache
    if (!rawProduct) {
      const cached = window.__STORIA_PRODUCTS__?.[sallaProductId];
      if (cached?.raw) {
        rawProduct = cached.raw;
        log("[Storia] Using cached raw product data");
      }
    }

    if (!rawProduct) {
      log(`[Storia] Could not fetch product ${sallaProductId} from any source`);
      return null;
    }

    // Use existing mapping logic
    try {
      const mapped = await this._processSallaProducts([rawProduct]);
      if (mapped && mapped.length > 0) {
        log(`[Storia] getProductDetails(${sallaProductId}) FINAL:`, {
          sizes: mapped[0].sizes,
          sizeVariantsCount: mapped[0].sizeVariants?.length,
          isOnSale: mapped[0].isOnSale,
          regularPrice: mapped[0].regularPrice,
          salePrice: mapped[0].salePrice,
        });
        return mapped[0];
      }
    } catch (e) {
      log("[Storia] _processSallaProducts mapping failed:", e);
    }

    return null;
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

    // AUTO-FALLBACK: If product has    // V15: The Silent Way 🔇
    // No background fetches, no JIT loops, no network noise.
    // If data is missing, the Native Handover will handle it.

    // Final failsafe for basic numeric payload
    if (
      !payload.variant_id &&
      (!payload.options || Object.keys(payload.options).length === 0)
    ) {
      let prod =
        window.__STORIA_PRODUCTS__ && window.__STORIA_PRODUCTS__[productId];
      if (prod?.mapped?.sizeVariants?.length > 0) {
        const def = prod.mapped.sizeVariants[0];
        if (def.variantId) {
          payload.variant_id = def.variantId;
        } else if (def.optionId && def.valueId) {
          payload.options = { [def.optionId]: def.valueId };
        }
      }
    }

    log("[Storia] cart.addItem payload:", JSON.stringify(payload, null, 2));

    const attemptAdd = async (currentPayload) => {
      try {
        log(`[Storia] Cart attempt:`, currentPayload);
        const response = await this.salla.cart.addItem(currentPayload);
        return { success: true, data: response };
      } catch (error) {
        const statusCode = error.response?.status || error.status;

        // V14: The Natural Handover 🌿
        if (statusCode === 422 || statusCode === 400) {
          log(
            `[Storia] Salla requires validation (${statusCode}). Signaling Native Handover.`,
          );
          const cleanError = new Error("Validation Required");
          cleanError.isValidation = true;
          cleanError.statusCode = statusCode;
          throw cleanError;
        }

        throw error;
      }
    };

    try {
      return await attemptAdd(payload);
    } catch (error) {
      if (error.isValidation) {
        return {
          success: false,
          isValidation: true,
          error: "الرجاء اختيار الخيارات المطلوبة",
        };
      }

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
      log("[Storia] Salla SDK not available, cannot navigate to checkout");
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
        log("[Storia] Salla SDK customer.fetch internal error:", error);
      }
      return null;
    }
  }

  /**
   * Create a new product in custom backend
   */
  async createProduct(productData) {
    if (this.isLocalForced) {
      log("[Storia Service] Mock Create Product:", productData);
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
      log("[Storia Service] Mock Update Product:", id, productData);
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
      log("[Storia Service] Mock Delete Product:", id);
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
