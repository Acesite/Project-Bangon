"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken = "pk.eyJ1Ijoid29tcHdvbXAtNjkiLCJhIjoiY204emxrOHkwMGJsZjJrcjZtZmN4YXdtNSJ9.LIMPvoBNtGuj4O36r3F72w"

const MapboxComponent = () => {
  // Custom checkbox style
  const checkboxStyle = {
    position: "relative",
    display: "inline-block",
    width: "16px",
    height: "16px",
    marginRight: "8px",
  }

  const hiddenCheckboxStyle = {
    opacity: 0,
    position: "absolute",
    width: "16px",
    height: "16px",
    cursor: "pointer",
    zIndex: 2,
  }

  const customCheckboxStyle = (isChecked) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "16px",
    height: "16px",
    backgroundColor: isChecked ? "#22c55e" : "white",
    border: "1px solid #ccc",
    borderRadius: "3px",
  })

  // Custom select style
  const selectStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px",
  }

  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  // State for filter values
  const [region, setRegion] = useState("Western Visayas")
  const [province, setProvince] = useState("Negros Occidental")
  const [municipality, setMunicipality] = useState("Bago City")
  const [barangay, setBarangay] = useState("Malingin")

  // Updated crops list to match the image
  const [selectedCrops, setSelectedCrops] = useState({
    Abaca: false,
    Bamboo: false,
    Banana: false,
    Cacao: false,
    Cassava: false,
    Coconut: false,
    Coffee: false,
    Corn: false,
    Legumes: false,
    Mango: false,
    "Palm Oil": false,
    Papaya: false,
    Pineapple: false,
    Rice: false,
    Rubber: false,
    Sugarcane: false,
  })

  // Complete list of Bago City barangays
  const barangays = [
    "Alianza",
    "Alingalan",
    "Atipuluan",
    "Bacong-Montilla",
    "Bagroy",
    "Balingasag",
    "Binubuhan",
    "Busay",
    "Calumangan",
    "Caridad",
    "Dulao",
    "Don Jorge L. Araneta",
    "Ilijan",
    "Lag-asan",
    "Ma-ao",
    "Mailum",
    "Malingin",
    "Napoles",
    "Pacol",
    "Poblacion",
    "Sampinit",
    "San Miguel",
    "Tabunan",
    "Taloc",
    "Tampalon",
  ]

  // Handle checkbox changes
  const handleCropChange = (crop) => {
    setSelectedCrops({
      ...selectedCrops,
      [crop]: !selectedCrops[crop],
    })
  }

  useEffect(() => {
    // Initialize the map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/wompwomp-69/cm900xa91008j01t14w8u8i9d",
      // center: [122.977533, 10.501221],
      center: [122.949888, 10.502393],
      zoom: 11,
    })

    // Add navigation control
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

    // Add a marker for Bago City
    mapRef.current.on("load", () => {
      // Add a red marker at Bago City
      new mapboxgl.Marker({
        color: "#ff0000",
      })
        .setLngLat([122.8409, 10.5388]) // Coordinates for Bago City
        .addTo(mapRef.current)
    })

    // Clean up on unmount
    return () => mapRef.current.remove()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    // This is where you would implement filtering logic based on the selected filters
    console.log({
      region,
      province,
      municipality,
      barangay,
      selectedCrops,
    })

    // Future implementation: Update map layers based on selected filters
  }, [region, province, municipality, barangay, selectedCrops])

  return (
    <div className="map-container" style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Map container */}
      <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />

      {/* Sidebar */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "4px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          width: "280px",
          zIndex: 1,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Region:</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
            <option value="Western Visayas">Western Visayas</option>
            <option value="Central Visayas">Central Visayas</option>
            <option value="Eastern Visayas">Eastern Visayas</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Province:</label>
          <select value={province} onChange={(e) => setProvince(e.target.value)} style={selectStyle}>
            <option value="Negros Occidental">Negros Occidental</option>
            <option value="Iloilo">Iloilo</option>
            <option value="Capiz">Capiz</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Municipality:</label>
          <select value={municipality} onChange={(e) => setMunicipality(e.target.value)} style={selectStyle}>
            <option value="Bago City">Bago City</option>
            <option value="Bacolod City">Bacolod City</option>
            <option value="Silay City">Silay City</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Barangay:</label>
          <select value={barangay} onChange={(e) => setBarangay(e.target.value)} style={selectStyle}>
            {barangays.sort().map((brgy) => (
              <option key={brgy} value={brgy}>
                {brgy}
              </option>
            ))}
          </select>
        </div>

        {/* Crop Suitability Section */}
        <div
          style={{
            backgroundColor: "#f9f9f9",
            margin: "0 -15px",
            padding: "15px",
            borderTop: "1px solid #eee",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            <span style={{ marginRight: "5px" }}>☰</span> Crop Suitability:
          </div>

          {/* Crop checkboxes */}
          {Object.keys(selectedCrops).map((crop) => (
            <div key={crop} style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
              <div style={checkboxStyle}>
                <input
                  type="checkbox"
                  id={crop}
                  checked={selectedCrops[crop]}
                  onChange={() => handleCropChange(crop)}
                  style={hiddenCheckboxStyle}
                />
                <div style={customCheckboxStyle(selectedCrops[crop])}></div>
              </div>
              <label htmlFor={crop} style={{ cursor: "pointer" }}>
                {crop}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MapboxComponent

