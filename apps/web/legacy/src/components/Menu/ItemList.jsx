import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FilterBar from "./FilterBar";
import ItemCard from "./ItemCard";
import toast from "react-hot-toast";
import { API_URL } from "../../config";
import LoadingIndicator from './LoadingIndicator';
import { debounce } from 'lodash';

const ItemList = () => {
  const { category } = useParams(); // Get category from URL
  const navigate = useNavigate(); // For navigation
  const [items, setItems] = useState([]); // State to hold the fetched items
  const [filteredItems, setFilteredItems] = useState([]); // State for filtered items
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to manage errors
  const [selectedFilter, setSelectedFilter] = useState(category || ""); // Set selected filter from URL
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const itemsPerPage = 9; // Items per page

  // Fetch items from the API
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/items`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setItems(data); // Update state with fetched data
      setFilteredItems(data); // Initially show all items
    } catch (error) {
      setError(error.message); // Handle errors
      toast.error(error.message); // Notify user about the error
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchItems(); // Fetch items on mount
  }, []); // Empty dependency array to run the effect once on mount

  // Debounced navigation function
  const debouncedNavigate = useCallback(
    debounce((path) => navigate(path, { replace: true }), 300),
    [navigate]
  );

  // Update the selected filter and filter items
  useEffect(() => {
    // Set selected filter based on URL
    setSelectedFilter(category || "");

    const filtered = category
      ? items.filter((item) => item.category === category) // Filter based on category from URL
      : items; // If no category, show all items

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to the first page whenever filter changes
  }, [category, items]);

  // Update the filter based on user selection from FilterBar
  useEffect(() => {
    if (selectedFilter) {
      debouncedNavigate(`/menu/${selectedFilter}`); // Update URL with selected filter
    } else {
      debouncedNavigate(`/menu`); // Reset URL if no filter
    }

    const filtered = selectedFilter
      ? items.filter((item) => item.category === selectedFilter)
      : items;

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to the first page when filter changes
  }, [selectedFilter, items, debouncedNavigate]);

  // Handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate paginated items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <LoadingIndicator />; // Use LoadingIndicator here
  }

  if (error) return <ErrorMessage error={error} onRetry={fetchItems} />; // Show error message with retry option
  if (currentItems.length === 0) return <EmptyState />; // Show empty state if no items

  return (
    <div className="container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
      {/* Filter Bar */}
      <div className="relative isolate px-4 sm:px-8 lg:px-8  bg-primary-foreground font-spartan">
        <FilterBar onFilterChange={setSelectedFilter} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((item) => (
            <ItemCard key={item._id} item={item} /> // Use item._id for key if item has it
          ))}
        </div>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={filteredItems.length}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

// Error Message Component with Retry Button
const ErrorMessage = ({ error, onRetry }) => (
  <div className="flex items-center justify-center h-screen">
    <div>
      <p>Error: {error}</p>
      <button onClick={onRetry} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
        Retry
      </button>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="flex items-center justify-center h-screen">
    <p>No items found. Please try a different filter.</p>
  </div>
);

// Pagination Component
const Pagination = ({ itemsPerPage, totalItems, currentPage, onPageChange }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-6">
      <ul className="flex space-x-2">
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              className={`px-4 py-2 rounded-lg transition duration-300 ${currentPage === number
                ? "bg-secondary text-primary-foreground"
                : "bg-gray-200 hover:bg-gray-300"
                }`}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ItemList;