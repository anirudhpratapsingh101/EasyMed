import { useState } from "react";

const LocationInput = ({ setUserLocation }) => {
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!place) return;

    setLoading(true);

    try {
      // Replace YOUR_API_KEY with your Google Maps Geocoding API key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          place
        )}&key=YOUR_API_KEY`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        setUserLocation({ latitude: lat, longitude: lng });
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching location");
    }

    setLoading(false);
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <input
        type="text"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        placeholder="Enter a place"
        style={{ padding: "8px", width: "250px", marginRight: "10px" }}
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          padding: "8px 15px",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "#007bff",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
        }}
      >
        {loading ? "Searching..." : "Set Location"}
      </button>
    </div>
  );
};

export default LocationInput;
