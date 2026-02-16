import { createSlice } from "@reduxjs/toolkit";

const getInitialAdminState = () => {
  const loggedIn = localStorage.getItem("storia_admin_logged_in");
  return loggedIn === "true";
};

const initialState = {
  isAdmin: getInitialAdminState(),
  showLoginModal: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    login: (state, action) => {
      const { email } = action.payload;
      // Fixed Admin Credentials (could be moved to env vars)
      const ADMIN_EMAIL = "sastoria60@gmail.com";

      if (email === ADMIN_EMAIL) {
        state.isAdmin = true;
        state.showLoginModal = false;
        state.loginError = null;
        localStorage.setItem("storia_admin_logged_in", "true");
      } else {
        state.loginError = "بيانات الدخول غير صحيحة";
      }
    },
    setLoginError: (state, action) => {
      state.loginError = action.payload;
    },
    logout: (state) => {
      state.isAdmin = false;
      localStorage.removeItem("storia_admin_logged_in");
    },
    setShowLoginModal: (state, action) => {
      state.showLoginModal = action.payload;
    },
    toggleLoginModal: (state) => {
      if (!state.isAdmin) {
        state.showLoginModal = !state.showLoginModal;
      }
    },
  },
});

export const {
  login,
  logout,
  setShowLoginModal,
  toggleLoginModal,
  setLoginError,
} = adminSlice.actions;

export const selectIsAdmin = (state) => state.admin.isAdmin;
export const selectShowLoginModal = (state) => state.admin.showLoginModal;
export const selectLoginError = (state) => state.admin.loginError;

export default adminSlice.reducer;
