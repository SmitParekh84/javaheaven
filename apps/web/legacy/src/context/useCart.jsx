import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync cartItems with local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart, handling duplicate items based on id and size
  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && item.size === newItem.size
      );

      if (existingItemIndex >= 0) {
        // If the item already exists, update its quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
        return updatedItems;
      } else {
        // Add a new item with a default quantity of 1
        return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
  };

  // Remove an item from the cart based on id and size
  const removeFromCart = (id, size) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => !(item.id === id && item.size === size));
      return updatedItems.length < prevItems.length ? updatedItems : prevItems;
    });
  };

  // Update the quantity of an item, ensuring it doesn't go below 1
  const updateCartItemQuantity = (id, size, newQuantity) => {
    if (newQuantity < 1) return; // Prevent negative quantities
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear all items from the cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateCartItemQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
