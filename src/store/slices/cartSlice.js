import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  currentPage: "home",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size = null } = action.payload;

      // Defensive check to ensure we have a valid product object
      if (!product || !product.id) {
        console.error("Invalid product added to cart:", product);
        return;
      }

      const existingItem = state.cartItems.find(
        (item) => item.id === product.id && item.size === size,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({
          ...product,
          quantity,
          size,
          selectedSize: size, // Keep selectedSize for compatibility if needed, or remove if fully migrated
        });
      }

      // Sync with Salla cart (async operation, fire and forget)
      // Note: This will be handled by middleware or thunk in production
      // For now, we'll add a comment indicating where Salla sync should happen
      // The actual syncing will be done via the component that dispatches this action
    },
    removeFromCart: (state, action) => {
      const { productId, size } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !(item.id === productId && item.size === size),
      );
    },
    updateItemSize: (state, action) => {
      const { productId, oldSize, newSize } = action.payload;
      if (oldSize === newSize) return;

      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === productId && item.size === oldSize,
      );
      if (itemIndex === -1) return;

      const itemToUpdate = state.cartItems[itemIndex];
      const targetItemIndex = state.cartItems.findIndex(
        (item) => item.id === productId && item.size === newSize,
      );

      if (targetItemIndex !== -1) {
        // Merge: Add quantity to target and remove old item
        state.cartItems[targetItemIndex].quantity += itemToUpdate.quantity;
        state.cartItems.splice(itemIndex, 1);
      } else {
        // Just update size
        itemToUpdate.size = newSize;
        itemToUpdate.selectedSize = newSize;
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity, size } = action.payload;
      if (quantity <= 0) {
        state.cartItems = state.cartItems.filter(
          (item) => !(item.id === productId && item.size === size),
        );
        return;
      }

      const item = state.cartItems.find(
        (item) => item.id === productId && item.size === size,
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateItemSize,
  updateQuantity,
  clearCart,
  setCurrentPage,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCurrentPage = (state) => state.cart.currentPage;
export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce((total, item) => {
    if (!item.price || typeof item.price !== "string") return total;
    const price = parseFloat(item.price.replace(/[^\d.-]/g, ""));
    return total + (isNaN(price) ? 0 : price) * item.quantity;
  }, 0);
export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
