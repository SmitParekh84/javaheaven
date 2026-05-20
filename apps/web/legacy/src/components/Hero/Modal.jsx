import React from 'react';

const Modal = ({ isOpen, onClose, offer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50  flex items-center justify-center bg-secondary bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 sm:mx-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-4 text-center">
                    {offer.title}
                </h2>

                {/* Image Section */}
                <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-48 rounded-xl object-cover my-4 border border-gray-300 shadow-sm"
                />

                {/* Description Section */}
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    {offer.description}
                </p>

                {/* Offer Details Section */}
                <div className="mt-4 space-y-2 text-gray-800">
                    <p>
                        <span className="font-semibold">Validity:</span> {offer.validity}
                    </p>
                    <p>
                        <span className="font-semibold">Terms:</span> {offer.terms}
                    </p>
                    <p>
                        <span className="font-semibold">Additional Info:</span> {offer.additionalInfo}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    className="mt-6 w-full bg-secondary text-white py-3 px-4 rounded-xl shadow transition duration-300 hover:bg-secondary-dark hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-offset-2"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>


    );
};

export default Modal;
