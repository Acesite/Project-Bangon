import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

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
});
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
              href="/SuperAdminLandingPage"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/AdminLanding"
                  ? "text-green-700 font-medium"
                  : "text-black-600"
              }`}
            >
              Home
            </a>
<a
              href="/ManageAccount"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/ManageCrops"
                  ? "text-green-700 font-medium"
                  : "text-black-600"
              }`}
            >
              Manage Account
            </a>
            <a
              href="/SuperAdminManageCrop"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/SuperAdminManageCrop"
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
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-lg focus:outline-none"
              aria-label="User menu"
            >
              {initials || "U"}
            </button>

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
      <div className="space-y-3">
              <input
          type="text"
          name="first_name"
          value={adminProfile.first_name}
          onChange={(e) =>
            setAdminProfile((prev) => ({ ...prev, first_name: e.target.value }))
          }
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your first name"
        />

        <input
          type="text"
          name="last_name"
          value={adminProfile.last_name}
          onChange={(e) =>
            setAdminProfile((prev) => ({ ...prev, last_name: e.target.value }))
          }
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your last name"
        />

        <input
          type="email"
          name="email"
          value={adminProfile.email}
          onChange={(e) =>
            setAdminProfile((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your email address"
        />

        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          placeholder="New password (leave blank to keep current)"
        />

        <input
          type="password"
          name="confirm_password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          placeholder="Confirm new password"
        />

      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setShowProfileModal(false)}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
      onClick={async () => {
      try {
        const id = localStorage.getItem("user_id");

        if (password && password !== confirmPassword) {
          alert("Passwords do not match.");
          return;
        }

        const payload = {
          first_name: adminProfile.first_name,
          last_name: adminProfile.last_name,
          email: adminProfile.email,
        };

        if (password.trim()) {
          payload.password = password;
        }

        await axios.put(`http://localhost:5000/api/profile/${id}`, payload);

        localStorage.setItem("first_name", adminProfile.first_name);
        localStorage.setItem("last_name", adminProfile.last_name);
        localStorage.setItem("email", adminProfile.email);

        alert("Profile updated successfully.");
        setShowProfileModal(false);
        setPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    }}

  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
>
  Save
</button>

      </div>
    </div>
  </div>
)}

    </header>
  );
};

export default AdminNavBar;
