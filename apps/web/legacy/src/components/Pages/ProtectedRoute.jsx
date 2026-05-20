import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Ensure this path is correct
import PropTypes from 'prop-types'; // Optional: for prop type validation

const ProtectedRoute = ({ children, adminOnly }) => {
    
    const token = localStorage.getItem("token");
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
      const user = parseJwt(token);
      
    // Check if the user is authenticated based on user properties
    const isAuthenticated = user && user.username; // Ensure user is defined
    const isAdmin = user && user.role === "admin"; // Ensure user is defined

    if (!isAuthenticated) {
        // User is not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        // User is not an admin, redirect to an unauthorized page or another appropriate page
        return <Navigate to="/unauthorized" replace />; // Redirect to an unauthorized access page
    }

    // If authenticated (and admin check passes if required), render children
    return children;
};

// Optional: PropTypes for validation
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired, // Ensuring children is required
    adminOnly: PropTypes.bool // Optional, default false if not specified
};

export default ProtectedRoute;
