import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, X, MessageCircle, Send } from "lucide-react";
import { useContent } from "../context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

const Reviews = ({ theme }) => {
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const { reviews, addReview } = useContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });

  // We actually need to render the list TWICE for a seamless loop
  const displayReviews = [...reviews, ...reviews];

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;

    addReview(newReview);
    setNewReview({ name: "", text: "", rating: 5 });
    setIsModalOpen(false);
  };

  return (
    <section
      ref={sectionRef}
      className={`py-24 transition-colors duration-500 border-t overflow-hidden relative ${
        theme === "green"
          ? "bg-brand-offwhite border-brand-charcoal/5"
          : "bg-brand-burgundy border-white/5"
      }`}
    >
      <div className="max-w-[1920px] mx-auto text-center px-6 md:px-12 mb-16">
        <h2
          className={`text-3xl md:text-4xl font-serif mb-2 ${
            theme === "green" ? "text-brand-charcoal" : "text-white"
          }`}
        >
          اراء العملاء
        </h2>
        <p
          className={`text-sm mb-8 tracking-wide opacity-70 ${
            theme === "green" ? "text-brand-charcoal" : "text-white"
          }`}
        >
          ماذا يقول عنا عملاؤنا؟
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden" dir="ltr">
        {/* Force LTR for correct marquee math */}
        <div className="flex gap-6 w-max px-6 animate-marquee" ref={sliderRef}>
          {displayReviews.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className={`review-card w-[65vw] max-w-[180px] md:min-w-[400px] md:max-w-none p-3 md:p-8 rounded-lg md:rounded-2xl text-center transition-all ${
                theme === "green"
                  ? "bg-white shadow-sm"
                  : "bg-white/5 border border-white/5"
              }`}
            >
              <div className="flex justify-center gap-1 text-brand-gold mb-3 md:mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < review.rating ? "currentColor" : "none"}
                    className={i < review.rating ? "opacity-100" : "opacity-30"}
                  />
                ))}
              </div>

              <p
                className={`text-sm md:text-lg font-serif leading-relaxed mb-3 md:mb-6 h-16 md:h-24 overflow-hidden ${
                  theme === "green" ? "text-brand-charcoal/80" : "text-white/80"
                }`}
              >
                "{review.text}"
              </p>

              <h3
                className={`font-bold text-xs md:text-sm tracking-widest ${
                  theme === "green" ? "text-brand-charcoal" : "text-white"
                }`}
              >
                - {review.name}
              </h3>
            </div>
          ))}
        </div>
        {/* Gradients for smooth fade edges */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-${theme === "green" ? "brand-offwhite" : "brand-burgundy"} to-transparent z-10 pointer-events-none`}
        ></div>
        <div
          className={`absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-${theme === "green" ? "brand-offwhite" : "brand-burgundy"} to-transparent z-10 pointer-events-none`}
        ></div>
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-xl ${
            theme === "green"
              ? "bg-brand-charcoal text-white hover:bg-brand-gold"
              : "bg-white text-brand-burgundy hover:bg-brand-gold hover:text-white"
          }`}
        >
          <span>أضف تعليقك</span>
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl ${theme === "green" ? "bg-white" : "bg-brand-burgundy border border-white/10"}`}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
            >
              <X size={20} />
            </button>

            <h3
              className={`text-2xl font-serif text-center mb-6 ${theme === "green" ? "text-brand-charcoal" : "text-white"}`}
            >
              شاركنا برأيك
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label
                  className={`block text-xs uppercase tracking-widest mb-2 ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                >
                  الاسم
                </label>
                <input
                  type="text"
                  required
                  className={`w-full p-4 rounded-xl text-right outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all ${
                    theme === "green"
                      ? "bg-gray-50 text-brand-charcoal"
                      : "bg-white/5 text-white"
                  }`}
                  value={newReview.name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, name: e.target.value })
                  }
                  placeholder="الاسم الكريم"
                />
              </div>

              <div>
                <label
                  className={`block text-xs uppercase tracking-widest mb-2 ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                >
                  التقييم
                </label>
                <div className="flex justify-end gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          star <= newReview.rating
                            ? "text-brand-gold fill-brand-gold"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs uppercase tracking-widest mb-2 ${theme === "green" ? "text-brand-charcoal/60" : "text-white/60"}`}
                >
                  التعليق
                </label>
                <textarea
                  required
                  rows="4"
                  className={`w-full p-4 rounded-xl text-right outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all resize-none ${
                    theme === "green"
                      ? "bg-gray-50 text-brand-charcoal"
                      : "bg-white/5 text-white"
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
                className="w-full py-4 mt-4 bg-brand-gold text-white rounded-xl font-bold hover:bg-brand-gold/90 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>إرسال</span>
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
