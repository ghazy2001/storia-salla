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
  const [enrichedData, setEnrichedData] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // 2. Final Product Data (Base + Enriched)
  const displayProduct = useMemo(() => {
    if (!baseProduct) return null;
    if (!enrichedData) return baseProduct;
    return { ...baseProduct, ...enrichedData };
  }, [baseProduct, enrichedData]);

  // 3. V19 Proxy Discovery (Focused on Prices only)
  useEffect(() => {
    const sallaId = baseProduct?.sallaProductId || baseProduct?.id;
    if (!sallaId || sallaId < 100) return;

    let isMounted = true;
    setIsDiscovering(true);

    const discover = async () => {
      try {
        const details = await sallaService
          .getProductDetails(sallaId)
          .catch(() => null);
        if (!isMounted) return;

        if (details) {
          setEnrichedData({
            regularPrice: details.regularPrice || details.rawRegularPrice,
            salePrice: details.salePrice || details.rawSalePrice,
            isOnSale: details.isOnSale,
          });
        }
      } catch (err) {
        console.warn("[Storia] Discovery Error:", err);
      } finally {
        if (isMounted) setIsDiscovering(false);
      }
    };

    discover();
    return () => {
      isMounted = false;
    };
  }, [baseProduct?.id, baseProduct?.sallaProductId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // 4. Cart Logic - THE PURE NATIVE PROXY
  // No more manual size validation! Salla handles it in the native popup.
  const handleAddToCart = useCallback(() => {
    if (!displayProduct) return;
    const sallaId = displayProduct.sallaProductId || displayProduct.id;

    console.log(
      "[Storia] V19: Proxying to Native Salla Button for ID:",
      sallaId,
    );

    // Trigger the native Salla button.
    // This will open Salla's selection popup if sizes are needed,
    // or add directly if not. This is 100% reliable.
    const nativeBtn =
      document.querySelector(`[product-id="${sallaId}"] button`) ||
      document.querySelector(
        `salla-add-product-button[product-id="${sallaId}"]`,
      );

    if (nativeBtn) {
      nativeBtn.click();
      // Since Salla handles the toast/feedback, we don't strictly need ours,
      // but we can listen for Salla's cart events if we want.
      setShowToast(true);
      setTimeout(() => dispatch(fetchCartFromSalla()), 1000);
    } else {
      console.error("[Storia] Native Salla button not found!");
      alert("عذراً، نظام السلة غير متوفر حالياً.");
    }
  }, [displayProduct, dispatch]);

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
          handleAddToCart={handleAddToCart}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
