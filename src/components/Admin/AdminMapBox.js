// AdminMapBox.js
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import AdminSidebar from "./AdminSideBar";
import DefaultThumbnail from "../MapboxImages/map-default.png";
import SatelliteThumbnail from "../MapboxImages/map-satellite.png";
import DarkThumbnail from "../MapboxImages/map-dark.png";
import LightThumbnail from "../MapboxImages/map-light.png";
import TagCropForm from "./TagCropForm";
import SidebarToggleButton from "./MapControls/SidebarToggleButton";


mapboxgl.accessToken =
  "pk.eyJ1Ijoid29tcHdvbXAtNjkiLCJhIjoiY204emxrOHkwMGJsZjJrcjZtZmN4YXdtNSJ9.LIMPvoBNtGuj4O36r3F72w";

const AdminMapBox = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const directionsRef = useRef(null);
  const [lng] = useState(122.961602);
  const [lat] = useState(10.507447);
  const [zoom] = useState(13);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d");
  const [showLayers, setShowLayers] = useState(false);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isDirectionsVisible, setIsDirectionsVisible] = useState(true);

  const [newTagLocation, setNewTagLocation] = useState(null);
  const [isTagging, setIsTagging] = useState(false);
  const [taggedData, setTaggedData] = useState([]);

  const mapStyles = {
    Default: { url: "mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d", thumbnail: DefaultThumbnail },
    Satellite: { url: "mapbox://styles/wompwomp-69/cm96vey9z009001ri48hs8j5n", thumbnail: SatelliteThumbnail },
    Dark: { url: "mapbox://styles/wompwomp-69/cm96veqvt009101szf7g42jps", thumbnail: DarkThumbnail },
    Light: { url: "mapbox://styles/wompwomp-69/cm976c2u700ab01rc0cns2pe0", thumbnail: LightThumbnail },
  };

  const zoomToBarangay = (coordinates) => {
    if (map.current) {
      map.current.flyTo({ center: coordinates, zoom: 14, essential: true });
    }
  };

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

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="text-sm">
          <h3 class="font-bold text-green-600 text-base">${barangayData.name}</h3>
          <p><strong>Coordinates:</strong> ${barangayData.coordinates[1].toFixed(6)}, ${barangayData.coordinates[0].toFixed(6)}</p>
          ${barangayData.population ? `<p><strong>Population:</strong> ${barangayData.population}</p>` : ""}
          ${barangayData.crops ? `<p><strong>Crops:</strong> ${barangayData.crops.join(", ")}</p>` : ""}
        </div>
      `);

      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat(barangayData.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      markerRef.current.togglePopup();
    }
  };

  useEffect(() => {
    if (isTagging && directionsRef.current && map.current) {
      map.current.removeControl(directionsRef.current);
      directionsRef.current = null;
    }
  }, [isTagging]);
  
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      map.current.on("click", (e) => {
        setNewTagLocation(e.lngLat);
        setIsTagging(true);
      });

      if (isDirectionsVisible && !isTagging) {
        const directions = new MapboxDirections({
          accessToken: mapboxgl.accessToken,
          unit: "metric",
          profile: "mapbox/driving",
          controls: { inputs: true, instructions: true },
        });

        map.current.addControl(directions, "top-right");
        directionsRef.current = directions;
      }

      map.current.on("style.load", () => {
        if (selectedBarangay) {
          handleBarangaySelect(selectedBarangay);
        }
      });
    } else {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

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

  useEffect(() => {
    if (map.current) {
      taggedData.forEach((entry) => {
        const marker = new mapboxgl.Marker({ color: "#f59e0b" })
          .setLngLat(entry.coordinates)
          .addTo(map.current);
  
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 15,
        }).setHTML(`
          <div class="text-sm">
            <h3 class='font-bold text-green-600'>${entry.crop}</h3>
            <p><strong>Notes:</strong> ${entry.note || "None"}</p>
            <p><strong>Harvest Date:</strong> ${entry.estimatedHarvest || "N/A"}</p>
            <p><strong>Volume:</strong> ${entry.estimatedVolume || "N/A"} sacks</p>
            <p><strong>Land Area:</strong> ${entry.estimatedHectares || "N/A"} ha</p>
          </div>
        `);
  
        marker.getElement().addEventListener("mouseenter", () => {
          popup.addTo(map.current).setLngLat(entry.coordinates);
        });
  
        marker.getElement().addEventListener("mouseleave", () => {
          popup.remove();
        });
      });
    }
  }, [taggedData]);
  

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Tagging Mode Banner */}
      {isTagging && (
        <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-2 rounded shadow-md z-50">
         Tagging Mode: Clicked location selected. Fill in crop details.
        </div>
      )}

      {/* Sidebar Toggle Button */}
      <SidebarToggleButton
  onClick={() => {
    setIsSidebarVisible(!isSidebarVisible);
    setIsSwitcherVisible(false);
  }}
/>
      {!isSidebarVisible && (
        <button
          onClick={() => {
            if (directionsRef.current) {
              map.current.removeControl(directionsRef.current);
              directionsRef.current = null;
            } else {
              const directions = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                unit: "metric",
                profile: "mapbox/driving",
                controls: { inputs: true, instructions: true },
              });
              map.current.addControl(directions, "top-right");
              directionsRef.current = directions;
            }
            setIsDirectionsVisible(!isDirectionsVisible);
          }}
          className="absolute top-4 left-16 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg z-50"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

{isTagging && (
  <TagCropForm
    defaultLocation={newTagLocation}
    onCancel={() => {
      setIsTagging(false);
      setNewTagLocation(null);
    }}
    onSave={(data) => {
      setTaggedData([...taggedData, data]);
      setIsTagging(false);
      setNewTagLocation(null);
    }}
  />
)}

      <div className={`absolute top-0 left-0 h-full w-80 transition-transform duration-500 ease-in-out z-40 ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}`}>
        <AdminSidebar
          mapStyles={mapStyles}
          setMapStyle={setMapStyle}
          showLayers={showLayers}
          setShowLayers={setShowLayers}
          zoomToBarangay={zoomToBarangay}
          onBarangaySelect={handleBarangaySelect}
          selectedBarangay={selectedBarangay}
        />
      </div>

      {!isSidebarVisible && (
        <>
          <button
            onClick={() => setIsSwitcherVisible(!isSwitcherVisible)}
            className="absolute bottom-6 left-4 w-20 h-20 rounded-xl shadow-md overflow-hidden z-30 bg-white border border-gray-300 hover:shadow-lg transition"
          >
            <div className="w-full h-full relative">
              <img src={DefaultThumbnail} alt="Layers" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 text-white text-xs font-semibold px-2 py-1 bg-black/60 text-center">
                Layers
              </div>
            </div>
          </button>

          {isSwitcherVisible && (
            <div className="absolute bottom-28 left-4 bg-white p-2 rounded-xl shadow-xl flex space-x-2 z-30 transition-all duration-300">
              {Object.entries(mapStyles).map(([label, { url, thumbnail }]) => (
                <button
                  key={label}
                  onClick={() => {
                    setMapStyle(url);
                    setIsSwitcherVisible(false);
                  }}
                  className="w-16 h-16 rounded-md border border-gray-300 overflow-hidden relative hover:shadow-md"
                >
                  <img src={thumbnail} alt={label} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 w-full text-[10px] text-white text-center bg-black bg-opacity-60 py-[2px]">
                    {label}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminMapBox;