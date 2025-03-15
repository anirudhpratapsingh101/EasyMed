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
          `http://localhost:8000/api/users/${pharmacy._id}`
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

        <h2>{pharmacy.pharmacyName}</h2>
        <p>
          <strong>Distance:</strong> {(pharmacy.distance / 1000).toFixed(2)} km
        </p>

        {loading ? (
          <p>Loading owner details...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <>
            <p>
              <strong>Owner:</strong> {ownerDetails.name}
            </p>
            <p>
              <strong>Email:</strong> {ownerDetails.email}
            </p>
            <p>
              <strong>Phone:</strong> {ownerDetails.phone}
            </p>
            {ownerDetails.medicines.length === 0 ? (
              <strong style={{ color: "red" }}>No Medicines Available</strong>
            ) : (
              <>
                <h3>Available Medicines:</h3>
                <ul>
                  {ownerDetails.medicines.map((med, index) => (
                    <li key={index}>
                      {med.name}, {med.quantity}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
