import React, { useEffect, useRef, useState, useMemo } from "react";
import { SaveIcon } from "lucide-react";

/**
 * Standard maturity (days to harvest) per crop_type_id
 * 1: Corn, 2: Rice, 3: Banana, 4: Sugarcane, 5: Cassava, 6: Vegetables
 */
const STANDARD_MATURITY_DAYS = {
  1: 100,  // Corn
  2: 110,  // Rice
  3: 360,  // Banana (first bunch)
  4: 365,  // Sugarcane
  5: 300,  // Cassava
  6: 60,   // Vegetables (generic)
};

const yieldUnitMap = {
  1: "sacks",     // Corn
  2: "sacks",     // Rice
  3: "bunches",   // Banana
  4: "tons",      // Sugarcane
  5: "tons",      // Cassava
  6: "kg",        // Vegetables
};

const yieldPerHectare = {
  1: 80,    // Corn
  2: 85.4,  // Rice
  3: 150,   // Banana
  4: 80,    // Sugarcane
  5: 70,    // Cassava
  6: 100,   // Vegetables
};

const barangayList = [
  "Abuanan","Alianza","Atipuluan","Bacong","Bagroy","Balingasag",
  "Binubuhan","Busay","Calumangan","Caridad","Dulao","Ilijan",
  "Lag-asan","Mailum","Ma-ao","Malingin","Napoles","Pacol",
  "Poblacion","Sagasa","Tabunan","Taloc"
];

