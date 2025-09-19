import React from "react";
import { useNavigate } from "react-router-dom";

const ChooseRoleLogin = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    if (role === "admin") {
      navigate("/Login");   // ✅ go to Super Admin landing
    } else if (role === "fieldOfficer") {
      navigate("/Login");             // keep your existing route (rename if you have a specific Field Officer login)
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 font-poppins">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[450px] text-center space-y-6">
        <img src="/images/AgriGIS.png" alt="Logo" className="w-100 h-24 mx-auto" />
        <h2 className="text-2xl font-bold text-green-700">Login as</h2>

        {/* Admin */}
        <button
          onClick={() => handleSelect("admin")}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
        >
          I'm an Admin
        </button>

        {/* Field Officer */}
        <button
          onClick={() => handleSelect("fieldOfficer")}
          className="w-full border border-green-500 text-green-600 py-3 rounded-lg hover:bg-green-50"
        >
          I'm a Field Officer
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 hover:underline cursor-pointer"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default ChooseRoleLogin;
