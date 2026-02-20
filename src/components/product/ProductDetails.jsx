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
    if (product && !product.regularPrice && product.id) {
      console.log("Client-Side Fetch: Missing regular price, fetching...");

      const fetchDetails = async () => {
        try {
          // Try to use Salla SDK directly in browser
          if (window.salla && window.salla.api && window.salla.api.product) {
            const res = await window.salla.api.product
              .getDetails(product.id)
              .catch(() => null);
            if (res && res.data) {
              console.log("Client-Side Fetch Success:", res.data);
              const d = res.data;
              if (d.regular_price) {
                const regPrice = Number(d.regular_price);
                const curPrice = Number(d.price);

                // Build enriched variants if they exist
                let enrichedVariants = null;
                if (product.sizeVariants) {
                  enrichedVariants = product.sizeVariants.map((v) => {
                    // If variant matches the current price, give it the same regular price
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
                  sizeVariants: enrichedVariants || product.sizeVariants,
                });
              }
            }
          }
        } catch (e) {
          console.error("Client-Side Fetch Error:", e);
        }
      };

      // Small delay to ensure Salla is ready
      setTimeout(fetchDetails, 1000);
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
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert("الرجاء اختيار المقاس");
      return;
    }

    // Check Stock
    if (selectedSize && product.sizeVariants?.length > 0) {
      const variant = product.sizeVariants.find((v) => v.size === selectedSize);
      if (variant && variant.isOutOfStock) {
        alert("عذراً، هذا المقاس نفذت كميته");
        return;
      }
    } else if (product.isOutOfStock) {
      alert("عذراً، هذا المنتج نفذت كميته");
      return;
    }

    // Get price and options for selected size if available
    let price = product.price;
    let syncData = {}; // Can contain variant_id or options object

    if (selectedSize && product.sizeVariants?.length > 0) {
      const variant = product.sizeVariants.find(
        (v) => String(v.size).trim() === String(selectedSize).trim(),
      );
      if (variant) {
        price = variant.price;
        // Priority 1: SKU-based variant_id
        if (variant.variantId) {
          syncData.variantId = variant.variantId;
        }
        // Priority 2: Custom Options (e.g. { [optionId]: valueId })
        else if (variant.optionId && variant.valueId) {
          syncData.options = { [variant.optionId]: variant.valueId };
        }
      } else {
        // Selected size not found in variants
      }
    } else if (product.sizeVariants?.length > 0) {
      // Emergency fallback
      const variant = product.sizeVariants[0];
      price = variant.price;
      if (variant.variantId) {
        syncData.variantId = variant.variantId;
      } else if (variant.optionId && variant.valueId) {
        syncData.options = { [variant.optionId]: variant.valueId };
      }
    }

    // Sync with Salla backend
    await addToCartWithSync({ ...product, price }, 1, syncData);
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
