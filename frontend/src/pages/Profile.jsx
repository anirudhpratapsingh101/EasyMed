import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import styles from "./Profile.module.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    pharmacyName: user?.pharmacyName || "",
    longitude: user?.location?.coordinates?.[0] || "",
    latitude: user?.location?.coordinates?.[1] || "",
    medicines: user?.medicines || [],
  });

  const [medicineInput, setMedicineInput] = useState({
    name: "",
    expiryDate: "",
    quantity: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMedicine = () => {
    if (!medicineInput.name || !medicineInput.expiryDate) {
      alert("Medicine name and expiry date are required.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, medicineInput],
    }));
    setMedicineInput({ name: "", expiryDate: "", quantity: "", price: "" });
  };

  const handleRemoveMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/users/updateMe`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data.data.user);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Update failed:", error);
      alert(error.response?.data?.message || "Profile update failed.");
    }
  };

  // 📍 Get Current Location & Update Fields
  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
      },
      (error) => {
        alert("Unable to retrieve location. Please enable location services.");
        console.error("❌ Location Error:", error);
      }
    );
  };

  return (
    <>
      <div className={styles.profileContainer}>
        <h2>Profile</h2>

        {/* Display Uneditable Fields */}
        <div className={styles.profileInfo}>
          <label>
            <strong>Name:</strong>
          </label>
          <p>{user?.name || "N/A"}</p>

          <label>
            <strong>Email:</strong>
          </label>
          <p>{user?.email || "N/A"}</p>
        </div>

        {/* Editable Fields */}
        <div className={styles.profileInfo}>
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editMode}
          />

          <label>Pharmacy Name:</label>
          <input
            type="text"
            name="pharmacyName"
            value={formData.pharmacyName}
            onChange={handleChange}
            disabled={!editMode}
          />

          {/* 📍 Location Section */}
          <label>Longitude:</label>
          {editMode ? (
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          ) : (
            <p>{formData.longitude || "Not Provided"}</p>
          )}

          <label>Latitude:</label>
          {editMode ? (
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
          ) : (
            <p>{formData.latitude || "Not Provided"}</p>
          )}

          {editMode && (
            <button onClick={handleSetLocation} className={styles.locationBtn}>
              📍 Set Current Location
            </button>
          )}

          {/* Medicines Section */}
          <h3>Medicines</h3>
          {editMode && (
            <>
              <input
                type="text"
                placeholder="Medicine Name"
                value={medicineInput.name}
                onChange={(e) =>
                  setMedicineInput({ ...medicineInput, name: e.target.value })
                }
              />
              <input
                type="date"
                placeholder="Expiry Date"
                value={medicineInput.expiryDate}
                onChange={(e) =>
                  setMedicineInput({
                    ...medicineInput,
                    expiryDate: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Quantity"
                value={medicineInput.quantity}
                onChange={(e) =>
                  setMedicineInput({
                    ...medicineInput,
                    quantity: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Price"
                value={medicineInput.price}
                onChange={(e) =>
                  setMedicineInput({ ...medicineInput, price: e.target.value })
                }
              />
              <button
                onClick={handleAddMedicine}
                style={{ backgroundColor: "green" }}
              >
                Add Medicine
              </button>
            </>
          )}

          <ul>
            {formData.medicines.map((med, index) => (
              <li key={index}>
                {med.name} - Exp: {med.expiryDate} - Qty: {med.quantity} - ₹
                {med.price}
                {editMode && (
                  <button
                    style={{ backgroundColor: "red" }}
                    onClick={() => handleRemoveMedicine(index)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Edit Mode Toggle */}
          {editMode ? (
            <>
              <button onClick={handleUpdate}>Save</button>
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "2px solid gray",
                  color: "black",
                }}
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)}>Edit</button>
          )}
          <button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              logout(); // Call logout first
              navigate("/"); // Then navigate to home
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
