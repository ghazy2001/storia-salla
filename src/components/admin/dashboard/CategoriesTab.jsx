import React from "react";
import { Edit2, Trash2, Folder } from "lucide-react";

const CategoriesTab = ({ categories, handleEdit, handleDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-16">
      <table className="w-full text-right">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-sm font-bold text-gray-500">القسم</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-500 text-center">
              الحالة
            </th>
            <th className="px-6 py-4 text-sm font-bold text-gray-500 text-center">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <tr
              key={cat._id || cat.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-gold">
                    <Folder size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {typeof cat.name === "object"
                        ? cat.name.ar
                        : cat.label || cat.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {typeof cat.description === "object"
                        ? cat.description.ar
                        : ""}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold ${
                    cat.isActive !== false
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {cat.isActive !== false ? "نشط" : "معطل"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesTab;
