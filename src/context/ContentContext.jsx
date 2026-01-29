import React, { createContext, useContext, useState, useEffect } from "react";

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  // Initial Reviews Data
  const initialReviews = [
    {
      id: 1,
      name: "مها العتيبي",
      text: "التوصيل كان سريع جداً. المقاسات مضبوطة ونفس الصور للمنتج. أنصح بالشراء وبشدة. تجربة رائعة!",
      rating: 5,
    },
    {
      id: 2,
      name: "هدى الزهراني",
      text: "حبيت التصميم بس كنت أتمنى توضيح أفضل للون في الصور. لكن الجودة ممتازة وسأطلب مرة أخرى.",
      rating: 4,
    },
    {
      id: 3,
      name: "فاطمة الشمري",
      text: "خدمة ممتازة وارجاع سريع لما احتجت أبدل المقاس. أنصح للبنات اللي عايزين راحتهم وأناقة.",
      rating: 5,
    },
    {
      id: 4,
      name: "ريم الفاضل",
      text: "التغليف كان آمن والعباية رهيبة، القماش بارد ومناسب جداً للصيف. شكراً ستوريا على هذا الإبداع.",
      rating: 5,
    },
    {
      id: 5,
      name: "سارة محمد",
      text: "الخامة تهبل والتفاصيل دقيقة جداً. أحلى عباية طلبتها بحياتي، شكراً لكم!",
      rating: 5,
    },
    {
      id: 6,
      name: "نورة القحطاني",
      text: "تعامل راقي وسرعة في التوصيل. العباية فخمة وتنفع للمناسبات. أكيد مو آخر تعامل.",
      rating: 5,
    },
    {
      id: 7,
      name: "أمل الحربي",
      text: "جميلة جداً باللبس، القماش طايح ومرتب. وصلتني خلال يومين بس!",
      rating: 4,
    },
    {
      id: 8,
      name: "شروق العمري",
      text: "كل شي بيرفكت، من التغليف للعباية نفسها. تستاهلون كل ريال.",
      rating: 5,
    },
  ];

  // Initial FAQs Data
  const initialFAQs = [
    {
      id: 1,
      question: "ما هي أنواع العبايات التي توفرونها؟",
      answer:
        "نقدم مجموعة متنوعة من العبايات تشمل العبايات السوداء الكلاسيكية، العبايات الملونة، العبايات الرسمية، وعبايات المناسبات. نستخدم أجود أنواع الأقمشة مثل الكريب، الحرير، واللينن لضمان الراحة والأناقة.",
    },
    {
      id: 2,
      question: "هل جميع العبايات متوفرة بمقاسات مختلفة؟",
      answer:
        "نعم، معظم تصاميمنا تتوفر بمقاسات قياسية تتراوح من 50 إلى 60. كما يتوفر جدول مقاسات تفصيلي في صفحة كل منتج لمساعدتك في اختيار المقاس الأنسب.",
    },
    {
      id: 3,
      question: "هل يمكن تعديل الطول أو المقاس؟",
      answer:
        "نعم، نقدم خدمة التعديل للطول والمقاس لبعض الموديلات. يرجى التواصل مع خدمة العملاء عبر واتساب قبل الطلب للتأكد من إمكانية التعديل على الموديل المختار.",
    },
    {
      id: 4,
      question: "ما هي خامات العبايات المستخدمة؟",
      answer:
        "نحرص في ستوريا على اختيار أفضل الخامات العالمية. تشمل خاماتنا الكريب الملكي، الإنترنت، الحرير المغسول، والكتان الفاخر، لنضمن لك جودة تدوم ومظهراً فخماً.",
    },
    {
      id: 5,
      question: "كيف أختار المقاس المناسب لي؟",
      answer:
        "نعتمد نظام المقاسات القياسي (50-60). ننصحك بقياس طولك من الكتف إلى الأسفل ومقارنته بجدول المقاسات. إذا كنتِ مترددة، يفضل اختيار المقاس الأكبر لضمان الراحة، أو التواصل معنا للمساعدة.",
    },
    {
      id: 6,
      question: "هل العبايات متوفرة في فروع أو فقط أونلاين؟",
      answer:
        "حالياً، مبيعاتنا تتم حصرياً عبر متجرنا الإلكتروني. نوفر خدمة شحن سريع لجميع مناطق المملكة والخليج، مع سياسة استبدال واسترجاع مرنة لضمان تجربة تسوق مريحة.",
    },
  ];

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("storia_reviews");
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [faqs, setFaqs] = useState(() => {
    const saved = localStorage.getItem("storia_faqs");
    return saved ? JSON.parse(saved) : initialFAQs;
  });

  useEffect(() => {
    localStorage.setItem("storia_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("storia_faqs", JSON.stringify(faqs));
  }, [faqs]);

  // Review Actions
  const addReview = (review) => {
    setReviews((prev) => [{ ...review, id: Date.now() }, ...prev]);
  };

  const deleteReview = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // FAQ Actions
  const addFAQ = (faq) => {
    setFaqs((prev) => [...prev, { ...faq, id: Date.now() }]);
  };

  const updateFAQ = (updatedFAQ) => {
    setFaqs((prev) =>
      prev.map((faq) => (faq.id === updatedFAQ.id ? updatedFAQ : faq)),
    );
  };

  const deleteFAQ = (id) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <ContentContext.Provider
      value={{
        reviews,
        addReview,
        deleteReview,
        faqs,
        addFAQ,
        updateFAQ,
        deleteFAQ,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
