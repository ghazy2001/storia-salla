import { createSlice } from "@reduxjs/toolkit";

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

const getInitialReviews = () => {
  const saved = localStorage.getItem("storia_reviews");
  return saved ? JSON.parse(saved) : initialReviews;
};

const getInitialFAQs = () => {
  const saved = localStorage.getItem("storia_faqs");
  return saved ? JSON.parse(saved) : initialFAQs;
};

const initialState = {
  reviews: getInitialReviews(),
  faqs: getInitialFAQs(),
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    addReview: (state, action) => {
      const newReview = { ...action.payload, id: Date.now() };
      state.reviews.unshift(newReview);
      localStorage.setItem("storia_reviews", JSON.stringify(state.reviews));
    },
    deleteReview: (state, action) => {
      const id = action.payload;
      state.reviews = state.reviews.filter((r) => r.id !== id);
      localStorage.setItem("storia_reviews", JSON.stringify(state.reviews));
    },
    addFAQ: (state, action) => {
      const newFAQ = { ...action.payload, id: Date.now() };
      state.faqs.push(newFAQ);
      localStorage.setItem("storia_faqs", JSON.stringify(state.faqs));
    },
    updateFAQ: (state, action) => {
      const updatedFAQ = action.payload;
      const index = state.faqs.findIndex((f) => f.id === updatedFAQ.id);
      if (index !== -1) {
        state.faqs[index] = updatedFAQ;
        localStorage.setItem("storia_faqs", JSON.stringify(state.faqs));
      }
    },
    deleteFAQ: (state, action) => {
      const id = action.payload;
      state.faqs = state.faqs.filter((f) => f.id !== id);
      localStorage.setItem("storia_faqs", JSON.stringify(state.faqs));
    },
  },
});

export const { addReview, deleteReview, addFAQ, updateFAQ, deleteFAQ } =
  contentSlice.actions;

export const selectReviews = (state) => state.content.reviews;
export const selectFAQs = (state) => state.content.faqs;

export default contentSlice.reducer;
