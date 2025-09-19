import React from "react";
import { useNavigate } from "react-router-dom";

const ChooseMap = () => {
  const navigate = useNavigate();

  const handleSelect = (map) => {
    if (map === "calamity") {
      navigate("/CalamityFarmerMap");
    } else if (map === "crop") {
      navigate("/AdminMap");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 font-poppins">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[450px] text-center space-y-6">
        <img src="/images/AgriGIS.png" alt="Logo" className="w-100 h-24 mx-auto" />
        <h2 className="text-2xl font-bold text-green-700">Choose a Map</h2>

        {/* Calamity Map */}
        <button
          onClick={() => handleSelect("calamity")}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
        >
          Calamity Map
        </button>

        {/* Crop Map */}
        <button
          onClick={() => handleSelect("crop")}
          className="w-full border border-green-500 text-green-600 py-3 rounded-lg hover:bg-green-50"
        >
          Crop Map
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

export default ChooseMap;
