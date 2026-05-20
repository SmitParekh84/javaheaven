// src/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement, // For pie chart
    Tooltip,
    Legend,
} from 'chart.js';
import { API_URL } from '../../config';
import LoadingIndicator from '../Menu/LoadingIndicator';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BestSellingItem = () => {
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [bestSellingItems, setBestSellingItems] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pieChartData, setPieChartData] = useState({});

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/dashboard`);
                const data = response.data.data; // Assuming your response has a `data` property
                setTotalOrders(data.totalOrders || 0);
                setTotalUsers(data.totalUsers || 0);
                setTotalSales(data.totalSales || 0);
                setBestSellingItems(data.bestSellingItems || []); // Ensure it's an array

                // Pie chart data for best-selling items
                const labels = data.bestSellingItems?.map(item => item.name) || []; // Use optional chaining
                const soldData = data.bestSellingItems?.map(item => item.totalSold) || [];
                setPieChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Sold Quantity',
                            data: soldData,
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
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);


    if (loading) {
        return (
            <LoadingIndicator />
        );
    }


    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="rounded-lg p-6 w-full container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0 ">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Top Selling Items</h1>

            {/* Best Selling Items Section */}
            <div className="bg-white p-4 rounded-lg shadow-lg ">
                <h2 className="text-xl font-bold mb-4 text-secondary border-b-2 border-setext-secondary pb-2">Top Selling Items</h2>
                <div className="max-h-60 overflow-y-auto">
                    <ul className="list-disc pl-4">
                        {bestSellingItems.length > 0 ? (
                            bestSellingItems.map((item) => (
                                <li key={item.name} className="text-gray-800 mb-2 flex items-center hover:bg-primary-foreground transition-colors rounded p-2">
                                    <FontAwesomeIcon icon={faChartLine} className="text-secondary mr-2" />
                                    <span className="font-bold">{item.name}</span> - <span className="text-secondary font-semibold">{item.totalSold}</span> Sold
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-700">No best-selling items found.</li>
                        )}
                    </ul>
                </div>
            </div>


            {/* Pie Chart Section */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 text-black">Best Selling Items Distribution</h2>
                <div className="relative" style={{ width: '100%', height: '400px' }}>
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false, // Allows the chart to resize based on parent dimensions
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        color: 'gray',
                                    },
                                },
                                title: {
                                    display: true,
                                    text: 'Best Selling Items Distribution',
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

    );
};

export default BestSellingItem;
