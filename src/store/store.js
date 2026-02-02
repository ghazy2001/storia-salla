import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import adminReducer from "./slices/adminSlice";
import productReducer from "./slices/productSlice";
import contentReducer from "./slices/contentSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    admin: adminReducer,
    product: productReducer,
    content: contentReducer,
    ui: uiReducer,
  },
});
