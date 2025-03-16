import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import styles from "./Signup.module.css";
import Navbar from "../components/Navbar";
const SignupPage = () => {
  const navigate = useNavigate();
  const { setUser, setLoggedIn } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    longitude: "",
    latitude: "",
    pharmacyName: "", // Optional
    medicines: [], // Optional array of objects
  });

  const [medicineInput, setMedicineInput] = useState({
    name: "",
    expiryDate: "",
    quantity: "",
    price: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Medicine Addition
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

  // Get User Location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Failed to get location!");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Handle Signup Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/users/signup`,
        {
          ...formData,
          pharmacyName: formData.pharmacyName || null,
          medicines: formData.medicines.length > 0 ? formData.medicines : [],
        }
      );

      console.log("Signup Response:", response); // Debugging

      if (response.status === 201) {
        const { user } = response.data.data;
        const { token } = response.data; // ✅ Corrected token extraction

        localStorage.setItem("token", token);

        setUser(user);
        setLoggedIn(true);

        alert("Signup successful!");
        navigate("/dashboard");
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.signupContainer}>
        {" "}
        {/* ✅ Corrected class usage */}
        <h2>Sign Up</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="passwordConfirm"
            placeholder="Confirm Password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="pharmacyName"
            placeholder="Pharmacy Name (Optional)"
            value={formData.pharmacyName}
            onChange={handleChange}
          />

          <button type="button" onClick={getUserLocation}>
            Use My Location
          </button>

          {/* ✅ Show Latitude & Longitude */}
          <input
            type="text"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            readOnly
          />
          <input
            type="text"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            readOnly
          />

          {/* Medicine Input Section */}
          <h3>Add Medicines (Optional)</h3>
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
              setMedicineInput({ ...medicineInput, expiryDate: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Quantity"
            value={medicineInput.quantity}
            onChange={(e) =>
              setMedicineInput({ ...medicineInput, quantity: e.target.value })
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
          <button type="button" onClick={handleAddMedicine}>
            Add Medicine
          </button>

          {/* Display Added Medicines */}
          <ul>
            {formData.medicines.map((med, index) => (
              <li key={index}>
                {med.name} - Exp: {med.expiryDate} - Qty: {med.quantity} - ₹
                {med.price}
              </li>
            ))}
          </ul>

          <button type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </>
  );
};

export default SignupPage;
