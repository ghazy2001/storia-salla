import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectProducts } from "../../store/slices/productSlice";
import { selectTheme } from "../../store/slices/uiSlice";
import { useAddToCart } from "../../hooks/useCart";
import Toast from "../common/Toast";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const products = useSelector(selectProducts);
  const theme = useSelector(selectTheme);

  const product = products.find((p) => {
    const pId = String(p._id || p.id);
    const targetId = String(productId);
    return pId === targetId;
  });

  const [activeMedia, setActiveMedia] = useState(0);
  const [showToast, setShowToast] = useState(false);
  // Initialize selected size state
  const [selectedSize, setSelectedSize] = useState(() =>
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "",
  );

  // Reset selected size when product changes or sizes are enriched
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      // Only update if different to avoid loops
      if (selectedSize !== product.sizes[0]) {
        setSelectedSize(product.sizes[0]);
      }
    } else if (selectedSize !== "") {
      setSelectedSize("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, product?.sizes]);

  // CLIENT-SIDE PRICE FETCH (The "Nuclear" Option)
  // If regular price is missing, directly ask Salla API from the browser
  const [enrichedPriceInfo, setEnrichedPriceInfo] = useState(null);

  useEffect(() => {
    const sallaId = product?.sallaProductId || product?.id;

    // Upfront Discovery: Run if price is missing OR if sizes/variants are missing
    const needsEnrichment =
      product &&
      (!product.regularPrice || !product.sizes || product.sizes.length === 0);

    if (needsEnrichment && sallaId) {
      console.log(
        `[Storia] Upfront Discovery: Product ${sallaId} needs data enrichment.`,
      );

      const fetchDetails = async () => {
        try {
          if (window.salla && window.salla.api && window.salla.api.product) {
            // 1. CONSOLE HIJACKER: Native Salla scripts often log the full product object. Intercept them.
            const hijackConsole = () => {
              const originalLog = console.log;
              console.log = (...args) => {
                args.forEach((arg) => {
                  if (
                    arg &&
                    typeof arg === "object" &&
                    arg.id == sallaId &&
                    (arg.options || arg.variants || arg.skus)
                  ) {
                    console.warn("[Storia] Hijacker Captured Native Data!");
                    processDiscovery(arg);
                  }
                });
                originalLog.apply(console, args);
              };
              // Keep hijacker active for a bit
              setTimeout(() => {
                console.log = originalLog;
              }, 5000);
            };
            hijackConsole();

            const res = await window.salla.api.product
              .getDetails(sallaId)
              .catch(() => null);

            let d = res?.data;

            // HELPER: Recursive Searcher (V9)
            const probe = (item) => {
              if (!item || typeof item !== "object") return null;
              if (item.id == sallaId && (item.options || item.variants))
                return item;
              for (let k in item) {
                if (item[k] && typeof item[k] === "object" && k !== "parent") {
                  const found = probe(item[k]);
                  if (found) return found;
                }
              }
              return null;
            };

            // 1. LIVE DOM SNIFFER (V9): Search the current page without a network fetch
            const liveProbe = (text) => {
              if (!text) return null;
              const scripts =
                text.match(/<script.*?>([\s\S]*?)<\/script>/gi) || [];
              for (let s of scripts) {
                const content = s
                  .replace(/<script.*?>/i, "")
                  .replace(/<\/script>/i, "")
                  .trim();
                try {
                  const jsonMatch = content.match(/{[\s\S]*?}/);
                  if (jsonMatch) {
                    const found = probe(JSON.parse(jsonMatch[0]));
                    if (found) return found;
                  }
                } catch {
                  /* ignore */
                }
              }
              const attrMatch =
                text.match(/data-product=["']({.*?})["']/i) ||
                text.match(/data-product-data=["']({.*?})["']/i);
              if (attrMatch) {
                try {
                  const unescaped = attrMatch[1]
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, "&");
                  const parsed = JSON.parse(unescaped);
                  if (parsed && parsed.id == sallaId) return parsed;
                } catch {
                  /* ignore */
                }
              }
              return null;
            };

            // Immediate Check - Best for SPA
            const immediate = liveProbe(document.documentElement.outerHTML);
            if (immediate) {
              console.warn("[Storia] V9: Live DOM Sniffer SUCCESS!");
              processDiscovery(immediate);
              return;
            }

            // 2. JIT SLUG FETCHER (V8 Surgeon): Probing HTML for hidden attributes and scripts
            const jitSlugFetch = async () => {
              const url = product.url || product.slug || `/p/${sallaId}`;
              console.log(`[Storia] V8: JIT Surgeon Probing ${url}...`);
              const storeId = window.salla?.config?.store_id || "";
              const res = await fetch(url, {
                headers: { "Store-Identifier": storeId },
              }).catch(() => null);
              if (res && res.ok) {
                const text = await res.text();
                const found = liveProbe(text);
                if (found) {
                  console.warn("[Storia] V8: JIT Scraper SUCCESS!");
                  processDiscovery(found);
                  return true;
                }
              }
              return false;
            };
            jitSlugFetch();

            const processDiscovery = (discoveryData) => {
              if (!discoveryData) return;
              if (
                discoveryData.regular_price ||
                discoveryData.options ||
                discoveryData.variants ||
                discoveryData.skus
              ) {
                console.log(
                  "[Storia] DEBUG: Discovery Object Keys:",
                  Object.keys(discoveryData),
                );

                const scavenge = (obj, depth = 0) => {
                  let found = { options: [], variants: [] };
                  if (!obj || depth > 10) return found;

                  Object.values(obj).forEach((val) => {
                    if (Array.isArray(val) && val.length > 0) {
                      const first = val[0];
                      if (typeof first !== "object" || first === null) return;

                      const isOption =
                        first.id &&
                        (first.name || first.label) &&
                        (first.values ||
                          first.data ||
                          Array.isArray(first.data));
                      const isVariant =
                        first.id && (first.sku || first.price || first.sku_id);

                      if (isOption) found.options.push(...val);
                      if (isVariant) found.variants.push(...val);
                    } else if (val && typeof val === "object" && val !== null) {
                      const inner = scavenge(val, depth + 1);
                      found.options.push(...inner.options);
                      found.variants.push(...inner.variants);
                    }
                  });
                  return found;
                };

                const discovery = scavenge(discoveryData);
                const rawOptions =
                  discoveryData.options || discovery.options || [];
                const rawVariants =
                  discoveryData.variants ||
                  discoveryData.skus ||
                  discovery.variants ||
                  [];

                if (
                  discoveryData.regular_price ||
                  rawOptions.length > 0 ||
                  rawVariants.length > 0
                ) {
                  const regPrice = Number(
                    discoveryData.regular_price || discoveryData.price,
                  );
                  const curPrice = Number(discoveryData.price);

                  let enrichedSizes = product.sizes || [];
                  let enrichedVariants = product.sizeVariants || [];

                  if (!enrichedVariants || enrichedVariants.length === 0) {
                    console.log(
                      `[Storia] Healing Mode: Finding sizes in discovery sets...`,
                    );
                    const sizeOpt = rawOptions.find((o) => {
                      const n = String(o.name || o.label || "").toLowerCase();
                      return (
                        n.includes("مقاس") ||
                        n.includes("size") ||
                        n.includes("قياس") ||
                        n.includes("القياس") ||
                        n.includes("النوع") ||
                        n.includes("الطول")
                      );
                    });

                    if (sizeOpt) {
                      const vals =
                        sizeOpt.values ||
                        (Array.isArray(sizeOpt.data) ? sizeOpt.data : []);
                      console.log(
                        `[Storia] HEAL SUCCESS: Unlocked Option "${sizeOpt.name}" (${vals.length} values).`,
                      );
                      enrichedSizes = vals.map((v) =>
                        (v.name || v.label || "").trim(),
                      );
                      enrichedVariants = vals.map((v) => ({
                        size: (v.name || v.label || "").trim(),
                        price: Number(v.price || curPrice),
                        regularPrice: Number(
                          v.regular_price || v.price || regPrice || curPrice,
                        ),
                        isOnSale: true,
                        variantId: v.id,
                        optionId: sizeOpt.id,
                        valueId: v.id,
                      }));
                    } else if (rawVariants.length > 0) {
                      console.log(
                        "[Storia] ARCHEOLOGY: Attempting direct variant mapping.",
                      );
                      enrichedVariants = rawVariants.map((v) => ({
                        size:
                          (v.name || v.label || v.sku || "").trim() ||
                          "Default",
                        price: Number(v.price || curPrice),
                        regularPrice: Number(
                          v.regular_price || v.price || regPrice || curPrice,
                        ),
                        isOnSale: true,
                        variantId: v.id,
                      }));
                      enrichedSizes = enrichedVariants
                        .map((v) => v.size)
                        .filter(Boolean);
                    }
                  } else {
                    enrichedVariants = (product.sizeVariants || []).map((v) => {
                      if (Math.abs(Number(v.price) - curPrice) < 0.1) {
                        return {
                          ...v,
                          regularPrice: regPrice,
                          salePrice: curPrice,
                          isOnSale: true,
                        };
                      }
                      return v;
                    });
                  }

                  setEnrichedPriceInfo({
                    regularPrice: regPrice,
                    salePrice: curPrice,
                    isOnSale: true,
                    sizes: enrichedSizes,
                    sizeVariants: enrichedVariants,
                  });
                }
              }
            };
            // Run initial discovery with fetched/existing data
            processDiscovery(d);
          }
        } catch (e) {
          console.error("[Storia] Discovery Error:", e);
        }
      };

      // Faster initial trigger
      setTimeout(fetchDetails, 500);
    }
  }, [product?.id, product?.sizes, setEnrichedPriceInfo, product]);

  // Merge enriched info if available
  const displayProduct = enrichedPriceInfo
    ? { ...product, ...enrichedPriceInfo }
    : product;

  const { addToCart: addToCartWithSync } = useAddToCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center animate-pulse">
          <p className="text-lg opacity-60">جارٍ تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-[2rem] shadow-xl">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <p className="opacity-60 mb-8">
            عذراً، لم نتمكن من العثور على المنتج المطلوب. قد يكون تم حذفه أو
            تغييره.
          </p>
          <button
            onClick={() => navigate("/store")}
            className="w-full px-8 py-4 bg-brand-gold text-white rounded-full font-bold hover:bg-black transition-colors"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    // USE ENRICHED DATA
    const workingProduct = displayProduct;

    if (
      !selectedSize &&
      workingProduct.sizes &&
      workingProduct.sizes.length > 0
    ) {
      alert("الرجاء اختيار المقاس");
      return;
    }

    // Check Stock
    if (selectedSize && workingProduct.sizeVariants?.length > 0) {
      const variant = workingProduct.sizeVariants.find(
        (v) => v.size === selectedSize,
      );
      if (variant && variant.isOutOfStock) {
        alert("عذراً، هذا المقاس نفذت كميته");
        return;
      }
    } else if (workingProduct.isOutOfStock) {
      alert("عذراً، هذا المنتج نفذت كميته");
      return;
    }

    // Get price and options for selected size if available
    let price = workingProduct.price;
    let syncData = {
      sallaProductId: workingProduct.sallaProductId || workingProduct.id,
    };

    if (selectedSize && workingProduct.sizeVariants?.length > 0) {
      const variant = workingProduct.sizeVariants.find(
        (v) => String(v.size).trim() === String(selectedSize).trim(),
      );
      if (variant) {
        price = variant.price;
        // Priority 1: Variant ID
        if (variant.variantId || variant.sallaVariantId) {
          syncData.variantId = variant.variantId || variant.sallaVariantId;
        }
        // Priority 2: Custom Options
        else if (variant.optionId && variant.valueId) {
          syncData.options = { [variant.optionId]: variant.valueId };
        }
      }
    }

    // Sync with Salla backend
    const result = await addToCartWithSync(
      { ...workingProduct, price },
      1,
      syncData,
    );
    if (result && result.success) {
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-charcoal pt-24 pb-12">
      <Toast
        message="تمت إضافة المنتج إلى السلة بنجاح"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        theme={theme}
        action={{
          label: "عرض السلة >>",
          onClick: () => (window.location.href = "/cart"),
        }}
      />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Gallery Section */}
        <ProductGallery
          product={displayProduct}
          activeMedia={activeMedia}
          setActiveMedia={setActiveMedia}
        />

        {/* Product Info */}
        <ProductInfo
          product={displayProduct}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          handleAddToCart={handleAddToCart}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
