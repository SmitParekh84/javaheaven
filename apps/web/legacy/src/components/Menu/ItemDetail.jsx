import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";
import { API_URL } from "../../config";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ItemCard from './ItemCard';
import LoadingIndicator from './LoadingIndicator';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const { user } = useUser();
  const { addToCart, cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const loggedInUser = localStorage.getItem('user');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`${API_URL}/api/items/${id}`);
        if (!response.ok) throw new Error("Failed to fetch item");

        const foundItem = await response.json();
        setItem(foundItem);

        const similarResponse = await fetch(`${API_URL}/api/items?category=${foundItem.category}`);
        const similarItemsData = await similarResponse.json();
        setSimilarItems(similarItemsData.filter(i => i._id !== id));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchItem();
  }, [id]);

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

  const calculatePrice = () => {
    const basePrice = item?.price || 0;
    if (selectedSize === "Small") return Math.round(basePrice / 2);
    if (selectedSize === "Medium") return Math.round(basePrice);
    if (selectedSize === "Large") return Math.round(basePrice * 1.5);
    return Math.round(basePrice);
  };

  const handleAddToCart = async () => {
    const foundUser = parseJwt(loggedInUser);

    if (!selectedSize) {
      toast.error("Please select a cup size");
      return;
    }
    if (!foundUser || !foundUser.username) {
      toast.error("Please log in to add items to your cart");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await addToCart({ ...item, id: item._id, size: selectedSize, price: calculatePrice() });
      toast.success("Item added to cart successfully!");
    } catch (err) {
      toast.error("Failed to add item to cart.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="rounded-lg p-8 w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
      <div className="bg-white rounded-lg shadow-md w-full p-6 md:p-10 flex flex-col md:flex-row items-start transition-all duration-500 hover:shadow-xl">
        <div className="flex-shrink-0 justify-around w-full  md:w-1/2">
          <ImageCarousel images={item.images || [item.imageUrl]} />
        </div>

        <div className="flex flex-col justify-between w-full md:ml-8 mt-6 md:mt-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 hover:text-gray-600 transition duration-300">
              {item.name}
            </h2>
            <p className="text-gray-600 mt-2 text-md md:text-lg">{item.description}</p>
            <p className="text-xl md:text-2xl font-semibold mt-4 text-brown-700">
              Price: ₹ {calculatePrice()}
            </p>
          </div>

          <CupSizeSelector selectedSize={selectedSize} onSizeSelect={setSelectedSize} />
          <div className="flex items-center mt-6 justify-between">
            <button
              className={`bg-secondary text-white py-2 px-5 md:py-3 md:px-6 rounded-lg shadow-md transition duration-300 ${!selectedSize ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary-light hover:shadow-lg"
                }`}
              disabled={!selectedSize || loading}
              onClick={handleAddToCart}
            >
              {loading ? "Adding..." : "Add to Cart"}
              <FontAwesomeIcon icon={faCartPlus} className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 w-full">
        <h3 className="text-3xl font-semibold mb-6 text-gray-900 hover:text-gray-800 transition duration-300">Similar Items</h3>
        <Slider
          slidesToShow={3}
          slidesToScroll={3}
          autoplay={true}
          autoplaySpeed={3000}
          dots={true}
          className="relative"
          responsive={[
            {
              breakpoint: 640,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
              },
            },
          ]}
        >
          {similarItems.map((similarItem) => (
            <div key={similarItem.id} className="p-2">
              <ItemCard item={similarItem} className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

const ImageCarousel = ({ images }) => (
  <div className="flex justify-center space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory mt-4">
    {images.map((image, index) => (
      <img
        key={index}
        src={image}
        alt={`Item image ${index + 1}`}
        className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-md flex-shrink-0 snap-center"
      />
    ))}
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="flex items-center justify-center h-screen">
    <p>Error: {error}</p>
  </div>
);

const CupSizeSelector = ({ selectedSize, onSizeSelect }) => (
  <div className="mt-4">
    <h3 className="text-lg font-semibold">Select Cup Size:</h3>
    <div className="flex space-x-4 mt-2">
      {["Small", "Medium", "Large"].map((size) => (
        <button
          key={size}
          className={`border rounded py-1 px-2 transition duration-300 ${selectedSize === size ? "bg-secondary text-primary-foreground font-semibold" : "bg-gray-200 hover:bg-gray-300"}`}
          onClick={() => onSizeSelect(size)}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
);

export default ItemDetail;
