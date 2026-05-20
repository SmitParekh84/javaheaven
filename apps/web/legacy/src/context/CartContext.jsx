import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API_URL } from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const isMounted = useRef(false);
    const [cartItems, setCartItems] = useState(() => {
        const savedToken = localStorage.getItem('carttoken');
        if (savedToken) {
            try {
                const decoded = JSON.parse(atob(savedToken));
                return decoded.cartItems || []; // Fallback to empty array if no cart items
            } catch (error) {
                console.error('Error decoding cart token:', error);
                return [];
            }
        }
        return [];
    });
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    };
    // Fetch cart items when user logs in
    useEffect(() => {
        const storedUserInfo = localStorage.getItem("user");
        const parsedUserInfo = parseJwt(storedUserInfo);

        if (parsedUserInfo && parsedUserInfo._id) {
            fetchCartItems(parsedUserInfo._id);
        }
    }, []);
    const fetchCartItems = async (userId) => {
        try {
            // console.log('Fetching cart items for user:', userId);
            const response = await fetch(`${API_URL}/api/users/cart/${userId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch cart items');
            }
            setCartItems(data.cart || []); // Ensure fallback to empty array
            // console.log('Fetched cart items:', data.cart);
        } catch (error) {
            console.error('Error fetching cart items:', error);
        }
    };

    const createCartToken = (items) => {
        return btoa(JSON.stringify({ cartItems: items })); // No secret included
    };

    const updateCartOnServer = async () => {
        try {
            const storedUserInfo = localStorage.getItem("user");
            const parsedUserInfo = parseJwt(storedUserInfo);

            if (!parsedUserInfo || !parsedUserInfo.userId) {
                console.error("User information is not available.");
                return;
            }

            const userId = parsedUserInfo.userId;
            const response = await fetch(`${API_URL}/api/users/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId, cartItems }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update cart on server');
            }
            // console.log('Cart updated on server:', data);
        } catch (error) {
            console.error('Error updating cart on server:', error);
        }
    };



    // Update localStorage and sync to server whenever cartItems change (skip initial mount)
    useEffect(() => {
        const token = createCartToken(cartItems);
        localStorage.setItem('carttoken', token);

        if (isMounted.current) {
            updateCartOnServer();
        } else {
            isMounted.current = true;
        }
    }, [cartItems]);

    const addToCart = (newItem) => {
        setCartItems((prevItems) => {

            const existingItemIndex = prevItems.findIndex(

                (item) => {
                    return item._id === newItem.id && item.size === newItem.size
                }
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
                return updatedItems;
            } else {
                return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }];
            }
        });
    };

    const removeFromCart = (itemId, itemSize) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => !(item.id === itemId && item.size === itemSize))
        );
    };

    const updateCartItemQuantity = (itemId, itemSize, newQuantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId && item.size === itemSize
                    ? { ...item, quantity: Math.max(newQuantity, 1) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('carttoken');
    };

    return (
        <CartContext.Provider
            value={{ cartItems, setCartItems, addToCart, removeFromCart, updateCartItemQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
};
