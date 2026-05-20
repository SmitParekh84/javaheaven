import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../../config";
import { useCart } from "../../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
    const navigate = useNavigate();
    const { setCartItems } = useCart();
    const { setUser } = useUser();
    const [loading, setLoading] = useState(false);

    const [credentials, setCredentials] = useState({
        identifier: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/login`, credentials);
            const { token, sessionId, userId, user, conflict } = response.data;

            if (conflict) {
                setShowModal(true);
                return;
            }

            localStorage.setItem('token', token);
            sessionStorage.setItem('sessionId', sessionId);
            sessionStorage.setItem('userId', userId);
            localStorage.setItem("userInfo", token);

            const uId = user._id;
            setUser(user);

            const cartResponse = await fetch(`${API_URL}/api/users/cart/${uId}`);
            const cartData = await cartResponse.json();
            setCartItems(cartData?.cart);
            const cartToken = btoa(JSON.stringify(cartData));
            localStorage.setItem('carttoken', cartToken);

            toast.success(response.data.msg ?? 'Login successful.');
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutOtherSessions = async () => {
        try {
            const loginResponse = await axios.post(`${API_URL}/api/login`, credentials);
            const { userId } = loginResponse.data;

            if (!userId) {
                toast.error("User ID is not available. Please log in again.");
                return;
            }

            const response = await axios.post(`${API_URL}/api/logout-other-sessions`, { userId });

            if (response.data.success) {
                setShowModal(false);
                toast.success("Logged out from other sessions. Please log in again.");
                navigate("/login");
            } else {
                toast.error("Failed to log out from other sessions. Please try again.");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        toast("Cancelled login.");
    };

    return (
        <div className="container mx-auto max-w-7xl pt-6 sm:py-18 lg:pt-6 min-h-screen">
            <div className="flex items-center justify-center bg-background">
                <div className="bg-secondary rounded-lg shadow-lg m-5 p-11 max-w-sm w-full">
                    <h2 className="text-2xl text-center font-bold text-primary-foreground mb-6">
                        Login
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-muted-foreground" htmlFor="identifier">
                                Email or Mobile
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                placeholder="Enter Email ID or Mobile Number *"
                                className="mt-1 block w-full border border-border rounded-md p-2 focus:outline-none focus:ring focus:ring-ring"
                                value={credentials.identifier}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4 relative">
                            <label className="block text-muted-foreground" htmlFor="password">
                                Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter Password *"
                                className="mt-1 block w-full border border-border rounded-md p-2 pr-10 focus:outline-none focus:ring focus:ring-ring"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        <p className="mb-4 text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link to="/sign-up" className="text-primary-foreground font-semibold hover:underline">
                                Sign Up
                            </Link>
                        </p>
                        <button
                            type="submit"
                            className={`w-full bg-primary-foreground text-secondary hover:bg-primary-foreground/80 py-2 rounded-full font-semibold transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-2 text-muted-foreground">
                        Facing trouble logging in?{" "}
                        <Link to="/get-help" className="text-primary-foreground font-semibold hover:underline">
                            Get Help
                        </Link>
                    </p>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Session Conflict</h2>
                        <p className="mb-6">
                            You are already logged in from another device or session. Would
                            you like to log out from the other session and continue?
                        </p>
                        <div className="flex justify-between">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
                                onClick={handleLogoutOtherSessions}
                            >
                                Log Out Other Session
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
