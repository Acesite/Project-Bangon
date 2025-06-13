import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";


const SuperAdminNavBar = () => {
  const location = useLocation();

  const firstName = localStorage.getItem("first_name") || "";
  const lastName = localStorage.getItem("last_name") || "";

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50 font-poppins">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-start ml-[159px]">
          <img src="/images/AgriGIS.png" alt="Lander Logo" className="h-[50px] w-auto" />
        </div>

       
        <nav className="hidden md:flex space-x-6 ml-auto">
          <a
            href="/SuperAdminLandingPage"
            className={`tracking-wide font-medium hover:text-green-700 ${
              location.pathname === "/SuperAdminLandingPage"
                ? "text-green-700 font-medium"
                : "text-black-600"
            }`}
          >
            Home
          </a>
          <a
            href="/ManageAccount"
            className={`tracking-wide font-medium hover:text-green-700 ${
              location.pathname === "/ManageAccount"
                ? "text-green-700 font-medium"
                : "text-black-600"
            }`}
          >
            Accounts
          </a>
          <a
            href="/SuperAdminManageCrop"
            className={`tracking-wide font-medium hover:text-green-700 ${
              location.pathname === "/SuperAdminManageCrop"
                ? "text-green-700 font-medium"
                : "text-black-600"
            }`}
          >
            Crops
          </a>
        </nav>

        {/* Avatar with Dropdown */}
        <div className="relative mr-[130px] ml-6" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-lg focus:outline-none"
            aria-label="User menu"
          >
            {initials || "U"}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
              {/* <Link
                to="/change-password"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Change Password
              </Link> */}
              <Link
                to="/"
                onClick={() => localStorage.clear()}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SuperAdminNavBar;
