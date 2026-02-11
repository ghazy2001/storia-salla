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
  reviews: [],
  faqs: [],
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
