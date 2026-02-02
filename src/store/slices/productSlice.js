import { createSlice } from "@reduxjs/toolkit";
import { products as initialProducts } from "../../data/products";

const initialState = {
  products: initialProducts,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const newProduct = action.payload;
      const maxId =
        state.products.length > 0
          ? Math.max(...state.products.map((p) => p.id))
          : 0;
      state.products.unshift({
        ...newProduct,
        id: maxId + 1,
      });
    },
    updateProduct: (state, action) => {
      const updatedProduct = action.payload;
      const index = state.products.findIndex((p) => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
    },
    deleteProduct: (state, action) => {
      const id = action.payload;
      state.products = state.products.filter((p) => p.id !== id);
    },
  },
});

export const { addProduct, updateProduct, deleteProduct } =
  productSlice.actions;

export const selectProducts = (state) => state.product.products;

export default productSlice.reducer;
