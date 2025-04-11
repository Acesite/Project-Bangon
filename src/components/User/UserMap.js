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
  const markerRef = useRef(null);

  const [lng] = useState(122.961602);
  const [lat] = useState(10.507447);
  const [zoom] = useState(13);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d");
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

  const zoomToBarangay = (barangayCoordinates) => {
    if (map.current) {
      map.current.flyTo({
        center: barangayCoordinates,
        zoom: 14, // Set zoom level when zooming into the barangay
        essential: true, // This ensures the action is considered important for accessibility
      });
    }
  };

  const handleBarangaySelect = (barangayData) => {
    setSelectedBarangay(barangayData);
    
    // Remove previous marker if exists
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    // Add new marker at selected coordinates
    if (map.current && barangayData) {
      // Create a new marker
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#10B981'; // Green color matching the app theme
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      // Create popup for the marker
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3 class="font-bold text-green-600">${barangayData.name}</h3>
                 <p class="text-sm">Coordinates: ${barangayData.coordinates[1].toFixed(6)}, ${barangayData.coordinates[0].toFixed(6)}</p>`);
      
      // Add the marker to the map
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat(barangayData.coordinates)
        .setPopup(popup)
        .addTo(map.current);
        
      // Open the popup by default
      markerRef.current.togglePopup();
    }
  };

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
    
    // Preserve marker when style changes
    map.current.on('style.load', () => {
      if (selectedBarangay && markerRef.current) {
        // Re-add the marker after style change
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '18px';
        el.style.height = '18px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#10B981';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3 class="font-bold text-green-600">${selectedBarangay.name}</h3>
                   <p class="text-sm">Coordinates: ${selectedBarangay.coordinates[1].toFixed(6)}, ${selectedBarangay.coordinates[0].toFixed(6)}</p>`);
        
        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat(selectedBarangay.coordinates)
          .setPopup(popup)
          .addTo(map.current);
      }
    });
  }, [mapStyle, lng, lat, zoom, selectedBarangay]);

  // Add some CSS for Mapbox popups
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .mapboxgl-popup-content {
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Sidebar Panel */}
      <Sidebar
        mapStyles={mapStyles}
        setMapStyle={setMapStyle}
        showLayers={showLayers}
        setShowLayers={setShowLayers}
        zoomToBarangay={zoomToBarangay}
        onBarangaySelect={handleBarangaySelect} // Pass the new handler
      />

      {/* Map Style Switcher Toggle Button */}
      <button
        onClick={() => setIsSwitcherVisible(!isSwitcherVisible)}
        className="absolute top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-10"
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
    </div>
  );
};

export default UserMap;