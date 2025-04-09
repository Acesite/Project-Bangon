import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Import components
import Sidebar from "../User/UserSideBar"; // Import the new Sidebar component

// Import thumbnails
import DefaultThumbnail from "../MapboxImages/map-default.png";
import SatelliteThumbnail from "../MapboxImages/map-satellite.png";
import DarkThumbnail from "../MapboxImages/map-dark.png";
import LightThumbnail from "../MapboxImages/map-light.png";

mapboxgl.accessToken =
  "pk.eyJ1Ijoid29tcHdvbXAtNjkiLCJhIjoiY204emxrOHkwMGJsZjJrcjZtZmN4YXdtNSJ9.LIMPvoBNtGuj4O36r3F72w";

const UserMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [lng] = useState(122.961602);
  const [lat] = useState(10.507447);
  const [zoom] = useState(11);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d");
  const [showLayers, setShowLayers] = useState(false);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false); // New state for toggling visibility

  const mapStyles = {
    Default: {
      url: "mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d",
      thumbnail: DefaultThumbnail,
    },
    Satellite: {
      url: "mapbox://styles/wompwomp-69/cm96vey9z009001ri48hs8j5n",
      thumbnail: SatelliteThumbnail,
    },
    Dark: {
      url: "mapbox://styles/wompwomp-69/cm96veqvt009101szf7g42jps",
      thumbnail: DarkThumbnail,
    },
    Light: {
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
      <Sidebar
        mapStyles={mapStyles}
        setMapStyle={setMapStyle}
        showLayers={showLayers}
        setShowLayers={setShowLayers}
      />

      {/* Map Style Switcher Toggle Button */}
      <button
        onClick={() => setIsSwitcherVisible(!isSwitcherVisible)} // Toggle visibility
        className="absolute top-5 right-5 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-10"
      >
        {isSwitcherVisible ? "Hide Map Styles" : "Show Map Styles"}
      </button>

      {/* Map Style Switcher */}
      {isSwitcherVisible && (
        <div className="absolute top-16 right-5 bg-white p-2 rounded-lg shadow-lg z-10">
          <h3 className="font-semibold">Map Styles</h3>
          <div className="flex gap-4">
            {Object.keys(mapStyles).map((styleKey) => (
              <button
                key={styleKey}
                onClick={() => setMapStyle(mapStyles[styleKey].url)}
                className="p-2 border rounded-lg"
              >
                <img
                  src={mapStyles[styleKey].thumbnail}
                  alt={styleKey}
                  className="w-20 h-12 object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>
      )}

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

export default UserMap;
