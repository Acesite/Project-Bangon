import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import SuperAdminNav from "../NavBar/SuperAdminNav";
import Footer from "../LandingPage/Footer";

/* ---------- CONFIG ---------- */
const colorByIncident = {
  Flood: "#60a5fa",
  Landslide: "#b45309",
  Fire: "#ef4444",
  Typhoon: "#22c55e",
  Earthquake: "#a3a3a3",
  Others: "#8b5cf6",
};

const SORT_OPTIONS = [
  { value: "reported_desc", label: "Reported: Newest" },
  { value: "reported_asc", label: "Reported: Oldest" },
  { value: "severity_desc", label: "Severity: High → Low" },
  { value: "severity_asc", label: "Severity: Low → High" },
];

/* ---------- UTILS ---------- */
const nf2 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const fmtNum = (v) =>
  v === null || v === undefined || v === "" ? "N/A" : nf2.format(Number(v));
const fmtDate = (date) => {
  if (!date) return "N/A";
  const t = new Date(date);
  return isNaN(t.getTime())
    ? "N/A"
    : t.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

/* ---------- datetime-local helpers ---------- */
const pad2 = (n) => String(n).padStart(2, "0");
const toDatetimeLocalValue = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(
    dt.getDate()
  )}T${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
};
const fromDatetimeLocalToISO = (val) => {
  if (!val) return null;
  const dt = new Date(val);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
};

/* ---------- CALAMITY UI HELPERS ---------- */
const fmtStr = (v) => (v || v === 0 ? String(v) : "N/A");
const fmtHa = (v) => (v || v === 0 ? `${Number(v).toFixed(2)} ha` : "N/A");

const statusBadge = (status) => {
  const map = {
    Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    Verified: "bg-green-100 text-green-800 border border-green-200",
    Resolved: "bg-blue-100 text-blue-800 border border-blue-200",
    Rejected: "bg-red-100 text-red-800 border border-red-200",
  };
  return map[status] || "bg-gray-100 text-gray-800 border border-gray-200";
};

const severityBadge = (sevText) => {
  const map = {
    Low: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    Moderate: "bg-amber-100 text-amber-800 border border-amber-200",
    High: "bg-red-100 text-red-800 border border-red-200",
    Severe: "bg-red-200 text-red-900 border border-red-300",
  };
  return map[sevText] || "bg-gray-100 text-gray-800 border border-gray-200";
};

