import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCoffee, faDollar, faImage, faArrowLeft, faArrowRight, faRupee, faRupeeSign, faInr } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../../config';

// Spinner component
// Spinner component
const Spinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center">
        <div
            className="animate-spin h-12 w-12 border-4 border-brown-500 border-t-transparent rounded-full"
            style={{ borderColor: '#8B4513' }} // Set your desired brown color here
        ></div>
        <p className="mt-2 text-gray-600">{message}</p>
    </div>
);


const AddMenuItem = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [isBestseller, setIsBestseller] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);


    // Fetch existing items from the API
    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/items`);
            setItems(response.data);
            const uniqueCategories = [...new Set(response.data.map(item => item.category))];
            setCategories(uniqueCategories);
        } catch (err) {
            console.error('Error fetching items:', err);
            toast.error('Error fetching items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const validateImageUrl = (url) => {
        const pattern = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
        return pattern.test(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setImageError(null);

        if (price <= 0) {
            setError('Price must be a positive number');
            return;
        }

        if (imageUrl && !validateImageUrl(imageUrl)) {
            setImageError('Invalid image URL. Please enter a valid URL ending with .jpg, .jpeg, .png, .gif, .bmp, or .webp');
            return;
        }

        setLoading(true);
        try {
            if (editId) {
                await axios.put(`${API_URL}/api/items/${editId}`, { name, description, price, category, isBestseller, imageUrl });
                toast.success('Item updated successfully!');
            } else {
                await axios.post(`${API_URL}/api/items`, { name, description, price, category, isBestseller, imageUrl });
                toast.success('Item added successfully!');
            }
            resetForm();
            fetchItems();
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Error saving item');
            toast.error('Error saving item');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setIsBestseller(false);
        setImageUrl('');
        setEditId(null);
        setImageError(null);
    };

    const handleEdit = (item) => {
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setCategory(item.category);
        setIsBestseller(item.isBestseller);
        setImageUrl(item.imageUrl);
        setEditId(item._id);
        setImageError(null);
        // Smooth scroll to the top of the page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/api/items/${id}`);
            toast.success('Item deleted successfully!');
            fetchItems();
        } catch (err) {
            toast.error('Error deleting item');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
            toast.success('Category added successfully!');
        } else {
            toast.error('Category already exists or is empty');
        }
    };

    const totalAmount = items.reduce((total, item) => total + Number(item.price), 0).toFixed(2);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
        <div className="rounded-lg p-8 w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <div className="rounded-lg p-6 w-full bg-white shadow-lg mt-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{editId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>



                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faCoffee} className="ml-3" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Item Name"
                                required
                                className="flex-grow p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 rounded-lg"
                            />
                        </div>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faEdit} className="ml-3" />
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description"
                                required
                                className="flex-grow p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 rounded-lg"
                            />
                        </div>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faInr} className="ml-3" />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Price in ₹"
                                required
                                className="flex-grow p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 rounded-lg"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200"
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faImage} className="ml-3" />
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Image URL"
                                className="flex-grow p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 rounded-lg"
                            />
                        </div>
                        {imageError && <p className="text-red-500 mt-2">{imageError}</p>}
                        {imageUrl && (
                            <div className="col-span-2 mt-4 flex justify-center">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="rounded-lg max-w-full h-auto"
                                />
                            </div>
                        )}
                        <div className="col-span-2 flex items-center mb-4">
                            <input
                                type="checkbox"
                                checked={isBestseller}
                                onChange={(e) => setIsBestseller(e.target.checked)}
                                className="mr-2"
                            />
                            <span>Bestseller</span>
                        </div>
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    <button
                        type="submit"
                        className="mt-6 bg-secondary text-white rounded-lg py-3 px-6 hover:bg-secondary-light transition duration-300 focus:outline-none"
                    >
                        <FontAwesomeIcon icon={faPlus} className="ml-1" />
                        {editId ? ' Update Item' : ' Add Item'}
                    </button>

                </form>

                {/* Category Addition Form */}
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="mb-6">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New Category Name"
                            required
                            className="flex-grow p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 rounded-lg"
                        />
                        <button
                            type="submit"
                            className="ml-3 bg-secondary text-white rounded-lg py-2 px-4 hover:bg-secondary-light transition duration-300 flex items-center"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add
                        </button>
                    </div>
                </form>
                <h2 className="text-2xl font-bold mb-4">Menu Items</h2>
                <p className="text-gray-700 mb-4">Total Price: ₹{totalAmount}</p>
                {/* Loading Spinner and Text */}
                {/* Responsive Table */}
                {loading ? (
                    <Spinner message="Please wait, loading..." />
                ) : (

                    < div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className=" p-3">Image</th>
                                    <th className=" p-3">Name</th>
                                    <th className=" p-3">Description</th>
                                    <th className=" p-3">Price</th>
                                    <th className=" p-3">Category</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map(item => (
                                        <tr key={item._id} className="hover:bg-gray-100 ">
                                            <td className="p-3  items-center flex justify-around">
                                                {item.imageUrl && (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-16 h-16 rounded-lg mr-4"
                                                    />
                                                )}

                                            </td>
                                            <td className="p-3 text-center">{item.name}</td>
                                            <td className="p-3 text-center">{item.description}</td>
                                            <td className="p-3 text-center">₹{item.price}</td>
                                            <td className="p-3 text-center">{item.category}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex space-x-2  justify-center">
                                                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:underline flex items-center">
                                                        <svg
                                                            aria-hidden="true"
                                                            focusable="false"
                                                            data-prefix="fas"
                                                            data-icon="pen-to-square"
                                                            className="svg-inline--fa fa-pen-to-square w-4 h-4 mr-1"
                                                            role="img"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 512 512"
                                                        >
                                                            <path
                                                                fill="currentColor"
                                                                d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"
                                                            ></path>
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:underline flex items-center">
                                                        <svg
                                                            aria-hidden="true"
                                                            focusable="false"
                                                            data-prefix="fas"
                                                            data-icon="trash"
                                                            className="svg-inline--fa fa-trash w-4 h-4 mr-1"
                                                            role="img"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 448 512"
                                                        >
                                                            <path
                                                                fill="currentColor"
                                                                d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"
                                                            ></path>
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-3 text-center">No items found</td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                )}
                {/* Pagination */}
                <div className="flex justify-between items-center mt-8 bg-white p-4 rounded-lg ">
                    <p className="text-gray-700 font-medium">
                        Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                    </p>
                    <div className="flex space-x-4">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="border border-gray-300 p-2 rounded-lg"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center space-x-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Previous</span>
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center space-x-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                        >
                            <span>Next</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </div>


            </div>
        </div >
    );
};

export default AddMenuItem;
