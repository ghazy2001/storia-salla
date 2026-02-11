import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  selectCategories,
  fetchCategoriesFromSalla,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slices/productSlice";
import { logout } from "../../store/slices/adminSlice";
import {
  selectReviews,
  deleteReview,
  selectFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  selectBestSellers,
  fetchBestSellers,
  addBestSellers,
  updateBestSellersAction,
  deleteBestSellers as deleteBestSellersAction,
} from "../../store/slices/contentSlice";
import {
  fetchOrders,
  fetchAnalytics,
  selectOrders,
  selectAnalytics,
} from "../../store/slices/dashboardSlice";
import { setCurrentPage } from "../../store/slices/cartSlice";
import {
  BarChart3,
  ShoppingBag,
  ExternalLink,
  Package,
  MessageSquare,
  HelpCircle,
  Plus,
  Star,
  ClipboardList,
} from "lucide-react";
import {
  setAdminActiveTab,
  selectAdminActiveTab,
} from "../../store/slices/uiSlice";
import sallaService from "../../services/sallaService";

// Components
import AnalyticsTab from "./dashboard/AnalyticsTab";
import OrdersTab from "./dashboard/OrdersTab";
import ProductsTab from "./dashboard/ProductsTab";
import ReviewsTab from "./dashboard/ReviewsTab";
import FAQsTab from "./dashboard/FAQsTab";
import BestSellersTab from "./dashboard/BestSellersTab";
import CategoriesTab from "./dashboard/CategoriesTab";
import InventoryTab from "./dashboard/InventoryTab";
import ProductModal from "./dashboard/ProductModal";

