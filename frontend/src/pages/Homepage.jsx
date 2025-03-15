import React from "react";
import Navbar from "../components/Navbar";
import Features from "../components/Features";
import Reviews from "../components/Reviews";
import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <>
      <Navbar />

      <div className={styles.container}>
        {/* About Section */}
        <section className={styles.about}>
          <h1>Find Medicines Easily with EasyMed</h1>
          <p>
            EasyMed helps you locate the nearest pharmacies that have the
            medicines you need. No more wandering from store to store—just
            search for a medicine, and we’ll show you where to find it.
          </p>
        </section>

        {/* Features Section */}
        <Features />

        {/* Reviews Section */}
        <Reviews />
      </div>
    </>
  );
};

export default HomePage;
