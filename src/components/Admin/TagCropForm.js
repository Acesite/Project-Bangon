import React, { useEffect, useRef, useState, useMemo } from "react";
import { SaveIcon, ArrowRight, ArrowLeft } from "lucide-react";

const STANDARD_MATURITY_DAYS = {
  1: 100, 2: 110, 3: 360, 4: 365, 5: 300, 6: 60,
};

const yieldUnitMap = {
  1: "sacks", 2: "sacks", 3: "bunches", 4: "tons", 5: "tons", 6: "kg",
};

const yieldPerHectare = {
  1: 80, 2: 85.4, 3: 150, 4: 80, 5: 70, 6: 100,
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
  return d.toISOString().slice(0, 10);
}

const TagCropForm = ({
  onCancel,
  onSave,
  defaultLocation,
  selectedBarangay,
  adminId,
}) => {
  const formRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [hectares, setHectares] = useState("");
  const [cropTypes, setCropTypes] = useState([]);
  const [selectedCropType, setSelectedCropType] = useState("");
  const [dynamicVarieties, setDynamicVarieties] = useState([]);
  const [selectedVarietyId, setSelectedVarietyId] = useState("");
  const [manualBarangay, setManualBarangay] = useState("");
  const [plantedDate, setPlantedDate] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState(null);

  const [estimatedHarvest, setEstimatedHarvest] = useState("");
  const [harvestTouched, setHarvestTouched] = useState(false);
  const [estimatedVolume, setEstimatedVolume] = useState("");
  const [volumeTouched, setVolumeTouched] = useState(false);

  const [farmerFirstName, setFarmerFirstName] = useState("");
  const [farmerLastName, setFarmerLastName] = useState("");
  const [farmerMobile, setFarmerMobile] = useState("");
  const [farmerBarangay, setFarmerBarangay] = useState("");
  const [farmerAddress, setFarmerAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  useEffect(() => {
    if (!harvestTouched) setEstimatedHarvest(autoHarvestCandidate || "");
  }, [autoHarvestCandidate, harvestTouched]);

  useEffect(() => {
    if (!volumeTouched) setEstimatedVolume(autoVolumeCandidate || "");
  }, [autoVolumeCandidate, volumeTouched]);

  useEffect(() => {
    fetch("http://localhost:5000/api/crops/types")
      .then((res) => res.json())
      .then((data) => setCropTypes(data))
      .catch((err) => console.error("Failed to load crop types:", err));
  }, []);

  useEffect(() => {
    if (defaultLocation?.hectares) setHectares(defaultLocation.hectares);
  }, [defaultLocation]);

  useEffect(() => {
    if (selectedBarangay) setManualBarangay(selectedBarangay);
  }, [selectedBarangay]);

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

  const isStep1Valid = () => {
    return selectedCropType && plantedDate && hectares && manualBarangay;
  };

  const isStep2Valid = () => {
    return farmerFirstName && farmerLastName && farmerMobile && farmerBarangay && farmerAddress;
  };

  const handleShowConfirmation = () => {
    if (isStep2Valid()) {
      setShowConfirmation(true);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(false);
    
    const formData = new FormData();

    formData.append("crop_type_id", selectedCropType);
    formData.append("variety_id", selectedVarietyId || "");
    formData.append("plantedDate", plantedDate || "");
    formData.append("estimatedHarvest", estimatedHarvest || "");
    formData.append("estimatedVolume", estimatedVolume || "");
    formData.append("estimatedHectares", hectares || "");
    formData.append("note", note || "");
    formData.append("coordinates", JSON.stringify(defaultLocation?.coordinates || []));
    formData.append("barangay", manualBarangay || selectedBarangay || "");
    if (adminId) formData.append("admin_id", String(adminId));

    formData.append("farmer_first_name", farmerFirstName || "");
    formData.append("farmer_last_name", farmerLastName || "");
    formData.append("farmer_mobile", farmerMobile || "");
    formData.append("farmer_barangay", farmerBarangay || "");
    formData.append("farmer_address", farmerAddress || "");

    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        formData.append("photos", photos[i]);
      }
    }

    await onSave(formData);

    setCurrentStep(1);
    setHectares("");
    setSelectedCropType("");
    setSelectedVarietyId("");
    setPlantedDate("");
    setManualBarangay(selectedBarangay || "");
    setEstimatedHarvest("");
    setHarvestTouched(false);
    setEstimatedVolume("");
    setVolumeTouched(false);
    setNote("");
    setPhotos(null);
    setFarmerFirstName("");
    setFarmerLastName("");
    setFarmerMobile("");
    setFarmerBarangay("");
    setFarmerAddress("");
  };

  const getCropTypeName = () => {
    const crop = cropTypes.find(c => c.id === selectedCropType);
    return crop ? crop.name : "—";
  };

  const getVarietyName = () => {
    const variety = dynamicVarieties.find(v => v.id === parseInt(selectedVarietyId));
    return variety ? variety.name : "—";
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Simplified Header */}
        <div className="px-8 pt-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Tag Crop
          </h2>
          
          {/* Simple Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentStep === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 1 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
              }`}>
                1
              </div>
              <span className="font-medium text-sm">Crop Details</span>
            </div>
            
            <div className="w-8 h-0.5 bg-gray-200"></div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentStep === 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 2 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
              }`}>
                2
              </div>
              <span className="font-medium text-sm">Farmer Info</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {currentStep === 1 ? "Enter basic crop information" : "Enter farmer details"}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          <form onSubmit={handleSubmit} ref={formRef}>
            
            {/* Step 1: Crop Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Crop Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Crop Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedCropType}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      setSelectedCropType(Number.isFinite(id) ? id : "");
                      setSelectedVarietyId("");
                    }}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                  >
                    <option value="">Select Crop Type</option>
                    {cropTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                {/* Variety */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Variety</label>
                  <select
                    value={selectedVarietyId}
                    onChange={(e) => setSelectedVarietyId(e.target.value)}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                  >
                    <option value="">Select Variety (Optional)</option>
                    {dynamicVarieties.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Planted Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date Planted <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={plantedDate}
                      onChange={(e) => setPlantedDate(e.target.value)}
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                    />
                  </div>

                  {/* Estimated Harvest */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Est. Harvest</label>
                    <input
                      type="date"
                      value={estimatedHarvest}
                      onChange={(e) => {
                        setHarvestTouched(true);
                        setEstimatedHarvest(e.target.value);
                      }}
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Area */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Area (ha) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={hectares}
                      onChange={(e) => setHectares(e.target.value)}
                      placeholder="0.00"
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                    />
                  </div>

                  {/* Estimated Yield */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Est. Yield {yieldUnitMap[selectedCropType] ? `(${yieldUnitMap[selectedCropType]})` : ""}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={estimatedVolume}
                      onChange={(e) => {
                        setVolumeTouched(true);
                        setEstimatedVolume(e.target.value);
                      }}
                      placeholder="Auto-calculated"
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                    />
                  </div>
                </div>

                {/* Barangay */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={manualBarangay}
                    onChange={(e) => setManualBarangay(e.target.value)}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                  >
                    <option value="">Select Barangay</option>
                    {barangayList.map((bgy) => (
                      <option key={bgy} value={bgy}>{bgy}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any observations or notes..."
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPhotos(e.target.files)}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-white text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG/PNG/WebP up to 10MB each</p>
                </div>
              </div>
            )}

            {/* Step 2: Farmer Information */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={farmerFirstName}
                      onChange={(e) => setFarmerFirstName(e.target.value)}
                      placeholder="Juan"
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={farmerLastName}
                      onChange={(e) => setFarmerLastName(e.target.value)}
                      placeholder="Dela Cruz"
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerMobile}
                    onChange={(e) => setFarmerMobile(e.target.value)}
                    placeholder="09123456789"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                  />
                </div>

                {/* Farmer's Barangay */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={farmerBarangay}
                    onChange={(e) => setFarmerBarangay(e.target.value)}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                  >
                    <option value="">Select Barangay</option>
                    {barangayList.map((bgy) => (
                      <option key={bgy} value={bgy}>{bgy}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerAddress}
                    onChange={(e) => setFarmerAddress(e.target.value)}
                    placeholder="House No., Street, Purok/Sitio"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition text-base"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Simplified Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              )}
              
              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  Next <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleShowConfirmation}
                  disabled={!isStep2Valid()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  <SaveIcon size={18} /> Save 
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Review Details</h3>
              <p className="text-sm text-gray-500 mt-1">Please verify before saving</p>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Crop Section */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Crop Information</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Crop</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{getCropTypeName()}</span>
                  </div>
                  {selectedVarietyId && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Variety</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{getVarietyName()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Planted</span>
                    <span className="text-sm font-semibold text-gray-900">{new Date(plantedDate).toLocaleDateString()}</span>
                  </div>
                  {estimatedHarvest && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Harvest</span>
                      <span className="text-sm font-semibold text-gray-900">{new Date(estimatedHarvest).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Area</span>
                    <span className="text-sm font-semibold text-gray-900">{hectares} ha</span>
                  </div>
                  {estimatedVolume && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Yield</span>
                      <span className="text-sm font-semibold text-gray-900">{estimatedVolume} {yieldUnitMap[selectedCropType]}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-semibold text-gray-900">{manualBarangay}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Farmer Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Farmer Information</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{farmerFirstName} {farmerLastName}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Mobile</span>
                    <span className="text-sm font-semibold text-gray-900">{farmerMobile}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Barangay</span>
                    <span className="text-sm font-semibold text-gray-900">{farmerBarangay}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Address</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%] leading-snug">{farmerAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TagCropForm;