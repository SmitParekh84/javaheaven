// src/components/Pages/RevenuePage.jsx 
import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartArrowDown, faHandHoldingHeart, faHome, faShoppingBag, faTruck, faUtensils } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const RevenuePage = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({});
    const [deliveryChartData, setDeliveryChartData] = useState({});
    const [dataType, setDataType] = useState('monthly'); // New state for dropdown selection
    const [timePeriod, setTimePeriod] = useState('monthly'); // Default to 'monthly'

    // Function to fetch revenue data from dashboard endpoint
    const fetchRevenueData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/dashboard`);
            // console.log("Dashboard API Response:", response.data); // Log the full response

            if (response.data && response.data.status === 'success') {
                const data = response.data.data;

                // Set total revenue from the dashboard
                setTotalRevenue(data.totalSales || 0);

                // Prepare the chart data based on the selected time period
                updateChartData(data);

                // Prepare the pie chart data based on deliveryOptionData
                const deliveryOptions = data.deliveryOptionData?.map(item => item.deliveryOption) || [];
                const deliverySales = data.deliveryOptionData?.map(item => item.totalSales) || [];

                // Set the delivery chart data for the pie chart
                setDeliveryChartData({
                    labels: deliveryOptions,
                    datasets: [
                        {
                            label: 'Sales by Delivery Option',
                            data: deliverySales,
                            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
                        },
                    ],
                });
            } else {
                console.error("Failed to fetch data: ", response.data.message || 'Unknown error');
            }
        } catch (err) {
            setError(err.message);
            console.error("Error fetching revenue data: ", err); // Log detailed error information
        } finally {
            setLoading(false); // Ensure loading state is reset
        }
    };

    // Function to update chart data based on selected data type
    const updateChartData = (data) => {
        let labels = [];
        let revenueAmounts = [];

        switch (dataType) {
            case 'monthly':
                labels = data.monthlyData?.map(item => item.month) || [];
                revenueAmounts = data.monthlyData?.map(item => item.totalSales) || [];
                break;
            case 'daily':
                labels = data.dailyData?.map(item => item._id) || [];
                revenueAmounts = data.dailyData?.map(item => item.totalSales) || [];
                break;
            case 'yearly':
                labels = data.yearlyData?.map(item => item._id) || [];
                revenueAmounts = data.yearlyData?.map(item => item.totalSales) || [];
                break;
            default:
                break;
        }

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Revenue Over Time',
                    data: revenueAmounts,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                },
            ],
        });
    };

    useEffect(() => {
        fetchRevenueData(); // Fetch data on component mount
    }, []);

    useEffect(() => {
        // Update chart data when dataType changes
        fetchRevenueData();
    }, [dataType]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        fetchRevenueData(); // Retry fetching data
    };

    if (loading) {
        return <LoadingIndicator />;
    }
    if (error) {
        return (
            <div className="text-red-600 text-center font-bold">
                {`Error: ${error}`}
                <button onClick={handleRetry} className="ml-4 text-blue-600 underline">Retry</button>
            </div>
        );
    }

    return (
        <div className="rounded-lg p-8 w-full mt-10 container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Revenue Page</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Total Revenue: <span className="text-green-600">₹{totalRevenue}</span></h2>



            {/* Cards for Total Revenue by Delivery Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="border p-6 rounded-lg shadow-lg bg-white flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faTruck} className="text-5xl mr-4 text-blue-500" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Coffee-to-Home Revenue</h2>
                        <p className="text-2xl font-bold text-blue-600">₹{deliveryChartData.labels?.includes('home') ? deliveryChartData.datasets[0].data[deliveryChartData.labels.indexOf('home')] : 0}</p>
                    </div>
                </div>
                <div className="border p-6 rounded-lg shadow-lg bg-white flex items-center hover:shadow-2xl transition-shadow duration-300">
                    <FontAwesomeIcon icon={faUtensils} className="text-5xl mr-4 text-green-500" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Takeaway Revenue</h2>
                        <p className="text-2xl font-bold text-green-600">₹{deliveryChartData.labels?.includes('hand') ? deliveryChartData.datasets[0].data[deliveryChartData.labels.indexOf('hand')] : 0}</p>
                    </div>
                </div>
            </div>


            {/* Bar Chart Section */}
            <div className="mt-6">
                {/* Dropdown for selecting data type */}
                <div className="mb-4 flex justify-end">
                    <label htmlFor="data-type" className="mr-2 text-gray-600">Select Data Type:</label>
                    <select
                        id="data-type"
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value)}
                        className="border rounded p-2"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="daily">Daily</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: 'gray',
                                },
                            },
                            title: {
                                display: true,
                                text: 'Revenue Over Time',
                                color: 'gray',
                                font: {
                                    size: 20,
                                },
                            },
                        },
                        scales: {
                            x: {
                                grid: {
                                    color: '#e5e7eb', // Light gray for grid lines
                                },
                            },
                            y: {
                                grid: {
                                    color: '#e5e7eb', // Light gray for grid lines
                                },
                                ticks: {
                                    color: 'gray',
                                },
                            },
                        },
                    }}
                />
            </div>

            {/* Pie Chart Section */}
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Sales by Delivery Option</h2>

                {/* Center and make responsive */}
                <div className="flex justify-center">
                    <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl" style={{ height: '400px' }}>
                        <Pie
                            data={deliveryChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false, // Ensures responsiveness
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: {
                                            color: 'gray',
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: 'Sales by Delivery Option',
                                        color: 'gray',
                                        font: {
                                            size: 20,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default RevenuePage;
