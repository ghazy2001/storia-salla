import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Tag,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle2,
  XCircle,
  Save,
  Clock,
} from "lucide-react";
import axios from "axios";
import { config } from "../../../config/config";

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage",
    value: "",
    minOrderAmount: "",
    expiryDate: "",
    usageLimit: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/coupons`);
      setCoupons(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiUrl}/api/coupons`, newCoupon);
      fetchCoupons();
      setShowAddForm(false);
      setNewCoupon({
        code: "",
        discountType: "percentage",
        value: "",
        minOrderAmount: "",
        expiryDate: "",
        usageLimit: "",
      });
    } catch {
      alert("خطأ في إضافة الكوبون");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الكوبون؟")) {
      try {
        await axios.delete(`${config.apiUrl}/api/coupons/${id}`);
        fetchCoupons();
      } catch {
        alert("خطأ في الحذف");
      }
    }
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          إدارة كوبونات الخصم
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-burgundy text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-brand-gold transition-all shadow-lg"
        >
          {showAddForm ? <XCircle size={20} /> : <Plus size={20} />}
          <span>{showAddForm ? "إلغاء" : "إنشاء كوبون جديد"}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddCoupon}
          className="bg-white p-6 rounded-2xl shadow-sm border-2 border-brand-gold/20 animate-slide-up"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كود الخصم
              </label>
              <input
                type="text"
                required
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="مثلاً: STORIA10"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none"
              />
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الخصم
              </label>
              <select
                value={newCoupon.discountType}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, discountType: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (SAR)</option>
              </select>
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قيمة الخصم
              </label>
              <input
                type="number"
                required
                value={newCoupon.value}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, value: e.target.value })
                }
                placeholder="10"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none"
              />
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الانتهاء
              </label>
              <input
                type="date"
                required
                value={newCoupon.expiryDate}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, expiryDate: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none"
              />
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحد الأدنى للطلب
              </label>
              <input
                type="number"
                value={newCoupon.minOrderAmount}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })
                }
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none"
              />
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حد الاستخدام (اختياري)
              </label>
              <input
                type="number"
                value={newCoupon.usageLimit}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, usageLimit: e.target.value })
                }
                placeholder="لا يوجد حد"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-brand-gold text-brand-burgundy py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Save size={20} />
            <span>حفظ الكوبون</span>
          </button>
        </form>
      )}

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(coupons) ? coupons : []).map((coupon) => {
          const isExpired = new Date(coupon.expiryDate) < new Date();
          return (
            <div
              key={coupon._id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-1.5 h-full ${isExpired ? "bg-red-400" : "bg-green-400"}`}
              ></div>

              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-dashed border-gray-300">
                  <span className="text-xl font-black text-brand-burgundy tracking-widest">
                    {coupon.code}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Tag size={16} />
                    <span>قيمة الخصم</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {coupon.value}
                    {coupon.discountType === "percentage" ? "%" : " SAR"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={16} />
                    <span>ينتهي في</span>
                  </div>
                  <span
                    className={`text-sm ${isExpired ? "text-red-500 font-bold" : "text-gray-900"}`}
                  >
                    {new Date(coupon.expiryDate).toLocaleDateString("ar-SA")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>مرات الاستخدام</span>
                  </div>
                  <span className="text-sm text-gray-900 font-medium">
                    {coupon.usedCount} / {coupon.usageLimit || "∞"}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isExpired ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                  >
                    {isExpired ? (
                      <XCircle size={10} />
                    ) : (
                      <CheckCircle2 size={10} />
                    )}
                    {isExpired ? "منتهي" : "ساري"}
                  </div>
                  {coupon.minOrderAmount > 0 && (
                    <span className="text-[10px] text-gray-400">
                      الحد الأدنى: {coupon.minOrderAmount} ر.س
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CouponsTab;
