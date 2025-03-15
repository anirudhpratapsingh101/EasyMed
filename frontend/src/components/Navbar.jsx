import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { AuthContext } from "../context/AuthContext";
const Navbar = () => {
  const { loggedIn } = useContext(AuthContext);

  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={styles.logo}>
        <div className={styles.logo}>EasyMed</div>
      </NavLink>
      <ul className={styles.navLinks}>
        {loggedIn ? (
          <>
            <li>
              <NavLink to="/dashboard" className={styles.navItem}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={styles.navItem}>
                Profile
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <button>
                <NavLink to="/login" className={styles.button}>
                  Login
                </NavLink>
              </button>
            </li>
            <li>
              <button>
                <NavLink to="/signup" className={styles.button}>
                  Signup
                </NavLink>
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
