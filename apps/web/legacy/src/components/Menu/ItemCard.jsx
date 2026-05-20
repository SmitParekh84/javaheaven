import { faCartPlus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { useNavigate } from "react-router-dom"; // Import useNavigate
const DEFAULT_IMAGE = "https://cloud-atg.moph.go.th/quality/sites/default/files/default_images/default.png";


const ItemCard = ({ item, loading }) => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleAddItem = () => {
    navigate(`/item/${item._id}`); // Navigate to ItemDetail with the correct item ID
  };
  // Render the skeleton when loading is true
  if (loading) {
    return <SkeletonItemCard />;
  }
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col transition-transform transform hover:scale-105 hover:shadow-xl duration-300 ease-in-out">
      <div className="flex items-start">
        <img
          src={item.imageUrl || DEFAULT_IMAGE}
          alt={`Image of ${item.name}`} // Use descriptive alt text for accessibility
          className="rounded-full mb-4 mr-4 w-24 h-24 sm:w-32 sm:h-32 object-cover shadow-md transition-opacity duration-300 hover:opacity-90" // Add hover effect for the image
        />
        <div className="flex flex-col justify-between w-full">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-gray-800 leading-tight">{item.name}</h3> {/* Added tight line spacing */}
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {item.description.length > 80
                ? `${item.description.slice(0, 80)}...`
                : item.description}
            </p>          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="flex justify-around items-center mt-4">
        <span className="block text-lg sm:text-xl font-semibold text-gray-900 tracking-wide ">
          ₹{item.price.toFixed(2)}
        </span>
        <button
          className="bg-secondary text-white hover:bg-secondary-light transition duration-300 ease-in-out rounded-full py-2 px-4 sm:px-5 flex items-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
          onClick={handleAddItem}
          aria-label={`Add ${item.name} to cart`}
        >
          <span className="mr-2 text-sm sm:text-base">View Details</span>
          <FontAwesomeIcon icon={faCartPlus} className="ml-2 sm:ml-3" />
        </button>
      </div>
    </div>



  );
};
const SkeletonItemCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col">
      <div className="flex items-start animate-pulse">
        <div className="rounded-full mb-4 mr-4 w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex-shrink-0" />
        <div className="flex flex-col justify-between w-full space-y-2 mt-2">
          <div className="h-5 bg-gray-200 rounded-md w-2/3" />
          <div className="h-4 bg-gray-200 rounded-md w-full" />
          <div className="h-4 bg-gray-200 rounded-md w-4/5" />
        </div>
      </div>
      <div className="flex justify-around items-center mt-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded-md w-1/3" />
        <div className="bg-gray-200 rounded-full h-9 w-32 sm:w-36" />
      </div>
    </div>
  );
};
ItemCard.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    imageUrl: PropTypes.string,
  }),
};

export default ItemCard;