/* ---------- PAGE ---------- */
const ManageCalamity = () => {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingIncident, setEditingIncident] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeActionId, setActiveActionId] = useState(null);

  const [incidentTypes, setIncidentTypes] = useState([]); // optional taxonomy
  const [selectedType, setSelectedType] = useState(null);
  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("reported_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [viewingIncident, setViewingIncident] = useState(null);

  /* NEW: Lookup lists to show names instead of raw IDs in the modal */
  const [cropTypes, setCropTypes] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [ecosystems, setEcosystems] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 400, once: true });
    (async () => {
      try {
        setIsLoading(true);
        const [incRes, typesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/managecalamities"),
          axios
            .get("http://localhost:5000/api/managecalamities/types")
            .catch(() => ({ data: [] })), // optional
        ]);
        setIncidents(incRes.data || []);
        setIncidentTypes(typesRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();

    /* Fetch lookup lists for selects */
    (async () => {
      try {
        const [ct, cv, eco] = await Promise.all([
          axios.get("http://localhost:5000/api/crop-types").catch(() => ({ data: [] })),
          axios.get("http://localhost:5000/api/crop-varieties").catch(() => ({ data: [] })),
          axios.get("http://localhost:5000/api/ecosystems").catch(() => ({ data: [] })),
        ]);
        setCropTypes(Array.isArray(ct.data) ? ct.data : []);
        setVarieties(Array.isArray(cv.data) ? cv.data : []);
        setEcosystems(Array.isArray(eco.data) ? eco.data : []);
      } catch (e) {
        // Silently ignore; UI will fallback to text inputs
      }
    })();
  }, []);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/managecalamities");
      setIncidents(res.data || []);
    } catch (e) {
      console.error("Error fetching incidents:", e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------- filter + search ------- */
  const filtered = useMemo(() => {
    const byType = incidents.filter((c) => {
      const t = c.calamity_type || c.incident_type || c.type_name;
      return !selectedType || t === selectedType;
    });
    if (!search.trim()) return byType;
    const q = search.toLowerCase();
    return byType.filter((c) =>
      [
        c.calamity_type,
        c.incident_type,
        c.type_name,
        c.status,
        c.barangay,
        c.location,
        c.description,
        c.crop_stage,
        c.ecosystem_name,
        c.crop_type_name,
        c.variety_name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [incidents, selectedType, search]);

  /* ------- sort ------- */
  const sorted = useMemo(() => {
    const arr = [...filtered];

    const toTime = (d) => {
      if (!d) return null;
      const t = new Date(d).getTime();
      return Number.isNaN(t) ? null : t;
    };

    const toSeverityNum = (sevText, numericFallback) => {
      const s = String(sevText || "").toLowerCase();
      if (s === "severe") return 6;
      if (s === "high") return 5;
      if (s === "moderate") return 3;
      if (s === "low") return 1;
      return Number(numericFallback) || 0;
    };

    switch (sort) {
      case "reported_asc":
        arr.sort(
          (a, b) =>
            (toTime(a.date_reported || a.reported_at) ?? Infinity) -
            (toTime(b.date_reported || b.reported_at) ?? Infinity)
        );
        break;
      case "reported_desc":
        arr.sort(
          (a, b) =>
            (toTime(b.date_reported || b.reported_at) ?? -Infinity) -
            (toTime(a.date_reported || a.reported_at) ?? -Infinity)
        );
        break;
      case "severity_asc":
        arr.sort(
          (a, b) =>
            toSeverityNum(a.severity_level || a.severity_text, a.severity) -
            toSeverityNum(b.severity_level || b.severity_text, b.severity)
        );
        break;
      case "severity_desc":
        arr.sort(
          (a, b) =>
            toSeverityNum(b.severity_level || b.severity_text, b.severity) -
            toSeverityNum(a.severity_level || a.severity_text, a.severity)
        );
        break;
      default:
        break;
    }
    return arr;
  }, [filtered, sort]);

  useEffect(() => {
    setPage(1);
  }, [selectedType, search, sort, pageSize]);

  /* ------- pagination ------- */
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  /* ------- edit/update ------- */
  const handleEdit = (incident) => {
    const latest = incident;
    setEditingIncident(latest);

    const reportedRaw =
      latest.date_reported || latest.reported_at || latest.created_at || null;

    setEditForm({
      ...latest,
      incident_type:
        latest.calamity_type || latest.incident_type || latest.type_name || "",
      severity_text: latest.severity_level || latest.severity_text || "",
      severity: latest.severity || 0,
      status: latest.status || "",
      barangay: latest.barangay || latest.location || "",
      reported_at: reportedRaw || "",
      reported_at_input: toDatetimeLocalValue(reportedRaw),

      latitude: latest.latitude ?? "",
      longitude: latest.longitude ?? "",
      note: latest.description || latest.note || "",
      affected_area: latest.affected_area ?? "",
      crop_stage: latest.crop_stage ?? "",

      // IDs for selects
      crop_type_id: latest.crop_type_id ?? "",
      crop_variety_id: latest.crop_variety_id ?? "",
      ecosystem_id: latest.ecosystem_id ?? "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "reported_at_input") {
      return setEditForm((prev) => ({
        ...prev,
        reported_at_input: value,
        reported_at: fromDatetimeLocalToISO(value) || value,
      }));
    }

    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const coerceNum = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        incident_type: editForm.incident_type || null,
        status: editForm.status || null,
        severity_text: editForm.severity_text || null,
        severity: coerceNum(editForm.severity),
        reported_at:
          editForm.reported_at ||
          fromDatetimeLocalToISO(editForm.reported_at_input) ||
          null,
        barangay: editForm.barangay || null,
        latitude: coerceNum(editForm.latitude),
        longitude: coerceNum(editForm.longitude),
        affected_area: coerceNum(editForm.affected_area),
        crop_stage: editForm.crop_stage || null,

        // Send IDs from selects
        crop_type_id: coerceNum(editForm.crop_type_id),
        crop_variety_id: coerceNum(editForm.crop_variety_id),
        ecosystem_id: coerceNum(editForm.ecosystem_id),

        note: editForm.note || null,
      };

      await axios.put(
        `http://localhost:5000/api/managecalamities/${editingIncident.id}`,
        payload
      );
      await fetchIncidents();
      setEditingIncident(null);
      alert("Incident updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update incident.");
    }
  };

  /* ------- delete with confirm ------- */
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/managecalamities/${pendingDelete.id}`
      );
      setIncidents((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      setPendingDelete(null);
      alert("Incident deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete incident.");
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <SuperAdminNav />

      <main className="ml-[115px] pt-[92px] pr-8 flex-grow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[34px] leading-tight font-bold text-slate-900">
                  Calamity Management
                </h1>
                <p className="text-[15px] text-slate-600">
                  View, filter, and update reported incidents from field
                  officers.
                </p>
              </div>
            </div>

            {/* Tools Row */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Chip active={!selectedType} onClick={() => setSelectedType(null)}>
                  All
                </Chip>
                {incidentTypes.length > 0
                  ? incidentTypes.map((t, idx) => (
                      <Chip
                        key={`${t.name || t.id || "type"}-${idx}`}
                        active={selectedType === (t.name || t.id)}
                        onClick={() =>
                          setSelectedType(
                            selectedType === (t.name || t.id)
                              ? null
                              : t.name || t.id
                          )
                        }
                      >
                        {t.name || t.label || "Type"}
                      </Chip>
                    ))
                  : Object.entries(colorByIncident).map(([k], idx) => (
                      <Chip
                        key={`${k}-${idx}`}
                        active={selectedType === k}
                        onClick={() =>
                          setSelectedType(selectedType === k ? null : k)
                        }
                      >
                        {k}
                      </Chip>
                    ))}
              </div>

              <div className="flex items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Type, status, barangay, keywords…"
                      className="border border-slate-300 pl-9 pr-3 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                      🔎
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Sort
                  </label>
                  <select
                    className="border border-slate-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : pageItems.length > 0 ? (
              pageItems.map((inc) => {
                const type =
                  inc.calamity_type || inc.incident_type || inc.type_name || "Others";
                const color = colorByIncident[type] || "#16a34a";
                const hasCoords = inc.latitude && inc.longitude;

                return (
                  <div
                    key={inc.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm transition relative"
                    data-aos="fade-up"
                  >
                    {/* Actions */}
                    <div className="absolute top-3 right-3">
                      <button
                        aria-label="More actions"
                        onClick={() =>
                          setActiveActionId((id) => (id === inc.id ? null : inc.id))
                        }
                        className="p-2 -m-2 rounded-md hover:bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-600"
                      >
                        ⋯
                      </button>
                      {activeActionId === inc.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
                          <button
                            onClick={() => {
                              setActiveActionId(null);
                              handleEdit(inc);
                            }}
                            className="block w-full px-4 py-2 text-sm text-left hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setActiveActionId(null);
                              setPendingDelete(inc);
                            }}
                            className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <h3 className="text-[20px] font-semibold text-slate-900">
                          {type}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {inc.status && (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs ${statusBadge(
                              inc.status
                            )}`}
                          >
                            {inc.status}
                          </span>
                        )}
                        {(inc.severity_level || inc.severity_text) && (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs ${severityBadge(
                              inc.severity_level || inc.severity_text
                            )}`}
                          >
                            {inc.severity_level || inc.severity_text}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                      <Stat
                        label="Reported"
                        value={fmtDate(inc.date_reported || inc.reported_at)}
                      />
                      <Stat
                        label="Location (Barangay)"
                        value={fmtStr(inc.location || inc.barangay)}
                      />
                      <Stat label="Affected Area" value={fmtHa(inc.affected_area)} />
                      <Stat label="Crop Stage" value={fmtStr(inc.crop_stage)} />
                      <Stat
                        label="Crop Type"
                        value={
                          inc.crop_type_name || inc.crop_type || inc.crop_type_id
                        }
                      />
                      <Stat
                        label="Ecosystem"
                        value={
                          inc.ecosystem_name ||
                          inc.ecosystem ||
                          inc.ecosystem_id
                        }
                      />
                      <Stat
                        label="Variety"
                        value={
                          inc.variety_name || inc.variety || inc.crop_variety_id
                        }
                      />

                      <Stat
                        label="Map"
                        value={
                          hasCoords ? (
                            <button
                              className="text-emerald-700 hover:underline"
                              onClick={() =>
                                navigate("/CalamityFarmerMap", {
                                  state: {
                                    incidentId: String(inc.id),
                                    incidentType: type,
                                    barangay: inc.barangay || inc.location || "",
                                    lat: Number(inc.latitude),
                                    lng: Number(inc.longitude),
                                    zoom: 16,
                                  },
                                })
                              }
                              title="Open in Admin Map"
                            >
                              View location ↗
                            </button>
                          ) : (
                            "N/A"
                          )
                        }
                      />
                    </div>

                    <NoteClamp
                      text={inc.description || inc.note}
                      className="mt-3"
                    />

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-[12px] text-slate-500">
                        Status:&nbsp;
                        <span className="text-slate-700">
                          {inc.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                onClear={() => {
                  setSelectedType(null);
                  setSearch("");
                }}
              />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && (
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-medium">{total === 0 ? 0 : start + 1}</span>
                {"–"}
                <span className="font-medium">
                  {Math.min(start + pageSize, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="border border-slate-300 px-2 py-1 rounded-md"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {[8, 12, 16, 24].map((n) => (
                    <option key={n} value={n}>
                      {n} per page
                    </option>
                  ))}
                </select>

                <div className="inline-flex items-center gap-1">
                  <PageBtn
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                    aria="First"
                  >
                    «
                  </PageBtn>
                  <PageBtn
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria="Previous"
                  >
                    ‹
                  </PageBtn>
                  <span className="px-3 text-sm text-slate-700">
                    Page {page} of {totalPages}
                  </span>
                  <PageBtn
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria="Next"
                  >
                    ›
                  </PageBtn>
                  <PageBtn
                    disabled={page === totalPages}
                    onClick={() => setPage(totalPages)}
                    aria="Last"
                  >
                    »
                  </PageBtn>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingIncident && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4">
              Edit Incident Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="incident_type"
                value={editForm.incident_type || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Incident Type (e.g., Flood, Fire)"
              />

              <select
                name="status"
                value={editForm.status || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">-- Select Status --</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                name="severity_text"
                value={editForm.severity_text || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">-- Severity --</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Severe">Severe</option>
              </select>

              <input
                type="datetime-local"
                name="reported_at_input"
                value={editForm.reported_at_input || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />

              <input
                name="barangay"
                value={editForm.barangay || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Barangay / Location"
              />

              <input
                name="latitude"
                value={editForm.latitude ?? ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Latitude"
              />

              <input
                name="longitude"
                value={editForm.longitude ?? ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Longitude"
              />

              <input
                name="affected_area"
                value={editForm.affected_area ?? ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Affected Area (ha)"
              />

              <input
                name="crop_stage"
                value={editForm.crop_stage || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Crop Stage"
              />

              {/* CROP TYPE (select with names) */}
              {cropTypes.length > 0 ? (
                <select
                  name="crop_type_id"
                  value={editForm.crop_type_id ?? ""}
                  onChange={handleEditChange}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">-- Crop Type --</option>
                  {cropTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  readOnly
                  value={editingIncident?.crop_type_name ?? editForm.crop_type_id ?? ""}
                  className="border px-3 py-2 rounded bg-slate-50 text-slate-600"
                  placeholder="Crop Type"
                />
              )}

              {/* ECOSYSTEM (select with names) */}
              {ecosystems.length > 0 ? (
                <select
                  name="ecosystem_id"
                  value={editForm.ecosystem_id ?? ""}
                  onChange={handleEditChange}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">-- Ecosystem --</option>
                  {ecosystems.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  readOnly
                  value={
                    editingIncident?.ecosystem_name ?? editForm.ecosystem_id ?? ""
                  }
                  className="border px-3 py-2 rounded bg-slate-50 text-slate-600"
                  placeholder="Ecosystem"
                />
              )}

              {/* VARIETY (select with names) */}
              {varieties.length > 0 ? (
                <select
                  name="crop_variety_id"
                  value={editForm.crop_variety_id ?? ""}
                  onChange={handleEditChange}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600 md:col-span-2"
                >
                  <option value="">-- Variety --</option>
                  {varieties.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  readOnly
                  value={
                    editingIncident?.variety_name ?? editForm.crop_variety_id ?? ""
                  }
                  className="border px-3 py-2 rounded bg-slate-50 text-slate-600 md:col-span-2"
                  placeholder="Variety"
                />
              )}

              <textarea
                name="note"
                value={editForm.note || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded md:col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Description / Notes"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditingIncident(null)}
                className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Modal */}
      {viewingIncident && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {viewingIncident.calamity_type ||
                    viewingIncident.incident_type ||
                    viewingIncident.type_name ||
                    "Incident"}
                  {viewingIncident.status ? ` · ${viewingIncident.status}` : ""}
                </h3>
                <p className="text-sm text-slate-500">
                  {viewingIncident.location || viewingIncident.barangay || "—"} ·{" "}
                  {viewingIncident.severity_level ||
                    viewingIncident.severity_text ||
                    "—"}
                </p>
              </div>
              <button
                onClick={() => setViewingIncident(null)}
                className="p-2 -m-2 rounded-md hover:bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <Stat
                label="Reported"
                value={fmtDate(
                  viewingIncident.date_reported || viewingIncident.reported_at
                )}
              />
              <Stat
                label="Affected Area"
                value={fmtHa(viewingIncident.affected_area)}
              />
              <Stat label="Crop Stage" value={fmtStr(viewingIncident.crop_stage)} />
              <Stat
                label="Crop Type"
                value={fmtStr(
                  viewingIncident.crop_type_name || viewingIncident.crop_type_id
                )}
              />
              <Stat
                label="Ecosystem"
                value={fmtStr(
                  viewingIncident.ecosystem_name || viewingIncident.ecosystem_id
                )}
              />
              <Stat
                label="Variety"
                value={fmtStr(
                  viewingIncident.variety_name || viewingIncident.crop_variety_id
                )}
              />
              <Stat
                label="Latitude"
                value={
                  viewingIncident.latitude ? fmtNum(viewingIncident.latitude) : "N/A"
                }
              />
              <Stat
                label="Longitude"
                value={
                  viewingIncident.longitude
                    ? fmtNum(viewingIncident.longitude)
                    : "N/A"
                }
              />
            </div>

            {renderPhotoStrip(viewingIncident)}

            {(viewingIncident.description || viewingIncident.note) && (
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Description
                </div>
                <p className="text-[14px] text-slate-700 whitespace-pre-wrap">
                  {viewingIncident.description || viewingIncident.note}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingIncident(null)}
                className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete incident"
          message={`This will permanently delete "${
            pendingDelete.calamity_type ||
            pendingDelete.incident_type ||
            pendingDelete.type_name ||
            "Incident"
          }" in ${pendingDelete.barangay || pendingDelete.location || "—"}.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      <div className="mt-5">
        <Footer />
      </div>
    </div>
  );
};

