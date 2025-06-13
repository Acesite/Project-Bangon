import React, { useEffect, useRef, useState } from "react";
import { SaveIcon } from "lucide-react";

const TagCropForm = ({ onCancel, onSave, defaultLocation, selectedBarangay }) => {
  const formRef = useRef(null);
  const [hectares, setHectares] = useState("");
  const [cropTypes, setCropTypes] = useState([]);
  const [selectedCropType, setSelectedCropType] = useState("");
  const [dynamicVarieties, setDynamicVarieties] = useState([]);
  const [selectedVarietyId, setSelectedVarietyId] = useState("");
  const [autoVolume, setAutoVolume] = useState("");
const [manualBarangay, setManualBarangay] = useState("");

const barangayList = [
  "Abuanan", "Alianza", "Atipuluan", "Bacong", "Bagroy", "Balingasag",
  "Binubuhan", "Busay", "Calumangan", "Caridad", "Dulao", "Ilijan",
  "Lag-asan", "Mailum", "Ma-ao", "Malingin", "Napoles", "Pacol",
  "Poblacion", "Sagasa", "Tabunan", "Taloc"
];


  useEffect(() => {
    fetch("http://localhost:5000/api/crops/types")
      .then((res) => res.json())
      .then((data) => setCropTypes(data))
      .catch((err) => console.error("Failed to load crop types:", err));
  }, []);

  useEffect(() => {
    if (defaultLocation?.hectares) {
      setHectares(defaultLocation.hectares);
    }
  }, [defaultLocation]);

  useEffect(() => {
    if (!selectedCropType) {
      setDynamicVarieties([]);
      return;
    }
    fetch(`http://localhost:5000/api/crops/varieties/${selectedCropType}`)
      .then((res) => res.json())
      .then((data) => setDynamicVarieties(data))
      .catch((err) => console.error("Failed to load varieties:", err));
  }, [selectedCropType]);

  useEffect(() => {
  if (selectedBarangay) {
    setManualBarangay(selectedBarangay);
  }
}, [selectedBarangay]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();

    formData.append("crop_type_id", selectedCropType);
    formData.append("variety_id", selectedVarietyId || null);
    formData.append("plantedDate", form.plantedDate.value);
    formData.append("estimatedHarvest", form.estimatedHarvest.value);
    formData.append("estimatedVolume", form.estimatedVolume.value);
    formData.append("estimatedHectares", hectares);
    formData.append("note", form.note.value);
    formData.append("coordinates", JSON.stringify(defaultLocation.coordinates));
    formData.append("barangay", manualBarangay || selectedBarangay || "");


    const files = form.photos.files;
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }

    await onSave(formData);
    form.reset();
    setHectares("");
    setSelectedVarietyId("");
  };

  const yieldUnitMap = {
    1: "sacks",       // Corn
    2: "sacks",       // Rice
    3: "bunches",     // Banana
    4: "tons",        // Sugarcane
    5: "tons",        // Cassava
    6: "kg"           // Vegetables
  };

  const yieldPerHectare = {
    2: 70,   
    1: 80,   
    3: 150,
    4: 80,
    5: 70,
    6: 100,
  };
  
  
  useEffect(() => {
    if (!selectedCropType || !hectares) return;
    const yieldEstimate = yieldPerHectare[selectedCropType];
    if (yieldEstimate) {
      const autoVolume = (yieldEstimate * hectares).toFixed(2);
      setAutoVolume(autoVolume);
    }
  }, [selectedCropType, hectares]);
  
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-2">
          Tag Crop at Location
        </h2>

        <form onSubmit={handleSubmit} ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Crop Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <select
              name="crop_type_id"
              required
              value={selectedCropType}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                setSelectedCropType(selectedId);
                setSelectedVarietyId("");
                console.log("selectedCropType", selectedId); // 👈 ✅ Add this here
              }}
              
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Crop Type</option>
              {cropTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* DB Variety Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Variety</label>
            <select
              name="variety_id"
              value={selectedVarietyId}
              onChange={(e) => setSelectedVarietyId(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Crop Variety</option>
              {dynamicVarieties.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Planted Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Planted</label>
            <input
              type="date"
              name="plantedDate"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Estimated Harvest */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Harvest Date</label>
            <input
              type="date"
              name="estimatedHarvest"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

         
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Estimated Yield ({yieldUnitMap[selectedCropType] || "units"})
  </label>
  <input
  name="estimatedVolume"
  type="number"
  min="0"
  step="0.1"
  required
  value={autoVolume}
  readOnly
  className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 text-gray-600"
/>


</div>


          {/* Hectares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area Size (hectares)</label>
            <input
              name="estimatedHectares"
              type="number"
              value={hectares}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
            />
          </div>

         <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
  <select
    name="barangay"
    required
    value={manualBarangay}
    onChange={(e) => setManualBarangay(e.target.value)}
    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select Barangay</option>
    {barangayList.map((bgy) => (
      <option key={bgy} value={bgy}>{bgy}</option>
    ))}
  </select>
</div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Observations</label>
            <textarea
              name="note"
              rows="3"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg resize-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Upload Photos */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Crop Photos</label>
            <input
              name="photos"
              type="file"
              multiple
              accept="image/*"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <SaveIcon size={16} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagCropForm;
