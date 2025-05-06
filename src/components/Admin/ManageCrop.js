import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import AdminNav from "../NavBar/AdminNavbar";
import Footer from "../LandingPage/Footer";

const ManageCrop = () => {
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeActionId, setActiveActionId] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchCrops();
  }, []);

  const fetchCrops = () => {
    axios.get("http://localhost:5000/api/managecrops")
      .then((response) => {
        setCrops(response.data);
      })
      .catch((error) => {
        console.error("Error fetching crops:", error);
      });
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
    setEditForm({ ...crop });
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
    <div className="flex flex-col min-h-screen bg-white-100 font-poppins">
      <AdminNav />
      <div className="flex-grow container mx-auto p-6 mt-20 bg-white mb-7">
        <h2 className="text-3xl font-bold text-green-600 mb-6 text-center">Manage Crops</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-2">Crop</th>
                <th className="px-4 py-2">Variety</th>
                <th className="px-4 py-2">Planted Date</th>
                <th className="px-4 py-2">Harvest Date</th>
                <th className="px-4 py-2">Volume</th>
                <th className="px-4 py-2">Hectares</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop.id} className="text-center border-t">
                  <td className="px-4 py-2">{crop.crop}</td>
                  <td className="px-4 py-2">{crop.variety}</td>
                  <td className="px-4 py-2">{formatDate(crop.planted_date)}</td>
                  <td className="px-4 py-2">{formatDate(crop.estimated_harvest)}</td>
                  <td className="px-4 py-2">{crop.estimated_volume}</td>
                  <td className="px-4 py-2">{crop.estimated_hectares}</td>
                  <td className="px-4 py-2">{crop.note}</td>
                  <td className="px-4 py-2 relative">
  <div className="flex justify-center">
    <button
      onClick={() => setActiveActionId(activeActionId === crop.id ? null : crop.id)}
      className="text-gray-700 hover:text-black text-xl font-bold"
    >
      ⋯
    </button>
    {activeActionId === crop.id && (
      <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg flex gap-2 px-4 py-2 z-20">
        <button
          onClick={() => {
            handleEdit(crop);
            setActiveActionId(null);
          }}
          className="text-sm text-gray-700 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => {
            handleDelete(crop.id);
            setActiveActionId(null);
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    )}
  </div>
</td>

                </tr>
              ))}
              {crops.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">No crop records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Edit Crop</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="crop" value={editForm.crop} onChange={handleEditChange} className="border px-3 py-2 rounded" />
              <input name="variety" value={editForm.variety} onChange={handleEditChange} className="border px-3 py-2 rounded" />
              <input type="date" name="planted_date" value={editForm.planted_date?.split('T')[0]} onChange={handleEditChange} className="border px-3 py-2 rounded" />
              <input type="date" name="estimated_harvest" value={editForm.estimated_harvest?.split('T')[0]} onChange={handleEditChange} className="border px-3 py-2 rounded" />
              <input name="estimated_volume" value={editForm.estimated_volume} onChange={handleEditChange} className="border px-3 py-2 rounded" />
              <input name="estimated_hectares" value={editForm.estimated_hectares} onChange={handleEditChange} className="border px-3 py-2 rounded" />
              <textarea name="note" value={editForm.note} onChange={handleEditChange} className="border px-3 py-2 rounded md:col-span-2" />
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

export default ManageCrop;