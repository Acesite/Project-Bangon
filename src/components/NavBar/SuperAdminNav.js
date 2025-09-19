import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // keep these in state so UI (initials, modal) react to changes
  const [firstName, setFirstName] = useState(localStorage.getItem("first_name") || "");
  const [lastName, setLastName] = useState(localStorage.getItem("last_name") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    first_name: firstName,
    last_name: lastName,
    email: email,
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // close avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔁 Bootstrap profile from API on mount and sync to localStorage + state
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (!id) return;

    axios
      .get(`http://localhost:5000/api/profile/${id}`)
      .then(({ data }) => {
        // adjust these keys if your API uses other names
        const fn = data.first_name ?? "";
        const ln = data.last_name ?? "";
        const em = data.email ?? data.user?.email ?? "";

        setFirstName(fn);
        setLastName(ln);
        setEmail(em);

        setAdminProfile({ first_name: fn, last_name: ln, email: em });

        localStorage.setItem("first_name", fn);
        localStorage.setItem("last_name", ln);
        if (em) localStorage.setItem("email", em);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        // fall back to whatever is already in localStorage
        setAdminProfile({
          first_name: localStorage.getItem("first_name") || "",
          last_name: localStorage.getItem("last_name") || "",
          email: localStorage.getItem("email") || "",
        });
      });
  }, []);

  // When opening the modal, seed inputs with the latest state
  useEffect(() => {
    if (showProfileModal) {
      setAdminProfile({ first_name: firstName, last_name: lastName, email });
    }
  }, [showProfileModal, firstName, lastName, email]);

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const onSaveProfile = async () => {
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
      if (password.trim()) payload.password = password;

      await axios.put(`http://localhost:5000/api/profile/${id}`, payload);

      // sync UI and localStorage
      setFirstName(adminProfile.first_name);
      setLastName(adminProfile.last_name);
      setEmail(adminProfile.email);

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
  };

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50 font-poppins">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-start ml-[159px]">
          <img src="/images/AgriGIS.png" alt="AgriGIS" className="h-[50px] w-auto" />
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-6 ml-auto">
          <nav className="hidden md:flex space-x-6">
            <a
              href="/SuperAdminLandingPage"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/AdminLanding" ? "text-green-700 font-medium" : "text-black-600"
              }`}
            >
              Home
            </a>
            <a
              href="/ManageAccount"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/ManageAccount" ? "text-green-700 font-medium" : "text-black-600"
              }`}
            >
              Manage Account
            </a>
            <a
              href="/SuperAdminManageCrop"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/SuperAdminManageCrop" ? "text-green-700 font-medium" : "text-black-600"
              }`}
            >
              Crops
            </a>
            <a
              href="/Graphs"
              className={`tracking-wide font-light hover:text-green-700 ${
                location.pathname === "/Graphs" ? "text-green-700 font-medium" : "text-black-600"
              }`}
            >
              Graphs
            </a>
          </nav>
        </div>

        {/* Avatar */}
        <div className="relative mr-[130px] ml-6" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((s) => !s)}
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
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
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
                onChange={(e) => setAdminProfile((p) => ({ ...p, first_name: e.target.value }))}
                className="w-full border px-4 py-2 rounded"
                placeholder="Enter your first name"
              />
              <input
                type="text"
                name="last_name"
                value={adminProfile.last_name}
                onChange={(e) => setAdminProfile((p) => ({ ...p, last_name: e.target.value }))}
                className="w-full border px-4 py-2 rounded"
                placeholder="Enter your last name"
              />
              <input
                type="email"
                name="email"
                value={adminProfile.email}
                onChange={(e) => setAdminProfile((p) => ({ ...p, email: e.target.value }))}
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
                onClick={onSaveProfile}
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
