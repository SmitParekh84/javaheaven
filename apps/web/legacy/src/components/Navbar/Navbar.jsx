import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from "../../config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEnvelope, faSignOutAlt, faUser, faBars, faXmark, faShoppingCart, faShoppingBasket } from '@fortawesome/free-solid-svg-icons';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin-dashboard' },
  { name: 'Orders', href: '/admin/orders' },
  { name: 'Admin Edit', href: '/admin/edit' },
  { name: 'Revenue', href: '/revenue' },
  { name: 'Add Menu Item', href: '/admin/add-menu-item' },
  { name: 'Stock Management', href: '/admin/stock' },
  { name: 'Best Selling Item', href: '/admin/best-selling' },
];
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

const ProfileMenu = ({ loggedInUser, handleLogout, loading, onClose }) => (
  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-[100]">
    <div className="px-4 py-3 flex items-center text-gray-800">
      <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
      <Link to="/profile" className="hover:text-secondary font-semibold truncate" onClick={onClose}>
        {loggedInUser?.username || "Guest"}
      </Link>
    </div>
    <div className="px-4 py-2 flex items-center text-gray-600 text-sm">
      <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
      <span className="truncate">{loggedInUser?.email || ""}</span>
    </div>
    <div className="border-t border-gray-200" />
    <button
      onClick={handleLogout}
      className={`flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading}
    >
      <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
      {loading ? "Logging out..." : "Logout"}
    </button>
  </div>
);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const totalItemsInCart = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);

  const loggedInUser = useMemo(() => parseJwt(localStorage.getItem('user')), [isLoggedIn]);
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null); // Ref to the profile button
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowProfileMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  useEffect(() => {

    if (loggedInUser) {
      const foundUser = JSON.stringify(loggedInUser);
      // const parseUser = JSON.parse(foundUser);

      setUser(foundUser);

      setIsLoggedIn(true);
    }

  }, [loggedInUser]);

  useEffect(() => {
    const storedAdminInfo = localStorage.getItem("user");

    if (storedAdminInfo) {
      const decodedAdminToken = parseJwt(storedAdminInfo);
      // console.log("decodedAdminToken", decodedAdminToken);
      if (decodedAdminToken) {
        // console.log("decodedAdminToken", decodedAdminToken);
        // console.log("loggedInUser", loggedInUser);
        setUser(decodedAdminToken);
        setIsLoggedIn(true);

        // Check if the user has admin role
        setIsAdmin(decodedAdminToken.role === "admin");
      }
    }

  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      setMobileMenuOpen(false);
      setShowProfileMenu(false); // Close profile menu on logout
      const token = localStorage.getItem('token');
      let userId = null;

      if (token) {
        const decodedToken = parseJwt(token);
        userId = decodedToken ? decodedToken.userId : null;
      }

      await axios.post(`${API_URL}/api/logout`, { userId }, { withCredentials: true });

      sessionStorage.clear();
      localStorage.clear();
      setIsAdmin(false);
      setIsLoggedIn(false);
      setUser(null);

      navigate('/');
      toast.success("Logout Successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      setMobileMenuOpen(false);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }

  };
  const handleLinkClick = (path) => {
    setMobileMenuOpen(false);
    setShowProfileMenu(false); // Close profile menu on navigation
    navigate(path);
  };

  return (
    <header className="inset-x-0 top-0 ">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-10 " >
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Java Heaven</span>
            <img alt="Company-Logo" src="/images/logo-3.png" className="h-16 w-auto" />
          </Link>
        </div>

        <div className="flex items-center lg:hidden   ">
          {isLoggedIn && !isAdmin && (
            <Link
              to="/cart"
              className="flex items-center text-sm font-semibold leading-6 text-gray-900 hover:text-secondary mr-4 relative"
            >
              <FontAwesomeIcon icon={faShoppingBasket} className="cursor-pointer text-2xl" />
              {totalItemsInCart > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-light text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {totalItemsInCart}
                </span>
              )}
            </Link>
          )}

          {!isLoggedIn && (
            <Link to="/login" className="text-sm bg-secondary rounded-full py-2 px-8 font-semibold leading-6 text-primary shadow-md transition-transform duration-300 ease-in-out hover:scale-105">
              <span className="mr-2">Log in</span> <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <FontAwesomeIcon icon={faBars} className="text-2xl cursor-pointer" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {(!isLoggedIn || (isLoggedIn && !isAdmin)) && (
            <>
              <Link key="home" to="/" className="text-sm font-semibold leading-6 text-gray-900 hover:text-secondary">
                Home
              </Link>
              <Link key="about" to="/about" className="text-sm font-semibold leading-6 text-gray-900 hover:text-secondary">
                About
              </Link>
              <Link key="leadership-team" to="/leadership-team" className="text-sm font-semibold leading-6 text-gray-900 hover:text-secondary">
                Leadership
              </Link>
              <Link key="menu" to="/menu" className="text-sm font-semibold leading-6 text-gray-900 hover:text-secondary">
                Menu
              </Link>
            </>
          )}

          {isLoggedIn && !isAdmin && (
            <>
              <Link key="my-orders" to="/my-orders" className="text-sm font-semibold leading-6 text-gray-900 hover:text-secondary">
                My Orders
              </Link>
              <Link to="/cart" className="flex items-center text-sm font-semibold leading-6 text-gray-900 hover:text-secondary mr-4">

                <FontAwesomeIcon icon={faShoppingCart} className=" cursor-pointer" /><span className='ml-2'>Cart {totalItemsInCart > 0 && `(${totalItemsInCart})`}</span>
              </Link>
            </>
          )}

          {isLoggedIn && isAdmin && adminNavigation.map((item) => (
            <Link key={item.name} to={item.href} className="text-sm font-semibold leading-6 text-gray-900 hover:text-secondary">
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-800 rounded-md transition duration-200 ease-in-out hover:text-secondary"
                aria-haspopup="true"
                aria-expanded={showProfileMenu}
              >
                <FontAwesomeIcon icon={faUser} className=" cursor-pointer" />
                <span className="truncate">{loggedInUser.username || "Guest"}</span>
              </button>
              {showProfileMenu && <ProfileMenu loggedInUser={loggedInUser} handleLogout={handleLogout} loading={loading} onClose={() => setShowProfileMenu(false)} />}
            </div>
          ) : (
            <Link to="/login" className="text-sm bg-secondary rounded-full py-2 px-8 font-semibold leading-6 text-primary shadow-md transition-transform duration-300 ease-in-out hover:scale-105">
              <span className="mr-2">Log in</span> <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
          )}
        </div>
      </nav>

      <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-primary-foreground px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => handleLinkClick('/')} className="-m-1.5 p-1.5">
              <span className="sr-only">Java Heaven</span>
              <img alt="" src="/images/logo-3.png" className="h-16 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <FontAwesomeIcon icon={faXmark} className="cursor-pointer text-2xl  " />            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500 text-center">
              <div className="space-y-2 py-6">
                {(!isLoggedIn || (isLoggedIn && !isAdmin)) && (
                  <>
                    <Link
                      key="home"
                      to="/"
                      onClick={() => handleLinkClick('/')}
                      className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200"
                    >
                      Home
                    </Link>
                    <Link
                      key="menu"
                      to="/menu"
                      onClick={() => handleLinkClick('/menu')}
                      className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200"
                    >
                      Menu
                    </Link>
                    <Link key="leadership-team" to="/leadership-team" onClick={() => handleLinkClick('/leadership-team')} className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200">
                      Leadership
                    </Link>
                    <Link
                      key="about"
                      to="/about"
                      onClick={() => handleLinkClick('/about')}
                      className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200"
                    >
                      About
                    </Link>
                  </>
                )}

                {isLoggedIn && (isAdmin ? adminNavigation : []).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200"
                  >
                    {item.name}
                  </Link>
                ))}

                {isLoggedIn && !isAdmin && (
                  <>
                    <Link
                      key="my-orders"
                      to="/my-orders"
                      onClick={() => handleLinkClick('/my-orders')}
                      className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200"
                    >
                      My Orders
                    </Link>


                    <Link
                      to="/cart"
                      onClick={() => handleLinkClick('/cart')}
                      className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200"
                    >
                      <span className='mr-2'>Cart {totalItemsInCart > 0 && `(${totalItemsInCart})`}</span>
                      <FontAwesomeIcon icon={faShoppingCart} className=" cursor-pointer" />

                    </Link>
                    <Link
                      key="my-orders"
                      to="/profile"
                      onClick={() => handleLinkClick('/profile')}
                      className="-mx-3 block rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-200"
                    >
                      <span className='mr-2'>Profile</span>
                      <FontAwesomeIcon icon={faUser} className="mr-2 " />


                    </Link>
                  </>
                )}
              </div>

              <div className="py-6 flex justify-around">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="-mx-3 block w-full rounded-lg py-1.5 px-3 text-base font-semibold leading-6 text-red-600 hover:bg-muted-foreground"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => handleLinkClick('/login')}
                    className="text-sm bg-secondary rounded-full py-2 px-8 font-semibold leading-6 text-primary shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
                  >
                    <span className="mr-2">Log in</span> <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}