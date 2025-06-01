import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import SuperAdminNav from "../NavBar/SuperAdminNav";
import Footer from "../LandingPage/Footer";

const SuperManageCrop = () => {
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeActionId, setActiveActionId] = useState(null);
  const [cropTypes, setCropTypes] = useState([]); // ✅ Crop types for dropdown

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchCrops();
    fetchCropTypes(); // ✅ fetch crop type names
  }, []);

  const fetchCrops = () => {
    axios.get("http://localhost:5000/api/managecrops")
      .then((response) => setCrops(response.data))
      .catch((error) => console.error("Error fetching crops:", error));
  };

  const fetchCropTypes = () => {
    axios.get("http://localhost:5000/api/crops/types")
      .then((res) => setCropTypes(res.data))
      .catch((err) => console.error("Error fetching crop types:", err));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/managecrops/${id}`);
      setCrops(crops.filter(crop => crop.id !== id));
      alert("Crop deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete crop.");
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setEditForm({ ...crop, crop_type_id: crop.crop_type_id || "" }); // ✅ ensure crop_type_id is included
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <SuperAdminNav />

      <aside className="fixed top-[90px] left-[350px] w-[200px] p-6 z-50">
        <nav className="space-y-4 font-medium">
          <a href="/SuperAdminLandingPage" className="flex items-center gap-2 hover:text-green-600">Sugar Cane</a>
          <a href="/ManageAccount" className="flex items-center gap-2 hover:text-green-600">Rice</a>
          <a href="/SuperAdminManageCrop" className="flex items-center gap-2 text-green-700 font-bold">Corn</a>
        </nav>
      </aside>

      <main className="ml-[400px] pt-[100px] pr-8 flex-grow">
        <div className="mb-6 ml-[160px]">
          <h2 className="text-3xl font-bold text-green-700">Crop Management Panel</h2>
          <p className="text-gray-600">View, edit, or delete crop data tagged by field officers.</p>
        </div>

        <div className="flex flex-col gap-6">
          {crops.length > 0 ? crops.map((crop) => (
            <div key={crop.id} className="w-full max-w-3xl relative mx-auto mr-[560px]">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setActiveActionId(activeActionId === crop.id ? null : crop.id)}
                  className="text-gray-600 hover:text-black text-xl"
                >⋯</button>
                {activeActionId === crop.id && (
                  <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-xl z-50">
                    <button onClick={() => { handleEdit(crop); setActiveActionId(null); }}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100">Edit</button>
                    <button onClick={() => { handleDelete(crop.id); setActiveActionId(null); }}
                      className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-green-700 mb-2">{crop.crop_name}</h3>
              <p className="text-sm text-gray-700 mb-1">Variety: {crop.variety}</p>
              <p className="text-sm text-gray-700 mb-1">Planted: {formatDate(crop.planted_date)}</p>
              <p className="text-sm text-gray-700 mb-1">Harvest: {formatDate(crop.estimated_harvest)}</p>
              <p className="text-sm text-gray-700 mb-1">Volume: {crop.estimated_volume}</p>
              <p className="text-sm text-gray-700 mb-1">Hectares: {crop.estimated_hectares}</p>
              <div className="mt-4 text-sm italic text-gray-600 border-t pt-3">{crop.note || "No description provided."}</div>
              <div className="mt-2 text-xs text-gray-500">Tagged by: {crop.first_name && crop.last_name ? `${crop.first_name} ${crop.last_name}` : "N/A"}</div>
            </div>
          )) : (
            <p className="text-center text-gray-500">No crop records found.</p>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-green-700 mb-6">Edit Crop Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="crop_type_id"
                value={editForm.crop_type_id}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded"
              >
                <option value="">-- Select Crop Type --</option>
                {cropTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>

              <input
                name="variety"
                value={editForm.variety}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded"
              />

              <input
                type="date"
                name="planted_date"
                value={editForm.planted_date?.split("T")[0] || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded"
              />

              <input
                type="date"
                name="estimated_harvest"
                value={editForm.estimated_harvest?.split("T")[0] || ""}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded"
              />

              <input
                name="estimated_volume"
                value={editForm.estimated_volume}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded"
              />

              <input
                name="estimated_hectares"
                value={editForm.estimated_hectares}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded"
              />

              <textarea
                name="note"
                value={editForm.note}
                onChange={handleEditChange}
                className="border px-3 py-2 rounded md:col-span-2"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setEditingCrop(null)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Update</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SuperManageCrop;
