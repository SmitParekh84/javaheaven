import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { useUser } from "../../context/UserContext";

const Cart = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useCart();

  const [userInfo, setUserInfo] = useState({ username: "", email: "", address: "" });
  const [deliveryOption, setDeliveryOption] = useState("hand");
  const [loading, setLoading] = useState(false);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const totalAmount = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUserInfo = parseJwt(storedUser);
    if (parsedUserInfo) {
      setUser((prev) => ({
        ...prev,
        username: parsedUserInfo.username,
        email: parsedUserInfo.email,
      }));
    }
  }, []);

  const handleQuantityChange = useCallback(
    (item, change) => {
      const newQuantity = item.quantity + change;
      if (newQuantity < 1) {
        removeFromCart(item.id, item.size);
      } else {
        updateCartItemQuantity(item.id, item.size, newQuantity);
      }
    },
    [removeFromCart, updateCartItemQuantity]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const modifiedCartItems = cartItems.map((item) => ({
    id: item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
  }));
  const modifiedCartItemsCheck = cartItems.map(item => ({
    productId: item.id, // Use `productId` as expected by the backend
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
  }));
  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user.username) {
      toast.error("User not logged in. Please log in to place an order.");
      setLoading(false);
      return;
    }

    if (deliveryOption === "home" && (!userInfo.address || userInfo.address.trim() === "")) {
      toast.error("Address is required for home delivery.");
      setLoading(false);
      return;
    }


    try {
      // Verify stock availability
      const stockCheckResponse = await axios.post(`${API_URL}/api/stock/check-stock`, {
        cartItems: modifiedCartItemsCheck,
      });
      if (!stockCheckResponse.data.success) {
        toast.error(stockCheckResponse.data.message || "Insufficient stock for one or more items.");
        setLoading(false);
        return;
      }
      const response = await axios.post(`${API_URL}/api/create-checkout-session`, {
        userId: user.username,
        cartItems: modifiedCartItems,
        deliveryOption,  // Include the delivery option
        address: deliveryOption === "hand" ? "" : userInfo.address,  // Include the address if home delivery

        successUrl: `${window.location.origin}/order-success`,
        cancelUrl: `${window.location.origin}/cart`,
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      const errorMessage = error.response?.data?.message || "Checkout failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700">Redirecting to payment...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6 w-full  container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
      {/* Rest of your component structure here */}
      <div className="container mx-auto p-4 mt-2">
        <h2 className="text-4xl font-bold mb-8 text-center text-gray-900">Your Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <div className="h-screen">
            <div className="text-center p-6  rounded-lg">
              <p className="text-xl text-gray-700">Your cart is currently empty. Start adding some items!</p>
              <button
                onClick={() => navigate("/menu")}
                className="mt-4 px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-light transition duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div >
        ) : (
          // Display cart items if not empty
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {cartItems.map((item, index) => (
                <div key={index} className="flex flex-col justify-between p-6 bg-white shadow-lg rounded-lg transition-transform transform hover:scale-105">
                  <div>
                    <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-cover mb-4 rounded-lg shadow-md" />
                    <h3 className="font-semibold text-xl text-gray-900">{item.name}</h3>
                    <p className="text-gray-700 mt-1">Price: <span className="font-semibold">₹ {item.price.toFixed(2)}</span></p>
                    <p className="text-gray-700 mt-1">Size: <span className="font-semibold">{item.size}</span></p>
                    <p className="text-gray-800 mt-2 font-semibold">
                      Subtotal: <span className="text-secondary-light">₹ {(item.price * item.quantity).toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <button onClick={() => handleQuantityChange(item, -1)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg transition duration-200 hover:bg-gray-300">-</button>
                      <span className="mx-3 text-lg font-semibold">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item, 1)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg transition duration-200 hover:bg-gray-300">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-red-500 hover:text-red-700 transition duration-200">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary of Cart Items */}
        {cartItems.length > 0 && (
          <div className="mt-10">
            <h3 className="text-3xl font-bold mb-4 text-gray-900">Order Summary</h3>
            <div className="flex flex-col bg-white shadow-lg rounded-lg p-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between mb-2 text-lg text-gray-800">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>₹ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold text-lg text-gray-900">
                <span>Total Amount</span>
                <span>₹ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        {cartItems.length > 0 && (
          <form onSubmit={handleCheckout} className="mt-8 bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Checkout</h3>

            {/* Delivery Option Radio Buttons */}
            <div className="flex items-center mb-4">
              <input type="radio" id="hand" name="deliveryOption" value="hand" checked={deliveryOption === "hand"} onChange={() => setDeliveryOption("hand")} className="mr-2" />
              <label htmlFor="hand" className="text-gray-700">Hand to Hand</label>
            </div>
            <div className="flex items-center mb-4">
              <input type="radio" id="home" name="deliveryOption" value="home" checked={deliveryOption === "home"} onChange={() => setDeliveryOption("home")} className="mr-2" />
              <label htmlFor="home" className="text-gray-700">Home Delivery</label>
            </div>

            {deliveryOption === "home" && (
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={userInfo.address}
                onChange={handleInputChange}
                required
                className="border border-gray-300 p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}

            <button type="submit" className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-secondary-light transition duration-200">
              Proceed to Payment
            </button>
          </form>
        )}

      </div>
    </div>

  );

};

export default Cart;
