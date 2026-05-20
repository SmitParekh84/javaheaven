import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import LoadingIndicator from "../Menu/LoadingIndicator";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import axios from "axios";
import EditPassword from "./EditPassword"; // Import new component for password editing

export default function Profile() {
    const { user, setUser } = useUser();
    const [localUser, setLocalUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false); // State to control password modal
    const [originalUser, setOriginalUser] = useState({});

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error parsing JWT:", error); // Log parsing errors
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token"); // Changed to 'token' for consistency
        if (token) {
            const parsedUserInfo = parseJwt(token);
            if (parsedUserInfo) {
                setLocalUser(parsedUserInfo);
                setUser(parsedUserInfo);
                setOriginalUser(parsedUserInfo); // Store the original data for comparison
            }
        }
        setLoading(false);
    }, [setUser]);

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = user && user.userId;

            if (!userId) {
                toast.error("User ID not found");
                return;
            }

            const response = await axios.put(`${API_URL}/api/users/${userId}`, {
                mobno: localUser.mobno,
                address: localUser.address
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Assuming response contains an updated token
            const newToken = response.data.token;

            if (newToken) {
                // Update both `user` and `localStorage` with the new JWT token
                setUser(parseJwt(newToken));
                localStorage.setItem("user", newToken);  // Save the updated JWT in `user` key
                localStorage.setItem("token", newToken);  // Update `token` key with new token
                localStorage.setItem("userInfo", newToken);  // Update `token` key with new token
                toast.success("Profile updated successfully!");
                setEditMode(false);
            } else {
                toast.error("Failed to receive updated token.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.");
        }
    };



    const handleCancel = () => {
        setLocalUser(originalUser);
        setEditMode(false);
    };

    if (loading) return <LoadingIndicator />;

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-secondary rounded-lg shadow-lg m-5 p-8 max-w-md w-full">
                <h2 className="text-3xl text-center font-semibold text-primary-foreground mb-8">Profile</h2>
                {localUser ? (
                    <>
                        <div className="mb-5">
                            <label className="text-primary font-medium">Username</label>
                            <p className="text-muted-foreground">{localUser.username || "N/A"}</p>
                        </div>
                        <div className="mb-5">
                            <label className="text-primary font-medium">Email</label>
                            <p className="text-muted-foreground">{localUser.email || "N/A"}</p>
                        </div>
                        <div className="mb-5">
                            <label className="text-primary font-medium">Mobile No</label>
                            <p className="text-muted-foreground">
                                {editMode ? (
                                    <input
                                        type="text"
                                        className="border-2 text-secondary border-primary rounded-md w-full px-3 py-2 mt-1 focus:border-primary-foreground focus:outline-none"
                                        value={localUser.mobno || ""}
                                        onChange={(e) => setLocalUser({ ...localUser, mobno: e.target.value })}
                                    />
                                ) : (
                                    localUser.mobno || "N/A"
                                )}
                            </p>
                        </div>
                        <div className="mb-5">
                            <label className="text-primary font-medium">Address</label>
                            <p className="text-muted-foreground">
                                {editMode ? (
                                    <input
                                        type="text"
                                        className="border-2 text-secondary border-primary rounded-md w-full px-3 py-2 mt-1 focus:border-primary-foreground focus:outline-none"
                                        value={localUser.address || ""}
                                        onChange={(e) => setLocalUser({ ...localUser, address: e.target.value })}
                                    />
                                ) : (
                                    localUser.address || "N/A"
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 mt-6">
                            <button
                                onClick={editMode ? handleUpdate : () => setEditMode(true)}
                                className={`py-3 rounded-full font-semibold text-secondary 
                                ${editMode ? "bg-green-500 hover:bg-green-600" : "bg-primary-foreground hover:bg-primary-foreground/80"}`}
                            >
                                {editMode ? "Save Changes" : "Edit Profile"}
                            </button>

                            {editMode && (
                                <button
                                    onClick={handleCancel}
                                    className="py-3 rounded-full font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="py-3 rounded-full font-semibold bg-primary-foreground text-secondary hover:bg-primary-foreground/80"
                            >
                                Change Password
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-muted-foreground">No user is logged in.</p>
                )}

                {showPasswordModal && (
                    <EditPassword onClose={() => setShowPasswordModal(false)} />
                )}
            </div>
        </div>
    );
}
