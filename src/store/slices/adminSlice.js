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
      const email = action.payload;
      if (email === "sastoria60@gmail.com") {
        state.isAdmin = true;
        state.showLoginModal = false;
        localStorage.setItem("storia_admin_logged_in", "true");
      }
      // Note: If login/password validation fails, we might need to handle it in component or thunk
      // Check return value logic in original context:
      // return true/false. Reducers don't return values to the caller.
      // So the validation logic should ideally be in the component or a thunk.
      // However, for simplicity, we assume the component calls this ONLY if valid or we update state to reflect success/failure?
      // The original context did: if (email === ...) { setIsAdmin(true); return true; } return false;
      // We will just handle the state update here. The component can check the email before dispatching or we can add an error state.
      // To keep it simple and closest to original: Component validates or we trust the payload?
      // Actually, the email check IS the validation.
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

export const { login, logout, setShowLoginModal, toggleLoginModal } =
  adminSlice.actions;

export const selectIsAdmin = (state) => state.admin.isAdmin;
export const selectShowLoginModal = (state) => state.admin.showLoginModal;

export default adminSlice.reducer;
