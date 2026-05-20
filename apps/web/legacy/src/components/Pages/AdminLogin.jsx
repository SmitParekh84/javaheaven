import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Adjust the import path
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../../config";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { setUser } = useUser(); // Access setUser from UserContext
    const [loading, setLoading] = useState(false); // New loading state
    const [sessionConflict, setSessionConflict] = useState(false); // State to check if session conflict exists
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility


    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [credentials, setCredentials] = useState({
        identifier: "",
        password: "",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };
    const handleLogoutOtherSessions = async () => {
        try {
            // Get the userId from session storage
            const response1 = await axios.post(`${API_URL}/api/login`, credentials);
            const { userId } = response1.data;

            // const { userId } = response1.data;
            if (!userId) {
                toast.error("User ID is not available. Please log in again.");
                return; // Exit if userId is not found
            }

            // Send request to logout other sessions
            const response = await axios.post(`${API_URL}/api/logout-other-sessions`, { userId });

            // Handle response
            if (response.data.success) {
                setShowModal(false); // Close any modal if applicable
                toast.success("Logged out from other sessions. Please log in again.");
                // If necessary, you can call a function to refresh the session or redirect
                navigate("/admin"); // Or wherever you want to redirect after logging out
            } else {
                toast.error("Failed to log out from other sessions. Please try again.");
            }
        } catch (err) {
            // Log error for debugging purposes
            console.error("Error logging out from other sessions:", err);
            toast.error("An error occurred. Please try again.");
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        toast("Cancelled login.");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when submitting
        try {
            const response = await axios.post(`${API_URL}/api/admin/login`, credentials);
            // const userInfo = response.data.admin; // Admin information
            const { token, sessionId, userId, admin, conflict } = response.data;
            if (conflict) {
                // If conflict exists, show the modal to the user
                setSessionConflict(true);
                setShowModal(true);
                return;
            }

            // Ensure userInfo and sessionId are not undefined

            // Log values before storing them
            // console.log('Login response:', response.data);
            localStorage.setItem("token", token);
            sessionStorage.setItem('sessionId', sessionId);
            sessionStorage.setItem('userId', userId);

            localStorage.setItem("userInfo", token);
            const userInfoString = JSON.stringify(admin);
            // const storedUserInfo = localStorage.getItem("userInfo");
            // Parse the string to access the properties
            const parsedUserInfo = JSON.parse(userInfoString);
            // const decodedToken = parseJwt(storedUserInfo);
            // const userInfoString = JSON.stringify(decodedToken);
            // console.log("User userInfoString:", userInfoString);

            // // console.log("User userInfoString:", userInfoString);
            // const parsedUserInfo = JSON.parse(userInfoString);
            // console.log("Parsed User Info:", parsedUserInfo);


            localStorage.setItem("userRole", parsedUserInfo.role ?? ""); // Store user role safely
            setUser(admin); // Store user info
            // setUser(userInfo); // Set user information in context
            toast.success(response.data.msg ?? 'Admin login successful.');
            navigate("/admin-dashboard"); // Redirect to admin dashboard
            // Optionally reload the page
            setTimeout(() => {
                window.location.reload();
            }, 500); // Small delay to ensure state/context updates before reload



        } catch (err) {
            console.error("Login error:", err); // Log the error for debugging
            toast.error(err.response?.data?.msg || "Admin login failed. Please try again."); // Set error for UI
            // toast.error(error); // Show toast with error message
        } finally {
            setLoading(false); // Set loading to false after request completes
        }
    };

    return (
        <div className="rounded-lg p-6 w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0 ">
            <div className="container  h-screen  flex flex-col items-center justify-center bg-background">
                <div className="bg-secondary rounded-lg  shadow-lg m-5 p-11 max-w-sm w-full">
                    <h2 className="text-2xl text-center font-bold text-primary-foreground mb-6">
                        Admin Login
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-muted-foreground" htmlFor="identifier">
                                ADMIN USERNAME
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                placeholder="Enter Admin Username *"
                                className="mt-1 block w-full border border-border rounded-md p-2 focus:outline-none focus:ring focus:ring-ring"
                                value={credentials.identifier}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-muted-foreground" htmlFor="password">
                                PASSWORD
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} // Toggle password visibility
                                    id="password"
                                    name="password"
                                    placeholder="Enter Password *"
                                    className="mt-1 block w-full border border-border rounded-md p-2 focus:outline-none focus:ring focus:ring-ring"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-2 top-2 text-secondary hover:brightness-150"
                                    onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
                        <button
                            type="submit"
                            className={`w-full bg-primary-foreground text-secondary hover:bg-primary-foreground/80 py-2 rounded-full font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} // Disable button when loading
                            disabled={loading} // Disable button based on loading state
                        >
                            {loading ? "Admin logging in..." : "Admin Login"} {/* Conditional button text */}
                        </button>
                    </form>
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
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
