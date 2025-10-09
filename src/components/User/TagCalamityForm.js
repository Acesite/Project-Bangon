import React, { useState, useEffect } from "react";

const TagCalamityForm = ({ defaultLocation, selectedBarangay, onCancel, onSave, setNewTagLocation }) => {
  const [calamityType, setCalamityType] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [ecosystemId, setEcosystemId] = useState("");
  const [cropTypeId, setCropTypeId] = useState("");
  const [varietyId, setVarietyId] = useState("");
  const [affectedArea, setAffectedArea] = useState("");
  const [cropStage, setCropStage] = useState("");

  // State for dropdown data
  const [ecosystems, setEcosystems] = useState([]);
  const [allEcosystems, setAllEcosystems] = useState([]); // Store all ecosystems
  const [crops, setCrops] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [loadingVarieties, setLoadingVarieties] = useState(false);

  // Fetch ecosystems and crops from backend
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch ecosystems
        const ecosystemRes = await fetch("http://localhost:5000/api/calamities/ecosystems");
        const ecosystemData = await ecosystemRes.json();
        console.log("Ecosystems data:", ecosystemData);
        const ecosystemArray = Array.isArray(ecosystemData) ? ecosystemData : [];
        setAllEcosystems(ecosystemArray); // Store all ecosystems
        setEcosystems(ecosystemArray); // Initially show all

        // Fetch crops
        const cropRes = await fetch("http://localhost:5000/api/calamities/crops");
        const cropData = await cropRes.json();
        console.log("Crops data:", cropData);
        setCrops(Array.isArray(cropData) ? cropData : []);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        setAllEcosystems([]);
        setEcosystems([]);
        setCrops([]);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch varieties when crop type changes
  useEffect(() => {
    const fetchVarieties = async () => {
      if (!cropTypeId) {
        setVarieties([]);
        setVarietyId("");
        // Reset ecosystems to show all when no crop is selected
        setEcosystems(allEcosystems);
        setEcosystemId("");
        return;
      }

      // Filter ecosystems based on selected crop type
      const filteredEcosystems = allEcosystems.filter(
        (eco) => eco.crop_type_id === parseInt(cropTypeId)
      );
      setEcosystems(filteredEcosystems);
      
      // Reset ecosystem selection if current selection is not in filtered list
      if (ecosystemId && !filteredEcosystems.find(eco => eco.id === parseInt(ecosystemId))) {
        setEcosystemId("");
      }

      setLoadingVarieties(true);
      try {
        const response = await fetch(`http://localhost:5000/api/calamities/crops/${cropTypeId}/varieties`);
        const data = await response.json();
        console.log("Varieties data:", data);
        setVarieties(Array.isArray(data) ? data : []);
        setVarietyId(""); // Reset variety selection when crop changes
      } catch (error) {
        console.error("Failed to fetch varieties:", error);
        setVarieties([]);
      } finally {
        setLoadingVarieties(false);
      }
    };

    fetchVarieties();
  }, [cropTypeId, allEcosystems]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const role = localStorage.getItem("role");
    const adminId = Number(localStorage.getItem("admin_id") || localStorage.getItem("user_id"));

    if (!adminId) {
      alert("No admin_id found. Please log in as an admin.");
      return;
    }

    if (!defaultLocation?.coordinates) {
      alert("Coordinates not found!");
      return;
    }

    const formData = new FormData();
    formData.append("calamity_type", calamityType);
    formData.append("description", description);
    formData.append("location", selectedBarangay || "Unknown");
    formData.append("coordinates", JSON.stringify(defaultLocation.coordinates));
    formData.append("admin_id", String(adminId));
    
    // Send ecosystem_id, crop_type_id, and crop_variety_id (as foreign keys)
    formData.append("ecosystem_id", ecosystemId);
    formData.append("crop_type_id", cropTypeId);
    formData.append("crop_variety_id", varietyId);
    formData.append("affected_area", affectedArea || defaultLocation?.hectares || "0");
    formData.append("crop_stage", cropStage);

    if (photo) formData.append("photo", photo);

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Report Calamity</h2>
            <p className="text-sm text-gray-500 mt-1">Fill out the form below to report a calamity incident</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Calamity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Calamity Type <span className="text-red-500">*</span>
              </label>
              <select
                value={calamityType}
                onChange={(e) => setCalamityType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select calamity type</option>
                <option value="Flood">Flood</option>
                <option value="Drought">Drought</option>
                <option value="Pest">Pest</option>
                <option value="Typhoon">Typhoon</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Landslide">Landslide</option>
                <option value="Wildfire">Wildfire</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide details about the calamity"
                required
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Crop Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={cropTypeId}
                  onChange={(e) => setCropTypeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select crop type</option>
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ecosystem Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ecosystem Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={ecosystemId}
                  onChange={(e) => setEcosystemId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!cropTypeId}
                >
                  <option value="">
                    {!cropTypeId ? "Select crop type first" : "Select ecosystem"}
                  </option>
                  {ecosystems.map((eco) => (
                    <option key={eco.id} value={eco.id}>
                      {eco.name}
                    </option>
                  ))}
                </select>
                {!cropTypeId && (
                  <p className="mt-1 text-xs text-gray-500">Please select a crop type first</p>
                )}
              </div>

              {/* Crop Variety - Only shows when crop type is selected */}
              {cropTypeId && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Crop Variety <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={varietyId}
                    onChange={(e) => setVarietyId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loadingVarieties}
                  >
                    <option value="">
                      {loadingVarieties ? "Loading varieties..." : "Select crop variety"}
                    </option>
                    {varieties.map((variety) => (
                      <option key={variety.id} value={variety.id}>
                        {variety.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Affected Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Affected Area (ha) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={affectedArea || defaultLocation?.hectares || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAffectedArea(value);
                    const floatValue = parseFloat(value);
                    if (!isNaN(floatValue)) {
                      setNewTagLocation((prevState) => ({
                        ...prevState,
                        hectares: floatValue,
                      }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Crop Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Crop Development Stage <span className="text-red-500">*</span>
                </label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select stage</option>
                  <option value="Planted">Planted</option>
                  <option value="Ripening">Ripening</option>
                  <option value="Harvested">Harvested</option>
                </select>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TagCalamityForm;