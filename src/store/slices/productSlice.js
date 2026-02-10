import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { products as initialProducts } from "../../data/products";
import { NAV_LINKS as initialCategories } from "../../utils/constants";
import sallaService from "../../services/sallaService";

// Async thunk to fetch products from Salla
export const fetchProductsFromSalla = createAsyncThunk(
  "product/fetchFromSalla",
  async (_, { rejectWithValue }) => {
    try {
      const products = await sallaService.fetchProducts();
      return products; // Can return null, extraReducers handles it
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk to fetch categories from Salla
export const fetchCategoriesFromSalla = createAsyncThunk(
  "product/fetchCategoriesFromSalla",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await sallaService.fetchCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  products: initialProducts,
  categories: initialCategories,
  loading: false,
  error: null,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsFromSalla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsFromSalla.fulfilled, (state, action) => {
        state.loading = false;
        // If we got real products from Salla, replace initial mock products
        if (action.payload && action.payload.length > 0) {
          state.products = action.payload;
        }
      })
      .addCase(fetchProductsFromSalla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Categories handle
      .addCase(fetchCategoriesFromSalla.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.categories = action.payload;
        }
      });
  },
});

export const { addProduct, updateProduct, deleteProduct } =
  productSlice.actions;

export const selectProducts = (state) => state.product.products;
export const selectCategories = (state) => state.product.categories;
export const selectProductsLoading = (state) => state.product.loading;
export const selectProductsError = (state) => state.product.error;

export default productSlice.reducer;
