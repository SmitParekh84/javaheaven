import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import
import Lottie from 'react-lottie';

// Import your animations
import maintenanceAnimation from './assets/lottie/Website Maintenance.json';
import Animation1 from './assets/lottie/Animation1.json';
import Animation2 from './assets/lottie/Animation2.json';
import Animation3 from './assets/lottie/Animation3.json';
import Animation4 from './assets/lottie/Animation4.json';
import Animation5 from './assets/lottie/Animation5.json';
import Animation6 from './assets/lottie/Animation6.json';
import Animation7 from './assets/lottie/Animation7.json';

const NotFound = () => {
    const navigate = useNavigate(); // Initialize navigate for navigation
    const [animationData, setAnimationData] = useState(null); // Store the dynamic animation data

    // List of available animations
    const animations = [
        maintenanceAnimation,
        Animation1,
        Animation2,
        Animation3,
        Animation4,
        Animation5,
        Animation6,
        Animation7,
    ];

    // Function to select a random animation
    const getRandomAnimation = () => {
        const randomIndex = Math.floor(Math.random() * animations.length);
        setAnimationData(animations[randomIndex]);
    };

    // Fetch a random animation on component mount
    useEffect(() => {
        getRandomAnimation();
    }, []); // Run only once on mount

    const handleGoHome = () => {
        navigate('/'); // Navigate to the home page without pausing the animation
    };

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData, // Use the dynamic animation data
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            {/* Lottie Animation */}
            <div className="mb-4">
                {animationData && (
                    <Lottie options={defaultOptions} height={400} width={400} />
                )}
            </div>

            <h1 className="text-6xl font-bold text-gray-800">404</h1>
            <h2 className="text-3xl font-semibold text-gray-600">Page Not Found</h2>
            <p className="mt-2 text-gray-500">
                Oops! The page you are looking for does not exist. <br />
                <span className="ml-2">Return to the home page</span>
            </p>

            <button
                onClick={handleGoHome}
                className="mt-2 rounded-full bg-secondary text-primary-foreground py-2 px-4 hover:bg-secondary-light transition duration-300"
            >
                <FontAwesomeIcon icon={faHome} className="text-2xl" />
                <span className="ml-2">Go to Home</span>
            </button>
        </div>
    );
};

export default NotFound;


