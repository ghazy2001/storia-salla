import React, { useState } from "react";
import { useProducts } from "../../context/ProductContext";
import { useAdmin } from "../../context/AdminContext";
import { useContent } from "../../context/ContentContext";
import { useCart } from "../../context/useCart";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  MessageSquare,
  HelpCircle,
  Package,
  Star,
  BarChart3,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";

const AdminDashboard = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { reviews, deleteReview, faqs, addFAQ, updateFAQ, deleteFAQ } =
    useContent();
  const { logout } = useAdmin();
  const { setCurrentPage } = useCart();

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
    setCurrentPage("home");
    logout();
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
      if (activeTab === "products") deleteProduct(id);
      if (activeTab === "reviews") deleteReview(id);
      if (activeTab === "faqs") deleteFAQ(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "products") {
      if (isEditing) {
        updateProduct({ ...productForm, id: currentId });
      } else {
        addProduct(productForm);
      }
    } else if (activeTab === "faqs") {
      if (isEditing) {
        updateFAQ({ ...faqForm, id: currentId });
      } else {
        addFAQ(faqForm);
      }
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "processing":
        return "قيد التجهيز";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  // Renderers
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

  const renderAnalytics = () => (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} />
              +12.5%
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
          <h3 className="text-2xl font-bold text-green-600">45,250 ر.س</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} />
              +8.2%
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">الطلبات</p>
          <h3 className="text-2xl font-bold text-blue-600">1,203</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <Users size={24} />
            </div>
            <span className="text-xs text-red-600 flex items-center gap-1">
              <TrendingUp size={12} className="rotate-180" />
              -2.4%
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">العملاء الجدد</p>
          <h3 className="text-2xl font-bold text-purple-600">350</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <BarChart3 size={24} />
            </div>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} />
              +5.1%
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">متوسط السلة</p>
          <h3 className="text-2xl font-bold text-orange-600">420 ر.س</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">
            احصائيات المبيعات (آخر 7 أيام)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[65, 45, 75, 55, 85, 70, 90].map((h, i) => (
              <div
                key={i}
                className="w-full bg-brand-burgundy/10 rounded-t-lg relative group flex flex-col justify-end transition-all hover:bg-brand-burgundy/20"
                style={{ height: `${h}%` }}
              >
                <div className="h-[20%] w-full bg-brand-burgundy/80 rounded-t-lg group-hover:h-full transition-all duration-500"></div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                  {
                    [
                      "السبت",
                      "الأحد",
                      "الاثنين",
                      "الثلاثاء",
                      "الأربعاء",
                      "الخميس",
                      "الجمعة",
                    ][i]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">الأكثر مبيعاً</h3>
          <div className="space-y-4">
            {[
              { name: "عباية نجد الرسمية", sales: "240", price: "450 ر.س" },
              { name: "عباية الحرير المغسول", sales: "185", price: "380 ر.س" },
              { name: "عباية الكريب الفاخر", sales: "120", price: "520 ر.س" },
              { name: "طقم العباية الشتوية", sales: "95", price: "650 ر.س" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-brand-gold">{item.price}</p>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  {item.sales} مبيعة
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                رقم الطلب
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                العميل
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                التاريخ
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                عدد العناصر
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                الإجمالي
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                الحالة
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-6 font-medium text-gray-900" dir="ltr">
                  {order.id}
                </td>
                <td className="py-4 px-6 text-gray-700">{order.customer}</td>
                <td className="py-4 px-6 text-gray-500 text-sm" dir="ltr">
                  {order.date}
                </td>
                <td className="py-4 px-6 text-gray-700">{order.items}</td>
                <td className="py-4 px-6 font-bold text-brand-gold">
                  {order.total}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                    التفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProductGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow"
        >
          <div className="aspect-[3/4] relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(product)}
                className="bg-white p-2 rounded-full text-blue-600 hover:bg-blue-50 shadow-sm"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-white p-2 rounded-full text-red-600 hover:bg-red-50 shadow-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-brand-gold font-bold">{product.price}</p>
            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {(() => {
                const categoryLabels = {
                  official: "رسمية",
                  practical: "عملية",
                  luxury: "فاخرة",
                  cloche: "كلوش",
                  bisht: "بشت",
                  classic: "نواعم",
                };
                return categoryLabels[product.category] || product.category;
              })()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderReviewsList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative"
        >
          <button
            onClick={() => handleDelete(review.id)}
            className="absolute top-4 left-4 text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-full"
            title="Delete Review"
          >
            <Trash2 size={16} />
          </button>
          <div className="flex items-center gap-1 mb-2 text-brand-gold">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < review.rating ? "currentColor" : "none"}
                className={i < review.rating ? "" : "text-gray-300"}
              />
            ))}
          </div>
          <h3 className="font-bold text-gray-900 mb-2">{review.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
        </div>
      ))}
    </div>
  );

  const renderFAQsList = () => (
    <div className="space-y-4 mb-16">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start gap-4"
        >
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
            <p className="text-gray-600 text-sm">{faq.answer}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleEdit(faq)}
              className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(faq.id)}
              className="text-red-500 hover:bg-red-50 p-2 rounded-full"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
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
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "products" && renderProductGrid()}
        {activeTab === "reviews" && renderReviewsList()}
        {activeTab === "faqs" && renderFAQsList()}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-8 text-center font-sans">
                {isEditing ? "تعديل" : "إضافة جديد"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Form */}
                {activeTab === "products" && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                        المعلومات الأساسية
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اسم المنتج
                        </label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all"
                          placeholder="مثال: عباية نجد الرسمية"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          السعر
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                price: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all text-left"
                            placeholder="350"
                            dir="ltr"
                            required
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                            ر.س
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                        التفاصيل الوصف
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          وصف المنتج
                        </label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all min-h-[120px]"
                          placeholder="اكتب وصفاً جذاباً للمنتج..."
                          required
                        />
                      </div>
                    </div>

                    {/* Section: Category & Sizes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          التصنيف
                        </label>
                        <select
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all bg-white"
                        >
                          <option value="official">رسمي</option>
                          <option value="cloche">كلوش</option>
                          <option value="bisht">بشت</option>
                          <option value="classic">كلاسك (نواعم)</option>
                          <option value="practical">عملي</option>
                          <option value="luxury">فاخر</option>
                        </select>
                      </div>

                      {/* Sizes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المقاسات
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["S", "M", "L", "XL", "XXL"].map((size) => {
                            const isSelected =
                              productForm.sizes?.includes(size);
                            return (
                              <label
                                key={size}
                                className={`cursor-pointer px-4 py-2 rounded-lg border transition-all duration-200 flex items-center justify-center min-w-[50px] text-sm ${
                                  isSelected
                                    ? "bg-brand-burgundy text-white border-brand-burgundy shadow-md transform scale-105"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-burgundy/30 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const currentSizes =
                                      productForm.sizes || [];
                                    if (e.target.checked) {
                                      setProductForm({
                                        ...productForm,
                                        sizes: [...currentSizes, size],
                                      });
                                    } else {
                                      setProductForm({
                                        ...productForm,
                                        sizes: currentSizes.filter(
                                          (s) => s !== size,
                                        ),
                                      });
                                    }
                                  }}
                                  className="hidden"
                                />
                                <span className="font-bold">{size}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Section: Images */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                        الصور والوسائط
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Image */}
                        <div className="md:col-span-1">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            الصورة الرئيسية
                          </label>
                          <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-gold transition-colors text-center group h-full flex flex-col items-center justify-center">
                            {productForm.image ? (
                              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md mb-3 group-hover:shadow-lg transition-all">
                                <img
                                  src={productForm.image}
                                  alt="Main"
                                  className="w-full h-full object-cover"
                                />
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                  <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50">
                                    تغيير الصورة
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        const url = URL.createObjectURL(
                                          e.target.files[0],
                                        );
                                        setProductForm({
                                          ...productForm,
                                          image: url,
                                        });
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex flex-col items-center gap-2 p-6 w-full h-full justify-center">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  <Upload size={20} />
                                </div>
                                <span className="text-sm text-gray-500 font-medium">
                                  اختر صورة رئيسية
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      const url = URL.createObjectURL(
                                        e.target.files[0],
                                      );
                                      setProductForm({
                                        ...productForm,
                                        image: url,
                                      });
                                    }
                                  }}
                                />
                              </label>
                            )}

                            {/* URL Input Fallback */}
                            <div className="w-full mt-2">
                              <input
                                type="text"
                                value={productForm.image || ""}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    image: e.target.value,
                                  })
                                }
                                placeholder="أو رابط صورة..."
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-gold/50 outline-none text-center text-gray-600 bg-white"
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Gallery */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            المعرض (صور إضافية)
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {productForm.media?.map((item, index) => (
                              <div
                                key={index}
                                className="aspect-[3/4] relative group rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-50"
                              >
                                {item.type === "video" ? (
                                  <video
                                    src={item.src}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={item.src}
                                    alt={`Gallery ${index}`}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newMedia = [
                                        ...(productForm.media || []),
                                      ];
                                      newMedia.splice(index, 1);
                                      setProductForm({
                                        ...productForm,
                                        media: newMedia,
                                      });
                                    }}
                                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm transform hover:scale-110"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Add New Media Button */}
                            <label className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 hover:border-brand-gold hover:bg-brand-gold/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group bg-gray-50/50">
                              <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 group-hover:border-brand-gold/30 flex items-center justify-center transition-colors">
                                <Plus
                                  size={16}
                                  className="text-gray-400 group-hover:text-brand-gold"
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 group-hover:text-brand-gold">
                                إضافة
                              </span>
                              <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    const newFiles = Array.from(
                                      e.target.files,
                                    ).map((file) => ({
                                      type: file.type.startsWith("video/")
                                        ? "video"
                                        : "image",
                                      src: URL.createObjectURL(file),
                                    }));
                                    setProductForm({
                                      ...productForm,
                                      media: [
                                        ...(productForm.media || []),
                                        ...newFiles,
                                      ],
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="mt-4">
                            <input
                              type="text"
                              placeholder="أو أضف رابط (صورة/فيديو) واضغط Enter..."
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all"
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  e.currentTarget.value
                                ) {
                                  e.preventDefault();
                                  const url = e.currentTarget.value;
                                  const isVideo =
                                    url.match(/\.(mp4|webm|ogg)$/i);
                                  setProductForm({
                                    ...productForm,
                                    media: [
                                      ...(productForm.media || []),
                                      {
                                        type: isVideo ? "video" : "image",
                                        src: url,
                                      },
                                    ],
                                  });
                                  e.currentTarget.value = "";
                                }
                              }}
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* FAQ Form */}
                {activeTab === "faqs" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        السؤال
                      </label>
                      <input
                        type="text"
                        value={faqForm.question}
                        onChange={(e) =>
                          setFaqForm({ ...faqForm, question: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                        placeholder="أدخل السؤال هنا..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة
                      </label>
                      <textarea
                        value={faqForm.answer}
                        onChange={(e) =>
                          setFaqForm({ ...faqForm, answer: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none h-32"
                        placeholder="أدخل الإجابة هنا..."
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-burgundy text-white py-4 rounded-lg font-bold hover:bg-brand-charcoal transition-colors mt-8"
                >
                  {isEditing ? "حفظ التغييرات" : "إضافة"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
