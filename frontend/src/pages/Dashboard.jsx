import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./Dashboard.module.css";
import Navbar from "../components/Navbar";
import PharmacyPopUp from "../components/PharmacyPopUp"; // Import the pop-up component
import { AuthContext } from "../context/authContext";

const Dashboard = () => {
  const [locationLoading, setLocationLoading] = useState(false);
  const [medicines, setMedicines] = useState("");
  const [maxDistance, setMaxDistance] = useState(5); // Default 5 km
  const [pharmacies, setPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null); // Store selected pharmacy
  const { user, loading } = useContext(AuthContext);

  // Function to generate the Google Maps Directions URL
  const getGoogleMapsUrl = (lat, lng) => {
    // The format uses the destination (daddr) and sets the travelmode to driving
    // Omitting saddr (source address) makes it default to the user's current location.
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    return url;
  };

  // Get user's location
  const getUserLocation = () => {
    if (userLocation) {
      // If location is already set, reset it
      setUserLocation(null);
      console.log("User location reset");
      return;
    }

    setLocationLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log("User location set:", position.coords);

          const mapElement = document.getElementById("map");
          if (mapElement) {
            mapElement.scrollIntoView({ behavior: "smooth" });
          }

          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  };

  // Fetch pharmacies from the backend
  const handleSearch = async () => {
    if (!userLocation) {
      alert("Please enable location access!");
      return;
    }
    const token = localStorage.getItem("token"); // Example of retrieving token
    try {
      console.log(`Bearer ${token}`);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/users/medicines`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            longitude: userLocation.longitude,
            latitude: userLocation.latitude,
            maxDistance,
            medicines,
          },
        }
      );

      setPharmacies(response.data.data);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      alert("Failed to fetch pharmacies!");
    }
  };

  // Custom User Location Icon (Blue Pin)
  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  // Custom Pharmacy Icon (Green Cross)
  const pharmacyIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3179/3179068.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  function Recenter({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.setView([lat, lng], map.getZoom()); // keeps current zoom
      }
    }, [lat, lng]);
    return null;
  }

  return (
    <>
      <div className={styles.dashboard}>
        {/* Welcome Message */}
        <header className={styles.header}>
          <h1>Welcome, {user?.name || "User"}</h1>
          <p>Find the nearest pharmacies that have your required medicines.</p>
        </header>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Search Section */}
            <section className={styles.searchSection}>
              {/* Medicine Names Label */}
              <label
                style={{
                  alignSelf: "",
                  marginBottom: "8px",
                  fontWeight: 500,
                  color: "white",
                }}
              >
                Medicine Names
              </label>
              <input
                type="text"
                placeholder="Enter medicine names (comma-separated)"
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
              />
              {/* Distance Label */}
              <label
                style={{
                  alignSelf: "",
                  marginBottom: "8px",
                  marginTop: "12px",
                  fontWeight: 500,
                  color: "white",
                }}
              >
                Maximum Distance (km)
              </label>
              <input
                type="number"
                placeholder="Distance (km)"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
              />
              <button
                disabled={locationLoading}
                onClick={getUserLocation}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: locationLoading ? "not-allowed" : "pointer",
                  backgroundColor: userLocation ? "#28a745" : "#6c757d", // green if set, gray if not
                  transition: "all 0.3s, transform 0.2s", // keep transition
                }}
              >
                {locationLoading
                  ? "Getting Location..."
                  : userLocation
                  ? "Location Set ✅"
                  : "Use My Location"}
              </button>

              <button disabled={locationLoading} onClick={handleSearch}>
                {locationLoading ? "Loading..." : "Search"}
              </button>
            </section>
            {/* section for map and the list of users fetched */}
            <div className={styles.content}>
              {/* Leaflet Map */}
              <section className={styles.mapContainer} id="map" name="map">
                <MapContainer
                  center={[21.2514, 81.6296]} // Default India
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {/* User's Location Marker */}
                  {userLocation && (
                    <Marker
                      position={[userLocation.latitude, userLocation.longitude]}
                      icon={userIcon}
                    >
                      <Popup>You are here</Popup>
                    </Marker>
                  )}

                  {/* Pharmacy Markers */}
                  {pharmacies.map((pharmacy, index) => {
                    const lat = pharmacy.location.coordinates[1];
                    const lng = pharmacy.location.coordinates[0];
                    const mapsUrl = getGoogleMapsUrl(lat, lng);

                    return (
                      <Marker
                        key={index}
                        position={[lat, lng]}
                        icon={pharmacyIcon}
                      >
                        <Popup>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                              alignItems: "center", // Center items in popup for better look
                            }}
                          >
                            <strong
                              onClick={() => {
                                setSelectedPharmacy(pharmacy);
                              }}
                              style={{
                                cursor: "pointer",
                                backgroundColor: "cadetblue",
                                color: "white",
                                padding: "5px",
                                borderRadius: "3px",
                                textAlign: "center",
                                width: "100%", // Full width for better click target
                                marginBottom: "5px",
                              }}
                            >
                              {pharmacy.pharmacyName}
                            </strong>
                            Distance: {(pharmacy.distance / 1000).toFixed(2)} km
                            {/* **END ADDED** */}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {userLocation && (
                    <Recenter
                      lat={userLocation.latitude}
                      lng={userLocation.longitude}
                    />
                  )}
                </MapContainer>
              </section>

              {/* Pharmacy List */}
              <section className={styles.listContainer}>
                <h2>Nearby Pharmacies</h2>
                <ul className={styles.pharmacyList}>
                  {pharmacies.filter(
                    (pharmacy) =>
                      pharmacy.pharmacyName &&
                      pharmacy.pharmacyName.length > 0 &&
                      pharmacy.pharmacyName !== user.pharmacyName
                  ).length === 0 ? (
                    <p>No pharmacies found.</p>
                  ) : (
                    pharmacies
                      .filter(
                        (pharmacy) =>
                          pharmacy.pharmacyName &&
                          pharmacy.pharmacyName.length > 0 &&
                          pharmacy.pharmacyName !== user.pharmacyName
                      )
                      .map((pharmacy, index) => (
                        <li
                          key={index}
                          className={styles.pharmacyCard}
                          onClick={() => setSelectedPharmacy(pharmacy)}
                        >
                          <h3>{pharmacy.pharmacyName}</h3>
                          <p>
                            📍 {pharmacy.location.address}
                            <br />
                            📏 Distance: {(pharmacy.distance / 1000).toFixed(
                              2
                            )}{" "}
                            km
                          </p>
                          <button
                            onClick={(e) => {
                              // Stop event propagation to prevent triggering setSelectedPharmacy(pharmacy) on the li
                              e.stopPropagation();
                              const lat = pharmacy.location.coordinates[1];
                              const lng = pharmacy.location.coordinates[0];
                              const url = getGoogleMapsUrl(lat, lng); // Use the new function
                              window.open(url, "_blank");
                            }}
                            style={{
                              marginTop: "5px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              fontSize: "14px",
                              borderRadius: "3px",
                              width: "fit-content",
                              padding: "8px 12px",
                              overflowY: "auto",
                            }}
                          >
                            Directions
                          </button>
                        </li>
                      ))
                  )}
                </ul>
              </section>
            </div>
          </>
        )}
      </div>

      {/* Show Pharmacy Popup */}
      {selectedPharmacy && (
        <PharmacyPopUp
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}
    </>
  );
};

export default Dashboard;
