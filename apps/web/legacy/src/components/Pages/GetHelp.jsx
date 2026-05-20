import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import toast from "react-hot-toast";
import { API_URL } from "../../config";

export default function GetHelp() {
  const navigate = useNavigate(); // Create a navigate function
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    if (step === 1) {
      try {
        const response = await fetch(`${API_URL}/api/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success("OTP sent to your email");
          setStep(2);
        } else {
          toast.error(data.message || "Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred. Please check your connection.");
      }
    } else if (step === 2) {
      try {
        const response = await fetch(`${API_URL}/api/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp, newPassword }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success("Password reset successfully");
          setStep(1);
          setEmail("");
          setOtp("");
          setNewPassword("");
        } else {
          toast.error(data.message || "Failed to reset password. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred. Please check your connection.");
      }
    }

    setLoading(false); // Set loading to false
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="bg-card rounded-lg shadow-lg p-8 m-5 max-w-md w-full">
        <h2 className="text-lg font-semibold text-primary-foreground mb-4">
          {step === 1 ? "Get Help" : "Reset Password"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {step === 1
            ? "Please enter your registered email, and we will send you an OTP to reset your password."
            : "Please enter the OTP sent to your email and your new password."}
        </p>
        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter Email ID *"
                className="block w-full border border-border rounded-md p-3 focus:ring focus:ring-ring transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-1" htmlFor="otp">
                  OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter OTP *"
                  className="block w-full border border-border rounded-md p-3 focus:ring focus:ring-ring transition duration-200"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-1" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter New Password *"
                  className="block w-full border border-border rounded-md p-3 focus:ring focus:ring-ring transition duration-200"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className={`bg-primary-foreground text-secondary hover:bg-primary/80 w-full font-medium p-2 rounded-full transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading} // Disable button when loading
          >
            {loading ? "Processing..." : step === 1 ? "Send OTP" : "Reset Password"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            {step === 1
              ? "Already have an account?"
              : "Back to login?"}
            <span
              className="text-primary cursor-pointer"
              onClick={() => navigate('/login')} // Redirect to /login on click
            >
              {step === 1 ? " Log in" : " Go back"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
