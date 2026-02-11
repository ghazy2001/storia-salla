import { Upload, X } from "lucide-react";
import { resolveAsset } from "../../../utils/assetUtils";

const ProductModal = ({
  isOpen,
  onClose,
  isEditing,
  productForm,
  setProductForm,
  handleSubmit,
  activeTab,
  faqForm,
  setFaqForm,
  bestSellersForm,
  setBestSellersForm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-8 text-center font-sans">
          {isEditing ? "تعديل" : "إضافة جديد"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Form */}
          {activeTab === "products" && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                  المعلومات الأساسية
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المنتج
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all"
                    placeholder="مثال: عباية نجد الرسمية"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all text-left"
                      placeholder="350"
                      dir="ltr"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      ر.س
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                  التفاصيل الوصف
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف المنتج
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all min-h-[120px]"
                    placeholder="اكتب وصفاً جذاباً للمنتج..."
                    required
                  />
                </div>
              </div>

              {/* Section: Category & Sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التصنيف
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all bg-white"
                  >
                    <option value="official">رسمي</option>
                    <option value="cloche">كلوش</option>
                    <option value="bisht">بشت</option>
                    <option value="classic">كلاسك (نواعم)</option>
                    <option value="practical">عملي</option>
                    <option value="luxury">فاخر</option>
                  </select>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المقاسات
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["S", "M", "L", "XL", "XXL"].map((size) => {
                      const isSelected = productForm.sizes?.includes(size);
                      return (
                        <label
                          key={size}
                          className={`cursor-pointer px-4 py-2 rounded-lg border transition-all duration-200 flex items-center justify-center min-w-[50px] text-sm ${
                            isSelected
                              ? "bg-brand-burgundy text-white border-brand-burgundy shadow-md transform scale-105"
                              : "bg-white text-gray-600 border-gray-200 hover:border-brand-burgundy/30 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const currentSizes = productForm.sizes || [];
                              if (e.target.checked) {
                                setProductForm({
                                  ...productForm,
                                  sizes: [...currentSizes, size],
                                });
                              } else {
                                setProductForm({
                                  ...productForm,
                                  sizes: currentSizes.filter((s) => s !== size),
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <span className="font-bold">{size}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section: Images */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                  الصور والوسائط
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Main Image */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الصورة الرئيسية
                    </label>
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-gold transition-colors text-center group h-full flex flex-col items-center justify-center">
                      {productForm.image ? (
                        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md mb-3 group-hover:shadow-lg transition-all">
                          <img
                            src={resolveAsset(productForm.image)}
                            alt="Main"
                            className="w-full h-full object-cover"
                          />
                          <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50">
                              تغيير الصورة
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  const url = URL.createObjectURL(
                                    e.target.files[0],
                                  );
                                  setProductForm({
                                    ...productForm,
                                    image: url,
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2 p-6 w-full h-full justify-center">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <Upload size={20} />
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            اختر صورة رئيسية
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const url = URL.createObjectURL(
                                  e.target.files[0],
                                );
                                setProductForm({ ...productForm, image: url });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      معرض الصور
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {productForm.media?.map((media, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
                        >
                          {media.type === "video" ? (
                            <video
                              src={media.src}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={resolveAsset(media.src)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newMedia = [...productForm.media];
                              newMedia.splice(idx, 1);
                              setProductForm({
                                ...productForm,
                                media: newMedia,
                              });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-gold hover:bg-brand-gold/5 transition-all text-gray-400 hover:text-brand-gold">
                        <Upload size={20} className="mb-1" />
                        <span className="text-xs">إضافة</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.length) {
                              const newMedia = Array.from(e.target.files).map(
                                (file) => ({
                                  type: file.type.startsWith("video")
                                    ? "video"
                                    : "image",
                                  src: URL.createObjectURL(file),
                                }),
                              );
                              setProductForm({
                                ...productForm,
                                media: [
                                  ...(productForm.media || []),
                                  ...newMedia,
                                ],
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* BestSellers Form */}
          {activeTab === "bestsellers" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                  المعلومات الأساسية (عربي)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان (AR)
                    </label>
                    <input
                      type="text"
                      value={bestSellersForm.title?.ar || ""}
                      onChange={(e) =>
                        setBestSellersForm({
                          ...bestSellersForm,
                          title: {
                            ...bestSellersForm.title,
                            ar: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all"
                      placeholder="العنوان بالعربي"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bestSellersForm.price || ""}
                        onChange={(e) =>
                          setBestSellersForm({
                            ...bestSellersForm,
                            price: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all text-left"
                        placeholder="320"
                        dir="ltr"
                        required
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                        {bestSellersForm.currency || "ر.س"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف (AR)
                  </label>
                  <textarea
                    value={bestSellersForm.description?.ar || ""}
                    onChange={(e) =>
                      setBestSellersForm({
                        ...bestSellersForm,
                        description: {
                          ...bestSellersForm.description,
                          ar: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all min-h-[100px]"
                    placeholder="الوصف بالعربي"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                  Banner Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Text (AR)
                    </label>
                    <input
                      type="text"
                      value={bestSellersForm.bannerText?.ar || ""}
                      onChange={(e) =>
                        setBestSellersForm({
                          ...bestSellersForm,
                          bannerText: {
                            ...bestSellersForm.bannerText,
                            ar: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CTA Text (AR)
                    </label>
                    <input
                      type="text"
                      value={bestSellersForm.ctaText?.ar || ""}
                      onChange={(e) =>
                        setBestSellersForm({
                          ...bestSellersForm,
                          ctaText: {
                            ...bestSellersForm.ctaText,
                            ar: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                  الصور والوسائط
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {bestSellersForm.media?.map((media, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
                    >
                      <img
                        src={resolveAsset(media.src)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newMedia = [...bestSellersForm.media];
                          newMedia.splice(idx, 1);
                          setBestSellersForm({
                            ...bestSellersForm,
                            media: newMedia,
                          });
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-gold hover:bg-brand-gold/5 transition-all text-gray-400 hover:text-brand-gold">
                    <Upload size={20} className="mb-1" />
                    <span className="text-xs">إضافة</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          const newMedia = Array.from(e.target.files).map(
                            (file) => ({
                              type: "image",
                              src: URL.createObjectURL(file), // Note: In a real app, you'd upload these
                              order: (bestSellersForm.media?.length || 0) + 1,
                            }),
                          );
                          setBestSellersForm({
                            ...bestSellersForm,
                            media: [
                              ...(bestSellersForm.media || []),
                              ...newMedia,
                            ],
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          {activeTab === "faqs" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السؤال
                </label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) =>
                    setFaqForm({
                      ...faqForm,
                      question: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all"
                  placeholder="اكتب السؤال هنا..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإجابة
                </label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) =>
                    setFaqForm({
                      ...faqForm,
                      answer: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all min-h-[120px]"
                  placeholder="اكتب الإجابة هنا..."
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 mt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-brand-burgundy text-white rounded-xl hover:bg-brand-charcoal font-medium transition-colors shadow-lg shadow-brand-burgundy/20"
            >
              {isEditing ? "حفظ التغييرات" : "إضافة تأكيد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
