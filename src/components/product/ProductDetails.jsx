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

  const [enrichedPriceInfo, setEnrichedPriceInfo] = useState(null);
  const { addToCart } = useAddToCart();

  const displayProduct = enrichedPriceInfo
    ? { ...product, ...enrichedPriceInfo }
    : product;

  // Reset selected size when product changes or sizes are enriched
  useEffect(() => {
    if (displayProduct?.sizes && displayProduct.sizes.length > 0) {
      if (selectedSize !== displayProduct.sizes[0]) {
        setSelectedSize(displayProduct.sizes[0]);
      }
    } else if (selectedSize !== "") {
      setSelectedSize("");
    }
  }, [displayProduct?.id, displayProduct?.sizes, selectedSize]);

  useEffect(() => {
    const sallaId = product?.sallaProductId || product?.id;
    if (!sallaId) return;
    // Skip if we already have good data from Redux
    if (product?.isOnSale && product?.regularPrice && product?.salePrice)
      return;

    // V17: Deep Integration 🦾
    const discover = async () => {
      try {
        // STRATEGY 1: Check __STORIA_PRODUCTS__ global cache (instant, zero network)
        const cached = window.__STORIA_PRODUCTS__?.[sallaId]?.mapped;
        if (cached && cached.isOnSale) {
          console.log(`[Storia] V17: Cache hit for ${sallaId}`);
          setEnrichedPriceInfo({
            regularPrice: cached.regularPrice || cached.rawRegularPrice,
            salePrice: cached.salePrice || cached.rawSalePrice,
            isOnSale: cached.isOnSale,
            sizes: cached.sizes || [],
            sizeVariants: cached.sizeVariants || [],
          });
          return;
        }

        // STRATEGY 2: Use Salla SDK (official API, single request)
        const sm = window.salla;
        const productManager = sm?.product || sm?.api?.product;
        if (productManager && typeof productManager.get === "function") {
          console.log(`[Storia] V17: SDK fetch for ${sallaId}...`);
          const res = await productManager.get(sallaId).catch(() => null);
          const d = res?.data || (res?.id ? res : null);

          if (d) {
            const translate = (val) => {
              if (!val) return "";
              if (typeof val === "string") return val;
              return val.ar || val.en || Object.values(val)[0] || "";
            };

            const getVal = (v) => {
              if (v === null || v === undefined) return 0;
              if (typeof v === "number") return v;
              return Number(v.amount) || Number(v) || 0;
            };

            const amount = getVal(d.price);
            let regularPrice = getVal(d.regular_price) || amount;
            let salePrice = amount;
            let isOnSale = regularPrice > salePrice;

            // Map size options
            let sizeVariants = [];
            let sizes = [];
            const rawOptions = d.options || [];
            const rawVariants = d.variants || d.skus || [];

            const sizeOpt =
              rawOptions.find((o) => {
                const n = translate(o.name || o.label).toLowerCase();
                return (
                  n.includes("مقاس") || n.includes("size") || n.includes("قياس")
                );
              }) || (rawOptions.length > 0 ? rawOptions[0] : null);

            if (sizeOpt) {
              const vals =
                sizeOpt.values ||
                (Array.isArray(sizeOpt.data) ? sizeOpt.data : []);
              sizes = vals.map((v) => translate(v.name || v.label).trim());
              sizeVariants = vals.map((v) => ({
                size: translate(v.name || v.label).trim(),
                price: getVal(v.price) || amount,
                regularPrice:
                  getVal(v.regular_price) || getVal(v.price) || regularPrice,
                salePrice: getVal(v.sale_price) || getVal(v.price) || salePrice,
                isOnSale: isOnSale,
                variantId: v.id,
                optionId: sizeOpt.id,
                valueId: v.id,
              }));
            } else if (rawVariants.length > 0) {
              sizeVariants = rawVariants.map((v) => ({
                size: translate(v.name || v.label || v.sku).trim() || "Default",
                price: getVal(v.price) || amount,
                regularPrice:
                  getVal(v.regular_price) || getVal(v.price) || regularPrice,
                isOnSale: isOnSale,
                variantId: v.id,
              }));
              sizes = sizeVariants.map((v) => v.size).filter(Boolean);
            }

            // If variants have sale info but main doesn't, lift it up
            if (!isOnSale && sizeVariants.length > 0) {
              const sv = sizeVariants.find((v) => v.regularPrice > v.price);
              if (sv) {
                regularPrice = sv.regularPrice;
                salePrice = sv.price;
                isOnSale = true;
              }
            }

            if (isOnSale || sizes.length > 0) {
              console.log(
                `[Storia] V17 Discovery: price ${regularPrice} → ${salePrice}, ${sizes.length} sizes`,
              );
              setEnrichedPriceInfo({
                regularPrice,
                salePrice,
                isOnSale,
                sizes: sizes.length > 0 ? sizes : undefined,
                sizeVariants:
                  sizeVariants.length > 0 ? sizeVariants : undefined,
              });
            }
          }
        }
      } catch (err) {
        console.warn("[Storia] V17 Discovery Error:", err);
      }
    };

    // Run immediately and retry once after SDK lazy-loads
    discover();
    const timer = setTimeout(discover, 2500);
    return () => clearTimeout(timer);
  }, [
    product?.id,
    product?.sallaProductId,
    product?.isOnSale,
    product?.regularPrice,
    product?.salePrice,
  ]);

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

    // Get options for selected size if available
    let syncData = {
      sallaProductId: workingProduct.sallaProductId || workingProduct.id,
    };

    if (selectedSize && workingProduct.sizeVariants?.length > 0) {
      const variant = workingProduct.sizeVariants.find(
        (v) => String(v.size).trim() === String(selectedSize).trim(),
      );
      if (variant) {
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
    const result = await addToCart(
      workingProduct,
      1,
      syncData.variantId || { options: syncData.options },
    );

    // 🌿 V14: The Natural Handover
    if (result && result.isValidation) {
      console.log(
        "[Storia] Discovery Blindness or Validation Error. Triggering Native Proxy...",
      );
      const sallaId = workingProduct.sallaProductId || workingProduct.id;
      const nativeBtn = document.getElementById(`native-cart-btn-${sallaId}`);
      if (nativeBtn) {
        nativeBtn.click();
        return; // Let Salla's native popup take over
      }
    }

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
          product={product}
          activeMedia={activeMedia}
          setActiveMedia={setActiveMedia}
        />

        {/* Product Info - uses displayProduct so enriched price/sizes show */}
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
