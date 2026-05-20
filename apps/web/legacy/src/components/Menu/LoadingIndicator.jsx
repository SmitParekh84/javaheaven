import React from 'react';

const LoadingIndicator = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="loader">
                {/* You can customize the loader style as per your design */}
                <div className="spinner" />
            </div>
            <style jsx>{`
        .loader {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 8px solid rgba(0, 0, 0, 0.1);
          border-left-color: #000;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
};

export default LoadingIndicator;
