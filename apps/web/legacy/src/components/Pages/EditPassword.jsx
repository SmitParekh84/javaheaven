import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../../config";
import { useUser } from "../../context/UserContext";

export default function EditPassword({ onClose }) {
    const { user, setUser } = useUser();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordChange = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userId = user && user.userId;

            if (!userId) {
                toast.error("User ID not found");
                return;
            }

            await axios.put(`${API_URL}/api/users/${userId}/password`, {
                currentPassword,
                newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Password updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error("Failed to update password.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-primary-foreground p-6 rounded-lg max-w-md w-full shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">Change Password</h2>

                <div className="relative mb-4">
                    <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Current Password"
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <i
                        className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#888",
                        }}
                    />
                </div>

                <div className="relative mb-4">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />

                </div>

                <div className="relative mb-6">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <i
                        className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#888",
                        }}
                    />
                </div>

                <button
                    onClick={handlePasswordChange}
                    className="w-full py-2 rounded-md bg-secondary text-white font-semibold hover:bg-secondary-light"
                >
                    Update Password
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-2 mt-3 rounded-md bg-gray-300 text-secondary font-semibold hover:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
