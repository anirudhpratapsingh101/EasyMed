import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  // Check if the user is already logged in (from localStorage)
  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    const response = await axios.post("http://localhost:8000/api/users/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("token", token); // Store token
    localStorage.setItem("user", JSON.stringify(user)); // Store user
    setUser(user);
    setLoggedIn(true); // Mark user as logged in
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setLoggedIn(false); // Mark user as logged out
  };

  return (
    <AuthContext.Provider
      value={{ user, loggedIn, setLoggedIn, login, logout, loading, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
