import React from "react";
import {
  BarChart3,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";

const AnalyticsTab = () => {
  return (
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
};

export default AnalyticsTab;
