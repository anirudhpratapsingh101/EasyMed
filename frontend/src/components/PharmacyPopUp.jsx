import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./PharmacyPopUp.module.css";

export default function PharmacyPopUp({ pharmacy, onClose }) {
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (!pharmacy._id) return;

      try {
        console.log("Entered Effect");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASEURL}/api/users/${pharmacy._id}`
        );
        setOwnerDetails(response.data.data);
        console.log("Response Data: ", response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching owner details:", err);
        setError("Failed to load owner details");
        setLoading(false);
      }
    };

    fetchOwnerDetails();
  }, [pharmacy._id]);

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <h2 style={{ color: "white" }}>{pharmacy.pharmacyName}</h2>
        <p style={{ color: "white" }}>
          <strong>Distance:</strong> {(pharmacy.distance / 1000).toFixed(2)} km
        </p>

        {loading ? (
          <p>Loading owner details...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <>
            <p style={{ color: "white" }}>
              <strong>Owner:</strong> {ownerDetails.name}
            </p>
            <p style={{ color: "white" }}>
              <strong>Email:</strong> {ownerDetails.email}
            </p>
            <p style={{ color: "white" }}>
              <strong>Phone:</strong> {ownerDetails.phone}
            </p>
            <button
              onClick={() => {
                const lat = pharmacy.location.coordinates[1];
                const lng = pharmacy.location.coordinates[0];
                const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                window.open(url, "_blank");
              }}
              style={{
                marginTop: "5px",
                backgroundColor: "#1ecf47ff",
                color: "white",
                border: "none",
                fontSize: "14px",
                padding: "5px",
                borderRadius: "3px",
              }}
            >
              Directions
            </button>
            {ownerDetails.medicines.length === 0 ? (
              <strong style={{ color: "red" }}>No Medicines Available</strong>
            ) : (
              <>
                <h3 style={{ color: "white", marginBottom: "10px" }}>
                  Available Medicines
                </h3>
                <table
                  style={{
                    color: "white",
                    width: "100%",
                    borderCollapse: "collapse",
                    borderRadius: "8px",
                  }}
                >
                  <thead style={{ borderRadius: "8px" }}>
                    <tr
                      style={{
                        backgroundColor: "#aaadb1ff",
                        color: "white",
                        borderRadius: "8px",
                      }}
                    >
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "left",
                          borderRight: "1px solid #ddd",
                        }}
                      >
                        Medicine Name
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          borderRight: "1px solid #ddd",
                        }}
                      >
                        Quantity
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "right",
                        }}
                      >
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerDetails.medicines.map((med, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid #ddd" }}
                      >
                        <td style={{ padding: "8px" }}>{med.name}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {med.quantity}
                        </td>
                        <td style={{ padding: "8px", textAlign: "right" }}>
                          ₹{med.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
