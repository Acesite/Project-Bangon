// src/components/UserSideBar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";

const UserSideBar = ({ zoomToBarangay, onBarangaySelect }) => {
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [barangayDetails, setBarangayDetails] = useState(null);
  const navigate = useNavigate();

  const barangayCoordinates = {
    Abuanan: [122.984389, 10.527456],
    Alianza: [122.969238, 10.516775],
    Atipuluan: [122.973444, 10.506088],
    Bacong: [122.962773, 10.503245],
    Bagroy: [122.980745, 10.490189],
    Balingasag: [122.97685, 10.499741],
    Binubuhan: [122.964209, 10.497236],
    Busay: [122.959844, 10.491632],
    Calumangan: [122.937321, 10.486274],
    Caridad: [122.940823, 10.486633],
    Dulao: [122.958018, 10.490659],
    Ilijan: [122.97104, 10.498089],
    "Lag-asan": [122.951085, 10.511455],
    Mailum: [122.977706, 10.522196],
    "Ma-ao": [122.939712, 10.528344],
    Malingin: [122.931746, 10.536495],
    Napoles: [122.926812, 10.519978],
    Pacol: [122.92825, 10.505916],
    Poblacion: [122.960903, 10.507042],
    Sagasa: [122.954496, 10.518531],
    Tabunan: [122.973885, 10.506478],
    Taloc: [122.947307, 10.531319],
    Talon: [122.943887, 10.520805],
    Tinongan: [122.939491, 10.49741],
  };

  // Define the barangay details
  const barangayInfo = {
    Abuanan: {
      population: 1200,
      crops: ["Banana", "Rice"],
      iconUrl: "path/to/icon1.png", // Replace with actual icon path
    },
    Alianza: {
      population: 1100,
      crops: ["Sugarcane", "Corn"],
      iconUrl: "path/to/icon2.png", // Replace with actual icon path
    },
    Atipuluan: {
      population: 1000,
      crops: ["Banana", "Rice"],
      iconUrl: "path/to/icon3.png", // Replace with actual icon path
    },
    Bacong: {
      population: 950,
      crops: ["Rice", "Sugarcane"],
      iconUrl: "path/to/icon4.png", // Replace with actual icon path
    },
    Bagroy: {
      population: 900,
      crops: ["Corn", "Cassava"],
      iconUrl: "path/to/icon5.png", // Replace with actual icon path
    },
    Balingasag: {
      population: 1050,
      crops: ["Rice", "Banana"],
      iconUrl: "path/to/icon6.png", // Replace with actual icon path
    },
    Binubuhan: {
      population: 1150,
      crops: ["Sugarcane", "Corn"],
      iconUrl: "path/to/icon7.png", // Replace with actual icon path
    },
    Busay: {
      population: 800,
      crops: ["Rice", "Vegetables"],
      iconUrl: "path/to/icon8.png", // Replace with actual icon path
    },
    Calumangan: {
      population: 950,
      crops: ["Banana", "Sugarcane"],
      iconUrl: "path/to/icon9.png", // Replace with actual icon path
    },
    Caridad: {
      population: 1100,
      crops: ["Cassava", "Sugarcane"],
      iconUrl: "path/to/icon10.png", // Replace with actual icon path
    },
    Dulao: {
      population: 900,
      crops: ["Rice", "Banana"],
      iconUrl: "path/to/icon11.png", // Replace with actual icon path
    },
    Ilijan: {
      population: 1200,
      crops: ["Sugarcane", "Rice"],
      iconUrl: "path/to/icon12.png", // Replace with actual icon path
    },
    "Lag-asan": {
      population: 1050,
      crops: ["Banana", "Corn"],
      iconUrl: "path/to/icon13.png", // Replace with actual icon path
    },
    Mailum: {
      population: 980,
      crops: ["Cassava", "Sugarcane"],
      iconUrl: "path/to/icon14.png", // Replace with actual icon path
    },
    "Ma-ao": {
      population: 1100,
      crops: ["Rice", "Corn"],
      iconUrl: "path/to/icon15.png", // Replace with actual icon path
    },
    Malingin: {
      population: 1200,
      crops: ["Sugarcane", "Rice"],
      iconUrl: "path/to/icon16.png", // Replace with actual icon path
    },
    Napoles: {
      population: 950,
      crops: ["Corn", "Banana"],
      iconUrl: "path/to/icon17.png", // Replace with actual icon path
    },
    Pacol: {
      population: 980,
      crops: ["Rice", "Vegetables"],
      iconUrl: "path/to/icon18.png", // Replace with actual icon path
    },
    Poblacion: {
      population: 1300,
      crops: ["Rice", "Sugarcane"],
      iconUrl: "path/to/icon19.png", // Replace with actual icon path
    },
    Sagasa: {
      population: 1100,
      crops: ["Cassava", "Rice"],
      iconUrl: "path/to/icon20.png", // Replace with actual icon path
    },
    Tabunan: {
      population: 900,
      crops: ["Banana", "Cassava"],
      iconUrl: "path/to/icon21.png", // Replace with actual icon path
    },
    Taloc: {
      population: 1050,
      crops: ["Sugarcane", "Rice"],
      iconUrl: "path/to/icon22.png", // Replace with actual icon path
    },
    Talon: {
      population: 950,
      crops: ["Rice", "Banana"],
      iconUrl: "path/to/icon23.png", // Replace with actual icon path
    },
    Tinongan: {
      population: 1000,
      crops: ["Cassava", "Rice"],
      iconUrl: "path/to/icon24.png", // Replace with actual icon path
    },
  };
  

  const handleBarangayChange = (e) => {
    const barangay = e.target.value;
    setSelectedBarangay(barangay);
  
    if (barangayCoordinates[barangay]) {
      const coordinates = barangayCoordinates[barangay];
      zoomToBarangay(coordinates);
  
      // Check if barangay exists in barangayInfo, then set its details
      const details = barangayInfo[barangay] || {}; // Default to empty object if no details exist
      setBarangayDetails({
        name: barangay,
        coordinates: coordinates,
        population: details.population || "N/A", // Default to 'N/A' if population is not available
        crops: details.crops || [], // Default to an empty array if crops are not available
        iconUrl: details.iconUrl || "", // Default to empty string if no icon URL is available
      });
  
      onBarangaySelect({
        name: barangay,
        coordinates: coordinates,
      });
    }
  };
  

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-20 p-6 overflow-y-auto border-r border-gray-200">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <img src={AgriGISLogo} alt="AgriGIS Logo" className="h-[75px] object-contain" />
      </div>

      {/* Section Title */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Location Information</h2>

      {/* Region */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Region</label>
        <input
          type="text"
          value="Western Visayas"
          readOnly
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
        />
      </div>

      {/* Province */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Province</label>
        <input
          type="text"
          value="Negros Occidental"
          readOnly
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
        />
      </div>

      {/* Municipality */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Municipality</label>
        <input
          type="text"
          value="Bago City"
          readOnly
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
        />
      </div>

      {/* Barangay */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Barangay</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          value={selectedBarangay}
          onChange={handleBarangayChange}
        >
          <option value="">Select a barangay</option>
          {Object.keys(barangayCoordinates).map((brgy) => (
            <option key={brgy} value={brgy}>
              {brgy}
            </option>
          ))}
        </select>
      </div>

      {/* Display selected barangay details */}
      {barangayDetails && (
        <div className="mt-4">
          <h3 className="font-bold text-green-600">{barangayDetails.name}</h3>
          <p><strong>Population:</strong> {barangayDetails.population}</p>
          <p><strong>Crops:</strong> {barangayDetails.crops.join(", ")}</p>
          {barangayDetails.iconUrl && (
            <img src={barangayDetails.iconUrl} alt="Barangay Icon" className="mt-2 w-8 h-8" />
          )}
        </div>
      )}

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

      {/* Back to Home Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate("/")}
          className="w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default UserSideBar;
