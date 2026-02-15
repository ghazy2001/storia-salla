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

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async ({ itemId }, { dispatch, rejectWithValue }) => {
    try {
      const result = await sallaService.removeFromCart(itemId);
      if (result.success) {
        dispatch(fetchCartFromSalla());
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const result = await sallaService.updateCartItem(itemId, quantity);
      if (result.success) {
        dispatch(fetchCartFromSalla());
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const clearCartSalla = createAsyncThunk(
  "cart/clear",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Optimistic clear
      const result = await sallaService.clearCart();
      if (result.success) {
        dispatch(fetchCartFromSalla());
        return result.data;
      }
      return rejectWithValue(result.error);
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
  discount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Local coupon management (Salla handles this usually, but we keep local state for UI)
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
      // Simple percentage logic for demo - in real Salla, the total comes discounted
      if (action.payload.code === "SAVE10") {
        state.discount = state.total * 0.1;
      }
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;
    },

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
          state.count = data.count || data.items_count || 0;
          state.total = data.total
            ? typeof data.total === "object"
              ? data.total.amount
              : data.total
            : 0;

          // Helper to check if total changed significantly imply discount
          // For now, we trust Salla's total is the final price

          if (Array.isArray(data.items)) {
            state.cartItems = data.items.map((item) => ({
              id: item.product_id,
              itemId: item.id,
              name: item.product_title || item.name,
              price: item.price
                ? typeof item.price === "object"
                  ? item.price.amount
                  : item.price
                : 0,
              image: item.product_image || item.image,
              quantity: item.quantity,
              sallaProductId: item.product_id,
              options: item.options,
              selectedSize:
                item.options && item.options.length > 0
                  ? item.options[0].value
                  : null,
            }));
          }
        }
      })
      .addCase(fetchCartFromSalla.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addToCartOptimistic, applyCoupon, removeCoupon } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartCount = (state) => state.cart.count;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartLoading = (state) => state.cart.loading;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;
export const selectCartDiscount = (state) => state.cart.discount;

export default cartSlice.reducer;
