import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import AdminNav from "../NavBar/AdminNavbar";
import Footer from "../LandingPage/Footer";

/* ---------- CONFIG ---------- */
const colorByCrop = {
  Rice: "#facc15",
  Corn: "#fb923c",
  Banana: "#a3e635",
  Sugarcane: "#34d399",
  Cassava: "#60a5fa",
  Vegetables: "#f472b6",
};

const SORT_OPTIONS = [
  { value: "harvest_desc", label: "Harvest: Newest" },
  { value: "harvest_asc",  label: "Harvest: Oldest" },
  { value: "volume_desc",  label: "Volume: High → Low" },
  { value: "volume_asc",   label: "Volume: Low → High" },
];

const yieldUnitMap = {
  1: "sacks",   // Corn (adjust if your ids differ)
  2: "sacks",   // Rice
  3: "bunches", // Banana
  4: "tons",    // Sugarcane
  5: "tons",    // Cassava
  6: "kg",      // Vegetables
};

/* ---------- UTILS ---------- */
const nf2 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const fmtNum = (v) => (v === null || v === undefined || v === "" ? "N/A" : nf2.format(Number(v)));
const fmtDate = (date) => {
  if (!date) return "N/A";
  const t = new Date(date);
  return isNaN(t.getTime())
    ? "N/A"
    : t.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

/* ---------- PAGE ---------- */
const ManageCrop = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingCrop, setEditingCrop] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeActionId, setActiveActionId] = useState(null);

  const [cropTypes, setCropTypes] = useState([]);
  const [varieties, setVarieties] = useState([]);

  const [selectedCropTypeId, setSelectedCropTypeId] = useState(null);
  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("harvest_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 400, once: true });
    (async () => {
      try {
        setIsLoading(true);
        const [cropsRes, typesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/managecrops"),
          axios.get("http://localhost:5000/api/crops/types"),
        ]);
        setCrops(cropsRes.data || []);
        setCropTypes(typesRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (editForm.crop_type_id) {
      axios
        .get(`http://localhost:5000/api/crops/varieties/${editForm.crop_type_id}`)
        .then((res) => setVarieties(res.data))
        .catch((err) => console.error("Failed to load varieties:", err));
    }
  }, [editForm.crop_type_id]);

  const fetchCrops = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/managecrops");
      setCrops(res.data || []);
    } catch (e) {
      console.error("Error fetching crops:", e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------- filter + search ------- */
  const filtered = useMemo(() => {
    const byType = crops.filter(
      (c) => !selectedCropTypeId || c.crop_type_id === selectedCropTypeId
    );
    if (!search.trim()) return byType;
    const q = search.toLowerCase();
    return byType.filter((c) =>
      [
        c.crop_name,
        c.variety_name,
        c.crop_barangay,
        c.farmer_first_name,
        c.farmer_last_name,
        c.farmer_mobile,
        c.farmer_barangay,
        c.farmer_address,
        c.note,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [crops, selectedCropTypeId, search]);

  /* ------- sort ------- */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const toTime = (d) => {
      if (!d) return null;
      const t = new Date(d).getTime();
      return Number.isNaN(t) ? null : t;
    };
    switch (sort) {
      case "harvest_asc":
        arr.sort((a, b) => (toTime(a.estimated_harvest) ?? Infinity) - (toTime(b.estimated_harvest) ?? Infinity)); break;
      case "harvest_desc":
        arr.sort((a, b) => (toTime(b.estimated_harvest) ?? -Infinity) - (toTime(a.estimated_harvest) ?? -Infinity)); break;
      case "volume_asc":
        arr.sort((a, b) => (Number(a.estimated_volume) || 0) - (Number(b.estimated_volume) || 0)); break;
      case "volume_desc":
        arr.sort((a, b) => (Number(b.estimated_volume) || 0) - (Number(a.estimated_volume) || 0)); break;
      default: break;
    }
    return arr;
  }, [filtered, sort]);

  useEffect(() => { setPage(1); }, [selectedCropTypeId, search, sort, pageSize]);

  /* ------- pagination ------- */
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  /* ------- edit/update ------- */
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setEditForm({
      ...crop,
      crop_type_id: crop.crop_type_id || "",
      variety_id: crop.variety_id || "",
      farmer_id: crop.farmer_id || "",
      planted_date: crop.planted_date || "",
      estimated_harvest: crop.estimated_harvest || "",
      estimated_volume: crop.estimated_volume || "",
      estimated_hectares: crop.estimated_hectares || "",
      note: crop.note || "",
      barangay: crop.crop_barangay || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/managecrops/${editingCrop.id}`, editForm);
      await fetchCrops();
      setEditingCrop(null);
      alert("Crop updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update crop.");
    }
  };

  /* ------- delete with confirm ------- */
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/managecrops/${pendingDelete.id}`);
      setCrops((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      setPendingDelete(null);
      alert("Crop deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete crop.");
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <AdminNav />

      <main className="ml-[115px] pt-[92px] pr-8 flex-grow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[34px] leading-tight font-bold text-slate-900">Crop Management</h1>
                <p className="text-[15px] text-slate-600">View, filter, and update crop records from field officers.</p>
              </div>
            </div>

            {/* Tools Row */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Chip active={!selectedCropTypeId} onClick={() => setSelectedCropTypeId(null)}>All</Chip>
                {cropTypes.map((t) => (
                  <Chip
                    key={t.id}
                    active={selectedCropTypeId === t.id}
                    onClick={() => setSelectedCropTypeId(selectedCropTypeId === t.id ? null : t.id)}
                  >
                    {t.name}
                  </Chip>
                ))}
              </div>

              <div className="flex items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Crop, variety, farmer, barangay…"
                      className="border border-slate-300 pl-9 pr-3 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sort</label>
                  <select
                    className="border border-slate-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={i} />)
            ) : pageItems.length > 0 ? (
              pageItems.map((crop) => {
                const color = colorByCrop[crop.crop_name] || "#16a34a";
                const hasCoords = crop.latitude && crop.longitude;
                return (
                  <div
                    key={crop.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm transition relative"
                    data-aos="fade-up"
                  >
                    {/* Actions */}
                    <div className="absolute top-3 right-3">
                      <button
                        aria-label="More actions"
                        onClick={() => setActiveActionId((id) => (id === crop.id ? null : crop.id))}
                        className="p-2 -m-2 rounded-md hover:bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-600"
                      >
                        ⋯
                      </button>
                      {activeActionId === crop.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
                          <button
                            onClick={() => { setActiveActionId(null); handleEdit(crop); }}
                            className="block w-full px-4 py-2 text-sm text-left hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => { setActiveActionId(null); setPendingDelete(crop); }}
                            className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <h3 className="text-[20px] font-semibold text-slate-900">{crop.crop_name}</h3>
                    </div>
                    {crop.variety_name && (
                      <div className="mt-0.5 text-[13px] text-slate-500">{crop.variety_name}</div>
                    )}

                    {/* Meta (crop info) */}
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                      <Stat label="Planted"  value={fmtDate(crop.planted_date)} />
                      <Stat label="Harvest"  value={fmtDate(crop.estimated_harvest)} />
                      <Stat label="Volume"   value={`${fmtNum(crop.estimated_volume)} ${yieldUnitMap[crop.crop_type_id] || "units"}`} />
                      <Stat label="Hectares" value={fmtNum(crop.estimated_hectares)} />
                      <Stat label="Barangay (Crop)" value={crop.crop_barangay || "N/A"} />
                      <Stat
                        label="Map"
                        value={
                          (hasCoords) ? (
                            <button
                              className="text-emerald-700 hover:underline"
                              onClick={() =>
                                navigate("/AdminMap", {
                                  state: {
                                    cropId: String(crop.id),            // <- KEY for auto-highlight
                                    cropName: crop.crop_name || "",
                                    barangay: crop.crop_barangay || "",
                                    lat: Number(crop.latitude),         // fallback center if needed
                                    lng: Number(crop.longitude),
                                    zoom: 16,
                                  },
                                })
                              }
                              
                              title="Open in Admin Map"
                            >
                              View location ↗
                            </button>
                          ) : "N/A"
                        }
                      />
                    </div>

                    {/* Farmer block */}
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="text-[11px] tracking-wide text-slate-500 uppercase mb-2">Farmer</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <Stat
                          label="Name"
                          value={
                            crop.farmer_first_name || crop.farmer_last_name
                              ? `${crop.farmer_first_name || ""} ${crop.farmer_last_name || ""}`.trim()
                              : "N/A"
                          }
                        />
                        <Stat label="Mobile" value={crop.farmer_mobile || "N/A"} />
                        <Stat label="Barangay" value={crop.farmer_barangay || "N/A"} />
                        <Stat label="Full Address" value={<span className="break-words">{crop.farmer_address || "N/A"}</span>} />
                      </div>
                    </div>

                    {/* Notes */}
                    <NoteClamp text={crop.note} className="mt-3" />

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-[12px] text-slate-500">
                        Tagged by{" "}
                        <span className="text-slate-700">
                          {crop.tagger_first_name && crop.tagger_last_name
                            ? `${crop.tagger_first_name} ${crop.tagger_last_name}`
                            : (crop.tagger_email || "N/A")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState onClear={() => { setSelectedCropTypeId(null); setSearch(""); }} />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && (
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{total === 0 ? 0 : start + 1}</span>
                {"–"}
                <span className="font-medium">{Math.min(start + pageSize, total)}</span> of{" "}
                <span className="font-medium">{total}</span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="border border-slate-300 px-2 py-1 rounded-md"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {[8, 12, 16, 24].map((n) => (
                    <option key={n} value={n}>{n} per page</option>
                  ))}
                </select>

                <div className="inline-flex items-center gap-1">
                  <PageBtn disabled={page === 1} onClick={() => setPage(1)} aria="First">«</PageBtn>
                  <PageBtn disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria="Previous">‹</PageBtn>
                  <span className="px-3 text-sm text-slate-700">Page {page} of {totalPages}</span>
                  <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria="Next">›</PageBtn>
                  <PageBtn disabled={page === totalPages} onClick={() => setPage(totalPages)} aria="Last">»</PageBtn>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingCrop && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4">Edit Crop Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                name="crop_type_id"
                value={editForm.crop_type_id}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">-- Select Crop Type --</option>
                {cropTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>

              <select
                name="variety_id"
                value={editForm.variety_id || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">-- Select Variety --</option>
                {varieties.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>

              <input
                type="date"
                name="planted_date"
                value={(editForm.planted_date || "").toString().split("T")[0] || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />

              <input
                type="date"
                name="estimated_harvest"
                value={(editForm.estimated_harvest || "").toString().split("T")[0] || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />

              <input
                name="estimated_volume"
                value={editForm.estimated_volume}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Volume"
              />

              <input
                name="estimated_hectares"
                value={editForm.estimated_hectares}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Hectares"
              />

              <input
                name="barangay"
                value={editForm.barangay || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Crop Barangay"
              />

              <input
                name="farmer_id"
                value={editForm.farmer_id || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Farmer ID"
              />

              <textarea
                name="note"
                value={editForm.note || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded md:col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Notes"
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setEditingCrop(null)} className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleUpdate} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete crop"
          message={`This will permanently delete "${pendingDelete.crop_name}" in ${pendingDelete.crop_barangay || "—"}.`}
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
    <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    <div className="text-[14px] text-slate-900">{value}</div>
  </div>
);

function NoteClamp({ text, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  if (!text || !text.trim()) return null;
  const needsToggle = text.length > 140;
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">Note</div>
      <p
        className={`text-[14px] text-slate-700 ${expanded ? "" : "line-clamp-3"}`}
        style={!expanded ? { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}}
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
    <h4 className="text-lg font-semibold text-slate-900">No crops found</h4>
    <p className="mt-1 text-slate-600">Try adjusting the filters or your search.</p>
    <button
      onClick={onClear}
      className="mt-4 inline-flex items-center px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
    >
      Clear filters
    </button>
  </div>
);

export default ManageCrop;
