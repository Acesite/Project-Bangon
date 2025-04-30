import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";
import Button from "./MapControls/Button";

const AdminSideBar = ({ zoomToBarangay, onBarangaySelect }) => {
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [barangayDetails, setBarangayDetails] = useState(null);
  const [showCropDropdown, setShowCropDropdown] = useState(false);

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

  const barangayInfo = {
    Abuanan: { population: 1200, crops: ["Banana", "Rice"], iconUrl: "" },
    Alianza: { population: 1100, crops: ["Sugarcane", "Corn"], iconUrl: "" },
    Atipuluan: { population: 1000, crops: ["Banana", "Rice"], iconUrl: "" },
    Bacong: { population: 950, crops: ["Rice", "Sugarcane"], iconUrl: "" },
    Bagroy: { population: 900, crops: ["Corn", "Cassava"], iconUrl: "" },
    Balingasag: { population: 1050, crops: ["Rice", "Banana"], iconUrl: "" },
    Binubuhan: { population: 1150, crops: ["Sugarcane", "Corn"], iconUrl: "" },
    Busay: { population: 800, crops: ["Rice", "Vegetables"], iconUrl: "" },
    Calumangan: { population: 950, crops: ["Banana", "Sugarcane"], iconUrl: "" },
    Caridad: { population: 1100, crops: ["Cassava", "Sugarcane"], iconUrl: "" },
    Dulao: { population: 900, crops: ["Rice", "Banana"], iconUrl: "" },
    Ilijan: { population: 1200, crops: ["Sugarcane", "Rice"], iconUrl: "" },
    "Lag-asan": { population: 1050, crops: ["Banana", "Corn"], iconUrl: "" },
    Mailum: { population: 980, crops: ["Cassava", "Sugarcane"], iconUrl: "" },
    "Ma-ao": { population: 1100, crops: ["Rice", "Corn"], iconUrl: "" },
    Malingin: { population: 1200, crops: ["Sugarcane", "Rice"], iconUrl: "" },
    Napoles: { population: 950, crops: ["Corn", "Banana"], iconUrl: "" },
    Pacol: { population: 980, crops: ["Rice", "Vegetables"], iconUrl: "" },
    Poblacion: { population: 1300, crops: ["Rice", "Sugarcane"], iconUrl: "" },
    Sagasa: { population: 1100, crops: ["Cassava", "Rice"], iconUrl: "" },
    Tabunan: { population: 900, crops: ["Banana", "Cassava"], iconUrl: "" },
    Taloc: { population: 1050, crops: ["Sugarcane", "Rice"], iconUrl: "" },
    Talon: { population: 950, crops: ["Rice", "Banana"], iconUrl: "" },
    Tinongan: { population: 1000, crops: ["Cassava", "Rice"], iconUrl: "" },
  };

  const handleBarangayChange = (e) => {
    const barangay = e.target.value;
    setSelectedBarangay(barangay);

    if (barangayCoordinates[barangay]) {
      const coordinates = barangayCoordinates[barangay];
      zoomToBarangay(coordinates);

      const details = barangayInfo[barangay] || {};
      setBarangayDetails({
        name: barangay,
        coordinates,
        population: details.population || "N/A",
        crops: details.crops || [],
      });

      onBarangaySelect({ name: barangay, coordinates });
    }
  };

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-xl z-20 px-6 py-8 overflow-y-auto border-r border-gray-200 transition-all duration-300">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <img src={AgriGISLogo} alt="AgriGIS Logo" className="h-[60px] object-contain" />
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3"> Location Info</h2>

      {/* Static Info Fields */}
      {[
        { label: "Region", value: "Western Visayas" },
        { label: "Province", value: "Negros Occidental" },
        { label: "Municipality", value: "Bago City" },
      ].map((item) => (
        <div className="mb-4" key={item.label}>
          <label className="block text-sm text-gray-600 mb-1">{item.label}</label>
          <input
            type="text"
            readOnly
            value={item.value}
            className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
          />
        </div>
      ))}

      {/* Barangay Dropdown */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Barangay</label>
        <select
          value={selectedBarangay}
          onChange={handleBarangayChange}
          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select a barangay</option>
          {Object.keys(barangayCoordinates).map((brgy) => (
            <option key={brgy} value={brgy}>
              {brgy}
            </option>
          ))}
        </select>
      </div>

      {/* Barangay Details */}
      {barangayDetails && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <h3 className="text-green-700 font-semibold text-lg">{barangayDetails.name}</h3>
          <p className="text-sm text-gray-800">
            <strong>Population:</strong> {barangayDetails.population}
          </p>
          <p className="text-sm text-gray-800">
            <strong>Crops:</strong> {barangayDetails.crops.join(", ")}
          </p>
        </div>
      )}

      {/* Crop Suitability Dropdown */}
      <div className="mt-6 mb-4">
        <button
          onClick={() => setShowCropDropdown(!showCropDropdown)}
          className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Crop Suitability
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              showCropDropdown ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCropDropdown && (
          <div className="mt-2 pl-2 space-y-2">
            {["Banana", "Cassava", "Corn", "Sugarcane", "Rice", "Vegetables"].map((crop) => (
              <div key={crop} className="flex items-center text-sm text-gray-700">
                <input type="checkbox" id={crop} className="mr-2 accent-green-600" />
                <label htmlFor={crop}>{crop}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Home Button */}
      <Button to="/AdminLanding" label="Home" />
    </div>
  );
};

export default AdminSideBar;
