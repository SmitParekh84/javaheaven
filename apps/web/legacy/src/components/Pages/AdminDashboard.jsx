import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUsers, faDollarSign, faChartLine, faTruck, faCartArrowDown, faInfoCircle, faListAlt, faClock, faCheckCircle, faBoxOpen, faHourglassStart, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { API_URL } from '../../config';
import LoadingIndicator from '../Menu/LoadingIndicator';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalDeliveredOrders, setTotalDeliveredOrders] = useState(0);
    const [totalPendingOrders, setTotalPendingOrders] = useState(0);
    const [totalItemsOrder, setTotalItemsOrder] = useState(0);
    const [totalRecentOrders, setTotalRecentOrders] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [bestSellingItems, setBestSellingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({});
    const [pieChartData, setPieChartData] = useState({});

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/dashboard`);
                // console.log("API Response:", response.data); // Log the full response

                if (response.data && response.data.status === 'success') {
                    const data = response.data.data;

                    setTotalOrders(data.totalOrders || 0);
                    setTotalDeliveredOrders(data.totalDeliveredOrders || 0);
                    setTotalPendingOrders(data.totalPendingOrders || 0);
                    setTotalUsers(data.totalUsers || 0);
                    setTotalItemsOrder(data.totalItemsOrders || 0);
                    setTotalRecentOrders(data.recentOrders.length || 0);
                    setTotalSales(data.totalSales || 0);
                    setBestSellingItems(data.bestSellingItems || []);

                    const labels = data.bestSellingItems?.map(item => item.name) || [];
                    const pieData = data.bestSellingItems?.map(item => item.totalSold) || [];
                    setPieChartData({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Best Selling Items',
                                data: pieData,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.6)',
                                    'rgba(54, 162, 235, 0.6)',
                                    'rgba(255, 206, 86, 0.6)',
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(153, 102, 255, 0.6)',
                                ],
                            },
                        ],
                    });

                    // Set the chart data for orders, sales, and users
                    setChartData({
                        labels: data.monthlyData.map(month => month.month),
                        datasets: [
                            {
                                label: 'Total Orders',
                                data: data.monthlyData.map(month => month.totalOrders || 0),
                                backgroundColor: 'rgba(75, 192, 192, 1)',
                            },
                            {
                                label: 'Total Sales',
                                data: data.monthlyData.map(month => month.totalSales || 0),
                                backgroundColor: 'rgba(255, 159, 64, 1)',
                            },
                        ],
                    });
                }

            } catch (err) {
                setError(err.message);
                console.error("Error fetching dashboard data: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);


    const handleRetry = () => {
        setLoading(true);
        setError(null);
        fetchDashboardData(); // Retry fetching data
    };

    const SkeletonLoader = () => (
        <div className="rounded-lg p-6 w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <h1 className="text-2xl font-bold mb-6 h-8 bg-gray-300 rounded w-1/4 animate-pulse"></h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="border p-4 rounded-lg shadow-lg bg-white flex items-center animate-pulse">
                        <div className="h-16 w-16 bg-gray-300 rounded-full mr-4"></div>
                        <div className="flex flex-col justify-between w-full">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-300 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bar Chart Skeleton */}
            <div className="mt-6 animate-pulse">
                <h2 className="text-xl font-semibold mb-4 h-6 bg-gray-300 rounded w-1/3"></h2>
                <div className="h-60 bg-gray-300 rounded"></div>
            </div>

            {/* Pie Chart Skeleton */}
            <div className="mt-6 animate-pulse">
                <h2 className="text-xl font-semibold mb-4 h-6 bg-gray-300 rounded w-1/3"></h2>
                <div className="h-60 bg-gray-300 rounded"></div>
            </div>
        </div>
    );




    if (loading) {
        return (
            <LoadingIndicator />
        );
    }
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-600 text-center font-bold">
                    {`Error: ${error}`}
                    <button onClick={handleRetry} className="ml-4 text-blue-600 underline">Retry</button>
                </div>
            </div>
        );
    }

    // console.log('Rendering:', {
    //     totalOrders,
    //     totalSales,
    //     bestSellingItems,
    // });

    return (
        <div className="rounded-lg p-6 w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4">
                {/* Total Delivered Orders Card */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-green-50 to-green-100 flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faTruck} className="text-5xl mr-4  text-green-600" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Delivered Orders</h2>
                        <p className="text-2xl sm:text-3xl font-bold  text-green-600">{totalDeliveredOrders}</p>
                    </div>
                </div>


                {/* Total Users Card */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-green-50 to-green-100 flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faUsers} className="text-5xl mr-4 text-green-600" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Users</h2>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{totalUsers}</p>
                    </div>
                </div>

                {/* Total Items Pending */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-yellow-50 to-yellow-100 flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faHourglassStart} className="text-5xl mr-4 text-yellow-600" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Orders Pending</h2>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{totalPendingOrders}</p>
                    </div>
                </div>
                {/* Total Sales Card */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-yellow-50 to-yellow-100 flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faDollarSign} className="text-5xl mr-4 text-yellow-600" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Sales</h2>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">₹{totalSales}</p>
                    </div>
                </div>

                {/* Best Selling Items Card */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-50 to-blue-100  hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faChartLine} className="text-5xl mr-4 text-blue-600" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Best Selling Items</h2>
                        </div>
                    </div>
                    <ul className="mt-4 pl-4 text-gray-700 space-y-1">
                        {bestSellingItems.length > 0 ? (
                            bestSellingItems.slice(0, 3).map((item) => (
                                <li key={item.name} className="flex items-center space-x-2">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                                    <span>{item.name} - <span className="font-bold">Sold: {item.totalSold}</span></span>
                                </li>
                            ))
                        ) : (
                            <li>No best-selling items found.</li>
                        )}
                    </ul>
                </div>

                {/* Total Orders Card */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faCartArrowDown} className="text-5xl mr-4 text-blue-600" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Orders</h2>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalOrders}</p>
                    </div>
                </div>

                {/* Total Items Ordered */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-indigo-50 to-indigo-100 flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faBoxOpen} className="text-5xl mr-4 text-indigo-600" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Items Ordered</h2>
                        <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{totalItemsOrder}</p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="border p-6 rounded-xl shadow-lg bg-gradient-to-r from-indigo-50 to-indigo-100 flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faUtensils} className="text-5xl mr-4 text-indigo-600" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Orders (Last 7 days)</h2>
                        <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{totalRecentOrders}</p>
                    </div>
                </div>
            </div>







            {/* Bar Chart Section */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Total Overview',
                            },
                        },
                    }}
                />
            </div>

            {/* Pie Chart Section */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Best Selling Items Chart</h2>
                <div className="relative" style={{ width: '100%', height: '400px' }}>
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Best Selling Items Distribution',
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
