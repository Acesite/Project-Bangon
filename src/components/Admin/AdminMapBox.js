import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Import thumbnails and logo
import DefaultThumbnail from "../../components/MapboxImages/map-default.png";
import SatelliteThumbnail from "../../components/MapboxImages/map-satellite.png";
import DarkThumbnail from "../../components/MapboxImages/map-dark.png";
import LightThumbnail from "../../components/MapboxImages/map-light.png";
import AgriGISLogo from "../../components/MapboxImages/AgriGIS.png";

mapboxgl.accessToken =
  "pk.eyJ1Ijoid29tcHdvbXAtNjkiLCJhIjoiY204emxrOHkwMGJsZjJrcjZtZmN4YXdtNSJ9.LIMPvoBNtGuj4O36r3F72w";

const AdminMapbox = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [lng] = useState(122.961602);
  const [lat] = useState(10.507447);
  const [zoom] = useState(11);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d");
  const [showLayers, setShowLayers] = useState(false);

  const mapStyles = {
    "Default": {
      url: "mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d",
      thumbnail: DefaultThumbnail,
    },
    "Satellite": {
      url: "mapbox://styles/wompwomp-69/cm96vey9z009001ri48hs8j5n",
      thumbnail: SatelliteThumbnail,
    },
    "Dark": {
      url: "mapbox://styles/wompwomp-69/cm96veqvt009101szf7g42jps",
      thumbnail: DarkThumbnail,
    },
    "Light": {
      url: "mapbox://styles/wompwomp-69/cm976c2u700ab01rc0cns2pe0",
      thumbnail: LightThumbnail,
    },
  };

  useEffect(() => {
    const storedMarkers = localStorage.getItem("adminMarkers");
    if (storedMarkers) setMarkers(JSON.parse(storedMarkers));
  }, []);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [lng, lat],
        zoom: zoom,
      });
      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    } else {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  useEffect(() => {
    if (!map.current) return;
    markers.forEach((marker) => {
      new mapboxgl.Marker()
        .setLngLat([marker.lng, marker.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<h3>${marker.crop}</h3><p>${marker.notes}</p>`
          )
        )
        .addTo(map.current);
    });
  }, [markers]);

  const handleInputChange = (e) => {
    setSelectedLocation({
      ...selectedLocation,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedMarkers = [...markers, selectedLocation];
    setMarkers(updatedMarkers);
    localStorage.setItem("adminMarkers", JSON.stringify(updatedMarkers));

    new mapboxgl.Marker()
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<h3>${selectedLocation.crop}</h3><p>${selectedLocation.notes}</p>`
        )
      )
      .addTo(map.current);

    setSelectedLocation(null);
  };

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Sidebar Panel */}
      <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-20 p-6 overflow-y-auto border-r border-gray-200">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src={AgriGISLogo} alt="AgriGIS Logo" className="h-30  object-contain" />
        </div>

        {/* Section Title */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Location Information</h2>

        {/* Region */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Region</label>
          <input type="text" value="Western Visayas" readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" />
        </div>

        {/* Province */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Province</label>
          <input type="text" value="Negros Occidental" readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" />
        </div>

        {/* Municipality */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Municipality</label>
          <input type="text" value="Bago City" readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" />
        </div>

        {/* Barangay */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Barangay</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {[
              "Abuanan", "Alianza", "Atipuluan", "Bacong", "Bagroy", "Balingasag",
              "Binubuhan", "Busay", "Calumangan", "Caridad", "Dulao", "Ilijan",
              "Lag-asan", "Mailum", "Ma-ao", "Malingin", "Napoles", "Pacol",
              "Poblacion", "Sagasa", "Tabunan", "Taloc", "Talon", "Tinongan"
            ].map((brgy) => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
          </select>
        </div>

        {/* Crop Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Crop Suitability</label>
          {["Banana", "Cassava", "Corn", "Sugarcane", "Rice", "Vegetables"].map((crop) => (
            <div className="flex items-center mb-1" key={crop}>
              <input type="checkbox" id={crop} className="mr-5 accent-green-600" />
              <label htmlFor={crop} className="text-sm text-gray-700">{crop}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Map Style Switcher */}
      <div className="absolute top-5 right-5 z-30">
        <div className="relative">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="w-[70px] h-[70px] bg-cover bg-center border-2 border-white rounded-md shadow-md"
            style={{ backgroundImage: `url(${mapStyles["Default"].thumbnail})` }}
            title="Change Map Layer"
          >
            <div className="bg-black bg-opacity-50 text-white text-xs font-semibold absolute bottom-0 w-full text-center py-1">
              <span className="flex justify-center items-center gap-1">
                <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 4 9-4M3 17l9 4 9-4M3 12l9 4 9-4" />
                </svg>
                Layers
              </span>
            </div>
          </button>

          {showLayers && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg border z-50">
              {Object.entries(mapStyles).map(([label, styleData]) => (
                <button
                  key={label}
                  onClick={() => {
                    setMapStyle(styleData.url);
                    setShowLayers(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 text-sm"
                >
                  <img src={styleData.thumbnail} alt={label} className="w-10 h-10 rounded border" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marker Form Popup */}
      {selectedLocation && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-10 w-80">
          <h2 className="text-xl font-semibold mb-2">Add Marker Info</h2>
          <form onSubmit={handleSubmit}>
            <label className="block mb-1">Crop Type</label>
            <input
              name="crop"
              value={selectedLocation.crop || ""}
              onChange={handleInputChange}
              className="w-full border px-2 py-1 mb-2 rounded"
              required
            />

            <label className="block mb-1">Notes</label>
            <textarea
              name="notes"
              value={selectedLocation.notes || ""}
              onChange={handleInputChange}
              className="w-full border px-2 py-1 mb-2 rounded"
              rows={3}
              required
            />

            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Save</button>
              <button type="button" onClick={() => setSelectedLocation(null)} className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminMapbox;
