import React from "react";
import { Star, Trash2 } from "lucide-react";

const ReviewsTab = ({ reviews, handleDelete }) => {
  return (
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
};

export default ReviewsTab;
