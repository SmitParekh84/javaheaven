import { useEffect, useState } from "react"; // Import useEffect and useState
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import { API_URL } from '../../config'; // Import your API URL


const DEFAULT_IMAGE = "https://cloud-atg.moph.go.th/quality/sites/default/files/default_images/default.png";
export default function Widget() {
  const [items, setItems] = useState([]); // State to store fetched items
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/items`);
        const bestsellers = response.data.filter((item) => item.isBestseller); // Filter for bestsellers
        setItems(bestsellers);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchItems();
  }, []);

  const handleAddItem = (item) => {
    navigate(`/item/${item._id}`);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: 'linear',
    swipe: false,
    draggable: false,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          swipe: true,
          draggable: true,


        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
    ],
  };


  return (
    <div className="mx-auto max-w-7xl pt-0 sm:py-14 lg:py-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Barista Recommends</h2>
        <a href="/menu" className="text-secondary z-10 hover:underline">View Menu</a>
      </div>
      <Slider {...settings} className="flex">
        {loading
          ? // Show placeholders while loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="px-2">
              <div className="bg-white rounded-lg shadow-lg flex flex-col p-5 relative min-w-[180px] md:min-w-[220px] animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-md mb-4" />
                <div className="flex-1 text-center md:text-left">
                  <div className="h-4 bg-gray-200 mb-2 rounded-md"></div>
                  <div className="h-4 bg-gray-200 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded-md w-16"></div>
                </div>
              </div>
            </div>
          ))
          : // Show fetched items when not loading
          items.map((item) => (
            <div key={item._id} className="px-2">
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col p-5 relative min-w-[180px] md:min-w-[220px]">
                <img
                  src={item.imageUrl || DEFAULT_IMAGE} // Use default image if imageUrl is missing
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-md mb-4 transition-transform duration-300 hover:scale-105"
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-[var(--foreground)] font-semibold text-lg">{item.name}</h3>
                  <p className="text-[var(--muted-foreground)] text-sm mt-1">
                    {item.description.length > 80 ? `${item.description.slice(0, 80)}...` : item.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[var(--foreground)] font-bold text-lg">₹ {item.price}</span>
                  <button
                    className="bg-secondary text-primary-foreground px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-secondary-dark transition-colors duration-200"
                    onClick={() => handleAddItem(item)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
      </Slider>
    </div>
  );
}