const AdminDashboard = () => {
  const products = useSelector(selectProducts);
  const reviews = useSelector(selectReviews);
  const faqs = useSelector(selectFAQs);
  const orders = useSelector(selectOrders);
  const analytics = useSelector(selectAnalytics);
  const bestSellers = useSelector(selectBestSellers);
  const activeTab = useSelector(selectAdminActiveTab);
  const categories = useSelector(selectCategories);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchAnalytics());
    dispatch(fetchBestSellers());
    dispatch(fetchCategoriesFromSalla());
  }, [dispatch]);

  const initialProductState = {
    name: "",
    price: "",
    description: "",
    image: "assets/products/p01/p01_1.jpg",
    category: "official",
    sizes: [],
    sizeVariants: [],
    media: [],
    originalPrice: "",
    bestSellerDescription: "",
    sallaProductId: "",
  };

  const initialFAQState = {
    answer: "",
  };

  const initialBestSellersState = {
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    price: "",
    currency: "SAR",
    category: "classic",
    media: [{ type: "image", src: "assets/products/p03/p03_1.jpg", order: 1 }],
    bannerText: { ar: "الأكثر مبيعاً", en: "Best Sellers" },
    bannerSubtext: { ar: "تسوق افضل المنتجات المختارة لك خصيصا", en: "" },
    ctaText: { ar: "تسوق الآن", en: "Shop Now" },
    isActive: true,
  };

  const initialCategoryState = {
    name: { ar: "", en: "" },
    slug: "",
    description: { ar: "", en: "" },
    order: 0,
    isActive: true,
  };

  const [productForm, setProductForm] = useState(initialProductState);
  const [faqForm, setFaqForm] = useState(initialFAQState);
  const [bestSellersForm, setBestSellersForm] = useState(
    initialBestSellersState,
  );
  const [categoryForm, setCategoryForm] = useState(initialCategoryState);

  const handleLogout = () => {
    dispatch(setCurrentPage("home"));
    dispatch(logout());
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item._id || item.id);
    if (activeTab === "products") {
      setProductForm(item);
    } else if (activeTab === "faqs") {
      setFaqForm(item);
    } else if (activeTab === "bestsellers") {
      setBestSellersForm(item);
    } else if (activeTab === "categories") {
      setCategoryForm(item);
    }
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    if (activeTab === "products") {
      setProductForm(initialProductState);
    } else if (activeTab === "faqs") {
      setFaqForm(initialFAQState);
    } else if (activeTab === "bestsellers") {
      setBestSellersForm(initialBestSellersState);
    } else if (activeTab === "categories") {
      setCategoryForm(initialCategoryState);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    const id = item._id || item.id;
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      try {
        if (activeTab === "products")
          await dispatch(deleteProduct(id)).unwrap();
        if (activeTab === "reviews") await dispatch(deleteReview(id)).unwrap();
        if (activeTab === "faqs") await dispatch(deleteFAQ(id)).unwrap();
        if (activeTab === "bestsellers")
          await dispatch(deleteBestSellersAction(id)).unwrap();
        if (activeTab === "categories")
          await dispatch(deleteCategory(id)).unwrap();
      } catch (error) {
        alert(`خطأ في الحذف: ${error}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "products") {
        if (isEditing) {
          const result = await dispatch(
            updateProduct({ ...productForm, id: currentId }),
          ).unwrap();
          if (result) setIsModalOpen(false);
        } else {
          const result = await dispatch(addProduct(productForm)).unwrap();
          if (result) setIsModalOpen(false);
        }
      } else if (activeTab === "faqs") {
        if (isEditing) {
          const result = await dispatch(
            updateFAQ({ ...faqForm, id: currentId }),
          ).unwrap();
          if (result) setIsModalOpen(false);
        } else {
          const result = await dispatch(addFAQ(faqForm)).unwrap();
          if (result) setIsModalOpen(false);
        }
      } else if (activeTab === "bestsellers") {
        if (isEditing) {
          const result = await dispatch(
            updateBestSellersAction({ ...bestSellersForm, id: currentId }),
          ).unwrap();
          if (result) setIsModalOpen(false);
        } else {
          const result = await dispatch(
            addBestSellers(bestSellersForm),
          ).unwrap();
          if (result) setIsModalOpen(false);
        }
      } else if (activeTab === "categories") {
        if (isEditing) {
          const result = await dispatch(
            updateCategory({ ...categoryForm, id: currentId }),
          ).unwrap();
          if (result) setIsModalOpen(false);
        } else {
          const result = await dispatch(addCategory(categoryForm)).unwrap();
          if (result) setIsModalOpen(false);
        }
      }
    } catch (error) {
      alert(`خطأ: ${error}`);
    }
  };

  const renderTabs = () => (
    <div className="flex gap-4 mb-8 border-b pb-4 overflow-x-auto">
      <button
        onClick={() => dispatch(setAdminActiveTab("analytics"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "analytics"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <BarChart3 size={18} />
        <span>التحليلات</span>
      </button>
      <button
        onClick={() => dispatch(setAdminActiveTab("orders"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "orders"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <ShoppingBag size={18} />
        <span>الطلبات</span>
      </button>
      <button
        onClick={() => dispatch(setAdminActiveTab("products"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "products"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <Package size={18} />
        <span>المنتجات</span>
      </button>
      <button
        onClick={() => dispatch(setAdminActiveTab("inventory"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "inventory"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <ClipboardList size={18} />
        <span>المخزون والجرد</span>
      </button>
      <button
        onClick={() => dispatch(setAdminActiveTab("reviews"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "reviews"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <MessageSquare size={18} />
        <span>التقييمات</span>
      </button>
      <button
        onClick={() => dispatch(setAdminActiveTab("faqs"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "faqs"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <HelpCircle size={18} />
        <span>الأسئلة الشائعة</span>
      </button>
      <button
        onClick={() => dispatch(setAdminActiveTab("bestsellers"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "bestsellers"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <Star size={18} />
        <span>الأكثر مبيعاً</span>
      </button>
      <button
        onClick={() => dispatch(setAdminActiveTab("categories"))}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "categories"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <Package size={18} />
        <span>الأقسام</span>
      </button>
    </div>
  );

  return (
    <section className="min-h-screen py-24 px-6 bg-gray-50 text-right font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-sans">
            لوحة التحكم
          </h1>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 font-medium px-4 py-2 border border-red-500 rounded hover:bg-red-50 transition-colors"
          >
            تسجيل خروج
          </button>
        </div>

        {renderTabs()}

        {/* Action Bar */}
        {(activeTab === "products" ||
          activeTab === "faqs" ||
          activeTab === "categories" ||
          activeTab === "bestsellers") && (
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleAdd}
              className="bg-brand-burgundy text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-brand-gold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Plus size={20} />
              <span>
                {activeTab === "products"
                  ? "إضافة منتج جديد"
                  : activeTab === "faqs"
                    ? "إضافة سؤال جديد"
                    : activeTab === "categories"
                      ? "إضافة قسم جديد"
                      : "إضافة تصميم جديد"}
              </span>
            </button>

            {activeTab === "products" && (
              <div className="flex gap-3">
                <a
                  href={sallaService.getDashboardUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-brand-gold border border-brand-gold/30 px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-gold/5 transition-colors"
                >
                  <ExternalLink size={18} />
                  <span>لوحة تحكم سلة</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {activeTab === "analytics" && <AnalyticsTab analytics={analytics} />}
        {activeTab === "orders" && <OrdersTab orders={orders} />}
        {activeTab === "products" && (
          <ProductsTab
            products={products}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
        {activeTab === "reviews" && (
          <ReviewsTab reviews={reviews} handleDelete={handleDelete} />
        )}
        {activeTab === "faqs" && (
          <FAQsTab
            faqs={faqs}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
        {activeTab === "bestsellers" && (
          <BestSellersTab
            bestSellers={bestSellers}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
        {activeTab === "categories" && (
          <CategoriesTab
            categories={categories}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
        {activeTab === "inventory" && <InventoryTab products={products} />}

        {/* Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isEditing={isEditing}
          productForm={productForm}
          setProductForm={setProductForm}
          handleSubmit={handleSubmit}
          activeTab={activeTab}
          faqForm={faqForm}
          setFaqForm={setFaqForm}
          bestSellersForm={bestSellersForm}
          setBestSellersForm={setBestSellersForm}
          categoryForm={categoryForm}
          setCategoryForm={setCategoryForm}
          categories={categories}
        />
      </div>
    </section>
  );
};

export default AdminDashboard;
