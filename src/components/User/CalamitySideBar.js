// components/CalamitySidebar.jsx
import React, { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import AgriGISLogo from "../../components/MapboxImages/logo.png";

/* ----------------------- tiny utils ----------------------- */
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");
const fmt = (v) => (v ?? v === 0 ? v : "—");
const fmtHa = (v) => (v || v === 0 ? Number(v).toFixed(2) + " ha" : "—");

// defensively handle possibly-non-string barangay values
const safeLower = (v) =>
  typeof v === "string"
    ? v.toLowerCase()
    : String((v && v.name) || v || "").toLowerCase();

const brgyText = (v) =>
  typeof v === "string" ? v : (v && typeof v === "object" && v.name) ? String(v.name) : "";

/* ---------------------- UI primitives --------------------- */
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

/* ------------------------- filters ------------------------ */
const CALAMITY_FILTERS = [
  "Flood","Earthquake","Typhoon","Landslide","Drought","Wildfire","Fire","Volcanic","Tsunami","Other",
];

const CALAMITY_COLORS = {
  Flood: "#3b82f6",
  Earthquake: "#ef4444",
  Typhoon: "#8b5cf6",
  Landslide: "#f59e0b",
  Drought: "#f97316",
  Wildfire: "#dc2626",
  Fire: "#dc2626",
  Volcanic: "#6b7280",
  Tsunami: "#0ea5e9",
  Other: "#64748b",
};

// Bacolod barangays (name -> [lng, lat]) — from your list, converted to lng,lat
const BARANGAY_COORDS = {
  Alangilan: [123.096056, 10.661722],
Alijis: [122.952333, 10.634639],
  Banago: [122.9486, 10.6981],
  Bata: [122.972361, 10.702833],
  Cabug: [122.9814, 10.7236],
  Estefania: [122.9831, 10.6869],
  Felisa: [122.9919, 10.7050],
  Granada: [122.9750, 10.6436],
  Handumanan: [122.9669, 10.7014],
  Mandalagan: [122.97447, 10.68672],
  Mansilingan: [122.983583, 10.621444],
  Montevista: [122.9917, 10.7269],
  Pahanocoy: [122.9583, 10.6181],
  "Punta Taytay": [122.9333, 10.6886],
  "Singcang-Airport": [122.9417, 10.6417],
  "Sum-ag": [122.9333, 10.6681],
  Taculing: [122.957028, 10.651472],
  Tangub: [122.9333, 10.7000],
  Villamonte: [122.9583, 10.6931],
  "Vista Alegre": [122.9583, 10.7056],

  "Barangay 1": [122.9581, 10.6958],
  "Barangay 2": [122.9583, 10.6950],
  "Barangay 3": [122.9586, 10.6942],
  "Barangay 4": [122.9589, 10.6936],
  "Barangay 5": [122.9592, 10.6931],
  "Barangay 6": [122.9594, 10.6928],
  "Barangay 7": [122.9597, 10.6922],
  "Barangay 8": [122.9600, 10.6917],
  "Barangay 9": [122.9603, 10.6911],
  "Barangay 10": [122.9606, 10.6906],
  "Barangay 11": [122.9608, 10.6900],
  "Barangay 12": [122.945194, 10.671361],
  "Barangay 13": [122.9614, 10.6889],
  "Barangay 14": [122.9617, 10.6883],
  "Barangay 15": [122.9619, 10.6878],
  "Barangay 16": [122.9622, 10.6872],
  "Barangay 17": [122.9625, 10.6867],
  "Barangay 18": [122.9628, 10.6861],
  "Barangay 19": [122.9631, 10.6856],
  "Barangay 20": [122.9633, 10.6850],
  "Barangay 21": [122.9636, 10.6844],
  "Barangay 22": [122.9639, 10.6839],
  "Barangay 23": [122.9642, 10.6833],
  "Barangay 24": [122.9644, 10.6828],
  "Barangay 25": [122.9647, 10.6822],
  "Barangay 26": [122.9650, 10.6817],
  "Barangay 27": [122.958139, 10.664861],
  "Barangay 28": [122.9656, 10.6806],
  "Barangay 29": [122.9658, 10.6800],
  "Barangay 30": [122.9661, 10.6794],
  "Barangay 31": [122.9664, 10.6789],
  "Barangay 32": [122.9667, 10.6783],
  "Barangay 33": [122.9669, 10.6778],
  "Barangay 34": [122.9672, 10.6772],
  "Barangay 35": [122.9675, 10.6767],
  "Barangay 36": [122.9678, 10.6761],
  "Barangay 37": [122.9681, 10.6756],
  "Barangay 38": [122.9683, 10.6750],
  "Barangay 39": [122.9686, 10.6744],
  "Barangay 40": [122.9689, 10.6739],
  "Barangay 41": [122.9692, 10.6733],
};

const STATUS_FILTERS = ["Pending", "Verified", "Resolved", "Rejected"];
const SEVERITY_FILTERS = ["Low", "Moderate", "High", "Severe"];

const statusBadge = (status) => {
  const map = {
    Pending: "bg-yellow-200 text-yellow-800",
    Verified: "bg-green-200 text-green-800",
    Resolved: "bg-blue-200 text-blue-800",
    Rejected: "bg-red-200 text-red-800",
  };
  return map[status] || "bg-gray-200 text-gray-800";
};
const severityBadge = (severity) => {
  const map = {
    Low: "bg-emerald-200 text-emerald-800",
    Moderate: "bg-amber-200 text-amber-800",
    High: "bg-red-200 text-red-800",
    Severe: "bg-red-300 text-red-900",
  };
  return map[severity] || "bg-gray-200 text-gray-800";
};

/* ----------- normalize media to absolute URLs ----------- */
const normalizeMediaArray = (value, base = "http://localhost:5000") => {
  const urls = new Set();
  const pushUrl = (raw) => {
    if (!raw) return;
    let p = String(raw).trim();
    if (!p) return;

    if (p.includes(",") && !p.startsWith("[") && !p.startsWith("{")) {
      p.split(",").forEach((part) => pushUrl(part));
      return;
    }
    if (p.startsWith("[") && p.endsWith("]")) {
      try {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed)) {
          parsed.forEach((x) => pushUrl(x));
          return;
        }
      } catch {}
    }
    if (!/^https?:\/\//i.test(p)) {
      p = p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
    }
    urls.add(p);
  };

  Array.isArray(value) ? value.forEach(pushUrl) : pushUrl(value);
  return Array.from(urls);
};

