// components/CalamitySidebar.jsx
import React, { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";
import Button from "./MapControls/Button";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const fmt = (v) => (v ?? v === 0 ? v : "—");
const fmtHa = (v) => (v || v === 0 ? Number(v).toFixed(2) + " ha" : "—");

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

// Fixed list used by the Calamity Type filter
const CALAMITY_FILTERS = [
  "Flood",
  "Earthquake",
  "Typhoon",
  "Landslide",
  "Drought",
  "Wildfire",
  "Pest",
];

// Legend colors
const CALAMITY_COLORS = {
  Flood: "#3b82f6",
  Earthquake: "#ef4444",
  Typhoon: "#8b5cf6",
  Landslide: "#f59e0b",
  Drought: "#f97316",
  Wildfire: "#dc2626",
  Pest: "#16a34a",
};

// Barangay -> coords
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

// Status badge classes
const statusBadge = (status) => {
  const map = {
    Pending: "bg-yellow-200 text-yellow-800",
    Verified: "bg-green-200 text-green-800",
    Resolved: "bg-blue-200 text-blue-800",
    Rejected: "bg-red-200 text-red-800",
  };
  return map[status] || "bg-gray-200 text-gray-800";
};

// Severity badge classes (includes “Severe”)
const severityBadge = (severity) => {
  const map = {
    Low: "bg-emerald-200 text-emerald-800",
    Moderate: "bg-amber-200 text-amber-800",
    High: "bg-red-200 text-red-800",
    Severe: "bg-red-300 text-red-900",
  };
  return map[severity] || "bg-gray-200 text-gray-800";
};

// Optional: a list for status filtering
const STATUS_FILTERS = ["Pending", "Verified", "Resolved", "Rejected"];

const CalamitySidebar = ({
  visible,
  setEnlargedImage,

  zoomToBarangay,
  onBarangaySelect,

  calamityTypes = [],
  selectedCalamityType = "All",
  setSelectedCalamityType = () => {},

  calamities = [],
  selectedCalamity = null,

  selectedBarangay: selectedBarangayProp = "",
}) => {
  const [selectedBarangay, setSelectedBarangay] = useState(selectedBarangayProp || "");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [cropMap, setCropMap] = useState({});
  const [ecosystemMap, setEcosystemMap] = useState({});
  const [varietyMap, setVarietyMap] = useState({});

  // lookups
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const [ecoRes, cropRes] = await Promise.all([
          fetch("http://localhost:5000/api/calamities/ecosystems"),
          fetch("http://localhost:5000/api/calamities/crops"),
        ]);
        const ecoData = (await ecoRes.json()) || [];
        const cropData = (await cropRes.json()) || [];
        if (abort) return;
        const cm = {};
        cropData.forEach((c) => (cm[String(c.id)] = c.name));
        setCropMap(cm);
        const em = {};
        ecoData.forEach((e) => (em[String(e.id)] = e.name));
        setEcosystemMap(em);
      } catch {}
    })();
    return () => {
      abort = true;
    };
  }, []);

  // varieties for selected calamity
  useEffect(() => {
    let abort = false;
    const cropTypeId = selectedCalamity?.crop_type_id;
    if (!cropTypeId) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/calamities/crops/${cropTypeId}/varieties`);
        const data = (await res.json()) || [];
        if (abort) return;
        const vm = {};
        data.forEach((v) => (vm[String(v.id)] = v.name));
        setVarietyMap(vm);
      } catch {}
    })();
    return () => {
      abort = true;
    };
  }, [selectedCalamity?.crop_type_id]);

  // sync preselected barangay
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
      onBarangaySelect?.({ name: brgy, coordinates });
    }
  };

  // filter list by type + barangay + status
  const filteredCalamities = useMemo(() => {
    const byType =
      selectedCalamityType === "All"
        ? calamities
        : calamities.filter((c) => c.calamity_type === selectedCalamityType);

    const byBarangay = selectedBarangay
      ? byType.filter((c) => (c.location || "").toLowerCase() === selectedBarangay.toLowerCase())
      : byType;

    const byStatus =
      selectedStatus === "All"
        ? byBarangay
        : byBarangay.filter((c) => (c.status || "Pending") === selectedStatus);

    return byStatus;
  }, [calamities, selectedCalamityType, selectedBarangay, selectedStatus]);

  // Build full list of photo URLs (multi-photo support + robust fallback)
  const photoUrls = useMemo(() => {
    if (!selectedCalamity) return [];

    const base = "http://localhost:5000";
    const urls = new Set();

    const pushUrl = (raw) => {
      if (!raw) return;
      let p = String(raw).trim();
      if (!p) return;

      // accept csv like "a.jpg, b.jpg"
      if (p.includes(",") && !p.startsWith("[") && !p.startsWith("{")) {
        p.split(",").forEach((part) => pushUrl(part));
        return;
      }

      // if it's JSON array inside a string, parse
      if ((p.startsWith("[") && p.endsWith("]")) || (p.startsWith('"') && p.endsWith('"'))) {
        try {
          const parsed = JSON.parse(p);
          if (Array.isArray(parsed)) {
            parsed.forEach((x) => pushUrl(x));
            return;
          }
        } catch {
          /* ignore and continue as a single path */
        }
      }

      // normalize leading slashes and make absolute
      if (!/^https?:\/\//i.test(p)) {
        p = p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
      }

      urls.add(p);
    };

    if (Array.isArray(selectedCalamity.photos)) {
      selectedCalamity.photos.forEach(pushUrl);
    } else if (selectedCalamity.photos) {
      pushUrl(selectedCalamity.photos);
    }

    if (urls.size === 0 && selectedCalamity.photo) {
      pushUrl(selectedCalamity.photo);
    }

    return Array.from(urls);
  }, [selectedCalamity]);

  const heroImg = photoUrls.length > 0 ? photoUrls[0] : null;

  const cropName = (id) => (id ? cropMap[String(id)] || `#${id}` : "—");
  const ecoName = (id) => (id ? ecosystemMap[String(id)] || `#${id}` : "—");
  const varietyName = (id) => (id ? varietyMap[String(id)] || `#${id}` : "—");

  // Admin full name helper (supports backend + localStorage fallback)
  const adminFullName = useMemo(() => {
    const sc = selectedCalamity || {};

    if (sc.admin_full_name && String(sc.admin_full_name).trim())
      return sc.admin_full_name;

    if (sc.admin_name && String(sc.admin_name).trim()) return sc.admin_name;
    const first = sc.admin_first_name || sc.first_name;
    const last = sc.admin_last_name || sc.last_name;
    if ((first || last) && String(first || last).trim()) {
      return [first, last].filter(Boolean).join(" ").trim();
    }

    if (typeof window !== "undefined") {
      const lsAdminFull = localStorage.getItem("admin_full_name");
      const lsFull = localStorage.getItem("full_name");
      const lsFirst = localStorage.getItem("first_name");
      const lsLast = localStorage.getItem("last_name");

      if (lsAdminFull && lsAdminFull.trim()) return lsAdminFull.trim();
      if (lsFull && lsFull.trim()) return lsFull.trim();
      const joined = [lsFirst, lsLast].filter(Boolean).join(" ").trim();
      if (joined) return joined;
    }

    return sc.admin_id ? `Admin #${sc.admin_id}` : "—";
  }, [selectedCalamity]);

  // Robust severity value (handles severity_level or legacy severity)
  const severityValue = useMemo(() => {
    const raw = selectedCalamity?.severity_level ?? selectedCalamity?.severity ?? null;
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    const cap = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    if (["Low", "Moderate", "High", "Severe"].includes(cap)) return cap;
    return s;
  }, [selectedCalamity]);

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

        {/* Location */}
        <Section title="Location">
          <dl className="grid grid-cols-3 gap-3">
            <KV label="Region" value="Western Visayas" />
            <KV label="Province" value="Negros Occidental" />
            <KV label="Municipality" value="Bago City" />
          </dl>
        </Section>

        {/* Filters */}
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
                {CALAMITY_FILTERS.map((t) => (
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

            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="All">All</option>
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Details */}
        {selectedCalamity && (
          <Section title="Report details">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCalamity.location && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {selectedCalamity.location}
                </span>
              )}

              {selectedCalamity.status && (
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border",
                    statusBadge(selectedCalamity.status).replace("text-", "border-")
                  )}
                >
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      statusBadge(selectedCalamity.status).split(" ")[0]
                    )}
                  />
                  <span className={statusBadge(selectedCalamity.status).split(" ")[1]}>
                    {selectedCalamity.status}
                  </span>
                </span>
              )}

              {severityValue && (
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border",
                    severityBadge(severityValue).replace("text-", "border-")
                  )}
                  title="Severity"
                >
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      severityBadge(severityValue).split(" ")[0]
                    )}
                  />
                  <span className={severityBadge(severityValue).split(" ")[1]}>
                    {severityValue}
                  </span>
                </span>
              )}

              {selectedCalamity.affected_area && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {fmtHa(selectedCalamity.affected_area)}
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <KV label="Calamity Type" value={fmt(selectedCalamity.calamity_type)} />
              <KV label="Crop Stage" value={fmt(selectedCalamity.crop_stage)} />
              <KV label="Crop Type" value={fmt(cropName(selectedCalamity.crop_type_id))} />
              <KV label="Ecosystem" value={fmt(ecoName(selectedCalamity.ecosystem_id))} />
              <KV label="Variety" value={fmt(varietyName(selectedCalamity.crop_variety_id))} />
              <KV label="Affected Area" value={fmtHa(selectedCalamity.affected_area)} />
              <KV
            label="Severity"
            value={
              (() => {
                const raw =
                  (selectedCalamity?.severity_level ?? "").toString().trim() ||
                  (selectedCalamity?.severity ?? "").toString().trim();
                if (!raw) return "—";
                const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
                return cap; // Low / Moderate / High / Severe
              })()
            }
          />
              <KV label="Location (Barangay)" value={fmt(selectedCalamity.location)} />
              <KV label="Reported By" value={fmt(adminFullName)} />
              <KV
                label="Reported"
                value={fmtDate(selectedCalamity.date_reported || selectedCalamity.created_at)}
              />
              <div className="col-span-2">
                <span
                  className={clsx(
                    "inline-block px-2 py-1 rounded-full text-xs font-medium",
                    statusBadge(selectedCalamity.status || "Pending")
                  )}
                >
                  {selectedCalamity.status || "Pending"}
                </span>
              </div>
            </dl>

            <div className="mt-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Description</div>
              <p className="text-sm text-gray-900 mt-1">
                {selectedCalamity.description?.trim() || "—"}
              </p>
            </div>

            {photoUrls.length > 0 && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Photos</div>
                <div className="grid grid-cols-3 gap-2">
                  {photoUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="group relative block overflow-hidden rounded-md border border-gray-200 bg-gray-50 aspect-square"
                      onClick={() => setEnlargedImage?.(url)}
                      title={`View photo ${idx + 1}`}
                    >
                      <img
                        src={url}
                        alt={`${selectedCalamity.calamity_type || "Calamity"} ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

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

        <div className="mt-5">
          <Button to="/AdminLanding" label="Home" />
        </div>
      </div>
    </div>
  );
};

export default CalamitySidebar;