/* ---------- HELPERS ---------- */
function renderPhotoStrip(item) {
  const urls = new Set();

  const push = (raw) => {
    if (!raw) return;
    let p = String(raw).trim();
    if (!p) return;
    if (p.includes(",") && !p.startsWith("[") && !p.startsWith("{")) {
      p.split(",").forEach((part) => push(part));
      return;
    }
    if (!/^https?:\/\//i.test(p)) {
      const base = "http://localhost:5000";
      p = p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
    }
    urls.add(p);
  };

  if (Array.isArray(item?.photos)) item.photos.forEach(push);
  else if (item?.photos) push(item.photos);
  if (urls.size === 0 && item?.photo) push(item.photo);

  const photos = Array.from(urls);
  if (!photos.length) return null;

  return (
    <div className="mt-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
        Photos
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((url, idx) => (
          <a key={idx} href={url} target="_blank" rel="noreferrer" className="shrink-0">
            <img
              src={url}
              alt={`evidence-${idx}`}
              className="h-20 w-28 object-cover rounded-lg border border-slate-200"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------- SMALL UI PRIMS ---------- */
const Chip = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full border text-sm transition ${
      active
        ? "bg-emerald-600 text-white border-emerald-600"
        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

const Stat = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div className="text-[14px] text-slate-900">{value}</div>
  </div>
);

function NoteClamp({ text, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  if (!text || !text.toString().trim()) return null;
  const needsToggle = text.length > 140;
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">
        Description
      </div>
      <p
        className={`text-[14px] text-slate-700 ${expanded ? "" : "line-clamp-3"}`}
        style={
          !expanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}
        }
      >
        {text}
      </p>
      {needsToggle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-[12px] text-emerald-700 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function PageBtn({ children, disabled, onClick, aria }) {
  return (
    <button
      aria-label={aria}
      disabled={disabled}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md border text-sm ${
        disabled
          ? "text-slate-400 border-slate-200 cursor-not-allowed"
          : "text-slate-700 border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-600"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
        <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        <p className="mt-2 text-sm text-slate-700">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 p-5 animate-pulse">
    <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
    <div className="h-6 w-36 bg-slate-200 rounded mb-4" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-3 w-28 bg-slate-200 rounded" />
      <div className="h-3 w-28 bg-slate-200 rounded" />
      <div className="h-3 w-24 bg-slate-200 rounded" />
      <div className="h-3 w-24 bg-slate-200 rounded" />
    </div>
    <div className="mt-4 h-20 bg-slate-100 rounded" />
  </div>
);

const EmptyState = ({ onClear }) => (
  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-10 text-center">
    <h4 className="text-lg font-semibold text-slate-900">No incidents found</h4>
    <p className="mt-1 text-slate-600">Try adjusting the filters or your search.</p>
    <button
      onClick={onClear}
      className="mt-4 inline-flex items-center px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
    >
      Clear filters
    </button>
  </div>
);

export default ManageCalamity;
