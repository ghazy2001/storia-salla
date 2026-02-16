import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      theme: "green",
      selectedProductId: null,
      selectedCategory: "all",
      adminActiveTab: "products",
      contactFormOpen: false,
      trackOrderOpen: false,
      toast: { isVisible: false, message: "" },
    };
  }

  return {
    theme: localStorage.getItem("storia_theme") || "green",
    selectedProductId: localStorage.getItem("storia_selected_product_id"),
    selectedCategory: localStorage.getItem("storia_selected_category") || "all",
    adminActiveTab:
      localStorage.getItem("storia_admin_active_tab") || "products",
    contactFormOpen: false,
    trackOrderOpen: false,
    toast: { isVisible: false, message: "" },
  };
};

const initialState = getInitialState();

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("storia_theme", action.payload);
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "green" ? "burgundy" : "green";
      if (typeof window !== "undefined") {
        localStorage.setItem("storia_theme", state.theme);
      }
    },
    setSelectedProductId: (state, action) => {
      state.selectedProductId = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("storia_selected_product_id", action.payload);
        } else {
          localStorage.removeItem("storia_selected_product_id");
        }
      }
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("storia_selected_category", action.payload);
      }
    },
    setAdminActiveTab: (state, action) => {
      state.adminActiveTab = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("storia_admin_active_tab", action.payload);
      }
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
  setAdminActiveTab,
  setContactFormOpen,
  setTrackOrderOpen,
  showToast,
  hideToast,
} = uiSlice.actions;

export const selectTheme = (state) => state.ui.theme;
export const selectSelectedProductId = (state) => state.ui.selectedProductId;
export const selectSelectedCategory = (state) => state.ui.selectedCategory;
export const selectAdminActiveTab = (state) => state.ui.adminActiveTab;
export const selectContactFormOpen = (state) => state.ui.contactFormOpen;
export const selectTrackOrderOpen = (state) => state.ui.trackOrderOpen;
export const selectToast = (state) => state.ui.toast;

export default uiSlice.reducer;
