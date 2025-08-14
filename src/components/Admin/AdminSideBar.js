import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";
import Button from "./MapControls/Button";
import clsx from 'clsx';
const AdminSideBar = ({ 
  visible,
  zoomToBarangay,
  onBarangaySelect,
  crops = [],
  selectedCrop,
  cropTypes = [],
  selectedCropType,
  setSelectedCropType,
  setEnlargedImage
}) => {

  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [barangayDetails, setBarangayDetails] = useState(null);
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  
  

  const navigate = useNavigate();

  const barangayCoordinates = {
    Abuanan: [122.9844, 10.5275],
    Alianza: [122.92424927088227, 10.471876805354725],
    Atipuluan: [122.94997254227323, 10.51054338526979],
    Bacong: [123.03026270744279, 10.520037893339277],
    Bagroy: [122.87467558102158, 10.47702885963125],
    Balingasag: [122.84330579876998, 10.528672212250575],
    Binubuhan: [122.98236293756698, 10.457428765280468],
    Busay: [122.8936085581886, 10.536447801424544],
    Calumangan: [122.8857773056537, 10.55943773159997],
    Caridad: [122.89676017560787, 10.484855427956782],
    Dulao: [122.94775786836688, 10.549767917490168],
    Ilijan: [123.04567999131407, 10.44537414453059],
    "Lag-asan": [122.84543167453091, 10.519843756585255],
   Mailum: [123.05148249170527, 10.469013722796765],
    "Ma-ao": [123.018102985426, 10.508962844307234],
    Malingin: [122.92533490443519, 10.51102316577104],
    Napoles: [122.86024955431672, 10.510195807139885],
    Pacol: [122.86326134780008, 10.48966963268301],
    Poblacion: [122.83378471878187, 10.535871883140523],
   Sagasa: [122.89592554988106, 10.465232192594353],
   Tabunan: [122.93868999567334, 10.570304584775227],
    Taloc: [122.9100707275183, 10.57850192116514],
  };

  const barangayInfo = {
    Abuanan: { crops: ["Banana", "Rice"] },
  Alianza: { crops: ["Sugarcane", "Corn"] },
  Atipuluan: { crops: ["Banana", "Rice"] },
  Bacong: { crops: ["Rice", "Sugarcane"] },
  Bagroy: { crops: ["Corn", "Cassava"] },
  Balingasag: { crops: ["Rice", "Banana"] },
  Binubuhan: { crops: ["Sugarcane", "Corn"] },
  Busay: { crops: ["Rice", "Vegetables"] },
  Calumangan: { crops: ["Banana", "Sugarcane"] },
  Caridad: { crops: ["Cassava", "Sugarcane"] },
  Dulao: { crops: ["Rice", "Banana"] },
  Ilijan: { crops: ["Sugarcane", "Rice"] },
  "Lag-asan": { crops: ["Banana", "Corn"] },
  Mailum: { crops: ["Cassava", "Sugarcane"] },
  "Ma-ao": { crops: ["Rice", "Corn"] },
  Malingin: { crops: ["Sugarcane", "Rice"] },
  Napoles: { crops: ["Corn", "Banana"] },
  Pacol: { crops: ["Rice", "Vegetables"] },
  Poblacion: { crops: ["Rice", "Sugarcane"] },
  Sagasa: { crops: ["Cassava", "Rice"] },
  Tabunan: { crops: ["Banana", "Cassava"] },
  Taloc: { crops: ["Sugarcane", "Rice"] },
  Talon: { crops: ["Rice", "Banana"] },
  Tinongan: { crops: ["Cassava", "Rice"] },
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
        crops: details.crops || [],
      });

      onBarangaySelect({ name: barangay, coordinates });
    }
  };

  return (
    <div
  className={clsx(
    'absolute top-0 left-0 h-full bg-white shadow-xl z-20 overflow-y-auto border-r border-gray-200',
    visible
      ? 'w-[500px] px-6 py-8'
      : 'w-0 px-0 py-0 overflow-hidden'
  )}
>

    <div className="mb-6 w-full flex justify-center items-center">
        {selectedCrop?.photos ? (
          <img
            src={`http://localhost:5000${JSON.parse(selectedCrop.photos)[0]}`}
            alt="Selected Crop"
            className="w-full h-full object-cover rounded-md border cursor-pointer"
            onClick={() =>
              setEnlargedImage(`http://localhost:5000${JSON.parse(selectedCrop.photos)[0]}`)
            }
          />
        ) : (
          <img
            src={AgriGISLogo}
            alt="AgriGIS Logo"
            className="w-[200px] h-[70px] ml-5 object-contain transition duration-500 ease-in-out"
          />
        )}
</div>

      <h2 className="text-xl font-medium text-gray-800 mb-6 border-b pb-3"> Crop Information</h2>

      {[{ label: "Region", value: "Western Visayas" },
        { label: "Province", value: "Negros Occidental" },
        { label: "Municipality", value: "Bago City" }].map((item) => (
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

      {/* Crop Type Filter */}
      <div className="mb-4">
        <label className="block text-sm font-base text-gray-700 mb-1">Filter Crop</label>
        <select
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          value={selectedCropType}
          onChange={(e) => setSelectedCropType(e.target.value)}
        >
          <option value="All">All</option>
          {cropTypes.map((type) => (
            <option key={type.id} value={type.name}>{type.name}</option>
          ))}
        </select>
      </div>

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

      {barangayDetails && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <h3 className="text-green-700 font-semibold text-lg">{barangayDetails.name}</h3>
          <p className="text-sm text-gray-800">
            <strong>Crops:</strong> {barangayDetails.crops.join(", ")}
          </p>
        </div>
      )}
{selectedCrop && (
  <div className="mt-6">
    <h4 className="text-lg font-semibold text-green-700 mb-4">
      {selectedCrop.crop_name || "Unnamed Crop"}
    </h4>

    {/* Variety and Barangay */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <p className="text-sm text-gray-700">
        <strong>Variety:</strong> {selectedCrop.variety_name || "N/A"}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Barangay:</strong> {selectedCrop.barangay || "N/A"}
      </p>
    </div>

    {/* Dates */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <p className="text-sm text-gray-700">
        <strong>Planted Date:</strong> {selectedCrop.planted_date?.split("T")[0] || "N/A"}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Est. Harvest:</strong> {selectedCrop.estimated_harvest?.split("T")[0] || "N/A"}
      </p>
    </div>

    {/* Volume and Hectares */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <p className="text-sm text-gray-700">
        <strong>Volume:</strong> {selectedCrop.estimated_volume || "N/A"}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Hectares:</strong> {selectedCrop.estimated_hectares || "N/A"}
      </p>
    </div>

    {/* Notes */}
    <p className="text-sm text-gray-700 italic mt-2">
      {selectedCrop.note || "No note provided."}
    </p>
  </div>
)}


      {/* Photos of selected crop */}
      {selectedCrop && selectedCrop.photos && (
        <div className="mt-6">
          <h4 className="text-sm font-base text-gray-700 mb-2">
            Photos of: {selectedCrop.crop_name || "Unnamed Crop"}
          </h4>
          <div className="grid grid-cols-2 gap-2">
           {JSON.parse(selectedCrop.photos).map((url, i) => (
  <img
    key={i}
    src={`http://localhost:5000${url}`}
    alt={`Crop photo ${i + 1}`}
    className="w-full h-24 object-cover rounded-md border cursor-pointer"
    onClick={() => setEnlargedImage(`http://localhost:5000${url}`)}
  />
))}

          </div>
        </div>
      )}

      {/* Photos by Barangay */}
      {barangayDetails && crops.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Photos from {barangayDetails.name}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {crops
  .filter((crop) => crop.barangay?.toLowerCase() === barangayDetails.name.toLowerCase())
  .flatMap((crop, idx) => {
    const photoArray = crop.photos ? JSON.parse(crop.photos) : [];
    return photoArray.map((url, i) => (
      <img
        key={`${idx}-${i}`}
        src={`http://localhost:5000${url}`}
        alt={`Crop ${idx}`}
        className="w-full h-24 object-cover rounded-md border cursor-pointer"
        onClick={() => setEnlargedImage(`http://localhost:5000${url}`)}
      />
    ));
  })}

          </div>
        </div>
      )}

      {/* Legend as Dropdown */}
<div className="mt-6">
  <button
    onClick={() => setShowCropDropdown(!showCropDropdown)}
    className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-base text-gray-700 hover:bg-gray-50"
  >
    Legend
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
    <ul className="mt-2 space-y-1 text-sm">
      {Object.entries({
        Rice: "#facc15",
        Corn: "#fb923c",
        Banana: "#a3e635",
        Sugarcane: "#34d399",
        Cassava: "#60a5fa",
        Vegetables: "#f472b6",
      }).map(([label, color]) => (
        <li key={label} className="flex items-center">
          <span
            className="inline-block w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: color }}
          ></span>
          {label}
        </li>
      ))}
    </ul>
  )}
</div>


    <div className="mt-5">
      <Button to="/AdminLanding" label="Home" /></div>


    </div>
  );
};

export default AdminSideBar;