/* ----------------------- main component ----------------------- */
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

  // Map style switcher props
  mapStyles = {},
  setMapStyle = () => {},
  showLayers = false,
  setShowLayers = () => {},
}) => {
  /* ----------------------- local state ----------------------- */
  const [selectedBarangay, setSelectedBarangay] = useState(brgyText(selectedBarangayProp) || "");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // New filters
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [dateFrom, setDateFrom] = useState(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState("");     // YYYY-MM-DD
  const [search, setSearch] = useState("");
  const [hasPhotos, setHasPhotos] = useState(false);
  const [hasVideos, setHasVideos] = useState(false);
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("Newest"); // Newest, Oldest, Severity, Area

  // sync preselected barangay from parent (normalize to string)
  useEffect(() => {
    const asText = brgyText(selectedBarangayProp);
    if (asText !== selectedBarangay) setSelectedBarangay(asText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBarangayProp]);

  const handleBarangayChange = (e) => {
    const brgy = e.target.value; // string from <select>
    setSelectedBarangay(brgy);
    if (BARANGAY_COORDS[brgy]) {
      const coordinates = BARANGAY_COORDS[brgy];
      zoomToBarangay?.(coordinates);
      onBarangaySelect?.({ name: brgy, coordinates });
    }
  };

  /* ------------------------- helpers ------------------------- */
  const toDateObj = (row) => {
    const d = row.date_reported || row.created_at;
    return d ? new Date(d) : null;
  };
  const areaValue = (row) => {
    const v = row.affected_area ?? row.area_ha ?? null;
    return v != null ? Number(v) : null;
  };
  const severityRank = (s) => {
    const order = { Low: 1, Moderate: 2, High: 3, Severe: 4 };
    return order[s] || 0;
  };

  /* ------------- calamity type options (stable) -------------- */
  const calamityTypeOptions = useMemo(() => {
    const fromProp = Array.isArray(calamityTypes) ? calamityTypes.filter(Boolean) : [];
    const base = fromProp.length ? fromProp : CALAMITY_FILTERS;
    const seen = new Set();
    return base.filter((t) => {
      const key = String(t);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [calamityTypes]);

  /* -------------------- filtering + sorting ------------------- */
  const filteredCalamities = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    let list =
      selectedCalamityType === "All"
        ? calamities
        : calamities.filter((c) => c.calamity_type === selectedCalamityType);

    const selectedBarangayKey = safeLower(selectedBarangay);
    if (selectedBarangayKey) {
      list = list.filter(
        (c) => safeLower(c.barangay || c.location) === selectedBarangayKey
      );
    }

    if (selectedStatus !== "All") {
      list = list.filter((c) => (c.status || "Pending") === selectedStatus);
    }

    if (selectedSeverity !== "All") {
      const getSev = (c) => {
        const raw = c.severity_level ?? c.severity ?? "";
        const s = String(raw).trim();
        const cap = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
        return cap;
      };
      list = list.filter((c) => getSev(c) === selectedSeverity);
    }

    if (from || to) {
      list = list.filter((c) => {
        const d = toDateObj(c);
        if (!d) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }

    if (hasPhotos) {
      list = list.filter((c) => {
        const photos = normalizeMediaArray(c.photos?.length ? c.photos : c.photo);
        return photos.length > 0;
      });
    }
    if (hasVideos) {
      list = list.filter((c) => {
        const videos = normalizeMediaArray(c.videos || []);
        return videos.length > 0;
      });
    }

    if (areaMin || areaMax) {
      const min = areaMin !== "" ? Number(areaMin) : null;
      const max = areaMax !== "" ? Number(areaMax) : null;
      list = list.filter((c) => {
        const a = areaValue(c);
        if (a == null) return false;
        if (min != null && a < min) return false;
        if (max != null && a > max) return false;
        return true;
      });
    }

    if (q) {
      list = list.filter((c) => {
        const hay = [
          c.calamity_type,
          c.barangay || c.location,
          c.city,
          c.description,
          c.status,
          c.severity_level || c.severity,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortBy === "Newest" || sortBy === "Oldest") {
        const da = toDateObj(a)?.getTime() || 0;
        const db = toDateObj(b)?.getTime() || 0;
        return sortBy === "Newest" ? db - da : da - db;
      }
      if (sortBy === "Severity") {
        const sa =
          severityRank(
            String(a.severity_level ?? a.severity ?? "")
              .trim()
              .replace(/^./, (m) => m.toUpperCase())
          ) || 0;
        const sb =
          severityRank(
            String(b.severity_level ?? b.severity ?? "")
              .trim()
              .replace(/^./, (m) => m.toUpperCase())
          ) || 0;
        return sb - sa; // highest first
      }
      if (sortBy === "Area") {
        const aa = areaValue(a);
        const ab = areaValue(b);
        const va = typeof aa === "number" ? aa : -Infinity;
        const vb = typeof ab === "number" ? ab : -Infinity;
        return vb - va; // largest first
      }
      return 0;
    });

    return sorted;
  }, [
    calamities,
    selectedCalamityType,
    selectedBarangay,
    selectedStatus,
    selectedSeverity,
    dateFrom,
    dateTo,
    search,
    hasPhotos,
    hasVideos,
    areaMin,
    areaMax,
    sortBy,
  ]);

  /* ---------------- media for selected calamity --------------- */
  const { photoUrls, videoUrls } = useMemo(() => {
    if (!selectedCalamity) return { photoUrls: [], videoUrls: [] };
    const base = "http://localhost:5000";
    const photos = normalizeMediaArray(
      selectedCalamity.photos?.length ? selectedCalamity.photos : selectedCalamity.photo,
      base
    );
    const videos = normalizeMediaArray(selectedCalamity.videos || [], base);
    return { photoUrls: photos, videoUrls: videos };
  }, [selectedCalamity]);

  const heroImg = photoUrls.length > 0 ? photoUrls[0] : null;

  const adminFullName = useMemo(() => {
    const sc = selectedCalamity || {};
    if (sc.admin_full_name && String(sc.admin_full_name).trim()) return sc.admin_full_name;
    if (sc.admin_name && String(sc.admin_name).trim()) return sc.admin_name;
    const first = sc.admin_first_name || sc.first_name;
    const last = sc.admin_last_name || sc.last_name;
    if ((first || last) && String(first || last).trim())
      return [first, last].filter(Boolean).join(" ").trim();

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

  const severityValue = useMemo(() => {
    const raw = selectedCalamity?.severity_level ?? selectedCalamity?.severity ?? null;
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    const cap = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    if (["Low", "Moderate", "High", "Severe"].includes(cap)) return cap;
    return s;
  }, [selectedCalamity]);

  const areaVal = selectedCalamity?.affected_area ?? selectedCalamity?.area_ha ?? null;
  const cityValue = selectedCalamity?.city || selectedCalamity?.city_name || null;

  const clearFilters = () => {
    setSelectedCalamityType("All");
    setSelectedBarangay("");
    setSelectedStatus("All");
    setSelectedSeverity("All");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setHasPhotos(false);
    setHasVideos(false);
    setAreaMin("");
    setAreaMax("");
    setSortBy("Newest");
  };

  /* ------------------------------ UI ------------------------------ */
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

        {/* Map Layers */}
        <Section title="Map Layers">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Switch basemap</span>
            <label className="inline-flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={!!showLayers}
                onChange={(e) => setShowLayers?.(e.target.checked)}
                className="rounded border-gray-300"
              />
              Keep panel open
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(mapStyles || {}).map(([label, { url, thumbnail }]) => (
              <button
                key={label}
                type="button"
                onClick={() => setMapStyle?.(url)}
                className="w-full rounded-md border border-gray-300 overflow-hidden relative hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title={`Use ${label} style`}
              >
                <div className="aspect-square w-full bg-gray-100">
                  {thumbnail ? (
                    <img src={thumbnail} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-[10px] text-gray-500">
                      {label}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 text-[10px] text-white text-center bg-black/60 py-0.5">
                  {label}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <dl className="grid grid-cols-3 gap-3">
            <KV label="Region" value="Western Visayas" />
            <KV label="Province" value="Negros Occidental" />
            <KV label="City" value="Bacolod City" />
          </dl>
        </Section>

        {/* Filters */}
        <Section title="Filters">
          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Calamity Type</label>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={selectedCalamityType}
                onChange={(e) => setSelectedCalamityType?.(e.target.value)}
              >
                <option value="All">All</option>
                {(calamityTypeOptions.length ? calamityTypeOptions : CALAMITY_FILTERS).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Barangay</label>
              <select
                value={selectedBarangay}
                onChange={handleBarangayChange}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All</option>
                {Object.keys(BARANGAY_COORDS).map((brgy) => (
                  <option key={brgy} value={brgy}>{brgy}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="All">All</option>
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="All">All</option>
                {SEVERITY_FILTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Date From</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Date To</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Search</label>
              <input
                type="text"
                placeholder="Type, barangay, city, description..."
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="Severity">Severity (High → Low)</option>
                <option value="Area">Largest Area</option>
              </select>
            </div>

            {/* Results count + Clear */}
            <div className="flex items-end justify-between col-span-1">
              <div className="text-xs text-gray-500">
                Matching: <span className="font-semibold text-gray-700">{filteredCalamities.length}</span>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Advanced */}
          <div className="mt-3">
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-900 underline"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? "Hide advanced" : "Show advanced"}
            </button>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {/* Area Min/Max */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Area Min (ha)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={areaMin}
                    onChange={(e) => setAreaMin(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Area Max (ha)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={areaMax}
                    onChange={(e) => setAreaMax(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Has media */}
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={hasPhotos}
                      onChange={(e) => setHasPhotos(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Has photos
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={hasVideos}
                      onChange={(e) => setHasVideos(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Has videos
                  </label>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Details */}
        {selectedCalamity && (
          <Section title="Report details">
            <div className="flex flex-wrap gap-2 mb-3">
              {(selectedCalamity.barangay || selectedCalamity.location) && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {selectedCalamity.barangay || selectedCalamity.location}
                </span>
              )}

              {/* City chip */}
              {cityValue && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  {cityValue}
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

              {areaVal != null && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {fmtHa(areaVal)}
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <KV label="Calamity Type" value={fmt(selectedCalamity.calamity_type)} />
              <KV label="Barangay" value={fmt(selectedCalamity.barangay || selectedCalamity.location)} />
              <KV label="City" value={fmt(cityValue)} />
              <KV label="Latitude" value={fmt(selectedCalamity.latitude)} />
              <KV label="Longitude" value={fmt(selectedCalamity.longitude)} />
              <KV label="Reported By" value={fmt(adminFullName)} />
              <KV label="Reported" value={fmtDate(selectedCalamity.date_reported || selectedCalamity.created_at)} />
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
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Photos</div>
                  <div className="text-[11px] text-gray-500">{photoUrls.length}</div>
                </div>
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

            {videoUrls.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Videos</div>
                  <div className="text-[11px] text-gray-500">{videoUrls.length}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {videoUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-md border border-gray-200 overflow-hidden">
                      <video
                        src={url}
                        className="w-full h-40 object-cover bg-black"
                        controls
                        preload="metadata"
                        crossOrigin="anonymous"
                        onError={() => console.warn("Video failed to load:", url)}
                      />
                    </div>
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
      </div>
    </div>
  );
};

export default CalamitySidebar;
