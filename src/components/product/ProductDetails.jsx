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
    // Determine the real Salla ID
    const sallaId = product?.sallaProductId || product?.id;

    if (product && !product.regularPrice && sallaId) {
      console.log(
        `[Storia] Nuclear Fetch: Product ${sallaId} missing regular price, fetching...`,
      );

      const fetchDetails = async () => {
        try {
          if (window.salla && window.salla.api && window.salla.api.product) {
            const res = await window.salla.api.product
              .getDetails(sallaId)
              .catch(() => null);

            if (res && res.data) {
              const d = res.data;
              console.log(
                "[Storia] DEBUG: Raw SDK Object Keys:",
                Object.keys(d),
              );

              // RECURSIVE SCANNER: Find any array that looks like options or variants
              const findArrays = (obj, depth = 0) => {
                let found = { options: [], variants: [] };
                if (!obj || depth > 4) return found;

                Object.entries(obj).forEach(([key, val]) => {
                  if (Array.isArray(val) && val.length > 0) {
                    const k = key.toLowerCase();
                    const first = val[0];
                    const isOpt =
                      k.includes("opt") ||
                      (first.name && (first.values || first.data));
                    const isVar =
                      k.includes("var") ||
                      k.includes("sku") ||
                      first.sku ||
                      first.price;

                    if (isOpt) found.options.push(...val);
                    if (isVar) found.variants.push(...val);
                  } else if (val && typeof val === "object") {
                    const inner = findArrays(val, depth + 1);
                    found.options.push(...inner.options);
                    found.variants.push(...inner.variants);
                  }
                });
                return found;
              };

              const discovery = findArrays(d);
              if (discovery.options.length > 0)
                console.log(
                  `[Storia] DISCOVERY: Found ${discovery.options.length} potential options via scan.`,
                );
              if (discovery.variants.length > 0)
                console.log(
                  `[Storia] DISCOVERY: Found ${discovery.variants.length} potential variants via scan.`,
                );

              const rawOptions = d.options || discovery.options || [];
              const rawVariants =
                d.variants || d.skus || discovery.variants || [];

              if (
                d.regular_price ||
                rawOptions.length > 0 ||
                rawVariants.length > 0
              ) {
                const regPrice = Number(d.regular_price || d.price);
                const curPrice = Number(d.price);

                // DATA HEALING: Extract options and variants
                let enrichedSizes = product.sizes;
                let enrichedVariants = product.sizeVariants;

                if (!enrichedVariants || enrichedVariants.length === 0) {
                  console.log(
                    `[Storia] Healing Mode: Found ${rawOptions.length} options, ${rawVariants.length} variants`,
                  );

                  // Aggressive Size Search
                  const sizeOpt = rawOptions.find((o) => {
                    const n = String(o.name || o.label || "").toLowerCase();
                    return (
                      n.includes("مقاس") ||
                      n.includes("size") ||
                      n.includes("قياس") ||
                      n.includes("القياس") ||
                      n.includes("النوع")
                    );
                  });

                  if (sizeOpt) {
                    const vals =
                      sizeOpt.values ||
                      (Array.isArray(sizeOpt.data) ? sizeOpt.data : []);
                    console.log(
                      `[Storia] Discovery Success: ${sizeOpt.name} (${vals.length} values)`,
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
                      "[Storia] Mapping generic variants from discover.",
                    );
                    enrichedVariants = rawVariants.map((v) => ({
                      size: (v.name || v.label || v.sku || "").trim(),
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
                  // Just update prices for existing variants
                  enrichedVariants = product.sizeVariants.map((v) => {
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
                  sizes: enrichedSizes || product.sizes,
                  sizeVariants: enrichedVariants || product.sizeVariants,
                });
              }
            }
          }
        } catch (e) {
          console.error("[Storia] Nuclear Fetch Error:", e);
        }
      };

      // Increased delay to ensure SDK stability
      setTimeout(fetchDetails, 1500);
    }
  }, [product]);

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
    await addToCartWithSync({ ...workingProduct, price }, 1, syncData);
    setShowToast(true);
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
