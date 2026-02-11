import React from "react";
import { Edit2, Trash2, ExternalLink } from "lucide-react";
import { resolveAsset } from "../../../utils/assetUtils";
import sallaService from "../../../services/sallaService";

const ProductsTab = ({ products, handleEdit, handleDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
      {products.map((product) => (
        <div
          key={product._id || product.id}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow"
        >
          <div className="aspect-[3/4] relative">
            <img
              src={resolveAsset(product.image)}
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
                onClick={() => handleDelete(product)}
                className="bg-white p-2 rounded-full text-red-600 hover:bg-red-50 shadow-sm"
              >
                <Trash2 size={16} />
              </button>
              <a
                href={sallaService.getProductDashboardUrl(
                  product._id || product.id,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full text-brand-gold hover:bg-gold/5 shadow-sm"
                title="تعديل في سلة"
              >
                <ExternalLink size={16} />
              </a>
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
};

export default ProductsTab;
