import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [prevOrders, setPrevOrders] = useState([]); // Track previous orders for comparison
    const [loading, setLoading] = useState(true);
    const [dataChanged, setDataChanged] = useState(false); // Track if data has changed
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('myOrders');
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    };

    const userInfo = parseJwt(localStorage.getItem('user'));
    const StriUserInfo = JSON.stringify(userInfo); // Convert to string for JSON.parse() TO
    const loggedInUser = StriUserInfo;
    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/items`);
            if (Array.isArray(response.data)) {
                setItems(response.data);
            } else {
                console.error('Items not found in response:', response.data);
            }
        } catch (err) {
            setError('Failed to fetch item images.');
            console.error('Error fetching items:', err);
        }
    };

    const fetchOrders = async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/api/orders/${userId}`);
            const fetchedOrders = response.data.orders;

            // Check if fetched orders differ from previous orders
            if (JSON.stringify(fetchedOrders) !== JSON.stringify(prevOrders)) {
                setPrevOrders(fetchedOrders);  // Update prevOrders
                setOrders(fetchedOrders);      // Update orders
                setDataChanged(true);          // Set dataChanged to true if there is a change
            } else {
                setDataChanged(false);         // No change in data
            }
        } catch (err) {
            setError(err.response?.data?.msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            fetchOrders(foundUser?.username ?? '');
            fetchItems();

            const interval = setInterval(() => {
                setLoading(true);             // Set loading before fetching
                fetchOrders(foundUser?.username ?? '');
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [loggedInUser, activeTab]);

    const getItemImageUrl = (itemName) => {
        if (!items || items.length === 0) return '';
        const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        return item ? item.imageUrl : '';
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'pending') return order.status === 'Pending';
        if (activeTab === 'delivered') return order.status === 'Delivered';
        if (activeTab === 'cancelled') return order.status === 'Cancelled';
        return true;
    });

    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (loading && dataChanged) {  // Show loading only if there is a data change
        return (
            <div className="flex items-center justify-center h-screen flex-col">
                <div
                    className="animate-spin h-12 w-12 border-4 border-brown-500 border-t-transparent rounded-full"
                    style={{ borderColor: '#8B4513', borderTopColor: 'transparent' }}
                ></div>
                <span className="mt-4 text-lg">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">Loading Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="rounded-lg w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-8">My Orders</h1>

                <div className="flex space-x-2 sm:space-x-4 mb-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('myOrders')}
                        className={`px-3 sm:px-4 py-2 rounded-md whitespace-nowrap ${activeTab === 'myOrders' ? 'bg-secondary text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                    >
                        My Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-3 sm:px-4 py-2 rounded-md whitespace-nowrap ${activeTab === 'pending' ? 'bg-secondary text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('delivered')}
                        className={`px-3 sm:px-4 py-2 rounded-md whitespace-nowrap ${activeTab === 'delivered' ? 'bg-secondary text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                    >
                        Delivered
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`px-3 sm:px-4 py-2 rounded-md whitespace-nowrap ${activeTab === 'cancelled' ? 'bg-secondary text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                    >
                        Cancelled
                    </button>
                </div>

                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order._id} className="border border-gray-200 shadow-md p-8 mb-8 rounded-xl bg-white hover:shadow-lg transition-shadow duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Total Amount: ₹{order.totalAmount}</h2>
                                <span className={`text-sm font-medium py-1 px-3 rounded-full 
                                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                            'bg-yellow-100 text-yellow-600'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-gray-500 mb-1">Order Date:
                                <span className="font-semibold text-gray-800">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} at {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </p>
                            <div className="mt-4">
                                <h3 className="text-lg font-bold mb-3 text-gray-800">Items:</h3>
                                <ul className="list-inside space-y-4">
                                    {order.items.map((item) => {
                                        const imageUrl = getItemImageUrl(item.name);
                                        return (
                                            <li key={item._id} className="flex items-center space-x-4">
                                                <img
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    className="w-16 h-16 rounded-md object-cover"
                                                />
                                                <div>
                                                    <p className="text-gray-600">{item.name} ({item.size})</p>
                                                    <p className="text-sm text-gray-500">₹{item.price} x {item.quantity} =
                                                        <span className="font-semibold text-gray-800"> ₹{item.subtotal}</span>
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center h-screen text-gray-500 py-20">
                        {activeTab === 'pending' && "No pending orders found."}
                        {activeTab === 'delivered' && "No delivered orders found."}
                        {activeTab === 'cancelled' && "No cancelled orders found."}
                        {activeTab === 'myOrders' && "No orders found. "}
                        <a href="/menu" className="text-blue-500 underline">Browse Products</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
