import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBestSellers,
  selectBestSellers,
  updateBestSellersAction,
} from "../../../store/slices/contentSlice";
import { Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { resolveAsset } from "../../../utils/assetUtils";

const BestSellersTab = ({ handleEdit, handleDelete }) => {
  const bestSellers = useSelector(selectBestSellers);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBestSellers());
  }, [dispatch]);

  const toggleActive = async (item) => {
    try {
      await dispatch(
        updateBestSellersAction({ id: item._id, isActive: !item.isActive }),
      ).unwrap();
    } catch (error) {
      alert(`خطأ في التحديث: ${error}`);
    }
  };

  return (
    <div className="space-y-6 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bestSellers.map((item) => (
          <div
            key={item._id}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${
              item.isActive
                ? "border-brand-burgundy/30 ring-1 ring-brand-burgundy/10"
                : "border-gray-100"
            }`}
          >
            {/* Image Preview */}
            <div className="aspect-[4/3] bg-gray-100 relative group">
              <img
                src={resolveAsset(item.media?.[0]?.src || "/assets/logo.png")}
                alt={item.title?.ar}
                className="w-full h-full object-cover"
              />
              {!item.isActive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-medium">غير نشط</span>
                </div>
              )}
              {item.isActive && (
                <div className="absolute top-3 right-3 bg-brand-burgundy text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <CheckCircle2 size={12} />
                  <span>نشط حالياً</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 line-clamp-1">
                  {item.title?.ar || "بدون عنوان"}
                </h3>
                <span className="text-brand-gold font-bold">{item.price}</span>
              </div>

              <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                {item.description?.ar}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <button
                  onClick={() => toggleActive(item)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                    item.isActive
                      ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      : "bg-brand-burgundy text-white hover:bg-brand-charcoal"
                  }`}
                >
                  {item.isActive ? "إلغاء التنشيط" : "تنشيط"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {bestSellers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">
              لا يوجد إعدادات للأكثر مبيعاً حالياً
            </p>
            <p className="text-sm text-gray-400">انقر على "إضافة جديد" للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellersTab;
