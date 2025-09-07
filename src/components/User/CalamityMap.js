
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CalamitySidebar from "./CalamitySideBar";
import DefaultThumbnail from "../MapboxImages/map-default.png";
import SatelliteThumbnail from "../MapboxImages/map-satellite.png";
import DarkThumbnail from "../MapboxImages/map-dark.png";
import LightThumbnail from "../MapboxImages/map-light.png";
import SidebarToggleButton from "./MapControls/SidebarToggleButton";
// import TagCropForm from "./TagCropForm";

mapboxgl.accessToken = "pk.eyJ1Ijoid29tcHdvbXAtNjkiLCJhIjoiY204emxrOHkwMGJsZjJrcjZtZmN4YXdtNSJ9.LIMPvoBNtGuj4O36r3F72w";

const Calamity = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const directionsRef = useRef(null);
  const drawRef = useRef(null);
  const [lng] = useState(122.961602);
  const [lat] = useState(10.507447);
  const [zoom] = useState(13);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d");
  const [showLayers, setShowLayers] = useState(false);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isDirectionsVisible, setIsDirectionsVisible] = useState(false);  
  const [newTagLocation, setNewTagLocation] = useState(null);
  const [isTagging, setIsTagging] = useState(false);
  const [taggedData, setTaggedData] = useState([]);
  const [sidebarCrops, setSidebarCrops] = useState([]); 
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedCropType, setSelectedCropType] = useState("All");
  const [cropTypes, setCropTypes] = useState([]);
  const [areMarkersVisible, setAreMarkersVisible] = useState(true);
  const savedMarkersRef = useRef([]); // store markers so we can remove them later
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

// Bounding box for Bago City
const bagoCityBounds = [
  [122.7333, 10.4958],
  [123.5000, 10.6333]
];


