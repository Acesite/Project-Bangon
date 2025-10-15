// components/User/TagCalamityForm.js
import React, { useState, useEffect, useMemo } from "react";

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const ErrorText = ({ children, id }) => (
  <p id={id} className="mt-1 text-xs text-red-600">
    {children}
  </p>
);

const HelpText = ({ children, id }) => (
  <p id={id} className="mt-1 text-xs text-gray-500">
    {children}
  </p>
);

const SectionTitle = ({ title, subtitle }) => (
  <div className="pb-2">
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

const Label = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const TagCalamityForm = ({
  defaultLocation,
  selectedBarangay,
  onCancel,
  onSave,
  setNewTagLocation,
}) => {
  // form state
  const [calamityType, setCalamityType] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // multiple files
  const [ecosystemId, setEcosystemId] = useState("");
  const [cropTypeId, setCropTypeId] = useState("");
  const [varietyId, setVarietyId] = useState("");
  const [affectedArea, setAffectedArea] = useState("");
  const [cropStage, setCropStage] = useState("");
  const [barangay, setBarangay] = useState(selectedBarangay || "");
  const [status, setStatus] = useState("Pending"); // NEW
  const [severityLevel, setSeverityLevel] = useState(""); // NEW — Severity

  // dropdown data
  const [ecosystems, setEcosystems] = useState([]);
  const [allEcosystems, setAllEcosystems] = useState([]);
  const [crops, setCrops] = useState([]);
  const [varieties, setVarieties] = useState([]);

  // ui state
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingVarieties, setLoadingVarieties] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [varietyError, setVarietyError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // derived
  const coordStr = useMemo(() => {
    const c = defaultLocation?.coordinates;
    if (!c || !Array.isArray(c) || c.length < 2) return "";
    const [lng, lat] = c;
    return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }, [defaultLocation]);

  // Prefill affected area from drawn polygon hectares
  useEffect(() => {
    const ha = defaultLocation?.hectares;
    if (ha != null && !Number.isNaN(ha)) {
      const val = Number(ha).toFixed(2);
      setAffectedArea(val);
      setNewTagLocation?.((prev) => ({ ...(prev || {}), hectares: Number(val) }));
    }
  }, [defaultLocation?.hectares, setNewTagLocation]);

  // fetch ecosystems + crops
  useEffect(() => {
    let abort = false;
    const run = async () => {
      setLoadingMeta(true);
      setFetchError("");
      try {
        const [ecosystemRes, cropRes] = await Promise.all([
          fetch("http://localhost:5000/api/calamities/ecosystems"),
          fetch("http://localhost:5000/api/calamities/crops"),
        ]);

        if (!ecosystemRes.ok || !cropRes.ok) {
          throw new Error("Network error while fetching dropdown data.");
        }

        const ecosystemData = await ecosystemRes.json();
        const cropData = await cropRes.json();

        if (abort) return;

        const ecosystemArray = Array.isArray(ecosystemData) ? ecosystemData : [];
        setAllEcosystems(ecosystemArray);
        setEcosystems(ecosystemArray);

        setCrops(Array.isArray(cropData) ? cropData : []);
      } catch (e) {
        if (!abort) {
          console.error(e);
          setFetchError("Unable to load dropdown data. Check your connection or try again.");
          setAllEcosystems([]);
          setEcosystems([]);
          setCrops([]);
        }
      } finally {
        if (!abort) setLoadingMeta(false);
      }
    };
    run();
    return () => {
      abort = true;
    };
  }, []);

  // fetch varieties on crop change and filter ecosystems
  useEffect(() => {
    let abort = false;

    const fetchVar = async () => {
      // reset variety + filter ecosystems
      setVarieties([]);
      setVarietyId("");
      setVarietyError("");

      if (!cropTypeId) {
        setEcosystems(allEcosystems);
        setEcosystemId("");
        return;
      }

      const filtered = allEcosystems.filter(
        (eco) => String(eco.crop_type_id) === String(cropTypeId)
      );
      setEcosystems(filtered);

      if (ecosystemId && !filtered.find((eco) => String(eco.id) === String(ecosystemId))) {
        setEcosystemId("");
      }

      setLoadingVarieties(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/calamities/crops/${cropTypeId}/varieties`
        );
        if (!res.ok) throw new Error("Network error while fetching varieties.");
        const data = await res.json();
        if (abort) return;
        setVarieties(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!abort) {
          console.error(e);
          setVarietyError("Unable to load varieties for the selected crop.");
          setVarieties([]);
        }
      } finally {
        if (!abort) setLoadingVarieties(false);
      }
    };

    fetchVar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropTypeId, allEcosystems]);

  // photo selection with basic checks (multiple)
  const onPickPhotos = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const maxMB = 5;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

    const invalid = files.find((f) => !validTypes.includes(f.type));
    if (invalid) {
      setSubmitError("Unsupported image type. Please upload JPG, PNG, WEBP, or HEIC.");
      return;
    }
    const tooBig = files.find((f) => f.size > maxMB * 1024 * 1024);
    if (tooBig) {
      setSubmitError(`One or more images are too large. Max size is ${maxMB} MB each.`);
      return;
    }

    setSubmitError("");
    // merge with existing photos, avoid duplicates by name+size
    setPhotos((prev) => {
      const map = new Map(prev.map((p) => [p.name + ":" + p.size, p]));
      files.forEach((f) => map.set(f.name + ":" + f.size, f));
      return Array.from(map.values());
    });
  };

  const removePhotoAt = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");

    const adminId = Number(localStorage.getItem("admin_id") || localStorage.getItem("user_id"));
    if (!adminId) {
      setSubmitError("No admin_id found. Please log in.");
      return;
    }
    if (!defaultLocation?.coordinates) {
      setSubmitError("Coordinates not found for this report.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("calamity_type", calamityType);
      formData.append("description", description.trim());
      formData.append("location", selectedBarangay || "Unknown");
      formData.append("barangay", barangay || selectedBarangay || "");
      formData.append("status", status); // existing
      formData.append("severity_level", severityLevel); // NEW
      formData.append("coordinates", JSON.stringify(defaultLocation.coordinates));
      formData.append("admin_id", String(adminId));
      formData.append("ecosystem_id", ecosystemId);
      formData.append("crop_type_id", cropTypeId);
      formData.append("crop_variety_id", varietyId);
      formData.append("affected_area", affectedArea || defaultLocation?.hectares || "0");
      formData.append("crop_stage", cropStage);

      photos.forEach((file) => formData.append("photos", file));

      onSave(formData);
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong preparing your submission.");
      setIsSubmitting(false);
    }
  };

  // disable submit until required fields are present
  const canSubmit =
    calamityType &&
    (barangay || selectedBarangay) &&
    description.trim().length > 0 &&
    cropTypeId &&
    ecosystemId &&
    cropStage &&
    status &&
    severityLevel && // NEW — require a choice
    (varieties.length === 0 || varietyId) &&
    (affectedArea || defaultLocation?.hectares);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 sticky top-0 bg-white/80 backdrop-blur z-10">
            <h2 className="text-lg font-semibold text-gray-900">Report Calamity</h2>
            <p className="text-sm text-gray-500 mt-1">
              Provide clear details so responders can act quickly.
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Context chips */}
            <div className="flex flex-wrap gap-2">
              {(barangay || selectedBarangay) && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {barangay || selectedBarangay}
                </span>
              )}
              {coordStr && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  {coordStr}
                </span>
              )}
              {defaultLocation?.hectares ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {Number(defaultLocation.hectares).toFixed(2)} ha (default)
                </span>
              ) : null}
            </div>

            {/* Section: Incident */}
            <SectionTitle title="Incident details" subtitle="Basic information about the calamity." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="calamity" required>Calamity Type</Label>
                <select
                  id="calamity"
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
                <HelpText id="calamity-help">Choose the category that best matches the event.</HelpText>
              </div>

              {/* Barangay */}
              <div>
                <Label htmlFor="barangay" required>Barangay</Label>
                <input
                  id="barangay"
                  type="text"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  placeholder="e.g., Brgy. San Isidro"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-describedby="brgy-help"
                />
                <HelpText id="brgy-help">Specify the barangay where the incident occurred.</HelpText>
              </div>

              {/* Crop Stage */}
              <div>
                <Label htmlFor="stage" required>Crop Development Stage</Label>
                <select
                  id="stage"
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select stage</option>
                  <option value="Planted">Planted</option>
                  <option value="Ripening">Ripening</option>
                  <option value="Harvested">Harvested</option>
                </select>
                <HelpText>Pick the current stage of the affected crop.</HelpText>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" required>Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <HelpText>Set by field officer during geotagging.</HelpText>
              </div>

              {/* Severity — NEW */}
              <div>
                <Label htmlFor="severity" required>Severity</Label>
                <select
                  id="severity"
                  value={severityLevel}
                  onChange={(e) => setSeverityLevel(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select severity</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
                <HelpText>How intense is the incident right now?</HelpText>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="desc" required>Description</Label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What happened? When did it start? Any visible damage or hazards?"
                  required
                />
                <div className="flex justify-between">
                  <HelpText>Be concise and specific (e.g., depth of floodwater, wind damage, pest symptoms).</HelpText>
                  <p className="text-xs text-gray-400">{description.length}/1000</p>
                </div>
              </div>
            </div>

            {/* Section: Crop & Ecosystem */}
            <SectionTitle title="Crop & ecosystem" subtitle="These fields tailor recommendations and analysis." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="crop" required>Crop Type</Label>
                <div className="relative">
                  <select
                    id="crop"
                    value={cropTypeId}
                    onChange={(e) => setCropTypeId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    required
                    disabled={loadingMeta}
                  >
                    <option value="">{loadingMeta ? "Loading crop types..." : "Select crop type"}</option>
                    {!loadingMeta && crops.length === 0 && (
                      <option value="" disabled>No crop types found</option>
                    )}
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                  {loadingMeta && (
                    <div className="absolute right-3 top-2.5 text-gray-400">
                      <Spinner />
                    </div>
                  )}
                </div>
                {fetchError ? <ErrorText>{fetchError}</ErrorText> : <HelpText>Select the primary crop affected.</HelpText>}
              </div>

              <div>
                <Label htmlFor="ecosystem" required>Ecosystem Type</Label>
                <select
                  id="ecosystem"
                  value={ecosystemId}
                  onChange={(e) => setEcosystemId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  required
                  disabled={!cropTypeId || loadingMeta}
                >
                  <option value="">
                    {!cropTypeId ? "Select crop type first" : "Select ecosystem"}
                  </option>
                  {ecosystems.length === 0 && cropTypeId ? (
                    <option value="" disabled>No ecosystem matches for this crop</option>
                  ) : (
                    ecosystems.map((eco) => (
                      <option key={eco.id} value={eco.id}>
                        {eco.name}
                      </option>
                    ))
                  )}
                </select>
                {!cropTypeId ? (
                  <HelpText>Please select a crop type first.</HelpText>
                ) : (
                  <HelpText>Filtered to ecosystems applicable to the selected crop.</HelpText>
                )}
              </div>

              {/* Varieties */}
              {cropTypeId && (
                <div className="sm:col-span-2">
                  <Label htmlFor="variety" required>Crop Variety</Label>
                  <div className="relative">
                    <select
                      id="variety"
                      value={varietyId}
                      onChange={(e) => setVarietyId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      required
                      disabled={loadingVarieties}
                    >
                      <option value="">
                        {loadingVarieties ? "Loading varieties..." : "Select crop variety"}
                      </option>
                      {!loadingVarieties && varieties.length === 0 && (
                        <option value="" disabled>No varieties found</option>
                      )}
                      {varieties.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    {loadingVarieties && (
                      <div className="absolute right-3 top-2.5 text-gray-400">
                        <Spinner />
                      </div>
                    )}
                  </div>
                  {varietyError ? <ErrorText>{varietyError}</ErrorText> : <HelpText>Choose the specific variety if available.</HelpText>}
                </div>
              )}
            </div>

            {/* Section: Area & Photo */}
            <SectionTitle title="Area & evidence" subtitle="Estimate coverage and attach a clear photo if possible." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="area" required>Affected Area (ha)</Label>
                <input
                  id="area"
                  type="number"
                  min="0"
                  step="0.01"
                  value={affectedArea ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAffectedArea(value);
                    const floatValue = parseFloat(value);
                    if (!isNaN(floatValue)) {
                      setNewTagLocation?.((prev) => ({
                        ...prev,
                        hectares: floatValue,
                      }));
                    }
                  }}
                  placeholder={
                    defaultLocation?.hectares != null
                      ? Number(defaultLocation.hectares).toFixed(2)
                      : "0.00"
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-describedby="area-help"
                />
                <HelpText id="area-help">If unsure, provide your best estimate. You can refine later.</HelpText>
              </div>

              <div>
                <Label htmlFor="photos">Photos</Label>
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onPickPhotos(e.target.files)}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                />
                <HelpText>JPG/PNG/WEBP/HEIC up to 5MB each. You can select multiple.</HelpText>

                {/* previews */}
                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {photos.map((f, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          className="h-20 w-full object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhotoAt(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                          title="Remove"
                        >
                          ×
                        </button>
                        <div className="mt-1 text-[11px] text-gray-600 truncate">{f.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* errors */}
            {submitError && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${!canSubmit || isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"}`}
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TagCalamityForm;
