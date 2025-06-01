import React, { useEffect, useRef, useState } from "react";
import { XIcon, SaveIcon } from "lucide-react";

const TagCropForm = ({ onCancel, onSave, defaultLocation, selectedBarangay }) => {

  const formRef = useRef(null);
  const [hectares, setHectares] = useState("");
  const [cropTypes, setCropTypes] = useState([]);

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

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
  
    formData.append("crop_type_id", form.crop_type_id.value); 
    formData.append("variety", form.variety.value);
    formData.append("plantedDate", form.plantedDate.value);
    formData.append("estimatedHarvest", form.estimatedHarvest.value);
    formData.append("estimatedVolume", form.estimatedVolume.value);
    formData.append("estimatedHectares", hectares);
    formData.append("note", form.note.value);
    formData.append("coordinates", JSON.stringify(defaultLocation.coordinates));
    formData.append("barangay", selectedBarangay || "");
  
    const files = form.photos.files;
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }
  
    await onSave(formData);
    form.reset();
    setHectares("");
  };
  
  
  

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-2">
          📍 Tag Crop at Location
        </h2>
        <form onSubmit={handleSubmit} ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">🌾 Crop Type</label>
  <select
    name="crop_type_id"
    required
    defaultValue=""
    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
  >
    <option value="" disabled>Select Crop Type</option>
    {cropTypes.map((type) => (
      <option key={type.id} value={type.id}>{type.name}</option>
    ))}
  </select>
</div>





          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🌱 Crop Variety <span className="text-xs text-gray-400">(optional)</span></label>
            <input name="variety" className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date Planted</label>
            <input type="date" name="plantedDate" required className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🔜 Estimated Harvest Date</label>
            <input type="date" name="estimatedHarvest" required className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📦 Estimated Yield (sacks)</label>
            <input
              name="estimatedVolume"
              type="number"
              min="0"
              step="0.1"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📐 Area Size (hectares)</label>
            <input
              name="estimatedHectares"
              type="number"
              min="0"
              step="0.01"
              required
              readOnly
              value={hectares}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">📝 Notes / Observations</label>
            <textarea
              name="note"
              rows="3"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">📷 Upload Crop Photos</label>
  <input
    name="photos"
    type="file"
    multiple
    accept="image/*"
    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
  />
</div>


          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              <XIcon size={16} /> Cancel
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
