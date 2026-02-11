import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const FAQsTab = ({ faqs, handleEdit, handleDelete }) => {
  return (
    <div className="space-y-4 mb-16">
      {faqs.map((faq) => (
        <div
          key={faq._id || faq.id}
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
              onClick={() => handleDelete(faq)}
              className="text-red-500 hover:bg-red-50 p-2 rounded-full"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQsTab;
