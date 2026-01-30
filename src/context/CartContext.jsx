import React, { useState } from "react";
import { CartContext } from "./CartContextType";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState("home");

  const addToCart = (product, quantity = 1, size = null) => {
    const finalSize = size || product.selectedSize;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === product.id && item.size === finalSize,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.size === finalSize
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prevItems,
        { ...product, quantity, size: finalSize, selectedSize: finalSize },
      ];
    });
  };

  const removeFromCart = (productId, size = null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.size === size),
      ),
    );
  };

  const updateItemSize = (productId, oldSize, newSize) => {
    if (oldSize === newSize) return;

    setCartItems((prevItems) => {
      const itemToUpdate = prevItems.find(
        (item) => item.id === productId && item.size === oldSize,
      );

      if (!itemToUpdate) return prevItems;

      const targetItem = prevItems.find(
        (item) => item.id === productId && item.size === newSize,
      );

      if (targetItem) {
        // Merge: Update target quantity and remove the old item
        return prevItems
          .map((item) => {
            if (item.id === productId && item.size === newSize) {
              return {
                ...item,
                quantity: item.quantity + itemToUpdate.quantity,
              };
            }
            return item;
          })
          .filter((item) => !(item.id === productId && item.size === oldSize));
      } else {
        // Just update size
        return prevItems.map((item) =>
          item.id === productId && item.size === oldSize
            ? { ...item, size: newSize, selectedSize: newSize }
            : item,
        );
      }
    });
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
        updateItemSize,
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
