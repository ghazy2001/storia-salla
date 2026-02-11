import React from "react";

const OrdersTab = ({ orders }) => {
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

  return (
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
                key={order._id || order.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-6 font-medium text-gray-900" dir="ltr">
                  {order.orderNumber || order.id}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {order.customer?.name || order.customer}
                </td>
                <td className="py-4 px-6 text-gray-500 text-sm" dir="ltr">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US")
                    : order.date}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {order.items?.length || order.items}
                </td>
                <td className="py-4 px-6 font-bold text-brand-gold">
                  {order.total} ر.س
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
};

export default OrdersTab;
