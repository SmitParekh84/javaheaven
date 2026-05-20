import React, { useEffect, useRef, useState } from "react";
import { useCart } from "../../context/CartContext";
import axios from "axios";
import { API_URL } from "../../config";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const OrderSuccess = () => {
    const [loading, setLoading] = useState(true);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { search } = useLocation();
    const sessionId = new URLSearchParams(search).get("session_id");

    // Ref to prevent multiple order placement
    const hasPlacedOrderRef = useRef(false);

    useEffect(() => {
        const placeOrder = async () => {
          if (!sessionId || hasPlacedOrderRef.current) return;
      
          try {
            hasPlacedOrderRef.current = true;
      
            const sessionResponse = await axios.get(`${API_URL}/api/verify-payment-session?session_id=${sessionId}`);
            const session = sessionResponse.data;
      
            if (session.payment_status === "paid") {
              await axios.post(`${API_URL}/api/orders`, {
                userId: session.metadata.userId,
                cartItems: JSON.parse(session.metadata.cartItems),
                deliveryOption: session.metadata.deliveryOption,
                address: session.metadata.address || "",  // Use the address passed in metadata
              });
      
              // console.log("Order address:", session.metadata.address); // Check the address value
              
              clearCart();
              setOrderPlaced(true);
              toast.success("Order placed successfully!");
            } else {
              toast.error("Payment was not completed.");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Order could not be placed. Please try again.");
          } finally {
            setLoading(false);
          }
        };
      
        placeOrder();
      }, [sessionId, clearCart]);
      
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-700">Verifying your payment...</p>
            </div>
        );
    }

    // If order is not placed, show failure message
    if (!orderPlaced) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl font-semibold text-red-600">Order placement failed.</h1>
                <button onClick={() => navigate("/")} className="mt-4 px-6 py-3 w-full sm:w-auto  bg-secondary text-white font-semibold text-lg rounded-lg 
                hover:bg-secondary-light shadow-md transition duration-200 transform hover:scale-105 focus:outline-none 
                focus:ring-2 focus:ring-secondary focus:ring-offset-2">
                    Return to Home
                </button>
            </div>
        );
    }

    // If order is successfully placed, show success message
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold text-green-600">Order Placed Successfully!</h1>
            <p className="text-lg text-gray-700 mt-2">Thank you for your purchase.</p>
            <button
                onClick={() => navigate("/menu")}
                className="mt-4 px-6 py-3 w-full sm:w-auto  bg-secondary text-white font-semibold text-lg rounded-lg 
                hover:bg-secondary-light shadow-md transition duration-200 transform hover:scale-105 focus:outline-none 
                focus:ring-2 focus:ring-secondary focus:ring-offset-2">
                Continue Shopping
            </button>
            <button
                onClick={() => navigate("/my-orders")}
                className="mt-4 px-6 py-3 w-full sm:w-auto  bg-secondary text-white font-semibold text-lg rounded-lg 
                hover:bg-secondary-light shadow-md transition duration-200 transform hover:scale-105 focus:outline-none 
                focus:ring-2 focus:ring-secondary focus:ring-offset-2">
                View Orders
            </button>
        </div>
    );
};

export default OrderSuccess;
