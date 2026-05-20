import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const countryCodes = [
  { name: "India", code: "+91" },
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "Canada", code: "+1" },
  { name: "Australia", code: "+61" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "Japan", code: "+81" },
  { name: "Brazil", code: "+55" },
  { name: "South Africa", code: "+27" },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    mobno: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+91", // Default to India
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobno") {
      // Remove non-digit characters
      const digits = value.replace(/\D/g, '');

      // Format as xxxxx-xxxxx
      let formattedNumber = '';
      if (digits.length > 5) {
        formattedNumber = `${digits.slice(0, 5)}-${digits.slice(5, 10)}`;
      } else {
        formattedNumber = digits;
      }

      setFormData({ ...formData, [name]: formattedNumber });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setError({ ...error, [name]: "" }); // Clear error message on input change
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct mobile number: +countryCode-mobno
    const formattedMobileNumber = `${formData.countryCode}-${formData.mobno.replace(/-/g, '')}`; // Correctly remove hyphen for concatenation

    // Log the data being sent
    // console.log("Sending data:", { ...formData, mobno: formattedMobileNumber });

    // Client-side validations
    let newErrors = {};

    // Username validation
    if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";

    // Mobile number validation
    if (!/^\+\d{1,3}-\d{10}$/.test(formattedMobileNumber)) { // Adjusted regex to match the format +countryCode-xxxxxxxxxx
      newErrors.mobno = "Mobile number must start with a country code followed by 10 digits, formatted as +xxxx-xxxxxxxxxx.";
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email address";

    // Password validations
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    // Set any new errors
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Sending the full mobile number along with other form data
      await axios.post(`${API_URL}/api/signup`, { ...formData, mobno: formattedMobileNumber });
      toast.success("Registration successful! Please log in."); // Toast for success
      navigate("/login");
    } catch (err) {
      // Handle errors
      if (err.response?.status === 409) {
        toast.error("User already exists.");
        setError({ server: "User already exists" });
      } else {
        toast.error(err.response?.data.message || "Registration failed.");
        setError({ server: err.response?.data.message || "Registration failed" });
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="container mx-auto max-w-2xl p-6 leading-none">
      <div className="flex items-center justify-center">
        <div className="bg-secondary rounded-lg shadow-2xl p-5 w-full">
          <h2 className="text-4xl text-center font-extrabold text-primary-foreground mb-8">Sign Up</h2>
          {error.server && <p className="text-red-500 mb-4 text-center">{error.server}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <label className="block text-muted-foreground font-semibold mb-2" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username *"
                className="mt-1 block w-full border border-border rounded-md p-4 transition duration-200 focus:ring focus:ring-primary-foreground focus:outline-none"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 mb-4 ">
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-muted-foreground font-semibold mb-2" htmlFor="countryCode">Country Code</label>
                <select
                  id="countryCode"
                  name="countryCode"
                  className="mt-1 block w-full border border-border rounded-md p-4 transition duration-200 focus:ring focus:ring-primary-foreground focus:outline-none"
                  value={formData.countryCode}
                  onChange={handleChange}
                >
                  {countryCodes.map((country, index) => (
                    <option key={index} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-muted-foreground font-semibold mb-2" htmlFor="mobno">Mobile Number</label>
                <input
                  type="tel"
                  id="mobno"
                  name="mobno"
                  placeholder="Enter your mobile number *"
                  className="mt-1 block w-full border border-border rounded-md p-4 transition duration-200 focus:ring focus:ring-primary-foreground focus:outline-none"
                  value={formData.mobno}
                  onChange={handleChange}
                  required
                />
                {error.mobno && <p className="text-red-500 text-sm mt-1">{error.mobno}</p>}
              </div>
            </div>


            <div className="mb-4">
              <label className="block text-muted-foreground font-semibold mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Email ID *"
                className="mt-1 block w-full border border-border rounded-md p-4 transition duration-200 focus:ring focus:ring-primary-foreground focus:outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
            </div>

            <div className="relative mb-4">
              <label className="block text-muted-foreground font-semibold mb-2" htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter Password *"
                className="block w-full border border-border rounded-md p-4 pr-12 transition duration-200 focus:ring focus:ring-primary-foreground focus:outline-none"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-9 text-secondary hover:bg-secondary-light"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size="lg" />
              </button>
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>

            <div className="relative mb-4">
              <label className="block text-muted-foreground font-semibold mb-2" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password"
                name="confirmPassword"
                placeholder="Confirm Password *"
                className="block w-full border border-border rounded-md p-4 pr-12 transition duration-200 focus:ring focus:ring-primary-foreground focus:outline-none"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-9 text-secondary hover:text-secondary-light"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} size="lg" />
              </button>
              {error.confirmPassword && <p className="text-red-500 text-sm mt-1">{error.confirmPassword}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-primary-foreground text-secondary hover:bg-primary-foreground/80 py-3 rounded-full font-semibold transition duration-200"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </form>
          <p className="mt-6 text-muted-foreground text-center">
            Need assistance?{" "}
            <a href="/get-help" className="text-primary-foreground font-semibold hover:underline">Get Help</a>
          </p>
        </div>
      </div>
    </div>




  );
}
