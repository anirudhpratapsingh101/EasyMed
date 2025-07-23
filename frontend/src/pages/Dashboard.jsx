import React, { useContext, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./Dashboard.module.css";
import Navbar from "../components/Navbar";
import PharmacyPopUp from "../components/PharmacyPopUp"; // Import the pop-up component
import { AuthContext } from "../context/authContext";

const Dashboard = () => {
  const [medicines, setMedicines] = useState("");
  const [maxDistance, setMaxDistance] = useState(5); // Default 5 km
  const [pharmacies, setPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null); // Store selected pharmacy
  const { user, loading } = useContext(AuthContext);
  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
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
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/users/medicines`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token for authorization
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
              <button onClick={getUserLocation}>Use My Location</button>
              <button onClick={handleSearch}>Search</button>
            </section>
            {/* section for map and the list of users fetched */}
            <div className={styles.content}>
              {/* Leaflet Map */}
              <section className={styles.mapContainer}>
                <MapContainer
                  center={
                    userLocation
                      ? [userLocation.latitude, userLocation.longitude]
                      : [20.5937, 78.9629]
                  } // Default India
                  zoom={13}
                  className={styles.map}
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
                  {pharmacies.map((pharmacy, index) => (
                    <Marker
                      key={index}
                      position={[
                        pharmacy.location.coordinates[1],
                        pharmacy.location.coordinates[0],
                      ]}
                      icon={pharmacyIcon}
                    >
                      <Popup>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
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
                            }}
                          >
                            {pharmacy.pharmacyName}
                          </strong>
                          Distance: {(pharmacy.distance / 1000).toFixed(2)} km
                        </div>
                      </Popup>
                    </Marker>
                  ))}
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