function addDaysToISO(dateStr, days) {
  if (!dateStr || !days) return "";
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

const TagCropForm = ({
  onCancel,
  onSave,
  defaultLocation,
  selectedBarangay,
  adminId, // optional; if you pass this, we’ll include it in FormData
}) => {
  const formRef = useRef(null);

  const [hectares, setHectares] = useState("");
  const [cropTypes, setCropTypes] = useState([]);
  const [selectedCropType, setSelectedCropType] = useState("");
  const [dynamicVarieties, setDynamicVarieties] = useState([]);
  const [selectedVarietyId, setSelectedVarietyId] = useState("");
  const [manualBarangay, setManualBarangay] = useState("");
  const [plantedDate, setPlantedDate] = useState("");

  // NEW: editable (with auto-prefill) fields + "touched" guards
  const [estimatedHarvest, setEstimatedHarvest] = useState(""); // YYYY-MM-DD
  const [harvestTouched, setHarvestTouched] = useState(false);
  const [estimatedVolume, setEstimatedVolume] = useState("");   // number string
  const [volumeTouched, setVolumeTouched] = useState(false);

  // --- Auto candidates (won't override once touched) ---
  const autoHarvestCandidate = useMemo(() => {
    const days = STANDARD_MATURITY_DAYS[selectedCropType] || 0;
    return addDaysToISO(plantedDate, days);
  }, [plantedDate, selectedCropType]);

  const autoVolumeCandidate = useMemo(() => {
    const yph = yieldPerHectare[selectedCropType];
    const ha = Number(hectares);
    if (!yph || !Number.isFinite(ha) || ha <= 0) return "";
    return (yph * ha).toFixed(2);
  }, [selectedCropType, hectares]);

  // Prefill harvest unless user already edited
  useEffect(() => {
    if (!harvestTouched) setEstimatedHarvest(autoHarvestCandidate || "");
  }, [autoHarvestCandidate, harvestTouched]);

  // Prefill volume unless user already edited
  useEffect(() => {
    if (!volumeTouched) setEstimatedVolume(autoVolumeCandidate || "");
  }, [autoVolumeCandidate, volumeTouched]);

  // Load crop types
  useEffect(() => {
    fetch("http://localhost:5000/api/crops/types")
      .then((res) => res.json())
      .then((data) => setCropTypes(data))
      .catch((err) => console.error("Failed to load crop types:", err));
  }, []);

  // Default hectares & barangay from props
  useEffect(() => {
    if (defaultLocation?.hectares) setHectares(defaultLocation.hectares);
  }, [defaultLocation]);
  useEffect(() => {
    if (selectedBarangay) setManualBarangay(selectedBarangay);
  }, [selectedBarangay]);

  // Load varieties when crop type changes
  useEffect(() => {
    if (!selectedCropType) {
      setDynamicVarieties([]);
      setSelectedVarietyId("");
      return;
    }
    fetch(`http://localhost:5000/api/crops/varieties/${selectedCropType}`)
      .then((res) => res.json())
      .then((data) => setDynamicVarieties(data))
      .catch((err) => console.error("Failed to load varieties:", err));
  }, [selectedCropType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();

    formData.append("crop_type_id", selectedCropType);
    formData.append("variety_id", selectedVarietyId || "");
    formData.append("plantedDate", plantedDate || "");

    // use the editable values
    formData.append("estimatedHarvest", estimatedHarvest || "");
    formData.append("estimatedVolume", estimatedVolume || "");

    formData.append("estimatedHectares", hectares || "");
    formData.append("note", form.note.value || "");
    formData.append("coordinates", JSON.stringify(defaultLocation?.coordinates || []));
    formData.append("barangay", manualBarangay || selectedBarangay || "");
    if (adminId) formData.append("admin_id", String(adminId));

    // photos
    const files = form.photos.files;
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }

    await onSave(formData);

    // reset a few inputs (keep UX simple)
    form.reset();
    setHectares("");
    setSelectedVarietyId("");
    setPlantedDate("");
    setManualBarangay(selectedBarangay || "");
    setEstimatedHarvest("");
    setHarvestTouched(false);
    setEstimatedVolume("");
    setVolumeTouched(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Tag Crop
        </h2>
        <p className="text-xs text-gray-500 mb-6 text-center">
          Harvest date and yield auto-fill from crop maturity & area — you can edit them anytime.
        </p>

        <form onSubmit={handleSubmit} ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Crop Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <select
              name="crop_type_id"
              required
              value={selectedCropType}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                setSelectedCropType(Number.isFinite(id) ? id : "");
                setSelectedVarietyId("");
                // let auto recompute unless the user edited
                // (we don't change touched flags here)
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Crop Type</option>
              {cropTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Variety (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety (optional)</label>
            <select
              name="variety_id"
              value={selectedVarietyId}
              onChange={(e) => setSelectedVarietyId(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Variety</option>
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
              value={plantedDate}
              onChange={(e) => {
                setPlantedDate(e.target.value);
                // allow auto to refresh unless already touched
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Changing crop type or planted date will re-suggest values unless you’ve edited them.
            </p>
          </div>

          {/* Estimated Harvest (auto-filled, editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Harvest (editable)
            </label>
            <input
              type="date"
              name="estimatedHarvest"
              value={estimatedHarvest}
              onChange={(e) => {
                setHarvestTouched(true);
                setEstimatedHarvest(e.target.value);
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Area (ha) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area Size (hectares)</label>
            <input
              name="estimatedHectares"
              type="number"
              min="0"
              step="0.01"
              required
              value={hectares}
              onChange={(e) => {
                setHectares(e.target.value);
                // allow auto to refresh volume unless already touched
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Estimated Yield (auto-filled, editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Yield (editable) {yieldUnitMap[selectedCropType] ? `(${yieldUnitMap[selectedCropType]})` : ""}
            </label>
            <input
              name="estimatedVolume"
              type="number"
              min="0"
              step="0.1"
              value={estimatedVolume}
              onChange={(e) => {
                setVolumeTouched(true);
                setEstimatedVolume(e.target.value);
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">Auto = yield/ha × area. Your edits won’t be overwritten.</p>
          </div>

          {/* Barangay */}
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

          {/* Photos */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
            <input
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="w-full border border-gray-300 px-3 py-2 rounded-lg"
            />
            <p className="text-[11px] text-gray-500 mt-1">JPG/PNG/WebP up to 10MB each.</p>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
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
