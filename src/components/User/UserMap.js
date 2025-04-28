import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

// Import components
import Sidebar from "../User/UserSideBar";

// Import thumbnails
import DefaultThumbnail from "../MapboxImages/map-default.png";
import SatelliteThumbnail from "../MapboxImages/map-satellite.png";
import DarkThumbnail from "../MapboxImages/map-dark.png";
import LightThumbnail from "../MapboxImages/map-light.png";

mapboxgl.accessToken =  "pk.eyJ1Ijoid29tcHdvbXAtNjkiLCJhIjoiY204emxrOHkwMGJsZjJrcjZtZmN4YXdtNSJ9.LIMPvoBNtGuj4O36r3F72w"; // Replace with your token

const UserMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const directionsRef = useRef(null);

  const [lng] = useState(122.961602);
  const [lat] = useState(10.507447);
  const [zoom] = useState(13);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d"
  );
  const [showLayers, setShowLayers] = useState(false);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);

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

  // Zoom to selected barangay
  const zoomToBarangay = (barangayCoordinates) => {
    if (map.current) {
      map.current.flyTo({
        center: barangayCoordinates,
        zoom: 14,
        essential: true,
      });
    }
  };

  // Handle barangay selection (add marker)
  const handleBarangaySelect = (barangayData) => {
    setSelectedBarangay(barangayData);
    if (markerRef.current) markerRef.current.remove();

    if (map.current && barangayData) {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#10B981";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h3 class="font-bold text-green-600">${barangayData.name}</h3>
         <p class="text-sm">Coordinates: ${barangayData.coordinates[1].toFixed(6)}, ${barangayData.coordinates[0].toFixed(6)}</p>`
      );

      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat(barangayData.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      markerRef.current.togglePopup();
    }
  };

  // Initialize map and directions
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [lng, lat],
        zoom: zoom,
      });
  
      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
  
      // Initialize Directions
      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/driving",
        controls: { inputs: true, instructions: true },
      });
      map.current.addControl(directions, "top-left");
      directionsRef.current = directions;
  
      // Auto-set route when barangay is selected
      directions.on("route", (e) => {
        console.log("Route loaded:", e.route);
      });
  
      // Re-add marker on style change
      map.current.on("style.load", () => {
        if (selectedBarangay) {
          handleBarangaySelect(selectedBarangay);
        }
      });
    } else {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);
  
  // Custom popup styling
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .mapboxgl-popup-content {
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      }
      .mapboxgl-ctrl-directions {
        width: 300px;
        max-width: 90vw;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Sidebar */}
      <Sidebar
        mapStyles={mapStyles}
        setMapStyle={setMapStyle}
        showLayers={showLayers}
        setShowLayers={setShowLayers}
        zoomToBarangay={zoomToBarangay}
        onBarangaySelect={handleBarangaySelect}
      />

      {/* Map Style Switcher Toggle */}
      <button
        onClick={() => setIsSwitcherVisible(!isSwitcherVisible)}
        className="absolute top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-10"
      >
        {isSwitcherVisible ? "Hide Map Styles" : "Show Map Styles"}
      </button>

      {/* Map Style Switcher Panel */}
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
    </div>
  );
};

export default UserMap;