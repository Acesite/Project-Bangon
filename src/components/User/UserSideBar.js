import React from "react";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";

const UserSideBar = () => {
  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-20 p-6 overflow-y-auto border-r border-gray-200">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <img src={AgriGISLogo} alt="AgriGIS Logo" className="h-30 object-contain" />
      </div>

      {/* Section Title */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Location Information</h2>

      {/* Region */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Region</label>
        <input type="text" value="Western Visayas" readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" />
      </div>

      {/* Province */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Province</label>
        <input type="text" value="Negros Occidental" readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" />
      </div>

      {/* Municipality */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Municipality</label>
        <input type="text" value="Bago City" readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" />
      </div>

      {/* Barangay */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Barangay</label>
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          {[
            "Abuanan", "Alianza", "Atipuluan", "Bacong", "Bagroy", "Balingasag",
            "Binubuhan", "Busay", "Calumangan", "Caridad", "Dulao", "Ilijan",
            "Lag-asan", "Mailum", "Ma-ao", "Malingin", "Napoles", "Pacol",
            "Poblacion", "Sagasa", "Tabunan", "Taloc", "Talon", "Tinongan"
          ].map((brgy) => (
            <option key={brgy} value={brgy}>{brgy}</option>
          ))}
        </select>
      </div>

      {/* Crop Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Crop Suitability</label>
        {["Banana", "Cassava", "Corn", "Sugarcane", "Rice", "Vegetables"].map((crop) => (
          <div className="flex items-center mb-1" key={crop}>
            <input type="checkbox" id={crop} className="mr-5 accent-green-600" />
            <label htmlFor={crop} className="text-sm text-gray-700">{crop}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSideBar;
