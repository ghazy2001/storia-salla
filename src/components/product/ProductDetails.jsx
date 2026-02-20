import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectProducts } from "../../store/slices/productSlice";
import { selectTheme } from "../../store/slices/uiSlice";
import { fetchCartFromSalla } from "../../store/slices/cartSlice";
import sallaService from "../../services/sallaService";
import Toast from "../common/Toast";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const theme = useSelector(selectTheme);

  // 1. Find the base product from Redux
  const baseProduct = useMemo(() => {
    return products.find((p) => String(p._id || p.id) === String(productId));
  }, [products, productId]);

  const [activeMedia, setActiveMedia] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [enrichedData, setEnrichedData] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // 2. Final Product Data (Base + Enriched)
  const displayProduct = useMemo(() => {
    if (!baseProduct) return null;
    if (!enrichedData) return baseProduct;

    const merged = { ...baseProduct, ...enrichedData };
    // V18 Safety Net: Ensure sizes from local products.js are kept if Salla fails
    if (!merged.sizes || merged.sizes.length === 0) {
      merged.sizes = baseProduct.sizes || [];
    }
    return merged;
  }, [baseProduct, enrichedData]);

  // 3. V18 High-Res Discovery
  useEffect(() => {
    const sallaId = baseProduct?.sallaProductId || baseProduct?.id;
    if (!sallaId || sallaId < 100) return;

    let isMounted = true;
    setIsDiscovering(true);

    const discover = async () => {
      try {
        console.log(`[Storia] Discovery START for ${sallaId}`);
        const details = await sallaService
          .getProductDetails(sallaId)
          .catch((err) => {
            console.warn(
              "[Storia] Discovery API Call Failed (Normal for local dev):",
              err.message,
            );
            return null;
          });

        if (!isMounted) return;

        if (details) {
          console.log(`[Storia] Discovery SUCCESS for ${sallaId}`, details);
          setEnrichedData({
            regularPrice: details.regularPrice || details.rawRegularPrice,
            salePrice: details.salePrice || details.rawSalePrice,
            isOnSale: details.isOnSale,
            sizes: details.sizes || [],
            sizeVariants: details.sizeVariants || [],
          });

          // Auto-select size if discovery found sizes
          if (details.sizes && details.sizes.length > 0 && !selectedSize) {
            setSelectedSize(details.sizes[0]);
          }
        }
      } catch (err) {
        console.error("[Storia] Unexpected Discovery Error:", err);
      } finally {
        if (isMounted) setIsDiscovering(false);
      }
    };

    discover();
    return () => {
      isMounted = false;
    };
  }, [baseProduct?.sallaProductId, baseProduct?.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // 4. Cart Logic - THE BULLETPROOF VERSION
  const handleAddToCart = useCallback(async () => {
    if (!displayProduct) return;
    const sallaId = displayProduct.sallaProductId || displayProduct.id;

    // Check if user selected a size
    if (
      displayProduct.sizes &&
      displayProduct.sizes.length > 0 &&
      !selectedSize
    ) {
      alert("الطلب يحتاج اختيار مقاس أولاً");
      return;
    }

    const payload = {
      id: Number(sallaId),
      quantity: 1,
    };

    // Try to find variant/option IDs
    let variantFound = false;
    if (selectedSize && displayProduct.sizeVariants?.length > 0) {
      const variant = displayProduct.sizeVariants.find(
        (v) => String(v.size).trim() === String(selectedSize).trim(),
      );
      if (variant) {
        if (variant.variantId || variant.sallaVariantId) {
          payload.variant_id = variant.variantId || variant.sallaVariantId;
          variantFound = true;
        } else if (variant.optionId && variant.valueId) {
          payload.options = { [variant.optionId]: variant.valueId };
          variantFound = true;
        }
      }
    }

    console.log("[Storia] Attempting Cart Payload:", payload);

    try {
      // If we don't have a variant ID but the product HAS sizes, we MUST use the native button
      // because Salla will reject the request if it's missing the required option ID.
      if (
        !variantFound &&
        displayProduct.sizes &&
        displayProduct.sizes.length > 0
      ) {
        throw new Error("PROXIED_NATIVE_FALLBACK");
      }

      if (window.salla && window.salla.cart) {
        await window.salla.cart.addItem(payload);
        dispatch(fetchCartFromSalla());
        setShowToast(true);
      } else {
        throw new Error("SDK_NOT_LOADED");
      }
    } catch (err) {
      console.warn("[Storia] Cart Fallback Triggered:", err.message || err);

      // TRIGGER NATIVE BUTTON
      // This button is always in ProductInfo, it serves as our "Safety Valve"
      const nativeBtn =
        document.querySelector(`[product-id="${sallaId}"] button`) ||
        document.querySelector(
          `salla-add-product-button[product-id="${sallaId}"]`,
        );

      if (nativeBtn) {
        console.log("[Storia] Clicking Native Salla Button...");
        nativeBtn.click();
      } else {
        // Log better error
        console.error("[Storia] Native button not found in DOM");
        alert("عذراً، نظام السلة غير متوفر حالياً. يرجى المحاولة لاحقاً.");
      }
    }
  }, [displayProduct, selectedSize, dispatch]);

  if (!baseProduct && products.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <button
            onClick={() => navigate("/store")}
            className="px-8 py-3 bg-brand-gold text-white rounded-full"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  if (!displayProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 animate-pulse">
        <p className="text-lg opacity-60">جارٍ تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

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
        <ProductGallery
          product={displayProduct}
          activeMedia={activeMedia}
          setActiveMedia={setActiveMedia}
        />

        <ProductInfo
          product={displayProduct}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          handleAddToCart={handleAddToCart}
          theme={theme}
          isDiscovering={isDiscovering}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
