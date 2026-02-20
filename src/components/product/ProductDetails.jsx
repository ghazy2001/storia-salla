import React, { useEffect, useState, useCallback } from "react";
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

  const product = products.find((p) => {
    const pId = String(p._id || p.id);
    const targetId = String(productId);
    return pId === targetId;
  });

  const [activeMedia, setActiveMedia] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [enrichedData, setEnrichedData] = useState(null);

  // Merge enriched data with base product
  // Critical for V18: Enriched data (SDK/REST) must trump local data for sizes/prices
  const displayProduct = enrichedData
    ? { ...product, ...enrichedData }
    : product;

  // V18: Fidelity First - Aggressive Discovery
  useEffect(() => {
    const sallaId = product?.sallaProductId || product?.id;
    if (!sallaId) return;

    let cancelled = false;

    const fetchDetails = async () => {
      try {
        console.log(
          `[Storia] V18 Discovery: Fetching details for ${sallaId}...`,
        );
        const details = await sallaService.getProductDetails(sallaId);

        if (cancelled) return;

        if (details) {
          console.log(`[Storia] V18 Discovery SUCCESS for ${sallaId}:`, {
            hasSizes: !!details.sizes?.length,
            sizes: details.sizes,
            regularPrice: details.regularPrice,
            salePrice: details.salePrice,
          });

          setEnrichedData({
            regularPrice: details.regularPrice || details.rawRegularPrice,
            salePrice: details.salePrice || details.rawSalePrice,
            rawRegularPrice: details.rawRegularPrice,
            rawSalePrice: details.rawSalePrice,
            isOnSale: details.isOnSale,
            sizes: details.sizes || [],
            sizeVariants: details.sizeVariants || [],
          });

          // Auto-select first size if not already selected
          if (details.sizes && details.sizes.length > 0 && !selectedSize) {
            console.log(
              `[Storia] V18: Auto-selecting size: ${details.sizes[0]}`,
            );
            setSelectedSize(details.sizes[0]);
          }
        } else {
          console.warn(
            `[Storia] V18 Discovery: No details returned for ${sallaId}`,
          );
        }
      } catch (err) {
        console.warn("[Storia] V18 Discovery Error:", err);
      }
    };

    // Try immediately
    fetchDetails();

    // Retry once after a delay to catch late SDK loads
    const timer = setTimeout(fetchDetails, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [product?.id, product?.sallaProductId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Handle add to cart with proper size/variant mapping
  const handleAddToCart = useCallback(async () => {
    const wp = displayProduct;
    const sallaId = wp.sallaProductId || wp.id;

    console.log("[Storia] handleAddToCart debug:", {
      sallaId,
      selectedSize,
      hasSizes: !!wp.sizes?.length,
      variantsCount: wp.sizeVariants?.length,
    });

    // Validate size selection
    if (wp.sizes && wp.sizes.length > 0 && !selectedSize) {
      alert("الرجاء اختيار المقاس");
      return;
    }

    // Check stock
    if (selectedSize && wp.sizeVariants?.length > 0) {
      const variant = wp.sizeVariants.find(
        (v) => String(v.size).trim() === String(selectedSize).trim(),
      );
      if (variant?.isOutOfStock) {
        alert("عذراً، هذا المقاس نفذت كميته");
        return;
      }
    }

    // Build cart payload
    const payload = {
      id: Number(sallaId),
      quantity: 1,
    };

    // Add variant/option data if a size is selected
    if (selectedSize && wp.sizeVariants?.length > 0) {
      const variant = wp.sizeVariants.find(
        (v) => String(v.size).trim() === String(selectedSize).trim(),
      );
      if (variant) {
        console.log("[Storia] V18: Found variant for size:", variant);
        if (variant.variantId || variant.sallaVariantId) {
          payload.variant_id = variant.variantId || variant.sallaVariantId;
        } else if (variant.optionId && variant.valueId) {
          payload.options = { [variant.optionId]: variant.valueId };
        }
      } else {
        console.warn("[Storia] V18: Variant NOT found for size:", selectedSize);
      }
    }

    console.log("[Storia] V18 Cart Payload Final:", payload);

    try {
      // Use SDK directly for cart operations
      if (window.salla && window.salla.cart) {
        console.log("[Storia] Calling salla.cart.addItem...");
        const result = await window.salla.cart.addItem(payload);
        console.log("[Storia] Cart addItem success:", result);
        dispatch(fetchCartFromSalla());
        setShowToast(true);
      } else {
        // Fallback: try the native button
        console.warn(
          "[Storia] SDK cart not found, trying native button proxy...",
        );
        const nativeBtn = document.getElementById(`native-cart-btn-${sallaId}`);
        if (nativeBtn) {
          nativeBtn.click();
        } else {
          alert("عذراً، خدمة السلة غير متوفرة حالياً.");
        }
      }
    } catch (err) {
      console.error("[Storia] Add to cart error:", err);
      const statusCode = err?.response?.status || err?.status;

      if (statusCode === 422 || statusCode === 400) {
        // Validation error - try native button as fallback
        console.log(
          "[Storia] 422/400 Validation Error - checking if native button can fix it...",
        );
        const nativeBtn = document.getElementById(`native-cart-btn-${sallaId}`);
        if (nativeBtn) {
          nativeBtn.click();
          return;
        }
      }

      alert(
        "عذراً، حدث خطأ أثناء الإضافة للسلة. يرجى اختيار المقاس والمحاولة مرة أخرى.",
      );
    }
  }, [displayProduct, selectedSize, dispatch]);

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
