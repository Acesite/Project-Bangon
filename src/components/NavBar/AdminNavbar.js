import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const AdminNavBar = () => {
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

        {/* Navigation + Logout */}
        <div className="flex items-center space-x-6 ml-auto">

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <a
              href="/AdminLanding"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/AdminLanding"
                  ? "text-green-700 font-medium"
                  : "text-black-600"
              }`}
            >
              Home
            </a>

            <a
              href="/ManageCrops"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/ManageCrops"
                  ? "text-green-700 font-medium"
                  : "text-black-600"
              }`}
            >
              Crops
            </a>
          </nav>

          {/* Logout Button (unchanged) */}
          {/* <Link to="/Login" onClick={() => localStorage.clear()}>
            <button className="relative inline-block group">
              <span className="relative z-10 px-3.5 py-2 overflow-hidden font-medium leading-tight flex items-centrer justify-center text-green-600 transition-colors duration-300 ease-out border-2 border-green-600 rounded-lg group-hover:text-white">
                <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
                <span className="absolute left-0 w-40 h-40 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-green-600 group-hover:-rotate-180 ease"></span>
                <span className="relative text-base font-poppins"> Logout</span>
              </span>
              <span className="absolute bottom-0 right-0 w-full h-9 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-600 rounded-lg group-hover:mb-0 group-hover:mr-0 group-hover:mb-2" />
            </button>
          </Link> */}
        </div>


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
                <Link
                  to="/change-password"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Change Password
                </Link>

                <Link
                  to="/"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

export default AdminNavBar;
