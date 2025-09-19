import React, { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import AdminNav from "../NavBar/AdminNavbar";
import Footer from "../LandingPage/Footer";

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

const ManageCrop = () => {
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeActionId, setActiveActionId] = useState(null);
  const [cropTypes, setCropTypes] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [selectedCropTypeId, setSelectedCropTypeId] = useState(null);
  const [search, setSearch] = useState("");

  // NEW: sort + pagination + confirm
  const [sort, setSort] = useState("harvest_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
    fetchCrops();
    fetchCropTypes();
  }, []);

  useEffect(() => {
    if (editForm.crop_type_id) {
      axios
        .get(`http://localhost:5000/api/crops/varieties/${editForm.crop_type_id}`)
        .then((res) => setVarieties(res.data))
        .catch((err) => console.error("Failed to load varieties:", err));
    }
  }, [editForm.crop_type_id]);

  const fetchCrops = () => {
    axios
      .get("http://localhost:5000/api/managecrops")
      .then((response) => setCrops(response.data))
      .catch((error) => console.error("Error fetching crops:", error));
  };

  const fetchCropTypes = () => {
    axios
      .get("http://localhost:5000/api/crops/types")
      .then((res) => setCropTypes(res.data))
      .catch((err) => console.error("Error fetching crop types:", err));
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const yieldUnitMap = {
    1: "sacks",   // Corn
    2: "sacks",   // Rice
    3: "bunches", // Banana
    4: "tons",    // Sugarcane
    5: "tons",    // Cassava
    6: "kg",      // Vegetables
  };

  // ------- filter + search -------
  const filtered = useMemo(() => {
    const byType = crops.filter(
      (c) => !selectedCropTypeId || c.crop_type_id === selectedCropTypeId
    );
    if (!search.trim()) return byType;
    const q = search.toLowerCase();
    return byType.filter((c) =>
      [c.crop_name, c.variety_name, c.barangay, c.first_name, c.last_name, c.note]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [crops, selectedCropTypeId, search]);

  // ------- sort -------
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const toTime = (d) => {
      if (!d) return null;
      const t = new Date(d).getTime();
      return Number.isNaN(t) ? null : t;
    };

    switch (sort) {
      case "harvest_asc":
        arr.sort((a, b) => (toTime(a.estimated_harvest) ?? Infinity) - (toTime(b.estimated_harvest) ?? Infinity));
        break;
      case "harvest_desc":
        arr.sort((a, b) => (toTime(b.estimated_harvest) ?? -Infinity) - (toTime(a.estimated_harvest) ?? -Infinity));
        break;
      case "volume_asc":
        arr.sort((a, b) => (Number(a.estimated_volume) || 0) - (Number(b.estimated_volume) || 0));
        break;
      case "volume_desc":
        arr.sort((a, b) => (Number(b.estimated_volume) || 0) - (Number(a.estimated_volume) || 0));
        break;
      default:
        break;
    }
    return arr;
  }, [filtered, sort]);

  // reset to page 1 when inputs change
  useEffect(() => {
    setPage(1);
  }, [selectedCropTypeId, search, sort, pageSize]);

  // ------- pagination -------
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  // ------- edit/update -------
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setEditForm({
      ...crop,
      crop_type_id: crop.crop_type_id || "",
      variety_id: crop.variety_id || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/managecrops/${editingCrop.id}`, editForm);
      fetchCrops();
      setEditingCrop(null);
      alert("Crop updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update crop.");
    }
  };

  // ------- delete with confirm -------
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

  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <AdminNav />

      {/* keep your nav offset but center content */}
      <main className="ml-[115px] pt-[100px] pr-8 flex-grow">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header + tools */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-green-700">
                Crop Management Panel
              </h2>
              <p className="text-gray-600">View, edit, or delete crop data tagged by field officers.</p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Crop Type
                </label>
                <select
                  className="border border-gray-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={selectedCropTypeId || ""}
                  onChange={(e) => setSelectedCropTypeId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Show All Crop Types</option>
                  {cropTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Crop, variety, barangay…"
                  className="border border-gray-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                <select
                  className="border border-gray-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-green-600"
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

          {/* Grid of cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageItems.length > 0 ? (
              pageItems.map((crop) => {
                const color = colorByCrop[crop.crop_name] || "#16a34a";
                return (
                  <div
                    key={crop.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition relative"
                    data-aos="fade-up"
                  >
                    {/* Actions */}
                    <div className="absolute top-3 right-3">
                      <button
                        aria-label="More actions"
                        onClick={() =>
                          setActiveActionId((id) => (id === crop.id ? null : crop.id))
                        }
                        className="p-2 -m-2 rounded-md hover:bg-gray-50 text-gray-700"
                      >
                        ⋯
                      </button>
                      {activeActionId === crop.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-xl z-50">
                          <button
                            onClick={() => {
                              setActiveActionId(null);
                              setTimeout(() => setEditingCrop(crop), 0);
                              handleEdit(crop);
                            }}
                            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setActiveActionId(null);
                              setPendingDelete(crop);
                            }}
                            className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Header */}
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <h3 className="text-xl font-semibold text-gray-900">{crop.crop_name}</h3>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                      <Meta label="Variety"  value={crop.variety_name || "N/A"} />
                      <Meta label="Barangay" value={crop.barangay || "N/A"} />
                      <Meta label="Planted"  value={formatDate(crop.planted_date)} />
                      <Meta label="Harvest"  value={formatDate(crop.estimated_harvest)} />
                      <Meta label="Volume"   value={`${crop.estimated_volume} ${yieldUnitMap[crop.crop_type_id] || "units"}`} />
                      <Meta label="Hectares" value={crop.estimated_hectares} />
                    </div>

                    {/* Note */}
                    <NoteClamp text={crop.note} className="mt-3" />

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Tagged by{" "}
                        <span className="text-gray-700">
                          {crop.first_name && crop.last_name
                            ? `${crop.first_name} ${crop.last_name}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-10 text-center">
                <h4 className="text-lg font-medium text-gray-900">No crops found</h4>
                <p className="mt-1 text-gray-600">Try clearing the filter or changing your search.</p>
                {(selectedCropTypeId || search) && (
                  <button
                    onClick={() => { setSelectedCropTypeId(null); setSearch(""); }}
                    className="mt-4 inline-flex items-center px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{total === 0 ? 0 : start + 1}</span>
              {"–"}
              <span className="font-medium">{Math.min(start + pageSize, total)}</span> of{" "}
              <span className="font-medium">{total}</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 px-2 py-1 rounded-md"
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
                <span className="px-3 text-sm text-gray-700">Page {page} of {totalPages}</span>
                <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria="Next">›</PageBtn>
                <PageBtn disabled={page === totalPages} onClick={() => setPage(totalPages)} aria="Last">»</PageBtn>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingCrop && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-xl w-full max-w-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-green-700 mb-4">Edit Crop Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                name="crop_type_id"
                value={editForm.crop_type_id}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
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
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">-- Select Variety --</option>
                {varieties.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>

              <input
                type="date"
                name="planted_date"
                value={editForm.planted_date?.split("T")[0] || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              />

              <input
                type="date"
                name="estimated_harvest"
                value={editForm.estimated_harvest?.split("T")[0] || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              />

              <input
                name="estimated_volume"
                value={editForm.estimated_volume}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Volume"
              />

              <input
                name="estimated_hectares"
                value={editForm.estimated_hectares}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Hectares"
              />

              <textarea
                name="note"
                value={editForm.note || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded md:col-span-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Notes"
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setEditingCrop(null)} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleUpdate} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
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
          message={`This will permanently delete "${pendingDelete.crop_name}" in ${pendingDelete.barangay || "—"}.`}
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

const Meta = ({ label, value }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

function NoteClamp({ text, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  if (!text || !text.trim()) return null;
  const needsToggle = text.length > 140;
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wide text-gray-500">Note</div>
      <p
        className={`text-sm text-gray-700 ${expanded ? "" : "line-clamp-3"}`}
        style={!expanded ? { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}}
      >
        {text}
      </p>
      {needsToggle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-green-700 hover:underline"
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
          ? "text-gray-400 border-gray-200 cursor-not-allowed"
          : "text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <p className="mt-2 text-sm text-gray-700">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
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

export default ManageCrop;
