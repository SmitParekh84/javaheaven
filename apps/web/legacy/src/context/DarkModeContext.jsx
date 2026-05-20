import React, { createContext, useContext, useState, useEffect } from 'react';

// Create DarkModeContext
const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Retrieve initial dark mode state from localStorage or default to false
        return localStorage.getItem('darkMode') === 'true' || false;
    });

    useEffect(() => {
        // Apply the dark mode class to the HTML element
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Save dark mode state in localStorage
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    // Toggle dark mode function
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => useContext(DarkModeContext);
