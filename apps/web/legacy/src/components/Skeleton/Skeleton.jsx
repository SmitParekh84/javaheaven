// src/components/Skeleton/Skeleton.jsx
import React from 'react';

const Skeleton = ({ className, height = "100%", width = "100%" }) => {
    return (
        <div
            className={`animate-pulse bg-gray-300 rounded ${className}`}
            style={{ height, width }}
        />
    );
};

export default Skeleton;
