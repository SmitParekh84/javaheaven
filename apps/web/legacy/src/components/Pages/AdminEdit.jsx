import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSpinner, faEdit } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../../config';
import toast from "react-hot-toast";

// Spinner Component
const Spinner = () => (
    <div className="flex justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5 text-blue-500" />
    </div>
);

// Confirmation Card Component
const ConfirmationCard = ({ onConfirm, onCancel, message }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <p className="mb-4">{message}</p>
            <div className="flex justify-around">
                <button
                    onClick={onConfirm}
                    className="bg-red-600 text-white rounded-lg py-2 px-4 hover:bg-red-700 transition duration-300"
                >
                    Confirm
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-500 text-white rounded-lg py-2 px-4 hover:bg-gray-600 transition duration-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

const AdminEdit = () => {
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', mobno: '' });
    const [editingAdminId, setEditingAdminId] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteAdminId, setDeleteAdminId] = useState(null);
    const [currentAdminId, setCurrentAdminId] = useState(null); // or an initial value if needed


    // Validation states
    const [validationErrors, setValidationErrors] = useState({});

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error parsing JWT:", error); // Log parsing errors
            return null;
        }
    };

    // Fetch admins on component mount
    const fetchAdmins = async () => {
        setLoading(true);
        try {

            const { data } = await axios.get(`${API_URL}/api/admin/list`);
            const adminIds = data.admins.map(admin => admin._id);
            console.log(adminIds);
            const token = localStorage.getItem("token"); // Changed to 'token' for consistency
            if (token) {
                const parsedUserInfo = parseJwt(token);
                console.log(parsedUserInfo);
                if (parsedUserInfo) {
                    setCurrentAdminId(parsedUserInfo.userId);
                }
            }

            setAdmins(data.admins || []);
            setError(null);
        } catch (err) {
            console.error(err);
            // setError('Error fetching admins');
            toast.error("Error fetching admins");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Validate input fields
    const validateFields = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!formData.username) errors.username = 'Username is required.';
        if (!emailRegex.test(formData.email)) errors.email = 'Enter a valid email.';
        if (!phoneRegex.test(formData.mobno)) errors.mobno = 'Enter a valid 10-digit mobile number.';
        if (!editingAdminId && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form field change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Start editing an admin
    const handleEdit = (admin) => {
        setEditingAdminId(admin._id);
        setFormData({ username: admin.username, email: admin.email, mobno: admin.mobno, password: '' });
        setValidationErrors({});
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingAdminId(null);
        setFormData({ username: '', email: '', password: '', mobno: '' });
        setError(null);
        setMessage(null);
        setValidationErrors({});
    };

    // Show confirmation card for deletion
    const confirmDelete = (adminId) => {
        setDeleteAdminId(adminId);
        setShowConfirm(true);
    };

    // Handle admin deletion
    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/api/admin/delete/${deleteAdminId}`);
            setDeleteAdminId(null);
            setShowConfirm(false);
            fetchAdmins(); // Refresh list after deletion
            toast.success('Admin deleted successfully.');
            setError(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Error deleting admin');
            setMessage(null);
        } finally {
            setLoading(false);
        }
    };


    // Save or update an admin
    const handleSave = async (e) => {
        e.preventDefault();

        // Validate fields before making an API call
        if (!validateFields()) return;

        setLoading(true);
        const { username, email, mobno, password } = formData;

        try {
            if (editingAdminId) {
                // Edit existing admin
                await axios.put(`${API_URL}/api/admin/edit/${editingAdminId}`, {
                    username,
                    email,
                    mobno,
                    ...(password && { password }), // Send password only if provided
                });
                toast.success('Admin updated successfully.');
                setEditingAdminId(null);
            } else {
                // Add new admin
                const { data } = await axios.post(`${API_URL}/api/admin/add`, {
                    username,
                    email,
                    mobno,
                    password,
                });
                if (data && data.admin) {
                    toast.success('Admin added successfully.');
                } else {
                    throw new Error('Failed to add admin. Unexpected response structure.');
                }
            }

            // Refresh admin list
            await fetchAdmins();
            // Reset form fields
            setFormData({ username: '', email: '', password: '', mobno: '' });
            setValidationErrors({});
            setError(null);
        } catch (err) {
            console.error('Error saving admin:', err);
            const errorMsg = err.response?.data?.msg || 'Error saving admin. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="rounded-lg p-6 w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <div className="rounded-lg p-6 w-full bg-white shadow-md mt-6">
                <h2 className="text-xl font-semibold mb-4">{editingAdminId ? 'Edit Admin' : 'Add New Admin'}</h2>
                {message && <p className="text-green-500 mb-4">{message}</p>}
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleSave}>
                    <div className="mb-6 grid gap-6 md:grid-cols-2">
                        <div className="col-span-2 md:col-span-1">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.username && <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>}
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <input
                                type="text"
                                name="mobno"
                                value={formData.mobno}
                                onChange={handleChange}
                                placeholder="Mobile No."
                                className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.mobno && <p className="text-red-500 text-sm mt-1">{validationErrors.mobno}</p>}
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password (optional)"
                                className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.password && <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-start mt-6 space-y-4 md:space-y-0 md:space-x-4">
                        <button
                            type="submit"
                            className={`w-full md:w-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary'} text-white rounded-lg py-2 px-4 hover:brightness-150 transition duration-300 flex items-center justify-center`}
                            disabled={loading}
                        >

                            {loading ? <Spinner /> : <FontAwesomeIcon icon={faPlus} className="mr-2" />}
                            {editingAdminId ? 'Save Changes' : 'Add Admin'}
                        </button>
                        {editingAdminId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full md:w-auto bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

            </div>

            {/* Admin List */}
            <div className="mt-6 bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-semibold mb-4">Admin List</h2>
                {loading && <Spinner />}
                {!loading && admins.length === 0 && <p>No admins found.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {admins.map((admin) => (

                        <div
                            key={admin._id}
                            className="border p-4 rounded-lg shadow-lg bg-gray-50 hover:bg-gray-100 transition duration-300"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">{admin.username}</h3>
                                {currentAdminId === admin._id && (
                                    <span className="text-green-600 font-semibold">Current</span>
                                )}
                            </div>
                            <p className="text-gray-600">{admin.email}</p>
                            <p className="text-gray-600">{admin.mobno}</p>

                            <div className="flex space-x-2 mt-2">
                                <button
                                    className="bg-secondary text-white rounded-lg py-1 px-2 hover:brightness-150 transition duration-300"
                                    onClick={() => handleEdit(admin)}
                                >
                                    <FontAwesomeIcon icon={faEdit} /> Edit
                                </button>
                                <button
                                    className="bg-red-600 text-white rounded-lg py-1 px-2 hover:bg-red-700 transition duration-300"
                                    onClick={() => confirmDelete(admin._id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} /> Delete
                                </button>
                            </div>
                        </div>

                    ))}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <ConfirmationCard
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                    message="Are you sure you want to delete this admin?"
                />
            )}
        </div>
    );
};

export default AdminEdit;
