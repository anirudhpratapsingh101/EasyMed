import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const PrivateRoute = () => {
  const { loggedIn, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>; // Prevent redirect before checking auth state

  return loggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
