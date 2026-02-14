import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Search,
  ExternalLink,
  Edit3,
  Save,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { config } from "../../../config/config";
import { useDispatch } from "react-redux";
import { fetchOrders } from "../../../store/slices/dashboardSlice";

const OrdersTab = ({ orders }) => {
  const dispatch = useDispatch();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", trackingNumber: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "مكتمل",
          color: "text-green-600 bg-green-50",
          icon: <CheckCircle2 size={14} />,
        };
      case "processing":
        return {
          label: "قيد التجهيز",
          color: "text-blue-600 bg-blue-50",
          icon: <Package size={14} />,
        };
      case "shipped":
        return {
          label: "تم الشحن",
          color: "text-purple-600 bg-purple-50",
          icon: <Truck size={14} />,
        };
      case "cancelled":
        return {
          label: "ملغي",
          color: "text-red-600 bg-red-50",
          icon: <XCircle size={14} />,
        };
      case "paid":
        return {
          label: "مدفوع",
          color: "text-emerald-600 bg-emerald-50",
          icon: <CreditCard size={14} />,
        };
      default:
        return {
          label: status,
          color: "text-gray-600 bg-gray-50",
          icon: <Clock size={14} />,
        };
    }
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      await axios.put(`${config.apiUrl}/api/orders/admin/${orderId}`, editForm);
      dispatch(fetchOrders());
      setEditingId(null);
    } catch {
      alert("خطأ في تحديث الطلب");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="بحث بمعرف الطلب أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الطلب
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  التفاصيل
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  رقم التتبع
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => {
                const isEditing = editingId === order._id;
                const statusInfo = getStatusInfo(order.status);

                return (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-gray-900 text-sm"
                          dir="ltr"
                        >
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ar-SA",
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                          {(order.customer?.name || "ع").charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {order.customer?.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {order.customer?.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-gold">
                          {order.total} ر.س
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.items?.length} منتجات
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className="text-xs border rounded-lg p-1 outline-none focus:ring-1 focus:ring-brand-gold"
                        >
                          <option value="pending">معلق</option>
                          <option value="paid">مدفوع</option>
                          <option value="processing">تجهيز</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.trackingNumber}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              trackingNumber: e.target.value,
                            })
                          }
                          placeholder="رقم الشحنة"
                          className="text-xs border rounded-lg p-1 w-24 outline-none focus:ring-1 focus:ring-brand-gold"
                        />
                      ) : (
                        <span className="text-xs text-gray-500">
                          {order.trackingNumber || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {isEditing ? (
                          <button
                            onClick={() => handleUpdateOrder(order._id)}
                            className="bg-green-500 text-white p-1.5 rounded-lg hover:bg-green-600 shadow-sm"
                          >
                            <Save size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(order._id);
                              setEditForm({
                                status: order.status,
                                trackingNumber: order.trackingNumber || "",
                              });
                            }}
                            className="bg-gray-100 text-gray-600 p-1.5 rounded-lg hover:bg-gray-200"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button className="bg-gray-100 text-gray-600 p-1.5 rounded-lg hover:bg-gray-200">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
