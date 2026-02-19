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

      if (!response) return null;

      // Handle varied response structures (some SDK versions return wrapped data, others direct)
      if (response.data && (response.data.items || response.data.count)) {
        return response.data;
      }

      if (response.items || response.count) {
        return response;
      }

      // Last ditch effort: maybe it's { status: 200, success: true, data: { cart: { ... } } }
      if (response.data && response.data.cart) {
        return response.data.cart;
      }

      return response; // Return whatever we got for reducer to inspect
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
    addToCartOptimistic: () => {
      // We can keep this for UI speed, but real data comes from Salla
      // For now, let's rely on the fetch to ensure truth
    },

    // Manual sync trigger if needed
    setCartData: () => {
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
          // Normalize data structure
          const items = data.items || (data.data && data.data.items) || [];
          const count =
            data.count ||
            data.items_count ||
            (data.data && data.data.count) ||
            0;
          const total = data.total || (data.data && data.data.total) || 0;

          // Map Salla Items to Internal Structure
          state.count = count;

          // Safe Total Parsing
          let safeTotal = 0;
          if (total) {
            if (typeof total === "object" && total.amount !== undefined) {
              safeTotal = parseFloat(total.amount);
            } else if (typeof total === "number") {
              safeTotal = total;
            } else if (typeof total === "string") {
              safeTotal = parseFloat(total.replace(/[^\d.-]/g, ""));
            }
          }
          state.total = isNaN(safeTotal) ? 0 : safeTotal;

          if (Array.isArray(items)) {
            state.cartItems = items.map((item) => ({
              id: item.product_id || item.id,
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
          } else {
            state.cartItems = [];
          }

          // Recalculate count from items if API returned 0 but we have items
          if (state.count === 0 && state.cartItems.length > 0) {
            state.count = state.cartItems.reduce(
              (acc, item) => acc + (item.quantity || 1),
              0,
            );
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
export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
export const selectCartTotal = (state) => state.cart.total;
export const selectCartLoading = (state) => state.cart.loading;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;
export const selectCartDiscount = (state) => state.cart.discount;

export default cartSlice.reducer;
