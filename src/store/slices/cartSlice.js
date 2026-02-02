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
      let product = action.payload;
      let quantity = 1;
      let size = null;

      // Handle structured payload { product, quantity, size }
      if (action.payload.product) {
        product = action.payload.product;
        quantity = action.payload.quantity || 1;
        size = action.payload.size || null;
      }
      // Handle flat payload (product object directly)
      else {
        quantity = product.quantity || 1;
        size = product.selectedSize || product.size || null;
      }

      const finalSize = size || product.selectedSize;

      const existingItem = state.cartItems.find(
        (item) => item.id === product.id && item.size === finalSize,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({
          ...product,
          quantity,
          size: finalSize,
          selectedSize: finalSize,
        });
      }
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
    const price = parseFloat(item.price.replace(/[^\d.-]/g, ""));
    return total + price * item.quantity;
  }, 0);
export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
