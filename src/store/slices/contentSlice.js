import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sallaService from "../../services/sallaService";

// Async thunks for FAQs
export const fetchFAQs = createAsyncThunk(
  "content/fetchFAQs",
  async (_, { rejectWithValue }) => {
    try {
      return await sallaService.fetchFAQs();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addFAQ = createAsyncThunk(
  "content/addFAQ",
  async (faqData, { rejectWithValue }) => {
    try {
      return await sallaService.createFAQ(faqData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateFAQ = createAsyncThunk(
  "content/updateFAQ",
  async (faqData, { rejectWithValue }) => {
    try {
      const { id, ...data } = faqData;
      return await sallaService.updateFAQ(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteFAQ = createAsyncThunk(
  "content/deleteFAQ",
  async (id, { rejectWithValue }) => {
    try {
      await sallaService.deleteFAQ(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunks for Reviews
export const fetchReviews = createAsyncThunk(
  "content/fetchReviews",
  async (_, { rejectWithValue }) => {
    try {
      return await sallaService.fetchReviews();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addReview = createAsyncThunk(
  "content/addReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      return await sallaService.createReview(reviewData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteReview = createAsyncThunk(
  "content/deleteReview",
  async (id, { rejectWithValue }) => {
    try {
      await sallaService.deleteReview(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  reviews: [
    {
      id: 1,
      name: "سارة محمد",
      rating: 5,
      text: "العباية تجنن! القماش فخم وسواده يجنن، والتطريز نظيف ومرتب. التغليف يفتح النفس، أكيد مو آخر تعامل.",
    },
    {
      id: 2,
      name: "نورة العتيبي",
      rating: 5,
      text: "وصلتني العباية اليوم، خيال تبارك الرحمن! المقاس مضبوط والقصة روعة. شكراً ستوريا على هذا الإبداع.",
    },
    {
      id: 3,
      name: "أمل عبدالله",
      rating: 5,
      text: "خدمة العملاء جداً راقين، والعباية وصلت بسرعة. الخامة باردة ومناسبة للصيف. أنصح فيها وبقوة.",
    },
    {
      id: 4,
      name: "ريم خالد",
      rating: 5,
      text: "فخامة من الآخر! العباية تواجه للمناسبات، كل من شافها سألني عنها. تستاهلون كل ريال.",
    },
  ],
  faqs: [
    {
      question: "كم يستغرق الشحن والتوصيل؟",
      answer:
        "يستغرق الشحن داخل الرياض من 1-3 أيام عمل، ولمناطق المملكة الأخرى من 3-7 أيام عمل. نسعى دائماً لتوصيل طلباتكم في أسرع وقت ممكن.",
    },
    {
      question: "هل يمكن استبدال أو استرجاع العباية؟",
      answer:
        "نعم، يمكنكم استبدال أو استرجاع المنتج خلال 3 أيام من تاريخ الاستلام، بشرط أن يكون بحالته الأصلية وغير مستخدم. تطبق الشروط والأحكام.",
    },
    {
      question: "كيف أعرف مقاسي المناسب؟",
      answer:
        "يمكنكم الاطلاع على جدول المقاسات المرفق في صفحة كل منتج. نعتمد المقاسات المعيارية للعبايات (50, 52, 54, 56, 58, 60).",
    },
    {
      question: "هل توجد خدمة تفصيل حسب الطلب؟",
      answer:
        "نعتذر، حالياً نوفر المقاسات المعيارية الموضحة في الموقع فقط لضمان سرعة التوصيل وجودة الإنتاج.",
    },
    {
      question: "كيف أعتني بالعباية؟",
      answer:
        "نوصي بغسل العباية يدوياً بماء بارد وشامبو عبايات خاص، وتجفيفها بالظل للحفاظ على جودة القماش واللون الأسود.",
    },
  ],
  loading: false,
  error: null,
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FAQs
      .addCase(fetchFAQs.fulfilled, (state, action) => {
        if (action.payload) state.faqs = action.payload;
      })
      .addCase(addFAQ.fulfilled, (state, action) => {
        state.faqs.push(action.payload);
      })
      .addCase(updateFAQ.fulfilled, (state, action) => {
        const index = state.faqs.findIndex(
          (f) => (f._id || f.id) === (action.payload._id || action.payload.id),
        );
        if (index !== -1) {
          state.faqs[index] = action.payload;
        }
      })
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter(
          (f) => (f._id || f.id) !== action.payload,
        );
      })
      // Reviews
      .addCase(fetchReviews.fulfilled, (state, action) => {
        if (action.payload) state.reviews = action.payload;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(
          (r) => (r._id || r.id) !== action.payload,
        );
      });
  },
});

export const selectReviews = (state) => state.content.reviews;
export const selectFAQs = (state) => state.content.faqs;
export const selectContentLoading = (state) => state.content.loading;
export const selectContentError = (state) => state.content.error;

export default contentSlice.reducer;
