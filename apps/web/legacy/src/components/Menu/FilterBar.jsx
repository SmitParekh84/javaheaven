import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../config";
import { useNavigate, useLocation } from "react-router-dom"; // Import hooks from react-router-dom
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faTimes } from "@fortawesome/free-solid-svg-icons";

const FilterBar = ({ onFilterChange }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Get current location
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleFilterSelection = (filter) => {
    if (selectedFilter === filter) {
      // If the filter is already selected, deselect it
      setSelectedFilter("");
      onFilterChange(""); // Clear the filter
    } else {
      // Otherwise, select the clicked filter
      setSelectedFilter(filter);
      onFilterChange(filter); // Call the filter change handler with the selected filter
    }
    setIsOpen(false);

    // Update the URL with the selected filter
    const queryParams = new URLSearchParams(location.search);
    if (selectedFilter === filter) {
      // If deselecting, remove the category parameter
      queryParams.delete("category");
    } else {
      // Otherwise, set the category parameter to the selected filter
      queryParams.set("category", filter);
    }
    navigate(`?${queryParams.toString()}`, { replace: true }); // Navigate with updated query params
  };

  // Clear the selected filter
  const clearFilter = () => {
    setSelectedFilter("");
    onFilterChange(""); // Call the filter change handler with an empty string

    // Update the URL to remove the category parameter
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete("category");
    navigate(`?${queryParams.toString()}`, { replace: true });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);


      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, location.search, navigate, onFilterChange]);

  // Fetch unique categories from items
  useEffect(() => {
    const fetchCategories = async () => {
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/items/uniq/categories`); // Fetch unique categories
        if (!response.ok) throw new Error("Failed to fetch categories");

        const uniqueCategories = await response.json();
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("There was a problem loading categories. Please try again.");
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-primary-foreground py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Dropdown Button for Mobile */}
        <div className="relative sm:hidden" ref={dropdownRef}>
          <button
            className="flex items-center text-secondary hover:text-secondary/80 font-semibold focus:outline-none"
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            Filter by
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="ml-2"
            />
          </button>
          {isOpen && (
            <div className="absolute z-10 bg-white shadow-lg rounded mt-1 w-48">
              {error ? (
                <div className="p-2 text-red-600">{error}</div>
              ) : (
                <div className="flex flex-col">
                  {categories.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterSelection(filter)}
                      className={`flex items-center gap-2 px-4 py-2 text-left w-full hover:bg-gray-100 focus:outline-none transition-colors ${selectedFilter === filter ? "bg-gray-200 font-semibold" : ""
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Buttons for Larger Screens */}
        <div className="hidden sm:flex space-x-4">
          {error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            categories.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterSelection(filter)}
                className={`px-4 py-2 rounded-lg transition duration-300 ${selectedFilter === filter
                  ? "bg-secondary text-primary-foreground"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                {filter}
              </button>
            ))
          )}
        </div>

        {/* Clear Filter Button */}
        {selectedFilter && (
          <button
            onClick={clearFilter}
            className="ml-4 flex items-center px-4 py-2 text-red-600 rounded-lg hover:text-red-500 transition duration-300 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" /> {/* Add the icon */}
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
