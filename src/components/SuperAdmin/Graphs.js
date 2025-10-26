// components/Graphs/Graph.js  (or wherever you keep it)
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import SuperAdminNav from "../NavBar/SuperAdminNav";
import Footer from "../LandingPage/Footer";

const API = "http://localhost:5000/api/graphs";

const COLORS = ["#10B981","#3B82F6","#F59E0B","#EF4444","#8B5CF6","#14B8A6","#F472B6","#22C55E"];
const fmt = (n, opts = {}) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, ...opts }).format(n);

export default function Graphs() {
  const [cities, setCities] = useState([]);
  const [barangaysByCity, setBarangaysByCity] = useState({ _all: [] });

  const [city, setCity] = useState("all");
  const [barangay, setBarangay] = useState("all");
  const [metric, setMetric] = useState("count"); // 'count' | 'area'
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [byType, setByType] = useState([]);         // [{ type, total }]
  const [trend, setTrend] = useState([]);           // [{ month, total }]
  const [summary, setSummary] = useState({ mostCommonType:"—", topBarangay:"—", largestAreaType:"—", largestAreaHa:0 });

  // load filters once
  useEffect(() => {
    axios.get(`${API}/filters`).then(({data}) => {
      setCities(["all", ...data.cities]);
      setBarangaysByCity(data.barangaysByCity || { _all: [] });
    });
  }, []);

  // (re)load series whenever filters/metric change
  useEffect(() => {
    setLoading(true);
    const params = { city, barangay };

    const p1 = axios.get(`${API}/total-incidents`, { params });
    const p2 = metric === "count"
      ? axios.get(`${API}/incident-type-counts`, { params })
      : axios.get(`${API}/incident-area-by-type`, { params });
    const p3 = axios.get(`${API}/incident-trend`, { params: { ...params, months: 12 } });
    const p4 = axios.get(`${API}/summary`, { params });

    Promise.all([p1, p2, p3, p4])
      .then(([r1, r2, r3, r4]) => {
        setTotal(r1.data?.total || 0);
        setByType((r2.data || []).map(row => ({
          name: row.type || "Unknown",
          value: metric === "count" ? Number(row.total) : Number(row.total)
        })));
        setTrend(r3.data || []);
        setSummary(r4.data || {});
      })
      .catch((e) => console.error("Graphs load error:", e))
      .finally(() => setLoading(false));
  }, [city, barangay, metric]);

  // dependent barangay options
  const barangayOptions = useMemo(() => {
    if (city === "all") return ["all", ...(barangaysByCity._all || [])];
    return ["all", ...((barangaysByCity[city] || []))];
  }, [city, barangaysByCity]);

  const valueLabel = metric === "area" ? "Hectares" : "Total";
  const suffix = metric === "area" ? " ha" : "";

  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <SuperAdminNav />

      <main className="pt-[100px]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header + toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-green-700">
                Calamities Overview
              </h1>
              <p className="text-gray-600">
                City/Barangay snapshot with distribution charts.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  className="border border-gray-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setBarangay("all"); }}
                >
                  {cities.map((c) => <option key={c} value={c}>{c === "all" ? "All" : c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <select
                  className="border border-gray-300 px-3 py-2 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                >
                  {barangayOptions.map((b) => <option key={b} value={b}>{b === "all" ? "All" : b}</option>)}
                </select>
              </div>

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
                  <h3 className="text-lg font-semibold text-gray-800">Total Incidents</h3>
                  <p className="mt-2 text-4xl font-bold text-gray-900">
                    {fmt(total, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {city === "all" ? "All cities" : city}{barangay !== "all" ? ` • ${barangay}` : ""}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-800">Incident Summary</h3>
              <ul className="text-sm text-gray-700 mt-3 space-y-1">
                <li><span className="font-medium text-green-700">Most Common Type:</span> {summary.mostCommonType || "—"}</li>
                <li><span className="font-medium text-pink-600">Top Barangay:</span> {summary.topBarangay || "—"}</li>
                <li>
                  <span className="font-medium text-lime-700">Largest Area Type:</span>{" "}
                  {summary.largestAreaType || "—"}{summary.largestAreaHa ? ` (${fmt(summary.largestAreaHa)} ha)` : ""}
                </li>
              </ul>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Incidents by Type (Bar)</h3>
              {loading ? (
                <ChartSkeleton />
              ) : byType.length === 0 ? (
                <EmptyChart message="No data for this filter." />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byType} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" tickMargin={8} />
                      <YAxis tickFormatter={(v) => fmt(v)} />
                      <Tooltip content={<NiceTooltip suffix={suffix} />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">Metric: {valueLabel}</div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Incidents by Type (Pie)</h3>
              {loading ? (
                <ChartSkeleton />
              ) : byType.length === 0 ? (
                <EmptyChart message="No data for this filter." />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byType}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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

          {/* Optional: Trend line/area chart could go here using `trend` */}
        </div>
      </main>

      <div className="mt-4">
        <Footer />
      </div>
    </div>
  );
}

/* ---------- small UI primitives ---------- */
function Card({ children }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">{children}</div>;
}
function EmptyChart({ message }) {
  return <div className="h-72 flex items-center justify-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">{message}</div>;
}
function ChartSkeleton() {
  return <div className="h-72 animate-pulse rounded-lg bg-gray-100" />;
}
function NiceTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      {label && <div className="text-sm font-medium text-gray-900">{label}</div>}
      <div className="text-sm text-gray-700">{fmt(val)}{suffix}</div>
    </div>
  );
}
