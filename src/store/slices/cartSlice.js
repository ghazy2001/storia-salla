import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sallaService from "../../services/sallaService";

// Async thunk to fetch cart from Salla (Source of Truth)
export const fetchCartFromSalla = createAsyncThunk(
  "cart/fetchFromSalla",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Wait for Salla to be ready
      await sallaService.waitForSalla();

      // 2. Fetch Cart
      const response = await sallaService.getCart();

      if (response && response.data) {
        return response.data; // Should contain { items: [], total: ..., count: ... }
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  cartItems: [],
  count: 0,
  total: 0,
  loading: false,
  appliedCoupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Optimistic Updates (optional, can be kept for instant UI feedback)
    addToCartOptimistic: (state, action) => {
      // We can keep this for UI speed, but real data comes from Salla
      // For now, let's rely on the fetch to ensure truth
    },

    // Manual sync trigger if needed
    setCartData: (state, action) => {
      // Manual override
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartFromSalla.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartFromSalla.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;

        if (data) {
          // Map Salla Items to Internal Structure
          state.count = data.count || data.items_count || 0;
          state.total = data.total
            ? typeof data.total === "object"
              ? data.total.amount
              : data.total
            : 0;

          if (Array.isArray(data.items)) {
            state.cartItems = data.items.map((item) => ({
              id: item.product_id, // Internal ID usage
              itemId: item.id, // Specific Item ID in cart (for removal)
              name: item.product_title || item.name,
              price: item.price
                ? typeof item.price === "object"
                  ? item.price.amount
                  : item.price
                : 0,
              image: item.product_image || item.image,
              quantity: item.quantity,
              sallaProductId: item.product_id,
              options: item.options, // sizes etc
            }));
          }
        }
      })
      .addCase(fetchCartFromSalla.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addToCartOptimistic } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartCount = (state) => state.cart.count; // Direct count from Salla
export const selectCartTotal = (state) => state.cart.total;
export const selectCartLoading = (state) => state.cart.loading;

export default cartSlice.reducer;
