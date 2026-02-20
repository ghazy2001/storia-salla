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
  // V18 Fix: Merge sizes intelligently. If discovery returns empty sizes, keep the base ones.
  const displayProduct = useMemo(() => {
    if (!baseProduct) return null;
    if (!enrichedData) return baseProduct;

    const merged = { ...baseProduct, ...enrichedData };
    // Safety Net: If enriched size array is empty, use the base product's sizes
    if (!merged.sizes || merged.sizes.length === 0) {
      merged.sizes = baseProduct.sizes || [];
    }
    return merged;
  }, [baseProduct, enrichedData]);

  // 3. V18 Fidelity Plus Discovery
  useEffect(() => {
    const sallaId = baseProduct?.sallaProductId || baseProduct?.id;
    if (!sallaId || sallaId < 100) return;

    let isMounted = true;
    setIsDiscovering(true);

    const discover = async () => {
      try {
        console.log(`[Storia] V18 High-Res Discovery START for ${sallaId}`);

        // Strategy A: sallaService (REST + SDK)
        let details = await sallaService
          .getProductDetails(sallaId)
          .catch(() => null);

        // Strategy B: Direct SDK Scavenge (Special Salla SPA Call)
        if (!details && window.salla?.api?.fetch) {
          try {
            console.log(`[Storia] Trying SDK direct fetch for ${sallaId}...`);
            const res = await window.salla.api.fetch("product.details", {
              id: sallaId,
            });
            if (res?.data) {
              const raw = Array.isArray(res.data) ? res.data[0] : res.data;
              // Map it using sallaService's process method
              const mapped = await sallaService._processSallaProducts([raw]);
              if (mapped && mapped.length > 0) details = mapped[0];
            }
          } catch (e) {
            console.warn("[Storia] SDK Fetch Error:", e);
          }
        }

        if (!isMounted) return;

        if (details) {
          console.log(`[Storia] V18 High-Res Discovery SUCCESS:`, {
            id: sallaId,
            sizes: details.sizes,
            isOnSale: details.isOnSale,
          });

          setEnrichedData({
            name: details.name || baseProduct.name,
            description: details.description || baseProduct.description,
            regularPrice: details.regularPrice || details.rawRegularPrice,
            salePrice: details.salePrice || details.rawSalePrice,
            isOnSale: details.isOnSale,
            sizes: details.sizes || [],
            sizeVariants: details.sizeVariants || [],
          });

          // Auto-select size if available
          if (details.sizes && details.sizes.length > 0) {
            setSelectedSize(details.sizes[0]);
          }
        }
      } catch (err) {
        console.error("[Storia] V18 High-Res Discovery Failed:", err);
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

  // Handle add to cart with proper size/variant mapping
  const handleAddToCart = useCallback(async () => {
    if (!displayProduct) return;
    const sallaId = displayProduct.sallaProductId || displayProduct.id;

    // Validation: Need size if product has sizes
    if (
      displayProduct.sizes &&
      displayProduct.sizes.length > 0 &&
      !selectedSize
    ) {
      alert("الرجاء اختيار المقاس أولاً");
      return;
    }

    const payload = {
      id: Number(sallaId),
      quantity: 1,
    };

    // Map Variant/Options
    if (selectedSize && displayProduct.sizeVariants?.length > 0) {
      const variant = displayProduct.sizeVariants.find(
        (v) => String(v.size).trim() === String(selectedSize).trim(),
      );
      if (variant) {
        if (variant.variantId || variant.sallaVariantId) {
          payload.variant_id = variant.variantId || variant.sallaVariantId;
        } else if (variant.optionId && variant.valueId) {
          payload.options = { [variant.optionId]: variant.valueId };
        }
      }
    }

    console.log("[Storia] Cart Payload Post-Validation:", payload);

    try {
      if (window.salla && window.salla.cart) {
        await window.salla.cart.addItem(payload);
        dispatch(fetchCartFromSalla());
        setShowToast(true);
      } else {
        const nativeBtn = document.getElementById(`native-cart-btn-${sallaId}`);
        if (nativeBtn) nativeBtn.click();
        else alert("عذراً، نظام السلة غير متوفر حالياً");
      }
    } catch (err) {
      console.error("[Storia] Add to cart failed:", err);
      // If validation error (422), it means Salla is picky about the options
      // We trigger the native button which will ALWAYS open the Salla native picker
      const nativeBtn = document.getElementById(`native-cart-btn-${sallaId}`);
      if (nativeBtn) {
        console.log(
          "[Storia] 422 Error: Falling back to Native Salla Picker...",
        );
        nativeBtn.click();
      } else {
        alert("يرجى التأكد من اختيار المقاس الصحيح عذراً، حدث خطأ.");
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
