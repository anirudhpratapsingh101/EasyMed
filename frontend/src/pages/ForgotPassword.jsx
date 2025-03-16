import React, { useState } from "react";
import axios from "axios";
import styles from "./ForgotPassword.module.css"; // Import CSS
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Token, 3: New Password
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Step 1: Request Reset Token
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/users/forgotPassword`,
        { email }
      );
      setMessage(response.data.message);
      setStep(2); // Move to token entry step
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate Token (Just UI Step, No API Needed)
  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (token.trim().length === 0) {
      setError("Please enter a valid token.");
      return;
    }
    setError(null);
    setStep(3); // Move to password reset step
  };

  // Step 3: Reset Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_BASEURL
        }/api/users/resetPassword/${token}`,
        {
          password: newPassword,
          passwordConfirm: confirmPassword,
        }
      );
      setMessage(response.data.status || "Password reset successful!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid token or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.box}>
          {step === 1 && (
            <>
              <h2>Forgot Password</h2>
              {message && <p className={styles.success}>{message}</p>}
              {error && <p className={styles.error}>{error}</p>}
              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Token"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Enter Reset Token</h2>
              {error && <p className={styles.error}>{error}</p>}
              <form onSubmit={handleTokenSubmit}>
                <input
                  type="text"
                  placeholder="Enter token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                <button type="submit">Verify Token</button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2>Reset Password</h2>
              {message && <p className={styles.success}>{message}</p>}
              {error && <p className={styles.error}>{error}</p>}
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
