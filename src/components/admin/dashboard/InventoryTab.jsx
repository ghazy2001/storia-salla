import React, { useState } from "react";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowUpDown,
  TrendingDown,
  DollarSign,
  Save,
  RotateCcw,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../../store/slices/productSlice";
import { resolveAsset } from "../../../utils/assetUtils";

const InventoryTab = ({ products }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, low, out
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Flatten products with variants for easy filtering/display
  const flattenedInventory = products.flatMap((product) => {
    if (product.sizeVariants && product.sizeVariants.length > 0) {
      return product.sizeVariants.map((variant) => ({
        ...product,
        variantId: variant.size,
        variantPrice: variant.price,
        variantStock: variant.stock,
        variantCost: variant.cost || 0,
        isVariant: true,
      }));
    }
    return [
      {
        ...product,
        variantId: "Default",
        variantPrice: product.price,
        variantStock: product.stock || 0,
        variantCost: product.cost || 0,
        isVariant: false,
      },
    ];
  });

  const getStockStatus = (stock) => {
    if (stock <= 0)
      return {
        label: "نافذ",
        color: "text-red-600 bg-red-50",
        icon: <AlertCircle size={14} />,
      };
    if (stock <= 5)
      return {
        label: "منخفض",
        color: "text-orange-600 bg-orange-50",
        icon: <AlertTriangle size={14} />,
      };
    return {
      label: "متوفر",
      color: "text-green-600 bg-green-50",
      icon: <CheckCircle2 size={14} />,
    };
  };

  const filteredInventory = flattenedInventory.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const status = getStockStatus(item.variantStock).label;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "low" && status === "منخفض") ||
      (filterStatus === "out" && status === "نافذ");

    return matchesSearch && matchesStatus;
  });

  const totalValue = flattenedInventory.reduce(
    (acc, item) => acc + item.variantPrice * item.variantStock,
    0,
  );
  const totalItems = flattenedInventory.reduce(
    (acc, item) => acc + item.variantStock,
    0,
  );
  const outOfStockCount = flattenedInventory.filter(
    (item) => item.variantStock <= 0,
  ).length;

  const handleQuickUpdate = async (item) => {
    const product = products.find(
      (p) => p._id === item._id || p.id === item.id,
    );
    if (!product) return;

    let updatedProductData;
    if (item.isVariant) {
      const updatedVariants = product.sizeVariants.map((v) =>
        v.size === item.variantId
          ? {
              ...v,
              stock: parseInt(editForm.stock),
              cost: parseFloat(editForm.cost),
            }
          : v,
      );
      updatedProductData = {
        ...product,
        sizeVariants: updatedVariants,
        id: product._id || product.id,
      };
    } else {
      updatedProductData = {
        ...product,
        stock: parseInt(editForm.stock),
        cost: parseFloat(editForm.cost),
        id: product._id || product.id,
      };
    }

    try {
      await dispatch(updateProduct(updatedProductData)).unwrap();
      setEditingId(null);
    } catch (error) {
      alert("خطأ في التحديث: " + error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-brand-gold transition-all">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              إجمالي قيمة المخزون
            </p>
            <h4 className="text-2xl font-bold text-gray-900">
              {totalValue.toLocaleString()} ر.س
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-brand-burgundy transition-all">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              إجمالي القطع
            </p>
            <h4 className="text-2xl font-bold text-gray-900">
              {totalItems} قطعة
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-burgundy/10 flex items-center justify-center text-brand-burgundy group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-500 transition-all">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              منتجات نافذة
            </p>
            <h4 className="text-2xl font-bold text-gray-900">
              {outOfStockCount} صنف
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="بحث في المخزون..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {["all", "low", "out"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? "bg-brand-burgundy text-white shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {status === "all" ? "الكل" : status === "low" ? "منخفض" : "نافذ"}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  المنتج
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  المقاس
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  سعر البيع
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  التكلفة
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  المخزون
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  قيمة المخزون
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInventory.map((item, idx) => {
                const status = getStockStatus(item.variantStock);
                const uniqueKey = `${item._id || item.id}-${item.variantId}-${idx}`;
                const isEditing = editingId === uniqueKey;

                return (
                  <tr
                    key={uniqueKey}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveAsset(item.image)}
                          className="w-10 h-10 rounded-lg object-cover shadow-sm"
                          alt=""
                        />
                        <span className="font-bold text-gray-900 text-sm">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold ${item.isVariant ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"}`}
                      >
                        {item.variantId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {item.variantPrice}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.cost}
                          onChange={(e) =>
                            setEditForm({ ...editForm, cost: e.target.value })
                          }
                          className="w-20 px-2 py-1 border border-brand-gold rounded outline-none focus:ring-2 focus:ring-brand-gold/50 text-right"
                        />
                      ) : (
                        item.variantCost + " ر.س"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) =>
                            setEditForm({ ...editForm, stock: e.target.value })
                          }
                          className="w-20 px-2 py-1 border border-brand-gold rounded outline-none focus:ring-2 focus:ring-brand-gold/50 text-right"
                        />
                      ) : (
                        <span className="font-bold text-gray-900">
                          {item.variantStock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-gold text-sm">
                      {(item.variantPrice * item.variantStock).toLocaleString()}{" "}
                      ر.س
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickUpdate(item)}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 shadow-sm"
                          >
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(uniqueKey);
                            setEditForm({
                              stock: item.variantStock,
                              cost: item.variantCost,
                            });
                          }}
                          className="text-brand-burgundy hover:text-brand-gold text-xs font-bold border-b border-brand-burgundy hover:border-brand-gold transition-all"
                        >
                          تعديل سريع
                        </button>
                      )}
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

export default InventoryTab;
