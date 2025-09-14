import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
// import axios from "axios"; // (unused here)
import AdminProfileForm from "../Admin/AdminProfileForm";

/** Reusable avatar button with robust image handling */
function AvatarButton({ profilePicture, initials, onClick }) {
  const [imgError, setImgError] = useState(false);

  // Prefer Vite env, then CRA, then localhost as fallback
  const base =
    (import.meta?.env && import.meta.env.VITE_API_URL) ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000";

  // Treat "", null, "null", "undefined" as empty
  const raw = profilePicture;
  const hasValue =
    raw && raw !== "null" && raw !== "undefined" && String(raw).trim() !== "";

  const src = hasValue
    ? (raw.startsWith("http")
        ? raw
        : `${base}${raw.startsWith("/") ? raw : `/${raw}`}`)
    : "";

  // Debug: see the final URL we try to load
  useEffect(() => {
    if (hasValue) console.log("[Avatar] img src =", src);
  }, [src, hasValue]);

  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full overflow-hidden focus:outline-none border border-gray-300"
      aria-label="User menu"
      title={src} // handy hover check
    >
      {hasValue && !imgError ? (
        <img
          src={src}
          alt="Profile"
          className="w-full h-full object-cover"
          onLoad={() => setImgError(false)}
          onError={() => {
            console.warn("[Avatar] failed to load:", src);
            setImgError(true);
          }}
        />
      ) : (
        <div className="bg-green-600 w-full h-full flex items-center justify-center text-white font-semibold text-lg">
          {initials || "U"}
        </div>
      )}
    </button>
  );
}

const AdminNavBar = () => {
  const location = useLocation();

  const firstName = localStorage.getItem("first_name") || "";
  const lastName = localStorage.getItem("last_name") || "";

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [adminProfile, setAdminProfile] = useState({
    first_name: firstName,
    last_name: lastName,
    email: localStorage.getItem("email") || "",
    profile_picture: localStorage.getItem("profile_picture") || "",
  });

  const profilePicture = adminProfile.profile_picture;
  console.log("Profile Picture Path:", profilePicture);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        </div>

        {/* Avatar with Dropdown */}
        <div className="relative mr-[130px] ml-6" ref={dropdownRef}>
          <AvatarButton
            profilePicture={profilePicture}
            initials={initials}
            onClick={() => setShowDropdown((s) => !s)}
          />

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowProfileModal(true);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
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

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-green-700 mb-4">Admin Profile</h2>

            {/* Reusable component here */}
            <AdminProfileForm
              onClose={() => {
                setAdminProfile({
                  first_name: localStorage.getItem("first_name") || "",
                  last_name: localStorage.getItem("last_name") || "",
                  email: localStorage.getItem("email") || "",
                  profile_picture: localStorage.getItem("profile_picture") || "",
                });
                setShowProfileModal(false);
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavBar;
