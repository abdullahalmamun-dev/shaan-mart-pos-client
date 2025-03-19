import 'react'
import { useEffect, useState } from 'react';
import { CiPower, CiSettings, CiUser } from 'react-icons/ci';
import useUser from '../getUser/GetUser';
import { MdOutlineArrowDropDown } from 'react-icons/md';
import { IoHomeOutline, IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import { FaUsersViewfinder } from 'react-icons/fa6';
import { IoMdArrowRoundBack } from 'react-icons/io';
import './DarkMode.css'

export default function CommonTopNab() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const user = useUser();
  const navigate = useNavigate();
  // Function to toggle the side menu
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };
  const handleLogout = () => {
    // Clear user data from sessionStorage
    localStorage.removeItem('user');
    toast.success('Logged out successfully.')
    navigate('/login');
  };

  // Handle full screen
  // Full-Screen Toggle Handler
  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((err) => console.error('Fullscreen request failed:', err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullScreen(false))
        .catch((err) => console.error('Exiting fullscreen failed:', err));
    }
  };

  // Dark Mode Toggle Handler
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  const location = useLocation();
  const isLocation = location.pathname === "/dashboard"
  const isPos = location.pathname === "/pos"
  return (
    <div className="w-full h-16 border-b flex items-center justify-between gap-5 pr-5">
      <p className={`ml-5 uppercase text-3xl font-semibold  text-blue-600`}>
        {isLocation && `Welcome ${user?.name}`}
        {isPos && <NavLink to="/dashboard"><IoMdArrowRoundBack /></NavLink>}
      </p>
      <div className="flex gap-8">
        <NavLink to="/dashboard">
          <button
            className="flex items-center border px-2 py-2 rounded-xl transition-all duration-300 hover:bg-blue-100"

          >
            <IoHomeOutline className="text-2xl" />
          </button>
        </NavLink>
        <NavLink to="/customerList">
          <button
            className="flex items-center border px-2 py-2 rounded-xl transition-all duration-300 hover:bg-blue-100"

          >
            <FaUsersViewfinder className="text-2xl" />
          </button>
        </NavLink>

        <button
          className="flex items-center px-2 py-2 rounded-xl transition-all duration-300 hover:bg-blue-100"
          onClick={handleFullScreen}
        >
          {isFullScreen ? (
            <AiOutlineFullscreenExit className="text-2xl" />
          ) : (
            <AiOutlineFullscreen className="text-2xl" />
          )}
        </button>
        {/* Dark Mode Toggle */}
        <button
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
        >
          {theme === 'light' ? (
            <IoMoonOutline className="text-xl" />
          ) : (
            <IoSunnyOutline className="text-xl" />
          )}
        </button>
        <button
          className="flex items-center px-2 py-2 rounded-xl transition-all duration-300 hover:bg-blue-100"
          onClick={toggleSideMenu}
        >
          <CiUser className="text-2xl" /> {user?.role} <MdOutlineArrowDropDown />
        </button>
      </div>

      {/* Side menu */}
      <div
        className={`fixed top-0 right-0 h-[100vh] border-l border-[#696969] w-[85%] md:w-[300px] bg-white transition-transform duration-500 ease-in-out transform ${isSideMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{ zIndex: 1000 }}
      >
        <div className="border border-[#f7f7f7] h-16 bg-[#f7f7f7]">
          <button
            onClick={toggleSideMenu}
            className="absolute text-4xl text-red top-3 right-5 hover:text-red-600"
          >
            &times;
          </button>
        </div>
        <div>
          <NavLink to="/myProfile">
            <button className="flex items-center hover:text-blue-600 transition-all duration-300 h-16 border-b w-full pl-5">
              <CiUser className="text-2xl" /> My Profile
            </button>
          </NavLink>
          <button className="flex items-center hover:text-blue-600 transition-all duration-300 h-16 border-b w-full pl-5">
            <CiSettings className="text-2xl" /> Settings
          </button>
          <div>
            <button
              onClick={handleLogout}
              className="flex items-center hover:text-red-600 transition-all duration-300 h-16 border-b w-full pl-5"
            >
              <CiPower className="text-2xl" /> Logout
            </button>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
