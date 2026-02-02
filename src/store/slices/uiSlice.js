import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "green",
  selectedProductId: null,
  selectedCategory: "all",
  contactFormOpen: false,
  trackOrderOpen: false,
  toast: { isVisible: false, message: "" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "green" ? "burgundy" : "green";
    },
    setSelectedProductId: (state, action) => {
      state.selectedProductId = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setContactFormOpen: (state, action) => {
      state.contactFormOpen = action.payload;
    },
    setTrackOrderOpen: (state, action) => {
      state.trackOrderOpen = action.payload;
    },
    showToast: (state, action) => {
      state.toast = { isVisible: true, message: action.payload };
    },
    hideToast: (state) => {
      state.toast = { ...state.toast, isVisible: false };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSelectedProductId,
  setSelectedCategory,
  setContactFormOpen,
  setTrackOrderOpen,
  showToast,
  hideToast,
} = uiSlice.actions;

export const selectTheme = (state) => state.ui.theme;
export const selectSelectedProductId = (state) => state.ui.selectedProductId;
export const selectSelectedCategory = (state) => state.ui.selectedCategory;
export const selectContactFormOpen = (state) => state.ui.contactFormOpen;
export const selectTrackOrderOpen = (state) => state.ui.trackOrderOpen;
export const selectToast = (state) => state.ui.toast;

export default uiSlice.reducer;
