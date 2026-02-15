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

export const addCategoryAsync = createAsyncThunk(
  "product/addCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      return await sallaService.createCategory(categoryData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCategoryAsync = createAsyncThunk(
  "product/updateCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const { id, ...data } = categoryData;
      return await sallaService.updateCategory(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCategoryAsync = createAsyncThunk(
  "product/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await sallaService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunks for persistence
export const addProductAsync = createAsyncThunk(
  "product/add",
  async (productData, { rejectWithValue }) => {
    try {
      return await sallaService.createProduct(productData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateProductAsync = createAsyncThunk(
  "product/update",
  async (productData, { rejectWithValue }) => {
    try {
      const { ...data } = productData;
      // Handle both numeric IDs from mock and MongoDB ObjectIDs
      const productId = productData._id || productData.id;
      return await sallaService.updateProduct(productId, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteProductAsync = createAsyncThunk(
  "product/delete",
  async (id, { rejectWithValue }) => {
    try {
      await sallaService.deleteProduct(id);
      return id;
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
    // These remain as local-only fallbacks or for optimistic updates if needed
    // But we'll primarily use extraReducers now
    setProducts: (state, action) => {
      state.products = action.payload;
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
        if (Array.isArray(action.payload)) {
          console.log(
            "[Redux] Salla Products Fetched:",
            action.payload.length,
            action.payload,
          );
          // HYBRID MERGE: Keep local UI (names/images), take Salla business data (price/stock)
          state.products = state.products.map((localProduct) => {
            const sallaMatch = action.payload.find(
              (sp) =>
                sp.sallaProductId === localProduct.sallaProductId ||
                sp.id === localProduct.sallaProductId,
            );

            if (sallaMatch) {
              console.log(
                `[Redux] Merging Price for ${localProduct.name}: ${sallaMatch.price}`,
              );
              return {
                ...localProduct,
                price: sallaMatch.price, // Update price from Salla
                // sallaProductId: sallaMatch.id, // Update ID if it was missing
              };
            }
            return localProduct;
          });
        }
      })
      .addCase(fetchProductsFromSalla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Product
      .addCase(addProductAsync.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      // Update Product
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        const index = state.products.findIndex(
          (p) => (p._id || p.id) === (updatedProduct._id || updatedProduct.id),
        );
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      })
      // Delete Product
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.products = state.products.filter((p) => (p._id || p.id) !== id);
      })
      // Categories handle
      .addCase(fetchCategoriesFromSalla.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.categories = action.payload;
        }
      })
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const updatedCategory = action.payload;
        const index = state.categories.findIndex(
          (c) =>
            (c._id || c.id) === (updatedCategory._id || updatedCategory.id),
        );
        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.categories = state.categories.filter(
          (c) => (c._id || c.id) !== id,
        );
      })
      .addCase(addProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setProducts } = productSlice.actions;

// Re-export thunks for easier usage
export {
  addProductAsync as addProduct,
  updateProductAsync as updateProduct,
  deleteProductAsync as deleteProduct,
  addCategoryAsync as addCategory,
  updateCategoryAsync as updateCategory,
  deleteCategoryAsync as deleteCategory,
};

export const selectProducts = (state) => state.product.products;
export const selectCategories = (state) => state.product.categories;
export const selectProductsLoading = (state) => state.product.loading;
export const selectProductsError = (state) => state.product.error;

export default productSlice.reducer;
