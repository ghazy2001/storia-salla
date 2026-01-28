import React, { useState } from "react";
import { CartContext } from "./CartContextType";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState("home");

  const addToCart = (product, quantity = 1, size = null) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === product.id && item.size === size,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prevItems, { ...product, quantity, size }];
    });
  };

  const removeFromCart = (productId, size = null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.size === size),
      ),
    );
  };

  const updateQuantity = (productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.size === size
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^\d.-]/g, ""));
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
