import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectProducts } from "../../store/slices/productSlice";
import { selectTheme } from "../../store/slices/uiSlice";
import { useAddToCart } from "../../hooks/useCart";
import Toast from "../common/Toast";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

const ProductContent = ({ product, theme }) => {
  const navigate = useNavigate();
  const [activeMedia, setActiveMedia] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const { addToCart: addToCartWithSync } = useAddToCart();

  // Initialize selected size state - simplified logic
  // Since we use key={product.id}, this runs only once per product
  const [selectedSize, setSelectedSize] = useState(() =>
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "",
  );

  const handleAddToCart = async () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert("الرجاء اختيار المقاس");
      return;
    }

    // Get price for selected size if available
    let price = product.price;
    if (selectedSize && product.sizeVariants?.length > 0) {
      const variant = product.sizeVariants.find((v) => v.size === selectedSize);
      if (variant) price = variant.price;
    }

    await addToCartWithSync({ ...product, price }, 1, selectedSize);
    setShowToast(true);
  };

  return (
    <div className="max-w-[1920px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
      <Toast
        message="تمت إضافة المنتج إلى السلة بنجاح"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        theme={theme}
        action={{
          label: "عرض السلة >>",
          onClick: () => navigate("/cart"),
        }}
      />
      {/* Gallery Section */}
      <ProductGallery
        product={product}
        activeMedia={activeMedia}
        setActiveMedia={setActiveMedia}
      />

      {/* Product Info */}
      <ProductInfo
        product={product}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        handleAddToCart={handleAddToCart}
        theme={theme}
      />
    </div>
  );
};

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

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-charcoal pt-24 pb-12">
      {/* Use key to force remount (and state reset) when product changes */}
      <ProductContent
        key={product._id || product.id}
        product={product}
        theme={theme}
      />
    </div>
  );
};

export default ProductDetails;
