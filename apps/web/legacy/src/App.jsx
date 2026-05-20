// src/App.jsx
import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Pages/Footer";
import ProtectedRoute from "./components/Pages/ProtectedRoute";
import LoadingIndicator from "./components/Menu/LoadingIndicator"
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import LeadershipTeam from "./components/Pages/LeadershipTeam";
import About from "./components/Pages/About";
import NotFound from "./NotFound";
import OrderSuccess from "./components/Menu/OrderSuccess";
import StockManagement from "./components/Pages/Stock";
// Lazy load your components
const Hero = React.lazy(() => import("./components/Hero/Hero"));
const GetHelp = React.lazy(() => import("./components/Pages/GetHelp"));
const ItemList = React.lazy(() => import("./components/Menu/ItemList"));
const Login = React.lazy(() => import("./components/Pages/Login"));
const ItemDetail = React.lazy(() => import("./components/Menu/ItemDetail"));
const Cart = React.lazy(() => import("./components/Menu/Cart"));
const SignUp = React.lazy(() => import("./components/Pages/SignUp"));
const Profile = React.lazy(() => import("./components/Pages/Profile"));
const MyOrders = React.lazy(() => import("./components/Pages/MyOrders"));
const AdminDashboard = React.lazy(() => import("./components/Pages/AdminDashboard"));
const AdminLogin = React.lazy(() => import("./components/Pages/AdminLogin"));
const AdminEdit = React.lazy(() => import("./components/Pages/AdminEdit"));
const AddMenuItem = React.lazy(() => import("./components/Pages/AddMenuItem"));
const AdminOrders = React.lazy(() => import("./components/Pages/AdminOrders"));
const BestSellingItem = React.lazy(() => import("./components/Pages/BestSellingItem"));
// const About = React.lazy(() => import("./components/Pages/About"));
const RevenuePage = React.lazy(() => import("./components/Pages/RevenuePage"));

export default function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <UserProvider>
        <CartProvider>
          <Router>
            <ScrollToTop /> {/* Add ScrollToTop component here */}
            <div className="flex flex-col min-h-screen  font-spartan">
              <Navbar />

              <Suspense fallback={<div className="flex-grow"><LoadingIndicator /></div>}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Hero />} />
                  <Route path="/menu/:category?" element={<ItemList />} />
                  <Route path="/get-help" element={<GetHelp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/leadership-team" element={<LeadershipTeam />} />
                  <Route path="/item/:id" element={<ItemDetail />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/revenue" element={<RevenuePage />} />
                  {/* Protected User Routes */}
                  <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  {/* Protected Admin Routes */}

                  <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/edit" element={<ProtectedRoute adminOnly><AdminEdit /></ProtectedRoute>} />
                  <Route path="/admin/add-menu-item" element={<ProtectedRoute adminOnly><AddMenuItem /></ProtectedRoute>} />
                  <Route path="/admin/stock" element={<ProtectedRoute adminOnly><StockManagement /></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
                  <Route path="/admin/best-selling" element={<ProtectedRoute adminOnly><BestSellingItem /></ProtectedRoute>} />
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} /> {/* Catch-all route for 404 */}
                </Routes>
              </Suspense>

              <Footer />
            </div>
          </Router>
        </CartProvider>
      </UserProvider>
    </>
  );
}
