import React, { useState } from "react";
import {
  Star,
  MessageCircle,
  Send,
  X,
  Quote,
  BadgeCheck,
  Plus,
} from "lucide-react";
import { useContent } from "../context/ContentContext";

const Reviews = ({ theme }) => {
  const { reviews, addReview } = useContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });
  // Duplicate reviews for seamless marquee
  const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;
    addReview(newReview);
    setNewReview({ name: "", text: "", rating: 5 });
    setIsModalOpen(false);
  };

  return (
    <section
      className={`py-24 relative overflow-hidden transition-colors duration-500 ${
        theme === "green" ? "bg-brand-offwhite" : "bg-brand-burgundy"
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="text-right w-full md:w-auto mb-8 md:mb-0 order-2 md:order-1">
            <h2
              className={`text-3xl md:text-5xl font-serif mb-4 ${
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }`}
            >
              اراء العملاء
            </h2>
            <p
              className={`text-sm tracking-wide opacity-70 ${
                theme === "green" ? "text-brand-charcoal" : "text-white"
              }`}
            >
              تجارب استثنائية لأشخاص يقدرون الفخامة
            </p>
          </div>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden" dir="ltr">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6">
            {duplicatedReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className={`w-[85vw] md:w-[400px] p-8 rounded-3xl relative group transition-all duration-300 hover:-translate-y-2 ${
                  theme === "green"
                    ? "bg-white/80 backdrop-blur-sm border border-brand-charcoal/5 shadow-sm hover:shadow-xl"
                    : "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10"
                }`}
                dir="rtl"
              >
                {/* Decorative Quote */}
                <Quote
                  className={`absolute top-6 left-6 opacity-10 rotate-180 transition-opacity group-hover:opacity-20 ${
                    theme === "green" ? "text-brand-charcoal" : "text-white"
                  }`}
                  size={48}
                />

                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-right">
                    <h3
                      className={`font-bold text-sm tracking-wide flex items-center gap-2 ${
                        theme === "green" ? "text-brand-charcoal" : "text-white"
                      }`}
                    >
                      <BadgeCheck
                        size={14}
                        className="text-brand-gold"
                        fill="currentColor"
                      />
                      {review.name}
                    </h3>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={
                            i < review.rating
                              ? "text-brand-gold fill-brand-gold"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p
                  className={`text-sm md:text-base font-serif leading-relaxed line-clamp-4 ${
                    theme === "green"
                      ? "text-brand-charcoal/80"
                      : "text-white/80"
                  }`}
                >
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="flex justify-center mt-12 relative z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-xl ${
            theme === "green"
              ? "bg-brand-charcoal text-white hover:bg-brand-gold"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
          }`}
        >
          <span>أضف تعليقك</span>
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Existing Modal Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 dir-rtl">
          <div
            className={`relative w-full max-w-lg p-10 rounded-[2rem] shadow-2xl transform transition-all scale-100 ${theme === "green" ? "bg-white" : "bg-brand-burgundy border border-white/10"}`}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-6 left-6 p-2 rounded-full hover:bg-black/5 transition-colors ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
            >
              <X size={24} />
            </button>

            <h3
              className={`text-3xl font-serif text-center mb-2 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
            >
              شاركنا برأيك
            </h3>
            <p
              className={`text-center text-sm mb-8 opacity-60 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
            >
              رأيك يهمنا ويساعدنا في التطور
            </p>

            <form onSubmit={handleAddReview} className="space-y-6">
              <div className="space-y-2">
                <label
                  className={`block text-xs uppercase tracking-widest ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                >
                  الاسم
                </label>
                <input
                  type="text"
                  required
                  className={`w-full p-4 rounded-xl text-right outline-none ring-1 focus:ring-2 focus:ring-brand-gold transition-all ${
                    theme === "green"
                      ? "bg-gray-50 ring-gray-200 text-brand-charcoal"
                      : "bg-white/5 ring-white/10 text-white"
                  }`}
                  value={newReview.name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, name: e.target.value })
                  }
                  placeholder="الاسم الكريم"
                />
              </div>

              <div className="space-y-2">
                <label
                  className={`block text-xs uppercase tracking-widest ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                >
                  التقييم
                </label>
                <div className="flex justify-end gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          star <= newReview.rating
                            ? "text-brand-gold fill-brand-gold"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className={`block text-xs uppercase tracking-widest ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                >
                  التعليق
                </label>
                <textarea
                  required
                  rows="4"
                  className={`w-full p-4 rounded-xl text-right outline-none ring-1 focus:ring-2 focus:ring-brand-gold transition-all resize-none ${
                    theme === "green"
                      ? "bg-gray-50 ring-gray-200 text-brand-charcoal"
                      : "bg-white/5 ring-white/10 text-white"
                  }`}
                  value={newReview.text}
                  onChange={(e) =>
                    setNewReview({ ...newReview, text: e.target.value })
                  }
                  placeholder="اكتب تجربتك هنا..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-4 bg-brand-gold text-white rounded-xl font-bold hover:bg-brand-gold/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <span>إرسال التقييم</span>
                <Send size={18} className="rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
