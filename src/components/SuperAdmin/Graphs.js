import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import SuperAdminNav from "../NavBar/SuperAdminNav";
import Footer from "../LandingPage/Footer";

// Optional: color palette for pie slices
const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];

const Graphs = () => {
  const [cropData, setCropData] = useState([]);
  const [totalCrops, setTotalCrops] = useState(0);
  const [selectedBarangay, setSelectedBarangay] = useState("all");
  const [allCrops, setAllCrops] = useState([]);


  const getTopStats = () => {
  if (!allCrops.length) return { mostPlanted: "-", topBarangay: "-", largestAreaCrop: "-" };

  const cropCountMap = {};
  const barangayCountMap = {};
  const areaMap = {};

  for (const crop of allCrops) {
    const cropName = crop.crop_name || "Unknown";
    const barangay = crop.barangay || "Unknown";
    const area = parseFloat(crop.estimated_hectares || 0);

    cropCountMap[cropName] = (cropCountMap[cropName] || 0) + 1;
    barangayCountMap[barangay] = (barangayCountMap[barangay] || 0) + 1;
    areaMap[cropName] = (areaMap[cropName] || 0) + area;
  }

  const mostPlanted = Object.entries(cropCountMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const topBarangay = Object.entries(barangayCountMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const [largestAreaCrop, area] = Object.entries(areaMap).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

  return {
    mostPlanted,
    topBarangay,
    largestAreaCrop: `${largestAreaCrop} (${area.toFixed(1)} ha)`
  };
};

const { mostPlanted, topBarangay, largestAreaCrop } = getTopStats();


useEffect(() => {
  const fetchGraphData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/graphs/crop-type-counts`, {
        params: { barangay: selectedBarangay }
      });
      setCropData(res.data);
    } catch (err) {
      console.error("Error fetching graph data:", err);
    }
  };

  fetchGraphData();
}, [selectedBarangay]); // refetch when barangay changes

useEffect(() => {
  const fetchTotal = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/graphs/total-crops`, {
        params: { barangay: selectedBarangay }
      });
      setTotalCrops(res.data.total);
    } catch (err) {
      console.error("Error fetching total crops:", err);
    }
  };

  fetchTotal();
}, [selectedBarangay]);

useEffect(() => {
  axios.get("http://localhost:5000/api/managecrops")
    .then((res) => setAllCrops(res.data))
    .catch((err) => console.error("Failed to fetch all crops:", err));
}, []);

  return (
    <div className="flex flex-col min-h-screen font-poppins bg-white">
      <SuperAdminNav />

  <div className="px-10 pb-0 mt-[120px] flex justify-center gap-6 flex-wrap">

 <div className=" text-gray-700 rounded-xl shadow p-6 w-full max-w-md flex flex-col gap-4">
  <div>
    <h3 className="text-lg font-semibold">Total Crops Planted</h3>
    <p className="text-3xl font-bold mt-2">{totalCrops.toLocaleString()}</p>
    <p className="text-sm text-gray-600">as recorded in Bago City</p>
  </div>

  {/* 👇 Filter added here */}
  <div className="flex gap-2 items-center">
    <label className="text-sm font-semibold text-gray-800">Filter by Barangay:</label>
    <select
      className="border px-3 py-1 rounded text-sm"
      value={selectedBarangay}
      onChange={(e) => setSelectedBarangay(e.target.value)}
    >
      <option value="all">All</option>
      {["Abuanan", "Alianza", "Atipuluan", "Bacong", "Bagroy", "Balingasag", "Binubuhan",
        "Busay", "Calumangan", "Caridad", "Dulao", "Ilijan", "Lag-asan", "Mailum",
        "Ma-ao", "Malingin", "Napoles", "Pacol", "Poblacion", "Sagasa", "Tabunan", "Taloc"
      ].map(bgy => (
        <option key={bgy} value={bgy}>{bgy}</option>
      ))}
    </select>
  </div>
</div>

  {/* Crop Summary Box (RIGHT SIDE) */}
 <div className=" text-green-900 rounded-xl ml-[250px] shadow p-6 w-full max-w-md">
    <h3 className="text-md font-semibold text-gray-700 mb-2">Crop Summary</h3>
    <ul className="text-sm text-gray-600 space-y-1">
      <li><span className="font-medium text-green-700">Most Planted Crop:</span> {mostPlanted}</li>
      <li><span className="font-medium text-pink-600"> Top Barangay:</span> {topBarangay}</li>
      <li><span className="font-medium text-lime-700">Largest Area Crop:</span> {largestAreaCrop}</li>
    </ul>
  </div>
</div>

      <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white shadow rounded p-4 w-full max-w-[500px] ml-[140px] mx-auto">
  <h2 className="text-lg font-semibold text-gray-700 mb-3">
    Crop Type Distribution (Bar)
  </h2>
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={cropData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="crop_type" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="total" fill="#10B981" />
    </BarChart>
  </ResponsiveContainer>
</div>



        {/* Pie Chart */}
       <div className="bg-white shadow rounded p-4 w-full mr-[130px] max-w-[500px] mx-auto">
  <h2 className="text-lg font-semibold text-gray-700 mb-3">Crop Type Distribution (Pie)</h2>
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={cropData}
        dataKey="total"
        nameKey="crop_type"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
      >
        {cropData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  </ResponsiveContainer>
</div>

      </div>

      <Footer />
    </div>
  );
};

export default Graphs;
