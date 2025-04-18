import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";

const UserSideBar = ({ zoomToBarangay, onBarangaySelect }) => {
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const navigate = useNavigate();

  const barangayCoordinates = {
    Abuanan: [122.984389, 10.527456],
    Alianza: [122.969238, 10.516775],
    Atipuluan: [122.973444, 10.506088],
    Bacong: [122.962773, 10.503245],
    Bagroy: [122.980745, 10.490189],
    Balingasag: [122.976850, 10.499741],
    Binubuhan: [122.964209, 10.497236],
    Busay: [122.959844, 10.491632],
    Calumangan: [122.937321, 10.486274],
    Caridad: [122.940823, 10.486633],
    Dulao: [122.958018, 10.490659],
    Ilijan: [122.971040, 10.498089],
    "Lag-asan": [122.951085, 10.511455],
    Mailum: [122.977706, 10.522196],
    "Ma-ao": [122.939712, 10.528344],
    Malingin: [122.931746, 10.536495],
    Napoles: [122.926812, 10.519978],
    Pacol: [122.928250, 10.505916],
    Poblacion: [122.960903, 10.507042],
    Sagasa: [122.954496, 10.518531],
    Tabunan: [122.973885, 10.506478],
    Taloc: [122.947307, 10.531319],
    Talon: [122.943887, 10.520805],
    Tinongan: [122.939491, 10.497410],
  };

  const handleBarangayChange = (e) => {
    const barangay = e.target.value;
    setSelectedBarangay(barangay);

    if (barangayCoordinates[barangay]) {
      const coordinates = barangayCoordinates[barangay];
      zoomToBarangay(coordinates);

      onBarangaySelect({
        name: barangay,
        coordinates: coordinates
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
