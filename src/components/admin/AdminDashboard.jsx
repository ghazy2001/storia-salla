import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../store/slices/productSlice";
import { logout } from "../../store/slices/adminSlice";
import {
  selectReviews,
  deleteReview,
  selectFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
} from "../../store/slices/contentSlice";
import { setCurrentPage } from "../../store/slices/cartSlice";
import {
  Plus,
  MessageSquare,
  HelpCircle,
  Package,
  BarChart3,
  ShoppingBag,
} from "lucide-react";

// Components
import AnalyticsTab from "./dashboard/AnalyticsTab";
import OrdersTab from "./dashboard/OrdersTab";
import ProductsTab from "./dashboard/ProductsTab";
import ReviewsTab from "./dashboard/ReviewsTab";
import FAQsTab from "./dashboard/FAQsTab";
import ProductModal from "./dashboard/ProductModal";

const AdminDashboard = () => {
  const products = useSelector(selectProducts);
  const reviews = useSelector(selectReviews);
  const faqs = useSelector(selectFAQs);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("analytics");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Orders Data
  const [orders] = useState([
    {
      id: "#ORD-7829",
      customer: "سارة أحمد",
      date: "2024-01-28",
      total: "1,250 ر.س",
      status: "processing",
      items: 3,
    },
    {
      id: "#ORD-7828",
      customer: "نورة المالكي",
      date: "2024-01-28",
      total: "850 ر.س",
      status: "completed",
      items: 2,
    },
    {
      id: "#ORD-7827",
      customer: "عبدالله محمد",
      date: "2024-01-27",
      total: "2,100 ر.س",
      status: "completed",
      items: 5,
    },
    {
      id: "#ORD-7826",
      customer: "ريم القحطاني",
      date: "2024-01-27",
      total: "450 ر.س",
      status: "cancelled",
      items: 1,
    },
    {
      id: "#ORD-7825",
      customer: "هدى العتيبي",
      date: "2024-01-26",
      total: "1,600 ر.س",
      status: "processing",
      items: 4,
    },
  ]);

  const initialProductState = {
    name: "",
    price: "",
    description: "",
    image: "/assets/products/p01/p01_1.jpg",
    category: "official",
    sizes: ["S", "M", "L", "XL"],
    media: [],
    originalPrice: "",
    bestSellerDescription: "",
  };

  const initialFAQState = {
    question: "",
    answer: "",
  };

  const [productForm, setProductForm] = useState(initialProductState);
  const [faqForm, setFaqForm] = useState(initialFAQState);

  const handleLogout = () => {
    dispatch(setCurrentPage("home"));
    dispatch(logout());
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    if (activeTab === "products") {
      setProductForm(item);
    } else if (activeTab === "faqs") {
      setFaqForm(item);
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
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      if (activeTab === "products") dispatch(deleteProduct(id));
      if (activeTab === "reviews") dispatch(deleteReview(id));
      if (activeTab === "faqs") dispatch(deleteFAQ(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "products") {
      if (isEditing) {
        dispatch(updateProduct({ ...productForm, id: currentId }));
      } else {
        dispatch(addProduct(productForm));
      }
    } else if (activeTab === "faqs") {
      if (isEditing) {
        dispatch(updateFAQ({ ...faqForm, id: currentId }));
      } else {
        dispatch(addFAQ(faqForm));
      }
    }
    setIsModalOpen(false);
  };

  const renderTabs = () => (
    <div className="flex gap-4 mb-8 border-b pb-4 overflow-x-auto">
      <button
        onClick={() => setActiveTab("analytics")}
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
        onClick={() => setActiveTab("orders")}
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
        onClick={() => setActiveTab("products")}
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
        onClick={() => setActiveTab("reviews")}
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
        onClick={() => setActiveTab("faqs")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
          activeTab === "faqs"
            ? "bg-brand-burgundy text-white shadow-lg"
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
      >
        <HelpCircle size={18} />
        <span>الأسئلة الشائعة</span>
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
        {(activeTab === "products" || activeTab === "faqs") && (
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleAdd}
              className="bg-brand-burgundy text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-brand-charcoal transition-colors shadow-lg"
            >
              <Plus size={20} />
              <span>
                {activeTab === "products"
                  ? "إضافة منتج جديد"
                  : "إضافة سؤال جديد"}
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === "analytics" && <AnalyticsTab />}
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
        />
      </div>
    </section>
  );
};

export default AdminDashboard;
