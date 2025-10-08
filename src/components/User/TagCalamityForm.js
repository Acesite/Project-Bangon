import React, { useState } from "react";

const TagCalamityForm = ({ defaultLocation, selectedBarangay, onCancel, onSave, setNewTagLocation }) => {
  const [calamityType, setCalamityType] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  
  // New fields
  const [ecosystemType, setEcosystemType] = useState("");
  const [cropType, setCropType] = useState("");
  const [farmersAffected, setFarmersAffected] = useState("");
  const [affectedArea, setAffectedArea] = useState("");
  const [cropStage, setCropStage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Resolve admin id from localStorage (set at login)
    const role = localStorage.getItem("role");
    const adminId =
      role === "admin" || role === "super_admin"
        ? Number(localStorage.getItem("admin_id") || localStorage.getItem("user_id"))
        : 0;

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
    formData.append("admin_id", String(adminId)); // ✅ backend expects this (NOT NULL)
    formData.append("hectares", String(defaultLocation.hectares ?? 0)); // optional

    // New data
    formData.append("ecosystem_type", ecosystemType);
    formData.append("crop_type", cropType);
    formData.append("farmers_affected", farmersAffected);
    formData.append("affected_area", affectedArea);
    formData.append("crop_stage", cropStage);

    if (photo) formData.append("photo", photo);

    onSave(formData);
  };

  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-6 w-[400px] z-50">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Report Calamity</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Calamity Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Calamity Type</label>
          <select
            value={calamityType}
            onChange={(e) => setCalamityType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">-- Select Type --</option>
            <option value="Flood">Flood</option>
            <option value="Drought">Drought</option>
            <option value="Pest">Pest</option>
            <option value="Typhoon">Typhoon</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Write details about the calamity..."
            required
          />
        </div>

        {/* Ecosystem Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Ecosystem Type</label>
          <select
            value={ecosystemType}
            onChange={(e) => setEcosystemType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">-- Select Ecosystem --</option>
            <option value="Irrigated">Irrigated</option>
            <option value="Rainfed">Rainfed</option>
            <option value="Non-Irrigated">Non-Irrigated</option>
          </select>
        </div>

        {/* Crop Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Crop Type</label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">-- Select Crop Type --</option>
            <option value="Rice">Rice</option>
            <option value="Corn">Corn</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruit Trees">Fruit Trees</option>
          </select>
        </div>

        {/* Number of Farmers Affected */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Number of Farmers Affected</label>
          <input
            type="number"
            value={farmersAffected}
            onChange={(e) => setFarmersAffected(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

            {/* Display the calculated hectares */}
       {/* Display the calculated hectares (editable) */}
<div>
  <label className="block text-sm font-medium text-gray-600">Affected Area (Hectares)</label>
  <input
    type="number" // Use number type for numeric input
    value={defaultLocation?.hectares || ""} // Default to calculated hectares, but allow editing
    onChange={(e) => {
      const value = parseFloat(e.target.value);
      // Only update if the value is a valid number
      if (!isNaN(value)) {
        // Update the value of hectares in the parent component or local state
        setNewTagLocation(prevState => ({
          ...prevState,
          hectares: value
        }));
      }
    }}
    className="w-full border rounded-lg px-3 py-2"
    placeholder="Enter affected area in hectares"
  />
</div>


        {/* Stage of Crop Development */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Stage of Crop Development</label>
          <select
            value={cropStage}
            onChange={(e) => setCropStage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">-- Select Stage --</option>
            <option value="Planted">Planted</option>
            <option value="Ripening">Ripening</option>
            <option value="Harvested">Harvested</option>
          </select>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TagCalamityForm;
