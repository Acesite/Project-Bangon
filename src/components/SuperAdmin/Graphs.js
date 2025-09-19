import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, Label as RLabel
} from "recharts";
import SuperAdminNav from "../NavBar/SuperAdminNav";
import Footer from "../LandingPage/Footer";

// Consistent colors by crop name
const COLOR_BY_CROP = {
  Rice: "#F59E0B",
  Corn: "#FB923C",
  Banana: "#10B981",
  Sugarcane: "#34D399",
  Cassava: "#3B82F6",
  Vegetables: "#F472B6",
};
const FALLBACK_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];

const fmt = (n, opts = {}) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, ...opts }).format(n);

export default function Graphs() {
  const [allCrops, setAllCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarangay, setSelectedBarangay] = useState("all");
  const [metric, setMetric] = useState("count"); // 'count' | 'area'

  // fetch everything once; compute views client-side
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/managecrops")
      .then((res) => setAllCrops(res.data || []))
      .catch((err) => console.error("Failed to fetch crops:", err))
      .finally(() => setLoading(false));
  }, []);

  // list of barangays for the filter
  const barangays = useMemo(() => {
    const set = new Set(allCrops.map((c) => c.barangay).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allCrops]);

  // filtered data by barangay
  const filtered = useMemo(() => {
    if (selectedBarangay === "all") return allCrops;
    return allCrops.filter((c) => (c.barangay || "").toLowerCase() === selectedBarangay.toLowerCase());
  }, [allCrops, selectedBarangay]);

  // totals and summary
  const totalCrops = filtered.length;

  const { mostPlanted, topBarangay, largestAreaCrop } = useMemo(() => {
    if (!filtered.length) return { mostPlanted: "—", topBarangay: "—", largestAreaCrop: "—" };

    const cropCount = {};
    const barangayCount = {};
    const cropArea = {};

    for (const c of filtered) {
      const cn = c.crop_name || "Unknown";
      const bg = c.barangay || "Unknown";
      const area = parseFloat(c.estimated_hectares || 0) || 0;

      cropCount[cn] = (cropCount[cn] || 0) + 1;
      barangayCount[bg] = (barangayCount[bg] || 0) + 1;
      cropArea[cn] = (cropArea[cn] || 0) + area;
    }

    const mostPlanted = Object.entries(cropCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const topBarangay = Object.entries(barangayCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const [largestName, largestArea] = Object.entries(cropArea).sort((a, b) => b[1] - a[1])[0] || ["—", 0];

    return { mostPlanted, topBarangay, largestAreaCrop: `${largestName} (${fmt(largestArea)} ha)` };
  }, [filtered]);

  // chart data (by crop name)
  const chartData = useMemo(() => {
    const map = new Map();
    for (const c of filtered) {
      const key = c.crop_name || "Unknown";
      const val = metric === "area" ? (parseFloat(c.estimated_hectares || 0) || 0) : 1;
      map.set(key, (map.get(key) || 0) + val);
    }
    return Array.from(map.entries())
      .map(([crop_type, total]) => ({ crop_type, total }))
      .sort((a, b) => b.total - a.total);
  }, [filtered, metric]);

  // helpers
  const valueLabel = metric === "area" ? "Hectares" : "Total";
  const suffix = metric === "area" ? " ha" : "";

  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <SuperAdminNav />

      {/* Page container */}
      <main className="pt-[100px]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header + toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-green-700">
                Crops Overview
              </h1>
              <p className="text-gray-600">
                City-wide snapshot with simple filters and distribution charts.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              {/* Barangay filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Barangay
                </label>
                <select
                  className="border border-gray-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                >
                  {barangays.map((bg) => (
                    <option key={bg} value={bg}>{bg === "all" ? "All" : bg}</option>
                  ))}
                </select>
              </div>

              {/* Metric toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setMetric("count")}
                    className={`px-3 py-2 text-sm ${metric === "count" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                  >
                    Count
                  </button>
                  <button
                    onClick={() => setMetric("area")}
                    className={`px-3 py-2 text-sm ${metric === "area" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                  >
                    Area (ha)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Crops Planted</h3>
                  <p className="mt-2 text-4xl font-bold text-gray-900">{fmt(totalCrops, { maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBarangay === "all" ? "All barangays" : selectedBarangay}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-800">Crop Summary</h3>
              <ul className="text-sm text-gray-700 mt-3 space-y-1">
                <li><span className="font-medium text-green-700">Most Planted:</span> {mostPlanted}</li>
                <li><span className="font-medium text-pink-600">Top Barangay:</span> {topBarangay}</li>
                <li><span className="font-medium text-lime-700">Largest Area Crop:</span> {largestAreaCrop}</li>
              </ul>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Crop Type Distribution (Bar)
              </h3>

              {loading ? (
                <ChartSkeleton />
              ) : chartData.length === 0 ? (
                <EmptyChart message="No data for this filter." />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="crop_type" tickMargin={8} />
                      <YAxis tickFormatter={(v) => fmt(v)} />
                      <Tooltip content={<NiceTooltip suffix={suffix} />} />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={COLOR_BY_CROP[d.crop_type] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                          />
                        ))}
                      </Bar>
                      <RLabel position="insideBottom" offset={-2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">Metric: {valueLabel}</div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Crop Type Distribution (Pie)
              </h3>

              {loading ? (
                <ChartSkeleton />
              ) : chartData.length === 0 ? (
                <EmptyChart message="No data for this filter." />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="total"
                        nameKey="crop_type"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={COLOR_BY_CROP[d.crop_type] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<NiceTooltip suffix={suffix} />} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">Metric: {valueLabel}</div>
            </Card>
          </div>
        </div>
      </main>
<div className="mt-4">
   <Footer />
</div>
      
    </div>
  );
}

/* ---------- Small UI primitives ---------- */
function Card({ children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-72 flex items-center justify-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
      {message}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
  );
}

function NiceTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-sm text-gray-700">{fmt(val)}{suffix}</div>
    </div>
  );
}
