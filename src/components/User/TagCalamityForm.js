// components/User/TagCalamityForm.js
import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

/* ---------- tiny UI bits ---------- */
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const ErrorText = ({ children, id }) => (
  <p id={id} className="mt-1 text-xs text-red-600">{children}</p>
);
const HelpText = ({ children, id }) => (
  <p id={id} className="mt-1 text-xs text-gray-500">{children}</p>
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

/* ---------- City → Barangay mapping (extend as you add more cities) ---------- */
const CITY_BARANGAYS = {
  "Bacolod City": [
    "Alangilan","Alijis","Banago","Bata","Cabug","Estefania","Felisa","Granada","Handumanan",
    "Mandalagan","Mansilingan","Montevista","Pahanocoy","Punta Taytay","Singcang-Airport","Sum-ag",
    "Taculing","Tangub","Villamonte","Vista Alegre","Barangay 1","Barangay 2","Barangay 3","Barangay 4",
    "Barangay 5","Barangay 6","Barangay 7","Barangay 8","Barangay 9","Barangay 10","Barangay 11",
    "Barangay 12","Barangay 13","Barangay 14","Barangay 15","Barangay 16","Barangay 17","Barangay 18",
    "Barangay 19","Barangay 20","Barangay 21","Barangay 22","Barangay 23","Barangay 24","Barangay 25",
    "Barangay 26","Barangay 27","Barangay 28","Barangay 29","Barangay 30","Barangay 31","Barangay 32",
    "Barangay 33","Barangay 34","Barangay 35","Barangay 36","Barangay 37","Barangay 38","Barangay 39",
    "Barangay 40","Barangay 41"
  ],
  // Add more cities here when you need them:
  // "Talisay City": ["Barangay A", "Barangay B"],
  // "Silay City": [...]
};

/**
 * Aligned to calamityController (tbl_incident).
 * Sends:
 * - calamity_type, description, barangay, city, status, severity_level
 * - coordinates (JSON stringified polygon ring)
 * - affected_area (ha), admin_id
 * - files => photos[] (mixed images/videos); controller splits by MIME
 */
const TagCalamityForm = ({
  defaultLocation,        // { coordinates: [[lng,lat],...], hectares?: number }
  selectedBarangay,
  onCancel,
  onSave,                 // (formData: FormData) => void (parent posts to /api/calamities)
  setNewTagLocation,
}) => {
  const [calamityType, setCalamityType]   = useState("");
  const [description, setDescription]     = useState("");
  const [city, setCity]                   = useState("");                // NEW: city state
  const [barangay, setBarangay]           = useState(selectedBarangay || "");
  const [status, setStatus]               = useState("Pending");
  const [severityLevel, setSeverityLevel] = useState("");
  const [affectedArea, setAffectedArea]   = useState("");

  const [files, setFiles]                 = useState([]); // mixed images/videos
  const [submitError, setSubmitError]     = useState("");
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // Derive barangay options based on city
  const barangayOptions = useMemo(() => {
    return city && CITY_BARANGAYS[city] ? CITY_BARANGAYS[city] : [];
  }, [city]);

  // If user picks a city, reset barangay if it’s not in that city
  useEffect(() => {
    if (!city) return;
    if (barangay && !barangayOptions.includes(barangay)) {
      setBarangay("");
    }
  }, [city, barangayOptions, barangay]);

  // optional: show first vertex lat/lng
  const coordStr = useMemo(() => {
    const c = defaultLocation?.coordinates;
    if (!Array.isArray(c) || c.length < 1) return "";
    const [lng, lat] = c[0];
    if (typeof lat !== "number" || typeof lng !== "number") return "";
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }, [defaultLocation]);

  // Prefill affected area from polygon hectares
  useEffect(() => {
    const ha = defaultLocation?.hectares;
    if (ha != null && !Number.isNaN(ha)) {
      const val = Number(ha).toFixed(2);
      setAffectedArea(val);
      setNewTagLocation?.((prev) => ({ ...(prev || {}), hectares: Number(val) }));
    }
  }, [defaultLocation?.hectares, setNewTagLocation]);

  // picker
  const onPickFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);

    // allow images + mp4/mov
    const MAX_MB = 50;
    const OK = new Set([
      "image/jpeg","image/png","image/webp","image/heic","image/heif",
      "video/mp4","video/quicktime"
    ]);

    for (const f of incoming) {
      if (!OK.has(f.type)) {
        setSubmitError(`Unsupported file type: ${f.type}`);
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setSubmitError(`File too large: ${f.name} (${(f.size/1024/1024).toFixed(1)}MB). Max ${MAX_MB}MB`);
        return;
      }
    }
    setSubmitError("");

    // merge without dup (name+size)
    setFiles((prev) => {
      const map = new Map(prev.map(p => [p.name + ":" + p.size, p]));
      incoming.forEach(f => map.set(f.name + ":" + f.size, f));
      return Array.from(map.values());
    });
  };

  const removeFileAt = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");

    const adminId = Number(localStorage.getItem("admin_id") || localStorage.getItem("user_id"));
    if (!adminId) {
      setSubmitError("No admin_id found. Please log in.");
      return;
    }
    if (!Array.isArray(defaultLocation?.coordinates) || defaultLocation.coordinates.length < 3) {
      setSubmitError("Polygon coordinates not found or invalid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("calamity_type", calamityType);
      formData.append("description", description.trim());
      formData.append("city", city || "");                                        // NEW: send city
      formData.append("barangay", barangay || selectedBarangay || "");
      formData.append("status", status);
      formData.append("severity_level", severityLevel);
      formData.append("coordinates", JSON.stringify(defaultLocation.coordinates));
      formData.append("affected_area", affectedArea || defaultLocation?.hectares || "0");
      formData.append("admin_id", String(adminId));

      // Send all in "photos" — controller will split by MIME into photos/videos columns
      files.forEach((file) => formData.append("photos", file));

      // If you prefer a dedicated video field too, add another input and:
      // videos.forEach((file) => formData.append("videos", file));

      onSave(formData);
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong preparing your submission.");
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    calamityType &&
    city &&                                   // NEW: require a city to be chosen
    (barangay || selectedBarangay) &&
    description.trim().length > 0 &&
    status &&
    severityLevel &&
    (affectedArea || defaultLocation?.hectares);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 sticky top-0 bg-white/80 backdrop-blur z-10">
            <h2 className="text-lg font-semibold text-gray-900">Report Calamity</h2>
            <p className="text-sm text-gray-500 mt-1">Provide clear details so responders can act quickly.</p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Context chips */}
            <div className="flex flex-wrap gap-2">
              {city && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  {city}
                </span>
              )}
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
              {defaultLocation?.hectares != null && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {Number(defaultLocation.hectares).toFixed(2)} ha (from polygon)
                </span>
              )}
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
                  <option value="Typhoon">Typhoon</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Fire">Fire</option>
                  <option value="Drought">Drought</option>
                  <option value="Volcanic">Volcanic</option>
                  <option value="Tsunami">Tsunami</option>
                  <option value="Other">Other</option>
                </select>
                <HelpText>Choose the category that best matches the event.</HelpText>
              </div>

              {/* NEW: City */}
              <div>
                <Label htmlFor="city" required>City / Municipality</Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select city</option>
                  {Object.keys(CITY_BARANGAYS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <HelpText>Select the city to load its barangays.</HelpText>
              </div>

              {/* Barangay becomes a dependent select */}
              <div className="sm:col-span-2">
                <Label htmlFor="barangay" required>Barangay</Label>
                <select
                  id="barangay"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  disabled={!city}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!city ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  required
                >
                  {!city ? (
                    <option value="">Select a city first</option>
                  ) : (
                    <>
                      <option value="">Select barangay</option>
                      {barangayOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </>
                  )}
                </select>
                <HelpText>Barangays are filtered based on the selected city.</HelpText>
              </div>

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
                  <option value="Severe">Severe</option>
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
                  <HelpText>Be specific (e.g., flood depth, wind damage, debris type).</HelpText>
                  <p className="text-xs text-gray-400">{description.length}/1000</p>
                </div>
              </div>
            </div>

            {/* Section: Area & Evidence */}
            <SectionTitle title="Area & evidence" subtitle="Estimate coverage and attach clear media if possible." />
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
                      setNewTagLocation?.((prev) => ({ ...(prev || {}), hectares: floatValue }));
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
                <Label htmlFor="files">Photos / Videos</Label>
                <input
                  id="files"
                  type="file"
                  accept="image/*,video/mp4,video/quicktime"
                  multiple
                  onChange={(e) => onPickFiles(e.target.files)}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                />
                <HelpText>Images (JPG/PNG/WEBP/HEIC) or Videos (MP4/MOV), up to 50MB each.</HelpText>

                {/* previews */}
                {files.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {files.map((f, idx) => {
                      const url = URL.createObjectURL(f);
                      const isVideo = String(f.type).startsWith("video/");
                      return (
                        <div key={idx} className="relative">
                          {isVideo ? (
                            <video src={url} className="h-20 w-full object-cover rounded-md border" muted controls />
                          ) : (
                            <img src={url} alt={f.name} className="h-20 w-full object-cover rounded-md border" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeFileAt(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                            title="Remove"
                          >
                            ×
                          </button>
                          <div className="mt-1 text-[11px] text-gray-600 truncate">{f.name}</div>
                        </div>
                      );
                    })}
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

/* ---------- prop types (non-breaking; documentation & dev safety) ---------- */
TagCalamityForm.propTypes = {
  defaultLocation: PropTypes.shape({
    coordinates: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
    ),
    hectares: PropTypes.number,
  }),
  selectedBarangay: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  setNewTagLocation: PropTypes.func,
};

ErrorText.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
HelpText.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
SectionTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
Label.propTypes = {
  children: PropTypes.node,
  required: PropTypes.bool,
  htmlFor: PropTypes.string,
};

export default TagCalamityForm;