const cropColorMap = {
  Rice: "#facc15",        // Yellow
  Corn: "#fb923c",        // Orange
  Banana: "#a3e635",      // Lime Green
  Sugarcane: "#34d399",   // Teal
  Cassava: "#60a5fa",     // Blue
  Vegetables: "#f472b6"   // Pink
};

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

      markerRef.current = new mapboxgl.Marker(el).setLngLat(barangayData.coordinates).setPopup(popup).addTo(map.current);
      markerRef.current.togglePopup();
    }
  };

  const renderSavedMarkers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/crops");
      const crops = response.data;
      setSidebarCrops(crops);
  
     
      savedMarkersRef.current.forEach((marker) => marker.remove());
      savedMarkersRef.current = [];
  
      const filtered = selectedCropType === "All"
        ? crops
        : crops.filter(crop => crop.crop_name === selectedCropType);
        if (filtered.length === 0) {
          toast.info("No Crops Found .", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            theme: "light",
          });
          return;
        }
         
      if (filtered.length === 0) return;
  
      filtered.forEach((crop) => {
        let coords = crop.coordinates;
        if (typeof coords === "string") {
          try {
            coords = JSON.parse(coords);
          } catch (err) {
            console.error("Invalid coordinates format:", crop.coordinates);
            return;
          }
        }
  
        if (Array.isArray(coords) && coords.length > 2) {
          const first = coords[0];
          const last = coords[coords.length - 1];
          if (JSON.stringify(first) !== JSON.stringify(last)) coords.push(first);
  
          const center = turf.centerOfMass(turf.polygon([coords])).geometry.coordinates;
  
          const marker = new mapboxgl.Marker({ color: "#10B981" })
            .setLngLat(center)
            .setPopup(
              new mapboxgl.Popup({ offset: 15 }).setHTML(`
                <div class="text-sm">
                  <h3 class='font-bold text-green-600'>${crop.crop_name}</h3>
                  <p><strong>Variety:</strong> ${crop.variety_name || "N/A"}</p>
                </div>
              `)
            )
            .addTo(map.current);
  
          marker.getElement().addEventListener("click", () => {
            setSelectedCrop(crop);
            setIsSidebarVisible(true);
          });
  
          savedMarkersRef.current.push(marker);
        }
      });
    } catch (error) {
      console.error("Failed to load saved markers:", error);
    }
  };
  

  
  const loadPolygons = async (geojsonData = null, isFiltered = false) => {
    const res = await axios.get("http://localhost:5000/api/crops/polygons");
    const fullData = geojsonData || res.data;
  
    const paintStyle = isFiltered
      ? {
          "fill-color": [
            "match",
            ["get", "crop_name"],
            "Rice", "#facc15",
            "Corn", "#fb923c",
            "Banana", "#a3e635",
            "Sugarcane", "#34d399",
            "Cassava", "#60a5fa",
            "Vegetables", "#f472b6",
            "#10B981" // fallback
          ],
          "fill-opacity": 0.4,
        }
      : {
          "fill-color": "#10B981", // 🔰 all green initially
          "fill-opacity": 0.4,
        };
  
    if (map.current.getSource("crop-polygons")) {
      map.current.getSource("crop-polygons").setData(fullData);
      map.current.setPaintProperty("crop-polygons-layer", "fill-color", paintStyle["fill-color"]);
    } else {
      map.current.addSource("crop-polygons", {
        type: "geojson",
        data: fullData,
      });
  
      map.current.addLayer({
        id: "crop-polygons-layer",
        type: "fill",
        source: "crop-polygons",
        paint: paintStyle,
      });
  
      map.current.addLayer({
        id: "crop-polygons-outline",
        type: "line",
        source: "crop-polygons",
        paint: {
          "line-color": "#065F46",
          "line-width": 2,
        },
      });
    }
  };
  
  
  useEffect(() => {
    if (!map.current) {
  map.current = new mapboxgl.Map({
  container: mapContainer.current,
  style: mapStyle,
  center: [122.9616, 10.5074], // Center point inside Bago City
  zoom: 7,
  maxBounds: bagoCityBounds
});


      axios.get("http://localhost:5000/api/crops/types").then((res) => {
  setCropTypes(res.data);
});


      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
      });
      map.current.addControl(drawRef.current, "bottom-right");

      map.current.on("load", async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/crops/polygons");
          const geojson = res.data;
      
          // Add or update GeoJSON source
          if (map.current.getSource("crop-polygons")) {
            map.current.getSource("crop-polygons").setData(geojson);
          } else {
            map.current.addSource("crop-polygons", {
              type: "geojson",
              data: geojson,
            });
      
            map.current.addLayer({
              id: "crop-polygons-layer",
              type: "fill",
              source: "crop-polygons",
              paint: {
                "fill-color": "#10B981",
                "fill-opacity": 0.4,
              },
            });
      
            map.current.addLayer({
              id: "crop-polygons-outline",
              type: "line",
              source: "crop-polygons",
              paint: {
                "line-color": "#065F46",
                "line-width": 2,
              },
            });
          }
        } catch (err) {
          console.error(" Failed to load polygons:", err);
        }
      
        await renderSavedMarkers();
      });

      map.current.on("click", "crop-polygons-layer", (e) => {
        const feature = e.features[0];
        const cropId = feature.properties?.id;
      
        if (!cropId) return;
      
        const cropData = sidebarCrops.find((c) => c.id === cropId);
        if (cropData) {
          setSelectedCrop(cropData); 
          
        }
      });
      
      map.current.on("draw.create", (e) => {
        const feature = e.features[0];
        if (feature.geometry.type === "Polygon") {
          const coordinates = feature.geometry.coordinates[0];
          const area = turf.area(feature);
          const hectares = +(area / 10000).toFixed(2);

          setNewTagLocation({ coordinates, hectares });
          setIsTagging(true);
        }
      });
    } else {
      map.current.setStyle(mapStyle);
    
      map.current.once("style.load", async () => {
        await loadPolygons();
        await renderSavedMarkers();
      });
    }
    
  }, [mapStyle]);

  useEffect(() => {
  if (map.current) {
    taggedData.forEach((entry) => {
      const center = turf.centerOfMass(turf.polygon([entry.coordinates])).geometry.coordinates;

      new mapboxgl.Marker({ color: "#f59e0b" })
        .setLngLat(center)
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div class="text-sm">
              <h3 class='font-bold text-green-600'>${entry.crop_name}</h3>
              <p><strong>Variety:</strong> ${entry.variety || "N/A"}</p>            
            </div>
          `)
        )
        .addTo(map.current);
    });
  }
}, [taggedData]);

useEffect(() => {
  if (map.current) {
    renderSavedMarkers();
  }
}, [selectedCropType]);


  useEffect(() => {
    const filterPolygonsByCrop = async () => {
      const res = await axios.get("http://localhost:5000/api/crops/polygons");
      const geojson = res.data;
  
      if (selectedCropType === "All") {
        await loadPolygons(geojson, true); 
      } else {
        const filtered = {
          ...geojson,
          features: geojson.features.filter(
            (feature) => feature.properties.crop_name === selectedCropType
          ),
        };
        await loadPolygons(filtered, true); // show filtered with color
      }
    };
  
    if (map.current?.getSource("crop-polygons")) {
      filterPolygonsByCrop();
    }
  }, [selectedCropType]);

  useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setEnlargedImage(null);
    }
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);


  return (
    <div className="relative h-screen w-screen">
     

      <div ref={mapContainer} className="h-full w-full" />

      {/* {isTagging && newTagLocation && (
        <TagCropForm
        defaultLocation={{ ...newTagLocation, hectares: newTagLocation.hectares }}
        selectedBarangay={selectedBarangay?.name}  // 👈 Pass name of selected barangay
        onCancel={() => {
          setIsTagging(false);
          setNewTagLocation(null);
          drawRef.current?.deleteAll();
        }}
        onSave={async (formData) => {
          try {
            const adminId = localStorage.getItem("user_id"); // ✅ Get admin ID from storage
        
            formData.append("admin_id", adminId); // ✅ Attach admin ID
        
            await axios.post("http://localhost:5000/api/crops", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
        
            alert("Crop saved!");
            await loadPolygons();
            await renderSavedMarkers();
          } catch (error) {
            console.error("Error saving crop:", error);
            alert("Failed to save crop.");
          }
        
          setIsTagging(false);
          setNewTagLocation(null);
          drawRef.current?.deleteAll();
        }}
        
      />
      
      )} */}

<div
  style={{
    position: "absolute",
    left: isSidebarVisible ? "480px" : "0px", // Adjust based on sidebar width
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
  }}
>
  <SidebarToggleButton
    onClick={() => setIsSidebarVisible(!isSidebarVisible)}
    isSidebarVisible={isSidebarVisible}
  />
</div>


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
    {!isTagging && (
<button
  onClick={() => {
    if (areMarkersVisible) {
      savedMarkersRef.current.forEach(marker => marker.remove());
    } else {
      renderSavedMarkers();
    }
    setAreMarkersVisible(!areMarkersVisible);
  }}
  className="absolute bottom-[194px] right-[9px] z-50 bg-white border border-gray-300 rounded-[5px] w-8 h-8 flex items-center justify-center shadow-[0_0_8px_2px_rgba(0,0,0,0.15)] "
  title={areMarkersVisible ? "Hide Markers" : "Show Markers"}
>
  <svg
    className="w-5 h-5 text-black"
    fill={!areMarkersVisible ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21s6-5.686 6-10a6 6 0 10-12 0c0 4.314 6 10 6 10z"
    />
    <circle cx="12" cy="11" r="2" fill="white" />
  </svg>
</button>
)}
      <div
  className={`absolute top-0 left-0 h-full z-40 bg-white border-r border-gray-200 transition-all duration-200 ease-in-out overflow-hidden ${
    isSidebarVisible ? "w-[500px] px-6 py-8" : "w-0 px-0 py-0"
  }`}
>
  {isSidebarVisible && (
    <CalamitySidebar
      mapStyles={mapStyles}
      setMapStyle={setMapStyle}
      showLayers={showLayers}
      setShowLayers={setShowLayers}
      zoomToBarangay={zoomToBarangay}
      onBarangaySelect={handleBarangaySelect}
      selectedBarangay={selectedBarangay}
      cropTypes={cropTypes}
      selectedCropType={selectedCropType}
      setSelectedCropType={setSelectedCropType}
      crops={sidebarCrops}
      selectedCrop={selectedCrop}
      setEnlargedImage={setEnlargedImage}
      visible={isSidebarVisible}
    />
  )}
</div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }} 
        />

       {enlargedImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex justify-center items-center animate-fadeIn"
    onClick={() => setEnlargedImage(null)}
  >
    {/* Close X Button */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // prevent background click from triggering close
        setEnlargedImage(null);
      }}
      className="absolute top-4 right-4 text-white text-2xl font-bold z-[10000] hover:text-red-400"
      title="Close"
    >
      ×
    </button>

    <img
      src={enlargedImage}
      alt="Fullscreen Crop"
      className="max-w-full max-h-full object-contain"
    />
  </div>
)}


    </div>  
  );
};

export default Calamity;
