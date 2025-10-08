// components/CalamitySidebar.jsx
import React, { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";
import Button from "./MapControls/Button";


const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const fmt = (v) => (v ?? v === 0 ? v : "—");

const Section = ({ title, children }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
    {title && <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>}
    {children}
  </div>
);

const KV = ({ label, value }) => (
  <div className="flex flex-col">
    <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900 break-words">{value}</dd>
  </div>
);

// Colors for legend / quick badges
const CALAMITY_COLORS = {
  Flood: "#3b82f6",
  Earthquake: "#ef4444",
  Typhoon: "#8b5cf6",
  Landslide: "#f59e0b",
  Drought: "#f97316",
  Wildfire: "#dc2626",
  Pest: "#16a34a",
};

// Barangay dictionary (copied from your AdminSideBar for consistency)
const BARANGAY_COORDS = {
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

const statusBadge = (status) => {
  const map = {
    Pending: "bg-yellow-200 text-yellow-800",
    Verified: "bg-green-200 text-green-800",
    Resolved: "bg-blue-200 text-blue-800",
  };
  return map[status] || "bg-gray-200 text-gray-800";
};

const CalamitySidebar = ({
  // visibility & media
  visible,
  setEnlargedImage,

  // map hooks
  zoomToBarangay,
  onBarangaySelect,

  // filters (provided by parent)
  calamityTypes = [],                 // array of strings
  selectedCalamityType = "All",
  setSelectedCalamityType = () => {},

  // data
  calamities = [],                    // array of calamity rows
  selectedCalamity = null,            // currently selected calamity (optional)

  // optional pre-selected barangay from parent (string)
  selectedBarangay: selectedBarangayProp = "",
}) => {
  const [selectedBarangay, setSelectedBarangay] = useState(selectedBarangayProp || "");
  const [barangayDetails, setBarangayDetails] = useState(null);

  // keep internal barangay in sync if parent changes it
  useEffect(() => {
    if (selectedBarangayProp && selectedBarangayProp !== selectedBarangay) {
      setSelectedBarangay(selectedBarangayProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBarangayProp]);

  const handleBarangayChange = (e) => {
    const brgy = e.target.value;
    setSelectedBarangay(brgy);

    if (BARANGAY_COORDS[brgy]) {
      const coordinates = BARANGAY_COORDS[brgy];
      zoomToBarangay?.(coordinates);
      setBarangayDetails({
        name: brgy,
        coordinates,
        // you can hydrate crop list here if you want, kept minimal for calamities
      });
      onBarangaySelect?.({ name: brgy, coordinates });
    } else {
      setBarangayDetails(null);
    }
  };

  // Filter list by calamity type and barangay (if any)
  const filteredCalamities = useMemo(() => {
    const byType =
      selectedCalamityType === "All"
        ? calamities
        : calamities.filter((c) => c.calamity_type === selectedCalamityType);

    if (!selectedBarangay) return byType;

    return byType.filter((c) => {
      const loc = (c.location || "").toLowerCase();
      return loc === selectedBarangay.toLowerCase();
    });
  }, [calamities, selectedCalamityType, selectedBarangay]);

  // First image to show in hero (selected calamity if any)
  const heroImg = selectedCalamity?.photo
    ? `http://localhost:5000${selectedCalamity.photo}`
    : null;

  return (
    <div
      className={clsx(
        "absolute top-0 left-0 h-full bg-gray-50 z-20 overflow-y-auto border-r border-gray-200",
        visible ? "w-[500px]" : "w-0 overflow-hidden"
      )}
    >
      <div className={clsx("transition-all", visible ? "px-6 py-6" : "px-0 py-0")}>
        {/* Hero image / logo */}
        <div className="mb-4">
          <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 aspect-[16/9]">
            {heroImg ? (
              <img
                src={heroImg}
                alt="Calamity"
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => setEnlargedImage?.(heroImg)}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <img src={AgriGISLogo} alt="AgriGIS" className="h-12 opacity-70" />
              </div>
            )}
          </div>
        </div>

        {/* Location (static to match AdminSideBar UI) */}
        <Section title="Location">
          <dl className="grid grid-cols-3 gap-3">
            <KV label="Region" value="Western Visayas" />
            <KV label="Province" value="Negros Occidental" />
            <KV label="Municipality" value="Bago City" />
          </dl>
        </Section>

        {/* Filters (Calamity Type + Barangay) */}
        <Section title="Filters">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Calamity Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={selectedCalamityType}
                onChange={(e) => setSelectedCalamityType?.(e.target.value)}
              >
                <option value="All">All</option>
                {calamityTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Barangay
              </label>
              <select
                value={selectedBarangay}
                onChange={handleBarangayChange}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All</option>
                {Object.keys(BARANGAY_COORDS).map((brgy) => (
                  <option key={brgy} value={brgy}>
                    {brgy}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Details of the selected calamity */}
        {selectedCalamity && (
          <Section title={selectedCalamity.calamity_type || "Calamity"}>
            <dl className="grid grid-cols-2 gap-4">
              <KV label="Location" value={fmt(selectedCalamity.location)} />
              <KV label="Latitude" value={fmt(selectedCalamity.latitude)} />
              <KV label="Longitude" value={fmt(selectedCalamity.longitude)} />
              <KV label="Reported" value={fmtDate(selectedCalamity.date_reported || selectedCalamity.created_at)} />
              <KV label="Admin ID" value={fmt(selectedCalamity.admin_id)} />
            </dl>

            <div className="mt-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Description</div>
              <p className="text-sm text-gray-900 mt-1">
                {selectedCalamity.description?.trim() || "—"}
              </p>
            </div>

            {selectedCalamity.status && (
              <div className="mt-3">
                <span
                  className={clsx(
                    "inline-block px-2 py-1 rounded-full text-xs font-medium",
                    statusBadge(selectedCalamity.status)
                  )}
                >
                  {selectedCalamity.status}
                </span>
              </div>
            )}
          </Section>
        )}

        {/* Calamity list (filtered) */}
        <Section title="Calamity Reports">
          {filteredCalamities.length === 0 ? (
            <div className="text-sm text-gray-600">No calamity reports found.</div>
          ) : (
            <ul className="space-y-3">
              {filteredCalamities.map((c) => {
                const color = CALAMITY_COLORS[c.calamity_type] || "#ef4444";
                const thumb = c.photo ? `http://localhost:5000${c.photo}` : null;
                return (
                  <li key={c.calamity_id || c.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: color }}
                          title={c.calamity_type}
                        />
                        <span className="font-medium text-gray-900">{c.calamity_type}</span>
                      </div>
                      {c.status && (
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            statusBadge(c.status)
                          )}
                        >
                          {c.status}
                        </span>
                      )}
                    </div>

                    {thumb && (
                      <button
                        type="button"
                        className="mt-2 block overflow-hidden rounded-md border"
                        onClick={() => setEnlargedImage?.(thumb)}
                        title="View photo"
                      >
                        <img src={thumb} alt={c.calamity_type} className="h-28 w-full object-cover" />
                      </button>
                    )}

                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <KV label="Location" value={fmt(c.location)} />
                      <KV label="Reported" value={fmtDate(c.date_reported || c.created_at)} />
                      <KV label="Lat" value={fmt(c.latitude)} />
                      <KV label="Lng" value={fmt(c.longitude)} />
                    </div>

                    {c.description && (
                      <p className="mt-2 text-sm text-gray-800">{c.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Legend */}
        <Section title="Legend">
          <details className="text-sm">
            <summary className="cursor-pointer select-none text-gray-900">Show colors</summary>
            <ul className="mt-2 space-y-1">
              {Object.entries(CALAMITY_COLORS).map(([label, color]) => (
                <li key={label} className="flex items-center">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </details>
        </Section>

        {/* Home button (kept for parity) */}
        <div className="mt-5">
          <Button to="/AdminLanding" label="Home" />
        </div>
      </div>
    </div>
  );
};

export default CalamitySidebar;
