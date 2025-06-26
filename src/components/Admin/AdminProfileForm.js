import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminProfileForm = ({ onClose }) => {
  const [adminProfile, setAdminProfile] = useState({
    first_name: localStorage.getItem("first_name") || "",
    last_name: localStorage.getItem("last_name") || "",
    email: localStorage.getItem("email") || "",
    profile_picture: localStorage.getItem("profile_picture") || "",
  });

  const [password, setPassword] = useState(localStorage.getItem("password") || "");
  const [confirmPassword, setConfirmPassword] = useState(localStorage.getItem("password") || ""); // Optional, or empty string
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const handleUpdate = async () => {
    try {
      const id = localStorage.getItem("user_id");

      if (password && password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      const formData = new FormData();
      formData.append("first_name", adminProfile.first_name);
      formData.append("last_name", adminProfile.last_name);
      formData.append("email", adminProfile.email);
      if (password.trim()) formData.append("password", password);
      if (file) formData.append("profile_picture", file);

      const response = await axios.put(
        `http://localhost:5000/api/profile/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      localStorage.setItem("first_name", adminProfile.first_name);
      localStorage.setItem("last_name", adminProfile.last_name);
      localStorage.setItem("email", adminProfile.email);
      if (response.data.profile_picture) {
        localStorage.setItem("profile_picture", response.data.profile_picture);
      }

      alert("Profile updated successfully.");
      setPassword("");
      setConfirmPassword("");
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8 text-sm text-gray-800 font-poppins">
    <h2 className="text-xl font-bold text-green-700 border-b pb-2">Edit Profile</h2>
  
    {/* Profile Image Section */}
    <div className="flex flex-col items-center">
      <img
        src={
          preview ||
          (adminProfile.profile_picture && `http://localhost:5000${adminProfile.profile_picture}`) ||
          "/default-avatar.png"
        }
        alt="Profile"
        className="h-28 w-28 rounded-full object-cover border shadow-sm"
      />
      <label className="mt-4 text-sm text-gray-600 font-medium">Change Profile Picture</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mt-2 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0 file:text-sm file:font-semibold
          file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />
    </div>
  
    {/* Form Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-gray-700 font-medium mb-1">First Name</label>
        <input
          type="text"
          value={adminProfile.first_name}
          onChange={(e) =>
            setAdminProfile((prev) => ({ ...prev, first_name: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
  
      <div>
        <label className="block text-gray-700 font-medium mb-1">Last Name</label>
        <input
          type="text"
          value={adminProfile.last_name}
          onChange={(e) =>
            setAdminProfile((prev) => ({ ...prev, last_name: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
  
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
        type="email"
        name="admin_email"
        autoComplete="off"
        value={adminProfile.email}
        onChange={(e) =>
          setAdminProfile((prev) => ({ ...prev, email: e.target.value }))
        }
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
      />

      </div>
  
      <div>
        <label className="block text-gray-700 font-medium mb-1">New Password</label>
        <input
        type="password"
        name="new_password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
        placeholder="Leave blank to keep current password"
      />
      </div>
  
      <div>
        <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
        <input
        type="password"
        name="confirm_password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
      />

      </div>
    </div>
  
    {/* Action Buttons */}
    <div className="flex justify-end gap-3 pt-4">
      <button
        onClick={onClose}
        className="px-5 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-red-300 transition font-medium"
      >
        Cancel
      </button>
      <button
        onClick={handleUpdate}
        className="px-5 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition font-medium"
      >
        Save
      </button>
    </div>
  </div>
  
  );
};

export default AdminProfileForm;
