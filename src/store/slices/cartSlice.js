import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
  if (typeof window === "undefined") return [];
  const savedCart = localStorage.getItem("storia_cart");
  return savedCart ? JSON.parse(savedCart) : [];
};

const getInitialPage = () => {
  if (typeof window === "undefined") return "home";
  return localStorage.getItem("storia_current_page") || "home";
};

const initialState = {
  cartItems: getInitialCart(),
  currentPage: getInitialPage(),
  appliedCoupon: null,
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

      // Sync with localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("storia_cart", JSON.stringify(state.cartItems));
      }
    },
    removeFromCart: (state, action) => {
      const { productId, size } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !(item.id === productId && item.size === size),
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("storia_cart", JSON.stringify(state.cartItems));
      }
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

      if (typeof window !== "undefined") {
        localStorage.setItem("storia_cart", JSON.stringify(state.cartItems));
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

      if (typeof window !== "undefined") {
        localStorage.setItem("storia_cart", JSON.stringify(state.cartItems));
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("storia_cart");
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("storia_current_page", action.payload);
      }
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
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
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCurrentPage = (state) => state.cart.currentPage;
export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce((total, item) => {
    // Robust price parsing handles both numeric and string formats from various sources
    let priceValue = 0;
    if (typeof item.price === "number") {
      priceValue = item.price;
    } else if (typeof item.price === "string") {
      priceValue = parseFloat(item.price.replace(/[^\d.-]/g, ""));
    }

    return total + (isNaN(priceValue) ? 0 : priceValue) * item.quantity;
  }, 0);
export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;
export const selectCartDiscount = (state) => {
  const subtotal = selectCartTotal(state);
  const coupon = state.cart.appliedCoupon;
  if (!coupon) return 0;
  if (coupon.discountType === "percentage") {
    return (subtotal * coupon.value) / 100;
  }
  return coupon.value;
};

export default cartSlice.reducer;
