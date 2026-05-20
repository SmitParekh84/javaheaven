import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

// Spinner component with a better design
const Spinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin h-16 w-16 border-4 border-t-transparent border-blue-500 rounded-full"></div>
        <p className="text-lg text-gray-600">{message}</p>
    </div>
);

const StockManagement = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newStock, setNewStock] = useState('');
    const [editId, setEditId] = useState(null);

    // Fetch existing items from the API
    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/items`);
            setItems(response.data);
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

    const handleUpdateStock = async (e, id) => {
        e.preventDefault();
        setError(null);

        if (newStock <= 0 || isNaN(newStock)) {
            setError('Stock must be a positive number');
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${API_URL}/api/stock/update-stock/${id}`, { stock: newStock });
            toast.success('Stock updated successfully!');
            fetchItems();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating stock');
            toast.error('Error updating stock');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewStock('');
        setEditId(null);
    };

    const handleEdit = (item) => {
        setNewStock(item.stock);
        setEditId(item._id);
    };

    return (
        <div className="rounded-lg p-8 w-full mt-10 container mx-auto max-w-7xl sm:py-18 lg:pt-0 ">
            <h1 className="text-4xl font-semibold text-center mb-8 text-gray-800">Stock Management</h1>

            {loading ? (
                <div className="flex justify-center items-center space-x-4">
                    <Spinner message="Loading items..." />
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
                    <table className="min-w-full table-auto border-collapse">
                        <thead className="bg-indigo-100 text-gray-800 text-sm font-semibold">
                            <tr>
                                <th className="border px-6 py-3 text-left">Item Image</th>
                                <th className="border px-6 py-3 text-left">Item Name</th>
                                <th className="border px-6 py-3 text-left">Stock</th>
                                <th className="border px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {items.map((item) => (
                                <tr
                                    key={item._id}
                                    className="hover:bg-gray-50 transition-all duration-200 ease-in-out"
                                >
                                    <td className="border px-6 py-4">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg shadow-md"
                                        />
                                    </td>
                                    <td className="border px-6 py-4">{item.name}</td>
                                    <td className="border px-6 py-4">
                                        {editId === item._id ? (
                                            <input
                                                type="number"
                                                value={newStock}
                                                onChange={(e) => setNewStock(e.target.value)}
                                                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            item.stock
                                        )}
                                    </td>
                                    <td className="border px-6 py-4 space-x-4 flex justify-start">
                                        {editId === item._id ? (
                                            <>
                                                <button
                                                    onClick={(e) => handleUpdateStock(e, item._id)}
                                                    className="text-white font-semibold px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 ease-in-out"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={resetForm}
                                                    className="text-gray-700 font-semibold px-6 py-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-200 ease-in-out"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="bg-secondary text-white p-2 px-6 rounded-full hover:bg-secondary-light transition-colors duration-200 ease-in-out"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StockManagement;
